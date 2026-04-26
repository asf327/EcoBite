const {
  OWID,
  OWID_MAX,
  ENV_BURDEN_MIN,
  ENV_BURDEN_MAX
} = require("../data/owidData");

const { clamp } = require("./parsers");

function scoreEnvironmentalCategory(category) {
  const data = OWID[category];

  if (!data) {
    throw new Error(`Unknown OWID category: ${category}`);
  }

  const normalizedCarbon = data.carbon / OWID_MAX.carbon;
  const normalizedLand = data.land / OWID_MAX.land;
  const normalizedWater = data.water / OWID_MAX.water;

  const environmentalBurden =
    (normalizedCarbon + normalizedLand + normalizedWater) / 3;

  const sustainabilityScore =
    100 *
    (ENV_BURDEN_MAX - environmentalBurden) /
    (ENV_BURDEN_MAX - ENV_BURDEN_MIN);

  return {
    category,
    carbon: data.carbon,
    land: data.land,
    water: data.water,
    normalizedCarbon,
    normalizedLand,
    normalizedWater,
    environmentalBurden,
    sustainabilityScore:
      Math.round(clamp(sustainabilityScore, 0, 100) * 100) / 100
  };
}

function scoreMealEnvironment(components) {
  const totalWeight = components.reduce(
    (sum, component) => sum + component.weightFraction,
    0
  );

  if (totalWeight <= 0) {
    throw new Error("Meal has no weighted environmental components.");
  }

  let mealEnvironmentalBurden = 0;

  for (const component of components) {
    const categoryScore = scoreEnvironmentalCategory(component.category);

    mealEnvironmentalBurden +=
      (component.weightFraction / totalWeight) *
      categoryScore.environmentalBurden;
  }

  const sustainabilityScore =
    100 *
    (ENV_BURDEN_MAX - mealEnvironmentalBurden) /
    (ENV_BURDEN_MAX - ENV_BURDEN_MIN);

  return {
    mealEnvironmentalBurden:
      Math.round(mealEnvironmentalBurden * 10000) / 10000,
    sustainabilityScore:
      Math.round(clamp(sustainabilityScore, 0, 100) * 100) / 100
  };
}

module.exports = {
  scoreEnvironmentalCategory,
  scoreMealEnvironment
};