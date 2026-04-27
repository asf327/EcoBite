const fs = require("fs");
const path = require("path");

function mapProteinCategoryToOwid(proteinCategory) {
  switch ((proteinCategory || "").toLowerCase()) {
    case "beef":
      return "Beef (beef herd)";
    case "lamb":
      return "Lamb & Mutton";
    case "pork":
      return "Pig Meat";
    case "chicken":
    case "turkey":
      return "Poultry Meat";
    case "fish":
      return "Fish (farmed)";
    case "egg":
      return "Eggs";
    case "dairy_heavy":
      return "Cheese";
    case "vegan":
      return "Tofu";
    case "vegetarian":
      return "Other Pulses";
    case "legume_based":
      return "Other Pulses";
    default:
      return "Other Pulses";
  }
}

function buildDormMealComponents(row) {
  const components = [];
  const primaryCategory = mapProteinCategoryToOwid(row.protein_category);

  components.push({
    category: primaryCategory,
    weightFraction: row.dairy_heavy === "yes" ? 0.7 : 0.8
  });

  if (row.dairy_heavy === "yes") {
    components.push({
      category: "Cheese",
      weightFraction: 0.3
    });
  } else {
    components.push({
      category: row.plant_forward_level === "high" ? "Other Vegetables" : "Wheat & Rye",
      weightFraction: 0.2
    });
  }

  return components;
}

function parseCsvLine(line) {
  const result = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

function parseDormMealsCsv(csvText) {
  const lines = csvText.trim().split(/\r?\n/);
  const headers = parseCsvLine(lines[0]);

  return lines.slice(1).map(line => {
    const values = parseCsvLine(line);
    const row = {};

    headers.forEach((header, index) => {
      row[header] = values[index];
    });

    return {
      id: row.meal_id || "",
      name: row.meal_name || row.name || "",
      description: row.description || "",
      ingredients: row.ingredients || "",
      equipmentNeeded: row.equipment_needed || "",
      estimatedCostUsd: Number(row.estimated_cost_usd || 0),
      timeMinutes: Number(row.time_minutes || 0),
      calories: Number(row.calories || 0),
      satFat: Number(row.satFat || row.sat_fat || row.sat_fat_g || 0),
      sodium: Number(row.sodium || row.sodium_mg || 0),
      addedSugar: Number(row.addedSugar || row.added_sugar || row.added_sugar_g || 0),
      fiber: Number(row.fiber || row.fiber_g || 0),
      protein: Number(row.protein || row.protein_g || 0),
      dietTags: (row.diet_tags || "").split(";").filter(Boolean),
      proteinCategory: row.protein_category || "",
      dairyHeavy: row.dairy_heavy || "no",
      plantForwardLevel: row.plant_forward_level || "medium",
      owidComponents:
        row.owidComponents || row.owid_components
          ? JSON.parse(row.owidComponents || row.owid_components || "[]")
          : buildDormMealComponents(row)
    };
  });
}

function loadDormMeals() {
  const filePath = path.join(
    process.cwd(),
    "data",
    "processed",
    "dorm_meals_manual.csv"
  );

  if (!fs.existsSync(filePath)) {
    throw new Error(`Dorm meals CSV not found: ${filePath}`);
  }

  const csvText = fs.readFileSync(filePath, "utf8");
  return parseDormMealsCsv(csvText);
}

module.exports = {
  loadDormMeals,
  parseDormMealsCsv
};
