# ─────────────────────────────────────────────────────────────
# src/chunker.py
#
# Splits large document pages into smaller, overlapping chunks
# so that embeddings capture focused semantic meaning and the
# retriever can return precise context to the LLM.
# ─────────────────────────────────────────────────────────────

from typing import List

from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter


# ── Default chunking settings ─────────────────────────────────
# chunk_size   : max characters per chunk (≈ 300–500 tokens)
# chunk_overlap: characters shared between adjacent chunks so
#                context isn't lost at boundaries
DEFAULT_CHUNK_SIZE = 1000
DEFAULT_CHUNK_OVERLAP = 200


def chunk_documents(
    documents: List[Document],
    chunk_size: int = DEFAULT_CHUNK_SIZE,
    chunk_overlap: int = DEFAULT_CHUNK_OVERLAP,
) -> List[Document]:
    """
    Split a list of Documents into smaller text chunks.

    RecursiveCharacterTextSplitter tries to split on paragraph
    breaks, then newlines, then sentences, then words — keeping
    chunks as semantically whole as possible.

    Args:
        documents   : Raw Document objects (e.g., from loader.py).
        chunk_size  : Maximum characters per chunk.
        chunk_overlap: How many characters to repeat between chunks.

    Returns:
        List of smaller Document chunks (metadata preserved).
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        # These separators are tried in order until chunks are small enough
        separators=["\n\n", "\n", ". ", " ", ""],
    )

    chunks = splitter.split_documents(documents)

    print(
        f"[Chunker] {len(documents)} pages → {len(chunks)} chunks "
        f"(size={chunk_size}, overlap={chunk_overlap})"
    )
    return chunks


def preview_chunks(chunks: List[Document], n: int = 3) -> None:
    """
    Print the first `n` chunks for quick debugging / inspection.

    Args:
        chunks: List of Document chunks.
        n     : Number of chunks to preview.
    """
    print(f"\n[Chunker] Previewing first {min(n, len(chunks))} chunks:\n")
    for i, chunk in enumerate(chunks[:n]):
        print(f"── Chunk {i + 1} ──────────────────────────────")
        print(f"Source : {chunk.metadata.get('source', 'unknown')}")
        print(f"Page   : {chunk.metadata.get('page', '?')}")
        print(f"Length : {len(chunk.page_content)} chars")
        print(f"Text   : {chunk.page_content[:200]}...")
        print()
