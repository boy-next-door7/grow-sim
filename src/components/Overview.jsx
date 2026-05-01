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
          {plant.isMother && <span className="text-xs text-green-400 bg-green-900/30 px-1.5 rounded">Mutter</span>}
          {plant.isClone  && <span className="text-xs text-blue-400 bg-blue-900/30 px-1.5 rounded">Klon</span>}
        </div>
        <div className="flex items-center gap-2 text-xs">
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
          <div className="h-full rounded-full transition-all duration-300"
            style={{ width: `${plant.quality}%`, background: plant.quality > 70 ? '#22c55e' : plant.quality > 40 ? '#eab308' : '#ef4444' }} />
        </div>
        {!['drying', 'curing', 'ready'].includes(plant.phase) && (
          <>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Wachstum</span>
              <span className="text-gray-400">Tag {plant.totalDays}</span>
            </div>
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-green-700 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </>
        )}
        {plant.phase === 'drying'  && <div className="text-xs text-orange-400">Trocknung: Tag {plant.dryingDay}/10</div>}
        {plant.phase === 'curing'  && <div className="text-xs text-orange-300">Curing: Tag {plant.curingDay}/14</div>}
        {plant.phase === 'ready'   && <div className="text-xs text-cyan-400 font-bold">Bereit: {plant.harvestedGrams}g @ {plant.quality.toFixed(0)}%</div>}
      </div>
    </div>
  );
}


export default function Overview({ setTab }) {
  const day                = useGameStore(s => s.day);
  const money              = useGameStore(s => s.money);
  const plants             = useGameStore(s => s.plants);
  const rooms              = useGameStore(s => s.rooms);
  const electricityAccrued = useGameStore(s => s.electricityAccrued);
  const totalRevenue       = useGameStore(s => s.totalRevenue);
  const totalSpent         = useGameStore(s => s.totalSpent);
  const transactions       = useGameStore(s => s.transactions);

  const activePlants = plants.filter(p => p.phase !== 'ready');
  const readyPlants  = plants.filter(p => p.phase === 'ready');
  const totalPots    = rooms.reduce((sum, r) => sum + r.pots.length, 0);
  const hasSetup     = rooms.some(r => r.tent && r.lamp && r.exhaust);
  const roomsWithClimate = rooms.filter(r => r.lamp || r.exhaust);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

      {/* Setup warning */}
      {!hasSetup && (
        <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-4 flex items-center justify-between">
          <div className="text-yellow-300 text-sm">
            Noch kein Setup! Kaufe mindestens <strong>Zelt, Lampe und Abluft</strong> im Shop.
          </div>
          <button onClick={() => setTab('shop')}
            className="bg-yellow-700 hover:bg-yellow-600 text-white text-xs px-4 py-2 rounded">
            Zum Shop →
          </button>
        </div>
      )}

      {/* Ready banner */}
      {readyPlants.length > 0 && (
        <div className="bg-cyan-900/30 border border-cyan-700/50 rounded-lg p-4 flex items-center justify-between">
          <div className="text-cyan-300 text-sm">{readyPlants.length}× Ernte verkaufsbereit!</div>
          <button onClick={() => setTab('growroom')}
            className="bg-cyan-700 hover:bg-cyan-600 text-white text-xs px-4 py-2 rounded">
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
        <StatCard label="Einnahmen" value={`${totalRevenue.toFixed(0)} €`}
          sub={`Strom: ${electricityAccrued.toFixed(2)} €`} color="text-cyan-400" />
        <StatCard label="Pflanzen" value={`${activePlants.length}`}
          sub={`${totalPots} Töpfe · ${rooms.length} Zimmer`} color="text-purple-400" />
      </div>

      {/* Per-room climate — compact summary strip */}
      {roomsWithClimate.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs text-gray-500 uppercase tracking-wide">Klima</div>
            <button onClick={() => setTab('growroom')} className="text-xs text-green-400 hover:text-green-300 underline underline-offset-2">
              Grow Room →
            </button>
          </div>
          <div className="space-y-2">
            {roomsWithClimate.map(r => {
              const { climate } = r;
              const tempOk = climate.temperature >= 18 && climate.temperature <= 28;
              const humOk  = climate.humidity    >= 35 && climate.humidity    <= 70;
              return (
                <div key={r.id} className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">{r.tent?.name ?? 'Zimmer'}</span>
                  <div className="flex items-center gap-4">
                    <span className={tempOk ? 'text-orange-400' : 'text-red-400'}>{climate.temperature.toFixed(1)}°C</span>
                    <span className={humOk  ? 'text-blue-400'  : 'text-yellow-400'}>{climate.humidity.toFixed(1)}%</span>
                    <span className="text-yellow-400">{climate.lightHours}h</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Plant status */}
      {plants.length > 0 && (
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-3">Pflanzen-Status</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {plants.map(p => <PhaseBar key={p.id} plant={p} />)}
          </div>
        </div>
      )}

      {/* Transactions */}
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
