# ─────────────────────────────────────────────────────────────
# utils/prompts.py
#
# Central store for all prompt templates used by the agents.
# Keeping prompts here makes it easy to iterate on wording
# without touching business logic.
# ─────────────────────────────────────────────────────────────


# ── 1. RAG Answer Prompt ──────────────────────────────────────
# The main prompt: given retrieved context, answer the question.
RAG_PROMPT_TEMPLATE = """You are an expert AI research assistant.
Use ONLY the context provided below to answer the question.
If the answer is not present in the context, say:
"I couldn't find enough information in the uploaded papers to answer this."

Do NOT hallucinate or use outside knowledge.

─────────────────────────────────────────────────────
CONTEXT FROM RESEARCH PAPERS:
{context}
─────────────────────────────────────────────────────

QUESTION: {question}

ANSWER (be concise, cite paper sections when helpful):"""


# ── 2. Critic Prompt ─────────────────────────────────────────
# Evaluate the quality / completeness of an answer.
CRITIC_PROMPT_TEMPLATE = """You are a strict academic peer reviewer.
Evaluate the following answer to a research question.

QUESTION: {question}
ANSWER: {answer}

Rate on a scale of 1–10 and provide feedback on:
1. Accuracy   – Is the answer factually correct given the context?
2. Completeness – Does it fully address the question?
3. Clarity    – Is it well-written and easy to understand?

CRITIQUE:"""


# ── 3. Research Gap Prompt ───────────────────────────────────
# Identify what is missing or unexplored in the papers.
GAP_PROMPT_TEMPLATE = """You are a senior AI researcher.
Based on the following research context, identify 3–5 clear
research gaps or open problems that are NOT yet solved.

CONTEXT:
{context}

OUTPUT FORMAT:
Gap 1: <title>
  - What's missing: ...
  - Why it matters: ...

Gap 2: ...

RESEARCH GAPS:"""


# ── 4. Idea Generation Prompt ────────────────────────────────
# Brainstorm novel research ideas grounded in the papers.
IDEA_PROMPT_TEMPLATE = """You are a creative AI researcher attending a hackathon.
Given the following research context, propose 3 novel, actionable
research ideas or project directions.

CONTEXT:
{context}

TOPIC FOCUS: {topic}

For each idea include:
- Title
- Core concept (2–3 sentences)
- How it extends the existing work

NOVEL IDEAS:"""


# ── 5. Summarization Prompt ──────────────────────────────────
# Create a concise summary of the retrieved chunks.
SUMMARY_PROMPT_TEMPLATE = """You are a technical writer.
Summarize the following research excerpts into a clear,
structured overview (max 200 words).

EXCERPTS:
{context}

SUMMARY:"""


def build_rag_prompt(context: str, question: str) -> str:
    """Fill in the RAG prompt template."""
    return RAG_PROMPT_TEMPLATE.format(context=context, question=question)


def build_critic_prompt(question: str, answer: str) -> str:
    """Fill in the critic prompt template."""
    return CRITIC_PROMPT_TEMPLATE.format(question=question, answer=answer)


def build_gap_prompt(context: str) -> str:
    """Fill in the research gap prompt template."""
    return GAP_PROMPT_TEMPLATE.format(context=context)


def build_idea_prompt(context: str, topic: str = "general AI research") -> str:
    """Fill in the idea generation prompt template."""
    return IDEA_PROMPT_TEMPLATE.format(context=context, topic=topic)


def build_summary_prompt(context: str) -> str:
    """Fill in the summarization prompt template."""
    return SUMMARY_PROMPT_TEMPLATE.format(context=context)
