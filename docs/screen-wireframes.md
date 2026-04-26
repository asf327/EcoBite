# Screen Wireframes

These are low-fidelity product specs for the three core MVP screens.

## Screen 1: Sign-In And Survey

Goal: get authentication done quickly and capture enough information to personalize recommendations.

### Layout

- App name and one-sentence purpose
- `Continue with Google` button
- progress bar for survey after sign-in
- one question per screen or card stack

### Survey Questions

1. What best describes your current eating pattern?
2. Do you have any allergies or dietary restrictions?
3. What matters most when picking a meal?
4. How open are you to change?
5. Which proteins do you eat most often?
6. Where do you usually eat?
7. Do you want dorm meal suggestions too?

### Primary Output

Create a `user profile` with:

- diet type
- restrictions
- goals
- change readiness
- usual location

## Screen 2: Dining Location And Meal List

Goal: let the user pick where they want to eat and immediately see scored meals.

### Layout

- top header with current day
- location tabs: `Rathbone`, `Brodhead`, `Retail`, `Dorm Meals`
- filter chips: `Most Sustainable`, `Best Nutrition`, `High Protein`, `Small Change`
- meal cards in a scroll list

### Meal Card Fields

- meal name
- station
- nutrition score
- sustainability score
- diet tags
- calories and protein
- short explanation
- `Compare` or `View Details` button

### Empty State

If live data is unavailable:

- show latest stored menu snapshot
- label it clearly as `saved menu data`

## Screen 3: Recommendations Page

Goal: summarize what the student should actually do.

### Layout

- top recommendation banner
- three ranked picks
- one easy swap
- optional dorm meal suggestion

### Recommendation Blocks

`Best overall`
- balanced nutrition and sustainability

`Most sustainable`
- highest sustainability score

`Best small change`
- closest to user's current habits with lower impact

`Dorm backup`
- quick meal if the student does not want campus dining

### Explanation Style

Keep text short and specific:

- `Lower carbon than the burger, but still high in protein.`
- `Matches your preference for small changes.`
- `Good fiber score and low estimated land use.`

## Ideal User Flow

1. User signs in with Google.
2. User answers the survey.
3. User picks a dining location.
4. App ranks the meals.
5. User sees the top recommendation and one lower-impact swap.
