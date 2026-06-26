---
name: ScorpStudy API Conventions
description: How the ScorpStudy API and frontend hooks interact
---

## Rules

- **Do NOT re-run codegen** (`pnpm --filter @workspace/api-spec run codegen`) — it will overwrite generated hooks in `lib/api-client-react/src/generated/`.
- All mutation hooks take `{ data: ... }` as the mutateAsync argument (Orval convention).
- `useDeleteNote` takes `{ id }` only — no `data` field.
- `useUpdateNote` takes `{ id, data: NoteUpdate }`.
- userId is passed in `req.body` for mutations and `req.query.userId` for GET requests — NOT via Clerk JWT auth headers (cookie-based).
- `ListNotesParams` does NOT include `userId` — only `search` and `sort`.
- `useGetHistory` and `useGetDailyUsage` require `queryKey` in their options — use `getGetHistoryQueryKey()` and `getGetDailyUsageQueryKey()`.
- ReactMarkdown v9 does NOT accept `className` prop — wrap with a `<div className="...">` instead.

**Why:** Orval codegen generates specific mutation signatures; ListNotesParams is typed from OpenAPI spec which doesn't expose userId as a query param.
