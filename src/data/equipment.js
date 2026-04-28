export const TENTS = [
  { id: 'tent_40', name: 'Mini Zelt 40×40', price: 45, maxPlants: 1, watt: 0, desc: '40×40×120 cm' },
  { id: 'tent_60', name: 'Zelt 60×60', price: 75, maxPlants: 2, watt: 0, desc: '60×60×160 cm' },
  { id: 'tent_80', name: 'Zelt 80×80', price: 115, maxPlants: 4, watt: 0, desc: '80×80×180 cm' },
  { id: 'tent_100', name: 'Zelt 100×100', price: 165, maxPlants: 6, watt: 0, desc: '100×100×200 cm' },
  { id: 'tent_120', name: 'Profi Zelt 120×120', price: 240, maxPlants: 9, watt: 0, desc: '120×120×200 cm' },
];

export const LAMPS = [
  { id: 'cfl_85', name: 'CFL 85W', price: 30, watt: 85, heat: 2.5, ppfd: 0.6, desc: 'Günstig, gut für Keimlinge' },
  { id: 'hps_250', name: 'HPS 250W', price: 65, watt: 250, heat: 7, ppfd: 1.0, desc: 'Klassisch, hohe Wärme' },
  { id: 'hps_400', name: 'HPS 400W', price: 95, watt: 400, heat: 9, ppfd: 1.4, desc: 'Hoher Ertrag, sehr warm' },
  { id: 'led_100', name: 'LED Board 100W', price: 90, watt: 100, heat: 2, ppfd: 1.0, desc: 'Effizient, wenig Wärme' },
  { id: 'led_200', name: 'LED Board 200W', price: 160, watt: 200, heat: 3, ppfd: 1.5, desc: 'Beste Effizienz' },
  { id: 'led_400', name: 'LED Board 400W', price: 290, watt: 400, heat: 5, ppfd: 2.2, desc: 'Profi, Top-Ertrag' },
  { id: 'cmh_315', name: 'CMH 315W', price: 175, watt: 315, heat: 6, ppfd: 1.6, desc: 'Volles Spektrum' },
];

export const EXHAUSTS = [
  { id: 'exh_100', name: 'Abluft 100 m³/h', price: 40, watt: 30, cooling: 3, dehumid: 5, desc: 'Für Mini Zelte' },
  { id: 'exh_200', name: 'Abluft 200 m³/h', price: 65, watt: 55, cooling: 6, dehumid: 8, desc: 'Für kleine Zelte' },
  { id: 'exh_300', name: 'Abluft 300 m³/h', price: 100, watt: 85, cooling: 9, dehumid: 12, desc: 'Für mittlere Zelte' },
  { id: 'exh_500', name: 'Abluft 500 m³/h', price: 155, watt: 120, cooling: 13, dehumid: 16, desc: 'Für große Zelte' },
];

export const FANS = [
  { id: 'fan_clip', name: 'Clip-Ventilator', price: 10, watt: 5, circulation: 0.5, desc: 'Kleiner Clip-Lüfter' },
  { id: 'fan_desk', name: 'Tisch-Ventilator', price: 22, watt: 15, circulation: 1.0, desc: 'Gute Zirkulation' },
  { id: 'fan_floor', name: 'Boden-Ventilator', price: 45, watt: 30, circulation: 1.8, desc: 'Starke Zirkulation' },
];

export const FILTERS = [
  { id: 'filter_s', name: 'Kohlefilter Small', price: 28, desc: 'Bis 100 m³/h' },
  { id: 'filter_m', name: 'Kohlefilter Medium', price: 50, desc: 'Bis 200 m³/h' },
  { id: 'filter_l', name: 'Kohlefilter Large', price: 85, desc: 'Bis 500 m³/h' },
];

export const POTS = [
  { id: 'pot_5', name: 'Topf 5L', price: 3, liters: 5, yieldFactor: 0.7, desc: 'Für Keimlinge' },
  { id: 'pot_11', name: 'Topf 11L', price: 5, liters: 11, yieldFactor: 1.0, desc: 'Standard' },
  { id: 'pot_15', name: 'Topf 15L', price: 8, liters: 15, yieldFactor: 1.25, desc: 'Guter Ertrag' },
  { id: 'pot_25', name: 'Topf 25L', price: 14, liters: 25, yieldFactor: 1.6, desc: 'Maximaler Ertrag' },
];

