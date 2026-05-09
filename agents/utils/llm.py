"""LLM factory for the Ertoba Analytics agent runtime.

Supports multiple backends selectable via environment variables.  Falls back to
a deterministic ``_MockChatModel`` when no API key is configured or when the
caller explicitly requests mock mode.

Priority order (first matching key wins):
1. OPENAI_API_KEY    → ChatOpenAI (gpt-4o-mini by default)
2. ANTHROPIC_API_KEY → ChatAnthropic (claude-3-haiku by default)
3. GOOGLE_API_KEY    → ChatGoogleGenerativeAI (gemini-1.5-flash by default)
4. (none / --mock)   → _MockChatModel (no external calls, deterministic)

Environment variables
---------------------
OPENAI_API_KEY
OPENAI_MODEL          (optional, default: gpt-4o-mini)
ANTHROPIC_API_KEY
ANTHROPIC_MODEL       (optional, default: claude-3-haiku-20240307)
GOOGLE_API_KEY
GOOGLE_MODEL          (optional, default: gemini-1.5-flash)
"""

from __future__ import annotations

import os
from typing import Any, Optional

from langchain_core.language_models import BaseChatModel
from langchain_core.messages import AIMessage, BaseMessage


# --------------------------------------------------------------------------- #
# Mock chat model (no external calls)                                          #
# --------------------------------------------------------------------------- #

class _MockChatModel(BaseChatModel):
    """Deterministic mock that returns a structured JSON stub.

    Used when no LLM provider is configured so that the full LangGraph
    pipeline can be exercised without network access.
    """

    model_name: str = "mock"

    def _generate(self, messages: list[BaseMessage], stop: Optional[list[str]] = None, **kwargs: Any):  # type: ignore[override]
        from langchain_core.outputs import ChatGeneration, ChatResult

        # Return the last human message echoed back with a JSON wrapper so
        # that agent parsers can extract structured fields.
        prompt = messages[-1].content if messages else ""
        stub = (
            '{"status":"ok","mock":true,'
            f'"prompt_preview":{str(prompt)[:80]!r},'
            '"confidence":0.75}'
        )
        return ChatResult(generations=[ChatGeneration(message=AIMessage(content=stub))])

    @property
    def _llm_type(self) -> str:  # type: ignore[override]
        return "mock"


# --------------------------------------------------------------------------- #
# Public factory                                                               #
# --------------------------------------------------------------------------- #

def get_llm(mock: bool = False) -> BaseChatModel:
    """Return the best available ``BaseChatModel`` for the current environment.

    Parameters
    ----------
    mock:
        Force the mock model regardless of available API keys.
    """
    if mock:
        return _MockChatModel()

    if os.getenv("OPENAI_API_KEY"):
        from langchain_openai import ChatOpenAI  # type: ignore[import]
        model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
        return ChatOpenAI(model=model, temperature=0)

    if os.getenv("ANTHROPIC_API_KEY"):
        from langchain_anthropic import ChatAnthropic  # type: ignore[import]
        model = os.getenv("ANTHROPIC_MODEL", "claude-3-haiku-20240307")
        return ChatAnthropic(model=model, temperature=0)

    if os.getenv("GOOGLE_API_KEY"):
        from langchain_google_genai import ChatGoogleGenerativeAI  # type: ignore[import]
        model = os.getenv("GOOGLE_MODEL", "gemini-1.5-flash")
        return ChatGoogleGenerativeAI(model=model, temperature=0)

    # No provider configured — fall back to mock so the pipeline still runs.
    return _MockChatModel()
