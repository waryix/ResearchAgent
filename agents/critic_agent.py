from langchain_ollama import OllamaLLM


llm = OllamaLLM(
    model="llama3"
)



def critic_agent(state):

    print("🧐 Critically reviewing research...")


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

{state["insights"]}


Return a critical review.

"""


    response = llm.invoke(
        prompt
    )


    state["critique"] = response


    return state