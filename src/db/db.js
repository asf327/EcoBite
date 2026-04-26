const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "ecobite.sqlite");
const schemaPath = path.join(__dirname, "schema.sql");

const db = new Database(dbPath);

function initializeDatabase() {
  const schema = fs.readFileSync(schemaPath, "utf8");
  db.exec(schema);

  try {
    db.exec(`ALTER TABLE users ADD COLUMN password_hash TEXT`);
  } catch (error) {
    // Column already exists
  }

  seedLocations();
}

function seedLocations() {
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

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO locations (slug, name, type, description)
    VALUES (?, ?, ?, ?)
  `);

  for (const location of locations) {
    stmt.run(...location);
  }
}

module.exports = {
  db,
  initializeDatabase
};