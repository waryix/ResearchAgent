from graph.workflow import research_graph


result = research_graph.invoke(
    {
        "topic":
        "Adaptive autoencoders for concept drift detection",

        "papers": [],
        "documents": [],
        "summaries": [],
        "insights": "",
        "critique": ""
    }
)


print("\n\n========== PAPER SUMMARIES ==========\n")

for item in result["summaries"]:

    print("\n====================")
    print(item["title"])
    print("====================")

    print(item["summary"])



print("\n\n========== RESEARCH INSIGHTS ==========\n")

print(result["insights"])


print("\n\n========== CRITIC REVIEW ==========\n")

print(result["critique"])