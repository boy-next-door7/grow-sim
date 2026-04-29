import { useState } from 'react';
import { useGameStore } from '../store/gameStore';

const TYPE = {
  info:    { text: 'text-blue-300',   dot: '#60a5fa', bg: 'bg-blue-900/30',   border: 'border-blue-700/40' },
  success: { text: 'text-green-300',  dot: '#4ade80', bg: 'bg-green-900/30',  border: 'border-green-700/40' },
  error:   { text: 'text-red-300',    dot: '#f87171', bg: 'bg-red-900/30',    border: 'border-red-700/40' },
  warn:    { text: 'text-yellow-300', dot: '#fbbf24', bg: 'bg-yellow-900/30', border: 'border-yellow-700/40' },
};

function useAdvisory() {
  const plants = useGameStore(s => s.plants);
  const rooms  = useGameStore(s => s.rooms);
  const money  = useGameStore(s => s.money);

  const tips = [];

  // Water urgency
  const veryDry = plants.filter(p => !['drying','curing','ready'].includes(p.phase) && (p.daysUnwatered ?? 0) >= 3);
  const dry     = plants.filter(p => !['drying','curing','ready'].includes(p.phase) && (p.daysUnwatered ?? 0) === 2);
  const thirsty = plants.filter(p => !['drying','curing','ready'].includes(p.phase) && (p.daysUnwatered ?? 0) === 1);
  if (veryDry.length) tips.push({ msg: `${veryDry.length} Pflanze(n) verdorren — sofort gießen! (${veryDry[0].daysUnwatered}d trocken)`, type: 'error' });
  else if (dry.length) tips.push({ msg: `${dry.length} Pflanze(n) dringend wässern (${dry[0].daysUnwatered}d)`, type: 'warn' });
  else if (thirsty.length) tips.push({ msg: `${thirsty.length} Pflanze(n) heute gießen`, type: 'info' });

  // Ready to sell
  const ready = plants.filter(p => p.phase === 'ready');
  if (ready.length) tips.push({ msg: `${ready.length}× Ernte verkaufsbereit — im Grow Room verkaufen!`, type: 'success' });

  // Harvest ready
  const hr = plants.filter(p => p.phase === 'harvest_ready');
  if (hr.length) tips.push({ msg: `${hr.length}× erntereif — jetzt ernten!`, type: 'warn' });

  // Money
  if (money < 100)       tips.push({ msg: `Kontostand kritisch: ${money.toFixed(2)} €`, type: 'error' });
  else if (money < 300)  tips.push({ msg: `Kontostand niedrig: ${money.toFixed(2)} €`, type: 'warn' });

  // Climate per room
  rooms.forEach(r => {
    if (!r.lamp || !r.exhaust) return;
    const c = r.climate;
    const name = r.tent?.name ?? 'Zimmer';
    if (c.temperature > 30) tips.push({ msg: `Zu heiß in ${name}: ${c.temperature.toFixed(1)}°C — Abluft erhöhen`, type: 'warn' });
    if (c.humidity > 78)    tips.push({ msg: `Zu feucht in ${name}: ${c.humidity.toFixed(1)}% — Schimmelgefahr!`, type: 'warn' });
    if (c.humidity < 30)    tips.push({ msg: `Zu trocken in ${name}: ${c.humidity.toFixed(1)}%`, type: 'warn' });
  });

  // Setup hint
  if (!rooms.some(r => r.tent && r.lamp && r.exhaust)) {
    tips.push({ msg: 'Kein vollständiges Setup — kaufe Zelt, Lampe und Abluft im Shop', type: 'info' });
  }

  return tips;
}

export default function StatusBar() {
  const notifications = useGameStore(s => s.notifications);
  const [expanded, setExpanded]   = useState(false);

  const advisory = useAdvisory();
  const latest   = notifications[notifications.length - 1];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-950/97 border-t border-gray-800 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4">

        {/* Expanded log */}
        {expanded && notifications.length > 0 && (
          <div className="py-2 max-h-44 overflow-y-auto space-y-1 border-b border-gray-800">
            {[...notifications].reverse().slice(0, 30).map(n => {
              const s = TYPE[n.type] ?? TYPE.info;
              return (
                <div key={n.id} className={`flex items-center gap-2 text-xs px-2 py-1 rounded border ${s.bg} ${s.border}`}>
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.dot }} />
                  <span className={s.text}>{n.msg}</span>
                </div>
              );
            })}
            {notifications.length === 0 && (
              <div className="text-xs text-gray-600 px-2 py-1">Kein Log-Eintrag vorhanden.</div>
            )}
          </div>
        )}

        {/* Main bar */}
        <div className="flex items-center gap-2 py-1.5 min-h-[38px]">

          {/* Advisory chips */}
          <div className="flex-1 flex items-center gap-2 overflow-hidden min-w-0">
            {advisory.length > 0 ? (
              advisory.slice(0, 3).map((tip, i) => {
                const s = TYPE[tip.type] ?? TYPE.info;
                return (
                  <div key={i}
                    className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded border shrink-0 ${s.bg} ${s.border}`}>
                    <div className="w-1 h-1 rounded-full" style={{ background: s.dot }} />
                    <span className={`${s.text} whitespace-nowrap`}>{tip.msg}</span>
                  </div>
                );
              })
            ) : latest ? (
              <div className={`flex items-center gap-1.5 text-xs ${(TYPE[latest.type] ?? TYPE.info).text}`}>
                <span className="text-gray-600">►</span>
                <span className="truncate">{latest.msg}</span>
              </div>
            ) : (
              <span className="text-xs text-gray-700">Alles in Ordnung — gute Ernte! 🌿</span>
            )}
          </div>

          {/* Log toggle */}
          <button
            onClick={() => setExpanded(e => !e)}
            className="shrink-0 flex items-center gap-1 text-xs text-gray-600 hover:text-gray-400 px-2 py-1 rounded hover:bg-gray-900 transition-colors"
            title="Nachrichten-Log öffnen"
          >
            <span>📋</span>
            <span className="hidden sm:inline text-gray-700">{notifications.length}</span>
            <span>{expanded ? '▼' : '▲'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
