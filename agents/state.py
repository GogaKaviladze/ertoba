"""Agent state definition for the Ertoba Analytics LangGraph runtime.

All inter-agent data is stored in a single ``AgentState`` TypedDict.  The
graph nodes read from and return partial updates to this shared state; LangGraph
merges the updates automatically between steps.

Fields
------
dataContext
    Structured view of the article data currently under analysis (chunked —
    never the full Propaganda.json verbatim).  Populated by ``DataInspector``.
reasoning
    Hypotheses and evidence accumulated by ``PatternDetector``.
intermediateResults
    Per-agent keyed output store.  Agents write their findings here so that
    downstream nodes and the dashboard can trace the full reasoning chain.
confidence
    Float in [0.0, 1.0].  Agents update this value; the graph router sends
    execution to ``VerificationAgent`` when it falls below the threshold.
messages
    Accumulated human/AI message log for audit purposes.
errors
    Non-fatal errors collected during processing.
"""

from __future__ import annotations

import operator
from typing import Annotated, Any

from typing_extensions import TypedDict


# ── Sub-structures ──────────────────────────────────────────────────────────

class ArticleChunk(TypedDict):
    """A bounded slice of articles passed to agent prompts."""
    chunk_id: str
    articles: list[dict[str, Any]]
    total_in_chunk: int


class DataContext(TypedDict):
    """High-level view of the data under analysis."""
    source_distribution: dict[str, int]   # source → article count
    date_range: dict[str, str]            # {"from": "YYYY-MM-DD", "to": "…"}
    total_articles: int
    anomalies: list[str]                  # data-quality observations
    chunks_analysed: int                  # how many chunks DataInspector reviewed


class Hypothesis(TypedDict):
    """A single analytical claim with supporting evidence."""
    id: str
    claim: str
    evidence: list[str]
    confidence: float


class Reasoning(TypedDict):
    """Structured reasoning output from PatternDetector."""
    hypotheses: list[Hypothesis]
    detected_patterns: list[str]
    dominant_framing: str
    narrative_summary: str


# ── Top-level agent state ───────────────────────────────────────────────────

class AgentState(TypedDict):
    """Shared state threaded through every node in the LangGraph."""

    # Data context (populated by DataInspector)
    dataContext: DataContext

    # Reasoning layer (populated by PatternDetector)
    reasoning: Reasoning

    # Per-agent keyed results for full auditability
    intermediateResults: dict[str, Any]

    # Confidence score driving the verification loop
    confidence: float

    # Message log — uses ``operator.add`` so each node can append freely
    messages: Annotated[list[str], operator.add]

    # Non-fatal error log
    errors: Annotated[list[str], operator.add]
