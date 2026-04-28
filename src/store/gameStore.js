import { create } from 'zustand';
import { calcClimate, calcDailyElectricity } from '../utils/climate';
import { getClimateScore } from '../data/phases';
import { SEEDS } from '../data/equipment';

const GAME_DAY_MS = 8 * 60 * 1000; // 8 minutes real = 1 game day

let plantIdCounter = 0;
const newPlantId = () => `plant_${++plantIdCounter}`;

function createPlant(strainId, potItem) {
  const strain = SEEDS.find(s => s.id === strainId);
  if (!strain) return null;
  return {
    id: newPlantId(),
    strainId,
    strainName: strain.name,
    strainColor: strain.color,
    type: strain.type,
    phase: 'germination',
    phaseDay: 0,
    totalDays: 0,
    health: 100,
    quality: 100,
    qualityHistory: [],
    potLiters: potItem?.liters ?? 11,
    potYieldFactor: potItem?.yieldFactor ?? 1.0,
    yieldMin: strain.yieldMin,
    yieldMax: strain.yieldMax,
    germDays: strain.germDays,
    seedlingDays: strain.seedlingDays,
    vegDays: strain.vegDays,
    flowerDays: strain.flowerDays,
    harvestedGrams: 0,
    harvested: false,
    dryingDay: 0,
    curingDay: 0,
  };
}

function advancePlantPhase(plant, autoTrigger) {
  const p = { ...plant };
  switch (p.phase) {
    case 'germination':
      if (p.phaseDay >= p.germDays) { p.phase = 'seedling'; p.phaseDay = 0; }
      break;
    case 'seedling':
      if (p.phaseDay >= p.seedlingDays) { p.phase = 'vegetative'; p.phaseDay = 0; }
      break;
    case 'vegetative':
      // photo needs 12/12 trigger; auto advances automatically
      if (p.type === 'auto' && p.phaseDay >= p.vegDays) {
        p.phase = 'flowering'; p.phaseDay = 0;
      } else if (p.type === 'photo' && autoTrigger && p.phaseDay >= p.vegDays) {
        p.phase = 'flowering'; p.phaseDay = 0;
      }
      break;
    case 'flowering': {
      const lateStart = Math.floor(p.flowerDays * 0.75);
      if (p.phaseDay >= lateStart) { p.phase = 'late_flower'; p.phaseDay = 0; }
      break;
    }
    case 'late_flower': {
      const lateLen = Math.floor(plant.flowerDays * 0.25);
      if (p.phaseDay >= lateLen) { p.phase = 'harvest_ready'; p.phaseDay = 0; }
      break;
    }
    case 'harvest_ready':
      break;
    case 'drying':
      if (p.dryingDay >= 10) { p.phase = 'curing'; p.dryingDay = 0; p.curingDay = 0; }
      break;
    case 'curing':
      if (p.curingDay >= 14) { p.phase = 'ready'; }
      break;
    default:
      break;
  }
  return p;
}

function calcPlantQualityDelta(plant, climate, tools) {
  const phaseId = plant.phase;
  if (['harvested', 'ready'].includes(phaseId)) return 0;

  const score = getClimateScore(climate, phaseId);
  const delta = (score - 85) * 0.15; // gain/lose up to ~2.25 per day

  let toolBonus = 0;
  if (tools.includes('tool_ph')) toolBonus += 0.3;
  if (tools.includes('tool_ppm')) toolBonus += 0.2;

  return delta + toolBonus;
}

function calcHarvestYield(plant, nutrientMult, tools) {
  const base = (plant.yieldMin + plant.yieldMax) / 2;
  const potFactor = plant.potYieldFactor;
  const qualityFactor = plant.quality / 100;
  const scissorsBonus = tools.includes('tool_scissors') ? 1.05 : 1.0;
  const trayBonus = tools.includes('tool_tray') ? 1.03 : 1.0;
  const rand = 0.9 + Math.random() * 0.2;
  return Math.round(base * potFactor * qualityFactor * nutrientMult * scissorsBonus * trayBonus * rand);
}

function sellPrice(qualityPct) {
  if (qualityPct >= 90) return 12;
  if (qualityPct >= 75) return 10;
  if (qualityPct >= 55) return 8;
  return 5;
}

