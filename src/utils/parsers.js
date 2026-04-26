function clamp(x, min, max) {
  return Math.max(min, Math.min(max, x));
}

function parseNumber(value) {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  if (typeof value !== "string") return 0;

  const cleaned = value.replace(/[^0-9.\-]/g, "").trim();
  if (!cleaned) return 0;

  const num = Number(cleaned);
  return Number.isFinite(num) ? num : 0;
}

function extractNutritionFields(item) {
  return {
    calories: item.calories ?? item["Calories (kcal)"] ?? item["Calories"] ?? 0,
    satFat: item.satFat ?? item.saturatedFat ?? item["Sat Fat(g)"] ?? item["Saturated Fat (g)"] ?? 0,
    sodium: item.sodium ?? item["Sodium (mg)"] ?? 0,
    addedSugar: item.addedSugar ?? item["Added Sugar (g)"] ?? item["Added Sugars (g)"] ?? 0,
    fiber: item.fiber ?? item.dietaryFiber ?? item["Fiber (g)"] ?? item["Dietary Fiber (g)"] ?? 0,
    protein: item.protein ?? item["Protein (g)"] ?? 0
  };
}

module.exports = {
  clamp,
  parseNumber,
  extractNutritionFields
};