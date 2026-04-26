/**
 * Rathbone auto-classification + meal assembly logic
 *
 * Uses keyword-based rules to map item names from Sodexo/Lehigh menus
 * into OWID food categories, then computes meal-level sustainability
 * and nutrition scores.
 *
 * Notes:
 * - For dining halls, the page lists items, not fixed meals.
 * - This file helps assemble candidate meals from item lists.
 * - Retail locations can use the same logic, but often start from
 *   meal-level entries instead of item-level entries.
 */

// -----------------------------
// 1) OWID environmental data
// -----------------------------
const OWID = {
  "Beef (beef herd)": { carbon: 99.48, land: 326.21, water: 1451 },
  "Lamb & Mutton": { carbon: 39.72, land: 369.81, water: 1803 },
  "Pig Meat": { carbon: 12.31, land: 17.36, water: 1796 },
  "Poultry Meat": { carbon: 9.87, land: 12.22, water: 660 },
  "Fish (farmed)": { carbon: 13.63, land: 8.41, water: 3691 },
  "Prawns (farmed)": { carbon: 26.87, land: 2.97, water: 3515 },
  "Eggs": { carbon: 4.67, land: 6.27, water: 578 },
  "Cheese": { carbon: 23.88, land: 87.79, water: 5605 },
  "Milk": { carbon: 3.15, land: 8.95, water: 628 },
  "Tofu": { carbon: 3.16, land: 3.52, water: 149 },
  "Other Pulses": { carbon: 1.79, land: 15.57, water: 436 },
  "Nuts": { carbon: 0.43, land: 12.96, water: 4134 },
  "Rice": { carbon: 4.45, land: 2.80, water: 2248 },
  "Wheat & Rye": { carbon: 1.57, land: 3.85, water: 648 },
  "Oatmeal": { carbon: 2.48, land: 7.60, water: 482 },
  "Other Vegetables": { carbon: 0.53, land: 0.38, water: 103 },
  "Root Vegetables": { carbon: 0.43, land: 0.33, water: 28 },
  "Other Fruit": { carbon: 1.05, land: 0.89, water: 154 },
  "Cane Sugar": { carbon: 3.20, land: 2.04, water: 620 }
};

const MAX = {
  carbon: 99.48,
  land: 369.81,
  water: 5605
};

const ENV_BURDEN_MIN = 0.0028595005;
const ENV_BURDEN_MAX = 0.7136592078;

function clamp(x, min, max) {
  return Math.max(min, Math.min(max, x));
}

// -----------------------------
// NUTRITION SCORING
// -----------------------------
// Uses exact item nutrition values from your uploaded nutrition PDFs / JSON.
// Lower "burden" is better, then converted to a 0-100 score.

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

  // "bad" loads
  const caloriesLoad = clamp(calories / NUTRITION_REF.calories, 0, 1);
  const satFatLoad = clamp(satFat / NUTRITION_REF.satFat, 0, 1);
  const sodiumLoad = clamp(sodium / NUTRITION_REF.sodium, 0, 1);
  const addedSugarLoad = clamp(addedSugar / NUTRITION_REF.addedSugar, 0, 1);

  // "good" nutrients become gaps
  const fiberGap = 1 - clamp(fiber / NUTRITION_REF.fiber, 0, 1);
  const proteinGap = 1 - clamp(protein / NUTRITION_REF.protein, 0, 1);

  const nutritionBurden =
    (caloriesLoad + satFatLoad + sodiumLoad + addedSugarLoad + fiberGap + proteinGap) / 6;

  const nutritionScore = 100 * (1 - nutritionBurden);

  return {
    calories,
    satFat,
    sodium,
    addedSugar,
    fiber,
    protein,
    nutritionBurden: Math.round(nutritionBurden * 10000) / 10000,
    nutritionScore: Math.round(clamp(nutritionScore, 0, 100) * 100) / 100
  };
}

// -----------------------------
// 3) Environmental scoring
// -----------------------------
function scoreEnvironmentalCategory(category) {
  const d = OWID[category];
  if (!d) {
    throw new Error(`Unknown OWID category: ${category}`);
  }

  const c = d.carbon / MAX.carbon;
  const l = d.land / MAX.land;
  const w = d.water / MAX.water;
  const environmentalBurden = (c + l + w) / 3;

  const sustainabilityScore =
    100 * (ENV_BURDEN_MAX - environmentalBurden) / (ENV_BURDEN_MAX - ENV_BURDEN_MIN);

  return {
    category,
    ...d,
    normalizedCarbon: c,
    normalizedLand: l,
    normalizedWater: w,
    environmentalBurden,
    sustainabilityScore: Math.round(clamp(sustainabilityScore, 0, 100) * 100) / 100
  };
}

