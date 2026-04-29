import { useState, useEffect } from 'react';
import { useGameStore, GAME_DAY_MS } from '../store/gameStore';

function formatCountdown(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function Header({ tab, setTab }) {
  const day = useGameStore(s => s.day);
  const money = useGameStore(s => s.money);
  const started = useGameStore(s => s.started);
  const plants = useGameStore(s => s.plants);
  const lastTick = useGameStore(s => s.lastTick);
  const endDay = useGameStore(s => s.endDay);

  const [remaining, setRemaining] = useState(GAME_DAY_MS);

  useEffect(() => {
    if (!started || !lastTick) return;
    const update = () => {
      setRemaining(Math.max(0, GAME_DAY_MS - (Date.now() - lastTick)));
    };
    update();
    const id = setInterval(update, 500);
    return () => clearInterval(id);
  }, [started, lastTick]);

  const activePlants = plants.filter(p => !['ready'].includes(p.phase)).length;
  const readyPlants = plants.filter(p => p.phase === 'ready').length;
  const isUrgent = remaining < 60_000; // last minute

  const tabs = [
    { id: 'overview',  label: 'Übersicht' },
    { id: 'growroom',  label: 'Grow Room' },
    { id: 'shop',      label: 'Shop' },
    { id: 'finances',  label: 'Finanzen' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-gray-950 border-b border-green-900/50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <span className="text-green-400 text-xl">🌿</span>
            <span className="text-green-400 font-bold tracking-widest text-sm uppercase">GrowSim</span>
          </div>

          {/* Stats + Countdown */}
          {started && (
            <div className="flex items-center gap-4 text-xs">
              <span className="text-gray-400">
                Tag <span className="text-green-400 font-bold">{day}</span>
              </span>
              <span className={money < 100 ? 'text-red-400 font-bold' : 'text-yellow-400 font-bold'}>
                {money.toFixed(2)} €
              </span>
              {activePlants > 0 && (
                <span className="text-green-500 hidden sm:inline">{activePlants} Pflanzen aktiv</span>
              )}
              {readyPlants > 0 && (
                <span className="text-cyan-400 animate-pulse hidden sm:inline">{readyPlants}× verkaufsbereit!</span>
              )}

              {/* Countdown */}
              <div className="flex items-center gap-1.5 bg-gray-900 border border-gray-800 rounded px-2 py-1">
                <span className="text-gray-500">⏱</span>
                <span className={`font-mono font-bold tabular-nums ${isUrgent ? 'countdown-urgent' : 'text-green-400'}`}>
                  {formatCountdown(remaining)}
                </span>
              </div>

              {/* End Day Button */}
              <button
                onClick={endDay}
                className="flex items-center gap-1 text-xs bg-yellow-900/40 hover:bg-yellow-800/60 border border-yellow-700/60 hover:border-yellow-600 text-yellow-400 px-3 py-1.5 rounded font-bold transition-colors"
                title="Tag sofort beenden"
              >
                <span>⏭</span>
                <span className="hidden sm:inline">Tag beenden</span>
              </button>
            </div>
          )}
        </div>

        {/* Tabs */}
        {started && (
          <div className="flex gap-1 pb-0">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2 text-xs font-mono uppercase tracking-wide border-b-2 transition-colors ${
                  tab === t.id
                    ? 'border-green-500 text-green-400'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
