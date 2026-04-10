# -----------------------------------------------------------------
# src/embeddings.py
#
# KEY FIX: build_vectorstore() now WIPES the old collection before
# writing, so stale chunks from previous sessions never pollute
# results when new PDFs are uploaded.
# -----------------------------------------------------------------

import os
import shutil
from typing import List

from langchain_core.documents import Document
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings


# -- Configuration ------------------------------------------------
EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

# Absolute path so it works regardless of where the script is run from
VECTORSTORE_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "vectorstore")
)

COLLECTION_NAME = "research_papers"


def get_embedding_model() -> HuggingFaceEmbeddings:
    """
    Load and return the sentence-transformer embedding model.
    Cached locally after first download so subsequent runs are fast.
    """
    print(f"[Embeddings] Loading model: {EMBEDDING_MODEL_NAME}")
    embeddings = HuggingFaceEmbeddings(
        model_name=EMBEDDING_MODEL_NAME,
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": True},
    )
    return embeddings


def _wipe_vectorstore_dir() -> None:
    """
    Delete the entire vectorstore directory and recreate it empty.

    This is the permanent fix for stale-data bugs: every time the
    user clicks "Process PDFs", we start from a completely clean
    slate so old chunks never bleed into new results.
    """
    if os.path.exists(VECTORSTORE_DIR):
        shutil.rmtree(VECTORSTORE_DIR)
        print(f"[Embeddings] Wiped old vectorstore at: {VECTORSTORE_DIR}")
    os.makedirs(VECTORSTORE_DIR, exist_ok=True)
    print("[Embeddings] Fresh vectorstore directory created.")


def build_vectorstore(chunks: List[Document]) -> Chroma:
    """
    Embed chunks and store them in a FRESH ChromaDB collection.

    Wipes any previous vectorstore first so there is zero chance of
    stale data from a previous PDF upload session surviving.

    Args:
        chunks: Document chunks produced by chunker.py.

    Returns:
        Populated Chroma vectorstore instance.
    """
    # CRITICAL: delete old data before writing new chunks
    _wipe_vectorstore_dir()

    embeddings = get_embedding_model()

    print(f"[Embeddings] Embedding {len(chunks)} chunks into ChromaDB...")

    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        collection_name=COLLECTION_NAME,
        persist_directory=VECTORSTORE_DIR,
    )

    stored_count = vectorstore._collection.count()
    print(f"[Embeddings] Done. {stored_count} chunks stored at: {VECTORSTORE_DIR}")
    return vectorstore


def load_vectorstore() -> Chroma:
    """
    Load an existing ChromaDB vectorstore from disk.

    Only call this when you intentionally want to reuse the last
    indexed session (the 'Load Existing Vectorstore' button).

    Raises:
        FileNotFoundError: If no vectorstore exists on disk yet.
    """
    chroma_db_file = os.path.join(VECTORSTORE_DIR, "chroma.sqlite3")
    if not os.path.exists(chroma_db_file):
        raise FileNotFoundError(
            f"No vectorstore found at '{VECTORSTORE_DIR}'. "
            "Please upload and process PDFs first."
        )

    embeddings = get_embedding_model()

    vectorstore = Chroma(
        collection_name=COLLECTION_NAME,
        embedding_function=embeddings,
        persist_directory=VECTORSTORE_DIR,
    )

    count = vectorstore._collection.count()
    print(f"[Embeddings] Loaded existing vectorstore: {count} chunks.")
    return vectorstore


def vectorstore_exists() -> bool:
    """Return True if a valid persisted vectorstore exists on disk."""
    return os.path.exists(os.path.join(VECTORSTORE_DIR, "chroma.sqlite3"))