function scoreMealEnvironment(components) {
  // components = [{ category, weightFraction }]
  const totalWeight = components.reduce((sum, comp) => sum + comp.weightFraction, 0);

  if (totalWeight <= 0) {
    throw new Error("Meal has no weighted components.");
  }

  let burden = 0;

  for (const comp of components) {
    const part = scoreEnvironmentalCategory(comp.category);
    burden += (comp.weightFraction / totalWeight) * part.environmentalBurden;
  }

  const sustainabilityScore =
    100 * (ENV_BURDEN_MAX - burden) / (ENV_BURDEN_MAX - ENV_BURDEN_MIN);

  return {
    mealEnvironmentalBurden: burden,
    sustainabilityScore: Math.round(clamp(sustainabilityScore, 0, 100) * 100) / 100
  };
}

// -----------------------------
// 4) Item keyword classification
// -----------------------------
const ITEM_RULES = [
  // proteins
  {
    test: /\b(beef|burger|brisket|meatloaf|bolognese|steak|pot roast|beef tips)\b/i,
    category: "Beef (beef herd)",
    role: "protein"
  },
  {
    test: /\b(lamb|gyro)\b/i,
    category: "Lamb & Mutton",
    role: "protein"
  },
  {
    test: /\b(pork|ham|bacon|sausage|pepperoni|salami|prosciutto|pulled pork)\b/i,
    category: "Pig Meat",
    role: "protein"
  },
  {
    test: /\b(chicken|turkey|buffalo chicken)\b/i,
    category: "Poultry Meat",
    role: "protein"
  },
  {
    test: /\b(shrimp|prawn)\b/i,
    category: "Prawns (farmed)",
    role: "protein"
  },
  {
    test: /\b(salmon|tuna|cod|tilapia|fish)\b/i,
    category: "Fish (farmed)",
    role: "protein"
  },
  {
    test: /\b(egg|omelet|omelette|scrambled)\b/i,
    category: "Eggs",
    role: "protein"
  },
  {
    test: /\b(tofu|tempeh)\b/i,
    category: "Tofu",
    role: "protein"
  },
  {
    test: /\b(bean|beans|lentil|chickpea|falafel|hummus)\b/i,
    category: "Other Pulses",
    role: "protein"
  },

  // dairy
  {
    test: /\b(mac and cheese|mac & cheese|alfredo|cheddar|mozzarella|parmesan|queso|cheese)\b/i,
    category: "Cheese",
    role: "dairy"
  },
  {
    test: /\b(milk|cream|creamy|butter|yogurt)\b/i,
    category: "Milk",
    role: "dairy"
  },

  // grains and starches
  {
    test: /\b(rice|fried rice|pilaf)\b/i,
    category: "Rice",
    role: "grain"
  },
  {
    test: /\b(pasta|spaghetti|penne|macaroni|noodle|bread|bun|roll|wrap|tortilla|pizza|flatbread|toast|bagel|waffle|pancake|cereal)\b/i,
    category: "Wheat & Rye",
    role: "grain"
  },
  {
    test: /\b(oat|oatmeal)\b/i,
    category: "Oatmeal",
    role: "grain"
  },

  // vegetables and fruit
  {
    test: /\b(potato|fries|hash brown|sweet potato)\b/i,
    category: "Root Vegetables",
    role: "veg"
  },
  {
    test: /\b(salad|broccoli|carrot|spinach|kale|pepper|zucchini|green bean|vegetable|tomato|lettuce|onion|mushroom|cauliflower)\b/i,
    category: "Other Vegetables",
    role: "veg"
  },
  {
    test: /\b(apple|banana|berry|berries|fruit|orange|grape|melon|pineapple)\b/i,
    category: "Other Fruit",
    role: "fruit"
  },

  // sweets and fats
  {
    test: /\b(cookie|cake|brownie|syrup|jam|sweet|sugar|dessert)\b/i,
    category: "Cane Sugar",
    role: "sweetener"
  },
  {
    test: /\b(nut|almond|walnut|pecan|cashew|peanut)\b/i,
    category: "Nuts",
    role: "fat"
  }
];

