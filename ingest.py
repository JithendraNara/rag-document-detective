import os
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone, ServerlessSpec

# 1. SETUP: Load API keys from .env file
load_dotenv()
INDEX_NAME = "doc-chat"

def ensure_index_exists():
    """Create Pinecone index if it doesn't exist."""
    pc = Pinecone(api_key=os.environ.get("PINECONE_API_KEY"))
    
    # Check if index already exists
    existing_indexes = [index.name for index in pc.list_indexes()]
    
    if INDEX_NAME not in existing_indexes:
        print(f"📦 Creating Pinecone index '{INDEX_NAME}'...")
        pc.create_index(
            name=INDEX_NAME,
            dimension=1536,  # text-embedding-3-small dimensions
            metric="cosine",
            spec=ServerlessSpec(
                cloud="aws",
                region="us-east-1"
            )
        )
        print(f"✅ Index '{INDEX_NAME}' created successfully!")
    else:
        print(f"✅ Index '{INDEX_NAME}' already exists.")

def ingest_pdf(file_path):
    print(f"📄 Loading {file_path}...")
    
    # 2. LOAD: Read the PDF
    loader = PyPDFLoader(file_path)
    raw_docs = loader.load()
    
    # 3. SPLIT: Break text into 1000-character chunks with overlap
    # Overlap helps keep context if a sentence is cut in the middle
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000, 
        chunk_overlap=200
    )
    documents = text_splitter.split_documents(raw_docs)
    print(f"✂️  Split into {len(documents)} chunks.")

    # 4. EMBED & STORE: Turn text into numbers and upload to Pinecone
    print("🚀 Uploading to Pinecone (this may take a moment)...")
    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
    
    PineconeVectorStore.from_documents(
        documents, 
        embeddings, 
        index_name=INDEX_NAME
    )
    print("✅ Success! Your PDF is now searchable.")

# Run it!
if __name__ == "__main__":
    ensure_index_exists()
    
    # Define the directory containing PDFs
    pdf_directory = "./documents"
    
    # Check if directory exists
    if os.path.exists(pdf_directory):
        # Loop through all files in the directory
        for filename in os.listdir(pdf_directory):
            if filename.endswith(".pdf"):
                file_path = os.path.join(pdf_directory, filename)
                ingest_pdf(file_path)
    else:
        print(f"Directory '{pdf_directory}' not found. Please create it and add your PDFs.")
