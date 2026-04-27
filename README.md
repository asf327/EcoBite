# EcoBite

EcoBite is a Lehigh-focused dining recommendation app that helps students make more sustainable food choices using daily campus menus, nutrition facts, and evidence-based environmental impact estimates.

## First Build Assets

Start here:

- [Task overview](./docs/first-five-tasks.md)
- [Scoring specification](./docs/scoring-spec.md)
- [Phase 2 data collection](./docs/data-collection.md)
- [Starter Rathbone dataset](./data/rathbone_sample_meals.csv)
- [Live Rathbone menu snapshot](./data/rathbone_menu_2026-04-23.csv)
- [Retail meals manual dataset](./data/retail_meals_manual.csv)
- [Dorm meals manual dataset](./data/dorm_meals_manual.csv)
- [Screen wireframes](./docs/screen-wireframes.md)
- [Prototype ranking flow](./docs/prototype-ranking.md)

## MVP Goal

Build a first version that:

- pulls or stores Rathbone meals for the day
- assigns each meal a nutrition score and sustainability score
- asks a short onboarding survey
- recommends the best options for a student based on their habits
- suggests one realistic lower-impact change

## Vercel

This repo can be deployed as a single Vercel project:

- the frontend is built from `client/`
- the backend is served from `api/index.js`
- frontend API requests go to `/api`

Required Vercel environment variables:

- `DATABASE_URL`
- `GOOGLE_CLIENT_ID`
- `VITE_GOOGLE_CLIENT_ID`

Optional:

- `VITE_API_BASE`

For a single-project deploy, you usually do not need `VITE_API_BASE` because the frontend defaults to `/api` in production.
