export const PHASES = {
  germination: {
    id: 'germination',
    label: 'Keimung',
    icon: '🌱',
    color: '#86efac',
    climate: {
      tempMin: 22, tempMax: 28, tempOpt: 25,
      humMin: 65, humMax: 80, humOpt: 72,
      lightHours: 18,
      lightIntensity: 'low',
    },
    nutrientPhase: 'none',
    desc: 'Samen keimt im feuchten Medium.',
  },
  clone_rooting: {
    id: 'clone_rooting',
    label: 'Steckling',
    icon: '✂️',
    color: '#34d399',
    climate: {
      tempMin: 22, tempMax: 26, tempOpt: 24,
      humMin: 70, humMax: 90, humOpt: 80,
      lightHours: 18,
      lightIntensity: 'low',
    },
    nutrientPhase: 'none',
    desc: 'Steckling bildet Wurzeln. Hohe Luftfeuchtigkeit notwendig.',
  },
  seedling: {
    id: 'seedling',
    label: 'Sämling',
    icon: '🌿',
    color: '#4ade80',
    climate: {
      tempMin: 20, tempMax: 25, tempOpt: 22,
      humMin: 60, humMax: 70, humOpt: 65,
      lightHours: 18,
      lightIntensity: 'low',
    },
    nutrientPhase: 'low',
    desc: 'Erste Blätter entwickeln sich.',
  },
  vegetative: {
    id: 'vegetative',
    label: 'Wachstum',
    icon: '🌳',
    color: '#22c55e',
    climate: {
      tempMin: 22, tempMax: 28, tempOpt: 25,
      humMin: 40, humMax: 60, humOpt: 50,
      lightHours: 18,
      lightIntensity: 'high',
    },
    nutrientPhase: 'veg',
    desc: '18/6 Lichtrhythmus. Hoher Stickstoff.',
  },
  flowering: {
    id: 'flowering',
    label: 'Blüte',
    icon: '🌸',
    color: '#f472b6',
    climate: {
      tempMin: 18, tempMax: 26, tempOpt: 23,
      humMin: 40, humMax: 50, humOpt: 45,
      lightHours: 12,
      lightIntensity: 'high',
    },
    nutrientPhase: 'bloom',
    desc: '12/12 Lichtrhythmus. Hoher P/K.',
  },
  late_flower: {
    id: 'late_flower',
    label: 'Spätblüte',
    icon: '💜',
    color: '#c084fc',
    climate: {
      tempMin: 18, tempMax: 24, tempOpt: 21,
      humMin: 35, humMax: 45, humOpt: 40,
      lightHours: 12,
      lightIntensity: 'high',
    },
    nutrientPhase: 'ripening',
    desc: 'Letzte Wochen. Niedrige LF verhindert Schimmel.',
  },
  harvest_ready: {
    id: 'harvest_ready',
    label: 'Erntereif',
    icon: '✂️',
    color: '#facc15',
    climate: {
      tempMin: 18, tempMax: 24, tempOpt: 21,
      humMin: 35, humMax: 45, humOpt: 40,
      lightHours: 12,
      lightIntensity: 'high',
    },
    nutrientPhase: 'flush',
    desc: 'Bereit zur Ernte! Jetzt spülen.',
  },
  drying: {
    id: 'drying',
    label: 'Trocknung',
    icon: '💨',
    color: '#fb923c',
    climate: {
      tempMin: 15, tempMax: 21, tempOpt: 18,
      humMin: 45, humMax: 55, humOpt: 50,
      lightHours: 0,
      lightIntensity: 'none',
    },
    nutrientPhase: 'none',
    desc: 'Dunkel, kühl, kontrollierte LF.',
  },
  curing: {
    id: 'curing',
    label: 'Curing',
    icon: '🫙',
    color: '#f97316',
    climate: {
      tempMin: 18, tempMax: 22, tempOpt: 20,
      humMin: 58, humMax: 65, humOpt: 62,
      lightHours: 0,
      lightIntensity: 'none',
    },
    nutrientPhase: 'none',
    desc: 'In Gläsern reifen. Verbessert Qualität.',
  },
  ready: {
    id: 'ready',
    label: 'Verkaufsbereit',
    icon: '💰',
    color: '#22d3ee',
    climate: null,
    nutrientPhase: 'none',
    desc: 'Fertig! Bereit zum Verkauf.',
  },
};

// NPK-Bedarf pro Wachstumsphase
// type = bevorzugter Nährstofftyp ('grow'|'bloom'|'pk_boost'|'micro'|'complete'|'none')
export const PHASE_NPK = {
  germination:   null,
  clone_rooting: null,
  seedling:      { n: 2,  p: 2, k: 2,  type: 'complete', label: 'Basis 2-2-2', tip: 'Sehr wenig Dünger, nur All-in-One empfohlen' },
  vegetative:    { n: 7,  p: 3, k: 5,  type: 'grow',     label: 'Grow 7-3-5',  tip: 'Hoher Stickstoff für Blattwachstum' },
  flowering:     { n: 3,  p: 6, k: 8,  type: 'bloom',    label: 'Bloom 3-6-8', tip: 'Viel P/K für Knospenbildung' },
  late_flower:   { n: 1,  p: 5, k: 9,  type: 'pk_boost', label: 'PK 1-5-9',   tip: 'PK-Boost für Dichte und Gewicht' },
  harvest_ready: { n: 0,  p: 0, k: 0,  type: 'none',     label: 'Flush 0-0-0', tip: 'Nur noch Wasser – alle Nährstoffe ausspülen' },
  drying:        null,
  curing:        null,
  ready:         null,
};

export const PHASE_ORDER_PHOTO = [
  'germination', 'seedling', 'vegetative', 'flowering', 'late_flower', 'harvest_ready',
];

export const PHASE_ORDER_AUTO = [
  'germination', 'seedling', 'vegetative', 'flowering', 'late_flower', 'harvest_ready',
];

export function getPhaseInfo(phaseId) {
  return PHASES[phaseId] || null;
}

export function getClimateScore(actual, phaseId) {
  const phase = PHASES[phaseId];
  if (!phase || !phase.climate) return 100;
  const { tempMin, tempMax, humMin, humMax } = phase.climate;

  const tempDiff = Math.max(0, actual.temperature - tempMax, tempMin - actual.temperature);
  const humDiff  = Math.max(0, actual.humidity - humMax,     humMin - actual.humidity);
  const lightDiff = phase.climate.lightHours > 0
    ? Math.abs(actual.lightHours - phase.climate.lightHours)
    : 0;

  return Math.max(0, 100 - tempDiff * 3 - humDiff * 2 - lightDiff * 5);
}

// Quality modifier from nutrient type match (0.0–1.0, then scaled to bonus)
// Returns relative bonus: 1.0 = perfect match, 0.5 = wrong type, 0.0 = flush phase
export function getNutrientMatchScore(phaseId, nutType) {
  const npk = PHASE_NPK[phaseId];
  if (!npk || npk.type === 'none') return 0;
  if (nutType === npk.type) return 1.0;
  if (nutType === 'complete') return 0.6;
  return 0.3;
}
