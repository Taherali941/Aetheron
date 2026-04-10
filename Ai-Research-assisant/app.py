# -----------------------------------------------------------------
# app.py
#
# Streamlit front-end for the AI Research Assistant.
# Run with:  streamlit run app.py
#
# LLM: DeepSeek API (deepseek-chat) — no local model needed.
#
# Flow:
#   1. User enters their DeepSeek API key in the sidebar
#   2. User uploads one or more PDF research papers
#   3. App chunks + embeds them into ChromaDB (local embeddings)
#   4. User types a question
#   5. Agent retrieves context + calls DeepSeek API for the answer
#   6. Optional: Critic, Gap Finder, Idea Generator tabs
# -----------------------------------------------------------------

import os
import streamlit as st

# -- Project imports ----------------------------------------------
from src.loader import load_pdfs_from_uploads
from src.chunker import chunk_documents
from src.embeddings import build_vectorstore, load_vectorstore, vectorstore_exists
from src.agents.research import ResearchAgent


# -----------------------------------------------------------------
# PAGE CONFIG
# -----------------------------------------------------------------
st.set_page_config(
    page_title="AI Research Assistant",
    page_icon="🔬",
    layout="wide",
)

st.title("🔬 Agentic AI Research Assistant")
st.caption("Powered by **DeepSeek API** · Upload papers → Ask questions → Get grounded answers")

st.divider()


# -----------------------------------------------------------------
# SESSION STATE
# Streamlit re-runs the whole script on every interaction.
# We use st.session_state to persist objects across re-runs.
# -----------------------------------------------------------------
if "vectorstore" not in st.session_state:
    st.session_state.vectorstore = None

if "agent" not in st.session_state:
    st.session_state.agent = None

if "processed" not in st.session_state:
    st.session_state.processed = False


# -----------------------------------------------------------------
# SIDEBAR – API Key + PDF Upload & Processing
# -----------------------------------------------------------------
with st.sidebar:
    # -- DeepSeek API Key -----------------------------------------
    st.header("🔑 DeepSeek API Key")
    st.caption("Get your key at [platform.deepseek.com](https://platform.deepseek.com)")

    # Read from env first (set via .env file), allow UI override
    env_key = os.getenv("DEEPSEEK_API_KEY", "")
    api_key_input = st.text_input(
        "Paste your API key here:",
        value=env_key,
        type="password",          # hides the key in the UI
        placeholder="sk-...",
    )

    # Use UI input if provided, else fall back to env variable
    active_api_key = api_key_input.strip() or env_key

    if not active_api_key:
        st.warning("API key required to run the agent.")
    else:
        st.success("API key loaded")

    st.divider()

    # -- PDF Upload -----------------------------------------------
    st.header("📄 Upload Research Papers")

    uploaded_files = st.file_uploader(
        "Drop one or more PDF files here",
        type=["pdf"],
        accept_multiple_files=True,
    )

    # -- Chunking settings (advanced) -----------------------------
    with st.expander("⚙️ Advanced Settings"):
        chunk_size = st.slider("Chunk size (chars)", 500, 2000, 1000, step=100)
        chunk_overlap = st.slider("Chunk overlap (chars)", 0, 400, 200, step=50)
        top_k = st.slider("Chunks to retrieve (top-k)", 1, 10, 5)

    # -- Process button -------------------------------------------
    process_btn = st.button("⚡ Process PDFs", use_container_width=True)

    if process_btn:
        if not active_api_key:
            st.error("Please enter your DeepSeek API key first.")
        elif not uploaded_files:
            st.warning("Please upload at least one PDF first.")
        else:
            # CRITICAL: clear previous session objects before building fresh
            st.session_state.agent = None
            st.session_state.vectorstore = None
            st.session_state.processed = False

            with st.spinner("Loading & chunking PDFs..."):
                docs = load_pdfs_from_uploads(uploaded_files)
                chunks = chunk_documents(
                    docs, chunk_size=chunk_size, chunk_overlap=chunk_overlap
                )

            # Build per-source breakdown for user verification
            source_counts = {}
            for c in chunks:
                src = c.metadata.get("source", "unknown")
                source_counts[src] = source_counts.get(src, 0) + 1

            with st.spinner("Embedding into ChromaDB (wiping old data first)..."):
                # build_vectorstore() wipes stale data automatically
                vectorstore = build_vectorstore(chunks)
                st.session_state.vectorstore = vectorstore
                st.session_state.processed = True

            with st.spinner("Initialising DeepSeek Research Agent..."):
                st.session_state.agent = ResearchAgent(
                    vectorstore=vectorstore,
                    api_key=active_api_key,
                    top_k=top_k,
                )

            st.success(
                f"Indexed {len(chunks)} chunks from {len(uploaded_files)} PDF(s)"
            )
            for fname, count in source_counts.items():
                st.caption(f"  - {fname}: {count} chunks")

    # -- Load existing vectorstore --------------------------------
    if not st.session_state.processed:
        if vectorstore_exists():
            if st.button("📂 Load Existing Vectorstore", use_container_width=True):
                if not active_api_key:
                    st.error("Please enter your DeepSeek API key first.")
                else:
                    with st.spinner("Loading vectorstore from disk..."):
                        vectorstore = load_vectorstore()
                        st.session_state.vectorstore = vectorstore
                        st.session_state.agent = ResearchAgent(
                            vectorstore=vectorstore,
                            api_key=active_api_key,
                            top_k=top_k,
                        )
                        st.session_state.processed = True
                    st.success("Existing vectorstore loaded!")

    # -- Status indicator -----------------------------------------
    st.divider()
    if st.session_state.processed:
        st.success("🟢 Agent ready")
    else:
        st.info("🔴 No papers loaded yet")


