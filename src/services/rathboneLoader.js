const fs = require("fs");
const path = require("path");

function flattenRathboneJson(payload) {
  const items = [];

  for (const mealPeriod of payload) {
    const mealName = mealPeriod.name || "";

    for (const group of mealPeriod.groups || []) {
      const station = group.name || "";

      for (const item of group.items || []) {
        items.push({
          source: "rathbone",
          mealPeriod: mealName,
          station,
          formalName: item.formalName || "",
          description: item.description || "",
          calories: item.calories || "",
          saturatedFat: item.saturatedFat || "",
          sodium: item.sodium || "",
          dietaryFiber: item.dietaryFiber || "",
          addedSugar: item.addedSugar || "",
          protein: item.protein || "",
          isVegan: item.isVegan || false,
          isVegetarian: item.isVegetarian || false,
          isPlantBased: item.isPlantBased || false,
          isMindful: item.isMindful || false,
          allergens: item.allergens || []
        });
      }
    }
  }

  return items;
}

function loadRathboneItems(menuDate) {
  const filePath = path.join(
    process.cwd(),
    "data",
    "raw",
    `rathbone_menu_${menuDate}.json`
  );

  if (!fs.existsSync(filePath)) {
    throw new Error(`Rathbone menu file not found: ${filePath}`);
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const payload = JSON.parse(raw);

  return flattenRathboneJson(payload);
}

module.exports = {
  loadRathboneItems,
  flattenRathboneJson
};