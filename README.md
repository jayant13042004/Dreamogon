# Subconscious Log

> A private place to record your dreams and discover what keeps returning.

Subconscious Log is a calm space for self-reflection — not a source of medical or psychological diagnoses.

## Features

- **Distraction-free recording** — write or dictate dreams quickly
- **Reflective AI analysis** — themes, emotions, and possible interpretations framed as possibilities
- **History & insights** — browse, search, and notice patterns across your journal
- **Dream World** — an optional visual layer grown from your journal data
- **Privacy** — Supabase Auth + Row-Level Security so dreams stay yours

## Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS v4
- Supabase (Postgres, Auth, RLS, pgvector)
- Google Gemini (`@google/genai`)

## Setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill values
3. Run SQL migrations in `supabase/migrations/` (in order) on your Supabase project
4. `npm run dev`

## Privacy

1. RLS restricts queries to the authenticated user
2. Dream content sent to Gemini for analysis is not used to train public models
3. Export your dreams as JSON from Settings
