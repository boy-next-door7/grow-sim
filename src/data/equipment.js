export const TENTS = [
  { id: 'tent_40',  name: 'Mini Zelt 40×40',       price: 45,  maxPlants: 1, desc: '40×40×120 cm' },
  { id: 'tent_60',  name: 'Zelt 60×60',             price: 75,  maxPlants: 2, desc: '60×60×160 cm' },
  { id: 'tent_80',  name: 'Zelt 80×80',             price: 115, maxPlants: 4, desc: '80×80×180 cm' },
  { id: 'tent_100', name: 'Zelt 100×100',           price: 165, maxPlants: 6, desc: '100×100×200 cm' },
  { id: 'tent_120', name: 'Profi Zelt 120×120',     price: 240, maxPlants: 9, desc: '120×120×200 cm' },
];

// dimmable=true → LED, full continuous dimming (0-100%)
// dimmable=false → on/off only (intensity locked at 100%)
export const LAMPS = [
  { id: 'cfl_85',   name: 'CFL 85W',         price: 30,  watt: 85,  heat: 2.5, ppfd: 0.6, dimmable: false, desc: 'Günstig, gut für Keimlinge & Stecklinge' },
  { id: 'hps_250',  name: 'HPS 250W',        price: 65,  watt: 250, heat: 7,   ppfd: 1.0, dimmable: false, desc: 'Klassisch, hohe Wärme' },
  { id: 'hps_400',  name: 'HPS 400W',        price: 95,  watt: 400, heat: 9,   ppfd: 1.4, dimmable: false, desc: 'Hoher Ertrag, sehr warm' },
  { id: 'led_100',  name: 'LED Board 100W',  price: 90,  watt: 100, heat: 2,   ppfd: 1.0, dimmable: true,  desc: 'Effizient, vollständig dimmbar' },
  { id: 'led_200',  name: 'LED Board 200W',  price: 160, watt: 200, heat: 3,   ppfd: 1.5, dimmable: true,  desc: 'Beste Effizienz, dimmbar' },
  { id: 'led_400',  name: 'LED Board 400W',  price: 290, watt: 400, heat: 5,   ppfd: 2.2, dimmable: true,  desc: 'Profi, dimmbar, Top-Ertrag' },
  { id: 'cmh_315',  name: 'CMH 315W',        price: 175, watt: 315, heat: 6,   ppfd: 1.6, dimmable: false, desc: 'Volles Spektrum, nicht dimmbar' },
];

export const EXHAUSTS = [
  { id: 'exh_100', name: 'Abluft 100 m³/h', price: 40,  watt: 30,  cooling: 3,  dehumid: 5,  desc: 'Für Mini Zelte' },
  { id: 'exh_200', name: 'Abluft 200 m³/h', price: 65,  watt: 55,  cooling: 6,  dehumid: 8,  desc: 'Für kleine Zelte' },
  { id: 'exh_300', name: 'Abluft 300 m³/h', price: 100, watt: 85,  cooling: 9,  dehumid: 12, desc: 'Für mittlere Zelte' },
  { id: 'exh_500', name: 'Abluft 500 m³/h', price: 155, watt: 120, cooling: 13, dehumid: 16, desc: 'Für große Zelte' },
];

export const FANS = [
  { id: 'fan_clip',  name: 'Clip-Ventilator',  price: 10, watt: 5,  circulation: 0.5, desc: 'Kleiner Clip-Lüfter' },
  { id: 'fan_desk',  name: 'Tisch-Ventilator', price: 22, watt: 15, circulation: 1.0, desc: 'Gute Zirkulation' },
  { id: 'fan_floor', name: 'Boden-Ventilator', price: 45, watt: 30, circulation: 1.8, desc: 'Starke Zirkulation' },
];

export const FILTERS = [
  { id: 'filter_s', name: 'Kohlefilter Small',  price: 28, desc: 'Bis 100 m³/h' },
  { id: 'filter_m', name: 'Kohlefilter Medium', price: 50, desc: 'Bis 200 m³/h' },
  { id: 'filter_l', name: 'Kohlefilter Large',  price: 85, desc: 'Bis 500 m³/h' },
];

