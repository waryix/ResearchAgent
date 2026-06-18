# AI Research Assistant Agent

An autonomous AI research assistant that searches papers, reads PDFs, builds a knowledge base, summarizes research, and generates insights.

## Features

- 🔎 Research paper search using arXiv
- 📄 PDF extraction and processing
- 🧠 RAG-based knowledge base
- 📝 AI-generated paper summaries
- 💡 Research gap and insight generation
- 🧐 Critic agent for challenging findings
- ⚙️ Async processing with Celery + Redis
- 🚀 FastAPI backend
- 🦙 Local LLM support using Ollama

## Architecture

User
|
v
FastAPI
|
v
Celery + Redis
|
v
LangGraph Workflow
|
+--> Search Agent
|
+--> PDF Reader Agent
|
+--> Knowledge Agent
|
+--> Summary Agent
|
+--> Insight Agent
|
+--> Critic Agent
|
v
Research Report



## Tech Stack

- Python
- LangGraph
- FastAPI
- Celery
- Redis
- Ollama
- FAISS / Chroma
- arXiv API

## Run Locally
# Running the Project

## Prerequisites

Make sure you have installed:

- Python 3.10+
- Docker
- Redis (through Docker)
- Ollama
- Node.js (for frontend)

---

# Backend Setup

Clone the repository:

```bash
git clone https://github.com/waryix/ResearchGuru.git

cd ResearchGuru

Create Virtual Environment

Windows (PowerShell):

python -m venv venv
.\venv\Scripts\activate

Linux / macOS:

python3 -m venv venv
source venv/bin/activate

#Install dependencies:

pip install -r requirements.txt

Start Redis

Redis is used as the message broker for Celery.

Using Docker (Recommended)
Windows / Linux / macOS

First time:

docker run -d \
--name research-redis \
-p 6379:6379 \
redis

Check Redis:

docker ps

Test Redis connection:

docker exec -it research-redis redis-cli ping

Expected:

PONG

If the container already exists:

docker start research-redis


#Start Ollama

Check installed models:

ollama list

Start Ollama server:

ollama serve

The application connects to:

http://127.0.0.1:11434


#Start Celery Worker
Celery handles asynchronous research jobs.

Windows

Run worker:
celery -A worker.celery_app worker --loglevel=info --pool=solo

Linux / macOS

Run worker:
celery -A worker.celery_app worker --loglevel=info

Expected output:

[tasks]
. worker.tasks.run_research
celery@machine ready

#Start FastAPI Backend

Windows
.\venv\Scripts\activate
uvicorn api.server:app --reload

Linux / macOS
source venv/bin/activate
uvicorn api.server:app --reload

API will run at:
http://127.0.0.1:8000

Swagger documentation:
http://127.0.0.1:8000/docs

#Run a Research Task

Open Swagger:

http://127.0.0.1:8000/docs

Use:

POST /research

Example:

{
  "topic": "adaptive autoencoders for concept drift detection"
}

Response:

{
  "job_id": "xxxx-xxxx",
  "status": "Research started"
}

Check status:

GET /status/{job_id}

Example response:

{
  "job_id": "xxxx",
  "status": "SUCCESS",
  "result": {
      "summaries": [],
      "insights": "",
      "critique": ""
    }
}


#Complete Startup Order

Start services in this order:

Redis
docker start research-redis
Ollama
ollama serve
Celery Worker
celery -A worker.celery_app worker --loglevel=info --pool=solo
FastAPI
uvicorn api.server:app --reload
Stopping Services

Stop FastAPI:

CTRL + C

Stop Celery:

CTRL + C

Stop Redis:

docker stop research-redis


Project Status

Version 1:

Backend pipeline complete
Async agent execution working
Local LLM integration complete