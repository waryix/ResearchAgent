from tools.arxiv_search import search_papers


def search_agent(state):

    print("🔎 Searching papers...")


    papers = search_papers(
        state["topic"]
    )


    state["papers"] = papers


    return state