export const NUTRIENTS = [
  { id: 'nut_basic', name: 'Basis-Dünger Set', price: 25, qualityMult: 1.0, desc: 'Einfaches 2-Teile Set' },
  { id: 'nut_adv', name: 'Advanced Dünger', price: 65, qualityMult: 1.25, desc: 'Professionelles 3-Teile Set' },
  { id: 'nut_prem', name: 'Premium Dünger', price: 130, qualityMult: 1.55, desc: 'Top-Shelf Nährstoffe' },
];

export const TOOLS = [
  { id: 'tool_hygro', name: 'Thermo-/Hygrometer', price: 12, desc: 'Misst Temperatur & Luftfeuchtigkeit', required: true },
  { id: 'tool_ph', name: 'pH-Meter', price: 35, qualityBonus: 8, desc: 'Optimiert pH-Wert des Gießwassers' },
  { id: 'tool_ppm', name: 'PPM-Meter', price: 28, qualityBonus: 5, desc: 'Misst Nährstoffkonzentration' },
  { id: 'tool_scissors', name: 'Trimm-Schere', price: 12, yieldBonus: 0.05, desc: 'Für sauberes Trimmen' },
  { id: 'tool_tray', name: 'Trimm-Tablett', price: 18, yieldBonus: 0.03, desc: 'Fängt Trichome auf' },
  { id: 'tool_jars', name: 'Curing Gläser (6×)', price: 22, desc: 'Benötigt für Curing', required: true },
  { id: 'tool_loupe', name: 'Trichom-Lupe 60×', price: 15, qualityBonus: 5, desc: 'Erkennt optimalen Erntezeitpunkt' },
];

export const SEEDS = [
  {
    id: 'seed_budget_auto',
    name: 'Budget Auto',
    price: 8,
    type: 'auto',
    germDays: 3,
    seedlingDays: 7,
    vegDays: 14,
    flowerDays: 35,
    yieldMin: 18,
    yieldMax: 32,
    thc: 12,
    desc: 'Einfach, schnell, günstig',
    color: '#86efac',
  },
  {
    id: 'seed_ww',
    name: 'White Widow',
    price: 12,
    type: 'photo',
    germDays: 4,
    seedlingDays: 10,
    vegDays: 21,
    flowerDays: 56,
    yieldMin: 35,
    yieldMax: 55,
    thc: 18,
    desc: 'Klassiker, robust, lohnend',
    color: '#e2e8f0',
  },
  {
    id: 'seed_og_kush',
    name: 'OG Kush',
    price: 15,
    type: 'photo',
    germDays: 4,
    seedlingDays: 10,
    vegDays: 28,
    flowerDays: 63,
    yieldMin: 28,
    yieldMax: 48,
    thc: 20,
    desc: 'Hohes THC, Premium-Markt',
    color: '#fde68a',
  },
  {
    id: 'seed_ak47',
    name: 'AK-47',
    price: 14,
    type: 'photo',
    germDays: 3,
    seedlingDays: 10,
    vegDays: 21,
    flowerDays: 49,
    yieldMin: 40,
    yieldMax: 62,
    thc: 17,
    desc: 'Hoher Ertrag, schnell',
    color: '#fca5a5',
  },
  {
    id: 'seed_nl',
    name: 'Northern Lights',
    price: 13,
    type: 'photo',
    germDays: 3,
    seedlingDays: 10,
    vegDays: 21,
    flowerDays: 49,
    yieldMin: 35,
    yieldMax: 52,
    thc: 18,
    desc: 'Robust, guter Ertrag',
    color: '#a5b4fc',
  },
  {
    id: 'seed_gg_auto',
    name: 'Gorilla Glue Auto',
    price: 18,
    type: 'auto',
    germDays: 4,
    seedlingDays: 10,
    vegDays: 21,
    flowerDays: 49,
    yieldMin: 50,
    yieldMax: 80,
    thc: 22,
    desc: 'Top-THC, bester Preis',
    color: '#6ee7b7',
  },
];

export const ELECTRICITY_PRICE = 0.35; // €/kWh
export const WATER_COST_PER_PLANT_DAY = 0.5; // €
