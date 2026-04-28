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
    desc: '12/12 Lichtrhythmus auslöst Blüte. Hoher P/K.',
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
    desc: 'Letzte 2 Wochen. Niedrige LF verhindert Schimmel.',
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
    desc: 'Bereit zur Ernte! Trichomdichte optimal.',
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
    desc: 'Dunkel, kühl, kontrollierte LF. 7-14 Tage.',
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
    desc: 'In Gläsern reifen, täglich lüften. Verbessert Qualität.',
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
  const { tempOpt, humOpt, tempMin, tempMax, humMin, humMax } = phase.climate;

  const tempDiff = Math.max(0, actual.temperature - tempMax, tempMin - actual.temperature);
  const humDiff = Math.max(0, actual.humidity - humMax, humMin - actual.humidity);
  const lightDiff = phase.climate.lightHours > 0
    ? Math.abs(actual.lightHours - phase.climate.lightHours)
    : 0;

  const tempPenalty = tempDiff * 3;
  const humPenalty = humDiff * 2;
  const lightPenalty = lightDiff * 5;

  return Math.max(0, 100 - tempPenalty - humPenalty - lightPenalty);
}
