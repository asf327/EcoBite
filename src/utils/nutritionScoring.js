const { clamp, parseNumber, extractNutritionFields } = require("./parsers");

const NUTRITION_REF = {
  calories: 2000,
  satFat: 20,
  sodium: 2300,
  addedSugar: 50,
  fiber: 28,
  protein: 50
};

function scoreNutrition(n) {
  const calories = parseNumber(n.calories);
  const satFat = parseNumber(n.satFat);
  const sodium = parseNumber(n.sodium);
  const addedSugar = parseNumber(n.addedSugar);
  const fiber = parseNumber(n.fiber);
  const protein = parseNumber(n.protein);

  const caloriesLoad = clamp(calories / NUTRITION_REF.calories, 0, 1);
  const satFatLoad = clamp(satFat / NUTRITION_REF.satFat, 0, 1);
  const sodiumLoad = clamp((sodium / NUTRITION_REF.sodium) * 1.5, 0, 1);
  const addedSugarLoad = clamp(addedSugar / NUTRITION_REF.addedSugar, 0, 1);

  const fiberGap = fiber === 0 ? 1 : 1 - clamp(fiber / NUTRITION_REF.fiber, 0, 1);
  const proteinGap = 1 - clamp(protein / NUTRITION_REF.protein, 0, 1);

  const nutritionBurden =
    (caloriesLoad + satFatLoad + sodiumLoad + addedSugarLoad + fiberGap + proteinGap) / 6;

  return {
    calories,
    satFat,
    sodium,
    addedSugar,
    fiber,
    protein,
    nutritionBurden: Math.round(nutritionBurden * 10000) / 10000,
    nutritionScore: Math.round(clamp(100 * (1 - nutritionBurden), 0, 100) * 100) / 100
  };
}

function combineNutritionFromItems(items) {
  const totals = {
    calories: 0,
    satFat: 0,
    sodium: 0,
    addedSugar: 0,
    fiber: 0,
    protein: 0
  };

  for (const item of items) {
    const n = extractNutritionFields(item);
    totals.calories += parseNumber(n.calories);
    totals.satFat += parseNumber(n.satFat);
    totals.sodium += parseNumber(n.sodium);
    totals.addedSugar += parseNumber(n.addedSugar);
    totals.fiber += parseNumber(n.fiber);
    totals.protein += parseNumber(n.protein);
  }

  return totals;
}

module.exports = {
  scoreNutrition,
  combineNutritionFromItems
};