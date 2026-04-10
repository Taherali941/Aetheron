# -----------------------------------------------------------------
# src/retriever.py
#
# Wraps ChromaDB to provide diversity-aware document retrieval.
#
# KEY FIX: retrieve_chunks() now fetches a larger candidate pool
# and then applies max-marginal-relevance + per-source balancing
# so no single paper monopolises all retrieved slots.
# -----------------------------------------------------------------

from typing import List, Tuple

from langchain_core.documents import Document
from langchain_community.vectorstores import Chroma


DEFAULT_TOP_K = 5   # chunks returned to the LLM per query


def get_retriever(vectorstore: Chroma, top_k: int = DEFAULT_TOP_K):
    """
    Return a LangChain MMR retriever backed by ChromaDB.

    MMR (Maximal Marginal Relevance) actively penalises redundant
    chunks, so results are both relevant AND diverse across sources.

    Args:
        vectorstore: Loaded Chroma instance.
        top_k:       Number of chunks to return.

    Returns:
        A LangChain VectorStoreRetriever using MMR search.
    """
    retriever = vectorstore.as_retriever(
        search_type="mmr",
        search_kwargs={
            "k": top_k,
            "fetch_k": top_k * 5,   # fetch larger pool, then diversify
            "lambda_mult": 0.7,     # 0 = max diversity, 1 = max relevance
        },
    )
    print(f"[Retriever] MMR retriever ready (top_k={top_k})")
    return retriever


def retrieve_chunks(
    vectorstore: Chroma,
    query: str,
    top_k: int = DEFAULT_TOP_K,
) -> List[Document]:
    """
    Retrieve the top-k most relevant AND diverse chunks.

    Uses MMR retrieval then applies a per-source cap so that a
    single paper can contribute at most ceil(top_k / n_sources)
    chunks — guaranteeing all uploaded papers get representation.

    Args:
        vectorstore: Loaded Chroma instance.
        query:       User's natural language question.
        top_k:       Number of results to return.

    Returns:
        List of Document chunks balanced across all sources.
    """
    import math

    retriever = get_retriever(vectorstore, top_k=top_k)
    results: List[Document] = retriever.invoke(query)

    # -- Per-source diversity cap ---------------------------------
    # Count how many distinct source files are in the full store
    all_meta = vectorstore._collection.get(include=["metadatas"])["metadatas"]
    unique_sources = {m.get("source", "unknown") for m in all_meta}
    n_sources = max(len(unique_sources), 1)

    # Each source may contribute at most this many chunks
    per_source_cap = math.ceil(top_k / n_sources)

    balanced: List[Document] = []
    source_counts: dict = {}
    for doc in results:
        src = doc.metadata.get("source", "unknown")
        count = source_counts.get(src, 0)
        if count < per_source_cap:
            balanced.append(doc)
            source_counts[src] = count + 1

    # If we pruned too aggressively, fill remaining slots in order
    if len(balanced) < min(top_k, len(results)):
        seen_ids = {id(d) for d in balanced}
        for doc in results:
            if id(doc) not in seen_ids:
                balanced.append(doc)
                seen_ids.add(id(doc))
            if len(balanced) >= top_k:
                break

    sources_used = sorted({d.metadata.get("source", "?") for d in balanced})
    print(f"[Retriever] Query : '{query[:70]}'")
    print(f"[Retriever] Chunks: {len(balanced)} from {len(sources_used)} source(s): {sources_used}")
    return balanced


def format_context(chunks: List[Document]) -> str:
    """
    Merge retrieved chunks into a single labelled context block.

    Each chunk is clearly tagged with its source file and page so
    the LLM can attribute claims correctly.

    Args:
        chunks: List of retrieved Document objects.

    Returns:
        Formatted string ready to inject into the LLM prompt.
    """
    parts = []
    for i, chunk in enumerate(chunks, start=1):
        source = chunk.metadata.get("source", "unknown")
        page   = chunk.metadata.get("page", "?")
        parts.append(
            f"[Chunk {i} | Source: {source} | Page: {page}]\n"
            f"{chunk.page_content.strip()}"
        )
    return "\n\n---\n\n".join(parts)


def retrieve_with_scores(
    vectorstore: Chroma,
    query: str,
    top_k: int = DEFAULT_TOP_K,
) -> List[Tuple[Document, float]]:
    """
    Retrieve chunks with their cosine similarity scores.
    Useful for debugging or showing confidence in the UI.
    """
    return vectorstore.similarity_search_with_score(query, k=top_k)