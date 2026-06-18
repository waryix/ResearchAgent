from worker.celery_app import celery_app

from graph.workflow import research_graph



@celery_app.task(name="worker.tasks.run_research")
def run_research(topic):

    result = research_graph.invoke(
        {
            "topic": topic,

            "papers": [],
            "documents": [],

            "summaries": [],

            "insights": "",

            "critique": ""
        }
    )


    return {
        "summaries": result["summaries"],
        "insights": result["insights"],
        "critique": result["critique"]
    }