export const POTS = [
  { id: 'pot_5',  name: 'Topf 5L',  price: 3,  liters: 5,  yieldFactor: 0.7, desc: 'Für Stecklinge & Keimlinge' },
  { id: 'pot_11', name: 'Topf 11L', price: 5,  liters: 11, yieldFactor: 1.0, desc: 'Standard' },
  { id: 'pot_15', name: 'Topf 15L', price: 8,  liters: 15, yieldFactor: 1.25, desc: 'Guter Ertrag' },
  { id: 'pot_25', name: 'Topf 25L', price: 14, liters: 25, yieldFactor: 1.6, desc: 'Maximaler Ertrag' },
];

// Substrat – Verbrauchsartikel, wird beim Einpflanzen konsumiert
// liters = Liter pro Packung; qualityBonus = täglicher Qualitätsbonus (%)
export const SUBSTRATES = [
  {
    id: 'sub_erde',
    name: 'Basic Erde (50L)',
    price: 6,
    liters: 50,
    qualityBonus: 0,
    drainageFactor: 0.7,
    desc: 'Standard-Erde, gute Pufferung',
  },
  {
    id: 'sub_premium',
    name: 'Premium Grow-Erde (50L)',
    price: 15,
    liters: 50,
    qualityBonus: 0.08,
    drainageFactor: 0.8,
    desc: 'Vorgedüngt, pH-puffernd, optimiert',
  },
  {
    id: 'sub_coco',
    name: 'Kokos-Substrat (50L)',
    price: 12,
    liters: 50,
    qualityBonus: 0.06,
    drainageFactor: 0.95,
    desc: 'Schnelles Wachstum, sauber',
  },
  {
    id: 'sub_hydro',
    name: 'Hydro LECA (45L)',
    price: 20,
    liters: 45,
    qualityBonus: 0.05,
    drainageFactor: 1.0,
    desc: 'Hydrokultur, maximale Kontrolle',
  },
];

// Nährstoffe – Verbrauchsartikel (ml)
// type: 'grow' = N-betont, 'bloom' = P/K-betont, 'complete' = ausgewogen
// mlPerBuy = ml pro Kauf; mlPerFeed = ml Verbrauch pro Düngung pro Pflanze
export const NUTRIENTS = [
  {
    id: 'nut_grow',
    name: 'Grow-Dünger (500ml)',
    price: 18,
    mlPerBuy: 500,
    mlPerFeed: 5,
    type: 'grow',
    npk: { n: 7, p: 3, k: 5 },
    desc: 'N-betont – ideal für Wachstum & Veg',
  },
  {
    id: 'nut_bloom',
    name: 'Bloom-Dünger (500ml)',
    price: 18,
    mlPerBuy: 500,
    mlPerFeed: 5,
    type: 'bloom',
    npk: { n: 2, p: 6, k: 9 },
    desc: 'P/K-betont – ideal für Blüte & Spätblüte',
  },
  {
    id: 'nut_pk_boost',
    name: 'PK Booster (250ml)',
    price: 22,
    mlPerBuy: 250,
    mlPerFeed: 4,
    type: 'pk_boost',
    npk: { n: 0, p: 5, k: 10 },
    desc: 'Reiner PK-Boost für Spätblüte',
  },
  {
    id: 'nut_micro',
    name: 'Micro-Nährstoffe (250ml)',
    price: 20,
    mlPerBuy: 250,
    mlPerFeed: 3,
    type: 'micro',
    npk: { n: 5, p: 1, k: 1 },
    desc: 'Spurenelemente, Kalzium, Magnesium',
  },
  {
    id: 'nut_complete',
    name: 'All-in-One (500ml)',
    price: 28,
    mlPerBuy: 500,
    mlPerFeed: 6,
    type: 'complete',
    npk: { n: 4, p: 4, k: 4 },
    desc: 'Ausgewogen – für alle Phasen geeignet',
  },
];

export const TOOLS = [
  { id: 'tool_hygro',    name: 'Thermo-/Hygrometer', price: 12, desc: 'Misst Temperatur & Luftfeuchtigkeit', required: true },
  { id: 'tool_ph',       name: 'pH-Meter',            price: 35, qualityBonus: 8, desc: 'Optimiert pH-Wert des Gießwassers' },
  { id: 'tool_ppm',      name: 'PPM-Meter',           price: 28, qualityBonus: 5, desc: 'Misst Nährstoffkonzentration' },
  { id: 'tool_scissors', name: 'Trimm-Schere',        price: 12, yieldBonus: 0.05, desc: 'Für sauberes Trimmen' },
  { id: 'tool_tray',     name: 'Trimm-Tablett',       price: 18, yieldBonus: 0.03, desc: 'Fängt Trichome auf' },
  { id: 'tool_jars',     name: 'Curing Gläser (6×)',  price: 22, desc: 'Benötigt für Curing', required: true },
  { id: 'tool_loupe',    name: 'Trichom-Lupe 60×',   price: 15, qualityBonus: 5, desc: 'Erkennt optimalen Erntezeitpunkt' },
  { id: 'tool_cloner',   name: 'Klonbox (24-fach)',   price: 55, desc: 'Erhöht Steckling-Erfolgsrate', clonerBonus: 0.2 },
];

