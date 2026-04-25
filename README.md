# JobPortal — AI-Powered Job Matching

A modern job portal with AI-first job recommendations. This project combines a classic jobs CRUD platform with a hybrid vector search pipeline using Google Gemini for embeddings, Pinecone for vector storage, and a fallback lexical search for resilience.

**Highlights:**
- AI skill extraction from user profiles
- Job embeddings (title, description, requirements) stored in Pinecone
- Hybrid ranking: lexical match + vector similarity
- Real-time upserts on job create/update/delete
- Robust fallbacks and caching (Redis/in-memory)

---

**Tech Stack**
- **Backend:** Node.js, Express, Mongoose (MongoDB)
- **AI / Embeddings:** Google Gemini via `@google/genai` (text + embeddings)
- **Vector DB:** Pinecone via `@pinecone-database/pinecone`
- **Cache:** Redis with in-memory fallback (`backend/utils/redis.js`)
- **File uploads & images:** Multer middleware + ImageKit (`backend/utils/imagekit.js`)
- **Frontend:** React + Vite + Tailwind CSS (in `frontend/`)
- **Other:** JWT auth, cookie token, ImageKit uploads, ioredis optional

---

**Key Features**
- Account registration, login, profile update with resume/profile upload
- Recruiter flow: create/update/delete jobs, view applicants
- Student flow: browse, save, apply for jobs
- Saved jobs and applied jobs management
- AI features:
  - Profile skill extraction (`/profile/skills/extract`)
  - Personalized job recommendations (`/jobs/recommendations`)
  - Automatic job-vector upsert on job create/update

See API wiring in the routes: [backend/routes/user.route.js](backend/routes/user.route.js), [backend/routes/job.route.js](backend/routes/job.route.js).

---

**AI Job Suggestion — Full Flow (how it works)**

1. Skill extraction (profile → skills)
   - When a user requests skill suggestions, the controller invokes `extractSkillsFromProfileText` in [backend/services/ai.service.js](backend/services/ai.service.js).
   - That function calls Gemini text models (via `@google/genai`) to extract a compact JSON array of skills. If Gemini is unavailable or quota-limited, a deterministic fallback scanner (`COMMON_SKILLS`) is used.

2. Job indexing (create/update/delete job)
   - On job `POST`/`PUT` the backend calls `upsertJobVector(job)` (see [backend/controllers/job.controller.js](backend/controllers/job.controller.js)).
   - `upsertJobVector` builds a concise embedding text from job fields (title, description, requirements, type, location, company) and calls `createMemory` in [backend/services/memory.service.js](backend/services/memory.service.js).
   - `createMemory` uses `generateVector` from [backend/services/gemini.service.js](backend/services/gemini.service.js) to get a numeric vector, then writes that vector to Pinecone using [backend/services/pinecone.service.js](backend/services/pinecone.service.js).

3. Querying for recommendations
   - For recommendations, `getJobRecommendationsFromSkills` in [backend/services/ai.service.js](backend/services/ai.service.js) first expands and normalizes profile skills (aliases + MERN inference).
   - It then queries Pinecone with an embedding of the skills (`queryMemory` → `generateVector` → Pinecone query) in the `jobs` namespace.
   - Results return vector matches (with `score` and metadata). The service fetches full job documents from MongoDB for those IDs.

4. Hybrid ranking and robustness
   - Each job gets a vectorScore (from Pinecone) and a lexicalScore (computed by scanning job text against normalized skills).
   - The service mixes scores with a weighted formula (lexical ~0.7, vector ~0.3) to produce a combined `matchScore` and produce final ranked results.
   - If Pinecone fails or returns no results, the code falls back to a robust regex-based MongoDB search (`fallbackJobRecommendationsFromSkills`).

Files to inspect for the pipeline: [backend/services/ai.service.js](backend/services/ai.service.js), [backend/services/gemini.service.js](backend/services/gemini.service.js), [backend/services/pinecone.service.js](backend/services/pinecone.service.js), [backend/services/memory.service.js](backend/services/memory.service.js).

---

**Why this is different / advantages**
- Hybrid vector + lexical ranking — avoids pure-vector noise and improves precision for short skill queries.
- Deterministic fallbacks — works even when AI or Pinecone quota is exhausted.
- Real-time indexing — job create/update triggers immediate upsert to keep recommendations fresh.
- Namespaced Pinecone usage — jobs stored in a `jobs` namespace (configurable via `PINECONE_NAMESPACE`) for isolation and fast queries.
- Graceful degradation to in-memory cache or fallback DB queries, minimizing user-visible failures.

---

**Important API endpoints (examples)**
- `POST /api/user/register` — register new user (`backend/routes/user.route.js`)
- `POST /api/user/login` — login and receive cookie token
- `POST /api/user/profile/skills/extract` — extract skills from profile text (`backend/controllers/ai.controller.js`)
- `GET /api/user/jobs/recommendations` — get AI job recommendations for logged-in user
- `POST /api/job/post` — recruiter: create job (upserts vector)
- `GET /api/job/get` — list jobs with filters and caching

---

**Environment variables (core)**
- `MONGO_URI` — MongoDB connection string
- `SECRET_KEY` — JWT signing secret
- `PINECONE_API_KEY` — Pinecone API key
- `PINECONE_INDEX_NAME` — Pinecone index name
- `PINECONE_HOST` — optional Pinecone host (for alternative hosts)
- `PINECONE_NAMESPACE` — namespace for job vectors (default `jobs`)
- `GEMINI_API_KEY` — Google Gemini API key
- `GEMINI_TEXT_MODEL` — optional text model (eg. `gemini-2.0-flash`)
- `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT` — for ImageKit uploads
- `REDIS_URL` or `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` — optional caching

---

**Local dev quickstart**
1. Copy `.env.example` → `.env` and fill credentials.
2. Install backend deps:

```bash
cd backend
npm install
```

3. Start backend (dev):

```bash
npm run dev
```

4. Start frontend (in `frontend/`) with `npm install` and `npm run dev`.

---

**Where to look in code**
- AI logic: [backend/services/ai.service.js](backend/services/ai.service.js)
- Embeddings: [backend/services/gemini.service.js](backend/services/gemini.service.js)
- Vector DB ops: [backend/services/pinecone.service.js](backend/services/pinecone.service.js)
- Memory abstraction: [backend/services/memory.service.js](backend/services/memory.service.js)
- Controllers wiring: [backend/controllers/ai.controller.js](backend/controllers/ai.controller.js), [backend/controllers/job.controller.js](backend/controllers/job.controller.js)

---

If you'd like, I can:
- Add a diagram (Mermaid) showing the AI flow
- Add a sample `.env.example` with keys and example values
- Generate Postman/OpenAPI spec for the main endpoints

Enjoy — this README can be expanded with more screenshots, diagrams, and code snippets on demand.
