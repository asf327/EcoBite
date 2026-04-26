const ITEM_RULES = [
  {
    test: /\b(beef|burger|brisket|meatloaf|bolognese|steak|pot roast|roast beef|beef tips)\b/i,
    category: "Beef (beef herd)",
    role: "protein"
  },
  {
    test: /\b(cheeseburger|hamburger|burger|sandwich)\b/i,
    category: "Beef (beef herd)",
    role: "protein"
  },
  {
    test: /\b(chicken sandwich|chicken patty sandwich|baja chicken sandwich)\b/i,
    category: "Poultry Meat",
    role: "protein"
  },
  {
    test: /\b(lamb|mutton|gyro)\b/i,
    category: "Lamb & Mutton",
    role: "protein"
  },
  {
    test: /\b(pork|ham|bacon|sausage|pepperoni|salami|prosciutto|pulled pork)\b/i,
    category: "Pig Meat",
    role: "protein"
  },
  {
    test: /\b(chicken|turkey|buffalo chicken|poultry)\b/i,
    category: "Poultry Meat",
    role: "protein"
  },
  {
    test: /\b(shrimp|prawn)\b/i,
    category: "Prawns (farmed)",
    role: "protein"
  },
  {
    test: /\b(salmon|tuna|cod|tilapia|fish|seafood)\b/i,
    category: "Fish (farmed)",
    role: "protein"
  },
  {
    test: /\b(egg roll|spring roll|vegetable egg roll)\b/i,
    category: "Wheat & Rye",
    role: "grain"
  },
  {
    test: /\b(scrambled tofu|tofu scramble)\b/i,
    category: "Tofu",
    role: "protein"
  },
  {
    test: /\b(egg|eggs|omelet|omelette|scrambled)\b/i,
    exclude: /\b(egg roll|spring roll|vegetable egg roll)\b/i,
    category: "Eggs",
    role: "protein"
  },
  {
    test: /\b(tofu|tempeh)\b/i,
    category: "Tofu",
    role: "protein"
  },
  {
    test: /\b(bean|beans|lentil|lentils|chickpea|chickpeas|falafel|hummus|edamame)\b/i,
    category: "Other Pulses",
    role: "protein"
  },

  {
    test: /\b(mac and cheese|mac & cheese|alfredo|cheddar|mozzarella|parmesan|queso|cheese|provolone|swiss|gouda|cream cheese)\b/i,
    category: "Cheese",
    role: "dairy"
  },
  {
    test: /\b(milk|cream|creamy|butter|yogurt|ranch|aioli|mayo)\b/i,
    category: "Milk",
    role: "dairy"
  },

  {
    test: /\b(rice|fried rice|pilaf)\b/i,
    category: "Rice",
    role: "grain"
  },
  {
    test: /\b(pasta|spaghetti|penne|macaroni|noodle|lo mein|bread|bun|roll|wrap|tortilla|pizza|flatbread|toast|bagel|waffle|pancake|cereal|ciabatta|focaccia|croissant|pretzel|baguette|sub)\b/i,
    category: "Wheat & Rye",
    role: "grain"
  },
  {
    test: /\b(oat|oats|oatmeal|granola)\b/i,
    category: "Oatmeal",
    role: "grain"
  },

  {
    test: /\b(potato|potatoes|fries|hash brown|hash browns|sweet potato)\b/i,
    category: "Root Vegetables",
    role: "veg"
  },
  {
    test: /\b(salad|broccoli|carrot|spinach|kale|pepper|peppers|zucchini|green bean|vegetable|vegetables|tomato|tomatoes|lettuce|onion|onions|mushroom|mushrooms|cauliflower|cucumber|cabbage|radish|portobello|portabello)\b/i,
    category: "Other Vegetables",
    role: "veg"
  },
  {
    test: /\b(apple|banana|berry|berries|fruit|orange|grape|melon|pineapple|mango|kiwi|peach|avocado|coconut|cranberry)\b/i,
    category: "Other Fruit",
    role: "fruit"
  },

  {
    test: /\b(cookie|cake|brownie|syrup|jam|sweet|sugar|dessert|donut|danish|honey|chocolate)\b/i,
    category: "Cane Sugar",
    role: "sweetener"
  },
  {
    test: /\b(nut|nuts|almond|walnut|pecan|cashew|peanut|peanuts|sesame)\b/i,
    category: "Nuts",
    role: "fat"
  }
];

function classifyItemName(itemName = "") {
  const matches = ITEM_RULES.filter(rule => {
    if (!rule.test.test(itemName)) return false;

    if (rule.exclude && rule.exclude.test(itemName)) {
      return false;
    }

    return true;
  });

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

module.exports = {
  ITEM_RULES,
  classifyItemName
};