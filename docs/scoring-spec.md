# Scoring Specification

This scoring model is designed for an MVP. It is evidence-based, explainable, and simple enough to implement without pretending to know the exact lifecycle footprint of every campus recipe.

## 1. Nutrition Score

Range: `0-100`

Start each meal at `50` points.

Add points:

- `+12` if fiber is `>= 8g`
- `+8` if fiber is `5-7g`
- `+10` if protein is `>= 20g`
- `+5` if protein is `12-19g`
- `+10` if meal is tagged `vegetarian`, `vegan`, or `plant_forward`
- `+8` if calories are `350-700`

Subtract points:

- `-12` if sodium is `> 900mg`
- `-8` if sodium is `701-900mg`
- `-10` if saturated fat is `> 8g`
- `-6` if saturated fat is `5-8g`
- `-8` if added sugar is `> 12g`
- `-5` if added sugar is `6-12g`
- `-8` if calories are `< 250` or `> 900`

Clamp final result between `0` and `100`.

## 2. Sustainability Score

Range: `0-100`

The sustainability score is an estimate, not a direct measured footprint. It should be shown in the app as:

`Estimated environmental impact based on food-category data`

### 2.1 Impact Inputs

Each meal gets three subscores:

- `carbon_subscore`
- `water_subscore`
- `land_subscore`

Each subscore uses a `0-100` scale where higher is better.

### 2.2 Sustainability Weights

- carbon: `50%`
- water: `25%`
- land: `25%`

Formula:

`sustainability_score = carbon_subscore * 0.5 + water_subscore * 0.25 + land_subscore * 0.25`

Round to nearest whole number.

### 2.3 Suggested Baseline Category Table

Use this as the starting rule set:

| Protein Category | Carbon | Water | Land | Notes |
| --- | ---: | ---: | ---: | --- |
| `beef` | 10 | 20 | 10 | highest impact |
| `lamb` | 12 | 20 | 8 | very high impact |
| `pork` | 45 | 50 | 45 | medium impact |
| `chicken` | 60 | 60 | 60 | moderate impact |
| `turkey` | 62 | 60 | 60 | moderate impact |
| `fish` | 55 | 55 | 55 | variable, keep moderate for MVP |
| `egg` | 58 | 55 | 55 | moderate |
| `dairy_heavy` | 38 | 40 | 35 | cheese-heavy dishes score lower |
| `vegetarian` | 75 | 72 | 75 | plant-forward but may include dairy |
| `vegan` | 92 | 88 | 92 | lowest impact group |
| `legume_based` | 95 | 90 | 95 | best for sustainability |

### 2.4 Adjustments

Apply a few small modifiers:

- `-8` for `dairy_heavy = yes`
- `+5` for `plant_forward_level = high`
- `-5` for `fried = yes`
- `-4` for `highly_processed = yes`
- `+3` for `whole_grain = yes`

Clamp each subscore and final score to `0-100`.

### 2.5 Sustainability Labels

- `80-100`: low impact
- `60-79`: moderate impact
- `40-59`: high impact
- `0-39`: very high impact

## 3. Recommendation Score

Range: `0-100`

Formula:

`recommendation_score = nutrition_score * 0.45 + sustainability_score * 0.45 + user_fit_score * 0.10`

## 4. User Fit Score

Range: `0-100`

Start at `50`.

Add points:

- `+20` if meal matches dietary restriction
- `+10` if meal matches selected priority such as high protein or convenience
- `+10` if it represents only a small change from the user's current habits
- `+10` if the user prefers dorm cooking and the meal is dorm-friendly

Subtract points:

- `-40` if meal conflicts with allergy or hard restriction
- `-15` if meal is a large change and user selected `small changes only`
- `-10` if meal misses the user's main priority

Clamp to `0-100`.

## 5. Confidence Level

This prevents the app from overstating certainty.

- `high`: nutrition facts available and meal category is clear
- `medium`: nutrition facts available but category or ingredients are partly inferred
- `low`: only meal title or sparse data available

## 6. Example Explanation Format

Each recommendation should include one short explanation:

- `High protein and lower carbon than the beef option at this station.`
- `Plant-based meal with strong fiber score and low estimated land use.`
- `Similar to your usual choice, but with lower environmental impact.`

## 7. MVP Rules To Keep

Keep these rules during the first build:

- never call the sustainability score exact
- keep the scoring transparent
- prefer simple weights over complex hidden logic
- make "small change" recommendations explicit
