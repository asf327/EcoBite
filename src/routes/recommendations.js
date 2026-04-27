const express = require("express");
const { getRecommendations } = require("../services/recommendationService");
const { query } = require("../db/db");

const router = express.Router();

function convertDbPreferencesToUserPreferences(dbPreferences) {
  if (!dbPreferences) {
    return {};
  }

  return {
    wantsHighProtein: dbPreferences.wants_high_protein === true,
    prefersLowImpact: dbPreferences.prefers_low_impact === true,
    prefersPlantBased: dbPreferences.prefers_plant_based === true,
    vegetarian: dbPreferences.vegetarian === true,
    vegan: dbPreferences.vegan === true,
    avoidsBeef: dbPreferences.avoids_beef === true,
    avoidsPork: dbPreferences.avoids_pork === true,
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
      const dbPreferencesResult = await query(
        `
          SELECT *
          FROM user_preferences
          WHERE user_id = $1
        `,
        [userId]
      );
      const dbPreferences = dbPreferencesResult.rows[0];

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
