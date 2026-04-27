const express = require("express");
const { query } = require("../db/db");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
  const { googleId, email, name } = req.body;

  if (!email) {
    return res.status(400).json({ error: "email is required" });
  }

  await query(
    `
      INSERT INTO users (google_id, email, name)
      VALUES ($1, $2, $3)
      ON CONFLICT (email) DO NOTHING
    `,
    [googleId || null, email, name || null]
  );

  const userResult = await query(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  );
  const user = userResult.rows[0];

  res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
  const userResult = await query(
    `SELECT * FROM users WHERE id = $1`,
    [req.params.id]
  );
  const user = userResult.rows[0];

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const preferencesResult = await query(
    `SELECT * FROM user_preferences WHERE user_id = $1`,
    [req.params.id]
  );
  const preferences = preferencesResult.rows[0];

  res.json({
    ...user,
    preferences: preferences || null
  });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/:id/preferences", async (req, res) => {
  try {
  const userId = req.params.id;

  const {
    wantsHighProtein,
    prefersLowImpact,
    prefersPlantBased,
    vegetarian,
    vegan,
    avoidsBeef,
    avoidsPork,
    preferredLocation,
    changeLevel
  } = req.body;

  const existingResult = await query(
    `SELECT * FROM user_preferences WHERE user_id = $1`,
    [userId]
  );
  const existing = existingResult.rows[0];

  if (existing) {
    await query(
      `
        UPDATE user_preferences
        SET wants_high_protein = $1,
            prefers_low_impact = $2,
            prefers_plant_based = $3,
            vegetarian = $4,
            vegan = $5,
            avoids_beef = $6,
            avoids_pork = $7,
            preferred_location = $8,
            change_level = $9
        WHERE user_id = $10
      `,
      [
        !!wantsHighProtein,
        !!prefersLowImpact,
        !!prefersPlantBased,
        !!vegetarian,
        !!vegan,
        !!avoidsBeef,
        !!avoidsPork,
        preferredLocation || null,
        changeLevel || "small",
        userId
      ]
    );
  } else {
    await query(
      `
        INSERT INTO user_preferences (
          user_id,
          wants_high_protein,
          prefers_low_impact,
          prefers_plant_based,
          vegetarian,
          vegan,
          avoids_beef,
          avoids_pork,
          preferred_location,
          change_level
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `,
      [
        userId,
        !!wantsHighProtein,
        !!prefersLowImpact,
        !!prefersPlantBased,
        !!vegetarian,
        !!vegan,
        !!avoidsBeef,
        !!avoidsPork,
        preferredLocation || null,
        changeLevel || "small"
      ]
    );
  }

  const updatedResult = await query(
    `SELECT * FROM user_preferences WHERE user_id = $1`,
    [userId]
  );
  const updated = updatedResult.rows[0];

  res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