// Samen – jetzt als Shop-Ware; werden als Inventar-Stück gekauft
// price = Preis pro Samen; im Inventar als { strainId: anzahl }
export const SEEDS = [
  {
    id: 'seed_budget_auto',
    name: 'Budget Auto',
    price: 8,
    type: 'auto',
    germDays: 3, seedlingDays: 7, vegDays: 14, flowerDays: 35,
    yieldMin: 18, yieldMax: 32,
    thc: 12,
    desc: 'Einfach, schnell, günstig',
    color: '#86efac',
  },
  {
    id: 'seed_ww',
    name: 'White Widow',
    price: 12,
    type: 'photo',
    germDays: 4, seedlingDays: 10, vegDays: 21, flowerDays: 56,
    yieldMin: 35, yieldMax: 55,
    thc: 18,
    desc: 'Klassiker, robust, lohnend',
    color: '#e2e8f0',
  },
  {
    id: 'seed_og_kush',
    name: 'OG Kush',
    price: 15,
    type: 'photo',
    germDays: 4, seedlingDays: 10, vegDays: 28, flowerDays: 63,
    yieldMin: 28, yieldMax: 48,
    thc: 20,
    desc: 'Hohes THC, Premium-Markt',
    color: '#fde68a',
  },
  {
    id: 'seed_ak47',
    name: 'AK-47',
    price: 14,
    type: 'photo',
    germDays: 3, seedlingDays: 10, vegDays: 21, flowerDays: 49,
    yieldMin: 40, yieldMax: 62,
    thc: 17,
    desc: 'Hoher Ertrag, schnell',
    color: '#fca5a5',
  },
  {
    id: 'seed_nl',
    name: 'Northern Lights',
    price: 13,
    type: 'photo',
    germDays: 3, seedlingDays: 10, vegDays: 21, flowerDays: 49,
    yieldMin: 35, yieldMax: 52,
    thc: 18,
    desc: 'Robust, guter Ertrag',
    color: '#a5b4fc',
  },
  {
    id: 'seed_gg_auto',
    name: 'Gorilla Glue Auto',
    price: 18,
    type: 'auto',
    germDays: 4, seedlingDays: 10, vegDays: 21, flowerDays: 49,
    yieldMin: 50, yieldMax: 80,
    thc: 22,
    desc: 'Top-THC, bester Preis',
    color: '#6ee7b7',
  },
];

export const ELECTRICITY_PRICE = 0.35;
export const WATER_COST_PER_PLANT_DAY = 0.5;

// Bewässerungssysteme – per room slot, automatisiert das Gießen
// waterEvery = alle N Tage automatisch gießen (1 = täglich, 2 = jeden 2. Tag)
export const DRIP_SYSTEMS = [
  {
    id: 'drip_basic',
    name: 'Tropfsystem Basic',
    price: 35,
    watt: 5,
    waterEvery: 2,
    desc: 'Gießt automatisch alle 2 Tage — halbiert den Trockenheits-Stress',
  },
  {
    id: 'drip_auto',
    name: 'Auto-Bewässerung Pro',
    price: 120,
    watt: 8,
    waterEvery: 1,
    desc: 'Vollautomatische tägliche Bewässerung — kein manuelles Gießen nötig',
  },
];

// Klima-Controller – per room slot, automatisiert Klima-Steuerung
export const CONTROLLERS = [
  {
    id: 'ctrl_timer',
    name: 'Zeitschaltuhr',
    price: 45,
    watt: 2,
    autoClimate: false,
    qualityBonus: 0.05,
    desc: 'Konsistente Lichtzyklen +0.05% Qualität/Tag',
  },
  {
    id: 'ctrl_smart',
    name: 'Smart-Controller',
    price: 250,
    watt: 10,
    autoClimate: true,
    qualityBonus: 0.05,
    desc: 'Regelt Abluft automatisch auf Zieltemperatur 24°C',
  },
];
