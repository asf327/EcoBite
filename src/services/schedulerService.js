const cron = require("node-cron");
const { fetchRathboneMenu } = require("./rathboneFetchService");
const { getTodayDateString } = require("./mealTimeService");

function startDailyJobs() {
  cron.schedule(
    "55 6 * * *",
    async () => {
      const today = getTodayDateString();

      try {
        console.log(`Fetching Rathbone menu for ${today}...`);
        await fetchRathboneMenu(today);
        console.log(`Rathbone menu fetched for ${today}.`);
      } catch (error) {
        console.error("Daily Rathbone fetch failed:", error.message);
      }
    },
    {
      timezone: "America/New_York"
    }
  );
}

module.exports = {
  startDailyJobs
};