import { useGameStore } from '../store/gameStore';
import { calcDailyElectricity } from '../utils/climate';

function StatRow({ label, value, color = 'text-gray-200' }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0">
      <span className="text-xs text-gray-500">{label}</span>
      <span className={`text-sm font-bold ${color}`}>{value}</span>
    </div>
  );
}

export default function Finances() {
  const money = useGameStore(s => s.money);
  const day = useGameStore(s => s.day);
  const totalSpent = useGameStore(s => s.totalSpent);
  const totalRevenue = useGameStore(s => s.totalRevenue);
  const electricityAccrued = useGameStore(s => s.electricityAccrued);
  const transactions = useGameStore(s => s.transactions);
  const equipment = useGameStore(s => s.equipment);
  const settings = useGameStore(s => s.settings);
  const plants = useGameStore(s => s.plants);

  const dailyElec = calcDailyElectricity(equipment, settings);
  const activePlants = plants.filter(p => !['drying','curing','ready'].includes(p.phase)).length;
  const dailyWater = activePlants * 0.5;
  const dailyCost = dailyElec + dailyWater;
  const profit = totalRevenue - totalSpent;

  // Days until broke
  const daysUntilBroke = dailyCost > 0 ? Math.floor((money + 500) / dailyCost) : Infinity;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Zusammenfassung */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 space-y-1">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-3">Finanzübersicht</div>
          <StatRow label="Kontostand" value={`${money.toFixed(2)} €`} color={money < 200 ? 'text-red-400' : 'text-yellow-400'} />
          <StatRow label="Gesamtausgaben" value={`${totalSpent.toFixed(2)} €`} color="text-red-400" />
          <StatRow label="Gesamteinnahmen" value={`${totalRevenue.toFixed(2)} €`} color="text-green-400" />
          <StatRow label="Gewinn/Verlust" value={`${profit >= 0 ? '+' : ''}${profit.toFixed(2)} €`} color={profit >= 0 ? 'text-green-400' : 'text-red-400'} />
          <div className="pt-3 border-t border-gray-800">
            <StatRow label="Tageskosten (aktuell)" value={`${dailyCost.toFixed(2)} €/Tag`} color="text-orange-400" />
            <StatRow label="Akkumulierter Strom" value={`${electricityAccrued.toFixed(2)} €`} color="text-orange-300" />
            {daysUntilBroke < 60 && (
              <StatRow
                label="Reichweite"
                value={daysUntilBroke === Infinity ? '∞' : `${daysUntilBroke} Tage`}
                color={daysUntilBroke < 14 ? 'text-red-400' : 'text-yellow-400'}
              />
            )}
          </div>
        </div>

        {/* Tageskosten-Aufschlüsselung */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-3">Tägliche Betriebskosten</div>
          <div className="space-y-2">
            {equipment.lamp && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Lampe ({equipment.lamp.name}, {settings.lampHours}h)</span>
                <span className="text-orange-400">{((equipment.lamp.watt * settings.lampHours / 1000) * 0.35).toFixed(2)} €</span>
              </div>
            )}
            {equipment.exhaust && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Abluft ({settings.exhaustSpeed}%)</span>
                <span className="text-orange-400">{((equipment.exhaust.watt * settings.exhaustSpeed / 100 * 24 / 1000) * 0.35).toFixed(2)} €</span>
              </div>
            )}
            {equipment.fan && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Ventilator (24h)</span>
                <span className="text-orange-400">{((equipment.fan.watt * 24 / 1000) * 0.35).toFixed(2)} €</span>
              </div>
            )}
            {activePlants > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Wasser ({activePlants} Pflanzen)</span>
                <span className="text-blue-400">{dailyWater.toFixed(2)} €</span>
              </div>
            )}
            <div className="border-t border-gray-800 pt-2 flex justify-between text-xs font-bold">
              <span className="text-gray-300">Gesamt/Tag</span>
              <span className="text-red-400">{dailyCost.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-xs font-bold">
              <span className="text-gray-300">Gesamt/Monat (30 Tage)</span>
              <span className="text-red-400">{(dailyCost * 30).toFixed(2)} €</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-800">
            <div className="text-xs text-gray-500 mb-2">Strompreis: 0,35 €/kWh</div>
            <div className="text-xs text-gray-500">
              Tages-kWh: {((
                (equipment.lamp?.watt ?? 0) * settings.lampHours +
                (equipment.exhaust?.watt ?? 0) * (settings.exhaustSpeed / 100) * 24 +
                (equipment.fan?.watt ?? 0) * 24
              ) / 1000).toFixed(2)} kWh
            </div>
          </div>
        </div>
      </div>

      {/* Transaktionshistorie */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <div className="text-xs text-gray-500 uppercase tracking-wide mb-3">Transaktionshistorie</div>
        {transactions.length === 0 ? (
          <div className="text-xs text-gray-600 text-center py-4">Noch keine Transaktionen</div>
        ) : (
          <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
            {[...transactions].reverse().map((t, i) => (
              <div key={i} className="flex justify-between items-center text-xs py-1 border-b border-gray-800/50 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-gray-600 w-12">Tag {t.day}</span>
                  <span className="text-gray-400">{t.desc}</span>
                </div>
                <span className={t.amount >= 0 ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                  {t.amount >= 0 ? '+' : ''}{t.amount.toFixed(2)} €
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
