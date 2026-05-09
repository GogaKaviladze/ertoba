"""ReportWriter agent node.

Responsibilities
----------------
* Synthesise the outputs of DataInspector, PatternDetector, and (optionally)
  VerificationAgent into a single, structured, dashboard-ready report.
* Populate ``intermediateResults["report"]`` with the final report dict.
* The report is designed to be consumed directly by the Next.js dashboard
  via ``ertoba-analytics-dashboard/src/data/agent_report.json``.
"""

from __future__ import annotations

import json
import logging
from datetime import datetime, timezone

from langchain_core.messages import HumanMessage
from langchain_core.language_models import BaseChatModel

from agents.state import AgentState

logger = logging.getLogger(__name__)


def build_node(llm: BaseChatModel):
    """Return a LangGraph-compatible node function bound to *llm*."""

    def report_writer(state: AgentState) -> dict:
        """Synthesise a structured, auditable report from all agent results."""
        logger.info("[ReportWriter] Composing final report …")

        data_ctx = state.get("dataContext", {})
        reasoning = state.get("reasoning", {})
        intermediate = state.get("intermediateResults", {})
        confidence = state.get("confidence", 0.0)

        # Build a concise summary for the LLM (structured fields, no raw text)
        synthesis_input = {
            "total_articles": data_ctx.get("total_articles", 0),
            "date_range": data_ctx.get("date_range", {}),
            "source_distribution": data_ctx.get("source_distribution", {}),
            "anomalies": data_ctx.get("anomalies", []),
            "dominant_framing": reasoning.get("dominant_framing", ""),
            "detected_patterns": reasoning.get("detected_patterns", []),
            "hypotheses": reasoning.get("hypotheses", []),
            "narrative_summary": reasoning.get("narrative_summary", ""),
            "final_confidence": confidence,
            "verification_run": "verification_agent" in intermediate,
        }

        prompt = (
            "You are the ReportWriter agent for Ertoba Analytics.\n"
            "Produce a concise, structured final report for a political media "
            "analysis dashboard based on the following synthesised findings.\n"
            "Reply with a JSON object:\n"
            '{"executive_summary": "...", '
            '"key_findings": ["...", "..."], '
            '"risk_level": "LOW|MEDIUM|HIGH|CRITICAL", '
            '"recommended_actions": ["..."]}\n\n'
            f"{json.dumps(synthesis_input, ensure_ascii=False, default=str)}"
        )

        try:
            response = llm.invoke([HumanMessage(content=prompt)])
            raw = response.content if hasattr(response, "content") else str(response)
            llm_report = _safe_parse(raw)
        except Exception as exc:
            logger.warning("[ReportWriter] LLM call failed: %s", exc)
            llm_report = {}

        # Deterministic fallback values
        executive_summary = llm_report.get(
            "executive_summary",
            (
                f"Analysis of {data_ctx.get('total_articles', 0)} articles "
                f"({data_ctx.get('date_range', {}).get('from', '?')} — "
                f"{data_ctx.get('date_range', {}).get('to', '?')}). "
                f"Dominant framing: {reasoning.get('dominant_framing', 'Unknown')}. "
                f"Final confidence: {confidence:.0%}."
            ),
        )
        key_findings = llm_report.get(
            "key_findings",
            reasoning.get("detected_patterns", [])[:5],
        )
        risk_level = llm_report.get("risk_level", _derive_risk_level(confidence))
        recommended_actions = llm_report.get("recommended_actions", [])

        report: dict = {
            "schema_version": "1.0",
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "confidence": confidence,
            "risk_level": risk_level,
            "executive_summary": executive_summary,
            "key_findings": key_findings,
            "recommended_actions": recommended_actions,
            "data_context": {
                "total_articles": data_ctx.get("total_articles", 0),
                "date_range": data_ctx.get("date_range", {}),
                "source_distribution": data_ctx.get("source_distribution", {}),
                "anomalies": data_ctx.get("anomalies", []),
                "chunks_analysed": data_ctx.get("chunks_analysed", 0),
            },
            "reasoning": {
                "dominant_framing": reasoning.get("dominant_framing", ""),
                "detected_patterns": reasoning.get("detected_patterns", []),
                "hypotheses": reasoning.get("hypotheses", []),
                "narrative_summary": reasoning.get("narrative_summary", ""),
            },
            "agent_trace": {
                "data_inspector": intermediate.get("data_inspector", {}),
                "pattern_detector": intermediate.get("pattern_detector", {}),
                "verification_agent": intermediate.get("verification_agent", None),
            },
        }

        log_msg = (
            f"[ReportWriter] Report complete. risk={risk_level}, "
            f"confidence={confidence:.2f}, findings={len(key_findings)}."
        )
        logger.info(log_msg)

        return {
            "intermediateResults": {
                **intermediate,
                "report": report,
            },
            "messages": [log_msg],
        }

    return report_writer


# --------------------------------------------------------------------------- #
# Helpers                                                                      #
# --------------------------------------------------------------------------- #

def _derive_risk_level(confidence: float) -> str:
    """Derive a propaganda-risk level from agent confidence.

    Confidence here reflects how certain the agents are that significant
    propaganda patterns are present in the dataset (not the general quality
    of the analysis).  Therefore higher confidence maps to a higher assessed
    risk level:

    * ≥ 0.85  → HIGH   — agents strongly identify propaganda patterns
    * ≥ 0.70  → MEDIUM — moderate evidence of propaganda activity
    * ≥ 0.50  → LOW    — weak or inconclusive signals
    * < 0.50  → CRITICAL — confidence too low; human review required

    Note: in a real run the LLM ReportWriter assigns a contextual risk level
    based on its full analysis; this function is only the deterministic
    fallback used when the LLM call fails or returns unparseable output.
    """
    if confidence >= 0.85:
        return "HIGH"
    if confidence >= 0.70:
        return "MEDIUM"
    if confidence >= 0.50:
        return "LOW"
    return "CRITICAL"


def _safe_parse(text: str) -> dict:
    import re

    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass
    return {}
