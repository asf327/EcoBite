const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function query(text, params) {
  const res = await pool.query(text, params);
  return res;
}

async function initializeDatabase() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      google_id TEXT,
      email TEXT UNIQUE,
      name TEXT,
      password_hash TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS user_preferences (
      user_id INTEGER PRIMARY KEY,
      wants_high_protein BOOLEAN,
      prefers_low_impact BOOLEAN,
      prefers_plant_based BOOLEAN,
      vegetarian BOOLEAN,
      vegan BOOLEAN,
      avoids_beef BOOLEAN,
      avoids_pork BOOLEAN,
      preferred_location TEXT,
      change_level TEXT DEFAULT 'small'
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS saved_meals (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      meal_name TEXT,
      location_slug TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS locations (
      id SERIAL PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      description TEXT
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS meals (
      id SERIAL PRIMARY KEY,
      location_slug TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      meal_type TEXT,
      source TEXT,
      calories REAL,
      sat_fat REAL,
      sodium REAL,
      added_sugar REAL,
      fiber REAL,
      protein REAL,
      sustainability_score REAL,
      nutrition_score REAL,
      recommendation_score REAL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await seedLocations();
}

async function seedLocations() {
  const locations = [
    ["rathbone", "Rathbone Dining Hall", "dining_hall", "Daily dining hall menu"],
    ["grind", "The Grind", "retail", "Cafe sandwiches, smoothies, and breakfast items"],
    ["common-grounds", "Common Grounds", "retail", "Breakfast sandwiches, subs, and soups"],
    ["hideaway", "Hideaway Cafe", "retail", "Smoothies and smoothie bowls"],
    ["nest-at-night", "Nest at Night", "retail", "Late-night Hawk's Nest menu"],
    ["mein", "Mein Bowl", "modular", "Custom bowl meals"],
    ["poke", "Poke", "modular", "Custom poke bowls"],
    ["dorm", "Dorm Meals", "manual", "Simple dorm kitchen meal ideas"]
  ];

  for (const [slug, name, type, description] of locations) {
    await query(
      `
        INSERT INTO locations (slug, name, type, description)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (slug) DO NOTHING
      `,
      [slug, name, type, description]
    );
  }
}

module.exports = {
  query,
  initializeDatabase
};
