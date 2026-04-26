// Our World in Data
// environmental values
const OWID = {
  "Beef (beef herd)": { carbon: 99.48, land: 326.21, water: 1451 },
  "Lamb & Mutton": { carbon: 39.72, land: 369.81, water: 1803 },
  "Pig Meat": { carbon: 12.31, land: 17.36, water: 1796 },
  "Poultry Meat": { carbon: 9.87, land: 12.22, water: 660 },
  "Fish (farmed)": { carbon: 13.63, land: 8.41, water: 3691 },
  "Prawns (farmed)": { carbon: 26.87, land: 2.97, water: 3515 },
  Eggs: { carbon: 4.67, land: 6.27, water: 578 },
  Cheese: { carbon: 23.88, land: 87.79, water: 5605 },
  Milk: { carbon: 3.15, land: 8.95, water: 628 },
  Tofu: { carbon: 3.16, land: 3.52, water: 149 },
  "Other Pulses": { carbon: 1.79, land: 15.57, water: 436 },
  Nuts: { carbon: 0.43, land: 12.96, water: 4134 },
  Rice: { carbon: 4.45, land: 2.8, water: 2248 },
  "Wheat & Rye": { carbon: 1.57, land: 3.85, water: 648 },
  Oatmeal: { carbon: 2.48, land: 7.6, water: 482 },
  "Other Vegetables": { carbon: 0.53, land: 0.38, water: 103 },
  "Root Vegetables": { carbon: 0.43, land: 0.33, water: 28 },
  "Other Fruit": { carbon: 1.05, land: 0.89, water: 154 },
  "Cane Sugar": { carbon: 3.2, land: 2.04, water: 620 }
};

const OWID_MAX = {
  carbon: 99.48,
  land: 369.81,
  water: 5605
};

const ENV_BURDEN_MIN = 0.0028595005;
const ENV_BURDEN_MAX = 0.7136592078;

module.exports = {
  OWID,
  OWID_MAX,
  ENV_BURDEN_MIN,
  ENV_BURDEN_MAX
};