import { useGameStore } from '../store/gameStore';
import { PHASES, PHASE_NPK, getClimateScore } from '../data/phases';

function Gauge({ value, min, max, optMin, optMax, label, unit, color }) {
  const range = max - min;
  const pct = Math.max(0, Math.min(100, ((value - min) / range) * 100));
  const optMinPct = ((optMin - min) / range) * 100;
  const optMaxPct = ((optMax - min) / range) * 100;
  const inRange = value >= optMin && value <= optMax;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">{label}</span>
        <span className={inRange ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
          {value.toFixed(1)} {unit}
        </span>
      </div>
      <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden">
        <div className="absolute top-0 h-full bg-green-900/50"
          style={{ left: `${optMinPct}%`, width: `${optMaxPct - optMinPct}%` }} />
        <div className="absolute top-0 h-full w-2 rounded-full -ml-1 transition-all duration-500"
          style={{ left: `${pct}%`, background: inRange ? color : '#ef4444' }} />
      </div>
      <div className="flex justify-between text-xs text-gray-600">
        <span>{min}{unit}</span>
        <span className="text-green-900">{optMin}–{optMax}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}

function NPKBar({ label, value, max = 10, color }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 w-4">{label}</span>
      <div className="flex-1 h-2 bg-gray-800 rounded">
        <div className="h-full rounded transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs text-gray-400 w-4 text-right">{value}</span>
    </div>
  );
}

