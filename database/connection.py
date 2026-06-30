import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base


load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL is None:
    raise ValueError("DATABASE_URL environment variable is not set. Please set it to 'postgresql://user:password@localhost/dbname'.")

print("DB URL:", DATABASE_URL)

try:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True
    )
except Exception as e:
    raise ConnectionError(f"Failed to connect to the database: {e}")


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


Base = declarative_base()