function classifyItemName(itemName) {
  const matches = ITEM_RULES.filter(rule => rule.test.test(itemName));

  if (matches.length === 0) {
    return {
      itemName,
      primaryCategory: "Other Vegetables",
      role: "unknown",
      confidence: "low",
      matchedRules: []
    };
  }

  const roleRank = {
    protein: 5,
    dairy: 4,
    grain: 3,
    veg: 2,
    fruit: 2,
    sweetener: 1,
    fat: 1
  };

  matches.sort((a, b) => (roleRank[b.role] || 0) - (roleRank[a.role] || 0));

  return {
    itemName,
    primaryCategory: matches[0].category,
    role: matches[0].role,
    confidence: matches.length > 1 ? "medium" : "high",
    matchedRules: matches.map(match => ({
      category: match.category,
      role: match.role
    }))
  };
}

// -----------------------------
// 5) Rathbone item -> meal bucket logic
// -----------------------------
function bucketizeItems(itemNames) {
  const buckets = {
    proteins: [],
    grains: [],
    vegetables: [],
    fruits: [],
    dairy: [],
    sweets: [],
    misc: []
  };

  for (const itemName of itemNames) {
    const classified = classifyItemName(itemName);

    if (classified.role === "protein") {
      buckets.proteins.push(classified);
    } else if (classified.role === "grain") {
      buckets.grains.push(classified);
    } else if (classified.role === "veg") {
      buckets.vegetables.push(classified);
    } else if (classified.role === "fruit") {
      buckets.fruits.push(classified);
    } else if (classified.role === "dairy") {
      buckets.dairy.push(classified);
    } else if (classified.role === "sweetener" || classified.role === "fat") {
      buckets.sweets.push(classified);
    } else {
      buckets.misc.push(classified);
    }
  }

  return buckets;
}

function buildRathboneMealCandidates(itemNames) {
  const buckets = bucketizeItems(itemNames);
  const meals = [];

  // bowl = protein + grain + veg
  for (const protein of buckets.proteins) {
    for (const grain of buckets.grains) {
      if (buckets.vegetables.length > 0) {
        meals.push({
          template: "bowl",
          name: `${protein.itemName} + ${grain.itemName} + ${buckets.vegetables[0].itemName}`,
          components: [
            { category: protein.primaryCategory, weightFraction: 0.40 },
            { category: grain.primaryCategory, weightFraction: 0.35 },
            { category: buckets.vegetables[0].primaryCategory, weightFraction: 0.25 }
          ]
        });
      }
    }
  }

  // sandwich / wrap = grain + protein + optional dairy + optional veg
  const sandwichGrains = buckets.grains.filter(item =>
    /\b(bread|bun|roll|wrap|tortilla|bagel|toast)\b/i.test(item.itemName)
  );

  for (const grain of sandwichGrains) {
    for (const protein of buckets.proteins) {
      const veg = buckets.vegetables[0];
      const dairy = buckets.dairy[0];

      const components = [
        { category: grain.primaryCategory, weightFraction: 0.40 },
        { category: protein.primaryCategory, weightFraction: 0.35 }
      ];

      if (dairy) {
        components.push({ category: dairy.primaryCategory, weightFraction: 0.15 });
      }

      if (veg) {
        components.push({
          category: veg.primaryCategory,
          weightFraction: dairy ? 0.10 : 0.25
        });
      }

      meals.push({
        template: "sandwich",
        name: `${protein.itemName} sandwich`,
        components
      });
    }
  }

  // vegetarian bowl = tofu / beans / eggs + grain + veg
  const vegetarianProteins = buckets.proteins.filter(item =>
    item.primaryCategory === "Tofu" ||
    item.primaryCategory === "Other Pulses" ||
    item.primaryCategory === "Eggs"
  );

  for (const protein of vegetarianProteins) {
    for (const grain of buckets.grains) {
      if (buckets.vegetables.length > 0) {
        meals.push({
          template: "vegetarian_bowl",
          name: `${protein.itemName} + ${grain.itemName} + ${buckets.vegetables[0].itemName}`,
          components: [
            { category: protein.primaryCategory, weightFraction: 0.35 },
            { category: grain.primaryCategory, weightFraction: 0.30 },
            { category: buckets.vegetables[0].primaryCategory, weightFraction: 0.35 }
          ]
        });
      }
    }
  }

  return meals
    .map(meal => ({
      ...meal,
      ...scoreMealEnvironment(meal.components)
    }))
    .sort((a, b) => b.sustainabilityScore - a.sustainabilityScore);
}

