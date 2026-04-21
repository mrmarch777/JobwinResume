# JobwinResume — AI-Powered Resume Builder

> Build stunning, ATS-optimized resumes with Claude AI in minutes.

## 🚀 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15, React, Vanilla CSS |
| Backend | FastAPI (Python), Uvicorn |
| AI | Claude (Anthropic) |
| Auth | Supabase |
| Payments | Razorpay |
| Deploy | Vercel (frontend) + Railway/Render (backend) |

## 📦 Project Structure

```
JobwinResume/
├── frontend/          # Next.js app
│   ├── pages/         # All page routes
│   ├── components/    # Shared components (Sidebar, etc.)
│   └── lib/           # Supabase, templates, contexts
├── backend/           # FastAPI Python server
│   ├── main.py        # All API endpoints
│   ├── ai_engine.py   # Claude AI integration
│   └── job_search.py  # Job search scraper
└── docs/              # Documentation
```

## 🛠️ Local Development

### Frontend
```bash
cd frontend
npm install
npm run dev   # http://localhost:3000
```

Create `frontend/.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key
NEXT_PUBLIC_API_URL=http://localhost:8001
```

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --port 8001 --reload
```

Create `backend/.env`:
```
ANTHROPIC_API_KEY=your_anthropic_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_key
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
```

## ✨ Features

- **AI Resume Wizard** — 4-step guided form, Claude builds complete resume
- **32 Premium Templates** — ATS Friendly, Futuristic, Photo, Executive
- **AI Improve** — Improve any section with one click
- **Grammar Checker** — Full resume spell & grammar check
- **PDF & Word Export** — Download as `Resume_Name.pdf` or `.doc`
- **Import Resume** — Upload PDF/DOCX, AI parses all data
- **ATS Scorer** — Score resume against any job description
- **AI Tailor** — Tailor resume to a specific job posting

## 🌐 Deployment

- **Frontend** → Vercel (set env vars in Vercel dashboard)
- **Backend** → Railway or Render (set env vars in platform)
- Set `NEXT_PUBLIC_API_URL` on Vercel to point to your deployed backend URL

## 📄 License

MIT — © 2026 JobwinResume
