const express = require("express");
const { query } = require("../db/db");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await query(`
      SELECT * FROM locations ORDER BY type, name
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM locations WHERE slug = $1`,
      [req.params.slug]
    );
    const location = result.rows[0];

    if (!location) {
      return res.status(404).json({ error: "Location not found" });
    }

    res.json(location);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
