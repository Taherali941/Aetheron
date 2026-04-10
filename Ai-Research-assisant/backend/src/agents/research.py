import sys
import os
from collections import defaultdict
from typing import Optional

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from openai import OpenAI
from dotenv import load_dotenv
from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document

from src.retriever import format_context
from utils.prompts import (
    build_rag_prompt,
    build_critic_prompt,
    build_gap_prompt,
    build_idea_prompt,
    build_summary_prompt,
)

load_dotenv()

DEEPSEEK_BASE_URL = "https://api.deepseek.com"
DEEPSEEK_MODEL = "deepseek-chat"

DEFAULT_MAX_TOKENS = 1024
DEFAULT_TEMPERATURE = 0.3


class ResearchAgent:

    def __init__(
        self,
        vectorstore: Chroma,
        api_key: Optional[str] = None,
        top_k: int = 5,
        max_tokens: int = DEFAULT_MAX_TOKENS,
        temperature: float = DEFAULT_TEMPERATURE,
    ):
        self.vectorstore = vectorstore
        self.top_k = top_k
        self.max_tokens = max_tokens
        self.temperature = temperature

        resolved_key = api_key or os.getenv("DEEPSEEK_API_KEY")
        if not resolved_key:
            raise ValueError("DeepSeek API key not found")

        self.client = OpenAI(
            api_key=resolved_key,
            base_url=DEEPSEEK_BASE_URL,
        )

        print(f"[Agent] DeepSeek API ready ({DEEPSEEK_MODEL})")

    # ---------------- LLM ----------------
    def _run_llm(self, system_prompt: str, user_prompt: str) -> str:
        response = self.client.chat.completions.create(
            model=DEEPSEEK_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            max_tokens=self.max_tokens,
            temperature=self.temperature,
        )
        return response.choices[0].message.content.strip()

    # ---------------- 🔥 FINAL ANSWER FIX ----------------
    def answer(self, question: str) -> dict:

        # 🔥 STEP 1: Get ALL stored chunks (no bias)
        all_data = self.vectorstore.get()

        documents = all_data["documents"]
        metadatas = all_data["metadatas"]

        docs = [
            Document(page_content=doc, metadata=meta)
            for doc, meta in zip(documents, metadatas)
        ]

        # 🔥 STEP 2: Group by PDF
        docs_by_source = defaultdict(list)
        for doc in docs:
            source = doc.metadata.get("source", "unknown")
            docs_by_source[source].append(doc)

        # 🔥 STEP 3: Take chunks from EACH PDF
        final_chunks = []
        for source, source_docs in docs_by_source.items():
            final_chunks.extend(source_docs[:5])  # equal contribution

        print("Retrieved sources:", list(docs_by_source.keys()))

        # 🔥 STEP 4: Build context
        context = format_context(final_chunks)

        # 🔥 STEP 5: Prompt
        full_prompt = build_rag_prompt(context=context, question=question)

        answer_text = self._run_llm(
            system_prompt=(
                "You are an expert AI research assistant.\n"
                "You MUST use information from multiple papers.\n"
                "Compare them, highlight similarities and differences.\n"
                "Do not hallucinate."
            ),
            user_prompt=full_prompt,
        )

        # 🔥 STEP 6: Sources
        sources = [
            (
                chunk.metadata.get("source", "unknown"),
                chunk.metadata.get("page", "?"),
            )
            for chunk in final_chunks
        ]

        return {
            "answer": answer_text,
            "sources": sources,
            "context": context,
        }

    # ---------------- GAPS ----------------
    def find_gaps(self, question: Optional[str] = None) -> str:
        query = question or "limitations and future work"

        raw_chunks = self.vectorstore.similarity_search(query, k=10)
        context = format_context(raw_chunks)

        prompt = build_gap_prompt(context=context)

        return self._run_llm(
            system_prompt="You are a senior AI researcher identifying gaps.",
            user_prompt=prompt,
        )

    # ---------------- IDEAS ----------------
    def generate_ideas(self, topic: str = "AI research") -> str:
        query = f"novel research ideas {topic}"

        raw_chunks = self.vectorstore.similarity_search(query, k=10)
        context = format_context(raw_chunks)

        prompt = build_idea_prompt(context=context, topic=topic)

        return self._run_llm(
            system_prompt="You are a creative AI researcher.",
            user_prompt=prompt,
        )

    # ---------------- SUMMARY ----------------
    def summarize(self, topic: str = "main contributions") -> str:
        raw_chunks = self.vectorstore.similarity_search(topic, k=10)
        context = format_context(raw_chunks)

        prompt = build_summary_prompt(context=context)

        return self._run_llm(
            system_prompt="You are a technical writer.",
            user_prompt=prompt,
        )

    # ---------------- CRITIC ----------------
    def critique(self, question: str, answer: str) -> str:
        prompt = build_critic_prompt(question=question, answer=answer)

        return self._run_llm(
            system_prompt="You are a strict reviewer.",
            user_prompt=prompt,
        )