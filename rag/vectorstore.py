import chromadb



client = chromadb.PersistentClient(
    path="./research_db"
)


collection = client.get_or_create_collection(
    name="papers"
)



def store_chunks(chunks):

    ids=[]


    for i in range(len(chunks)):
        ids.append(str(i))



    collection.add(
        documents=chunks,
        ids=ids
    )


def search_papers(query):

    result = collection.query(
        query_texts=[query],
        n_results=3
    )


    return result