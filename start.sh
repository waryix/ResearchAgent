#!/bin/bash
# Start Celery worker in background
celery -A worker.celery_app worker --loglevel=info --concurrency=1 &

# Start FastAPI
uvicorn api.server:app --host 0.0.0.0 --port $PORT
