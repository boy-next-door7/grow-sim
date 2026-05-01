import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { SUBSTRATES, POTS } from '../data/equipment';
import { PHASES, PHASE_NPK, getClimateScore } from '../data/phases';
import PixelView from './PixelView';
import PlantDetail from './PlantDetail';

// ── Planting overlay ─────────────────────────────────────
function PlantingPanel({ roomId, potIndex, onClose }) {
  const inventory    = useGameStore(s => s.inventory);
  const rooms        = useGameStore(s => s.rooms);
  const getAllStrains = useGameStore(s => s.getAllStrains);
  const plantSeed    = useGameStore(s => s.plantSeed);

  const room = rooms.find(r => r.id === roomId);
  const pot  = room?.pots[potIndex];

  const allStrains     = getAllStrains();
  const availableSeeds = allStrains.filter(s => (inventory.seeds[s.id] ?? 0) > 0);
  const availableSubs  = SUBSTRATES.filter(s => (inventory.substrate[s.id] ?? 0) >= (pot?.liters ?? 0));

  const [strainId, setStrainId] = useState(availableSeeds[0]?.id ?? null);
  const [subId,    setSubId]    = useState(availableSubs[0]?.id  ?? null);
  const canPlant = strainId && subId;

  function doPlant() {
    if (!canPlant) return;
    plantSeed(strainId, potIndex, roomId, subId);
    onClose();
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
        <div className="text-sm font-bold text-green-400">🌱 Samen einpflanzen</div>
        <button onClick={onClose} className="text-gray-600 hover:text-gray-300 text-lg px-1">✕</button>
      </div>
      <div className="px-4 py-3 space-y-3">
        <div className="text-xs text-gray-500">{pot ? `${pot.name} — ${pot.liters}L` : `Topf ${potIndex + 1}`}</div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1.5">Sorte</div>
          {availableSeeds.length === 0 ? (
            <div className="text-xs text-red-400 bg-red-900/20 border border-red-800/40 rounded p-2">Keine Samen im Inventar.</div>
          ) : (
            <div className="space-y-1 max-h-44 overflow-y-auto">
              {availableSeeds.map(s => (
                <button key={s.id} onClick={() => setStrainId(s.id)}
                  className={`w-full text-left px-3 py-2 rounded border text-xs transition-colors ${strainId === s.id ? 'border-green-600 bg-green-900/30' : 'border-gray-800 hover:border-gray-600 bg-gray-800/50'}`}>
                  <div className="flex justify-between">
                    <span style={{ color: s.color }} className="font-bold">{s.name}</span>
                    <span className="text-gray-500">{inventory.seeds[s.id]}×</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1.5">Substrat</div>
          {availableSubs.length === 0 ? (
            <div className="text-xs text-red-400 bg-red-900/20 border border-red-800/40 rounded p-2">Kein Substrat (benötigt {pot?.liters ?? '?'}L).</div>
          ) : (
            <div className="space-y-1">
              {availableSubs.map(s => (
                <button key={s.id} onClick={() => setSubId(s.id)}
                  className={`w-full text-left px-3 py-2 rounded border text-xs transition-colors ${subId === s.id ? 'border-amber-700 bg-amber-900/20' : 'border-gray-800 hover:border-gray-600 bg-gray-800/50'}`}>
                  <div className="flex justify-between">
                    <span className="text-amber-300">{s.name}</span>
                    <span className="text-gray-500">{(inventory.substrate[s.id] ?? 0)}L</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 text-xs py-2 rounded border border-gray-700 text-gray-400 hover:text-gray-200">Abbrechen</button>
          <button onClick={doPlant} disabled={!canPlant}
            className={`flex-1 text-xs py-2 rounded font-bold transition-colors ${canPlant ? 'bg-green-800 hover:bg-green-700 text-white' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}>
            Einpflanzen
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Pot assignment panel ─────────────────────────────────
function PotAssignPanel({ roomId, onClose }) {
  const inventory      = useGameStore(s => s.inventory);
  const assignPotToRoom = useGameStore(s => s.assignPotToRoom);

  const ownedPots = POTS.filter(p => (inventory.pots?.[p.id] ?? 0) > 0);

  if (ownedPots.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-sm font-bold text-orange-400">🪴 Topf zuweisen</div>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-300">✕</button>
        </div>
        <div className="text-xs text-gray-500">Keine Töpfe im Inventar. Kaufe Töpfe im Shop.</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
        <div className="text-sm font-bold text-orange-400">🪴 Topf zuweisen</div>
        <button onClick={onClose} className="text-gray-600 hover:text-gray-300 text-lg px-1">✕</button>
      </div>
      <div className="px-4 py-3 space-y-2">
        {ownedPots.map(p => (
          <button key={p.id}
            onClick={() => { assignPotToRoom(p.id, roomId); onClose(); }}
            className="w-full text-left px-3 py-2 rounded border border-orange-800/50 bg-orange-950/20 hover:bg-orange-900/30 text-xs transition-colors">
            <div className="flex justify-between">
              <span className="text-orange-300 font-bold">{p.name}</span>
              <span className="text-gray-500">{inventory.pots[p.id]}× im Inventar</span>
            </div>
            <div className="text-gray-500">{p.liters}L · ×{p.yieldFactor} Ertrag</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Climate Gauge ────────────────────────────────────────
function Gauge({ value, min, max, optMin, optMax, label, unit, color }) {
  const range = max - min;
  const pct       = Math.max(0, Math.min(100, ((value - min) / range) * 100));
  const optMinPct = ((optMin - min) / range) * 100;
  const optMaxPct = ((optMax - min) / range) * 100;
  const inRange   = value >= optMin && value <= optMax;
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between text-xs">
        <span className="text-gray-500">{label}</span>
        <span className={inRange ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>{value.toFixed(1)}{unit}</span>
      </div>
      <div className="relative h-2.5 bg-gray-800 rounded-full overflow-hidden">
        <div className="absolute top-0 h-full bg-green-900/60" style={{ left:`${optMinPct}%`, width:`${optMaxPct-optMinPct}%` }} />
        <div className="absolute top-0 h-full w-2 rounded-full -ml-1 transition-all duration-500" style={{ left:`${pct}%`, background: inRange ? color : '#ef4444' }} />
      </div>
    </div>
  );
}

function NPKBar({ label, value, max = 10, color }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-gray-500 w-3">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-800 rounded">
        <div className="h-full rounded" style={{ width:`${Math.min(100,(value/max)*100)}%`, background:color }} />
      </div>
      <span className="text-xs text-gray-500 w-3 text-right">{value}</span>
    </div>
  );
}

// ── Expanded room climate + controls ─────────────────────
function RoomControls({ room, plants }) {
  const setRoomLampHours     = useGameStore(s => s.setRoomLampHours);
  const setRoomLampIntensity = useGameStore(s => s.setRoomLampIntensity);
  const setRoomExhaustSpeed  = useGameStore(s => s.setRoomExhaustSpeed);
  const setHumidifierSpeed   = useGameStore(s => s.setHumidifierSpeed);
  const [open, setOpen]      = useState(false);

  if (!room) return null;

  const { lamp, exhaust, humidifier, lampHours, lampIntensity, exhaustSpeed, humidifierSpeed, climate, controller, drip } = room;
  const isAuto     = controller?.autoClimate;
  const tempOk     = climate.temperature >= 18 && climate.temperature <= 28;
  const humOk      = climate.humidity    >= 35 && climate.humidity    <= 70;
  const roomPlants  = plants.filter(p => p.roomId === room.id && !['drying','curing','ready'].includes(p.phase));
  const uniquePhases = [...new Set(roomPlants.map(p => p.phase))];

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-gray-800/40 transition-colors">
        <div className="text-xs text-gray-500 uppercase tracking-wide">
          Klima &amp; Steuerung — <span className="text-gray-400">{room.tent?.name ?? 'Kein Zelt'}</span>
          {room.tent?.desc && <span className="text-gray-600 ml-1.5">({room.tent.desc})</span>}
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className={tempOk ? 'text-orange-400' : 'text-red-400'}>{climate.temperature.toFixed(1)}°C</span>
          <span className={humOk  ? 'text-blue-400'   : 'text-yellow-400'}>{climate.humidity.toFixed(1)}%</span>
          <span className="text-yellow-400">{climate.lightHours}h</span>
          {drip       && <span className="text-blue-300  bg-blue-900/30  border border-blue-800/50  px-1.5 rounded">💧</span>}
          {controller && <span className="text-green-300 bg-green-900/30 border border-green-800/50 px-1.5 rounded">🤖</span>}
          {humidifier && <span className="text-cyan-300  bg-cyan-900/30  border border-cyan-800/50  px-1.5 rounded">💦</span>}
          <span className="text-gray-600 ml-1">{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-800 px-4 pb-5 pt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Col 1: Gauges */}
          <div className="space-y-4">
            <div className="text-xs text-gray-500 uppercase tracking-wide">Klima-Werte</div>
            <Gauge value={climate.temperature} min={10} max={45} optMin={18} optMax={28} label="Temperatur"       unit="°C" color="#f97316" />
            <Gauge value={climate.humidity}    min={10} max={95} optMin={40} optMax={70} label="Luftfeuchtigkeit" unit="%" color="#60a5fa" />
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Licht</span>
              <span className="text-yellow-400">{climate.lightHours}h/Tag</span>
            </div>
            {lamp && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">PPFD (effektiv)</span>
                <span className="text-yellow-300">{(climate.effectivePPFD ?? 0).toFixed(2)}×</span>
              </div>
            )}
          </div>

          {/* Col 2: Controls */}
          <div className="space-y-4">
            <div className="text-xs text-gray-500 uppercase tracking-wide">Steuerung</div>
            {/* Lamp */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">💡 {lamp?.name ?? 'Keine Lampe'}</span>
                <span className={lampHours <= 12 ? 'text-pink-400' : 'text-yellow-400'}>
                  {lampHours}h{lampHours === 0 ? ' (aus)' : lampHours <= 12 ? ' Blüte' : ' Veg'}
                </span>
              </div>
              <input type="range" min="0" max="24" step="1" value={lampHours}
                onChange={e => setRoomLampHours(room.id, e.target.value)}
                disabled={!lamp || isAuto} className="w-full accent-yellow-500" />
              {lamp?.dimmable && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-500 shrink-0">Intensität {lampIntensity}%</span>
                  <input type="range" min="10" max="100" step="5" value={lampIntensity}
                    onChange={e => setRoomLampIntensity(room.id, e.target.value)}
                    className="flex-1 accent-green-500" />
                </div>
              )}
            </div>
            {/* Exhaust */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">🌀 {exhaust?.name ?? 'Kein Abluftlüfter'}</span>
                <span className="text-blue-400">{exhaustSpeed}%</span>
              </div>
              <input type="range" min="0" max="100" step="5" value={exhaustSpeed}
                onChange={e => setRoomExhaustSpeed(room.id, e.target.value)}
                disabled={!exhaust || isAuto} className="w-full accent-blue-500" />
            </div>
            {/* Humidifier */}
            {humidifier && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">💦 {humidifier.name}</span>
                  <span className="text-cyan-400">{humidifierSpeed}%</span>
                </div>
                <input type="range" min="0" max="100" step="5" value={humidifierSpeed}
                  onChange={e => setHumidifierSpeed(room.id, e.target.value)}
                  className="w-full accent-cyan-500" />
                <div className="text-xs text-gray-600">+{(humidifier.humidify * humidifierSpeed / 100).toFixed(1)}% LF</div>
              </div>
            )}
            {/* Automation */}
            <div className="space-y-1.5 text-xs">
              {drip ? (
                <div className="flex items-center gap-1.5 bg-blue-900/20 border border-blue-800/40 rounded px-2 py-1">
                  💧 <span className="text-blue-300">{drip.name} — alle {drip.waterEvery}d</span>
                </div>
              ) : (
                <div className="bg-gray-800/60 border border-gray-700 rounded px-2 py-1 text-gray-500">
                  💧 Manuell gießen täglich!
                </div>
              )}
              {controller ? (
                <div className="flex items-center gap-1.5 bg-green-900/20 border border-green-800/40 rounded px-2 py-1">
                  🤖 <span className="text-green-300">{controller.name}{isAuto ? ' — Auto-Abluft' : ''}</span>
                </div>
              ) : (
                <div className="bg-gray-800/60 border border-gray-700 rounded px-2 py-1 text-gray-500">
                  🤖 Kein Controller
                </div>
              )}
            </div>
          </div>

          {/* Col 3: Phase NPK */}
          {uniquePhases.length > 0 && (
            <div className="space-y-3">
              <div className="text-xs text-gray-500 uppercase tracking-wide">NPK-Bedarf aktiver Phasen</div>
              {uniquePhases.map(phaseId => {
                const phase = PHASES[phaseId];
                const npk   = PHASE_NPK[phaseId];
                const score = getClimateScore(climate, phaseId);
                if (!phase) return null;
                return (
                  <div key={phaseId} className="bg-gray-800/50 rounded p-2 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{phase.icon}</span>
                        <span className="text-xs font-bold" style={{ color: phase.color }}>{phase.label}</span>
                      </div>
                      <div className="text-xs font-bold px-1.5 py-0.5 rounded"
                        style={{
                          background: score > 80 ? '#14532d' : score > 50 ? '#713f12' : '#450a0a',
                          color:      score > 80 ? '#86efac' : score > 50 ? '#fde68a' : '#fca5a5',
                        }}>
                        {score.toFixed(0)}%
                      </div>
                    </div>
                    {npk && (
                      <div className="space-y-1">
                        <NPKBar label="N" value={npk.n} max={10} color="#22c55e" />
                        <NPKBar label="P" value={npk.p} max={10} color="#f97316" />
                        <NPKBar label="K" value={npk.k} max={10} color="#a78bfa" />
                        <div className="text-xs text-gray-600 italic mt-0.5">{npk.tip}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Pot management strip ─────────────────────────────────
function PotStrip({ room, plants }) {
  const unassignPot        = useGameStore(s => s.unassignPot);
  const sellPotFromInventory = useGameStore(s => s.sellPotFromInventory);
  const inventory          = useGameStore(s => s.inventory);
  const [assignOpen, setAssignOpen] = useState(false);

  if (!room?.tent) return null;

  const totalPots = room.pots.length;
  const max       = room.tent.maxPlants;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500 uppercase tracking-wide">
          Töpfe — <span className="text-gray-400">{totalPots}/{max}</span>
        </div>
        {totalPots < max && (
          <button onClick={() => setAssignOpen(o => !o)}
            className="text-xs px-2 py-1 rounded border border-orange-700/60 bg-orange-950/30 text-orange-400 hover:brightness-125 transition-colors">
            + Topf zuweisen
          </button>
        )}
      </div>

      {assignOpen && (
        <div className="space-y-1">
          {POTS.filter(p => (inventory.pots?.[p.id] ?? 0) > 0).length === 0 ? (
            <div className="text-xs text-gray-500">Keine Töpfe im Inventar — kaufe Töpfe im Shop.</div>
          ) : (
            POTS.filter(p => (inventory.pots?.[p.id] ?? 0) > 0).map(p => {
              const count = inventory.pots?.[p.id] ?? 0;
              return (
                <div key={p.id} className="flex items-center justify-between bg-orange-950/20 rounded px-2 py-1 border border-orange-800/30">
                  <span className="text-xs text-orange-300">{p.name} · {p.liters}L</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{count}× Lager</span>
                    <button onClick={() => {
                      const { assignPotToRoom } = useGameStore.getState();
                      assignPotToRoom(p.id, room.id);
                      if ((inventory.pots?.[p.id] ?? 0) - 1 === 0) setAssignOpen(false);
                    }}
                      className="text-xs px-2 py-0.5 rounded bg-orange-800 hover:bg-orange-700 text-white">
                      Zuweisen
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {totalPots > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {room.pots.map((pot, i) => {
            const occupied = plants.some(p => p.roomId === room.id && p.potIndex === i && p.phase !== 'ready');
            return (
              <div key={i} className={`flex items-center gap-1.5 px-2 py-1 rounded border text-xs ${
                occupied ? 'border-green-800/50 bg-green-950/20' : 'border-orange-800/40 bg-orange-950/10'
              }`}>
                <span className="text-orange-400">🪴</span>
                <span className={occupied ? 'text-green-300' : 'text-gray-400'}>{pot.name}</span>
                {!occupied && (
                  <div className="flex items-center gap-1 ml-1">
                    <button onClick={() => unassignPot(room.id, i)}
                      className="text-gray-600 hover:text-gray-400 text-[10px]" title="Aus Zelt entfernen">↩</button>
                    <button onClick={() => sellPotFromInventory(pot.id)}
                      className="text-red-700 hover:text-red-500 text-[10px]" title={`Verkaufen (${Math.floor(pot.price/2)}€)`}>✕</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Ready-to-sell banner ─────────────────────────────────
function ReadyBanner({ plants, onSelect }) {
  const ready = plants.filter(p => p.phase === 'ready');
  if (ready.length === 0) return null;
  return (
    <div className="bg-cyan-900/20 border border-cyan-700/40 rounded-lg p-3 flex items-center justify-between flex-wrap gap-2">
      <div className="text-xs text-cyan-300 font-bold">{ready.length}× Ernte verkaufsbereit!</div>
      <div className="flex gap-2 flex-wrap">
        {ready.map(p => (
          <button key={p.id} onClick={() => onSelect(p.id)}
            className="text-xs bg-cyan-800/50 hover:bg-cyan-700/50 border border-cyan-700 text-cyan-300 px-3 py-1 rounded font-bold">
            {p.strainName} ({p.harvestedGrams}g)
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main GrowRoom ────────────────────────────────────────
export default function GrowRoom() {
  const rooms          = useGameStore(s => s.rooms);
  const activeRoomId   = useGameStore(s => s.activeRoomId);
  const plants         = useGameStore(s => s.plants);
  const setActiveRoom  = useGameStore(s => s.setActiveRoom);
  const addRoom        = useGameStore(s => s.addRoom);
  const removeRoom     = useGameStore(s => s.removeRoom);
  const waterRoom      = useGameStore(s => s.waterRoom);

  const [selectedPlantId, setSelectedPlantId] = useState(null);
  const [plantingPot,     setPlantingPot]      = useState(null);
  const [assigningRoom,   setAssigningRoom]     = useState(null);

  const activeRoom = rooms.find(r => r.id === activeRoomId);

  function handlePlantClick(plantId) {
    setPlantingPot(null);
    setAssigningRoom(null);
    setSelectedPlantId(plantId === selectedPlantId ? null : plantId);
  }

  function handleEmptyPotClick(roomId, potIndex) {
    setActiveRoom(roomId);
    setSelectedPlantId(null);
    setAssigningRoom(null);
    setPlantingPot(
      plantingPot?.roomId === roomId && plantingPot?.potIndex === potIndex
        ? null
        : { roomId, potIndex }
    );
  }

  function closePanel() {
    setSelectedPlantId(null);
    setPlantingPot(null);
    setAssigningRoom(null);
  }

  const panelOpen = !!(selectedPlantId || plantingPot || assigningRoom);

  // Equipment badges for tent header
  function EquipBadges({ room }) {
    const badges = [
      room.lamp       && { icon: '💡', label: room.lamp.name },
      room.exhaust    && { icon: '🌀', label: room.exhaust.name },
      room.fan        && { icon: '💨', label: room.fan.name },
      room.filter     && { icon: '🫧', label: room.filter.name },
      room.drip       && { icon: '💧', label: room.drip.name },
      room.controller && { icon: '🤖', label: room.controller.name },
      room.humidifier && { icon: '💦', label: room.humidifier.name },
    ].filter(Boolean);
    if (badges.length === 0) return null;
    return (
      <div className="flex gap-1 flex-wrap">
        {badges.map((b, i) => (
          <span key={i} title={b.label}
            className="text-[10px] px-1 py-0.5 rounded bg-gray-800/80 border border-gray-700/50 text-gray-400">
            {b.icon}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">

      <ReadyBanner plants={plants} onSelect={handlePlantClick} />

      <div className="flex gap-4 items-start">

        {/* All tents */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-5 items-start">
            {rooms.map(room => {
              const isActive    = room.id === activeRoomId;
              const roomPlants  = plants.filter(p => p.roomId === room.id);
              const activeCount = roomPlants.filter(p => !['ready'].includes(p.phase)).length;
              const waterableCount = roomPlants.filter(p =>
                !p.wateredToday && !['drying','curing','ready','harvest_ready','clone_rooting'].includes(p.phase)
              ).length;

              return (
                <div key={room.id}
                  onClick={() => setActiveRoom(room.id)}
                  className={`cursor-pointer transition-all rounded-lg overflow-hidden ${
                    isActive
                      ? 'ring-2 ring-green-500/70 shadow-lg shadow-green-900/30'
                      : 'ring-1 ring-gray-800 hover:ring-gray-600'
                  }`}
                >
                  {/* Tent header */}
                  <div className={`px-3 py-2 space-y-1 ${isActive ? 'bg-green-900/30' : 'bg-gray-900'}`}>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span>{room.tent ? '🏕️' : '🔲'}</span>
                        <div>
                          <span className={isActive ? 'text-green-400 font-bold' : 'text-gray-400'}>
                            {room.tent?.name ?? 'Leeres Zelt'}
                          </span>
                          {room.tent?.desc && (
                            <span className="text-gray-600 ml-1.5 text-[10px]">{room.tent.desc}</span>
                          )}
                        </div>
                        <span className="text-gray-600">{activeCount}/{room.tent?.maxPlants ?? 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {waterableCount > 0 && (
                          <button
                            onClick={e => { e.stopPropagation(); waterRoom(room.id); }}
                            className="text-xs bg-blue-900/40 hover:bg-blue-800/60 border border-blue-700/50 text-blue-300 px-2 py-0.5 rounded transition-colors"
                          >
                            💧 Alle
                          </button>
                        )}
                        {rooms.length > 1 && (
                          <button
                            onClick={e => { e.stopPropagation(); removeRoom(room.id); }}
                            className="text-gray-700 hover:text-red-500 ml-2 transition-colors"
                          >✕</button>
                        )}
                      </div>
                    </div>
                    {isActive && <EquipBadges room={room} />}
                  </div>

                  {/* Pixel grid */}
                  <div className="overflow-x-auto">
                    <PixelView
                      room={room}
                      plants={roomPlants}
                      onPlantClick={handlePlantClick}
                      onEmptyPotClick={handleEmptyPotClick}
                      isActive={isActive}
                    />
                  </div>

                  {!room.tent && (
                    <div className="px-3 py-3 text-center text-gray-600 text-xs bg-gray-900">
                      Kein Zelt — Shop
                    </div>
                  )}
                  {room.tent && room.pots.length === 0 && (
                    <div className="px-3 py-2 text-center text-gray-600 text-xs bg-gray-900">
                      Keine Töpfe — zuweisen ↓
                    </div>
                  )}
                </div>
              );
            })}

            {/* Add room button (max 3) */}
            {rooms.length < 3 && (
              <button
                onClick={addRoom}
                className="flex flex-col items-center justify-center gap-2 w-28 h-28 rounded-lg border-2 border-dashed border-gray-700 text-gray-600 hover:text-green-500 hover:border-green-700 transition-colors"
              >
                <span className="text-2xl">+</span>
                <span className="text-xs">Neues Zelt</span>
              </button>
            )}
          </div>
        </div>

        {/* Side panel */}
        {panelOpen && (
          <div className="w-72 shrink-0">
            {selectedPlantId && <PlantDetail plantId={selectedPlantId} onClose={closePanel} />}
            {plantingPot && !selectedPlantId && (
              <PlantingPanel roomId={plantingPot.roomId} potIndex={plantingPot.potIndex} onClose={closePanel} />
            )}
            {assigningRoom && !selectedPlantId && !plantingPot && (
              <PotAssignPanel roomId={assigningRoom} onClose={closePanel} />
            )}
          </div>
        )}
      </div>

      {/* Pot strip for active room */}
      {activeRoom && <PotStrip room={activeRoom} plants={plants} />}

      {/* Climate & controls for active room */}
      {activeRoom && <RoomControls room={activeRoom} plants={plants} />}
    </div>
  );
}
