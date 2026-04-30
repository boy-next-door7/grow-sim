import { create } from 'zustand';
import { calcClimate, calcDailyElectricity } from '../utils/climate';
import { getClimateScore, getNutrientMatchScore, PHASES } from '../data/phases';
import { SEEDS, NUTRIENTS, TOOLS, SUBSTRATES, DRIP_SYSTEMS, CONTROLLERS } from '../data/equipment';
import { supabase } from '../lib/supabase';

export const GAME_DAY_MS = 8 * 60 * 1000;

let _plantCounter = 0;
let _hybridCounter = 0;
let _roomCounter = 0;

const newPlantId  = () => `plant_${++_plantCounter}`;
const newRoomId   = () => `room_${++_roomCounter}`;

function makeRoom(overrides = {}) {
  return {
    id: newRoomId(),
    tent: null, lamp: null, lampHours: 18, lampIntensity: 100,
    exhaust: null, exhaustSpeed: 70,
    fan: null, filter: null,
    pots: [],
    drip: null, controller: null,
    climate: { temperature: 22, humidity: 55, lightHours: 18, effectivePPFD: 0 },
    ...overrides,
  };
}

// First room created before store init
const INIT_ROOM = makeRoom(); // id = 'room_1'

function makePlant(strain, potItem, substrateBonus = 0, overrides = {}) {
  return {
    id: newPlantId(),
    strainId: strain.id,
    strainName: strain.name,
    strainColor: strain.color,
    type: strain.type,
    phase: 'germination',
    phaseDay: 0,
    totalDays: 0,
    health: 100,
    quality: 100,
    potLiters: potItem?.liters ?? 11,
    potYieldFactor: potItem?.yieldFactor ?? 1.0,
    yieldMin: strain.yieldMin,
    yieldMax: strain.yieldMax,
    germDays: strain.germDays,
    seedlingDays: strain.seedlingDays,
    vegDays: strain.vegDays,
    flowerDays: strain.flowerDays,
    harvestedGrams: 0,
    dryingDay: 0,
    curingDay: 0,
    wateredToday: false,
    fertilizedToday: false,
    daysUnwatered: 0,
    substrateBonus,
    isMother: false,
    isClone: false,
    roomId: null,
    potIndex: 0,
    ...overrides,
  };
}

function advancePlantPhase(plant, photoTrigger) {
  const p = { ...plant };
  switch (p.phase) {
    case 'germination':
      if (p.phaseDay >= p.germDays) { p.phase = 'seedling'; p.phaseDay = 0; }
      break;
    case 'clone_rooting':
      if (p.phaseDay >= 5) { p.phase = 'seedling'; p.phaseDay = 0; }
      break;
    case 'seedling':
      if (p.phaseDay >= p.seedlingDays) { p.phase = 'vegetative'; p.phaseDay = 0; }
      break;
    case 'vegetative':
      if (p.isMother) break;
      if (p.type === 'auto' && p.phaseDay >= p.vegDays) { p.phase = 'flowering'; p.phaseDay = 0; }
      else if (p.type === 'photo' && photoTrigger && p.phaseDay >= p.vegDays) { p.phase = 'flowering'; p.phaseDay = 0; }
      break;
    case 'flowering': {
      const lateStart = Math.floor(p.flowerDays * 0.75);
      if (p.phaseDay >= lateStart) { p.phase = 'late_flower'; p.phaseDay = 0; }
      break;
    }
    case 'late_flower': {
      const lateLen = Math.ceil(plant.flowerDays * 0.25);
      if (p.phaseDay >= lateLen) { p.phase = 'harvest_ready'; p.phaseDay = 0; }
      break;
    }
    case 'harvest_ready': break;
    case 'drying':
      if (p.dryingDay >= 10) { p.phase = 'curing'; p.dryingDay = 0; p.curingDay = 0; }
      break;
    case 'curing':
      if (p.curingDay >= 14) { p.phase = 'ready'; }
      break;
    default: break;
  }
  return p;
}

