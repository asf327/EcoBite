# Prototype Ranking Flow

Use this document to build the first non-UI prototype.

## Goal

Given a user profile and one day's Rathbone meals, output the top recommendations in a way that feels sensible.

## Input 1: Sample User Profile

Use this example first:

```json
{
  "diet_type": "omnivore",
  "allergies": [],
  "priority": "small_changes",
  "change_readiness": "low",
  "preferred_location": "Rathbone",
  "usual_proteins": ["chicken", "dairy"],
  "wants_dorm_meals": true
}
```

## Input 2: Meal Dataset

Use the rows in [rathbone_sample_meals.csv](../data/rathbone_sample_meals.csv).

## Ranking Steps

1. Load meals for the selected location and date.
2. Calculate `nutrition_score`.
3. Calculate `sustainability_score`.
4. Calculate `user_fit_score`.
5. Calculate `recommendation_score`.
6. Sort descending by `recommendation_score`.
7. Return the top 3 meals.
8. Generate one `small change` suggestion.

## Small Change Rule

If the user usually eats chicken or dairy-heavy meals:

- recommend a similar meal with a better sustainability score first
- avoid jumping directly from `beef burger` to a meal that feels too unfamiliar unless the user selected higher openness to change

Example:

- suggest `Herb Roasted Chicken` before `Lentil Soup` for a low-readiness omnivore
- suggest `Black Bean Burger` as a swap from `Beef Cheeseburger`

## Output Format

Use this simple structure:

```json
{
  "best_overall": "Herb Roasted Chicken",
  "most_sustainable": "Chickpea Grain Bowl",
  "best_small_change": "Black Bean Burger",
  "swap_suggestion": {
    "from": "Beef Cheeseburger",
    "to": "Black Bean Burger",
    "reason": "Similar format, much lower estimated environmental impact."
  }
}
```

## Sanity Checks

Your ranking is working if:

- beef-heavy meals usually rank near the bottom on sustainability
- plant-forward meals rank near the top on sustainability
- nutrition can still lift a moderate-impact meal above a weak plant-based option
- low-readiness users do not only get extreme habit changes

## First Prototype Build Options

You can test this ranking in any of these formats:

- spreadsheet formulas
- a simple JavaScript script
- a Supabase query plus client-side sorting

For speed, a spreadsheet or small script is enough for the first pass.
