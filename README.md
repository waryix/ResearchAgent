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

### Start Redis

```bash
docker run -d -p 6379:6379 redis

Start Celery Worker

Windows:

celery -A worker.celery_app worker --loglevel=info --pool=solo
Start API
uvicorn api.server:app --reload

API docs:

http://127.0.0.1:8000/docs

Project Status

Version 1:

Backend pipeline complete
Async agent execution working
Local LLM integration complete