export const useGameStore = create((set, get) => ({
  // --- game meta ---
  started: false,
  gameOver: false,
  day: 1,
  money: 1000,
  tickerId: null,
  lastTick: null,

  // --- equipment ---
  equipment: {
    tent: null,
    lamp: null,
    exhaust: null,
    fan: null,
    filter: null,
    pots: [],        // array of pot items (one per slot)
    nutrients: null,
    tools: [],       // array of tool ids
  },

  // --- settings (adjustable during game) ---
  settings: {
    lampHours: 18,
    exhaustSpeed: 70, // 0–100 %
  },

  // --- plants ---
  plants: [],

  // --- climate (computed) ---
  climate: { temperature: 22, humidity: 55, lightHours: 18 },

  // --- financials ---
  transactions: [],   // { day, desc, amount }
  totalSpent: 0,
  totalRevenue: 0,
  electricityAccrued: 0,

  // --- notifications ---
  notifications: [],

  // -------------------------------------------------------
  // HELPERS
  // -------------------------------------------------------
  _addNotification(msg, type = 'info') {
    const id = Date.now() + Math.random();
    set(s => ({ notifications: [...s.notifications.slice(-9), { id, msg, type }] }));
    setTimeout(() => {
      set(s => ({ notifications: s.notifications.filter(n => n.id !== id) }));
    }, 5000);
  },

  _addTransaction(desc, amount) {
    const { day, transactions, totalSpent, totalRevenue } = get();
    set({
      transactions: [...transactions.slice(-99), { day, desc, amount }],
      totalSpent: amount < 0 ? totalSpent + Math.abs(amount) : totalSpent,
      totalRevenue: amount > 0 ? totalRevenue + amount : totalRevenue,
    });
  },

  // -------------------------------------------------------
  // SHOP
  // -------------------------------------------------------
  buyEquipment(category, item) {
    const { money, equipment, _addNotification, _addTransaction } = get();
    if (money < item.price) {
      _addNotification('Nicht genug Geld!', 'error');
      return false;
    }
    const newEquipment = { ...equipment, [category]: item };
    set({ money: money - item.price, equipment: newEquipment });
    _addTransaction(`Kauf: ${item.name}`, -item.price);
    _addNotification(`${item.name} gekauft`, 'success');
    return true;
  },

  buyTool(toolItem) {
    const { money, equipment, _addNotification, _addTransaction } = get();
    if (money < toolItem.price) {
      _addNotification('Nicht genug Geld!', 'error');
      return false;
    }
    if (equipment.tools.includes(toolItem.id)) {
      _addNotification('Bereits vorhanden', 'warn');
      return false;
    }
    set({
      money: money - toolItem.price,
      equipment: { ...equipment, tools: [...equipment.tools, toolItem.id] },
    });
    _addTransaction(`Kauf: ${toolItem.name}`, -toolItem.price);
    _addNotification(`${toolItem.name} gekauft`, 'success');
    return true;
  },

  buyPot(potItem) {
    const { money, equipment, _addNotification, _addTransaction } = get();
    const { tent } = equipment;
    const maxSlots = tent?.maxPlants ?? 0;
    if (equipment.pots.length >= maxSlots) {
      _addNotification('Zelt voll! Kein Platz für weitere Töpfe.', 'error');
      return false;
    }
    if (money < potItem.price) {
      _addNotification('Nicht genug Geld!', 'error');
      return false;
    }
    set({
      money: money - potItem.price,
      equipment: { ...equipment, pots: [...equipment.pots, potItem] },
    });
    _addTransaction(`Kauf: ${potItem.name}`, -potItem.price);
    _addNotification(`${potItem.name} gekauft`, 'success');
    return true;
  },

  // -------------------------------------------------------
  // PLANTING
  // -------------------------------------------------------
  plantSeed(strainId, potIndex) {
    const { plants, equipment, money, _addNotification, _addTransaction } = get();
    const strain = SEEDS.find(s => s.id === strainId);
    if (!strain) return;
    if (money < strain.price) {
      _addNotification('Nicht genug Geld für Samen!', 'error');
      return;
    }
    const usedPotIndices = plants.filter(p => !['ready'].includes(p.phase)).map(p => p.potIndex);
    if (usedPotIndices.includes(potIndex)) {
      _addNotification('Topf bereits belegt!', 'error');
      return;
    }
    const pot = equipment.pots[potIndex];
    if (!pot) { _addNotification('Kein Topf vorhanden!', 'error'); return; }

    const plant = { ...createPlant(strainId, pot), potIndex };
    set({
      money: money - strain.price,
      plants: [...plants, plant],
    });
    _addTransaction(`Samen: ${strain.name}`, -strain.price);
    _addNotification(`${strain.name} eingepflanzt`, 'success');
  },

  removePlant(plantId) {
    set(s => ({ plants: s.plants.filter(p => p.id !== plantId) }));
  },

  // -------------------------------------------------------
  // HARVEST
  // -------------------------------------------------------
  harvestPlant(plantId) {
    const { plants, equipment, _addNotification } = get();
    const plant = plants.find(p => p.id === plantId);
    if (!plant || plant.phase !== 'harvest_ready') return;

    const nutMult = equipment.nutrients?.qualityMult ?? 1.0;
    const grams = calcHarvestYield(plant, nutMult, equipment.tools);

    set(s => ({
      plants: s.plants.map(p =>
        p.id === plantId
          ? { ...p, phase: 'drying', dryingDay: 0, curingDay: 0, harvestedGrams: grams }
          : p
      ),
    }));
    _addNotification(`${plant.strainName} geerntet! ${grams}g → Trocknung`, 'success');
  },

  sellHarvest(plantId) {
    const { plants, equipment, _addNotification, _addTransaction } = get();
    const plant = plants.find(p => p.id === plantId);
    if (!plant || plant.phase !== 'ready') return;

    const hasCuringJars = equipment.tools.includes('tool_jars');
    const qualityBonus = hasCuringJars ? 0 : -15;
    const effectiveQuality = Math.max(0, plant.quality + qualityBonus);
    const pricePerG = sellPrice(effectiveQuality);
    const revenue = plant.harvestedGrams * pricePerG;

    set(s => ({
      money: s.money + revenue,
      plants: s.plants.filter(p => p.id !== plantId),
    }));
    _addTransaction(
      `Verkauf: ${plant.strainName} ${plant.harvestedGrams}g @ ${pricePerG}€/g`,
      revenue
    );
    _addNotification(`${plant.strainName} verkauft! +${revenue}€`, 'success');
  },

  // -------------------------------------------------------
  // SETTINGS
  // -------------------------------------------------------
  setLampHours(h) {
    set(s => ({ settings: { ...s.settings, lampHours: Number(h) } }));
  },

  setExhaustSpeed(v) {
    set(s => ({ settings: { ...s.settings, exhaustSpeed: Number(v) } }));
  },

  // -------------------------------------------------------
  // GAME LOOP
  // -------------------------------------------------------
  startGame() {
    const { tickerId } = get();
    if (tickerId) clearInterval(tickerId);

    const id = setInterval(() => {
      get()._tick();
    }, GAME_DAY_MS);

    set({ started: true, lastTick: Date.now(), tickerId: id });
  },

  stopGame() {
    const { tickerId } = get();
    if (tickerId) clearInterval(tickerId);
    set({ tickerId: null });
  },

  _tick() {
    const state = get();
    const {
      day, money, plants, equipment, settings,
      _addNotification, _addTransaction,
    } = state;

    // Climate
    const activePlants = plants.filter(p => !['drying', 'curing', 'ready'].includes(p.phase));
    const climate = calcClimate(equipment, settings, activePlants.length);
    const dailyElec = calcDailyElectricity(equipment, settings);
    const waterCost = activePlants.length * 0.5;
    const dailyCost = dailyElec + waterCost;

    if (money - dailyCost <= -500) {
      clearInterval(state.tickerId);
      set({ gameOver: true });
      _addNotification('GAME OVER – Bankrott!', 'error');
      return;
    }

    // Advance plants
    const photoTrigger = equipment.lamp && settings.lampHours <= 12;
    const updatedPlants = plants.map(plant => {
      let p = { ...plant };

      // Drying / Curing progress
      if (p.phase === 'drying') {
        p.dryingDay = (p.dryingDay || 0) + 1;
      } else if (p.phase === 'curing') {
        p.curingDay = (p.curingDay || 0) + 1;
        // Quality improves during curing
        p.quality = Math.min(100, p.quality + 0.5);
      }

      if (!['drying', 'curing', 'ready'].includes(p.phase)) {
        // Quality update
        const qDelta = calcPlantQualityDelta(p, climate, equipment.tools);
        p.quality = Math.max(0, Math.min(100, p.quality + qDelta));

        // Health penalty if quality very low
        if (p.quality < 20) p.health = Math.max(0, p.health - 2);

        p.phaseDay += 1;
        p.totalDays += 1;

        if (p.phase === 'vegetative' && p.type === 'photo' && settings.lampHours <= 12) {
          p.phase = 'flowering';
          p.phaseDay = 0;
          _addNotification(`${p.strainName} ist in die Blüte gewechselt!`, 'info');
        }
      }

      p = advancePlantPhase(p, photoTrigger);

      if (p.phase === 'harvest_ready' && plant.phase !== 'harvest_ready') {
        _addNotification(`${p.strainName} ist erntereif!`, 'success');
      }
      if (p.phase === 'curing' && plant.phase === 'drying') {
        _addNotification(`${p.strainName} Trocknung abgeschlossen → Curing`, 'info');
      }
      if (p.phase === 'ready' && plant.phase === 'curing') {
        _addNotification(`${p.strainName} ist verkaufsbereit!`, 'success');
      }

      return p;
    });

    set({
      day: day + 1,
      money: Math.round((money - dailyCost) * 100) / 100,
      plants: updatedPlants,
      climate,
      electricityAccrued: Math.round((state.electricityAccrued + dailyElec) * 100) / 100,
    });

    if ((day + 1) % 30 === 0) {
      _addNotification(`Tag ${day + 1}: Monat abgeschlossen.`, 'info');
    }
  },

  resetGame() {
    const { tickerId } = get();
    if (tickerId) clearInterval(tickerId);
    plantIdCounter = 0;
    set({
      started: false,
      gameOver: false,
      day: 1,
      money: 1000,
      tickerId: null,
      lastTick: null,
      equipment: { tent: null, lamp: null, exhaust: null, fan: null, filter: null, pots: [], nutrients: null, tools: [] },
      settings: { lampHours: 18, exhaustSpeed: 70 },
      plants: [],
      climate: { temperature: 22, humidity: 55, lightHours: 18 },
      transactions: [],
      totalSpent: 0,
      totalRevenue: 0,
      electricityAccrued: 0,
      notifications: [],
    });
  },
}));
