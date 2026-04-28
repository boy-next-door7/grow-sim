const BASE_TEMP = 22;
const BASE_HUMIDITY = 55;

export function calcClimate(equipment, settings, plantCount) {
  const { lamp, exhaust, fan } = equipment;
  const { exhaustSpeed, lampHours } = settings;

  if (!lamp || !exhaust) {
    return { temperature: BASE_TEMP, humidity: BASE_HUMIDITY, lightHours: lampHours };
  }

  const lampOnFraction = lampHours / 24;
  const exhaustFraction = exhaustSpeed / 100;

  const lampHeat = lamp.heat * lampOnFraction;
  const exhaustCooling = exhaust.cooling * exhaustFraction;
  const plantHeat = plantCount * 0.3;

  const transpiration = plantCount * 1.5;
  const exhaustDehumid = exhaust.dehumid * exhaustFraction;

  const temperature = Math.round((BASE_TEMP + lampHeat + plantHeat - exhaustCooling) * 10) / 10;
  const humidity = Math.round((BASE_HUMIDITY + transpiration - exhaustDehumid) * 10) / 10;

  return {
    temperature: Math.max(10, Math.min(45, temperature)),
    humidity: Math.max(10, Math.min(95, humidity)),
    lightHours: lampHours,
  };
}

export function calcDailyElectricity(equipment, settings) {
  const { lamp, exhaust, fan } = equipment;
  const { exhaustSpeed, lampHours } = settings;

  let wattHours = 0;
  if (lamp) wattHours += lamp.watt * lampHours;
  if (exhaust) wattHours += exhaust.watt * (exhaustSpeed / 100) * 24;
  if (fan) wattHours += fan.watt * 24;

  const kWh = wattHours / 1000;
  return Math.round(kWh * 0.35 * 100) / 100;
}

export function formatTemp(t) {
  return `${t.toFixed(1)} °C`;
}

export function formatHum(h) {
  return `${h.toFixed(1)} %`;
}
