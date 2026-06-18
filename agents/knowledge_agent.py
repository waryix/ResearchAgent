from rag.chunker import split_text
from rag.vectorstore import store_chunks



def knowledge_agent(state):

    print("🧠 Building knowledge base...")


    all_chunks=[]


    for doc in state["documents"]:

        chunks = split_text(
            doc["text"]
        )

        all_chunks.extend(chunks)



    store_chunks(
        all_chunks
    )


    state["chunks"] = all_chunks


    return state