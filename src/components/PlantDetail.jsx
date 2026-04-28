import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { PHASES, PHASE_NPK } from '../data/phases';
import { NUTRIENTS, SUBSTRATES } from '../data/equipment';

const SELL_PRICE = q => q >= 90 ? 12 : q >= 75 ? 10 : q >= 55 ? 8 : 5;

function Bar({ value, max = 100, color, height = 'h-2' }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={`${height} bg-gray-800 rounded-full overflow-hidden`}>
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

function Stat({ label, value, color = 'text-gray-300' }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-gray-500">{label}</span>
      <span className={`font-bold ${color}`}>{value}</span>
    </div>
  );
}

// ── NPK Panel ────────────────────────────────────────────
function NPKPanel({ plant, inventory }) {
  const [selectedNut, setSelectedNut] = useState(null);
  const fertilizePlant = useGameStore(s => s.fertilizePlant);
  const npkReq = PHASE_NPK[plant.phase];

  if (!npkReq || npkReq.type === 'none') {
    return (
      <div className="text-xs text-gray-500 bg-gray-800/50 rounded p-2">
        {npkReq?.type === 'none' ? '🚿 Spülphase — nur Wasser' : 'Kein Dünger in dieser Phase'}
      </div>
    );
  }

  const availableNuts = NUTRIENTS.filter(n => (inventory.nutrients[n.id] ?? 0) >= n.mlPerFeed);
  const isPreferred = (type) => type === npkReq.type || (type === 'complete');

  const handleFeed = () => {
    if (!selectedNut) return;
    fertilizePlant(plant.id, selectedNut);
    setSelectedNut(null);
  };

  return (
    <div className="space-y-2">
      {/* NPK requirements */}
      <div className="bg-gray-800/60 rounded p-2 space-y-1">
        <div className="text-xs text-green-400 font-bold">{npkReq.label}</div>
        <div className="flex gap-2">
          {['n','p','k'].map((el, i) => (
            <div key={el} className="flex-1 text-center">
              <div className="text-xs font-bold" style={{ color: ['#4ade80','#fb923c','#60a5fa'][i] }}>
                {el.toUpperCase()}: {npkReq[el]}
              </div>
              <Bar value={npkReq[el]} max={10} color={['#22c55e','#f97316','#3b82f6'][i]} height="h-1.5" />
            </div>
          ))}
        </div>
        <div className="text-xs text-gray-500">{npkReq.tip}</div>
      </div>

      {/* Nutrient selector */}
      {plant.fertilizedToday ? (
        <div className="text-xs text-center text-gray-600 py-1">✓ Heute bereits gedüngt</div>
      ) : availableNuts.length === 0 ? (
        <div className="text-xs text-red-400 text-center py-1">Kein Dünger im Inventar</div>
      ) : (
        <div className="space-y-1">
          {NUTRIENTS.map(n => {
            const avail = inventory.nutrients[n.id] ?? 0;
            const canUse = avail >= n.mlPerFeed;
            const preferred = isPreferred(n.type);
            return (
              <button
                key={n.id}
                onClick={() => canUse && setSelectedNut(selectedNut === n.id ? null : n.id)}
                disabled={!canUse}
                className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors border ${
                  selectedNut === n.id
                    ? 'border-green-500 bg-green-900/30'
                    : canUse
                      ? preferred
                        ? 'border-green-800/60 bg-gray-800/60 hover:bg-gray-700/60'
                        : 'border-gray-700 bg-gray-800/40 hover:bg-gray-700/40'
                      : 'border-gray-800 bg-gray-900/30 opacity-40 cursor-not-allowed'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className={preferred ? 'text-green-300' : 'text-gray-400'}>{n.name}</span>
                  {preferred && <span className="text-green-500 text-xs">★ empfohlen</span>}
                </div>
                <div className="flex gap-2 mt-0.5 text-gray-500">
                  <span>N:{n.npk.n} P:{n.npk.p} K:{n.npk.k}</span>
                  <span className={avail >= n.mlPerFeed ? 'text-gray-400' : 'text-red-500'}>
                    {avail}ml / {n.mlPerFeed}ml
                  </span>
                </div>
              </button>
            );
          })}
          {selectedNut && (
            <button
              onClick={handleFeed}
              className="w-full bg-green-800 hover:bg-green-700 text-white text-xs py-1.5 rounded font-bold transition-colors"
            >
              🧪 Jetzt düngen
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Clone Target Selector ────────────────────────────────
function ClonePanel({ plant, onClose }) {
  const rooms = useGameStore(s => s.rooms);
  const plants = useGameStore(s => s.plants);
  const inventory = useGameStore(s => s.inventory);
  const takeClone = useGameStore(s => s.takeClone);

  const [targetRoomId, setTargetRoomId] = useState(rooms[0]?.id);
  const [targetPotIndex, setTargetPotIndex] = useState(null);
  const [subId, setSubId] = useState(null);

  const targetRoom = rooms.find(r => r.id === targetRoomId);
  const freePots = (targetRoom?.pots ?? []).map((pot, i) => {
    const occ = plants.some(p => p.roomId === targetRoomId && p.potIndex === i && p.phase !== 'ready');
    return { pot, i, occ };
  }).filter(x => !x.occ);

  const availSub = SUBSTRATES.filter(s => {
    const pot = targetRoom?.pots[targetPotIndex];
    return pot && (inventory.substrate[s.id] ?? 0) >= pot.liters;
  });

  const canClone = targetRoomId && targetPotIndex !== null && subId && availSub.some(s => s.id === subId);

  return (
    <div className="space-y-2 bg-gray-800/50 rounded p-3">
      <div className="text-xs font-bold text-green-400">Steckling nehmen</div>

      <div>
        <div className="text-xs text-gray-500 mb-1">Ziel-Zimmer</div>
        <select value={targetRoomId} onChange={e => { setTargetRoomId(e.target.value); setTargetPotIndex(null); }}
          className="w-full bg-gray-800 text-xs text-gray-200 rounded px-2 py-1 border border-gray-700">
          {rooms.map(r => <option key={r.id} value={r.id}>{r.tent?.name ?? r.id}</option>)}
        </select>
      </div>

      {freePots.length > 0 && (
        <div>
          <div className="text-xs text-gray-500 mb-1">Ziel-Topf</div>
          <div className="flex flex-wrap gap-1">
            {freePots.map(({ pot, i }) => (
              <button key={i} onClick={() => setTargetPotIndex(i)}
                className={`text-xs px-2 py-1 rounded border transition-colors ${
                  targetPotIndex === i ? 'border-green-500 bg-green-900/30 text-green-400' : 'border-gray-700 text-gray-400 hover:bg-gray-700/40'
                }`}>
                {pot.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {targetPotIndex !== null && (
        <div>
          <div className="text-xs text-gray-500 mb-1">Substrat</div>
          {availSub.length === 0 ? (
            <div className="text-xs text-red-400">Kein passendes Substrat im Inventar</div>
          ) : (
            <div className="flex flex-wrap gap-1">
              {availSub.map(s => (
                <button key={s.id} onClick={() => setSubId(s.id)}
                  className={`text-xs px-2 py-1 rounded border transition-colors ${
                    subId === s.id ? 'border-green-500 bg-green-900/30 text-green-400' : 'border-gray-700 text-gray-400 hover:bg-gray-700/40'
                  }`}>
                  {s.name} ({inventory.substrate[s.id]}L)
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={onClose} className="flex-1 text-xs py-1.5 rounded border border-gray-700 text-gray-400 hover:text-gray-200">
          Abbrechen
        </button>
        <button
          onClick={() => { if (canClone) { takeClone(plant.id, targetRoomId, targetPotIndex, subId); onClose(); } }}
          disabled={!canClone}
          className={`flex-1 text-xs py-1.5 rounded font-bold transition-colors ${
            canClone ? 'bg-green-800 hover:bg-green-700 text-white' : 'bg-gray-800 text-gray-600 cursor-not-allowed'
          }`}>
          ✂️ Steckling nehmen
        </button>
      </div>
    </div>
  );
}

// ── Cross Strains Panel ──────────────────────────────────
function CrossPanel({ plant, onClose }) {
  const plants = useGameStore(s => s.plants);
  const crossStrains = useGameStore(s => s.crossStrains);
  const [partnerId, setPartnerId] = useState(null);

  const otherMothers = plants.filter(p => p.isMother && p.phase === 'vegetative' && p.id !== plant.id && p.strainId !== plant.strainId);

  return (
    <div className="space-y-2 bg-gray-800/50 rounded p-3">
      <div className="text-xs font-bold text-purple-400">Sorten kreuzen</div>
      {otherMothers.length === 0 ? (
        <div className="text-xs text-gray-500">Keine anderen Mutterpflanzen verfügbar</div>
      ) : (
        <>
          <div className="space-y-1">
            {otherMothers.map(m => (
              <button key={m.id} onClick={() => setPartnerId(m.id === partnerId ? null : m.id)}
                className={`w-full text-left px-2 py-1.5 rounded text-xs border transition-colors ${
                  partnerId === m.id ? 'border-purple-500 bg-purple-900/20 text-purple-300' : 'border-gray-700 text-gray-400 hover:bg-gray-700/40'
                }`}>
                <span style={{ color: m.strainColor }}>{m.strainName}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 text-xs py-1.5 rounded border border-gray-700 text-gray-400">Abbrechen</button>
            <button
              onClick={() => { if (partnerId) { crossStrains(plant.id, partnerId); onClose(); } }}
              disabled={!partnerId}
              className={`flex-1 text-xs py-1.5 rounded font-bold ${partnerId ? 'bg-purple-800 hover:bg-purple-700 text-white' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}>
              🧬 Kreuzen
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Main PlantDetail component ────────────────────────────
export default function PlantDetail({ plantId, onClose }) {
  const plant = useGameStore(s => s.plants.find(p => p.id === plantId));
  const inventory = useGameStore(s => s.inventory);
  const rooms = useGameStore(s => s.rooms);
  const waterPlant   = useGameStore(s => s.waterPlant);
  const harvestPlant = useGameStore(s => s.harvestPlant);
  const sellHarvest  = useGameStore(s => s.sellHarvest);
  const removePlant  = useGameStore(s => s.removePlant);
  const toggleMother = useGameStore(s => s.toggleMother);

  const [showClone, setShowClone] = useState(false);
  const [showCross, setShowCross] = useState(false);

  if (!plant) { onClose?.(); return null; }

  const phase       = PHASES[plant.phase];
  const isActive    = !['drying','curing','ready','harvest_ready'].includes(plant.phase);
  const isPostHarv  = ['drying','curing','ready'].includes(plant.phase);
  const isReady     = plant.phase === 'ready';
  const isHarvReady = plant.phase === 'harvest_ready';
  const room        = rooms.find(r => r.id === plant.roomId);

  const pricePerG   = SELL_PRICE(plant.quality);
  const estRevenue  = plant.harvestedGrams * pricePerG;

  const qColor = plant.quality > 70 ? '#22c55e' : plant.quality > 40 ? '#eab308' : '#ef4444';
  const hColor = plant.health  > 60 ? '#22c55e' : plant.health  > 30 ? '#eab308' : '#ef4444';

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: `2px solid ${plant.strainColor}40` }}>
        <div className="flex items-center gap-2">
          <span className="text-lg">{phase?.icon}</span>
          <div>
            <div className="text-sm font-bold" style={{ color: plant.strainColor }}>{plant.strainName}</div>
            <div className="text-xs flex gap-2">
              <span style={{ color: phase?.color }}>{phase?.label}</span>
              {plant.isMother && <span className="text-green-400">🌿 Mutterpflanze</span>}
              {plant.isClone  && <span className="text-emerald-400">✂️ Steckling</span>}
            </div>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-600 hover:text-gray-300 text-lg px-1">✕</button>
      </div>

      <div className="px-4 py-3 space-y-3 overflow-y-auto flex-1">
        {/* Quality */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500">Qualität</span>
            <span style={{ color: qColor }} className="font-bold">{plant.quality.toFixed(1)}%</span>
          </div>
          <Bar value={plant.quality} color={qColor} />
        </div>

        {/* Health */}
        {!isPostHarv && (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500">Gesundheit</span>
              <span style={{ color: hColor }} className="font-bold">{plant.health}%</span>
            </div>
            <Bar value={plant.health} color={hColor} height="h-1.5" />
          </div>
        )}

        {/* Phase progress */}
        {!isPostHarv && !isHarvReady && (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500">Phasenfortschritt</span>
              <span className="text-gray-400">Tag {plant.phaseDay}</span>
            </div>
            <Bar value={plant.phaseDay} max={20} color="#166534" height="h-1.5" />
          </div>
        )}

        {/* Drying */}
        {plant.phase === 'drying' && (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500">Trocknung</span>
              <span className="text-orange-400">{plant.dryingDay}/10 Tage</span>
            </div>
            <Bar value={plant.dryingDay} max={10} color="#c2410c" />
          </div>
        )}

        {/* Curing */}
        {plant.phase === 'curing' && (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500">Curing</span>
              <span className="text-orange-300">{plant.curingDay}/14 Tage • Qualität steigt…</span>
            </div>
            <Bar value={plant.curingDay} max={14} color="#ea580c" />
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-1 text-xs">
          {!isPostHarv && <Stat label="Topf" value={`${plant.potLiters}L`} />}
          {!isPostHarv && <Stat label="Gesamttage" value={plant.totalDays} />}
          {room && <Stat label="Zimmer" value={room.tent?.name ?? room.id} />}
          {(isReady || isHarvReady || isPostHarv) && plant.harvestedGrams > 0 &&
            <Stat label="Ertrag" value={`${plant.harvestedGrams}g`} color="text-green-400" />}
          {isReady && <Stat label="Preis" value={`${pricePerG}€/g`} color="text-cyan-400" />}
        </div>

        {/* NPK / Fertilize section */}
        {(isActive || isHarvReady) && !showClone && !showCross && (
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Düngung</div>
            <NPKPanel plant={plant} inventory={inventory} />
          </div>
        )}

        {/* Clone panel */}
        {showClone && <ClonePanel plant={plant} onClose={() => setShowClone(false)} />}
        {showCross && <CrossPanel plant={plant} onClose={() => setShowCross(false)} />}

        {/* Ready revenue */}
        {isReady && (
          <div className="bg-cyan-900/20 border border-cyan-700/40 rounded p-2 text-center">
            <div className="text-xs text-gray-400">Geschätzter Erlös</div>
            <div className="text-lg font-bold text-cyan-400">{estRevenue} €</div>
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-2 pt-1">
          {/* Water + Harvest-ready water */}
          {(isActive || isHarvReady) && !showClone && !showCross && (
            <button
              onClick={() => waterPlant(plant.id)}
              disabled={plant.wateredToday}
              className={`w-full text-xs py-2 rounded font-bold transition-colors ${
                plant.wateredToday ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-blue-900/50 hover:bg-blue-800/60 border border-blue-700/60 text-blue-300'
              }`}>
              {plant.wateredToday ? '💧 Heute gegossen' : '💧 Gießen (+5 HP)'}
            </button>
          )}

          {/* Harvest */}
          {isHarvReady && (
            <button onClick={() => harvestPlant(plant.id)}
              className="w-full bg-yellow-700 hover:bg-yellow-600 text-white text-xs py-2 rounded font-bold transition-colors">
              ✂️ Ernten
            </button>
          )}

          {/* Sell */}
          {isReady && (
            <button onClick={() => sellHarvest(plant.id)}
              className="w-full bg-cyan-700 hover:bg-cyan-600 text-white text-xs py-2 rounded font-bold transition-colors">
              💰 Verkaufen
            </button>
          )}

          {/* Mother / Clone / Cross */}
          {plant.phase === 'vegetative' && !showClone && !showCross && (
            <div className="grid grid-cols-3 gap-1">
              <button onClick={() => toggleMother(plant.id)}
                className={`text-xs py-1.5 rounded border transition-colors ${
                  plant.isMother ? 'border-green-600 bg-green-900/40 text-green-300' : 'border-gray-700 text-gray-400 hover:bg-gray-700/40'
                }`}>
                🌿 {plant.isMother ? 'Mutter' : 'Als Mutter'}
              </button>
              {plant.isMother && (
                <button onClick={() => setShowClone(true)} className="text-xs py-1.5 rounded border border-emerald-700 text-emerald-400 hover:bg-emerald-900/30">
                  ✂️ Steckling
                </button>
              )}
              {plant.isMother && (
                <button onClick={() => setShowCross(true)} className="text-xs py-1.5 rounded border border-purple-700 text-purple-400 hover:bg-purple-900/30">
                  🧬 Kreuzen
                </button>
              )}
            </div>
          )}

          {/* Remove */}
          <button onClick={() => { removePlant(plant.id); onClose?.(); }}
            className="w-full text-xs py-1.5 rounded border border-red-900/50 text-red-500 hover:bg-red-900/20 transition-colors">
            🗑 Entfernen
          </button>
        </div>
      </div>
    </div>
  );
}
