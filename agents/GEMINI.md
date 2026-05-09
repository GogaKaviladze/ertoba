# Ertoba Analytics Agents - AI Mandates

This file contains specific mandates for interactions within the `agents` and `python-scripts` directories.

## Tech Stack
- **Framework:** LangGraph (0.2.73+), LangChain (0.3.25+).
- **Language:** Python 3.12+ (Typed).
- **Data Processing:** `ijson` for streaming large JSON (e.g., `Propaganda.json`).

## Critical Agent Standards

### State Management
- **Rule:** All inter-agent data MUST be stored in the `AgentState` TypedDict defined in `agents/state.py`.
- **Merge Strategy:** Nodes return partial updates to the shared state; LangGraph merges them automatically.
- **Fields:** 
  - `dataContext`: Bounded slices of article data (never full files).
  - `reasoning`: Hypotheses and evidence.
  - `confidence`: Update this [0.0, 1.0] value to trigger the `VerificationAgent` router.

### Graph Orchestration
- **Flow:** Data Inspector -> Pattern Detector -> (Router: if confidence < threshold) -> Verification Agent -> Report Writer.
- **Rules:** 
  - New nodes must be registered in `agents/graph.py`.
  - Prefer functional nodes over complex class-based nodes when possible.

### Performance & Efficiency
- **Rule:** Use `ijson` for any scripts reading `Propaganda.json` or other large datasets to avoid OOM errors.
- **Rule:** Implement chunking strategies (see `agents/utils/chunker.py`) for processing large article sets in LLM prompts.

## Data Pipeline Mandates
- **reproducibility:** Scripts like `generate_timeseries.py` must support a `--sample` flag for synthetic data generation to facilitate testing without the full dataset.
- **Formatting:** JSON outputs must be pretty-printed and follow the schema expected by the dashboard (see `src/data/` for examples).

## Testing & Validation
- **Requirement:** Every new agent node or utility must have a corresponding test case.
- **Validation:** Use `VerificationAgent` to cross-reference findings with the original dataset when confidence is low.
