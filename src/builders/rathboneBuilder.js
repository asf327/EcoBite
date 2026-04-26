const { scoreNutrition, combineNutritionFromItems } = require("../utils/nutritionScoring");
const { scoreMealEnvironment } = require("../utils/sustainabilityScoring");
const { scorePreferenceFit, scoreRecommendation } = require("../utils/preferenceScoring");
const { classifyItemName } = require("../classifiers/itemClassifier");

function buildRathboneMealCandidatesFromObjects(itemObjects, userPreferences = {}) {
  const buckets = {
    proteins: [],
    grains: [],
    vegetables: [],
    fruits: [],
    dairy: [],
    sweets: [],
    misc: []
  };

  for (const item of itemObjects) {
    const classified = classifyItemName(item.formalName);
    const merged = { ...classified, rawItem: item };

    if (classified.role === "protein" && !isStandaloneEntree(item.formalName)) buckets.proteins.push(merged);
    else if (classified.role === "grain" && !isStandaloneEntree(item.formalName)) buckets.grains.push(merged);
    else if (classified.role === "veg") buckets.vegetables.push(merged);
    else if (classified.role === "fruit") buckets.fruits.push(merged);
    else if (classified.role === "dairy") buckets.dairy.push(merged);
    else if (classified.role === "sweetener" || classified.role === "fat") buckets.sweets.push(merged);
    else buckets.misc.push(merged);
  }

  const meals = [];

  for (const protein of buckets.proteins) {
    for (const grain of buckets.grains.filter(g =>
        isMealAppropriateGrain(g, g.rawItem.mealPeriod)
    )) {
      if (buckets.vegetables.length > 0) {
        const veg = buckets.vegetables[0];
        const mealItems = [protein.rawItem, grain.rawItem, veg.rawItem];
        const nutritionTotals = combineNutritionFromItems(mealItems);

        const components = [
          { category: protein.primaryCategory, weightFraction: 0.40 },
          { category: grain.primaryCategory, weightFraction: 0.35 },
          { category: veg.primaryCategory, weightFraction: 0.25 }
        ];

        const env = scoreMealEnvironment(components);
        const nut = scoreNutrition(nutritionTotals);

        const meal = {
          source: "rathbone",
          template: "bowl",
          name: `${protein.itemName} + ${grain.itemName} + ${veg.itemName}`,
          itemNames: mealItems.map(x => x.formalName),
          components,
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

        meals.push({ ...meal, ...pref, ...rec });
      }
    }
  }

  const uniqueMeals = [];
  const seen = new Set();

  for (const meal of meals) {
    const key = meal.itemNames.slice().sort().join("|");

    if (!seen.has(key)) {
        seen.add(key);
        uniqueMeals.push(meal);
    }
  }

  return uniqueMeals.sort((a, b) => b.recommendationScore - a.recommendationScore);
}

function isMealAppropriateGrain(item, mealPeriod = "") {
  const name = item.itemName.toLowerCase();
  const period = mealPeriod.toLowerCase();

  if ((period === "lunch" || period === "dinner") && name.includes("oatmeal")) {
    return false;
  }

  return true;
}

function isStandaloneEntree(itemName = "") {
  const name = itemName.toLowerCase();

  return (
    name.includes("bowl") ||
    name.includes("sandwich") ||
    name.includes("burger") ||
    name.includes("pizza") ||
    name.includes("casserette") ||
    name.includes("casserole")
  );
}

module.exports = { buildRathboneMealCandidatesFromObjects };