from langchain_ollama import OllamaLLM


llm = OllamaLLM(
    model="llama3"
)


def summary_agent(state):

    print("📝 Summarizing papers...")


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


        response = llm.invoke(prompt)


        summaries.append(
            {
                "title": doc["title"],
                "summary": response
            }
        )


    state["summaries"] = summaries


    return state