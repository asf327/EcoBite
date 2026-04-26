const { combineNutritionFromItems, scoreNutrition } = require("../utils/nutritionScoring");
const { scoreMealEnvironment } = require("../utils/sustainabilityScoring");
const { scorePreferenceFit, scoreRecommendation } = require("../utils/preferenceScoring");

function scoreCustomMealFromComponents({
  name,
  components,
  nutritionItems,
  userPreferences = {},
  source = "custom"
}) {
  const env = scoreMealEnvironment(components);
  const nutritionTotals = combineNutritionFromItems(nutritionItems);
  const nut = scoreNutrition(nutritionTotals);

  const meal = {
    source,
    name,
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

  return {
    ...meal,
    ...pref,
    ...rec
  };
}

function scoreMeinBowl({
  entree,
  base,
  toppings = [],
  sauce = null,
  userPreferences = {}
}) {
  const nutritionItems = [entree, base, ...toppings];

  if (sauce) {
    nutritionItems.push(sauce);
  }

  const toppingWeight = toppings.length > 0 ? 0.2 : 0.1;
  const sauceWeight = sauce ? 0.1 : 0;

  const components = [
    { category: entree.owidCategory, weightFraction: 0.35 },
    { category: base.owidCategory, weightFraction: 0.35 },
    { category: "Other Vegetables", weightFraction: toppingWeight },
    { category: sauce ? sauce.owidCategory : "Other Vegetables", weightFraction: sauceWeight }
  ].filter(component => component.weightFraction > 0);

  return scoreCustomMealFromComponents({
    name: `Mein Bowl: ${entree.name} + ${base.name}`,
    components,
    nutritionItems,
    userPreferences,
    source: "mein_bowl"
  });
}

function scorePokeBowl({
  proteins = [],
  base,
  toppings = [],
  seasonings = [],
  userPreferences = {}
}) {
  const nutritionItems = [base, ...proteins, ...toppings, ...seasonings];

  let proteinCategory = "Fish (farmed)";

  if (proteins.some(protein => /shrimp/i.test(protein.name))) {
    proteinCategory = "Prawns (farmed)";
  }

  if (proteins.some(protein => /tofu/i.test(protein.name))) {
    proteinCategory = "Tofu";
  }

  if (proteins.some(protein => /chicken/i.test(protein.name))) {
    proteinCategory = "Poultry Meat";
  }

  const components = [
    { category: proteinCategory, weightFraction: proteins.length > 1 ? 0.35 : 0.25 },
    { category: base.owidCategory, weightFraction: 0.35 },
    { category: "Other Vegetables", weightFraction: 0.25 },
    { category: "Cane Sugar", weightFraction: 0.05 }
  ];

  return scoreCustomMealFromComponents({
    name: `Poke Bowl: ${proteins.map(protein => protein.name).join(" + ")} + ${base.name}`,
    components,
    nutritionItems,
    userPreferences,
    source: "poke"
  });
}

module.exports = {
  scoreCustomMealFromComponents,
  scoreMeinBowl,
  scorePokeBowl
};