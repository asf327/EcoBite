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


app.use(express.json());
app.use(cors());
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

initializeDatabase()
    .then(() => {
        console.log("Database initialized");
    })
    .catch(err => {
        console.error("Error initializing database:", err);
    });
    
if (process.env.NODE_ENV === "production") {
  startDailyJobs();
}

module.exports = app;