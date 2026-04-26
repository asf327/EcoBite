const DORM_MEALS = {
  "Chicken Rice Bowl": {
    name: "Chicken Rice Bowl",
    owidComponents: [
      { category: "Poultry Meat", weightFraction: 0.4 },
      { category: "Rice", weightFraction: 0.4 },
      { category: "Other Vegetables", weightFraction: 0.2 }
    ],
    calories: 550,
    satFat: 4,
    sodium: 700,
    addedSugar: 2,
    fiber: 4,
    protein: 35
  },

  "Pasta with Tomato Sauce": {
    name: "Pasta with Tomato Sauce",
    owidComponents: [
      { category: "Wheat & Rye", weightFraction: 0.6 },
      { category: "Other Vegetables", weightFraction: 0.3 },
      { category: "Cane Sugar", weightFraction: 0.1 }
    ],
    calories: 450,
    satFat: 2,
    sodium: 500,
    addedSugar: 6,
    fiber: 5,
    protein: 12
  },

  "Egg Sandwich": {
    name: "Egg Sandwich",
    owidComponents: [
      { category: "Wheat & Rye", weightFraction: 0.4 },
      { category: "Eggs", weightFraction: 0.4 },
      { category: "Milk", weightFraction: 0.2 }
    ],
    calories: 400,
    satFat: 6,
    sodium: 650,
    addedSugar: 2,
    fiber: 2,
    protein: 18
  },

  "Peanut Butter Banana Toast": {
    name: "Peanut Butter Banana Toast",
    owidComponents: [
      { category: "Wheat & Rye", weightFraction: 0.5 },
      { category: "Nuts", weightFraction: 0.3 },
      { category: "Other Fruit", weightFraction: 0.2 }
    ],
    calories: 420,
    satFat: 3,
    sodium: 300,
    addedSugar: 5,
    fiber: 6,
    protein: 14
  },

  "Ramen with Egg": {
    name: "Ramen with Egg",
    owidComponents: [
      { category: "Wheat & Rye", weightFraction: 0.5 },
      { category: "Eggs", weightFraction: 0.2 },
      { category: "Other Vegetables", weightFraction: 0.3 }
    ],
    calories: 600,
    satFat: 5,
    sodium: 1800,
    addedSugar: 2,
    fiber: 2,
    protein: 20
  },

  "Veggie Stir Fry with Rice": {
    name: "Veggie Stir Fry with Rice",
    owidComponents: [
      { category: "Rice", weightFraction: 0.4 },
      { category: "Other Vegetables", weightFraction: 0.5 },
      { category: "Other Pulses", weightFraction: 0.1 }
    ],
    calories: 480,
    satFat: 2,
    sodium: 600,
    addedSugar: 3,
    fiber: 7,
    protein: 12
  }
};

module.exports = { DORM_MEALS };