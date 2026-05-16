import chromadb

from sentence_transformers import (
    SentenceTransformer
)

from app.core.config import CHROMA_PATH

# Embedding Model
model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)

# ChromaDB Client
client = chromadb.PersistentClient(
    path=str(CHROMA_PATH)
)

# Collection
collection = client.get_or_create_collection(
    name="ml_knowledge"
)


def retrieve_context(
    query: str,
    top_k: int = 2
):
    """
    Retrieve semantically relevant
    context chunks from ChromaDB.
    """

    # Generate query embedding
    embedding = model.encode(
        query
    ).tolist()

    # Query vector database
    results = collection.query(
        query_embeddings=[embedding],
        n_results=top_k
    )

    documents = results["documents"][0]

    # Trim large chunks
    trimmed_documents = []

    for doc in documents:

        trimmed_documents.append(
            doc[:500]
        )

    return trimmed_documents
