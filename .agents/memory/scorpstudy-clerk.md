---
name: ScorpStudy Clerk Setup
description: Clerk auth setup quirks for the ScorpStudy project
---

## Rules

- `@layer theme, base, clerk, components, utilities;` must come BEFORE `@import "tailwindcss"` in index.css — otherwise Clerk UI breaks in prod.
- `vite.config.ts` must use `tailwindcss({ optimize: false })` — without this, nested @layer imports from @clerk/themes get reordered in prod builds.
- `clerkPubKey` must use `publishableKeyFromHost(window.location.hostname, import.meta.env.VITE_CLERK_PUBLISHABLE_KEY)` from `@clerk/react/internal`.
- `proxyUrl={import.meta.env.VITE_CLERK_PROXY_URL}` is unconditional — empty in dev, auto-set in prod.
- ClerkProvider props `afterSignInUrl`/`afterSignUpUrl` do NOT exist in this version — use `signInFallbackRedirectUrl`/`signUpFallbackRedirectUrl` instead.
- Sign-in/up routes must be exactly `path="/sign-in/*?"` with routing="path" and full basePath prefix.

**Why:** Replit-managed Clerk uses a proxy setup that requires specific CSS layer ordering and unconditional proxy URL.
