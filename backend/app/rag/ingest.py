import fitz
import chromadb

from sentence_transformers import SentenceTransformer

from app.core.config import CHROMA_PATH

model = SentenceTransformer("all-MiniLM-L6-v2")

client = chromadb.PersistentClient(
    path=str(CHROMA_PATH)
)

collection = client.get_or_create_collection(
    name="ml_knowledge"
)

def extract_text(pdf_path):
    text = ""

    doc = fitz.open(pdf_path)

    for page in doc:
        text += page.get_text()

    return text


def chunk_text(text, chunk_size=500):
    chunks = []

    for i in range(0, len(text), chunk_size):
        chunks.append(text[i:i + chunk_size])

    return chunks


def ingest_document(pdf_path):
    text = extract_text(pdf_path)

    chunks = chunk_text(text)

    for idx, chunk in enumerate(chunks):
        embedding = model.encode(chunk).tolist()

        collection.add(
            documents=[chunk],
            embeddings=[embedding],
            ids=[f"{pdf_path}_{idx}"]
        )

    print(f"Ingested {len(chunks)} chunks")
