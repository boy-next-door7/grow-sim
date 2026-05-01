import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { PHASES } from '../data/phases';
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

// ── Water Content Gauge ──────────────────────────────────
function WaterGauge({ plant, inventory }) {
  const waterPlant = useGameStore(s => s.waterPlant);
  const [selectedNut, setSelectedNut] = useState(null);

  const wc = plant.waterContent ?? 100;
  const wcColor = wc > 60 ? '#3b82f6' : wc > 30 ? '#eab308' : wc > 15 ? '#f97316' : '#ef4444';
  const wcLabel = wc > 60 ? 'Gut' : wc > 30 ? 'Trocken' : wc > 15 ? 'Kritisch' : 'Verdorrt!';

  const canWater = !plant.wateredToday &&
    !['drying','curing','ready','harvest_ready','clone_rooting'].includes(plant.phase);

  const syntheticNuts = NUTRIENTS.filter(n =>
    n.category === 'synthetic' && (inventory.nutrients[n.id] ?? 0) >= n.mlPerFeed
  );

  function doWater() {
    waterPlant(plant.id, selectedNut);
    setSelectedNut(null);
  }

  return (
    <div className="space-y-2">
      {/* Gauge */}
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-500">💧 Wassergehalt</span>
        <span style={{ color: wcColor }} className="font-bold">{Math.round(wc)}% — {wcLabel}</span>
      </div>
      <Bar value={wc} color={wcColor} height="h-3" />

      {/* Watering section */}
      {canWater && (
        <div className="space-y-2 pt-1">
          {/* Synthetic nutrient picker */}
          {syntheticNuts.length > 0 && (
            <div>
              <div className="text-xs text-gray-600 mb-1">Dünger ins Gießwasser (optional):</div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {NUTRIENTS.filter(n => n.category === 'synthetic').map(nut => {
                  const avail = inventory.nutrients[nut.id] ?? 0;
                  const canUse = avail >= nut.mlPerFeed;
                  return (
                    <button key={nut.id}
                      onClick={() => canUse && setSelectedNut(selectedNut === nut.id ? null : nut.id)}
                      disabled={!canUse}
                      className={`w-full text-left px-2 py-1.5 rounded text-xs border transition-colors ${
                        selectedNut === nut.id
                          ? 'border-blue-500 bg-blue-900/30 text-blue-300'
                          : canUse
                          ? 'border-gray-700 bg-gray-800/40 hover:bg-gray-700/40 text-gray-300'
                          : 'border-gray-800 opacity-40 cursor-not-allowed text-gray-600'
                      }`}>
                      <div className="flex justify-between">
                        <span>{nut.name}</span>
                        <span className="text-gray-500">{avail}ml</span>
                      </div>
                      <div className="text-gray-600 text-[10px]">
                        N+{nut.npk.n} P+{nut.npk.p} K+{nut.npk.k} · {nut.mlPerFeed}ml/Feed
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <button onClick={doWater}
            className="w-full text-xs py-2 rounded font-bold bg-blue-900/50 hover:bg-blue-800/60 border border-blue-700/60 text-blue-300 transition-colors">
            💧 Gießen{selectedNut ? ` + ${NUTRIENTS.find(n=>n.id===selectedNut)?.name ?? ''}` : ''}  (+35% Wasser)
          </button>
        </div>
      )}
      {plant.wateredToday && (
        <div className="text-xs text-center text-gray-600 py-1">✓ Heute bereits gegossen</div>
      )}
    </div>
  );
}

// ── NPK Gauges ───────────────────────────────────────────
function NPKGauges({ plant, inventory }) {
  const topDressPlant = useGameStore(s => s.topDressPlant);

  const nutrients = [
    { key: 'nutrientN', label: 'N', color: '#22c55e', desc: 'Stickstoff' },
    { key: 'nutrientP', label: 'P', color: '#f97316', desc: 'Phosphor' },
    { key: 'nutrientK', label: 'K', color: '#a78bfa', desc: 'Kalium' },
  ];

  const organicNuts = NUTRIENTS.filter(n =>
    n.category === 'organic' && (inventory.nutrients[n.id] ?? 0) >= n.mlPerFeed
  );
  const canTopDress = !['drying','curing','ready','germination','clone_rooting'].includes(plant.phase);

  return (
    <div className="space-y-3">
      {/* N/P/K bars */}
      <div className="space-y-2">
        {nutrients.map(({ key, label, color, desc }) => {
          const val = plant[key] ?? 50;
          const barColor = val > 40 ? color : val > 20 ? '#eab308' : '#ef4444';
          return (
            <div key={key}>
              <div className="flex justify-between text-xs mb-0.5">
                <span className="text-gray-500">{label} — {desc}</span>
                <span style={{ color: val > 40 ? color : val > 20 ? '#eab308' : '#ef4444' }}
                  className="font-bold">{Math.round(val)}%</span>
              </div>
              <Bar value={val} color={barColor} height="h-2" />
            </div>
          );
        })}
      </div>

      {/* Active organic queue */}
      {(plant.organicQueue ?? []).length > 0 && (
        <div className="bg-amber-950/30 border border-amber-800/40 rounded p-2 space-y-1">
          <div className="text-xs text-amber-400 font-bold">🌿 Aktive Top-Dressings</div>
          {plant.organicQueue.map((q, i) => {
            const nut = NUTRIENTS.find(n => q.nutId && n.id === q.nutId);
            return (
              <div key={i} className="flex justify-between text-xs">
                <span className="text-amber-300">{nut?.name ?? 'Organisch'}</span>
                <span className="text-amber-500">noch {q.daysLeft}d</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Top-dressing section */}
      {canTopDress && organicNuts.length > 0 && (
        <div>
          <div className="text-xs text-gray-600 mb-1">🌿 Top-Dressing (organisch):</div>
          <div className="space-y-1">
            {NUTRIENTS.filter(n => n.category === 'organic').map(nut => {
              const avail = inventory.nutrients[nut.id] ?? 0;
              const canUse = avail >= nut.mlPerFeed;
              return (
                <div key={nut.id} className="flex items-center gap-2">
                  <div className={`flex-1 text-xs ${canUse ? 'text-amber-300' : 'text-gray-600'}`}>
                    <div className="flex justify-between">
                      <span>{nut.name}</span>
                      <span className="text-gray-500">{avail}g</span>
                    </div>
                    <div className="text-gray-600 text-[10px]">
                      N+{nut.npkBoost.n} P+{nut.npkBoost.p} K+{nut.npkBoost.k} · {nut.releaseDays}d Freisetzung
                    </div>
                  </div>
                  <button
                    onClick={() => topDressPlant(plant.id, nut.id)}
                    disabled={!canUse}
                    className={`text-xs px-2 py-1 rounded border shrink-0 transition-colors ${
                      canUse
                        ? 'border-amber-700 bg-amber-900/30 text-amber-400 hover:brightness-125'
                        : 'border-gray-800 text-gray-600 cursor-not-allowed'
                    }`}>
                    Ausbringen
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Clone Target Selector ────────────────────────────────
function ClonePanel({ plant, onClose }) {
  const rooms     = useGameStore(s => s.rooms);
  const plants    = useGameStore(s => s.plants);
  const inventory = useGameStore(s => s.inventory);
  const takeClone = useGameStore(s => s.takeClone);

  const [targetRoomId,  setTargetRoomId]  = useState(rooms[0]?.id);
  const [targetPotIndex, setTargetPotIndex] = useState(null);
  const [subId, setSubId]                 = useState(null);

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
        <button onClick={onClose} className="flex-1 text-xs py-1.5 rounded border border-gray-700 text-gray-400 hover:text-gray-200">Abbrechen</button>
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
  const plants      = useGameStore(s => s.plants);
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
  const plant        = useGameStore(s => s.plants.find(p => p.id === plantId));
  const inventory    = useGameStore(s => s.inventory);
  const rooms        = useGameStore(s => s.rooms);
  const harvestPlant = useGameStore(s => s.harvestPlant);
  const sellHarvest  = useGameStore(s => s.sellHarvest);
  const removePlant  = useGameStore(s => s.removePlant);
  const toggleMother = useGameStore(s => s.toggleMother);

  const [showClone, setShowClone] = useState(false);
  const [showCross, setShowCross] = useState(false);
  const [activeTab, setActiveTab] = useState('water'); // 'water' | 'nutrients'

  if (!plant) { onClose?.(); return null; }

  const phase      = PHASES[plant.phase];
  const isActive   = !['drying','curing','ready','harvest_ready'].includes(plant.phase);
  const isPostHarv = ['drying','curing','ready'].includes(plant.phase);
  const isReady    = plant.phase === 'ready';
  const isHarvReady = plant.phase === 'harvest_ready';
  const room       = rooms.find(r => r.id === plant.roomId);

  const pricePerG  = SELL_PRICE(plant.quality);
  const estRevenue = plant.harvestedGrams * pricePerG;

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
            {(() => {
              const phaseMax = {
                germination:   plant.germDays,
                clone_rooting: 5,
                seedling:      plant.seedlingDays,
                vegetative:    plant.vegDays,
                flowering:     Math.floor(plant.flowerDays * 0.75),
                late_flower:   Math.ceil(plant.flowerDays * 0.25),
              }[plant.phase] ?? Math.max(plant.phaseDay + 1, 1);
              return (
                <>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Phasenfortschritt</span>
                    <span className="text-gray-400">Tag {plant.phaseDay}/{phaseMax}</span>
                  </div>
                  <Bar value={plant.phaseDay} max={phaseMax} color="#166534" height="h-1.5" />
                </>
              );
            })()}
          </div>
        )}

        {/* Drying / Curing */}
        {plant.phase === 'drying' && (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500">Trocknung</span>
              <span className="text-orange-400">{plant.dryingDay}/10 Tage</span>
            </div>
            <Bar value={plant.dryingDay} max={10} color="#c2410c" />
          </div>
        )}
        {plant.phase === 'curing' && (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500">Curing</span>
              <span className="text-amber-300">{plant.curingDay}/14 Tage • Qualität steigt…</span>
            </div>
            <Bar value={plant.curingDay} max={14} color="#d97706" />
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

        {/* Water / Nutrients tabs for active plants */}
        {(isActive || isHarvReady) && !showClone && !showCross && (
          <div>
            <div className="flex border-b border-gray-800 mb-3">
              {[['water','💧 Wasser'],['nutrients','🌿 Nährstoffe']].map(([id, label]) => (
                <button key={id} onClick={() => setActiveTab(id)}
                  className={`px-3 py-1.5 text-xs transition-colors border-b-2 -mb-px ${
                    activeTab === id
                      ? 'border-green-500 text-green-400'
                      : 'border-transparent text-gray-500 hover:text-gray-300'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
            {activeTab === 'water'     && <WaterGauge plant={plant} inventory={inventory} />}
            {activeTab === 'nutrients' && <NPKGauges  plant={plant} inventory={inventory} />}
          </div>
        )}

        {/* Clone / Cross panels */}
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
          {isHarvReady && (
            <button onClick={() => harvestPlant(plant.id)}
              className="w-full bg-yellow-700 hover:bg-yellow-600 text-white text-xs py-2 rounded font-bold transition-colors">
              ✂️ Ernten
            </button>
          )}
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

          <button onClick={() => { removePlant(plant.id); onClose?.(); }}
            className="w-full text-xs py-1.5 rounded border border-red-900/50 text-red-500 hover:bg-red-900/20 transition-colors">
            🗑 Entfernen
          </button>
        </div>
      </div>
    </div>
  );
}
