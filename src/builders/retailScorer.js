const { extractNutritionFields } = require("../utils/parsers");
const { scoreNutrition } = require("../utils/nutritionScoring");
const { scoreMealEnvironment } = require("../utils/sustainabilityScoring");
const {
  scorePreferenceFit,
  scoreRecommendation,
  isMealAllowed,
  compareMealsForUser
} = require("../utils/preferenceScoring");
const { classifyRetailMeal } = require("../classifiers/retailClassifier");

function scoreRetailMeal(retailItem, userPreferences = {}) {
  const name = retailItem.name || retailItem.formalName || "Unknown Item";
  const description = retailItem.description || "";

  const classification = classifyRetailMeal(name, description);
  const env = scoreMealEnvironment(classification.components);

  const nutritionTotals = extractNutritionFields(retailItem);
  const nut = scoreNutrition(nutritionTotals);

  const meal = {
    source: "retail",
    type: classification.type,
    name,
    description,
    components: classification.components,
    nutritionTotals,
    ...env,
    ...nut
  };

  const pref = scorePreferenceFit(meal, userPreferences);
  const rec = scoreRecommendation({
    sustainabilityScore: meal.sustainabilityScore,
    nutritionScore: meal.nutritionScore,
    preferenceFitScore: pref.preferenceFitScore
  });

  return {
    ...meal,
    ...pref,
    ...rec
  };
}

function scoreRetailMenu(retailLookupObject, userPreferences = {}) {
  return Object.values(retailLookupObject)
    .map(item => scoreRetailMeal(item, userPreferences))
    .filter(meal => isMealAllowed(meal, userPreferences))
    .sort((a, b) => compareMealsForUser(a, b, userPreferences));
}

function scoreRetailItemFromLookup(retailLookupObject, itemName, userPreferences = {}) {
  const item = retailLookupObject[itemName];

  if (!item) {
    throw new Error(`Nutrition data not found for item: ${itemName}`);
  }

  return scoreRetailMeal(item, userPreferences);
}

module.exports = {
  scoreRetailMeal,
  scoreRetailMenu,
  scoreRetailItemFromLookup
};
