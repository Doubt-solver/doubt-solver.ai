# Phase 2 — Two-Track Strategy

## Track A: Ship Now (TypeScript — deploy to Vercel)
Supabase Auth + Gemini Flash via Next.js API routes. Single codebase, zero extra infra.

## Track B: Scale Later (Python FastAPI — ready locally)
`backend-v2/` directory with full Python AI backend. Swap in when you need fine-tuning, LangChain, custom models.

---

## Track A — Proposed Changes

### New Files

| File | Purpose |
|---|---|
| `.env.local.example` | All env vars needed |
| `middleware.ts` | Auth guard for `/dashboard/*` |
| `src/lib/supabase/client.ts` | Browser Supabase client |
| `src/lib/supabase/server.ts` | Server Supabase client |
| `src/lib/gemini.ts` | Gemini client + helpers |
| `src/app/auth/login/page.tsx` | Login page (Google + OTP) |
| `src/app/auth/callback/route.ts` | OAuth callback handler |
| `src/app/api/exam/generate/route.ts` | AI question generation |
| `src/app/api/exam/submit/route.ts` | Save score + XP |
| `src/app/api/doubts/ask/route.ts` | RAG + streaming doubts |
| `supabase/schema.sql` | DB schema + pgvector |

### Modified Files

| File | Change |
|---|---|
| [dashboard/exam/page.tsx](file:///c:/Users/Lokesh%20Singh/2026-learning/doubt-solver.ai/src/app/dashboard/exam/page.tsx) | Real AI questions + score saving |
| [dashboard/doubts/page.tsx](file:///c:/Users/Lokesh%20Singh/2026-learning/doubt-solver.ai/src/app/dashboard/doubts/page.tsx) | Streaming AI responses |
| [dashboard/page.tsx](file:///c:/Users/Lokesh%20Singh/2026-learning/doubt-solver.ai/src/app/dashboard/page.tsx) | Real user data from Supabase |
| [dashboard/layout.tsx](file:///c:/Users/Lokesh%20Singh/2026-learning/doubt-solver.ai/src/app/dashboard/layout.tsx) | Real user name from auth |

---

## Track B — `backend-v2/` (Local Only)

Identical AI endpoints in Python FastAPI. Ready to deploy when needed.

```
backend-v2/
├── main.py, requirements.txt, .env.example
├── services/ (gemini.py, question_gen.py, doubt_solver.py, embeddings.py)
├── models/schemas.py
└── scripts/index_ncert.py
```

---

## Credentials Needed

> [!IMPORTANT]
> 1. **Supabase**: `SUPABASE_URL` + `SUPABASE_ANON_KEY` from [supabase.com](https://supabase.com)
> 2. **Gemini**: `GEMINI_API_KEY` from [aistudio.google.com](https://aistudio.google.com)

---

## Verification Plan
1. `npm run build` — zero errors
2. Google sign-in works
3. AI generates real exam questions
4. Score + XP saved to Supabase
5. Streaming doubt solver works
6. Deploy to Vercel
