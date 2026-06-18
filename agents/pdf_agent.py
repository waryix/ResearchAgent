from tools.pdf_reader import extract_pdf_text



def pdf_agent(state):

    print("📄 Reading PDFs...")


    documents=[]


    for paper in state["papers"]:

        text = extract_pdf_text(
            paper["pdf"]
        )


        documents.append(
            {
                "title": paper["title"],
                "text": text
            }
        )


    state["documents"] = documents


    return state