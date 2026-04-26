const { scoreMealEnvironment } = require("../utils/sustainabilityScoring");
const { scoreNutrition } = require("../utils/nutritionScoring");
const { scorePreferenceFit, scoreRecommendation } = require("../utils/preferenceScoring");
const { buildWhyRecommended } = require("../utils/explanationLogic");

function scoreDormMeal(meal, userPreferences = {}) {
  const env = scoreMealEnvironment(meal.owidComponents);
  const nut = scoreNutrition(meal);

  const base = {
    source: "dorm",
    name: meal.name,
    components: meal.owidComponents,
    nutritionTotals: {
      calories: meal.calories,
      satFat: meal.satFat,
      sodium: meal.sodium,
      addedSugar: meal.addedSugar,
      fiber: meal.fiber,
      protein: meal.protein
    },
    ...env,
    ...nut
  };

  const pref = scorePreferenceFit(base, userPreferences);

  const rec = scoreRecommendation({
    sustainabilityScore: base.sustainabilityScore,
    nutritionScore: base.nutritionScore,
    preferenceFitScore: pref.preferenceFitScore
  });

  const scored = {
    ...base,
    ...pref,
    ...rec
  };

  return {
    ...scored,
    ...buildWhyRecommended(scored, userPreferences)
  };
}

function scoreDormMeals(meals, userPreferences = {}) {
  return meals
    .map(meal => scoreDormMeal(meal, userPreferences))
    .sort((a, b) => b.recommendationScore - a.recommendationScore);
}

module.exports = {
  scoreDormMeal,
  scoreDormMeals
};