---
name: ScorpStudy AI Provider
description: Multi-provider AI fallback chain and usage limits
---

## Rules

- Fallback chain order: Groq x5 (GROQ_API_KEY_1..5) → Gemini x5 (GEMINI_API_KEY_1..5) → OpenAI → HuggingFace.
- Identity questions (who are you, who made you, etc.) answered from static cache — never call any AI API for them; provider returns "static".
- Daily limits: 30 AI queries/day, 3 images/day per user — enforced in `usageService.ts` via `daily_usage` DB table.
- Image generation uses Pollinations AI (no key): `https://image.pollinations.ai/prompt/{encoded}?width=W&height=H&model=flux&nologo=true&seed={Date.now()}`.
- Increment usage ONLY when provider !== "static".

**Why:** Multiple API keys provide resilience against rate limits; static cache prevents wasting quota on identity questions.
