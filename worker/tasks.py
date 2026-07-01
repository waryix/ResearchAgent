import os
from worker.celery_app import celery_app
from graph.workflow import research_graph
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import json

load_dotenv()


def get_engine():
    return create_engine(os.getenv("DATABASE_URL"), connect_args={"sslmode": "require"})


@celery_app.task(name="worker.tasks.run_research")
def run_research(topic, user_id=None):
    job_id = run_research.request.id
    engine = get_engine()

    with engine.connect() as conn:
        conn.execute(
            text("INSERT INTO research_jobs (job_id, topic, status, user_id) VALUES (:job_id, :topic, :status, :user_id)"),
            {"job_id": job_id, "topic": topic, "status": "running", "user_id": user_id}
        )
        conn.commit()

    try:
        result = research_graph.invoke({
            "topic": topic,
            "papers": [],
            "documents": [],
            "summaries": [],
            "insights": "",
            "critique": ""
        })

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
