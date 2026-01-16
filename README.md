# 🕵️ Private Document Detective (RAG Pipeline)

A **Retrieval-Augmented Generation (RAG)** application that allows users to perform semantic search over private PDF documents.

Unlike standard chatbots, this system "grounds" the AI's responses in specific, user-provided data, reducing hallucinations and enabling queries over domain-specific knowledge (contracts, manuals, research papers).

🔗 **Live Demo:** [Deployed on Vercel](https://rag-document-detective.vercel.app)

---

## 🏗️ Architecture

The system consists of two distinct pipelines:

### 1. Ingestion Pipeline (Python/LangChain)
* Loads raw PDF data from the `documents/` folder
* Chunks text into manageable segments (1000 characters) with 200-character overlap to preserve context
* Generates vector embeddings using `text-embedding-3-small`
* Upserts vectors to **Pinecone** (Serverless)

### 2. Retrieval Pipeline (Next.js/Vercel AI SDK)
* Converts user queries into vector embeddings
* Performs a semantic similarity search in Pinecone to retrieve the top 3 relevant chunks
* Injects these chunks as "System Context" into the LLM (GPT-4o-mini)
* Streams the response back to the user in real-time

```
┌─────────────────────────────────────────────────────────────────┐
│                     INGESTION PIPELINE                          │
│  PDF → Chunking → Embeddings → Pinecone Vector DB               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     RETRIEVAL PIPELINE                          │
│  User Query → Embedding → Pinecone Search → Context + LLM → Response │
└─────────────────────────────────────────────────────────────────┘
```

---

## 💡 Engineering Decisions: Why not just use ChatGPT?

A common question is: *"Why build this app when I can just upload a file to ChatGPT?"*

This system addresses specific **Enterprise constraints** that consumer tools cannot:

| Challenge | ChatGPT | This System |
|-----------|---------|-------------|
| **Scale** | ~128K token context limit | ✅ Handles infinite documents - retrieves only relevant chunks |
| **Cost** | Expensive (entire document in prompt) | ✅ ~95% cheaper - only sends 3 relevant paragraphs |
| **Data Freshness** | Manual re-uploads required | ✅ Programmatic real-time updates |
| **Embeddability** | Locked to ChatGPT interface | ✅ API-first, embed anywhere |
| **Privacy** | Data goes to OpenAI | ✅ Control over data flow |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16 (App Router), React 19, Tailwind CSS 4 |
| **AI Orchestration** | Vercel AI SDK v6 (streaming responses) |
| **Vector Database** | Pinecone (Serverless) |
| **LLM** | OpenAI GPT-4o-mini (cost-optimized) |
| **Embeddings** | OpenAI text-embedding-3-small |
| **Ingestion** | Python, LangChain, PyPDF |
| **Deployment** | Vercel |

---

## 🚀 Getting Started

### Prerequisites
* Node.js 18+
* Python 3.10+
* API Keys: [OpenAI](https://platform.openai.com/api-keys), [Pinecone](https://app.pinecone.io/)

### 1. Clone the Repository

```bash
git clone https://github.com/JithendraNara/rag-document-detective.git
cd rag-document-detective
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
OPENAI_API_KEY=sk-your-openai-api-key
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_INDEX_NAME=doc-chat
```

### 3. Ingest Documents (Python)

Before running the app, populate the vector database with your documents:

```bash
# Place your PDF files in the documents/ folder
mkdir -p documents
cp your-file.pdf documents/

# Install Python dependencies
pip install -r requirements.txt

# Run the ingestion script
python ingest.py
```

The script will:
- Create a Pinecone index if it doesn't exist
- Process all PDFs in the `documents/` folder
- Chunk, embed, and upload to Pinecone

### 4. Run the Web App

```bash
# Install Node.js dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start chatting with your documents!

---

## 📁 Project Structure

```
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts      # Chat API - retrieval + LLM
│   ├── admin/
│   │   └── page.tsx          # Admin page with ingestion instructions
│   ├── page.tsx              # Main chat interface
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── documents/                 # Place PDFs here for ingestion
├── ingest.py                  # Python ingestion script
├── requirements.txt           # Python dependencies
├── package.json              # Node.js dependencies
└── README.md
```

---

## 🔧 Configuration

### Chunk Settings (ingest.py)
```python
chunk_size = 1000      # Characters per chunk
chunk_overlap = 200    # Overlap between chunks
```

### Retrieval Settings (app/api/chat/route.ts)
```typescript
topK: 3                // Number of chunks to retrieve
model: 'gpt-4o-mini'   // LLM model (cost-optimized)
```

---

## 💰 Cost Optimization

This app is configured for **minimal costs**:

| Component | Model | Cost |
|-----------|-------|------|
| Chat | `gpt-4o-mini` | $0.15/1M input, $0.60/1M output |
| Embeddings | `text-embedding-3-small` | $0.02/1M tokens |
| Vector DB | Pinecone Serverless | Free tier available |

Estimated cost: **< $0.01 per conversation** for typical usage.

---

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard:
   - `OPENAI_API_KEY`
   - `PINECONE_API_KEY`
   - `PINECONE_INDEX_NAME`
4. Deploy!

> **Note:** Document ingestion must be done locally using the Python script. The web app handles chat/retrieval only.

---

## 📝 License

MIT License - feel free to use this for your own projects!

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

Built with ❤️ using Next.js, Vercel AI SDK, and Pinecone
