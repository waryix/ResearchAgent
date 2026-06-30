import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def summary_agent(state):
    print("Summarizing papers...")
    summaries = []
    for doc in state["documents"]:
        prompt = f"""
You are a scientific research assistant.
Read this paper and produce a concise structured summary.
Return ONLY this format:

## Problem
(one or two sentences)

## Dataset
(dataset names only)

## Methodology
(3-5 bullet points)

## Results
(key numbers only)

## Limitations
(2-3 bullets)

## Future Work
(2-3 bullets)

Paper:
{doc['text'][:4000]}
"""
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}]
        )
        summaries.append({"title": doc["title"], "summary": response.choices[0].message.content})
    state["summaries"] = summaries
    return state
