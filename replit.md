# ScorpStudy by Bishal

AI-powered study assistant for college students with 10 tools: Chat, Quiz, Flashcards, PDF Summarizer, Image Generator, Smart Notes, Mind Map, Translator, Calculator, and History/Analytics.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/scorpstudy run dev` — run the frontend (port from $PORT)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_PUBLISHABLE_KEY` — auto-set by Clerk provisioning
- AI keys: `GROQ_API_KEY_1..5`, `GEMINI_API_KEY_1..5`, `OPENAI_API_KEY`, `HUGGINGFACE_API_KEY`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind v4 + shadcn/ui, Wouter routing, @clerk/react
- API: Express 5 + Clerk middleware
- DB: PostgreSQL + Drizzle ORM
- Auth: Clerk (Replit-managed, proxy-based)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/db/src/schema/index.ts` — DB schema (notes, quiz_results, flashcard_sets, summaries, generated_images, mindmaps, translations, daily_usage)
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for API contract)
- `lib/api-client-react/src/generated/` — generated hooks + Zod schemas (do not edit)
- `artifacts/api-server/src/lib/aiProvider.ts` — multi-provider AI fallback chain
- `artifacts/api-server/src/lib/usageService.ts` — daily usage limits (30 AI/day, 3 images/day)
- `artifacts/api-server/src/routes/` — ai.ts, notes.ts, history.ts, health.ts
- `artifacts/scorpstudy/src/App.tsx` — Clerk + routing setup
- `artifacts/scorpstudy/src/pages/` — all 10 page components + LandingPage
- `artifacts/scorpstudy/src/components/Sidebar.tsx` — main navigation
- `artifacts/scorpstudy/src/index.css` — blue theme (#2563EB), Inter font

## Architecture decisions

- AI provider uses a round-robin fallback chain: Groq x5 → Gemini x5 → OpenAI → HuggingFace. Identity questions answered from a static cache — never call an AI API for them.
- Image generation uses Pollinations AI (no API key needed): `https://image.pollinations.ai/prompt/{encoded}?model=flux&nologo=true`
- Auth is Clerk cookie-based (no JWT tokens in frontend API calls). userId is passed in request body from `useUser().user.id`.
- Daily limits enforced server-side via `daily_usage` table: 30 AI queries/day, 3 images/day per user.
- `@layer theme, base, clerk, components, utilities;` must stay before `@import "tailwindcss"` in index.css for Clerk themes to work in prod.
- vite.config.ts uses `tailwindcss({ optimize: false })` to prevent Clerk theme CSS from being reordered in prod builds.

## Product

- Landing page with hero, features grid, CTAs — accessible without login
- After sign-in: sidebar with 10 tools, all protected routes
- Chat: streaming-style conversation with Bishal's Assistant, subject selector
- Quiz: generate MCQ/T-F/short-answer from topic or pasted notes, track scores
- Flashcards: flip-card UI, save sets to history
- Summarizer: paste text → summary + key points + exam questions + vocabulary
- Image Generator: Pollinations AI with prompt enhancer, download/save gallery
- Notes: full CRUD with tag system, AI enhance/summarize inline
- Mind Map: visual branch layout from any topic
- Translator: 20+ languages, swap, copy, save
- Calculator: scientific mode + AI formula explainer
- History/Analytics: bar chart by day, pie chart by feature, study streak

## User preferences

- App name: "ScorpStudy by Bishal"
- Blue theme: primary #2563EB
- Font: Inter
- Card-based layout throughout

## Gotchas

- Do NOT re-run codegen (`pnpm --filter @workspace/api-spec run codegen`) — it will overwrite generated hooks.
- API server must be restarted after Clerk key changes for new keys to take effect.
- Frontend pages use `useUser().user.id` and pass it as `userId` in request body — not Clerk JWT auth headers.
- `notes.ts` route reads `userId` from `req.body` for mutations and `req.query.userId` for GETs. The OpenAPI spec ListNotesParams does NOT include `userId` — it's passed via query but not typed as a param.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See the `clerk-auth` skill for Clerk proxy setup details
