# Phase 2 Data Collection

This phase creates three data sources:

- live Rathbone menu data for a selected day
- a manual retail meal database
- a manual dorm meal database

## 1. Rathbone Live Menu Data

The Rathbone dining hall page exposes two IDs in the page source:

- `locationId: 97451005`
- `menuId: 151204`

The Sodexo site then loads menu items from a live API using those IDs and the selected date.

Output files:

- [rathbone_menu_2026-04-23.csv](../data/rathbone_menu_2026-04-23.csv)
- [rathbone_menu_2026-04-23.json](../data/raw/rathbone_menu_2026-04-23.json)

Fields extracted:

- meal period
- station
- meal name
- description
- calories
- fat
- saturated fat
- sodium
- carbohydrates
- fiber
- sugar
- added sugar
- protein
- portion
- diet tags
- allergen tags

## 2. Rathbone Fetch Script

Use this script to refresh the daily Rathbone dataset:

```bash
python3 scripts/fetch_rathbone_menu.py --date 2026-04-23
```

The script writes:

- a raw JSON payload to `data/raw/`
- a flattened CSV to `data/`

## 3. Manual Retail Meal Database

File:

- [retail_meals_manual.csv](../data/retail_meals_manual.csv)

Purpose:

- store semi-static retail meals that you enter manually
- keep one row per meal
- later replace draft nutrition fields with official Lehigh retail nutrition data

Important:

- these rows are starter entries, not verified final nutrition facts
- keep `status = draft` until official nutrition is entered

Suggested next step:

- use Lehigh's official retail nutrition links for The Grind, The Clayton UC, Iacocca Hall, Hawk's Nest, Hideaway Cafe, and Common Grounds to fill in the blank nutrition columns

## 4. Manual Dorm Meal Database

File:

- [dorm_meals_manual.csv](../data/dorm_meals_manual.csv)

Purpose:

- provide easy low-effort meals for students who cook in dorms or off campus
- give fallback recommendations when a student does not want campus dining

This file is fully manual and already includes:

- ingredients
- equipment needed
- time
- estimated cost
- nutrition fields
- impact category fields
- starter nutrition and sustainability scores

## 5. Recommended Data Workflow

1. Refresh Rathbone each day with the fetch script.
2. Keep a dated CSV snapshot in `data/`.
3. Fill retail draft rows with official nutrition data as you collect it.
4. Expand dorm meals as you test which options students actually make.

## 6. Why This Setup Works

- Rathbone can be automated because the menu changes daily and exposes structured data.
- Retail should start manual because offerings are more stable and easier to curate carefully.
- Dorm meals should stay manual because they are recommendation content, not scraped data.
