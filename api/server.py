from fastapi import FastAPI
from pydantic import BaseModel

from celery.result import AsyncResult
from worker.celery_app import celery_app
from worker.tasks import run_research


app = FastAPI(
    title="Research Agent API",
    version="1.0"
)


class ResearchRequest(BaseModel):

    topic: str



@app.get("/")
def home():

    return {
        "status": "Research Agent running"
    }



@app.post("/research")
def research(
    request: ResearchRequest
):

    job = run_research.delay(
        request.topic
    )


    return {

        "job_id": job.id,

        "status":
        "Research started"

    }



@app.get("/status/{job_id}")
def status(job_id: str):

    job = AsyncResult(job_id, app=celery_app)


    if job.ready():

        return {

            "job_id": job_id,

            "status": job.status,

            "result": job.result

        }


    return {

        "job_id": job_id,

        "status": job.status,

        "result": None

    }