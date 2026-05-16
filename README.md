# AI Interviewer Platform

AI Interviewer Platform is a full-stack candidate screening app that combines resume parsing, retrieval-augmented generation, technical interview creation, and AI answer evaluation.

It uses a Next.js frontend, a FastAPI backend, OpenRouter for LLM calls, ChromaDB for retrieval, and Sentence Transformers for semantic search.

## Features

- Upload a PDF resume and extract technical skills, projects, and candidate context.
- Generate role-aware interview questions aligned with the candidate profile.
- Keep question generation grounded with a lightweight RAG pipeline.
- Evaluate candidate answers with structured AI feedback.
- Review interview output in a polished frontend workflow built for demos and portfolio presentation.

## Stack

### Frontend

- Next.js 16
- React 19
- Tailwind CSS
- Axios
- React Markdown

### Backend

- FastAPI
- Uvicorn
- OpenAI SDK with OpenRouter
- ChromaDB
- Sentence Transformers
- PyMuPDF

## Architecture

1. The frontend uploads a resume and sends it to the FastAPI backend.
2. The backend extracts text, detects skills, and parses project context.
3. The question generator chooses a coherent interview track from the candidate profile.
4. ChromaDB retrieval supplies supporting technical context where needed.
5. The frontend renders questions, accepts answers, and calls the evaluator.
6. The evaluator returns a structured score, strengths, weaknesses, and improvement guidance.

## Project Structure

```text
ai-interviewer/
|-- backend/
|   |-- app/
|   |   |-- api/routes/
|   |   |-- core/
|   |   |-- rag/
|   |   `-- services/
|   |-- chroma_db/
|   |-- knowledge_base/
|   |-- uploads/
|   |-- Dockerfile
|   `-- requirements.txt
|-- frontend/
|   |-- app/
|   |-- components/
|   |-- public/
|   |-- services/
|   `-- Dockerfile
|-- docker-compose.yml
`-- README.md
```

## Environment Variables

### Backend

Create `backend/.env` from `backend/.env.example`.

```env
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
CHROMA_PATH=/app/chroma_db
UPLOAD_DIR=/app/uploads
KNOWLEDGE_BASE_DIR=/app/knowledge_base
```

### Frontend

Optional local override in `frontend/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

## Local Development

### 1. Backend

From `backend/`:

```powershell
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend runs at [http://localhost:8000](http://localhost:8000).

### 2. Frontend

From `frontend/`:

```powershell
npm install
npm run dev
```

Frontend runs at [http://localhost:3000](http://localhost:3000).

## Docker Setup

### 1. Prepare env file

Create `backend/.env` from `backend/.env.example` and add your OpenRouter key.

### 2. Build and run

From the repo root:

```powershell
docker compose up --build
```

The services will be available at:

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:8000](http://localhost:8000)

### 3. Stop containers

```powershell
docker compose down
```

## API Endpoints

### Health

- `GET /`
- `GET /health`

### Resume Upload

- `POST /api/upload`

### Interview Generation

- `POST /api/generate-questions`

### Answer Evaluation

- `POST /api/evaluate`

## Notes

- Uploaded files are stored in `backend/uploads`.
- ChromaDB data persists in `backend/chroma_db`.
- Docker Compose mounts `uploads`, `knowledge_base`, and `chroma_db` so data survives container restarts.
- The frontend API base URL is configurable through `NEXT_PUBLIC_API_BASE_URL`.

## Portfolio Highlights

This project demonstrates:

- Full-stack AI engineering
- RAG architecture and semantic retrieval
- LLM integration through OpenRouter
- FastAPI backend design
- Next.js frontend implementation
- Structured AI evaluation workflows
- Production-style debugging and UX iteration

## Next Improvements

- Add authentication and interview history
- Add scoring dashboards and admin views
- Improve RAG ingestion coverage for custom domain knowledge
- Support voice interviews and richer candidate analytics