// -----------------------------
// 6) Example use
// -----------------------------
const SAMPLE_RATHBONE_ITEMS = [
  "Grilled Chicken Breast",
  "Brown Rice",
  "Steamed Broccoli",
  "Cheddar Mac and Cheese",
  "Black Bean Chili",
  "Tofu Stir Fry",
  "Scrambled Eggs",
  "Turkey Sausage",
  "Whole Wheat Toast",
  "French Fries",
  "Garden Salad",
  "Cheese Pizza"
];

function sampleRun() {
  const classified = SAMPLE_RATHBONE_ITEMS.map(classifyItemName);
  const meals = buildRathboneMealCandidates(SAMPLE_RATHBONE_ITEMS);

  return {
    classified,
    meals: meals.slice(0, 10)
  };
}

// -----------------------------
// 7) Exports
// -----------------------------
module.exports = {
  OWID,
  scoreEnvironmentalCategory,
  scoreMealEnvironment,
  scoreNutrition,
  extractNutritionFields,
  combineNutritionFromItems,
  scoreRecommendation,
  scorePreferenceFit,
  classifyItemName,
  bucketizeItems,
  buildRathboneMealCandidates,
  buildRathboneMealCandidatesFromObjects,
  classifyRetailMeal,
  scoreRetailMeal,
  scoreRetailMenu,
  scoreRetailItemFromLookup,
  scoreCustomMealFromComponents,
  scoreMeinBowl,
  scorePokeBowl,
  sampleRun
};

// -----------------------------
// 8) Run sample if called directly
// -----------------------------
if (require.main === module) {
  console.log(JSON.stringify(sampleRun(), null, 2));
}

// -----------------------------
// 9) Helpers for parsing numbers
// -----------------------------
function parseNumber(value) {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  if (typeof value !== "string") return 0;

  const cleaned = value.replace(/[^0-9.\-]/g, "").trim();
  if (!cleaned) return 0;

  const num = Number(cleaned);
  return Number.isFinite(num) ? num : 0;
}

function safeAverage(values) {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

// -----------------------------
// 10) Combine sustainability + nutrition
// -----------------------------
// Default weighting:
// 50% sustainability
// 40% nutrition
// 10% preference fit
//
// You can tune this later.
function scoreRecommendation({
  sustainabilityScore = 0,
  nutritionScore = 0,
  preferenceFitScore = 50
}) {
  const finalScore =
    0.50 * sustainabilityScore +
    0.40 * nutritionScore +
    0.10 * preferenceFitScore;

  return {
    recommendationScore: Math.round(clamp(finalScore, 0, 100) * 100) / 100
  };
}

// -----------------------------
// 11) User preference fit
// -----------------------------
// Simple first version.
// Pass in userPreferences from onboarding survey.
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

  const categories = (meal.components || []).map(c => c.category);

  const hasBeef = categories.includes("Beef (beef herd)");
  const hasPork = categories.includes("Pig Meat");
  const hasAnimal =
    hasBeef ||
    hasPork ||
    categories.includes("Poultry Meat") ||
    categories.includes("Fish (farmed)") ||
    categories.includes("Prawns (farmed)") ||
    categories.includes("Eggs") ||
    categories.includes("Cheese") ||
    categories.includes("Milk");

  const hasPlantProtein =
    categories.includes("Tofu") || categories.includes("Other Pulses");

  const protein = meal.nutritionTotals?.protein || 0;

  if (wantsHighProtein && protein >= 20) score += 20;
  if (wantsHighProtein && protein < 10) score -= 10;

  if (prefersPlantBased && hasPlantProtein) score += 20;
  if (prefersPlantBased && hasAnimal) score -= 10;

  if (prefersLowImpact && meal.sustainabilityScore >= 80) score += 15;
  if (prefersLowImpact && meal.sustainabilityScore < 50) score -= 10;

  if (avoidsBeef && hasBeef) score = 0;
  if (avoidsPork && hasPork) score -= 20;

  if (vegetarian) {
    const hasMeat =
      hasBeef ||
      hasPork ||
      categories.includes("Poultry Meat") ||
      categories.includes("Fish (farmed)") ||
      categories.includes("Prawns (farmed)");
    if (hasMeat) score = 0;
  }

  if (vegan) {
    if (hasAnimal) score = 0;
  }

  return {
    preferenceFitScore: Math.round(clamp(score, 0, 100) * 100) / 100
  };
}

