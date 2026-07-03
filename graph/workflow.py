from typing import TypedDict, List
from langgraph.graph import StateGraph
from agents.search_agent import search_agent
from agents.pdf_agent import pdf_agent
from agents.knowledge_agent import knowledge_agent
from agents.summary_agent import summary_agent
from agents.insight_agent import insight_agent
from agents.critic_agent import critic_agent


class ResearchState(TypedDict):
    topic: str
    papers: List
    documents: List
    summaries: List
    insights: str
    critique: str


def smart_pdf_agent(state):
    if state.get("documents"):
        print("Skipping PDF fetch - using uploaded documents")
        return state
    return pdf_agent(state)


def smart_search_agent(state):
    if state.get("documents"):
        print("Skipping arxiv search - using uploaded documents")
        return state
    return search_agent(state)


workflow = StateGraph(ResearchState)

workflow.add_node("search", smart_search_agent)
workflow.add_node("pdf", smart_pdf_agent)
workflow.add_node("knowledge", knowledge_agent)
workflow.add_node("summary", summary_agent)
workflow.add_node("insight", insight_agent)
workflow.add_node("critic", critic_agent)

workflow.set_entry_point("search")
workflow.add_edge("search", "pdf")
workflow.add_edge("pdf", "knowledge")
workflow.add_edge("knowledge", "summary")
workflow.add_edge("summary", "insight")
workflow.add_edge("insight", "critic")
workflow.set_finish_point("critic")

research_graph = workflow.compile()
