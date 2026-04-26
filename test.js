const {
  GRIND_NUTRITION,
  COMMON_GROUNDS_NUTRITION,
  MEIN_BOWL_COMPONENTS,
  POKE_COMPONENTS,
  scoreRetailMenu,
  scoreMeinBowl,
  scorePokeBowl,
  buildRathboneMealCandidatesFromObjects
} = require("./src");

const userPreferences = {
  wantsHighProtein: true,
  prefersLowImpact: true
};



console.log("Top Grind Items:");
console.log(scoreRetailMenu(GRIND_NUTRITION, userPreferences).slice(0, 5));

console.log("Top Common Grounds Items:");
console.log(scoreRetailMenu(COMMON_GROUNDS_NUTRITION, userPreferences).slice(0, 5));

console.log("Sample Mein Bowl:");
console.log(
  scoreMeinBowl({
    entree: MEIN_BOWL_COMPONENTS.entrees["Teriyaki Chicken"],
    base: MEIN_BOWL_COMPONENTS.bases["Brown Rice"],
    toppings: [
      MEIN_BOWL_COMPONENTS.toppings["Steamed Fresh Broccoli Florets"]
    ],
    sauce: MEIN_BOWL_COMPONENTS.sauces["Sriracha Sauce"],
    userPreferences
  })
);

console.log("Sample Poke Bowl:");
console.log(
  scorePokeBowl({
    proteins: [POKE_COMPONENTS.proteins["Salmon"]],
    base: POKE_COMPONENTS.bases["Brown Rice"],
    toppings: [
      POKE_COMPONENTS.toppings["Avocado"],
      POKE_COMPONENTS.toppings["Cucumber"]
    ],
    seasonings: [
      POKE_COMPONENTS.seasonings["Sesame Seeds"]
    ],
    userPreferences
  })
);

const sampleRathboneItems = [
  {
    formalName: "Grilled Chicken Breast",
    calories: "151",
    saturatedFat: "1g",
    sodium: "100mg",
    dietaryFiber: "0",
    addedSugar: "",
    protein: "26g"
  },
  {
    formalName: "Brazilian Rice",
    calories: "128",
    saturatedFat: "0",
    sodium: "167mg",
    dietaryFiber: "0",
    addedSugar: "",
    protein: "2g"
  },
  {
    formalName: "Roasted Vegetables",
    calories: "29",
    saturatedFat: "0",
    sodium: "107mg",
    dietaryFiber: "0",
    addedSugar: "",
    protein: "1g"
  }
];

console.log("Sample Rathbone Meals:");
console.log(
  buildRathboneMealCandidatesFromObjects(sampleRathboneItems, userPreferences)
);

const rankedMeals = scoreRetailMenu(GRIND_NUTRITION, userPreferences);
const explainedMeals = attachExplanations(rankedMeals, userPreferences);

console.log(explainedMeals.slice(0, 3));

