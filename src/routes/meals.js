const express = require("express");
const { query } = require("../db/db");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { location } = req.query;

    let result;

    if (location) {
      result = await query(
        `
          SELECT * FROM meals
          WHERE location_slug = $1
          ORDER BY recommendation_score DESC
        `,
        [location]
      );
    } else {
      result = await query(`
        SELECT * FROM meals
        ORDER BY created_at DESC
        LIMIT 100
      `);
    }

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/save", async (req, res) => {
  try {
    const { userId, mealName, locationSlug } = req.body;

    if (!userId || !mealName || !locationSlug) {
      return res.status(400).json({
        error: "userId, mealName, and locationSlug are required"
      });
    }

    const result = await query(
      `
        INSERT INTO saved_meals (user_id, meal_name, location_slug)
        VALUES ($1, $2, $3)
        RETURNING id
      `,
      [userId, mealName, locationSlug]
    );

    res.json({
      id: result.rows[0].id,
      userId,
      mealName,
      locationSlug
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/saved/:userId", async (req, res) => {
  try {
    const result = await query(
      `
        SELECT * FROM saved_meals
        WHERE user_id = $1
        ORDER BY created_at DESC
      `,
      [req.params.userId]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
