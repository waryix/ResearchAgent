import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def insight_agent(state):
    print("Finding research insights...")
    summaries_text = ""
    for paper in state["summaries"]:
        summaries_text += f"""
Paper: {paper['title']}
Summary: {paper['summary']}
"""
    prompt = f"""
You are an expert research scientist.
Compare these research papers.
Find:
1. Common approaches
2. Important trends
3. Weaknesses in existing work
4. Research gaps
5. Possible novel research directions

Papers:
{summaries_text}

Return a structured research analysis.
"""
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}]
    )
    state["insights"] = response.choices[0].message.content
    return state
