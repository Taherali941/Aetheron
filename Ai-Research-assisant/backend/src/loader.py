# ─────────────────────────────────────────────────────────────
# src/loader.py
#
# Responsible for loading PDF files from disk or from uploaded
# Streamlit file objects and returning them as LangChain
# Document objects.
# ─────────────────────────────────────────────────────────────

import os
import tempfile
from typing import List

from langchain_community.document_loaders import PyPDFLoader
# from langchain.schema import Document
from langchain_core.documents import Document

def load_pdf_from_path(pdf_path: str) -> List[Document]:
    """
    Load a single PDF from a file path on disk.

    Args:
        pdf_path: Absolute or relative path to the PDF file.

    Returns:
        List of LangChain Document objects (one per page).
    """
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF not found: {pdf_path}")

    loader = PyPDFLoader(pdf_path)
    pages = loader.load()

    print(f"[Loader] Loaded '{os.path.basename(pdf_path)}' → {len(pages)} pages")
    return pages


def load_pdfs_from_directory(directory: str) -> List[Document]:
    """
    Load all PDFs found inside a directory.

    Args:
        directory: Path to folder containing .pdf files.

    Returns:
        Flat list of Document objects from all PDFs combined.
    """
    all_docs: List[Document] = []

    pdf_files = [f for f in os.listdir(directory) if f.lower().endswith(".pdf")]
    if not pdf_files:
        print(f"[Loader] No PDF files found in '{directory}'")
        return all_docs

    for filename in pdf_files:
        full_path = os.path.join(directory, filename)
        docs = load_pdf_from_path(full_path)
        all_docs.extend(docs)

    print(f"[Loader] Total documents loaded: {len(all_docs)}")
    return all_docs


def load_pdfs_from_uploads(uploaded_files) -> List[Document]:
    """
    Load PDFs from Streamlit's UploadedFile objects.

    Streamlit gives us in-memory file objects, not disk paths.
    We save them temporarily so PyPDFLoader can read them.

    Args:
        uploaded_files: List of Streamlit UploadedFile objects.

    Returns:
        Flat list of Document objects from all uploaded PDFs.
    """
    all_docs: List[Document] = []

    for uploaded_file in uploaded_files:
        # Write the in-memory file to a temporary path
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(uploaded_file.read())
            tmp_path = tmp.name

        try:
            docs = load_pdf_from_path(tmp_path)
            # Overwrite the source metadata with the original filename
            for doc in docs:
                doc.metadata["source"] = uploaded_file.name
            all_docs.extend(docs)
        finally:
            os.remove(tmp_path)  # Clean up temp file

    print(f"[Loader] Total pages from uploads: {len(all_docs)}")
    return all_docs
