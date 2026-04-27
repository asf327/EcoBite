require("dotenv").config();
const { startDailyJobs } = require("./services/schedulerService");
const express = require("express");
const cors = require("cors");
const recommendationsRouter = require("./routes/recommendations");
const usersRouter = require("./routes/users");
const locationsRouter = require("./routes/locations");
const mealsRouter = require("./routes/meals");
const authRouter = require("./routes/auth");

const { initializeDatabase } = require("./db/db");
const app = express();
const initializationPromise = initializeDatabase();

app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
  if (req.url === "/api" || req.url.startsWith("/api/")) {
    req.url = req.url.slice(4) || "/";
  }

  next();
});

app.use(async (req, res, next) => {
  try {
    await initializationPromise;
    next();
  } catch (error) {
    next(error);
  }
});

app.use("/auth", authRouter);

app.get("/", (req, res) => {
  res.json({
    message: "EcoBite API is running"
  });
});

app.use("/recommendations", recommendationsRouter);
app.use("/users", usersRouter);
app.use("/locations", locationsRouter);
app.use("/meals", mealsRouter);

if (process.env.NODE_ENV === "production") {
  initializationPromise
    .then(() => {
      startDailyJobs();
    })
    .catch(err => {
      console.error("Error initializing database:", err);
    });
}

app.use((error, req, res, next) => {
  res.status(500).json({
    error: error.message || "Internal server error"
  });
});

module.exports = app;
