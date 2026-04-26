function getTodayDateString(date = new Date()) {
  return date.toLocaleDateString("en-CA", {
    timeZone: "America/New_York"
  });
}

function getCurrentMealPeriod(date = new Date()) {
  const eastern = new Date(
    date.toLocaleString("en-US", { timeZone: "America/New_York" })
  );

  const day = eastern.getDay(); // 0 Sunday, 6 Saturday
  const hour = eastern.getHours();
  const minute = eastern.getMinutes();
  const minutes = hour * 60 + minute;

  const isWeekend = day === 0 || day === 6;

  const weekdayBreakfastStart = 7 * 60;
  const weekdayLunchStart = 10 * 60 + 30;
  const weekdayDinnerStart = 16 * 60 + 30;

  const weekendDinnerStart = 16 * 60 + 30;

  if (isWeekend) {
    if (minutes < weekendDinnerStart) {
      return "Brunch";
    }

    return "Dinner";
  }

  if (minutes < weekdayBreakfastStart) {
    return "Breakfast";
  }

  if (minutes >= weekdayBreakfastStart && minutes < weekdayLunchStart) {
    return "Breakfast";
  }

  if (minutes >= weekdayLunchStart && minutes < weekdayDinnerStart) {
    return "Lunch";
  }

  return "Dinner";
}

module.exports = {
  getTodayDateString,
  getCurrentMealPeriod
};