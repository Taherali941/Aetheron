import os
import uuid
import shutil
from pathlib import Path
from typing import List

from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

from src.loader import load_pdfs_from_directory
from src.chunker import chunk_documents
from src.embeddings import build_vectorstore
from src.agents.research import ResearchAgent

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")

app = FastAPI(title="AI Research Assistant", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

sessions: dict[str, ResearchAgent] = {}

UPLOADS_DIR = Path("uploads")
UPLOADS_DIR.mkdir(exist_ok=True)


class QueryRequest(BaseModel):
    session_id: str
    question: str


class SessionRequest(BaseModel):
    session_id: str


class IdeasRequest(BaseModel):
    session_id: str
    topic: str


def get_agent(session_id: str) -> ResearchAgent:
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id is required")
    agent = sessions.get(session_id)
    if not agent:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found")
    return agent


@app.post("/debug-upload")
async def debug_upload(request: Request):
    from starlette.datastructures import UploadFile as StarletteUploadFile
    content_type = request.headers.get("content-type", "")
    form = await request.form()
    result = {
        "content_type": content_type,
        "form_keys": list(form.keys()),
        "form_items": []
    }
    for key, value in form.multi_items():
        result["form_items"].append({
            "key": key,
            "type": str(type(value)),
            "is_uploadfile": isinstance(value, StarletteUploadFile),
            "filename": getattr(value, "filename", None),
            "value_preview": str(value)[:100] if not isinstance(value, StarletteUploadFile) else "<<FILE>>"
        })
    return result


@app.post("/upload")
async def upload_files(request: Request):
    from starlette.datastructures import UploadFile as StarletteUploadFile
    import sys
    form = await request.form()
    all_items = list(form.multi_items())
    files = [v for _, v in all_items if isinstance(v, StarletteUploadFile)]

    print(f"[UPLOAD] total form items: {len(all_items)}", file=sys.stderr)
    print(f"[UPLOAD] UploadFile items found: {len(files)}", file=sys.stderr)
    for _, v in all_items:
        print(f"[UPLOAD] item type={type(v)} is_upload={isinstance(v, StarletteUploadFile)}", file=sys.stderr)

    if not files:
        raise HTTPException(status_code=400, detail=f"No valid PDF files received. Raw items: {[(k, str(type(v))) for k,v in all_items]}")

    session_id = str(uuid.uuid4())
    session_upload_dir = UPLOADS_DIR / session_id
    session_upload_dir.mkdir(parents=True, exist_ok=True)

    try:
        for file in files:
            if not file.filename.endswith(".pdf"):
                raise HTTPException(status_code=400, detail=f"File '{file.filename}' is not a PDF")
            file_path = session_upload_dir / file.filename
            with open(file_path, "wb") as f:
                content = await file.read()
                f.write(content)

        documents = load_pdfs_from_directory(str(session_upload_dir))
        print(f"[UPLOAD] documents loaded: {len(documents)}, type of first: {type(documents[0]) if documents else 'empty'}", file=__import__('sys').stderr)

        chunks = chunk_documents(documents)
        print(f"[UPLOAD] chunks created: {len(chunks)}, type of first: {type(chunks[0]) if chunks else 'empty'}", file=__import__('sys').stderr)

        vectorstore = build_vectorstore(chunks)
        print(f"[UPLOAD] vectorstore built: {type(vectorstore)}", file=__import__('sys').stderr)

        agent = ResearchAgent(vectorstore=vectorstore, api_key=DEEPSEEK_API_KEY)
        sessions[session_id] = agent

        return {
            "session_id": session_id,
            "message": f"Successfully processed {len(files)} file(s) and initialized research agent",
            "num_files": len(files),
        }

    except HTTPException:
        raise
    except Exception as e:
        shutil.rmtree(session_upload_dir, ignore_errors=True)
        raise HTTPException(status_code=500, detail=f"Failed to process files: {str(e)}")


@app.post("/query")
async def query(request: QueryRequest):
    if not request.session_id:
        raise HTTPException(status_code=400, detail="session_id is required")
    if not request.question or not request.question.strip():
        raise HTTPException(status_code=400, detail="question is required")

    agent = get_agent(request.session_id)

    try:
        result = agent.answer(request.question)

        if isinstance(result, dict):
            answer = result.get("answer", "")
            sources = result.get("sources", [])
        else:
            answer = str(result)
            sources = []

        if isinstance(sources, list):
            sources = list({Path(s).name if isinstance(s, str) else str(s) for s in sources})

        return {"answer": answer, "sources": sources}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process query: {str(e)}")


@app.post("/gaps")
async def get_gaps(request: SessionRequest):
    if not request.session_id:
        raise HTTPException(status_code=400, detail="session_id is required")

    agent = get_agent(request.session_id)

    try:
        gaps = agent.find_gaps()
        return {"gaps": gaps}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to identify research gaps: {str(e)}")


@app.post("/ideas")
async def get_ideas(request: IdeasRequest):
    if not request.session_id:
        raise HTTPException(status_code=400, detail="session_id is required")
    if not request.topic or not request.topic.strip():
        raise HTTPException(status_code=400, detail="topic is required")

    agent = get_agent(request.session_id)

    try:
        ideas = agent.generate_ideas(request.topic)
        return {"ideas": ideas, "topic": request.topic}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate ideas: {str(e)}")


@app.post("/summary")
async def get_summary(request: SessionRequest):
    if not request.session_id:
        raise HTTPException(status_code=400, detail="session_id is required")

    agent = get_agent(request.session_id)

    try:
        summary = agent.summarize()
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate summary: {str(e)}")


@app.get("/test", response_class=HTMLResponse)
async def test_ui():
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>AI Research Assistant - Test UI</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; background: #f5f5f5; }
            h1 { color: #333; }
            h2 { color: #555; margin-top: 30px; border-bottom: 1px solid #ddd; padding-bottom: 8px; }
            .card { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.1); }
            input, textarea { width: 100%; padding: 8px; margin: 6px 0 12px; box-sizing: border-box; border: 1px solid #ccc; border-radius: 4px; font-size: 14px; }
            button { background: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; }
            button:hover { background: #45a049; }
            pre { background: #1e1e1e; color: #d4d4d4; padding: 15px; border-radius: 6px; overflow-x: auto; font-size: 13px; white-space: pre-wrap; word-break: break-word; }
            label { font-weight: bold; font-size: 14px; color: #333; }
            .session-info { background: #e8f5e9; padding: 10px; border-radius: 4px; margin-bottom: 12px; font-size: 13px; color: #2e7d32; }
        </style>
    </head>
    <body>
        <h1>🔬 AI Research Assistant</h1>

        <!-- UPLOAD -->
        <div class="card">
            <h2>1. Upload PDFs</h2>
            <label>Select PDF files:</label>
            <input type="file" id="files" multiple accept=".pdf"/>
            <button onclick="upload()">Upload & Initialize</button>
            <button onclick="debugUpload()" style="background:#e67e22; margin-left:10px;">Debug Upload</button>
            <pre id="upload-out">Response will appear here...</pre>
        </div>

        <!-- QUERY -->
        <div class="card">
            <h2>2. Ask a Question</h2>
            <div class="session-info" id="session-display">No active session. Upload PDFs first.</div>
            <label>Question:</label>
            <input type="text" id="question" placeholder="e.g. What are the main findings?"/>
            <button onclick="query()">Ask</button>
            <pre id="query-out">Response will appear here...</pre>
        </div>

        <!-- SUMMARY -->
        <div class="card">
            <h2>3. Generate Summary</h2>
            <button onclick="summary()">Summarize</button>
            <pre id="summary-out">Response will appear here...</pre>
        </div>

        <!-- GAPS -->
        <div class="card">
            <h2>4. Find Research Gaps</h2>
            <button onclick="gaps()">Find Gaps</button>
            <pre id="gaps-out">Response will appear here...</pre>
        </div>

        <!-- IDEAS -->
        <div class="card">
            <h2>5. Generate Ideas</h2>
            <label>Topic:</label>
            <input type="text" id="topic" placeholder="e.g. transformer architectures"/>
            <button onclick="ideas()">Generate Ideas</button>
            <pre id="ideas-out">Response will appear here...</pre>
        </div>

        <script>
            let sessionId = null;

            async function debugUpload() {
                const fileInput = document.getElementById('files');
                if (!fileInput.files.length) { alert('Select a file first.'); return; }
                const form = new FormData();
                for (const f of fileInput.files) form.append('files', f);
                document.getElementById('upload-out').textContent = 'Debugging...';
                try {
                    const res = await fetch('/debug-upload', { method: 'POST', body: form });
                    const data = await res.json();
                    document.getElementById('upload-out').textContent = JSON.stringify(data, null, 2);
                } catch (e) {
                    document.getElementById('upload-out').textContent = 'Error: ' + e.message;
                }
            }

            async function upload() {
                const fileInput = document.getElementById('files');
                if (!fileInput.files.length) {
                    alert('Please select at least one PDF file.');
                    return;
                }
                const form = new FormData();
                for (const f of fileInput.files) form.append('files', f);
                document.getElementById('upload-out').textContent = 'Uploading...';
                try {
                    const res = await fetch('/upload', { method: 'POST', body: form });
                    const data = await res.json();
                    document.getElementById('upload-out').textContent = JSON.stringify(data, null, 2);
                    if (data.session_id) {
                        sessionId = data.session_id;
                        document.getElementById('session-display').textContent = '✅ Active session: ' + sessionId;
                    }
                } catch (e) {
                    document.getElementById('upload-out').textContent = 'Error: ' + e.message;
                }
            }

            async function postJSON(endpoint, body, outputId) {
                if (!sessionId) { alert('Upload PDFs first to get a session.'); return; }
                document.getElementById(outputId).textContent = 'Loading...';
                try {
                    const res = await fetch(endpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(body)
                    });
                    const data = await res.json();
                    document.getElementById(outputId).textContent = JSON.stringify(data, null, 2);
                } catch (e) {
                    document.getElementById(outputId).textContent = 'Error: ' + e.message;
                }
            }

            function query() {
                const q = document.getElementById('question').value.trim();
                if (!q) { alert('Enter a question.'); return; }
                postJSON('/query', { session_id: sessionId, question: q }, 'query-out');
            }

            function summary() { postJSON('/summary', { session_id: sessionId }, 'summary-out'); }
            function gaps()    { postJSON('/gaps',    { session_id: sessionId }, 'gaps-out'); }
            function ideas() {
                const t = document.getElementById('topic').value.trim();
                if (!t) { alert('Enter a topic.'); return; }
                postJSON('/ideas', { session_id: sessionId, topic: t }, 'ideas-out');
            }
        </script>
    </body>
    </html>
    """


@app.get("/health")
async def health_check():
    return {"status": "healthy", "active_sessions": len(sessions)}


@app.delete("/session/{session_id}")
async def delete_session(session_id: str):
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found")

    del sessions[session_id]

    session_upload_dir = UPLOADS_DIR / session_id
    shutil.rmtree(session_upload_dir, ignore_errors=True)

    return {"message": f"Session '{session_id}' deleted successfully"}