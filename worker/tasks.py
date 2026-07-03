import os
import json
import fitz
import requests
import tempfile
from worker.celery_app import celery_app
from graph.workflow import research_graph
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")


def get_engine():
    return create_engine(os.getenv("DATABASE_URL"), connect_args={"sslmode": "require"})


def extract_text_from_supabase_pdf(path):
    from supabase import create_client
    sb = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    res = sb.storage.from_("research-pdfs").download(path)
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as f:
        f.write(res)
        tmp_path = f.name
    doc = fitz.open(tmp_path)
    text = ""
    for page in doc:
        text += page.get_text()
    return text


@celery_app.task(name="worker.tasks.run_research")
def run_research(topic, user_id=None, pdf_paths=None):
    job_id = run_research.request.id
    engine = get_engine()

    with engine.connect() as conn:
        conn.execute(
            text("INSERT INTO research_jobs (job_id, topic, status, user_id) VALUES (:job_id, :topic, :status, :user_id)"),
            {"job_id": job_id, "topic": topic, "status": "running", "user_id": user_id}
        )
        conn.commit()

    try:
        initial_state = {
            "topic": topic,
            "papers": [],
            "documents": [],
            "summaries": [],
            "insights": "",
            "critique": ""
        }

        if pdf_paths:
            print(f"Processing {len(pdf_paths)} uploaded PDFs...")
            documents = []
            for path in pdf_paths:
                filename = path.split("/")[-1].replace(".pdf", "")
                text = extract_text_from_supabase_pdf(path)
                documents.append({"title": filename, "text": text})
            initial_state["documents"] = documents
            initial_state["papers"] = [{"title": d["title"], "pdf": None} for d in documents]

        result = research_graph.invoke(initial_state)

        output = {
            "summaries": result["summaries"],
            "insights": result["insights"],
            "critique": result["critique"]
        }

        with engine.connect() as conn:
            conn.execute(
                text("UPDATE research_jobs SET status = 'done', result = :result WHERE job_id = :job_id"),
                {"result": json.dumps(output), "job_id": job_id}
            )
            conn.commit()

        return output

    except Exception as e:
        with engine.connect() as conn:
            conn.execute(
                text("UPDATE research_jobs SET status = 'failed' WHERE job_id = :job_id"),
                {"job_id": job_id}
            )
            conn.commit()
        raise e
