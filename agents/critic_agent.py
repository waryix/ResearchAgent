import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def critic_agent(state):
    print("Critically reviewing research...")
    prompt = f"""
You are a strict academic reviewer.
Review this proposed research analysis.
Find:
1. Possible weaknesses
2. Missing experiments
3. Novelty concerns
4. Risks
5. How to improve the research idea

Research analysis:
{state['insights']}

Return a critical review.
"""
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}]
    )
    state["critique"] = response.choices[0].message.content
    return state
