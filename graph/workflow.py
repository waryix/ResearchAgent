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



workflow = StateGraph(ResearchState)


# Add all nodes first

workflow.add_node(
    "search",
    search_agent
)

workflow.add_node(
    "pdf",
    pdf_agent
)

workflow.add_node(
    "knowledge",
    knowledge_agent
)

workflow.add_node(
    "summary",
    summary_agent
)

workflow.add_node(
    "insight",
    insight_agent
)

workflow.add_node(
    "critic",
    critic_agent
)

# Flow

workflow.set_entry_point(
    "search"
)


workflow.add_edge(
    "search",
    "pdf"
)


workflow.add_edge(
    "pdf",
    "knowledge"
)


workflow.add_edge(
    "knowledge",
    "summary"
)

workflow.add_edge(
    "summary",
    "insight"
)


workflow.add_edge(
    "insight",
    "critic"
)


workflow.set_finish_point(
    "critic"
)


research_graph = workflow.compile()