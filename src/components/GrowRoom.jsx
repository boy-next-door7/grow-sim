import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { SUBSTRATES } from '../data/equipment';
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
      <div className="px-4 py-3 space-y-4">
        <div className="text-xs text-gray-500">
          {pot ? `${pot.name} — ${pot.liters}L` : `Topf ${potIndex + 1}`}
        </div>

        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Sorte wählen</div>
          {availableSeeds.length === 0 ? (
            <div className="text-xs text-red-400 bg-red-900/20 border border-red-800/40 rounded p-2">
              Keine Samen im Inventar — kaufe Samen im Shop.
            </div>
          ) : (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {availableSeeds.map(s => (
                <button key={s.id} onClick={() => setStrainId(s.id)}
                  className={`w-full text-left px-3 py-2 rounded border text-xs transition-colors ${
                    strainId === s.id ? 'border-green-600 bg-green-900/30' : 'border-gray-800 hover:border-gray-600 bg-gray-800/50'
                  }`}>
                  <div className="flex justify-between">
                    <span style={{ color: s.color }} className="font-bold">{s.name}</span>
                    <span className="text-gray-500">{inventory.seeds[s.id]}×</span>
                  </div>
                  <div className="text-gray-500 mt-0.5">{s.desc} · {s.type === 'auto' ? 'Auto' : 'Foto'}{s.isHybrid ? ' · F1' : ''}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Substrat wählen</div>
          {availableSubs.length === 0 ? (
            <div className="text-xs text-red-400 bg-red-900/20 border border-red-800/40 rounded p-2">
              Kein passendes Substrat (benötigt {pot?.liters ?? '?'}L).
            </div>
          ) : (
            <div className="space-y-1">
              {availableSubs.map(s => (
                <button key={s.id} onClick={() => setSubId(s.id)}
                  className={`w-full text-left px-3 py-2 rounded border text-xs transition-colors ${
                    subId === s.id ? 'border-amber-700 bg-amber-900/20' : 'border-gray-800 hover:border-gray-600 bg-gray-800/50'
                  }`}>
                  <div className="flex justify-between">
                    <span className="text-amber-300">{s.name}</span>
                    <span className="text-gray-500">{inventory.substrate[s.id]}L</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 text-xs py-2 rounded border border-gray-700 text-gray-400 hover:text-gray-200">
            Abbrechen
          </button>
          <button onClick={doPlant} disabled={!canPlant}
            className={`flex-1 text-xs py-2 rounded font-bold transition-colors ${
              canPlant ? 'bg-green-800 hover:bg-green-700 text-white' : 'bg-gray-800 text-gray-600 cursor-not-allowed'
            }`}>
            Einpflanzen
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Ready-to-sell banner ─────────────────────────────────
function ReadyBanner({ plants, onSelect }) {
  const ready = plants.filter(p => p.phase === 'ready');
  if (ready.length === 0) return null;
  return (
    <div className="bg-cyan-900/20 border border-cyan-700/40 rounded-lg p-3 flex items-center justify-between">
      <div className="text-xs text-cyan-300 font-bold">{ready.length}× Ernte verkaufsbereit!</div>
      <div className="flex gap-2">
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

// ── Inline climate & automation controls ─────────────────
function RoomControls({ room }) {
  const setRoomLampHours     = useGameStore(s => s.setRoomLampHours);
  const setRoomLampIntensity = useGameStore(s => s.setRoomLampIntensity);
  const setRoomExhaustSpeed  = useGameStore(s => s.setRoomExhaustSpeed);
  const [open, setOpen]      = useState(false);

  const { lamp, exhaust, lampHours, lampIntensity, exhaustSpeed, climate, controller, drip } = room;
  const isAuto = controller?.autoClimate;

  const tempOk = climate.temperature >= 18 && climate.temperature <= 28;
  const humOk  = climate.humidity    >= 35 && climate.humidity    <= 70;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-gray-800/40 transition-colors"
      >
        <div className="text-xs text-gray-500 uppercase tracking-wide">Klima &amp; Steuerung</div>
        <div className="flex items-center gap-3 text-xs">
          <span className={tempOk ? 'text-orange-400' : 'text-red-400'}>
            {climate.temperature.toFixed(1)}°C
          </span>
          <span className={humOk ? 'text-blue-400' : 'text-yellow-400'}>
            {climate.humidity.toFixed(1)}%
          </span>
          <span className="text-yellow-400">{climate.lightHours}h</span>
          {drip       && <span className="text-blue-300 bg-blue-900/30 border border-blue-800/50 px-1.5 rounded">💧 AUTO</span>}
          {controller && <span className="text-green-300 bg-green-900/30 border border-green-800/50 px-1.5 rounded">🤖 {isAuto ? 'SMART' : 'TIMER'}</span>}
          <span className="text-gray-600 ml-1">{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-800 space-y-4">

          {/* Lamp */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">
                💡 {lamp?.name ?? 'Keine Lampe'}
                {lamp && <span className="text-gray-600 ml-1">· {lamp.watt}W{lamp.dimmable ? ' · dimmbar' : ''}</span>}
              </span>
              <span className={lampHours <= 12 ? 'text-pink-400' : 'text-yellow-400'}>
                {lampHours}h / {24 - lampHours}h
                {lampHours === 0 ? ' (aus)' : lampHours <= 12 ? ' (Blüte)' : ' (Veg)'}
              </span>
            </div>
            <input type="range" min="0" max="24" step="1"
              value={lampHours}
              onChange={e => setRoomLampHours(room.id, e.target.value)}
              disabled={!lamp || isAuto}
              className="w-full accent-yellow-500"
            />
            {lamp?.dimmable && (
              <div className="flex items-center gap-3 text-xs">
                <span className="text-gray-500 shrink-0 w-24">Intensität {lampIntensity}%</span>
                <input type="range" min="10" max="100" step="5"
                  value={lampIntensity}
                  onChange={e => setRoomLampIntensity(room.id, e.target.value)}
                  className="flex-1 accent-green-500"
                />
              </div>
            )}
          </div>

          {/* Exhaust */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">🌀 {exhaust?.name ?? 'Kein Abluftlüfter'}</span>
              <span className="text-blue-400">{exhaustSpeed}%</span>
            </div>
            <input type="range" min="0" max="100" step="5"
              value={exhaustSpeed}
              onChange={e => setRoomExhaustSpeed(room.id, e.target.value)}
              disabled={!exhaust || isAuto}
              className="w-full accent-blue-500"
            />
          </div>

          {/* Automation status */}
          <div className="flex flex-wrap gap-2 text-xs">
            {drip ? (
              <div className="flex items-center gap-1.5 bg-blue-900/20 border border-blue-800/40 rounded px-2 py-1">
                <span>💧</span>
                <span className="text-blue-300">{drip.name} — alle {drip.waterEvery} Tag(e)</span>
              </div>
            ) : (
              <div className="bg-gray-800/60 border border-gray-700 rounded px-2 py-1 text-gray-500">
                💧 Manuell gießen — täglich erforderlich!
              </div>
            )}
            {controller ? (
              <div className="flex items-center gap-1.5 bg-green-900/20 border border-green-800/40 rounded px-2 py-1">
                <span>🤖</span>
                <span className="text-green-300">
                  {controller.name}{isAuto ? ' — Abluft automatisch' : ' — Zeitsteuerung aktiv'}
                </span>
              </div>
            ) : (
              <div className="bg-gray-800/60 border border-gray-700 rounded px-2 py-1 text-gray-500">
                🤖 Kein Controller
              </div>
            )}
          </div>

          {isAuto && (
            <div className="text-xs text-gray-600 italic">
              Smart-Controller regelt Abluft auf Ziel 24°C. Lampe weiterhin manuell.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main GrowRoom ────────────────────────────────────────
export default function GrowRoom() {
  const rooms         = useGameStore(s => s.rooms);
  const activeRoomId  = useGameStore(s => s.activeRoomId);
  const plants        = useGameStore(s => s.plants);
  const setActiveRoom = useGameStore(s => s.setActiveRoom);
  const addRoom       = useGameStore(s => s.addRoom);
  const removeRoom    = useGameStore(s => s.removeRoom);

  const [selectedPlantId, setSelectedPlantId] = useState(null);
  const [plantingPot,     setPlantingPot]      = useState(null);

  const activeRoom = rooms.find(r => r.id === activeRoomId);

  function handlePlantClick(plantId) {
    setPlantingPot(null);
    setSelectedPlantId(plantId === selectedPlantId ? null : plantId);
  }

  function handleEmptyPotClick(roomId, potIndex) {
    setSelectedPlantId(null);
    setPlantingPot(plantingPot?.roomId === roomId && plantingPot?.potIndex === potIndex ? null : { roomId, potIndex });
  }

  function closePanel() {
    setSelectedPlantId(null);
    setPlantingPot(null);
  }

  const roomPlants = plants.filter(p => p.roomId === activeRoomId);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">

      {/* Room / tent tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {rooms.map(r => (
          <button key={r.id} onClick={() => { setActiveRoom(r.id); closePanel(); }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono transition-colors border ${
              r.id === activeRoomId ? 'bg-green-900/50 border-green-700 text-green-400' : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-gray-200'
            }`}>
            <span>{r.tent ? '🏕️' : '🔲'}</span>
            <span>{r.tent?.name ?? 'Leeres Zelt'}</span>
            <span className="text-gray-600">
              {plants.filter(p => p.roomId === r.id && !['ready'].includes(p.phase)).length}/{r.tent?.maxPlants ?? 0}
            </span>
            {rooms.length > 1 && r.id === activeRoomId && (
              <button onClick={e => { e.stopPropagation(); removeRoom(r.id); }}
                className="text-gray-600 hover:text-red-500 ml-1">✕</button>
            )}
          </button>
        ))}
        <button onClick={addRoom}
          className="px-3 py-1.5 rounded text-xs font-mono border border-dashed border-gray-700 text-gray-500 hover:text-green-400 hover:border-green-700 transition-colors">
          + Neues Zelt
        </button>
      </div>

      {/* Ready-to-sell banner */}
      <ReadyBanner plants={plants} onSelect={handlePlantClick} />

      {/* Pixel view + side panel */}
      <div className="flex gap-4 items-start">
        <div className="flex-1 overflow-x-auto">
          <PixelView
            room={activeRoom}
            plants={roomPlants}
            onPlantClick={handlePlantClick}
            onEmptyPotClick={handleEmptyPotClick}
          />
          {!activeRoom?.tent && (
            <div className="mt-4 text-center text-gray-500 text-xs">Kaufe ein Zelt im Shop.</div>
          )}
          {activeRoom?.tent && activeRoom.pots.length === 0 && (
            <div className="mt-4 text-center text-gray-500 text-xs">Keine Töpfe — kaufe Töpfe im Shop.</div>
          )}
        </div>

        {(selectedPlantId || plantingPot) && (
          <div className="w-72 shrink-0">
            {selectedPlantId && <PlantDetail plantId={selectedPlantId} onClose={closePanel} />}
            {plantingPot && !selectedPlantId && (
              <PlantingPanel roomId={plantingPot.roomId} potIndex={plantingPot.potIndex} onClose={closePanel} />
            )}
          </div>
        )}
      </div>

      {/* Climate & automation panel (always shown when tent exists) */}
      {activeRoom && <RoomControls room={activeRoom} />}
    </div>
  );
}
