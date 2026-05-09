"""Article chunker — ensures no full Propaganda.json is ever passed to an LLM.

Propaganda.json is a ~312 MB NDJSON file with 47 000+ articles.  Passing even
a few hundred articles verbatim into an LLM prompt would exceed context limits
and leak raw data.  Instead this module provides helpers that:

1. Stream articles from the file one at a time.
2. Assemble them into small ``ArticleChunk`` dicts whose ``articles`` list
   contains only the fields that agents actually need.
3. Yield chunks so that callers can process them lazily without holding the
   entire dataset in memory.

Usage
-----
    from agents.utils.chunker import stream_chunks, make_synthetic_chunks

    # Real data
    for chunk in stream_chunks("Propaganda.json", chunk_size=50):
        ...

    # Synthetic data (development / CI)
    chunks = make_synthetic_chunks(n_articles=200, chunk_size=50)
"""

from __future__ import annotations

import json
import random
import re
from collections import defaultdict
from typing import Generator

from agents.state import ArticleChunk

# Fields forwarded to agents — deliberately narrow to avoid prompt bloat.
ARTICLE_FIELDS = (
    "headline",
    "source",
    "publish_date",
    "sentiment",
    "propaganda_tag",
    "persuasion_style",
    "moral_foundation",
    "llm_confidence",
    "frame",
)

# --------------------------------------------------------------------------- #
# Real-data streaming                                                          #
# --------------------------------------------------------------------------- #

def stream_chunks(
    filepath: str,
    chunk_size: int = 50,
    max_chunks: int | None = None,
) -> Generator[ArticleChunk, None, None]:
    """Yield ``ArticleChunk`` dicts by streaming *filepath* line-by-line.

    Parameters
    ----------
    filepath:
        Path to the NDJSON file (one JSON object per line).
    chunk_size:
        Maximum number of articles per chunk.
    max_chunks:
        Cap on the number of chunks yielded.  ``None`` means no cap.
    """
    buffer: list[dict] = []
    chunk_idx = 0
    chunks_yielded = 0

    with open(filepath, "r", encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            try:
                obj = json.loads(line)
            except json.JSONDecodeError:
                continue

            slim = {field: obj.get(field) for field in ARTICLE_FIELDS}
            buffer.append(slim)

            if len(buffer) >= chunk_size:
                yield _make_chunk(chunk_idx, buffer)
                chunks_yielded += 1
                if max_chunks is not None and chunks_yielded >= max_chunks:
                    return
                buffer = []
                chunk_idx += 1

    # Yield any remaining articles
    if buffer:
        yield _make_chunk(chunk_idx, buffer)


# --------------------------------------------------------------------------- #
# Synthetic data (development / CI without the raw dataset)                   #
# --------------------------------------------------------------------------- #

_SAMPLE_SOURCES = ["imedi", "gpb", "rustavi", "mtavari", "ipn", "tabula", "other"]
_SAMPLE_SENTIMENTS = ["Negative", "Neutral", "Positive"]
_SAMPLE_TAGS = [
    "Demonizing",
    "Appeal to Fear",
    "Card Stacking",
    "Loaded Language",
    "Name Calling",
    "Whataboutism",
    None,
]
_SAMPLE_PERSUASION = ["Fear", "Moral", "Authority", "Pride", "Economic", None]
_SAMPLE_FRAMES = [
    "ინსტიტუციური შეზღუდვა",
    "ფსიქოლოგიური ზეწოლა",
    "სოციალური გაყოფა",
    "გეოპოლიტიკური გავლენა",
    "ნეიტრალური",
]
_SAMPLE_HEADLINES = [
    "სასამართლო სისტემა კრიზისში",
    "ოპოზიცია კრიტიკას გამოთქვამს",
    "ეკლესია და სახელმწიფო: ახალი დაძაბულობა",
    "რუსეთის გავლენა მედიაში",
    "ეროვნული უსაფრთხოება პრიორიტეტია",
    "ლგბტ კანონმდებლობა კამათის საგანი",
    "ევროკავშირი და საქართველო: ახალი ეტაპი",
    "ეკონომიკური გამოწვევები გრძელდება",
    "ოკუპაცია: 17 წლის შემდეგ",
    "ახალი საარჩევნო კანონი კრიტიკის ქვეშ",
]

_DATE_START_EPOCH = 1_747_180_800  # 2025-05-14
_SECONDS_IN_89_DAYS = 89 * 86_400


def make_synthetic_chunks(
    n_articles: int = 200,
    chunk_size: int = 50,
    seed: int = 42,
) -> list[ArticleChunk]:
    """Return a deterministic list of synthetic ``ArticleChunk`` dicts.

    Useful during development and CI where Propaganda.json is unavailable.
    """
    rng = random.Random(seed)
    articles: list[dict] = []

    for _ in range(n_articles):
        epoch = _DATE_START_EPOCH + rng.randint(0, _SECONDS_IN_89_DAYS)
        from datetime import datetime, timezone
        dt = datetime.fromtimestamp(epoch, tz=timezone.utc)
        articles.append({
            "headline": rng.choice(_SAMPLE_HEADLINES),
            "source": rng.choice(_SAMPLE_SOURCES),
            "publish_date": dt.strftime("%Y-%m-%d %H:%M:%S UTC"),
            "sentiment": rng.choice(_SAMPLE_SENTIMENTS),
            "propaganda_tag": rng.choice(_SAMPLE_TAGS),
            "persuasion_style": rng.choice(_SAMPLE_PERSUASION),
            "moral_foundation": None,
            "llm_confidence": rng.randint(4, 10),
            "frame": rng.choice(_SAMPLE_FRAMES),
        })

    chunks: list[ArticleChunk] = []
    for i in range(0, len(articles), chunk_size):
        chunk_articles = articles[i : i + chunk_size]
        chunks.append(_make_chunk(i // chunk_size, chunk_articles))
    return chunks


# --------------------------------------------------------------------------- #
# Helpers                                                                      #
# --------------------------------------------------------------------------- #

def _make_chunk(idx: int, articles: list[dict]) -> ArticleChunk:
    return ArticleChunk(
        chunk_id=f"chunk_{idx:04d}",
        articles=articles,
        total_in_chunk=len(articles),
    )


def summarise_chunks(chunks: list[ArticleChunk]) -> dict:
    """Return lightweight statistics for ``DataContext`` population.

    This avoids sending raw article text to the LLM; only aggregate numbers
    and distributions are exposed.
    """
    source_counts: dict[str, int] = defaultdict(int)
    dates: list[str] = []
    total = 0
    low_confidence: int = 0

    _DATE_RE = re.compile(r"(\d{4}-\d{2}-\d{2})")

    for chunk in chunks:
        for art in chunk["articles"]:
            total += 1
            src = str(art.get("source") or "other").lower()
            source_counts[src] += 1

            raw_date = str(art.get("publish_date") or "")
            m = _DATE_RE.search(raw_date)
            if m:
                dates.append(m.group(1))

            conf = art.get("llm_confidence")
            if isinstance(conf, (int, float)) and conf < 6:
                low_confidence += 1

    date_range = {
        "from": min(dates) if dates else "",
        "to": max(dates) if dates else "",
    }

    return {
        "source_distribution": dict(source_counts),
        "date_range": date_range,
        "total_articles": total,
        "low_confidence_articles": low_confidence,
        "chunks_analysed": len(chunks),
    }
