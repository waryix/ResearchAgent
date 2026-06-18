import arxiv


def search_papers(topic):

    client = arxiv.Client(
        page_size=5,
        delay_seconds=3,
        num_retries=3
    )


    search = arxiv.Search(
        query=topic,
        max_results=5
    )


    papers = []


    for result in client.results(search):

        papers.append(
            {
                "title": result.title,
                "summary": result.summary,
                "pdf": result.pdf_url
            }
        )


    return papers