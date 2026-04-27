const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { getTodayDateString } = require("./mealTimeService");
const { loadRathboneItems, flattenRathboneJson } = require("./rathboneLoader");

const RATHBONE_API_URL = "https://api-prd.sodexomyway.net/v0.2/data/menu/97451005/151204?date=";
const RATHBONE_API_KEY = "68717828-b754-420d-9488-4c37cb7d7ef7";

function getRathboneRawPath(dateString) {
  return path.join(
    process.cwd(),
    "data",
    "raw",
    `rathbone_menu_${dateString}.json`
  );
}

function rathboneFileExists(dateString) {
  return fs.existsSync(getRathboneRawPath(dateString));
}

function fetchRathboneMenu(dateString = getTodayDateString()) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(
      process.cwd(),
      "scripts",
      "fetch_rathbone_menu.py"
    );

    const processHandle = spawn("python3", [
      scriptPath,
      "--date",
      dateString
    ]);

    let stdout = "";
    let stderr = "";

    processHandle.stdout.on("data", data => {
      stdout += data.toString();
    });

    processHandle.stderr.on("data", data => {
      stderr += data.toString();
    });

    processHandle.on("close", code => {
      if (code !== 0) {
        reject(new Error(`Rathbone fetch failed: ${stderr}`));
        return;
      }

      resolve({
        date: dateString,
        stdout
      });
    });
  });
}

async function ensureRathboneMenuForDate(dateString = getTodayDateString()) {
  if (rathboneFileExists(dateString)) {
    return {
      date: dateString,
      fetched: false
    };
  }

  await fetchRathboneMenu(dateString);

  return {
    date: dateString,
    fetched: true
  };
}

async function fetchRathboneItemsLive(dateString = getTodayDateString()) {
  const response = await fetch(`${RATHBONE_API_URL}${dateString}`, {
    headers: {
      "API-Key": RATHBONE_API_KEY,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`Rathbone live fetch failed: ${response.status}`);
  }

  const payload = await response.json();
  return flattenRathboneJson(payload);
}

async function getRathboneItemsForDate(dateString = getTodayDateString()) {
  if (rathboneFileExists(dateString)) {
    return loadRathboneItems(dateString);
  }

  return fetchRathboneItemsLive(dateString);
}

module.exports = {
  getRathboneRawPath,
  rathboneFileExists,
  fetchRathboneMenu,
  ensureRathboneMenuForDate,
  fetchRathboneItemsLive,
  getRathboneItemsForDate
};
