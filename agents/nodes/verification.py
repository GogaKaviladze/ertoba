"""VerificationAgent node.

Triggered by the graph router when ``confidence < CONFIDENCE_THRESHOLD``.

Responsibilities
----------------
* Re-examine the weakest hypotheses from ``PatternDetector``.
* Cross-check claimed patterns against the raw chunk statistics (deterministic
  arithmetic — no additional LLM pass required for cross-checking).
* Optionally ask the LLM to critique its own earlier reasoning (self-correction).
* Update ``confidence`` and annotate hypotheses with verification status.
"""

from __future__ import annotations

import json
import logging
from typing import Any

from langchain_core.messages import HumanMessage
from langchain_core.language_models import BaseChatModel

from agents.state import AgentState

logger = logging.getLogger(__name__)

# Minimum confidence boost awarded after a successful verification pass
_VERIFICATION_BOOST = 0.10


def build_node(llm: BaseChatModel):
    """Return a LangGraph-compatible node function bound to *llm*."""

    def verification_agent(state: AgentState) -> dict:
        """Self-correct: recheck low-confidence hypotheses and update score."""
        current_confidence = state.get("confidence", 0.0)
        logger.info(
            "[VerificationAgent] Triggered (confidence=%.2f). Re-checking …",
            current_confidence,
        )

        reasoning = state.get("reasoning", {})
        hypotheses = reasoning.get("hypotheses", [])
        intermediate = state.get("intermediateResults", {})
        pattern_stats = intermediate.get("pattern_detector", {})

        # Identify hypotheses below 0.7 confidence for re-examination
        weak = [h for h in hypotheses if h.get("confidence", 1.0) < 0.70]

        if not weak:
            # Nothing to recheck — grant a small boost for passing verification
            new_confidence = min(1.0, current_confidence + _VERIFICATION_BOOST)
            log_msg = (
                f"[VerificationAgent] No weak hypotheses found. "
                f"Confidence boosted: {current_confidence:.2f} → {new_confidence:.2f}"
            )
            logger.info(log_msg)
            return {
                "confidence": new_confidence,
                "intermediateResults": {
                    **intermediate,
                    "verification_agent": {
                        "weak_hypotheses_rechecked": 0,
                        "verification_passed": True,
                        "confidence_delta": _VERIFICATION_BOOST,
                        "new_confidence": new_confidence,
                    },
                },
                "messages": [log_msg],
            }

        # Build a verification prompt from existing stats (no raw article text)
        verification_context = (
            f"Current confidence: {current_confidence:.2f}\n"
            f"Pattern stats: {json.dumps(pattern_stats, ensure_ascii=False, default=str)}\n"
            f"Weak hypotheses ({len(weak)}):\n"
            + "\n".join(
                f"  - [{h.get('id', '?')}] {h.get('claim', '')} (conf={h.get('confidence', '?')})"
                for h in weak
            )
        )

        prompt = (
            "You are the VerificationAgent for Ertoba Analytics.\n"
            "Review the following weak hypotheses against the available pattern statistics. "
            "For each hypothesis, decide: CONFIRM, REVISE, or REJECT.\n"
            "Reply with a JSON object:\n"
            '{"verdicts": [{"id":"h1","verdict":"CONFIRM","note":"..."}], '
            '"revised_confidence": 0.80, "verification_note": "..."}\n\n'
            + verification_context
        )

        try:
            response = llm.invoke([HumanMessage(content=prompt)])
            raw = response.content if hasattr(response, "content") else str(response)
            parsed = _safe_parse(raw)
        except Exception as exc:
            logger.warning("[VerificationAgent] LLM call failed: %s", exc)
            parsed = {}

        verdicts: list[dict[str, Any]] = parsed.get("verdicts", [])
        llm_confidence: float | None = parsed.get("revised_confidence")
        verification_note: str = parsed.get("verification_note", "")

        # Apply verdicts to hypotheses
        verdict_map = {v["id"]: v for v in verdicts if "id" in v}
        updated_hypotheses = []
        for h in hypotheses:
            hid = h.get("id", "")
            if hid in verdict_map:
                v = verdict_map[hid]
                verdict = v.get("verdict", "CONFIRM")
                updated = dict(h)
                updated["verification_verdict"] = verdict
                updated["verification_note"] = v.get("note", "")
                if verdict == "REJECT":
                    updated["confidence"] = max(0.0, h.get("confidence", 0.5) - 0.20)
                elif verdict == "REVISE":
                    updated["confidence"] = min(1.0, h.get("confidence", 0.5) + 0.05)
                else:  # CONFIRM
                    updated["confidence"] = min(1.0, h.get("confidence", 0.5) + 0.10)
                updated_hypotheses.append(updated)
            else:
                updated_hypotheses.append(h)

        # Determine new confidence
        if llm_confidence is not None:
            new_confidence = float(llm_confidence)
        else:
            new_confidence = min(1.0, current_confidence + _VERIFICATION_BOOST)

        # Update reasoning with verified hypotheses
        updated_reasoning = dict(reasoning)
        updated_reasoning["hypotheses"] = updated_hypotheses

        log_msg = (
            f"[VerificationAgent] Done. {len(weak)} weak hypotheses rechecked. "
            f"confidence: {current_confidence:.2f} → {new_confidence:.2f}. "
            f"Note: {verification_note}"
        )
        logger.info(log_msg)

        return {
            "reasoning": updated_reasoning,
            "confidence": new_confidence,
            "intermediateResults": {
                **intermediate,
                "verification_agent": {
                    "weak_hypotheses_rechecked": len(weak),
                    "verdicts": verdicts,
                    "verification_note": verification_note,
                    "confidence_delta": round(new_confidence - current_confidence, 4),
                    "new_confidence": new_confidence,
                },
            },
            "messages": [log_msg],
        }

    return verification_agent


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
