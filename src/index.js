const { OWID } = require("./data/owidData");

const {
  GRIND_NUTRITION
} = require("./data/retailNutrition/grindNutrition");

const {
  COMMON_GROUNDS_NUTRITION
} = require("./data/retailNutrition/commonGroundsNutrition");

const {
  HIDEAWAY_NUTRITION
} = require("./data/retailNutrition/hideawayNutrition");

const {
  NEST_AT_NIGHT_NUTRITION
} = require("./data/retailNutrition/nestAtNightNutrition");

const {
  MEIN_BOWL_COMPONENTS
} = require("./data/retailNutrition/meinBowlNutrition");

const {
  POKE_COMPONENTS
} = require("./data/retailNutrition/pokeNutrition");

const {
  parseNumber,
  extractNutritionFields
} = require("./utils/parsers");

const {
  scoreNutrition,
  combineNutritionFromItems
} = require("./utils/nutritionScoring");

const {
  scoreEnvironmentalCategory,
  scoreMealEnvironment
} = require("./utils/sustainabilityScoring");

const {
  scoreRecommendation,
  scorePreferenceFit
} = require("./utils/preferenceScoring");

const {
  classifyItemName
} = require("./classifiers/itemClassifier");

const {
  classifyRetailMeal
} = require("./classifiers/retailClassifier");

const {
  buildRathboneMealCandidatesFromObjects
} = require("./builders/rathboneBuilder");

const {
  scoreRetailMeal,
  scoreRetailMenu,
  scoreRetailItemFromLookup
} = require("./builders/retailScorer");

const {
  scoreCustomMealFromComponents,
  scoreMeinBowl,
  scorePokeBowl
} = require("./builders/modularBuilders");

const {
  buildWhyRecommended,
  attachExplanations
} = require("./utils/explanationLogic");

module.exports = {
  OWID,

  GRIND_NUTRITION,
  COMMON_GROUNDS_NUTRITION,
  HIDEAWAY_NUTRITION,
  NEST_AT_NIGHT_NUTRITION,
  MEIN_BOWL_COMPONENTS,
  POKE_COMPONENTS,

  parseNumber,
  extractNutritionFields,

  scoreNutrition,
  combineNutritionFromItems,

  scoreEnvironmentalCategory,
  scoreMealEnvironment,

  scoreRecommendation,
  scorePreferenceFit,

  classifyItemName,
  classifyRetailMeal,

  buildRathboneMealCandidatesFromObjects,

  scoreRetailMeal,
  scoreRetailMenu,
  scoreRetailItemFromLookup,

  scoreCustomMealFromComponents,
  scoreMeinBowl,
  scorePokeBowl,

  buildWhyRecommended,
  attachExplanations
};