# -----------------------------------------------------------------
# MAIN AREA - Tabs
# -----------------------------------------------------------------
tab_qa, tab_gaps, tab_ideas, tab_summary = st.tabs(
    ["💬 Ask a Question", "🔍 Research Gaps", "💡 Generate Ideas", "📝 Summarize"]
)


# -- Tab 1: Q&A ---------------------------------------------------
with tab_qa:
    st.subheader("Ask anything about the uploaded papers")

    question = st.text_area(
        "Your question:",
        placeholder="e.g. What evaluation metrics are used in the experiments?",
        height=100,
    )

    col1, col2 = st.columns([1, 1])
    ask_btn = col1.button("🔎 Get Answer", use_container_width=True)
    show_context = col2.checkbox("Show retrieved context", value=False)

    if ask_btn:
        if not st.session_state.agent:
            st.error("Please upload and process PDFs first (use the sidebar).")
        elif not question.strip():
            st.warning("Please type a question.")
        else:
            with st.spinner("Searching papers and generating answer..."):
                result = st.session_state.agent.answer(question)

            st.markdown("### 📌 Answer")
            st.write(result["answer"])

            st.markdown("### 📚 Sources Used")
            seen = set()
            for source, page in result["sources"]:
                key = f"{source}|{page}"
                if key not in seen:
                    seen.add(key)
                    st.markdown(f"- **{source}** — Page {page}")

            if show_context:
                with st.expander("📋 Raw Retrieved Context"):
                    st.text(result["context"])


# -- Tab 2: Research Gaps -----------------------------------------
with tab_gaps:
    st.subheader("Identify research gaps in the uploaded papers")

    gap_focus = st.text_input(
        "Optional focus area:",
        placeholder="e.g. scalability of transformer models",
    )
    gap_btn = st.button("🔍 Find Gaps", use_container_width=True)

    if gap_btn:
        if not st.session_state.agent:
            st.error("Please process PDFs first.")
        else:
            with st.spinner("Analysing papers for research gaps..."):
                gaps = st.session_state.agent.find_gaps(gap_focus or None)
            st.markdown("### 🔍 Research Gaps")
            st.write(gaps)


# -- Tab 3: Idea Generator ----------------------------------------
with tab_ideas:
    st.subheader("Generate novel research ideas based on the papers")

    topic = st.text_input(
        "Topic / focus area:",
        placeholder="e.g. efficient fine-tuning of large language models",
        value="general AI research",
    )
    idea_btn = st.button("💡 Generate Ideas", use_container_width=True)

    if idea_btn:
        if not st.session_state.agent:
            st.error("Please process PDFs first.")
        else:
            with st.spinner("Brainstorming ideas..."):
                ideas = st.session_state.agent.generate_ideas(topic)
            st.markdown("### 💡 Novel Research Ideas")
            st.write(ideas)


# -- Tab 4: Summarize ---------------------------------------------
with tab_summary:
    st.subheader("Get a structured summary of the papers")

    summary_topic = st.text_input(
        "What aspect to focus on?",
        placeholder="e.g. main contributions, methodology, results",
        value="main contributions",
    )
    summary_btn = st.button("📝 Summarize", use_container_width=True)

    if summary_btn:
        if not st.session_state.agent:
            st.error("Please process PDFs first.")
        else:
            with st.spinner("Summarising papers..."):
                summary = st.session_state.agent.summarize(summary_topic)
            st.markdown("### 📝 Summary")
            st.write(summary)


# -----------------------------------------------------------------
# FOOTER
# -----------------------------------------------------------------
st.divider()
st.caption("Built with LangChain · ChromaDB · sentence-transformers · DeepSeek API · Streamlit")