import { useState } from 'react';
import { useGameStore } from '../store/gameStore';

const TYPE = {
  info:    { icon: 'ℹ️', text: 'text-blue-300',   bg: 'bg-blue-950/60',    border: 'border-blue-800/50',   dot: '#60a5fa' },
  success: { icon: '✅', text: 'text-green-300',  bg: 'bg-green-950/60',   border: 'border-green-800/50',  dot: '#4ade80' },
  error:   { icon: '🚨', text: 'text-red-300',    bg: 'bg-red-950/60',     border: 'border-red-800/50',    dot: '#f87171' },
  warn:    { icon: '⚠️', text: 'text-yellow-300', bg: 'bg-yellow-950/60',  border: 'border-yellow-800/50', dot: '#fbbf24' },
};

function useAdvisory() {
  const plants = useGameStore(s => s.plants);
  const rooms  = useGameStore(s => s.rooms);
  const money  = useGameStore(s => s.money);

  const tips = [];

  const veryDry = plants.filter(p => !['drying','curing','ready'].includes(p.phase) && (p.daysUnwatered ?? 0) >= 3);
  const dry     = plants.filter(p => !['drying','curing','ready'].includes(p.phase) && (p.daysUnwatered ?? 0) === 2);
  const thirsty = plants.filter(p => !['drying','curing','ready'].includes(p.phase) && (p.daysUnwatered ?? 0) === 1);
  if (veryDry.length) tips.push({ msg: `${veryDry.length} Pflanze(n) verdorren — sofort gießen!`, type: 'error' });
  else if (dry.length) tips.push({ msg: `${dry.length} Pflanze(n) dringend wässern (${dry[0].daysUnwatered}d)`, type: 'warn' });
  else if (thirsty.length) tips.push({ msg: `${thirsty.length} Pflanze(n) heute gießen`, type: 'info' });

  const ready = plants.filter(p => p.phase === 'ready');
  if (ready.length) tips.push({ msg: `${ready.length}× Ernte verkaufsbereit!`, type: 'success' });

  const hr = plants.filter(p => p.phase === 'harvest_ready');
  if (hr.length) tips.push({ msg: `${hr.length}× erntereif — jetzt ernten!`, type: 'warn' });

  if (money < 100)      tips.push({ msg: `Kontostand kritisch: ${money.toFixed(2)} €`, type: 'error' });
  else if (money < 300) tips.push({ msg: `Kontostand niedrig: ${money.toFixed(2)} €`, type: 'warn' });

  rooms.forEach(r => {
    if (!r.lamp || !r.exhaust) return;
    const c = r.climate;
    const name = r.tent?.name ?? 'Zimmer';
    if (c.temperature > 30) tips.push({ msg: `Zu heiß in ${name}: ${c.temperature.toFixed(1)}°C`, type: 'warn' });
    if (c.humidity > 78)    tips.push({ msg: `Schimmelgefahr in ${name}: ${c.humidity.toFixed(1)}%`, type: 'warn' });
    if (c.humidity < 30)    tips.push({ msg: `Zu trocken in ${name}: ${c.humidity.toFixed(1)}%`, type: 'warn' });
  });

  if (!rooms.some(r => r.tent && r.lamp && r.exhaust))
    tips.push({ msg: 'Kein Setup — kaufe Zelt, Lampe & Abluft im Shop', type: 'info' });

  return tips;
}

export default function StatusBar() {
  const notifications = useGameStore(s => s.notifications);
  const [expanded, setExpanded] = useState(false);

  const advisory = useAdvisory();
  const latest   = notifications[notifications.length - 1];
  const log      = [...notifications].reverse();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-950 border-t border-gray-800/80 shadow-2xl">
      <div className="max-w-7xl mx-auto px-3">

        {/* Chatbox log — expands upward */}
        {expanded && (
          <div className="border-b border-gray-800 py-2">
            <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 flex flex-col-reverse">
              {log.length === 0 ? (
                <div className="text-xs text-gray-600 text-center py-3 italic">Noch keine Einträge</div>
              ) : (
                log.slice(0, 50).map(n => {
                  const s = TYPE[n.type] ?? TYPE.info;
                  return (
                    <div key={n.id} className={`flex items-start gap-2 text-xs px-3 py-1.5 rounded-lg border ${s.bg} ${s.border}`}>
                      <span className="shrink-0 mt-px">{s.icon}</span>
                      <span className={`flex-1 ${s.text}`}>{n.msg}</span>
                      {n.day != null && (
                        <span className="shrink-0 text-gray-600 tabular-nums">T{n.day}</span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Status bar */}
        <div className="flex items-center gap-2 py-1.5 min-h-[36px]">

          {/* Advisory / latest message */}
          <div className="flex-1 flex items-center gap-2 overflow-hidden min-w-0">
            {advisory.length > 0 ? (
              advisory.slice(0, 3).map((tip, i) => {
                const s = TYPE[tip.type] ?? TYPE.info;
                return (
                  <div key={i} className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border shrink-0 ${s.bg} ${s.border}`}>
                    <span className="text-[10px]">{s.icon}</span>
                    <span className={`${s.text} whitespace-nowrap`}>{tip.msg}</span>
                  </div>
                );
              })
            ) : latest ? (
              <div className={`flex items-center gap-1.5 text-xs ${(TYPE[latest.type] ?? TYPE.info).text} truncate`}>
                <span>{(TYPE[latest.type] ?? TYPE.info).icon}</span>
                <span className="truncate">{latest.msg}</span>
              </div>
            ) : (
              <span className="text-xs text-gray-700 italic">Alles in Ordnung 🌿</span>
            )}
          </div>

          {/* Toggle button */}
          <button
            onClick={() => setExpanded(e => !e)}
            className="shrink-0 flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 px-2 py-1 rounded hover:bg-gray-800/60 transition-colors"
            title="Log öffnen"
          >
            <span className="text-gray-600">📋</span>
            <span className="text-gray-700 hidden sm:inline">{notifications.length}</span>
            <span className="text-gray-600">{expanded ? '▼' : '▲'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
