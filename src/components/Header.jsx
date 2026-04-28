import { useGameStore } from '../store/gameStore';

export default function Header({ tab, setTab }) {
  const day = useGameStore(s => s.day);
  const money = useGameStore(s => s.money);
  const started = useGameStore(s => s.started);
  const plants = useGameStore(s => s.plants);

  const activePlants = plants.filter(p => !['ready'].includes(p.phase)).length;
  const readyPlants = plants.filter(p => p.phase === 'ready').length;

  const tabs = [
    { id: 'overview', label: 'Übersicht' },
    { id: 'growroom', label: 'Grow Room' },
    { id: 'climate', label: 'Klima' },
    { id: 'shop', label: 'Shop' },
    { id: 'finances', label: 'Finanzen' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-gray-950 border-b border-green-900/50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-12">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <span className="text-green-400 text-xl">🌿</span>
            <span className="text-green-400 font-bold tracking-widest text-sm uppercase">GrowSim</span>
          </div>

          {/* Stats */}
          {started && (
            <div className="flex items-center gap-6 text-xs">
              <span className="text-gray-400">
                Tag <span className="text-green-400 font-bold">{day}</span>
              </span>
              <span className={money < 100 ? 'text-red-400 font-bold' : 'text-yellow-400 font-bold'}>
                {money.toFixed(2)} €
              </span>
              {activePlants > 0 && (
                <span className="text-green-500">{activePlants} Pflanzen aktiv</span>
              )}
              {readyPlants > 0 && (
                <span className="text-cyan-400 animate-pulse">{readyPlants}× verkaufsbereit!</span>
              )}
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
