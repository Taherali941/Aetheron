# 🔬 AI Research Assistant — Starter Pack

A clean, modular RAG-based system that lets you chat with
multiple PDF research papers using a local HuggingFace LLM.

---

## 📁 Project Structure

```
ai-research-assistant/
│
├── app.py                  ← Streamlit UI (entry point)
├── requirements.txt        ← All Python dependencies
│
├── data/                   ← (optional) Put PDFs here to load from disk
├── vectorstore/            ← ChromaDB persists here automatically
│
├── src/
│   ├── loader.py           ← PDF → LangChain Documents
│   ├── chunker.py          ← Documents → overlapping text chunks
│   ├── embeddings.py       ← Chunks → vectors, ChromaDB build/load
│   ├── retriever.py        ← Query → top-k relevant chunks
│   └── agents/
│       └── research.py     ← Orchestrates RAG + all agent modes
│
└── utils/
    └── prompts.py          ← All prompt templates (RAG, critic, gaps, ideas)
```

---

## 🚀 Quick Start

```bash
# 1. Clone / download the project
cd ai-research-assistant

# 2. Create a virtual environment (recommended)
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run the app
streamlit run app.py
```

Then open http://localhost:8501 in your browser.

---

## 🔧 Swapping the LLM

In `src/agents/research.py`, change `DEFAULT_MODEL`:

| Model                                  | RAM needed | Quality    |
|----------------------------------------|------------|------------|
| `google/flan-t5-base` (default)        | ~1 GB      | Good       |
| `google/flan-t5-large`                 | ~3 GB      | Better     |
| `mistralai/Mistral-7B-Instruct-v0.2`  | ~16 GB     | Excellent  |

For Mistral, also change the pipeline task to `"text-generation"` and
add `return_full_text=False` to the pipeline call.

---

## 📦 Features

| Feature         | Where             |
|-----------------|-------------------|
| PDF loading     | `src/loader.py`   |
| Chunking        | `src/chunker.py`  |
| Embeddings      | `src/embeddings.py` |
| Retrieval       | `src/retriever.py` |
| RAG Q&A         | `src/agents/research.py` → `answer()` |
| Critic          | → `critique()` |
| Gap Finder      | → `find_gaps()` |
| Idea Generator  | → `generate_ideas()` |
| Summarizer      | → `summarize()` |
| Prompt templates| `utils/prompts.py` |
| Streamlit UI    | `app.py` |

---

## 💡 Extending for a Hackathon

- Add **multi-hop reasoning**: chain `answer()` → `critique()` in a loop
- Add **citation highlighting**: use `retrieve_with_scores()` to show confidence
- Add **paper comparison**: load two vectorstores and diff the gaps
- Plug in **OpenAI / Anthropic API** by replacing the HuggingFace pipeline
