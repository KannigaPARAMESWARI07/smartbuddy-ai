# Steering: SmartBuddy AI

## Goal
Build a micro-learning platform that generates quick, focused lessons on demand, scaled to the user's available time, with quiz and Q&A features to reinforce learning.

## Context
This was prototyped in PartyRock. The `src/` folder contains reference code — use it to understand intended behavior and architecture patterns, NOT as code to copy. You're building a real, production-ready version from a product idea.

## Instructions

1. Read `Requirements.md` for the full product specification.
2. Reference `App.tsx` to understand:
   - How users flow through topic → duration → lesson generation
   - State management (lesson, quiz parsing, Q&A history)
   - Error handling and cancellation patterns
   - Responsive UI patterns and accessibility expectations
3. The prototype has sandbox constraints (no persistence, no real forms). Your implementation should use proper architecture.

## Guidance

- **Tech Stack**: Before building, ask the user which they prefer: React + Vite, Next.js, or a simpler stack? Explain trade-offs (e.g., Next.js gives you backend + DB ready; React + Vite is lighter and faster to prototype). Offer a sensible default if they're unsure.
- **Scope Questions**: Ask about:
  - Target users: Students? Professionals? Casual learners?
  - Deployment: Web only, or mobile app later?
  - Persistence: Should lessons/Q&A be saved? Do users need accounts?
  - API: Will you provide the LLM backend, or should the user set up their own (e.g., OpenAI key)?
- **MVP Priority**: Get a working lesson → quiz → Q&A flow deployed quickly. Worry about accounts, social features, or advanced analytics later.
- **Plain Language**: The user likely isn't a developer. Avoid "state management" jargon; say "we need to remember what the user typed so it doesn't disappear."
- **Simplify First**: Start with a single tech choice, hardcoded data if needed, and a mocked API. Ship early; iterate based on feedback.