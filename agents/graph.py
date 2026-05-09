"""LangGraph orchestration for the Ertoba Analytics agent runtime.

Graph topology
--------------
                ┌──────────────────┐
                │  data_inspector  │
                └────────┬─────────┘
                         │
                ┌────────▼─────────┐
                │ pattern_detector │
                └────────┬─────────┘
                         │
              confidence < THRESHOLD?
             /                       \\
           YES                        NO
            │                          │
  ┌─────────▼──────────┐               │
  │ verification_agent │               │
  └─────────┬──────────┘               │
            │                          │
            └───────────┬──────────────┘
                        │
               ┌────────▼────────┐
               │  report_writer  │
               └────────┬────────┘
                        │
                      [END]

Usage
-----
    from agents.graph import build_graph

    app = build_graph(llm=my_llm)
    result = app.invoke(initial_state)

Or use the pre-built singleton (uses ``get_llm()`` auto-detection):

    from agents.graph import app
    result = app.invoke(initial_state)
"""

from __future__ import annotations

import logging

from langgraph.graph import StateGraph, END

from agents.state import AgentState
from agents.nodes import data_inspector as di_mod
from agents.nodes import pattern_detector as pd_mod
from agents.nodes import verification as va_mod
from agents.nodes import report_writer as rw_mod
from agents.utils.llm import get_llm

logger = logging.getLogger(__name__)

# Confidence below this value triggers the VerificationAgent loop.
CONFIDENCE_THRESHOLD = 0.75


# --------------------------------------------------------------------------- #
# Graph builder                                                                #
# --------------------------------------------------------------------------- #

def build_graph(llm=None, mock: bool = False):
    """Compile and return a LangGraph ``CompiledGraph``.

    Parameters
    ----------
    llm:
        An optional pre-built ``BaseChatModel``.  When omitted, ``get_llm``
        auto-selects based on available environment variables.
    mock:
        Force mock LLM regardless of available API keys.
    """
    if llm is None:
        llm = get_llm(mock=mock)

    # Bind each node to the shared LLM instance
    data_inspector_fn = di_mod.build_node(llm)
    pattern_detector_fn = pd_mod.build_node(llm)
    verification_agent_fn = va_mod.build_node(llm)
    report_writer_fn = rw_mod.build_node(llm)

    graph = StateGraph(AgentState)

    # Register nodes
    graph.add_node("data_inspector", data_inspector_fn)
    graph.add_node("pattern_detector", pattern_detector_fn)
    graph.add_node("verification_agent", verification_agent_fn)
    graph.add_node("report_writer", report_writer_fn)

    # Entry point
    graph.set_entry_point("data_inspector")

    # Linear edge: inspect → detect
    graph.add_edge("data_inspector", "pattern_detector")

    # Conditional edge: detect → verify (low confidence) or report
    graph.add_conditional_edges(
        "pattern_detector",
        _confidence_router,
        {
            "verify": "verification_agent",
            "report": "report_writer",
        },
    )

    # After verification always proceed to report
    graph.add_edge("verification_agent", "report_writer")

    # Terminal edge
    graph.add_edge("report_writer", END)

    return graph.compile()


def _confidence_router(state: AgentState) -> str:
    """Route to 'verify' when confidence is below threshold, else 'report'."""
    confidence = state.get("confidence", 0.0)
    if confidence < CONFIDENCE_THRESHOLD:
        logger.info(
            "[Router] confidence=%.2f < %.2f → routing to verification_agent",
            confidence,
            CONFIDENCE_THRESHOLD,
        )
        return "verify"
    logger.info(
        "[Router] confidence=%.2f ≥ %.2f → routing to report_writer",
        confidence,
        CONFIDENCE_THRESHOLD,
    )
    return "report"


# --------------------------------------------------------------------------- #
# Singleton (mock-mode by default for import-time safety)                     #
# --------------------------------------------------------------------------- #

# Build a mock-mode singleton so ``from agents import app`` always works even
# without LLM credentials.  ``run_agent.py`` calls ``build_graph`` directly
# with the appropriate mode flag.
app = build_graph(mock=True)
