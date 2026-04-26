const express = require("express");
const { db } = require("../db/db");

const router = express.Router();

router.get("/", (req, res) => {
  const locations = db.prepare(`
    SELECT * FROM locations ORDER BY type, name
  `).all();

  res.json(locations);
});

router.get("/:slug", (req, res) => {
  const location = db.prepare(`
    SELECT * FROM locations WHERE slug = ?
  `).get(req.params.slug);

  if (!location) {
    return res.status(404).json({ error: "Location not found" });
  }

  res.json(location);
});

module.exports = router;