const express = require("express");
const { getRecommendations } = require("../services/recommendationService");
const { db } = require("../db/db");

const router = express.Router();

function convertDbPreferencesToUserPreferences(dbPreferences) {
  if (!dbPreferences) {
    return {};
  }

  return {
    wantsHighProtein: dbPreferences.wants_high_protein === 1,
    prefersLowImpact: dbPreferences.prefers_low_impact === 1,
    prefersPlantBased: dbPreferences.prefers_plant_based === 1,
    vegetarian: dbPreferences.vegetarian === 1,
    vegan: dbPreferences.vegan === 1,
    avoidsBeef: dbPreferences.avoids_beef === 1,
    avoidsPork: dbPreferences.avoids_pork === 1,
    preferredLocation: dbPreferences.preferred_location || null,
    changeLevel: dbPreferences.change_level || "small"
  };
}

router.get("/", async (req, res) => {
  try {
    const {
      location,
      date,
      mealPeriod,
      view,
      limit,
      userId,
      wantsHighProtein,
      prefersLowImpact,
      prefersPlantBased,
      vegetarian,
      vegan,
      avoidsBeef,
      avoidsPork
    } = req.query;

    if (!location) {
      return res.status(400).json({
        error: "Missing required query parameter: location"
      });
    }

    let userPreferences = {};

    if (userId) {
      const dbPreferences = db.prepare(`
        SELECT *
        FROM user_preferences
        WHERE user_id = ?
      `).get(userId);

      userPreferences = convertDbPreferencesToUserPreferences(dbPreferences);
    } else {
      userPreferences = {
        wantsHighProtein: wantsHighProtein === "true",
        prefersLowImpact: prefersLowImpact === "true",
        prefersPlantBased: prefersPlantBased === "true",
        vegetarian: vegetarian === "true",
        vegan: vegan === "true",
        avoidsBeef: avoidsBeef === "true",
        avoidsPork: avoidsPork === "true"
      };
    }

    const recommendations = await getRecommendations({
      location,
      menuDate: date,
      mealPeriod,
      view: view || "recommended",
      userPreferences,
      limit: Number(limit || 10)
    });
    const resolvedDate = recommendations[0]?.date || date || null;
    const resolvedMealPeriod = recommendations[0]?.mealPeriod || mealPeriod || null;

    res.json({
    location,
    date: resolvedDate,
    mealPeriod: resolvedMealPeriod,
    userId: userId || null,
    preferencesUsed: userPreferences,
    count: recommendations.length,
    recommendations
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

module.exports = router;
