import { useGameStore } from '../store/gameStore';
import { PHASES, getClimateScore } from '../data/phases';

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
        {/* optimal zone */}
        <div
          className="absolute top-0 h-full bg-green-900/50"
          style={{ left: `${optMinPct}%`, width: `${optMaxPct - optMinPct}%` }}
        />
        {/* current value */}
        <div
          className="absolute top-0 h-full w-2 rounded-full -ml-1 transition-all duration-500"
          style={{ left: `${pct}%`, background: inRange ? color : '#ef4444' }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-600">
        <span>{min}{unit}</span>
        <span className="text-green-900">{optMin}–{optMax}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}

function PhaseRequirements({ phaseId }) {
  const phase = PHASES[phaseId];
  if (!phase || !phase.climate) return null;
  const c = phase.climate;
  return (
    <div className="text-xs space-y-1">
      <div className="text-gray-500 flex justify-between">
        <span>Temperatur</span>
        <span className="text-gray-300">{c.tempMin}–{c.tempMax}°C (opt. {c.tempOpt}°C)</span>
      </div>
      <div className="text-gray-500 flex justify-between">
        <span>Luftfeuchtigkeit</span>
        <span className="text-gray-300">{c.humMin}–{c.humMax}% (opt. {c.humOpt}%)</span>
      </div>
      <div className="text-gray-500 flex justify-between">
        <span>Lichtstunden</span>
        <span className="text-gray-300">{c.lightHours}h/Tag</span>
      </div>
    </div>
  );
}

export default function ClimatePanel() {
  const climate = useGameStore(s => s.climate);
  const settings = useGameStore(s => s.settings);
  const setLampHours = useGameStore(s => s.setLampHours);
  const setExhaustSpeed = useGameStore(s => s.setExhaustSpeed);
  const equipment = useGameStore(s => s.equipment);
  const plants = useGameStore(s => s.plants);

  const activePlants = plants.filter(p => !['drying','curing','ready'].includes(p.phase));
  const uniquePhases = [...new Set(activePlants.map(p => p.phase))];

  const hasLamp = !!equipment.lamp;
  const hasExhaust = !!equipment.exhaust;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Steuerung */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 space-y-6">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Klimasteuerung</div>

          {/* Lampe */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-200 flex items-center gap-2">
                <span className="text-yellow-400">💡</span>
                <span>{equipment.lamp?.name ?? 'Keine Lampe'}</span>
              </div>
              {equipment.lamp && (
                <span className="text-xs text-gray-500">{equipment.lamp.watt}W</span>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Lichtstunden</span>
                <span className={settings.lampHours <= 12 ? 'text-pink-400' : 'text-yellow-400'}>
                  {settings.lampHours}h / {24 - settings.lampHours}h
                  {settings.lampHours <= 12 ? ' (Blüte)' : ' (Wachstum)'}
                </span>
              </div>
              <input
                type="range" min="10" max="22" step="1"
                value={settings.lampHours}
                onChange={e => setLampHours(e.target.value)}
                disabled={!hasLamp}
                className="w-full accent-yellow-500"
              />
              <div className="flex justify-between text-xs text-gray-600">
                <span>10h (Blüte)</span>
                <span>18h (Veg)</span>
              </div>
            </div>
          </div>

          {/* Abluft */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-200 flex items-center gap-2">
                <span className="text-blue-400">🌀</span>
                <span>{equipment.exhaust?.name ?? 'Kein Abluftlüfter'}</span>
              </div>
              {equipment.exhaust && (
                <span className="text-xs text-gray-500">{equipment.exhaust.watt}W</span>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Abluft-Geschwindigkeit</span>
                <span className="text-blue-400">{settings.exhaustSpeed}%</span>
              </div>
              <input
                type="range" min="0" max="100" step="5"
                value={settings.exhaustSpeed}
                onChange={e => setExhaustSpeed(e.target.value)}
                disabled={!hasExhaust}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-xs text-gray-600">
                <span>0% (aus)</span>
                <span>100% (max)</span>
              </div>
            </div>
          </div>

          {/* Tipp */}
          <div className="bg-gray-800/50 rounded p-3 text-xs text-gray-400 leading-relaxed">
            <span className="text-green-400">Tipp:</span> Höhere Abluft kühlt und trocknet.
            Mehr Lampenstunden erhöhen Temperatur.
            Für Blüte: 12h/12h Rhythmus einstellen.
          </div>
        </div>

        {/* Aktuelle Werte */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 space-y-5">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Aktuelle Klima-Werte</div>

          <Gauge
            value={climate.temperature}
            min={10} max={45} optMin={18} optMax={28}
            label="Temperatur" unit="°C" color="#f97316"
          />
          <Gauge
            value={climate.humidity}
            min={10} max={95} optMin={40} optMax={70}
            label="Luftfeuchtigkeit" unit="%" color="#60a5fa"
          />

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Lichtstunden</span>
              <span className="text-yellow-400">{climate.lightHours}h</span>
            </div>
          </div>

          {/* Verbrauch */}
          <div className="border-t border-gray-800 pt-4 grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="text-gray-500">Wattage gesamt</div>
              <div className="text-orange-400 font-bold">
                {(
                  (equipment.lamp?.watt ?? 0) * (settings.lampHours / 24) +
                  (equipment.exhaust?.watt ?? 0) * (settings.exhaustSpeed / 100) +
                  (equipment.fan?.watt ?? 0)
                ).toFixed(0)} W (Ø)
              </div>
            </div>
            <div>
              <div className="text-gray-500">Strom/Tag</div>
              <div className="text-red-400 font-bold">
                {(
                  ((equipment.lamp?.watt ?? 0) * settings.lampHours +
                   (equipment.exhaust?.watt ?? 0) * (settings.exhaustSpeed / 100) * 24 +
                   (equipment.fan?.watt ?? 0) * 24) / 1000 * 0.35
                ).toFixed(2)} €
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Phasen-Anforderungen */}
      {uniquePhases.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-4">Klimabedarf aktiver Pflanzen</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uniquePhases.map(phaseId => {
              const phase = PHASES[phaseId];
              const score = getClimateScore(climate, phaseId);
              if (!phase) return null;
              return (
                <div key={phaseId} className="bg-gray-800/50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{phase.icon}</span>
                      <span className="text-xs font-bold" style={{ color: phase.color }}>{phase.label}</span>
                    </div>
                    <div
                      className="text-xs font-bold px-2 py-0.5 rounded"
                      style={{
                        background: score > 80 ? '#14532d' : score > 50 ? '#713f12' : '#450a0a',
                        color: score > 80 ? '#86efac' : score > 50 ? '#fde68a' : '#fca5a5',
                      }}
                    >
                      {score.toFixed(0)}%
                    </div>
                  </div>
                  <PhaseRequirements phaseId={phaseId} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
