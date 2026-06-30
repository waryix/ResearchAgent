from graph.workflow import research_graph


def run_research(topic):
    print("Starting research on: " + topic)
    result = research_graph.invoke({
        "topic": topic,
        "papers": [],
        "documents": [],
        "summaries": [],
        "insights": "",
        "critique": ""
    })
    return {
        "summaries": result["summaries"],
        "insights": result["insights"],
        "critique": result["critique"]
    }
