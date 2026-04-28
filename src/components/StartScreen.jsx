import { useGameStore } from '../store/gameStore';

export default function StartScreen() {
  const startGame = useGameStore(s => s.startGame);
  const resetGame = useGameStore(s => s.resetGame);

  function handleStart() {
    resetGame();
    setTimeout(() => startGame(), 50);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="text-center max-w-lg px-6">
        <div className="text-8xl mb-6">🌿</div>
        <h1 className="text-4xl font-bold text-green-400 tracking-widest mb-2 uppercase">GrowSim</h1>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          Cannabis Anbau-Simulator. Starte mit <span className="text-yellow-400 font-bold">1000 €</span>,
          baue dein Setup auf, kultiviere, trockne, cure und verkaufe.
          Bezahle deine Stromrechnung. Werde zum Profi-Grower.
        </p>

        <div className="bg-gray-900 border border-green-900/50 rounded-lg p-5 mb-8 text-left text-xs space-y-2">
          <div className="flex items-start gap-3">
            <span className="text-green-400 mt-0.5">▸</span>
            <span className="text-gray-300"><span className="text-green-400">8 Minuten</span> Echtzeit = 1 Spieltag</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-green-400 mt-0.5">▸</span>
            <span className="text-gray-300">Kaufe <span className="text-green-400">Zelt, Lampe, Lüfter, Abluft, Töpfe, Dünger</span> & Werkzeuge</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-green-400 mt-0.5">▸</span>
            <span className="text-gray-300">Jede Wachstumsphase hat <span className="text-green-400">spezifische Klima-Anforderungen</span></span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-green-400 mt-0.5">▸</span>
            <span className="text-gray-300">Elektrische Komponenten sind <span className="text-green-400">einstellbar</span> – steuere Temperatur & Luftfeuchtigkeit</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-green-400 mt-0.5">▸</span>
            <span className="text-gray-300">Ernte, trockne, cure → <span className="text-green-400">bis 12 €/g</span> bei Top-Qualität</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-red-400 mt-0.5">▸</span>
            <span className="text-gray-300">Bankrott bei <span className="text-red-400">-500 €</span> = Game Over</span>
          </div>
        </div>

        <button
          onClick={handleStart}
          className="bg-green-700 hover:bg-green-600 text-white font-bold px-10 py-3 rounded-lg tracking-widest uppercase text-sm transition-colors shadow-lg shadow-green-900/50"
        >
          Spiel starten
        </button>
      </div>
    </div>
  );
}
