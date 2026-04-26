const { clamp } = require("./parsers");

function scoreRecommendation({
  sustainabilityScore = 0,
  nutritionScore = 0,
  preferenceFitScore = 50
}) {
  const recommendationScore =
    0.45 * sustainabilityScore +
    0.45 * nutritionScore +
    0.1 * preferenceFitScore;

  return {
    recommendationScore:
      Math.round(clamp(recommendationScore, 0, 100) * 100) / 100
  };
}

function scorePreferenceFit(meal, userPreferences = {}) {
  let score = 50;

  const {
    wantsHighProtein = false,
    prefersPlantBased = false,
    prefersLowImpact = false,
    avoidsBeef = false,
    avoidsPork = false,
    vegetarian = false,
    vegan = false
  } = userPreferences;

  const categories = (meal.components || []).map(component => component.category);

  const hasBeef = categories.includes("Beef (beef herd)");
  const hasPork = categories.includes("Pig Meat");
  const hasPoultry = categories.includes("Poultry Meat");
  const hasFish =
    categories.includes("Fish (farmed)") ||
    categories.includes("Prawns (farmed)");
  const hasEgg = categories.includes("Eggs");
  const hasDairy =
    categories.includes("Cheese") || categories.includes("Milk");

  const hasAnimal =
    hasBeef || hasPork || hasPoultry || hasFish || hasEgg || hasDairy;

  const hasMeat = hasBeef || hasPork || hasPoultry || hasFish;

  const hasPlantProtein =
    categories.includes("Tofu") || categories.includes("Other Pulses");

  const protein = meal.nutritionTotals?.protein || meal.protein || 0;

  if (wantsHighProtein && protein >= 20) score += 20;
  if (wantsHighProtein && protein < 10) score -= 10;

  if (prefersPlantBased && hasPlantProtein) score += 20;
  if (prefersPlantBased && hasAnimal) score -= 10;

  if (prefersLowImpact && meal.sustainabilityScore >= 80) score += 15;
  if (prefersLowImpact && meal.sustainabilityScore < 50) score -= 10;

  if (avoidsBeef && hasBeef) score = 0;
  if (avoidsPork && hasPork) score -= 20;

  if (vegetarian && hasMeat) score = 0;
  if (vegan && hasAnimal) score = 0;

  return {
    preferenceFitScore: Math.round(clamp(score, 0, 100) * 100) / 100
  };
}

module.exports = {
  scoreRecommendation,
  scorePreferenceFit
};