function calcQualityDelta(plant, climate, tools) {
  const pid = plant.phase;
  if (['ready', 'drying', 'curing'].includes(pid)) return 0;
  const score = getClimateScore(climate, pid);
  let d = (score - 85) * 0.15;
  const phaseData = PHASES[pid];
  if (phaseData?.climate?.lightIntensity === 'high') {
    const ppfd = climate.effectivePPFD ?? 0;
    if (ppfd > 0 && ppfd < 0.8) d -= 0.3;
  }
  if (tools.includes('tool_ph'))    d += 0.3;
  if (tools.includes('tool_ppm'))   d += 0.2;
  if (tools.includes('tool_loupe') && pid === 'harvest_ready') d += 0.2;
  if (plant.substrateBonus)         d += plant.substrateBonus;
  return d;
}

function calcYield(plant, tools) {
  const base = (plant.yieldMin + plant.yieldMax) / 2;
  const scissors = tools.includes('tool_scissors') ? 1.05 : 1;
  const tray     = tools.includes('tool_tray')     ? 1.03 : 1;
  return Math.round(base * plant.potYieldFactor * (plant.quality / 100) * scissors * tray * (0.9 + Math.random() * 0.2));
}

function sellPrice(q) {
  if (q >= 90) return 12; if (q >= 75) return 10; if (q >= 55) return 8; return 5;
}

