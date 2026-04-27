const express = require("express");
const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const { query } = require("../db/db");

const router = express.Router();

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function createOrGetUser({ googleId = null, email, name, passwordHash = null }) {
  const existingResult = await query(
    `
      SELECT id, google_id, email, name, created_at
      FROM users
      WHERE email = $1
    `,
    [email]
  );
  const existing = existingResult.rows[0];

  if (existing) {
    return {
      user: existing,
      isNewUser: false
    };
  }

  await query(
    `
      INSERT INTO users (google_id, email, name, password_hash)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO NOTHING
    `,
    [googleId, email, name, passwordHash]
  );

  const userResult = await query(
    `
      SELECT id, google_id, email, name, created_at
      FROM users
      WHERE email = $1
    `,
    [email]
  );
  const user = userResult.rows[0];

  return {
    user,
    isNewUser: true
  };
}

router.post("/signup", async (req, res) => {
  try {
    const { email, name, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const existingResult = await query("SELECT * FROM users WHERE email = $1", [email]);
    const existing = existingResult.rows[0];

    if (existing) {
      return res.status(409).json({ error: "User already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const { user, isNewUser } = await createOrGetUser({
      email,
      name: name || email,
      passwordHash
    });

    res.json({ user, isNewUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const userResult = await query("SELECT * FROM users WHERE email = $1", [email]);
    const user = userResult.rows[0];

    if (!user || !user.password_hash) {
      return res.status(401).json({ error: "Invalid login." });
    }

    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({ error: "Invalid login." });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      isNewUser: false
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: "Missing Google credential." });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    const { user, isNewUser } = await createOrGetUser({
      googleId: payload.sub,
      email: payload.email,
      name: payload.name || payload.email
    });

    res.json({ user, isNewUser });
  } catch (error) {
    res.status(401).json({ error: "Google sign-in failed." });
  }
});

module.exports = router;
