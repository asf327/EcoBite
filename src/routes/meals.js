const express = require("express");
const { db } = require("../db/db");

const router = express.Router();

router.get("/", (req, res) => {
  const { location } = req.query;

  let meals;

  if (location) {
    meals = db.prepare(`
      SELECT * FROM meals
      WHERE location_slug = ?
      ORDER BY recommendation_score DESC
    `).all(location);
  } else {
    meals = db.prepare(`
      SELECT * FROM meals
      ORDER BY created_at DESC
      LIMIT 100
    `).all();
  }

  res.json(meals);
});

router.post("/save", (req, res) => {
  const { userId, mealName, locationSlug } = req.body;

  if (!userId || !mealName || !locationSlug) {
    return res.status(400).json({
      error: "userId, mealName, and locationSlug are required"
    });
  }

  const result = db.prepare(`
    INSERT INTO saved_meals (user_id, meal_name, location_slug)
    VALUES (?, ?, ?)
  `).run(userId, mealName, locationSlug);

  res.json({
    id: result.lastInsertRowid,
    userId,
    mealName,
    locationSlug
  });
});

router.get("/saved/:userId", (req, res) => {
  const saved = db.prepare(`
    SELECT * FROM saved_meals
    WHERE user_id = ?
    ORDER BY saved_at DESC
  `).all(req.params.userId);

  res.json(saved);
});

module.exports = router;