// -----------------------------
// 12) Nutrition aggregation for Rathbone item-built meals
// -----------------------------
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

// -----------------------------
// 13) Better Rathbone builder using actual item nutrition
// -----------------------------
// Pass full JSON item objects, not just names.
// Example item shape:
// { formalName, calories, saturatedFat, sodium, dietaryFiber, protein, ... }
function buildRathboneMealCandidatesFromObjects(itemObjects, userPreferences = {}) {
  const names = itemObjects.map(x => x.formalName);
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

    if (classified.role === "protein") buckets.proteins.push(merged);
    else if (classified.role === "grain") buckets.grains.push(merged);
    else if (classified.role === "veg") buckets.vegetables.push(merged);
    else if (classified.role === "fruit") buckets.fruits.push(merged);
    else if (classified.role === "dairy") buckets.dairy.push(merged);
    else if (classified.role === "sweetener" || classified.role === "fat") buckets.sweets.push(merged);
    else buckets.misc.push(merged);
  }

  const meals = [];

  // Bowl: protein + grain + veg
  for (const protein of buckets.proteins) {
    for (const grain of buckets.grains) {
      if (buckets.vegetables.length > 0) {
        const veg = buckets.vegetables[0];
        const mealItems = [protein.rawItem, grain.rawItem, veg.rawItem];
        const nutritionTotals = combineNutritionFromItems(mealItems);
        const env = scoreMealEnvironment([
          { category: protein.primaryCategory, weightFraction: 0.40 },
          { category: grain.primaryCategory, weightFraction: 0.35 },
          { category: veg.primaryCategory, weightFraction: 0.25 }
        ]);
        const nut = scoreNutrition(nutritionTotals);

        const meal = {
          source: "rathbone",
          template: "bowl",
          name: `${protein.itemName} + ${grain.itemName} + ${veg.itemName}`,
          itemNames: mealItems.map(x => x.formalName),
          components: [
            { category: protein.primaryCategory, weightFraction: 0.40 },
            { category: grain.primaryCategory, weightFraction: 0.35 },
            { category: veg.primaryCategory, weightFraction: 0.25 }
          ],
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

        meals.push({
          ...meal,
          ...pref,
          ...rec
        });
      }
    }
  }

  // Breakfast plate: egg/tofu/meat + potato/toast/oatmeal + optional veg
  const breakfastProteins = buckets.proteins.filter(p =>
    ["Eggs", "Tofu", "Pig Meat", "Poultry Meat"].includes(p.primaryCategory)
  );
  const breakfastGrains = buckets.grains.concat(
    buckets.vegetables.filter(v => v.primaryCategory === "Root Vegetables")
  );

  for (const protein of breakfastProteins) {
    for (const base of breakfastGrains) {
      const sideVeg = buckets.vegetables.find(v => v !== base) || null;
      const mealItems = sideVeg ? [protein.rawItem, base.rawItem, sideVeg.rawItem] : [protein.rawItem, base.rawItem];
      const nutritionTotals = combineNutritionFromItems(mealItems);

      const components = [
        { category: protein.primaryCategory, weightFraction: 0.45 },
        { category: base.primaryCategory, weightFraction: 0.35 }
      ];

      if (sideVeg) {
        components.push({ category: sideVeg.primaryCategory, weightFraction: 0.20 });
      }

      const env = scoreMealEnvironment(components);
      const nut = scoreNutrition(nutritionTotals);

      const meal = {
        source: "rathbone",
        template: "breakfast_plate",
        name: mealItems.map(x => x.formalName).join(" + "),
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

      meals.push({
        ...meal,
        ...pref,
        ...rec
      });
    }
  }

  return meals.sort((a, b) => b.recommendationScore - a.recommendationScore);
}

// -----------------------------
// 14) Retail meal classifier
// -----------------------------
// Retail menus are mostly prebuilt meals, so classify the whole item first.
// This uses the title and sometimes the description.
function classifyRetailMeal(itemName, description = "") {
  const text = `${itemName} ${description}`.toLowerCase();

  // Smoothies / drinks
  if (text.includes("smoothie")) {
    return {
      type: "smoothie",
      components: [
        { category: "Other Fruit", weightFraction: 0.60 },
        { category: "Milk", weightFraction: 0.25 },
        { category: "Cane Sugar", weightFraction: 0.15 }
      ]
    };
  }

  if (text.includes("acai")) {
    return {
      type: "smoothie_bowl",
      components: [
        { category: "Other Fruit", weightFraction: 0.45 },
        { category: "Cane Sugar", weightFraction: 0.10 },
        { category: "Nuts", weightFraction: 0.10 },
        { category: "Oatmeal", weightFraction: 0.20 },
        { category: "Other Fruit", weightFraction: 0.15 }
      ]
    };
  }

  if (
    text.includes("coffee") ||
    text.includes("latte") ||
    text.includes("mocha") ||
    text.includes("macchiato") ||
    text.includes("americano") ||
    text.includes("cappuccino") ||
    text.includes("cold brew") ||
    text.includes("tea") ||
    text.includes("hot chocolate")
  ) {
    let components = [];

    if (text.includes("latte") || text.includes("mocha") || text.includes("cappuccino") || text.includes("macchiato") || text.includes("hot chocolate")) {
      components = [
        { category: "Milk", weightFraction: 0.70 },
        { category: "Cane Sugar", weightFraction: text.includes("mocha") || text.includes("caramel") || text.includes("white chocolate") ? 0.20 : 0.05 },
        { category: "Other Fruit", weightFraction: 0.10 } // placeholder for coffee/tea liquids; keeps structure simple
      ];
    } else {
      components = [
        { category: "Other Fruit", weightFraction: 0.90 }, // placeholder for low-impact beverage base
        { category: "Cane Sugar", weightFraction: text.includes("frappe") || text.includes("matcha") ? 0.10 : 0.00 }
      ];
    }

    return {
      type: "beverage",
      components
    };
  }

  // Breakfast sandwiches
  if (text.includes("breakfast sandwich")) {
    if (text.includes("plant-based")) {
      return {
        type: "breakfast_sandwich",
        components: [
          { category: "Wheat & Rye", weightFraction: 0.35 },
          { category: "Other Pulses", weightFraction: 0.25 },
          { category: "Cheese", weightFraction: 0.20 },
          { category: "Other Vegetables", weightFraction: 0.20 }
        ]
      };
    }

    if (
      text.includes("bacon") ||
      text.includes("ham") ||
      text.includes("sausage") ||
      text.includes("turkey sausage")
    ) {
      const proteinCategory =
        text.includes("turkey") ? "Poultry Meat" : "Pig Meat";

      return {
        type: "breakfast_sandwich",
        components: [
          { category: "Wheat & Rye", weightFraction: 0.35 },
          { category: "Eggs", weightFraction: 0.20 },
          { category: "Cheese", weightFraction: 0.20 },
          { category: proteinCategory, weightFraction: 0.25 }
        ]
      };
    }

    return {
      type: "breakfast_sandwich",
      components: [
        { category: "Wheat & Rye", weightFraction: 0.40 },
        { category: "Eggs", weightFraction: 0.25 },
        { category: "Cheese", weightFraction: 0.20 },
        { category: "Milk", weightFraction: 0.15 }
      ]
    };
  }

  // Bagels / pastries / bakery
  if (
    text.includes("bagel") ||
    text.includes("croissant") ||
    text.includes("muffin") ||
    text.includes("donut") ||
    text.includes("cookie") ||
    text.includes("danish") ||
    text.includes("brownie")
  ) {
    const hasCreamCheese = text.includes("cream cheese");
    return {
      type: "bakery",
      components: hasCreamCheese
        ? [
            { category: "Wheat & Rye", weightFraction: 0.65 },
            { category: "Cheese", weightFraction: 0.20 },
            { category: "Cane Sugar", weightFraction: 0.15 }
          ]
        : [
            { category: "Wheat & Rye", weightFraction: 0.65 },
            { category: "Cane Sugar", weightFraction: 0.25 },
            { category: "Milk", weightFraction: 0.10 }
          ]
    };
  }

  // Sandwiches
  if (
    text.includes("sandwich") ||
    text.includes("club") ||
    text.includes("ciabatta") ||
    text.includes("focaccia") ||
    text.includes("panini") ||
    text.includes("baguette") ||
    text.includes("sub") ||
    text.includes("subhub") ||
    text.includes("wrap")
  ) {
    let proteinCategory = "Other Pulses";

    if (text.includes("beef") || text.includes("meatball")) proteinCategory = "Beef (beef herd)";
    else if (text.includes("ham") || text.includes("salami") || text.includes("capicola") || text.includes("bacon")) proteinCategory = "Pig Meat";
    else if (text.includes("chicken") || text.includes("turkey")) proteinCategory = "Poultry Meat";
    else if (text.includes("tuna")) proteinCategory = "Fish (farmed)";

    return {
      type: "sandwich",
      components: [
        { category: "Wheat & Rye", weightFraction: 0.35 },
        { category: proteinCategory, weightFraction: 0.30 },
        { category: "Cheese", weightFraction: /mozzarella|provolone|swiss|american|parmesan|cheese/i.test(text) ? 0.15 : 0.05 },
        { category: "Other Vegetables", weightFraction: 0.15 },
        { category: "Cane Sugar", weightFraction: 0.05 }
      ]
    };
  }

  // Soup
  if (text.includes("soup")) {
    return {
      type: "soup",
      components: [
        { category: "Other Vegetables", weightFraction: 0.45 },
        { category: "Other Pulses", weightFraction: 0.20 },
        { category: "Wheat & Rye", weightFraction: 0.15 },
        { category: "Milk", weightFraction: 0.20 }
      ]
    };
  }

  // Quesadilla
  if (text.includes("quesadilla")) {
    let proteinCategory = "Other Pulses";
    if (text.includes("chicken")) proteinCategory = "Poultry Meat";
    if (text.includes("buffalo chicken")) proteinCategory = "Poultry Meat";
    if (text.includes("mushroom")) proteinCategory = "Other Vegetables";
    if (text.includes("impossible")) proteinCategory = "Other Pulses";

    return {
      type: "quesadilla",
      components: [
        { category: "Wheat & Rye", weightFraction: 0.35 },
        { category: proteinCategory, weightFraction: 0.25 },
        { category: "Cheese", weightFraction: 0.30 },
        { category: "Other Vegetables", weightFraction: 0.10 }
      ]
    };
  }

  // Bowls
  if (text.includes("bowl")) {
    let proteinCategory = "Other Pulses";

    if (text.includes("beef")) proteinCategory = "Beef (beef herd)";
    else if (text.includes("chicken")) proteinCategory = "Poultry Meat";
    else if (text.includes("shrimp")) proteinCategory = "Prawns (farmed)";
    else if (text.includes("tofu")) proteinCategory = "Tofu";
    else if (text.includes("salmon") || text.includes("tuna")) proteinCategory = "Fish (farmed)";

    let baseCategory = "Rice";
    if (text.includes("lo mein")) baseCategory = "Wheat & Rye";
    if (text.includes("veggies only")) baseCategory = "Other Vegetables";

    return {
      type: "bowl",
      components: [
        { category: proteinCategory, weightFraction: 0.35 },
        { category: baseCategory, weightFraction: 0.35 },
        { category: "Other Vegetables", weightFraction: 0.20 },
        { category: "Cane Sugar", weightFraction: 0.10 }
      ]
    };
  }

  // Sushi / poke / seafood combos
  if (
    text.includes("poke") ||
    text.includes("sushi") ||
    text.includes("nigiri") ||
    text.includes("roll") ||
    text.includes("salmon") ||
    text.includes("tuna")
  ) {
    let proteinCategory = "Fish (farmed)";
    if (text.includes("shrimp")) proteinCategory = "Prawns (farmed)";
    if (text.includes("tofu")) proteinCategory = "Tofu";

    return {
      type: "sushi_poke",
      components: [
        { category: proteinCategory, weightFraction: 0.30 },
        { category: "Rice", weightFraction: 0.35 },
        { category: "Other Vegetables", weightFraction: 0.20 },
        { category: "Cane Sugar", weightFraction: 0.05 },
        { category: "Nuts", weightFraction: 0.10 }
      ]
    };
  }

  // Handheld default
  if (text.includes("handheld") || text.includes("burger") || text.includes("caesar wrap")) {
    let proteinCategory = "Beef (beef herd)";
    if (text.includes("chicken")) proteinCategory = "Poultry Meat";
    if (text.includes("veggie")) proteinCategory = "Other Pulses";
    if (text.includes("impossible")) proteinCategory = "Other Pulses";

    return {
      type: "handheld",
      components: [
        { category: "Wheat & Rye", weightFraction: 0.35 },
        { category: proteinCategory, weightFraction: 0.30 },
        { category: "Cheese", weightFraction: 0.10 },
        { category: "Other Vegetables", weightFraction: 0.15 },
        { category: "Cane Sugar", weightFraction: 0.10 }
      ]
    };
  }

  // fallback
  return {
    type: "unknown",
    components: [
      { category: "Other Vegetables", weightFraction: 0.40 },
      { category: "Wheat & Rye", weightFraction: 0.30 },
      { category: "Other Pulses", weightFraction: 0.30 }
    ]
  };
}

// -----------------------------
// 15) Retail meal scoring
// -----------------------------
// Pass full retail item info if you have it:
// { name, description, calories, satFat, sodium, addedSugar, fiber, protein }
function scoreRetailMeal(retailItem, userPreferences = {}) {
  const classification = classifyRetailMeal(
    retailItem.name || retailItem.formalName || "",
    retailItem.description || ""
  );

  const env = scoreMealEnvironment(classification.components);

  const nutritionTotals = extractNutritionFields(retailItem);
  const nut = scoreNutrition(nutritionTotals);

  const meal = {
    source: "retail",
    type: classification.type,
    name: retailItem.name || retailItem.formalName || "Unknown Item",
    description: retailItem.description || "",
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
  // entree/base/toppings/sauce should each include:
  // name, nutrition fields, and OWID category mapping

  const nutritionItems = [entree, base, ...toppings];
  if (sauce) nutritionItems.push(sauce);

  const components = [
    { category: entree.owidCategory, weightFraction: 0.35 },
    { category: base.owidCategory, weightFraction: 0.35 },
    { category: "Other Vegetables", weightFraction: 0.20 },
    { category: sauce ? "Cane Sugar" : "Other Vegetables", weightFraction: 0.10 }
  ];

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

  const proteinWeight = proteins.length === 2 ? 0.35 : 0.25;
  const baseWeight = 0.35;
  const veggieWeight = 0.25;
  const seasoningWeight = 0.05;

  let proteinCategory = "Fish (farmed)";
  if (proteins.some(p => /shrimp/i.test(p.name))) proteinCategory = "Prawns (farmed)";
  if (proteins.some(p => /tofu/i.test(p.name))) proteinCategory = "Tofu";
  if (proteins.some(p => /chicken/i.test(p.name))) proteinCategory = "Poultry Meat";

  const components = [
    { category: proteinCategory, weightFraction: proteinWeight },
    { category: base.owidCategory, weightFraction: baseWeight },
    { category: "Other Vegetables", weightFraction: veggieWeight },
    { category: "Cane Sugar", weightFraction: seasoningWeight }
  ];

  return scoreCustomMealFromComponents({
    name: `Poke Bowl: ${proteins.map(p => p.name).join(" + ")} + ${base.name}`,
    components,
    nutritionItems,
    userPreferences,
    source: "poke"
  });
}

// -----------------------------
// 16) Batch scoring for retail menus
// -----------------------------
function scoreRetailMenu(retailItems, userPreferences = {}) {
  return retailItems
    .map(item => scoreRetailMeal(item, userPreferences))
    .sort((a, b) => b.recommendationScore - a.recommendationScore);
}

function extractNutritionFields(item) {
  return {
    calories:
      item.calories ??
      item["Calories (kcal)"] ??
      item["Calories"] ??
      0,

    satFat:
      item.satFat ??
      item.saturatedFat ??
      item["Sat Fat(g)"] ??
      item["Saturated Fat (g)"] ??
      0,

    sodium:
      item.sodium ??
      item["Sodium (mg)"] ??
      0,

    addedSugar:
      item.addedSugar ??
      item["Added Sugar (g)"] ??
      item["Added Sugars (g)"] ??
      0,

    fiber:
      item.fiber ??
      item.dietaryFiber ??
      item["Fiber (g)"] ??
      item["Dietary Fiber (g)"] ??
      0,

    protein:
      item.protein ??
      item["Protein (g)"] ??
      0
  };
}

function scoreRetailItemFromLookup(menuLookup, itemName, userPreferences = {}) {
  const item = menuLookup[itemName];
  if (!item) {
    throw new Error(`Nutrition data not found for item: ${itemName}`);
  }
  return scoreRetailMeal(item, userPreferences);
}

