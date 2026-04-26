# First Five Tasks

This document turns the project idea into the first five build tasks you should complete before writing the full app.

## Task 1: Lock The Scoring Rules

Goal: define the exact logic for `nutrition_score`, `sustainability_score`, and `recommendation_score`.

Deliverables:

- final scoring formula
- food impact categories
- confidence labels
- explanation text format for why a meal was recommended

Done when:

- two people can score the same meal with the same rules and get nearly the same result

Use: [scoring-spec.md](./scoring-spec.md)

## Task 2: Create A Starter Rathbone Dataset

Goal: build a small, testable dataset that matches the fields your app will need.

Deliverables:

- 15 to 25 sample meals
- nutrition fields for each meal
- diet and allergen tags
- food-impact category for each meal

Done when:

- you can rank meals without needing the live scraper yet

Use: [rathbone_sample_meals.csv](../data/rathbone_sample_meals.csv)

Note:

- The starter CSV is a schema-and-example file for prototyping.
- Replace the rows with real Rathbone menu items as you collect them from the Sodexo site.

## Task 3: Classify Meals By Environmental Impact

Goal: make the sustainability score explainable.

Each meal should get:

- `protein_category`
- `dairy_intensity`
- `processing_level`
- `plant_forward_level`
- `confidence_level`

Suggested categories:

- `beef`
- `lamb`
- `pork`
- `chicken`
- `turkey`
- `fish`
- `egg`
- `dairy_heavy`
- `vegetarian`
- `vegan`
- `legume_based`

Done when:

- every meal in the starter dataset has an assigned category and confidence level

## Task 4: Sketch The Three Core Screens

Goal: decide the app flow before coding.

Core screens:

- sign-in and onboarding survey
- location and meal list
- meal recommendations and swap suggestions

Done when:

- you know exactly what the user sees after login and what action they take next

Use: [screen-wireframes.md](./screen-wireframes.md)

## Task 5: Build A Simple Ranking Prototype

Goal: prove the recommendation logic works before full product development.

Prototype input:

- one sample user profile
- one dining location
- one set of meal rows

Prototype output:

- meals ranked from best to worst
- top 3 recommendations
- one small-change suggestion
- one explanation line per meal

Done when:

- the ranking result feels sensible to a student reading it

Use: [prototype-ranking.md](./prototype-ranking.md)

## Recommended Execution Order

1. Finish the scoring spec.
2. Fill in the starter dataset.
3. Assign impact categories.
4. Review the wireframes.
5. Test the prototype ranking on sample users.

## What To Do Next After These Five

After these are complete, move into implementation:

1. Build the database schema.
2. Add Google OAuth.
3. Add survey storage.
4. Add menu ingestion for Rathbone.
5. Connect the recommendation engine to the UI.
