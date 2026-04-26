const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { getTodayDateString } = require("./mealTimeService");

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

module.exports = {
  getRathboneRawPath,
  rathboneFileExists,
  fetchRathboneMenu,
  ensureRathboneMenuForDate
};