function blendHex(a, b) {
  const p = h => [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
  const [r1,g1,b1] = p(a); const [r2,g2,b2] = p(b);
  return `#${[Math.round((r1+r2)/2),Math.round((g1+g2)/2),Math.round((b1+b2)/2)].map(x=>x.toString(16).padStart(2,'0')).join('')}`;
}

export const useGameStore = create((set, get) => ({
  started: false, gameOver: false,
  day: 1, money: 1000, tickerId: null, lastTick: null,
  user: null, saveStatus: 'idle', // 'idle' | 'saving' | 'saved' | 'error'

  rooms: [{ ...INIT_ROOM }],
  activeRoomId: INIT_ROOM.id,

  inventory: { seeds: {}, substrate: {}, nutrients: {}, tools: [] },
  customStrains: [],
  plants: [],

  transactions: [], totalSpent: 0, totalRevenue: 0, electricityAccrued: 0,
  notifications: [],

  // ── helpers ────────────────────────────────────────────
  _addNotification(msg, type = 'info') {
    const id = Date.now() + Math.random();
    const day = get().day;
    set(s => ({ notifications: [...s.notifications.slice(-49), { id, msg, type, day }] }));
  },
  _addTransaction(desc, amount) {
    const { day, transactions, totalSpent, totalRevenue } = get();
    set({
      transactions: [...transactions.slice(-99), { day, desc, amount }],
      totalSpent:   amount < 0 ? totalSpent + Math.abs(amount) : totalSpent,
      totalRevenue: amount > 0 ? totalRevenue + amount : totalRevenue,
    });
  },
  getAllStrains() { return [...SEEDS, ...get().customStrains]; },

  // ── rooms ───────────────────────────────────────────────
  addRoom() {
    const r = makeRoom();
    set(s => ({ rooms: [...s.rooms, r], activeRoomId: r.id }));
    get()._addNotification('Neues Zimmer eingerichtet', 'info');
  },
  removeRoom(roomId) {
    const { rooms, plants, activeRoomId, _addNotification } = get();
    if (rooms.length <= 1) { _addNotification('Letztes Zimmer kann nicht entfernt werden.', 'error'); return; }
    if (plants.some(p => p.roomId === roomId && p.phase !== 'ready')) { _addNotification('Zimmer hat aktive Pflanzen!', 'error'); return; }
    const next = rooms.filter(r => r.id !== roomId);
    set({ rooms: next, plants: plants.filter(p => p.roomId !== roomId), activeRoomId: activeRoomId === roomId ? next[0].id : activeRoomId });
  },
  setActiveRoom(id) { set({ activeRoomId: id }); },

  // ── room settings ───────────────────────────────────────
  setRoomLampHours(roomId, h)    { set(s => ({ rooms: s.rooms.map(r => r.id === roomId ? { ...r, lampHours:    Number(h) } : r) })); },
  setRoomLampIntensity(roomId, v){ set(s => ({ rooms: s.rooms.map(r => r.id === roomId ? { ...r, lampIntensity: Number(v) } : r) })); },
  setRoomExhaustSpeed(roomId, v) { set(s => ({ rooms: s.rooms.map(r => r.id === roomId ? { ...r, exhaustSpeed:  Number(v) } : r) })); },

  // ── buy equipment (→ active room) ───────────────────────
  buyEquipment(category, item) {
    const { money, rooms, activeRoomId, plants, _addNotification, _addTransaction } = get();
    if (money < item.price) { _addNotification('Nicht genug Geld!', 'error'); return false; }
    if (category === 'tent') {
      const room = rooms.find(r => r.id === activeRoomId);
      if (room?.tent && plants.some(p => p.roomId === activeRoomId && p.phase !== 'ready')) {
        _addNotification('Zelt kann nicht getauscht werden – Pflanzen aktiv!', 'error'); return false;
      }
    }
    set(s => ({
      money: s.money - item.price,
      rooms: s.rooms.map(r => r.id === s.activeRoomId ? { ...r, [category]: item } : r),
    }));
    _addTransaction(`Kauf: ${item.name}`, -item.price);
    _addNotification(`${item.name} gekauft`, 'success');
    return true;
  },
  buyPot(potItem) {
    const { money, rooms, activeRoomId, _addNotification, _addTransaction } = get();
    const room = rooms.find(r => r.id === activeRoomId);
    if (!room?.tent) { _addNotification('Kein Zelt im aktiven Zimmer!', 'error'); return false; }
    if (room.pots.length >= room.tent.maxPlants) { _addNotification('Zelt voll!', 'error'); return false; }
    if (money < potItem.price) { _addNotification('Nicht genug Geld!', 'error'); return false; }
    set(s => ({
      money: s.money - potItem.price,
      rooms: s.rooms.map(r => r.id === activeRoomId ? { ...r, pots: [...r.pots, potItem] } : r),
    }));
    _addTransaction(`Kauf: ${potItem.name}`, -potItem.price);
    _addNotification(`${potItem.name} gekauft`, 'success');
    return true;
  },
  buyTool(toolItem) {
    const { money, inventory, _addNotification, _addTransaction } = get();
    if (money < toolItem.price) { _addNotification('Nicht genug Geld!', 'error'); return false; }
    if (inventory.tools.includes(toolItem.id)) { _addNotification('Bereits vorhanden', 'warn'); return false; }
    set(s => ({ money: s.money - toolItem.price, inventory: { ...s.inventory, tools: [...s.inventory.tools, toolItem.id] } }));
    _addTransaction(`Kauf: ${toolItem.name}`, -toolItem.price);
    _addNotification(`${toolItem.name} gekauft`, 'success');
    return true;
  },

  // ── consumables ─────────────────────────────────────────
  buySeeds(strainId) {
    const strain = get().getAllStrains().find(s => s.id === strainId);
    if (!strain) return false;
    const { money, _addNotification, _addTransaction } = get();
    if (money < strain.price) { _addNotification('Nicht genug Geld!', 'error'); return false; }
    set(s => ({
      money: s.money - strain.price,
      inventory: { ...s.inventory, seeds: { ...s.inventory.seeds, [strainId]: (s.inventory.seeds[strainId] ?? 0) + 1 } },
    }));
    _addTransaction(`Samen: ${strain.name}`, -strain.price);
    _addNotification(`${strain.name} Samen gekauft`, 'success');
    return true;
  },
  buySubstrate(subItem) {
    const { money, _addNotification, _addTransaction } = get();
    if (money < subItem.price) { _addNotification('Nicht genug Geld!', 'error'); return false; }
    set(s => ({
      money: s.money - subItem.price,
      inventory: { ...s.inventory, substrate: { ...s.inventory.substrate, [subItem.id]: (s.inventory.substrate[subItem.id] ?? 0) + subItem.liters } },
    }));
    _addTransaction(`Substrat: ${subItem.name}`, -subItem.price);
    _addNotification(`${subItem.name} gekauft (+${subItem.liters}L)`, 'success');
    return true;
  },
  buyNutrients(nutItem) {
    const { money, _addNotification, _addTransaction } = get();
    if (money < nutItem.price) { _addNotification('Nicht genug Geld!', 'error'); return false; }
    set(s => ({
      money: s.money - nutItem.price,
      inventory: { ...s.inventory, nutrients: { ...s.inventory.nutrients, [nutItem.id]: (s.inventory.nutrients[nutItem.id] ?? 0) + nutItem.mlPerBuy } },
    }));
    _addTransaction(`Dünger: ${nutItem.name}`, -nutItem.price);
    _addNotification(`${nutItem.name} gekauft (+${nutItem.mlPerBuy}ml)`, 'success');
    return true;
  },

  // ── sell equipment ──────────────────────────────────────
  sellEquipment(category) {
    const { rooms, activeRoomId, plants, _addNotification, _addTransaction } = get();
    const room = rooms.find(r => r.id === activeRoomId);
    const item = room?.[category];
    if (!item) { _addNotification('Kein Gerät!', 'error'); return false; }
    if (category === 'tent' && plants.some(p => p.roomId === activeRoomId && p.phase !== 'ready')) {
      _addNotification('Zelt kann nicht verkauft werden – Pflanzen aktiv!', 'error'); return false;
    }
    const refund = Math.floor(item.price / 2);
    set(s => ({
      money: s.money + refund,
      rooms: s.rooms.map(r => r.id === activeRoomId ? { ...r, [category]: null } : r),
    }));
    _addTransaction(`Verkauf: ${item.name}`, refund);
    _addNotification(`${item.name} für ${refund}€ verkauft`, 'success');
    return true;
  },
  sellTool(toolId) {
    const { inventory, _addNotification, _addTransaction } = get();
    if (!inventory.tools.includes(toolId)) { _addNotification('Nicht vorhanden!', 'error'); return false; }
    const t = TOOLS.find(x => x.id === toolId);
    if (!t) return false;
    const refund = Math.floor(t.price / 2);
    set(s => ({ money: s.money + refund, inventory: { ...s.inventory, tools: s.inventory.tools.filter(x => x !== toolId) } }));
    _addTransaction(`Verkauf: ${t.name}`, refund);
    _addNotification(`${t.name} für ${refund}€ verkauft`, 'success');
    return true;
  },
  sellPot(roomId, potIndex) {
    const { rooms, plants, _addNotification, _addTransaction } = get();
    const room = rooms.find(r => r.id === roomId);
    const pot = room?.pots[potIndex];
    if (!pot) { _addNotification('Kein Topf!', 'error'); return false; }
    if (plants.some(p => p.roomId === roomId && p.potIndex === potIndex && p.phase !== 'ready')) {
      _addNotification('Topf ist belegt!', 'error'); return false;
    }
    const refund = Math.floor(pot.price / 2);
    const newPots = [...room.pots]; newPots.splice(potIndex, 1);
    set(s => ({
      money: s.money + refund,
      rooms: s.rooms.map(r => r.id === roomId ? { ...r, pots: newPots } : r),
      plants: s.plants.map(p => p.roomId === roomId && p.potIndex > potIndex ? { ...p, potIndex: p.potIndex - 1 } : p),
    }));
    _addTransaction(`Verkauf: ${pot.name}`, refund);
    _addNotification(`${pot.name} für ${refund}€ verkauft`, 'success');
    return true;
  },

  // ── planting ────────────────────────────────────────────
  plantSeed(strainId, potIndex, roomId, subId) {
    const { rooms, plants, inventory, customStrains, _addNotification, _addTransaction } = get();
    const strain = [...SEEDS, ...customStrains].find(s => s.id === strainId);
    if (!strain) return;
    const room = rooms.find(r => r.id === roomId);
    const pot  = room?.pots[potIndex];
    if (!pot) { _addNotification('Kein Topf!', 'error'); return; }
    if ((inventory.seeds[strainId] ?? 0) < 1) { _addNotification('Keine Samen im Inventar!', 'error'); return; }
    if ((inventory.substrate[subId] ?? 0) < pot.liters) { _addNotification('Nicht genug Substrat!', 'error'); return; }
    if (plants.some(p => p.roomId === roomId && p.potIndex === potIndex && p.phase !== 'ready')) {
      _addNotification('Topf bereits belegt!', 'error'); return;
    }
    const subItem = SUBSTRATES.find(s => s.id === subId);
    const plant = makePlant(strain, pot, subItem?.qualityBonus ?? 0, { roomId, potIndex });
    set(s => ({
      plants: [...s.plants, plant],
      inventory: {
        ...s.inventory,
        seeds:     { ...s.inventory.seeds,     [strainId]: s.inventory.seeds[strainId] - 1 },
        substrate: { ...s.inventory.substrate, [subId]:    s.inventory.substrate[subId] - pot.liters },
      },
    }));
    _addTransaction(`Samen: ${strain.name}`, 0);
    _addNotification(`${strain.name} eingepflanzt (${subItem?.name ?? 'Substrat'})`, 'success');
  },
  removePlant(plantId) { set(s => ({ plants: s.plants.filter(p => p.id !== plantId) })); },

  // ── plant care ──────────────────────────────────────────
  waterPlant(plantId) {
    const { plants, _addNotification } = get();
    const plant = plants.find(p => p.id === plantId);
    if (!plant) return;
    if (['drying','curing','ready','harvest_ready','clone_rooting'].includes(plant.phase)) { _addNotification('Kein Gießen nötig.', 'warn'); return; }
    if (plant.wateredToday) { _addNotification('Heute bereits gegossen!', 'warn'); return; }
    set(s => ({ plants: s.plants.map(p => p.id === plantId ? { ...p, health: Math.min(100, p.health + 5), wateredToday: true } : p) }));
    _addNotification(`${plant.strainName} gegossen! +5 HP`, 'success');
  },
  fertilizePlant(plantId, nutId) {
    const { plants, inventory, _addNotification } = get();
    const plant = plants.find(p => p.id === plantId);
    if (!plant) return;
    if (['drying','curing','ready','germination','clone_rooting'].includes(plant.phase)) { _addNotification('Phase benötigt keinen Dünger.', 'warn'); return; }
    if (plant.fertilizedToday) { _addNotification('Heute bereits gedüngt!', 'warn'); return; }
    const nut = NUTRIENTS.find(n => n.id === nutId);
    if (!nut) return;
    const avail = inventory.nutrients[nutId] ?? 0;
    if (avail < nut.mlPerFeed) { _addNotification(`Nicht genug ${nut.name}!`, 'error'); return; }
    const bonus = getNutrientMatchScore(plant.phase, nut.type) * 4;
    set(s => ({
      inventory: { ...s.inventory, nutrients: { ...s.inventory.nutrients, [nutId]: s.inventory.nutrients[nutId] - nut.mlPerFeed } },
      plants: s.plants.map(p => p.id === plantId ? { ...p, quality: Math.min(100, p.quality + bonus), fertilizedToday: true } : p),
    }));
    _addNotification(`${plant.strainName} gedüngt! +${bonus.toFixed(1)}% Qualität`, 'success');
  },

  // ── mother plants & clones ──────────────────────────────
  toggleMother(plantId) {
    const { plants, _addNotification } = get();
    const p = plants.find(x => x.id === plantId);
    if (!p) return;
    if (p.phase !== 'vegetative') { _addNotification('Nur im Wachstum möglich.', 'warn'); return; }
    const next = !p.isMother;
    set(s => ({ plants: s.plants.map(x => x.id === plantId ? { ...x, isMother: next } : x) }));
    _addNotification(next ? `${p.strainName} ist jetzt Mutterpflanze` : `${p.strainName} ist keine Mutterpflanze mehr`, 'info');
  },
  takeClone(sourcePlantId, targetRoomId, targetPotIndex, subId) {
    const { plants, rooms, inventory, customStrains, _addNotification } = get();
    const src = plants.find(p => p.id === sourcePlantId);
    if (!src?.isMother || src.phase !== 'vegetative') { _addNotification('Quelle muss Mutterpflanze im Wachstum sein!', 'error'); return; }
    const room = rooms.find(r => r.id === targetRoomId);
    const pot  = room?.pots[targetPotIndex];
    if (!pot) { _addNotification('Ziel-Topf nicht gefunden!', 'error'); return; }
    if (plants.some(p => p.roomId === targetRoomId && p.potIndex === targetPotIndex && p.phase !== 'ready')) { _addNotification('Ziel-Topf belegt!', 'error'); return; }
    if ((inventory.substrate[subId] ?? 0) < pot.liters) { _addNotification('Nicht genug Substrat!', 'error'); return; }
    const strain = [...SEEDS, ...customStrains].find(s => s.id === src.strainId);
    if (!strain) return;
    const subItem = SUBSTRATES.find(s => s.id === subId);
    const hasCloner = inventory.tools.includes('tool_cloner');
    const clone = makePlant(strain, pot, subItem?.qualityBonus ?? 0, {
      roomId: targetRoomId, potIndex: targetPotIndex,
      phase: 'clone_rooting', isClone: true,
      quality: Math.min(100, 80 + (hasCloner ? 15 : 0)),
    });
    set(s => ({
      plants: [...s.plants, clone],
      inventory: { ...s.inventory, substrate: { ...s.inventory.substrate, [subId]: s.inventory.substrate[subId] - pot.liters } },
    }));
    _addNotification(`Steckling von ${src.strainName} genommen!`, 'success');
  },
  crossStrains(m1Id, m2Id) {
    const { plants, customStrains, _addNotification } = get();
    const m1 = plants.find(p => p.id === m1Id);
    const m2 = plants.find(p => p.id === m2Id);
    if (!m1?.isMother || !m2?.isMother) { _addNotification('Beide müssen Mutterpflanzen sein!', 'error'); return; }
    if (m1.strainId === m2.strainId) { _addNotification('Verschiedene Sorten benötigt!', 'warn'); return; }
    const all = [...SEEDS, ...customStrains];
    const s1 = all.find(s => s.id === m1.strainId);
    const s2 = all.find(s => s.id === m2.strainId);
    if (!s1 || !s2) return;
    const id = `hybrid_${++_hybridCounter}`;
    const hybrid = {
      id, isHybrid: true, parentIds: [s1.id, s2.id],
      name: `F1 ${s1.name.split(' ')[0]}×${s2.name.split(' ')[0]}`,
      price: Math.round((s1.price + s2.price) / 2) + 5,
      type: (s1.type === 'auto' || s2.type === 'auto') ? 'auto' : 'photo',
      germDays:    Math.round((s1.germDays    + s2.germDays)    / 2),
      seedlingDays:Math.round((s1.seedlingDays+ s2.seedlingDays)/ 2),
      vegDays:     Math.round((s1.vegDays     + s2.vegDays)     / 2),
      flowerDays:  Math.round((s1.flowerDays  + s2.flowerDays)  / 2),
      yieldMin:    Math.round((s1.yieldMin    + s2.yieldMin)    / 2),
      yieldMax:    Math.round((s1.yieldMax    + s2.yieldMax)    / 2 * 1.1), // slight hybrid vigour
      thc:         Math.round((s1.thc         + s2.thc)         / 2),
      desc: `F1 Hybride: ${s1.name} × ${s2.name}`,
      color: blendHex(s1.color, s2.color),
    };
    set(s => ({
      customStrains: [...s.customStrains, hybrid],
      inventory: { ...s.inventory, seeds: { ...s.inventory.seeds, [id]: 5 } },
    }));
    _addNotification(`Kreuzung erfolgreich! ${hybrid.name} – 5 Samen erhalten`, 'success');
  },

  // ── harvest / sell ──────────────────────────────────────
  harvestPlant(plantId) {
    const { plants, inventory, _addNotification } = get();
    const p = plants.find(x => x.id === plantId);
    if (!p || p.phase !== 'harvest_ready') return;
    const grams = calcYield(p, inventory.tools);
    set(s => ({ plants: s.plants.map(x => x.id === plantId ? { ...x, phase: 'drying', dryingDay: 0, curingDay: 0, harvestedGrams: grams } : x) }));
    _addNotification(`${p.strainName} geerntet! ${grams}g → Trocknung`, 'success');
  },
  sellHarvest(plantId) {
    const { plants, inventory, _addNotification, _addTransaction } = get();
    const p = plants.find(x => x.id === plantId);
    if (!p || p.phase !== 'ready') return;
    const hasJars = inventory.tools.includes('tool_jars');
    const q = Math.max(0, p.quality + (hasJars ? 0 : -15));
    const ppg = sellPrice(q);
    const rev = p.harvestedGrams * ppg;
    set(s => ({ money: s.money + rev, plants: s.plants.filter(x => x.id !== plantId) }));
    _addTransaction(`Verkauf: ${p.strainName} ${p.harvestedGrams}g @ ${ppg}€/g`, rev);
    _addNotification(`${p.strainName} verkauft! +${rev}€`, 'success');
  },

  // ── game loop ───────────────────────────────────────────
  startGame() {
    const { tickerId } = get();
    if (tickerId) clearInterval(tickerId);
    const id = setInterval(() => get()._tick(), GAME_DAY_MS);
    set({ started: true, lastTick: Date.now(), tickerId: id });
  },
  stopGame() { const { tickerId } = get(); if (tickerId) clearInterval(tickerId); set({ tickerId: null }); },
  endDay() {
    const { tickerId, gameOver } = get();
    if (gameOver) return;
    if (tickerId) clearInterval(tickerId);
    get()._tick();
    const id = setInterval(() => get()._tick(), GAME_DAY_MS);
    set({ tickerId: id, lastTick: Date.now() });
    get().saveGame();
  },

  _tick() {
    const state = get();
    const { day, money, plants, rooms, inventory, _addNotification, _addTransaction } = state;

    let totalElec = 0;
    const updatedRooms = rooms.map(room => {
      const rPlants = plants.filter(p => p.roomId === room.id && !['drying','curing','ready'].includes(p.phase));
      const climate = calcClimate(room, rPlants.length);
      totalElec += calcDailyElectricity(room);

      let next = { ...room, climate };

      // Smart controller: auto-adjust exhaustSpeed toward 24°C target
      if (room.controller?.autoClimate && room.exhaust) {
        const diff = climate.temperature - 24;
        if (Math.abs(diff) > 1) {
          const adj = Math.sign(diff) * Math.min(10, Math.abs(Math.round(diff * 2)));
          next = { ...next, exhaustSpeed: Math.max(10, Math.min(100, room.exhaustSpeed + adj)) };
        }
      }

      return next;
    });

    // Rooms with active auto-watering today
    const autoWateredRooms = new Set(
      updatedRooms.filter(r => r.drip && (day % r.drip.waterEvery === 0)).map(r => r.id)
    );

    const waterCost = plants.filter(p => !['drying','curing','ready'].includes(p.phase)).length * 0.5;
    const dailyCost = totalElec + waterCost;

    if (money - dailyCost <= -500) {
      clearInterval(state.tickerId);
      set({ gameOver: true });
      _addNotification('GAME OVER – Bankrott!', 'error');
      return;
    }

    const updatedPlants = plants.map(plant => {
      const room    = updatedRooms.find(r => r.id === plant.roomId);
      const climate = room?.climate ?? { temperature: 22, humidity: 55, lightHours: 18, effectivePPFD: 0 };
      const photoTrigger = room?.lamp && room.lampHours <= 12;
      let p = { ...plant };

      if (p.phase === 'drying') {
        p.dryingDay += 1;
      } else if (p.phase === 'curing') {
        p.curingDay += 1;
        p.quality = Math.min(100, p.quality + 0.5);
      } else if (!['ready'].includes(p.phase)) {
        // Water need tracking
        const isAutoWatered = autoWateredRooms.has(plant.roomId);
        const effectivelyWatered = p.wateredToday || isAutoWatered;
        if (effectivelyWatered) {
          p.daysUnwatered = 0;
        } else {
          p.daysUnwatered = (p.daysUnwatered ?? 0) + 1;
          const penalty = p.daysUnwatered >= 3 ? 8 : p.daysUnwatered >= 2 ? 5 : 3;
          p.health = Math.max(0, p.health - penalty);
          if (p.daysUnwatered === 2) _addNotification(`${p.strainName} dringend wässern! (${p.daysUnwatered} Tage trocken)`, 'warn');
          if (p.daysUnwatered === 4) _addNotification(`${p.strainName} verdorrt fast! Sofort gießen!`, 'error');
        }

        // Controller quality bonus
        if (room?.controller?.qualityBonus) {
          p.quality = Math.min(100, p.quality + room.controller.qualityBonus);
        }

        const d = calcQualityDelta(p, climate, inventory.tools);
        p.quality = Math.max(0, Math.min(100, p.quality + d));
        if (p.quality < 20) p.health = Math.max(0, p.health - 2);
        p.phaseDay  += 1;
        p.totalDays += 1;
        if (p.phase === 'vegetative' && p.type === 'photo' && !p.isMother && room?.lampHours <= 12) {
          p.phase = 'flowering'; p.phaseDay = 0;
          _addNotification(`${p.strainName} wechselt in Blüte!`, 'info');
        }
      }

      p = advancePlantPhase(p, photoTrigger);
      if (p.phase === 'harvest_ready' && plant.phase !== 'harvest_ready') _addNotification(`${p.strainName} ist erntereif!`, 'success');
      if (p.phase === 'curing'  && plant.phase === 'drying')  _addNotification(`${p.strainName} → Curing`, 'info');
      if (p.phase === 'ready'   && plant.phase === 'curing')  _addNotification(`${p.strainName} verkaufsbereit!`, 'success');

      p.wateredToday = false;
      p.fertilizedToday = false;
      return p;
    });

    set({
      day: day + 1,
      money: Math.round((money - dailyCost) * 100) / 100,
      plants: updatedPlants,
      rooms: updatedRooms,
      electricityAccrued: Math.round((state.electricityAccrued + totalElec) * 100) / 100,
      lastTick: Date.now(),
    });
    if ((day + 1) % 30 === 0) _addNotification(`Tag ${day + 1}: Monat abgeschlossen.`, 'info');
    // Auto-save every 5 days
    if ((day + 1) % 5 === 0) get().saveGame();
  },

  setUser(user) { set({ user }); },

  async saveGame() {
    const { user } = get();
    if (!user) return;
    set({ saveStatus: 'saving' });
    const { day, money, plants, rooms, inventory, customStrains,
            transactions, totalSpent, totalRevenue, electricityAccrued, started, gameOver } = get();
    const save_data = {
      day, money, plants, rooms, inventory, customStrains,
      transactions: transactions.slice(-50),
      totalSpent, totalRevenue, electricityAccrued, started, gameOver,
      savedAt: new Date().toISOString(),
    };
    const { error } = await supabase.from('game_saves').upsert(
      { user_id: user.id, save_data, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' },
    );
    set({ saveStatus: error ? 'error' : 'saved' });
    setTimeout(() => set({ saveStatus: 'idle' }), 3000);
  },

  async loadGame() {
    const { user } = get();
    if (!user) return false;
    const { data, error } = await supabase
      .from('game_saves')
      .select('save_data')
      .eq('user_id', user.id)
      .maybeSingle();
    if (error || !data) return false;
    const s = data.save_data;
    // Reset counters to avoid ID collisions
    _plantCounter = Math.max(...(s.plants ?? []).map(p => parseInt(p.id.split('_')[1]) || 0), 0);
    _roomCounter  = Math.max(...(s.rooms  ?? []).map(r => parseInt(r.id.split('_')[1]) || 0), 0);
    set({
      day: s.day ?? 1,
      money: s.money ?? 1000,
      plants: s.plants ?? [],
      rooms: s.rooms ?? [],
      activeRoomId: s.rooms?.[0]?.id ?? null,
      inventory: s.inventory ?? { seeds: {}, substrate: {}, nutrients: {}, tools: [] },
      customStrains: s.customStrains ?? [],
      transactions: s.transactions ?? [],
      totalSpent: s.totalSpent ?? 0,
      totalRevenue: s.totalRevenue ?? 0,
      electricityAccrued: s.electricityAccrued ?? 0,
      started: s.started ?? false,
      gameOver: s.gameOver ?? false,
    });
    return true;
  },

  resetGame() {
    const { tickerId } = get();
    if (tickerId) clearInterval(tickerId);
    _plantCounter = 0; _hybridCounter = 0; _roomCounter = 0;
    const r = makeRoom();
    set({
      started: false, gameOver: false, day: 1, money: 1000, tickerId: null, lastTick: null,
      rooms: [r], activeRoomId: r.id,
      inventory: { seeds: {}, substrate: {}, nutrients: {}, tools: [] },
      customStrains: [], plants: [],
      transactions: [], totalSpent: 0, totalRevenue: 0, electricityAccrued: 0, notifications: [],
    });
  },
}));
