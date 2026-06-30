from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import declarative_base


Base = declarative_base()


class ResearchJob(Base):

    __tablename__ = "research_jobs"


    id = Column(
        Integer,
        primary_key=True
    )


    job_id = Column(
        String,
        unique=True
    )


    topic = Column(
        String
    )


    status = Column(
        String
    )


    result = Column(
        Text
    )