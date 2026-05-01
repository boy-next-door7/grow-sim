const BASE_TEMP = 22;
const BASE_HUMIDITY = 55;

// room = { lamp, exhaust, fan, humidifier, lampHours, lampIntensity (0-100), exhaustSpeed (0-100), humidifierSpeed (0-100) }
export function calcClimate(room, plantCount) {
  const { lamp, exhaust, humidifier, lampHours, lampIntensity = 100, exhaustSpeed, humidifierSpeed = 50 } = room;

  if (!lamp || !exhaust) {
    return {
      temperature: BASE_TEMP,
      humidity: BASE_HUMIDITY,
      lightHours: lamp ? lampHours : 0,
    };
  }

  const intensityFactor  = lampIntensity / 100;
  const lampOnFraction   = lampHours / 24;
  const exhaustFraction  = exhaustSpeed / 100;

  const lampHeat        = lamp.heat * lampOnFraction * intensityFactor;
  const exhaustCooling  = exhaust.cooling * exhaustFraction;
  const plantHeat       = plantCount * 0.3;
  const transpiration   = plantCount * 1.5;
  const exhaustDehumid  = exhaust.dehumid * exhaustFraction;
  const humidifierAdd   = humidifier ? humidifier.humidify * (humidifierSpeed / 100) : 0;

  const temperature = Math.round((BASE_TEMP + lampHeat + plantHeat - exhaustCooling) * 10) / 10;
  const humidity    = Math.round((BASE_HUMIDITY + transpiration + humidifierAdd - exhaustDehumid) * 10) / 10;

  return {
    temperature: Math.max(10, Math.min(45, temperature)),
    humidity:    Math.max(10, Math.min(95, humidity)),
    lightHours:  lampHours,
    effectivePPFD: lamp.ppfd * intensityFactor,
  };
}

export function calcDailyElectricity(room) {
  const { lamp, exhaust, fan, drip, controller, humidifier, lampHours, lampIntensity = 100, exhaustSpeed } = room;
  let wh = 0;
  if (lamp)       wh += lamp.watt       * (lampIntensity / 100) * lampHours;
  if (exhaust)    wh += exhaust.watt    * (exhaustSpeed / 100)  * 24;
  if (fan)        wh += fan.watt * 24;
  if (drip)       wh += drip.watt * 24;
  if (controller) wh += controller.watt * 24;
  if (humidifier) wh += humidifier.watt * 24;
  return Math.round((wh / 1000) * 0.35 * 100) / 100;
}

export function formatTemp(t) { return `${t.toFixed(1)} °C`; }
export function formatHum(h)  { return `${h.toFixed(1)} %`; }
