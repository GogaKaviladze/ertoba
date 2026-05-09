"""PatternDetector agent node.

Responsibilities
----------------
* Analyse article chunks for propaganda patterns and narrative signals.
* Build hypotheses with evidence from actual article metadata (tags, frames,
  persuasion styles) — never by dumping raw body text into a prompt.
* Populate ``reasoning`` in the shared ``AgentState``.
* Update ``confidence`` based on pattern consistency.

The LLM receives only *aggregate statistics* about propaganda tags, frames, and
persuasion styles per chunk — not the raw article content.
"""

from __future__ import annotations

import json
import logging
from collections import Counter

from langchain_core.messages import HumanMessage
from langchain_core.language_models import BaseChatModel

from agents.state import AgentState, Hypothesis, Reasoning
from agents.utils.chunker import ArticleChunk

logger = logging.getLogger(__name__)

_BASE_CONFIDENCE_BONUS = 0.05
_PATTERN_CERTAINTY_THRESHOLD = 0.30  # dominant pattern must cover ≥30% to boost confidence


def build_node(llm: BaseChatModel):
    """Return a LangGraph-compatible node function bound to *llm*."""

    def pattern_detector(state: AgentState) -> dict:
        """Detect propaganda patterns from chunk-level aggregate statistics."""
        logger.info("[PatternDetector] Starting pattern detection …")

        chunks: list[ArticleChunk] = state.get("intermediateResults", {}).get("chunks", [])
        if not chunks:
            return {
                "errors": ["PatternDetector: no chunks in intermediateResults"],
                "messages": ["[PatternDetector] ERROR: no chunks."],
            }

        # Build aggregate stats — NOT raw text
        tag_counter: Counter = Counter()
        frame_counter: Counter = Counter()
        persuasion_counter: Counter = Counter()
        total = 0

        for chunk in chunks:
            for art in chunk["articles"]:
                total += 1
                tag = art.get("propaganda_tag")
                if tag:
                    tag_counter[tag] += 1
                frame = art.get("frame")
                if frame:
                    frame_counter[frame] += 1
                ps = art.get("persuasion_style")
                if ps:
                    persuasion_counter[ps] += 1

        top_tags = tag_counter.most_common(5)
        top_frames = frame_counter.most_common(5)
        top_persuasion = persuasion_counter.most_common(3)

        aggregate_summary = (
            f"Corpus size: {total} articles\n"
            f"Top propaganda tags: {json.dumps(dict(top_tags), ensure_ascii=False)}\n"
            f"Top frames: {json.dumps(dict(top_frames), ensure_ascii=False)}\n"
            f"Top persuasion styles: {json.dumps(dict(top_persuasion), ensure_ascii=False)}\n"
        )

        prompt = (
            "You are the PatternDetector agent for the Ertoba Analytics system, "
            "specialised in Georgian political media analysis.\n"
            "Based on the following aggregate statistics (NOT raw article text), "
            "identify the dominant propaganda patterns, formulate hypotheses, and "
            "summarise the narrative landscape.\n"
            "Reply with a JSON object:\n"
            '{"hypotheses": [{"id":"h1","claim":"...","evidence":["..."],"confidence":0.8}], '
            '"detected_patterns": ["..."], '
            '"dominant_framing": "...", '
            '"narrative_summary": "..."}\n\n'
            + aggregate_summary
        )

        try:
            response = llm.invoke([HumanMessage(content=prompt)])
            raw = response.content if hasattr(response, "content") else str(response)
            parsed = _safe_parse(raw)
        except Exception as exc:
            logger.warning("[PatternDetector] LLM call failed: %s", exc)
            parsed = {}

        # Build reasoning from LLM output + local fallback
        hypotheses: list[Hypothesis] = parsed.get("hypotheses", [])
        detected_patterns: list[str] = parsed.get("detected_patterns", [])
        dominant_framing: str = parsed.get(
            "dominant_framing",
            top_frames[0][0] if top_frames else "Unknown",
        )
        narrative_summary: str = parsed.get("narrative_summary", "")

        # Local fallback hypotheses from stats (deterministic, no LLM needed)
        if not hypotheses and top_tags:
            for tag, count in top_tags[:3]:
                pct = round(count / total * 100, 1) if total else 0
                hypotheses.append(
                    Hypothesis(
                        id=f"h_{tag.lower().replace(' ', '_')}",
                        claim=f"'{tag}' is a dominant tactic, appearing in {pct}% of articles.",
                        evidence=[
                            f"{count} articles tagged '{tag}'",
                            f"Source: corpus aggregate across {len(chunks)} chunks",
                        ],
                        confidence=min(0.95, pct / 100 * 3),
                    )
                )
        if not detected_patterns and top_tags:
            detected_patterns = [t for t, _ in top_tags[:5]]

        # Confidence update: boost if a dominant pattern is clearly identified
        current_confidence = state.get("confidence", 0.75)
        if top_tags and top_tags[0][1] / max(total, 1) >= _PATTERN_CERTAINTY_THRESHOLD:
            new_confidence = min(1.0, current_confidence + _BASE_CONFIDENCE_BONUS)
        else:
            new_confidence = current_confidence

        reasoning: Reasoning = {
            "hypotheses": hypotheses,
            "detected_patterns": detected_patterns,
            "dominant_framing": dominant_framing,
            "narrative_summary": narrative_summary,
        }

        log_msg = (
            f"[PatternDetector] Done. {len(hypotheses)} hypotheses, "
            f"{len(detected_patterns)} patterns. dominant='{dominant_framing}'. "
            f"confidence={new_confidence:.2f}"
        )
        logger.info(log_msg)

        return {
            "reasoning": reasoning,
            "confidence": new_confidence,
            "intermediateResults": {
                **state.get("intermediateResults", {}),
                "pattern_detector": {
                    "top_tags": dict(top_tags),
                    "top_frames": dict(top_frames),
                    "top_persuasion": dict(top_persuasion),
                    "hypotheses_count": len(hypotheses),
                    "dominant_framing": dominant_framing,
                    "confidence": new_confidence,
                },
            },
            "messages": [log_msg],
        }

    return pattern_detector


# --------------------------------------------------------------------------- #
# Helpers                                                                      #
# --------------------------------------------------------------------------- #

def _safe_parse(text: str) -> dict:
    import re

    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass
    return {}
