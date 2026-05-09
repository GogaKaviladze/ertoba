# Ertoba Analytics — LangGraph Agent

A multi-step LangGraph agent that analyses Georgian media articles from `Propaganda.json` and produces a structured propaganda-framing report.

---

## What the agent does

The graph runs four nodes in sequence:

```
data_inspector → pattern_detector → [verification_agent] → report_writer
```

| Node | Responsibility |
|---|---|
| `data_inspector` | Chunks and inspects the raw article data; builds a `DataContext` (source distribution, date range, anomalies) |
| `pattern_detector` | Detects propaganda patterns and narrative framings; emits a confidence score |
| `verification_agent` | Triggered only when confidence < 0.75 — performs an additional reasoning pass |
| `report_writer` | Aggregates all intermediate results into a final report |

---

## Requirements

Python 3.11+ recommended.

```bash
pip install -r requirements.txt
```

You must also uncomment **one** LLM provider in `requirements.txt` and install it:

| Provider | Package | Environment variable |
|---|---|---|
| Anthropic | `langchain-anthropic` | `ANTHROPIC_API_KEY` |
| Google Gemini | `langchain-google-genai` | `GOOGLE_API_KEY` |
| OpenAI | `langchain-openai` | `OPENAI_API_KEY` |

---

## Running the agent

```bash
# From the repo root
export ANTHROPIC_API_KEY=sk-ant-...   # or GOOGLE_API_KEY / OPENAI_API_KEY

python run_agent.py
```

To run without a real LLM key (mock mode for local testing):

```python
from agents.graph import build_graph

app = build_graph(mock=True)
result = app.invoke(initial_state)
```

---

## API keys needed

| Key | Required | Notes |
|---|---|---|
| One of `ANTHROPIC_API_KEY` / `GOOGLE_API_KEY` / `OPENAI_API_KEY` | Yes (for real runs) | Mock mode works without any key |
| `GITHUB_API` | Optional | Only needed if the agent creates GitHub issues automatically |
