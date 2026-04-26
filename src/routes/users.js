const express = require("express");
const { db } = require("../db/db");

const router = express.Router();

router.post("/", (req, res) => {
  const { googleId, email, name } = req.body;

  if (!email) {
    return res.status(400).json({ error: "email is required" });
  }

  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (google_id, email, name)
    VALUES (?, ?, ?)
  `);

  insertUser.run(googleId || null, email, name || null);

  const user = db.prepare(`
    SELECT * FROM users WHERE email = ?
  `).get(email);

  res.json(user);
});

router.get("/:id", (req, res) => {
  const user = db.prepare(`
    SELECT * FROM users WHERE id = ?
  `).get(req.params.id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const preferences = db.prepare(`
    SELECT * FROM user_preferences WHERE user_id = ?
  `).get(req.params.id);

  res.json({
    ...user,
    preferences: preferences || null
  });
});

router.post("/:id/preferences", (req, res) => {
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

  const existing = db.prepare(`
    SELECT * FROM user_preferences WHERE user_id = ?
  `).get(userId);

  if (existing) {
    db.prepare(`
      UPDATE user_preferences
      SET wants_high_protein = ?,
          prefers_low_impact = ?,
          prefers_plant_based = ?,
          vegetarian = ?,
          vegan = ?,
          avoids_beef = ?,
          avoids_pork = ?,
          preferred_location = ?,
          change_level = ?
      WHERE user_id = ?
    `).run(
      wantsHighProtein ? 1 : 0,
      prefersLowImpact ? 1 : 0,
      prefersPlantBased ? 1 : 0,
      vegetarian ? 1 : 0,
      vegan ? 1 : 0,
      avoidsBeef ? 1 : 0,
      avoidsPork ? 1 : 0,
      preferredLocation || null,
      changeLevel || "small",
      userId
    );
  } else {
    db.prepare(`
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
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      wantsHighProtein ? 1 : 0,
      prefersLowImpact ? 1 : 0,
      prefersPlantBased ? 1 : 0,
      vegetarian ? 1 : 0,
      vegan ? 1 : 0,
      avoidsBeef ? 1 : 0,
      avoidsPork ? 1 : 0,
      preferredLocation || null,
      changeLevel || "small"
    );
  }

  const updated = db.prepare(`
    SELECT * FROM user_preferences WHERE user_id = ?
  `).get(userId);

  res.json(updated);
});

module.exports = router;