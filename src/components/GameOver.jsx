import { useGameStore } from '../store/gameStore';

export default function GameOver() {
  const day = useGameStore(s => s.day);
  const totalRevenue = useGameStore(s => s.totalRevenue);
  const totalSpent = useGameStore(s => s.totalSpent);
  const resetGame = useGameStore(s => s.resetGame);
  const startGame = useGameStore(s => s.startGame);

  function handleRestart() {
    resetGame();
    setTimeout(() => startGame(), 50);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="text-center max-w-md px-6">
        <div className="text-8xl mb-6">💸</div>
        <h2 className="text-3xl font-bold text-red-400 tracking-widest mb-2 uppercase">Game Over</h2>
        <p className="text-gray-500 text-sm mb-6">Du bist bankrott gegangen.</p>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 mb-6 text-left space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Überlebt bis Tag</span>
            <span className="text-green-400 font-bold">{day}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Gesamteinnahmen</span>
            <span className="text-yellow-400 font-bold">{totalRevenue.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Gesamtausgaben</span>
            <span className="text-red-400 font-bold">{totalSpent.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between text-sm border-t border-gray-800 pt-2">
            <span className="text-gray-400">Ergebnis</span>
            <span className={totalRevenue - totalSpent >= 0 ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
              {(totalRevenue - totalSpent).toFixed(2)} €
            </span>
          </div>
        </div>

        <button
          onClick={handleRestart}
          className="bg-green-700 hover:bg-green-600 text-white font-bold px-10 py-3 rounded-lg tracking-widest uppercase text-sm transition-colors"
        >
          Nochmal versuchen
        </button>
      </div>
    </div>
  );
}
