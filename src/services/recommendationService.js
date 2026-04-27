const { loadRathboneItems } = require("./rathboneLoader");
const {
  getTodayDateString,
  getCurrentMealPeriod
} = require("./mealTimeService");
const {
  ensureRathboneMenuForDate
} = require("./rathboneFetchService");
const { loadDormMeals } = require("./dormMealLoader");

const {
  buildRathboneMealCandidatesFromObjects,
  buildRathboneAllItemsFromObjects
} = require("../builders/rathboneBuilder");

const {
  scoreRetailMenu
} = require("../builders/retailScorer");

const {
  scoreDormMeals
} = require("../builders/dormMealScorer");

const {
  attachExplanations
} = require("../utils/explanationLogic");

const {
  GRIND_NUTRITION
} = require("../data/retailNutrition/grindNutrition");

const {
  COMMON_GROUNDS_NUTRITION
} = require("../data/retailNutrition/commonGroundsNutrition");

const {
  HIDEAWAY_NUTRITION
} = require("../data/retailNutrition/hideawayNutrition");

const {
  NEST_AT_NIGHT_NUTRITION
} = require("../data/retailNutrition/nestAtNightNutrition");

function getRetailLookup(location) {
  if (location === "grind") return GRIND_NUTRITION;
  if (location === "common-grounds") return COMMON_GROUNDS_NUTRITION;
  if (location === "hideaway") return HIDEAWAY_NUTRITION;
  if (location === "nest-at-night") return NEST_AT_NIGHT_NUTRITION;

  throw new Error(`Unknown retail location: ${location}`);
}

async function getRecommendations({
  location,
  menuDate,
  mealPeriod,
  view = "recommended",
  userPreferences = {},
  limit = 10
}) {
  let meals = [];
  if (location === "rathbone") {
    const resolvedDate = menuDate || getTodayDateString();
    const resolvedMealPeriod = mealPeriod || getCurrentMealPeriod();

    await ensureRathboneMenuForDate(resolvedDate);

    let rathboneItems = loadRathboneItems(resolvedDate);

    rathboneItems = rathboneItems.filter(item => {
      const itemMealPeriod = String(item.mealPeriod || "").toLowerCase();
      const targetMealPeriod = String(resolvedMealPeriod || "").toLowerCase();

      return itemMealPeriod.includes(targetMealPeriod);
    });

    if (view === "all") {
      meals = buildRathboneAllItemsFromObjects(rathboneItems, userPreferences);
    } else {
      meals = buildRathboneMealCandidatesFromObjects(
        rathboneItems,
        userPreferences
      );

      meals = attachExplanations(meals, userPreferences);
    }

    return meals.slice(0, limit).map(meal => ({
      ...meal,
      date: resolvedDate,
      mealPeriod: resolvedMealPeriod
    }));
  }
  else if (location === "dorm") {
        const dormMeals = loadDormMeals();
        meals = scoreDormMeals(dormMeals, userPreferences);
    } else {
        const lookup = getRetailLookup(location);
        meals = scoreRetailMenu(lookup, userPreferences);
        meals = attachExplanations(meals, userPreferences);
    }

    return meals.slice(0, limit);
}

module.exports = {
  getRecommendations
};
