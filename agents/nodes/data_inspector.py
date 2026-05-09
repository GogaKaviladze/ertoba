"""DataInspector agent node.

Responsibilities
----------------
* Receive the list of article chunks (never the raw full-JSON corpus).
* Compute statistical summaries (source distribution, date range, anomalies).
* Set ``dataContext`` in the shared ``AgentState``.
* Produce an initial ``confidence`` estimate based on data quality.

The LLM is used only for anomaly *interpretation* on a compact summary string,
not for processing raw article text.
"""

from __future__ import annotations

import json
import logging

from langchain_core.messages import HumanMessage
from langchain_core.language_models import BaseChatModel

from agents.state import AgentState, DataContext
from agents.utils.chunker import ArticleChunk, summarise_chunks

logger = logging.getLogger(__name__)

# Confidence penalty per detected anomaly
_ANOMALY_PENALTY = 0.05
_BASE_CONFIDENCE = 0.85


def build_node(llm: BaseChatModel):
    """Return a LangGraph-compatible node function bound to *llm*."""

    def data_inspector(state: AgentState) -> dict:
        """Inspect chunks, derive data context, set initial confidence."""
        logger.info("[DataInspector] Starting inspection …")

        chunks: list[ArticleChunk] = state.get("intermediateResults", {}).get("chunks", [])
        if not chunks:
            return {
                "errors": ["DataInspector: no chunks found in intermediateResults"],
                "confidence": 0.0,
                "messages": ["[DataInspector] ERROR: no chunks to inspect."],
            }

        stats = summarise_chunks(chunks)

        # Build a compact summary for the LLM (not raw text)
        summary_text = (
            f"Dataset summary:\n"
            f"- Total articles: {stats['total_articles']}\n"
            f"- Chunks analysed: {stats['chunks_analysed']}\n"
            f"- Date range: {stats['date_range']['from']} → {stats['date_range']['to']}\n"
            f"- Sources: {json.dumps(stats['source_distribution'], ensure_ascii=False)}\n"
            f"- Articles with low LLM confidence (<6): {stats['low_confidence_articles']}\n"
        )

        prompt = (
            "You are the DataInspector agent for the Ertoba Analytics system.\n"
            "Review the following compact dataset summary and identify any data-quality "
            "anomalies (e.g. missing date ranges, skewed source distribution, unusually "
            "high share of low-confidence articles).\n"
            "Reply with a JSON object: "
            '{"anomalies": ["<observation>", ...], "data_quality_note": "<one sentence>"}\n\n'
            + summary_text
        )

        try:
            response = llm.invoke([HumanMessage(content=prompt)])
            raw = response.content if hasattr(response, "content") else str(response)
            parsed = _safe_parse(raw)
        except Exception as exc:
            logger.warning("[DataInspector] LLM call failed: %s", exc)
            parsed = {"anomalies": [], "data_quality_note": "LLM unavailable."}

        anomalies: list[str] = parsed.get("anomalies", [])
        quality_note: str = parsed.get("data_quality_note", "")

        confidence = max(0.0, _BASE_CONFIDENCE - len(anomalies) * _ANOMALY_PENALTY)

        data_context: DataContext = {
            "source_distribution": stats["source_distribution"],
            "date_range": stats["date_range"],
            "total_articles": stats["total_articles"],
            "anomalies": anomalies,
            "chunks_analysed": stats["chunks_analysed"],
        }

        log_msg = (
            f"[DataInspector] Done. {stats['total_articles']} articles across "
            f"{stats['chunks_analysed']} chunks. "
            f"{len(anomalies)} anomalies. confidence={confidence:.2f}. "
            f"Quality: {quality_note}"
        )
        logger.info(log_msg)

        return {
            "dataContext": data_context,
            "confidence": confidence,
            "intermediateResults": {
                **state.get("intermediateResults", {}),
                "data_inspector": {
                    "stats": stats,
                    "anomalies": anomalies,
                    "data_quality_note": quality_note,
                    "confidence": confidence,
                },
            },
            "messages": [log_msg],
        }

    return data_inspector


# --------------------------------------------------------------------------- #
# Helpers                                                                      #
# --------------------------------------------------------------------------- #

def _safe_parse(text: str) -> dict:
    """Try to extract a JSON object from an LLM response string."""
    import re

    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass
    return {}
