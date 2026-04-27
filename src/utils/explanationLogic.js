function getScoreLabel(score) {
  if (score >= 85) return "excellent";
  if (score >= 70) return "strong";
  if (score >= 55) return "moderate";
  return "low";
}

function getMainProteinCategory(meal) {
  const categories = (meal.components || []).map(c => c.category);

  if (categories.includes("Beef (beef herd)")) return "beef";
  if (categories.includes("Lamb & Mutton")) return "lamb";
  if (categories.includes("Pig Meat")) return "pork";
  if (categories.includes("Poultry Meat")) return "chicken/turkey";
  if (categories.includes("Fish (farmed)")) return "fish";
  if (categories.includes("Prawns (farmed)")) return "shrimp";
  if (categories.includes("Tofu")) return "tofu";
  if (categories.includes("Other Pulses")) return "beans/lentils";
  if (categories.includes("Eggs")) return "eggs";

  return "plant-forward";
}

function buildWhyRecommended(meal, userPreferences = {}) {
  const reasons = [];

  const sustainabilityScore = meal.sustainabilityScore || 0;
  const nutritionScore = meal.nutritionScore || 0;
  const protein = meal.nutritionTotals?.protein || meal.protein || 0;
  const fiber = meal.nutritionTotals?.fiber || meal.fiber || 0;
  const sodium = meal.nutritionTotals?.sodium || meal.sodium || 0;
  const satFat = meal.nutritionTotals?.satFat || meal.satFat || 0;
  const addedSugar = meal.nutritionTotals?.addedSugar || meal.addedSugar || 0;

  const proteinCategory = getMainProteinCategory(meal);

  if (sustainabilityScore >= 85) {
    reasons.push("It has a strong sustainability score because it avoids the highest-impact food categories.");
  } else if (sustainabilityScore >= 70) {
    reasons.push("It has a moderate-to-strong sustainability score compared with many meat-heavy options.");
  } else {
    reasons.push("Its sustainability score is lower because it includes higher-impact ingredients.");
  }

  if (protein >= 25) {
    reasons.push(`It is high in protein with about ${protein}g of protein.`);
  } else if (protein >= 15) {
    reasons.push(`It provides a decent amount of protein with about ${protein}g.`);
  }

  if (fiber >= 5) {
    reasons.push(`It has a good fiber amount with about ${fiber}g of fiber.`);
  }

  if (sodium >= 1500) {
    reasons.push(`One drawback is that it is high in sodium at about ${sodium}mg.`);
  } else if (sodium <= 700) {
    reasons.push(`It keeps sodium relatively reasonable at about ${sodium}mg.`);
  }

  if (satFat >= 10) {
    reasons.push(`It is higher in saturated fat at about ${satFat}g, so it may not be the best everyday option.`);
  }

  if (addedSugar >= 15) {
    reasons.push(`It is higher in added sugar at about ${addedSugar}g.`);
  }

  if (userPreferences.wantsHighProtein && protein >= 20) {
    reasons.push("It matches your high-protein preference.");
  }

  if (userPreferences.prefersLowImpact && sustainabilityScore >= 80) {
    reasons.push("It matches your low-impact preference.");
  }

  if (userPreferences.vegan) {
    reasons.push("It fits your vegan preference because it avoids animal products.");
  } else if (userPreferences.vegetarian) {
    reasons.push("It fits your vegetarian preference because it avoids meat.");
  }

  return {
    scoreSummary: `${getScoreLabel(meal.recommendationScore || 0)} recommendation`,
    mainProteinCategory: proteinCategory,
    whyRecommended: reasons.slice(0, 4)
  };
}

function attachExplanations(meals, userPreferences = {}) {
  return meals.map(meal => ({
    ...meal,
    ...buildWhyRecommended(meal, userPreferences)
  }));
}

module.exports = {
  buildWhyRecommended,
  attachExplanations
};