export default function ClimatePanel() {
  const rooms                = useGameStore(s => s.rooms);
  const activeRoomId         = useGameStore(s => s.activeRoomId);
  const setActiveRoom        = useGameStore(s => s.setActiveRoom);
  const plants               = useGameStore(s => s.plants);
  const setRoomLampHours     = useGameStore(s => s.setRoomLampHours);
  const setRoomLampIntensity = useGameStore(s => s.setRoomLampIntensity);
  const setRoomExhaustSpeed  = useGameStore(s => s.setRoomExhaustSpeed);

  const room = rooms.find(r => r.id === activeRoomId) ?? rooms[0];
  if (!room) return null;

  const { lamp, exhaust, lampHours, lampIntensity, exhaustSpeed, climate } = room;
  const roomPlants   = plants.filter(p => p.roomId === room.id && !['drying', 'curing', 'ready'].includes(p.phase));
  const uniquePhases = [...new Set(roomPlants.map(p => p.phase))];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

      {/* Room selector */}
      {rooms.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {rooms.map(r => (
            <button key={r.id} onClick={() => setActiveRoom(r.id)}
              className={`px-3 py-1.5 rounded text-xs font-mono border transition-colors ${
                r.id === room.id
                  ? 'bg-green-900/50 border-green-700 text-green-400'
                  : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-gray-200'
              }`}>
              {r.tent?.name ?? 'Leeres Zimmer'}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Controls */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 space-y-6">
          <div className="text-xs text-gray-500 uppercase tracking-wide">
            Klimasteuerung — {room.tent?.name ?? 'Kein Zelt'}
          </div>

          {/* Lamp */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-200 flex items-center gap-2">
                <span className="text-yellow-400">💡</span>
                <span>{lamp?.name ?? 'Keine Lampe'}</span>
              </div>
              {lamp && (
                <span className="text-xs text-gray-500">
                  {lamp.watt}W · {lamp.dimmable ? 'dimmbar' : 'nicht dimmbar'}
                </span>
              )}
            </div>

            {/* Hours */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Lichtstunden</span>
                <span className={lampHours <= 12 ? 'text-pink-400' : 'text-yellow-400'}>
                  {lampHours}h / {24 - lampHours}h
                  {lampHours === 0 ? ' (aus)' : lampHours <= 12 ? ' (Blüte)' : ' (Wachstum)'}
                </span>
              </div>
              <input type="range" min="0" max="24" step="1"
                value={lampHours}
                onChange={e => setRoomLampHours(room.id, e.target.value)}
                disabled={!lamp}
                className="w-full accent-yellow-500"
              />
              <div className="flex justify-between text-xs text-gray-600">
                <span>0h (aus)</span>
                <span>12h (Blüte)</span>
                <span>18h (Veg)</span>
                <span>24h</span>
              </div>
            </div>

            {/* Intensity — only for dimmable lamps */}
            {lamp?.dimmable && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Intensität</span>
                  <span className="text-green-400">{lampIntensity}%</span>
                </div>
                <input type="range" min="10" max="100" step="5"
                  value={lampIntensity}
                  onChange={e => setRoomLampIntensity(room.id, e.target.value)}
                  className="w-full accent-green-500"
                />
                <div className="flex justify-between text-xs text-gray-600">
                  <span>10% (min)</span>
                  <span>100% (max)</span>
                </div>
              </div>
            )}
          </div>

          {/* Exhaust */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-200 flex items-center gap-2">
                <span className="text-blue-400">🌀</span>
                <span>{exhaust?.name ?? 'Kein Abluftlüfter'}</span>
              </div>
              {exhaust && <span className="text-xs text-gray-500">{exhaust.watt}W</span>}
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Abluft-Geschwindigkeit</span>
                <span className="text-blue-400">{exhaustSpeed}%</span>
              </div>
              <input type="range" min="0" max="100" step="5"
                value={exhaustSpeed}
                onChange={e => setRoomExhaustSpeed(room.id, e.target.value)}
                disabled={!exhaust}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-xs text-gray-600">
                <span>0% (aus)</span>
                <span>100% (max)</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded p-3 text-xs text-gray-400 leading-relaxed">
            <span className="text-green-400">Tipp:</span> Blüte = 12h/12h. LED ist stufenlos dimmbar (Intensität).
            Abluft kühlt und reduziert Luftfeuchtigkeit.
          </div>
        </div>

        {/* Current values */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 space-y-5">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Aktuelle Klima-Werte</div>

          <Gauge value={climate.temperature} min={10} max={45} optMin={18} optMax={28}
            label="Temperatur" unit="°C" color="#f97316" />
          <Gauge value={climate.humidity} min={10} max={95} optMin={40} optMax={70}
            label="Luftfeuchtigkeit" unit="%" color="#60a5fa" />

          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Lichtstunden</span>
            <span className="text-yellow-400">{climate.lightHours}h</span>
          </div>
          {lamp && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">PPFD (effektiv)</span>
              <span className="text-yellow-300">{(climate.effectivePPFD ?? 0).toFixed(2)}×</span>
            </div>
          )}

          <div className="border-t border-gray-800 pt-4 grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="text-gray-500">Strom/Tag</div>
              <div className="text-red-400 font-bold">
                {(
                  ((lamp?.watt ?? 0) * (lampIntensity / 100) * lampHours +
                   (exhaust?.watt ?? 0) * (exhaustSpeed / 100) * 24 +
                   (room.fan?.watt ?? 0) * 24) / 1000 * 0.35
                ).toFixed(2)} €
              </div>
            </div>
            <div>
              <div className="text-gray-500">Pflanzen im Raum</div>
              <div className="text-purple-400 font-bold">{roomPlants.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Phase requirements + NPK */}
      {uniquePhases.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-4">
            Klimabedarf &amp; NPK aktiver Pflanzen
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uniquePhases.map(phaseId => {
              const phase = PHASES[phaseId];
              const npk   = PHASE_NPK[phaseId];
              const score = getClimateScore(climate, phaseId);
              if (!phase) return null;
              return (
                <div key={phaseId} className="bg-gray-800/50 rounded-lg p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{phase.icon}</span>
                      <span className="text-xs font-bold" style={{ color: phase.color }}>{phase.label}</span>
                    </div>
                    <div className="text-xs font-bold px-2 py-0.5 rounded"
                      style={{
                        background: score > 80 ? '#14532d' : score > 50 ? '#713f12' : '#450a0a',
                        color:      score > 80 ? '#86efac' : score > 50 ? '#fde68a' : '#fca5a5',
                      }}>
                      {score.toFixed(0)}%
                    </div>
                  </div>

                  {phase.climate && (
                    <div className="text-xs space-y-1 text-gray-500">
                      <div className="flex justify-between">
                        <span>Temp</span>
                        <span className="text-gray-300">{phase.climate.tempMin}–{phase.climate.tempMax}°C</span>
                      </div>
                      <div className="flex justify-between">
                        <span>LF</span>
                        <span className="text-gray-300">{phase.climate.humMin}–{phase.climate.humMax}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Licht</span>
                        <span className="text-gray-300">{phase.climate.lightHours}h/Tag</span>
                      </div>
                    </div>
                  )}

                  {npk && (
                    <div className="space-y-1.5 border-t border-gray-700 pt-2">
                      <div className="text-xs text-gray-400 font-bold">{npk.label}</div>
                      <NPKBar label="N" value={npk.n} max={10} color="#22c55e" />
                      <NPKBar label="P" value={npk.p} max={10} color="#f97316" />
                      <NPKBar label="K" value={npk.k} max={10} color="#a78bfa" />
                      <div className="text-xs text-gray-600 italic">{npk.tip}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
