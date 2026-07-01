import os
import httpx
import json
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from celery.result import AsyncResult
from worker.celery_app import celery_app
from worker.tasks import run_research
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Research Agent API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")


def get_engine():
    return create_engine(os.getenv("DATABASE_URL"), connect_args={"sslmode": "require"})


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{SUPABASE_URL}/auth/v1/user",
            headers={
                "Authorization": f"Bearer {token}",
                "apikey": SUPABASE_ANON_KEY
            }
        )
    if response.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return response.json()


class ResearchRequest(BaseModel):
    topic: str


@app.get("/")
def home():
    return {"status": "Research Agent running"}


@app.post("/research")
async def research(request: ResearchRequest, user=Depends(get_current_user)):
    job = run_research.delay(request.topic, user["id"])
    return {"job_id": job.id, "status": "Research started"}


@app.get("/status/{job_id}")
async def status(job_id: str, user=Depends(get_current_user)):
    engine = get_engine()
    with engine.connect() as conn:
        row = conn.execute(
            text("SELECT status, result FROM research_jobs WHERE job_id = :job_id AND user_id = :uid"),
            {"job_id": job_id, "uid": user["id"]}
        ).fetchone()

    if not row:
        celery_job = AsyncResult(job_id, app=celery_app)
        return {"job_id": job_id, "status": celery_job.status, "result": None}

    result = json.loads(row.result) if row.result else None
    celery_status = "SUCCESS" if row.status == "done" else "PENDING" if row.status == "running" else "FAILURE"
    return {"job_id": job_id, "status": celery_status, "result": result}


@app.get("/jobs")
async def get_jobs(user=Depends(get_current_user)):
    engine = get_engine()
    with engine.connect() as conn:
        result = conn.execute(
            text("SELECT job_id, topic, status, created_at FROM research_jobs WHERE user_id = :uid ORDER BY created_at DESC"),
            {"uid": user["id"]}
        )
        rows = result.fetchall()
    return {"jobs": [dict(r._mapping) for r in rows]}
