const fs = require("fs");
const path = require("path");

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
      name: row.name,
      calories: Number(row.calories || 0),
      satFat: Number(row.satFat || row.sat_fat || 0),
      sodium: Number(row.sodium || row.sodium_mg || 0),
      addedSugar: Number(row.addedSugar || row.added_sugar || 0),
      fiber: Number(row.fiber || row.fiber_g || 0),
      protein: Number(row.protein || row.protein_g || 0),
      owidComponents: JSON.parse(row.owidComponents || row.owid_components || "[]")
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