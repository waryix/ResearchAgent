import requests
import fitz
import tempfile



def extract_pdf_text(url):

    response = requests.get(url)


    with tempfile.NamedTemporaryFile(
        suffix=".pdf",
        delete=False
    ) as file:

        file.write(response.content)

        path = file.name



    doc = fitz.open(path)


    text = ""


    for page in doc:

        text += page.get_text()



    return text