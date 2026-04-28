import { useGameStore } from '../store/gameStore';
import { PHASES } from '../data/phases';

function StatCard({ label, value, sub, color = 'text-green-400' }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      {sub && <div className="text-xs text-gray-600 mt-1">{sub}</div>}
    </div>
  );
}

function PhaseBar({ plant }) {
  const phase = PHASES[plant.phase];
  if (!phase) return null;

  const totalGrowDays = plant.germDays + plant.seedlingDays + plant.vegDays + plant.flowerDays;
  const progress = Math.min(100, (plant.totalDays / totalGrowDays) * 100);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span>{phase.icon}</span>
          <span className="text-xs font-bold" style={{ color: plant.strainColor }}>{plant.strainName}</span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-gray-400">Phase:</span>
          <span style={{ color: phase.color }}>{phase.label}</span>
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Qualität</span>
          <span className={plant.quality > 70 ? 'text-green-400' : plant.quality > 40 ? 'text-yellow-400' : 'text-red-400'}>
            {plant.quality.toFixed(0)}%
          </span>
        </div>
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${plant.quality}%`,
              background: plant.quality > 70 ? '#22c55e' : plant.quality > 40 ? '#eab308' : '#ef4444',
            }}
          />
        </div>
        {!['drying','curing','ready'].includes(plant.phase) && (
          <>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Wachstum</span>
              <span className="text-gray-400">Tag {plant.totalDays}</span>
            </div>
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-700 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </>
        )}
        {plant.phase === 'drying' && (
          <div className="text-xs text-orange-400">Trocknung: Tag {plant.dryingDay}/10</div>
        )}
        {plant.phase === 'curing' && (
          <div className="text-xs text-orange-300">Curing: Tag {plant.curingDay}/14</div>
        )}
        {plant.phase === 'ready' && (
          <div className="text-xs text-cyan-400 font-bold">Bereit: {plant.harvestedGrams}g @ Qualität {plant.quality.toFixed(0)}%</div>
        )}
      </div>
    </div>
  );
}

export default function Overview({ setTab }) {
  const day = useGameStore(s => s.day);
  const money = useGameStore(s => s.money);
  const plants = useGameStore(s => s.plants);
  const climate = useGameStore(s => s.climate);
  const equipment = useGameStore(s => s.equipment);
  const electricityAccrued = useGameStore(s => s.electricityAccrued);
  const totalRevenue = useGameStore(s => s.totalRevenue);
  const totalSpent = useGameStore(s => s.totalSpent);
  const transactions = useGameStore(s => s.transactions);

  const activePlants = plants.filter(p => !['ready'].includes(p.phase));
  const readyPlants = plants.filter(p => p.phase === 'ready');
  const isReady = readyPlants.length > 0;

  const hasEquipment = equipment.tent && equipment.lamp && equipment.exhaust;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Setup-Warnung */}
      {!hasEquipment && (
        <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-4 flex items-center justify-between">
          <div className="text-yellow-300 text-sm">
            Noch kein Setup! Kaufe mindestens <strong>Zelt, Lampe und Abluft</strong> im Shop.
          </div>
          <button
            onClick={() => setTab('shop')}
            className="bg-yellow-700 hover:bg-yellow-600 text-white text-xs px-4 py-2 rounded"
          >
            Zum Shop →
          </button>
        </div>
      )}

      {/* Verkauf-Warnung */}
      {isReady && (
        <div className="bg-cyan-900/30 border border-cyan-700/50 rounded-lg p-4 flex items-center justify-between">
          <div className="text-cyan-300 text-sm">
            {readyPlants.length}× Ernte verkaufsbereit!
          </div>
          <button
            onClick={() => setTab('growroom')}
            className="bg-cyan-700 hover:bg-cyan-600 text-white text-xs px-4 py-2 rounded"
          >
            Verkaufen →
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Spieltag" value={day} sub="8 min = 1 Tag" color="text-green-400" />
        <StatCard
          label="Kontostand"
          value={`${money.toFixed(2)} €`}
          sub={`Ausgegeben: ${totalSpent.toFixed(0)} €`}
          color={money < 200 ? 'text-red-400' : money < 500 ? 'text-yellow-400' : 'text-green-400'}
        />
        <StatCard label="Einnahmen" value={`${totalRevenue.toFixed(0)} €`} sub={`Strom: ${electricityAccrued.toFixed(2)} €`} color="text-cyan-400" />
        <StatCard label="Pflanzen" value={`${activePlants.length}`} sub={`${equipment.pots.length} Töpfe verfügbar`} color="text-purple-400" />
      </div>

      {/* Klima-Kurzübersicht */}
      {hasEquipment && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-3">Aktuelles Klima</div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-400">{climate.temperature.toFixed(1)}°C</div>
              <div className="text-xs text-gray-500">Temperatur</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">{climate.humidity.toFixed(1)}%</div>
              <div className="text-xs text-gray-500">Luftfeuchtigkeit</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">{climate.lightHours}h</div>
              <div className="text-xs text-gray-500">Lichtstunden</div>
            </div>
          </div>
        </div>
      )}

      {/* Pflanzen-Status */}
      {plants.length > 0 && (
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-3">Pflanzen-Status</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {plants.map(p => <PhaseBar key={p.id} plant={p} />)}
          </div>
        </div>
      )}

      {/* Letzte Transaktionen */}
      {transactions.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-3">Letzte Transaktionen</div>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {[...transactions].reverse().slice(0, 15).map((t, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span className="text-gray-400">Tag {t.day}: {t.desc}</span>
                <span className={t.amount >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {t.amount >= 0 ? '+' : ''}{t.amount.toFixed(2)} €
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
