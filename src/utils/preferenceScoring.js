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

function getMealFlags(meal) {
  const categories = (meal.components || []).map(component => component.category);

  const hasBeef = categories.includes("Beef (beef herd)");
  const hasPork = categories.includes("Pig Meat");
  const hasPoultry = categories.includes("Poultry Meat");
  const hasFish = categories.includes("Fish (farmed)") || categories.includes("Prawns (farmed)");
  const hasEgg = categories.includes("Eggs");
  const hasDairy = categories.includes("Cheese") || categories.includes("Milk");
  const hasAnimal = hasBeef || hasPork || hasPoultry || hasFish || hasEgg || hasDairy;
  const hasMeat = hasBeef || hasPork || hasPoultry || hasFish;
  const hasPlantProtein = categories.includes("Tofu") || categories.includes("Other Pulses");

  return {
    categories,
    hasBeef,
    hasPork,
    hasPoultry,
    hasFish,
    hasEgg,
    hasDairy,
    hasAnimal,
    hasMeat,
    hasPlantProtein
  };
}

function isMealAllowed(meal, userPreferences = {}) {
  const {
    avoidsBeef = false,
    avoidsPork = false,
    vegetarian = false,
    vegan = false
  } = userPreferences;

  const flags = getMealFlags(meal);

  if (vegan && flags.hasAnimal) return false;
  if (vegetarian && flags.hasMeat) return false;
  if (avoidsBeef && flags.hasBeef) return false;
  if (avoidsPork && flags.hasPork) return false;

  return true;
}

function compareMealsForUser(a, b, userPreferences = {}) {
  if (userPreferences.wantsHighProtein) {
    const proteinDelta = (b.protein || 0) - (a.protein || 0);

    if (Math.abs(proteinDelta) >= 3) {
      return proteinDelta;
    }
  }

  return b.recommendationScore - a.recommendationScore;
}

function scorePreferenceFit(meal, userPreferences = {}) {
  let score = 50;

  const {
    wantsHighProtein = false,
    prefersLowImpact = false,
    avoidsBeef = false,
    avoidsPork = false,
    vegetarian = false,
    vegan = false
  } = userPreferences;

  const flags = getMealFlags(meal);

  const protein = meal.nutritionTotals?.protein || meal.protein || 0;

  if (wantsHighProtein && protein >= 25) score += 30;
  else if (wantsHighProtein && protein >= 20) score += 24;
  else if (wantsHighProtein && protein >= 15) score += 12;
  else if (wantsHighProtein && protein < 12) score -= 20;

  if (prefersLowImpact && meal.sustainabilityScore >= 85) score += 25;
  else if (prefersLowImpact && meal.sustainabilityScore >= 70) score += 12;
  else if (prefersLowImpact && meal.sustainabilityScore < 50) score -= 20;

  if (!wantsHighProtein && flags.hasPlantProtein) score += 4;

  if (avoidsBeef && flags.hasBeef) score = 0;
  if (avoidsPork && flags.hasPork) score = 0;

  if (vegetarian && flags.hasMeat) score = 0;
  if (vegan && flags.hasAnimal) score = 0;

  return {
    preferenceFitScore: Math.round(clamp(score, 0, 100) * 100) / 100
  };
}

module.exports = {
  scoreRecommendation,
  scorePreferenceFit,
  isMealAllowed,
  getMealFlags,
  compareMealsForUser
};
