from langchain_ollama import OllamaLLM


llm = OllamaLLM(
    model="llama3"
)



def insight_agent(state):

    print("💡 Finding research insights...")


    summaries_text = ""


    for paper in state["summaries"]:

        summaries_text += f"""

Paper:
{paper["title"]}

Summary:
{paper["summary"]}


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


    response = llm.invoke(
        prompt
    )


    state["insights"] = response


    return state