CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  google_id TEXT UNIQUE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password_hash TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  wants_high_protein INTEGER DEFAULT 0,
  prefers_low_impact INTEGER DEFAULT 0,
  prefers_plant_based INTEGER DEFAULT 0,
  vegetarian INTEGER DEFAULT 0,
  vegan INTEGER DEFAULT 0,
  avoids_beef INTEGER DEFAULT 0,
  avoids_pork INTEGER DEFAULT 0,
  preferred_location TEXT,
  change_level TEXT DEFAULT 'small',
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS locations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS meals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
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
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS saved_meals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  meal_name TEXT NOT NULL,
  location_slug TEXT NOT NULL,
  saved_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);