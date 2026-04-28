import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import {
  TENTS, LAMPS, EXHAUSTS, FANS, FILTERS, POTS, NUTRIENTS, TOOLS,
} from '../data/equipment';

const CATEGORIES = [
  { id: 'tent', label: 'Zelte', icon: '🏕️', items: TENTS },
  { id: 'lamp', label: 'Lampen', icon: '💡', items: LAMPS },
  { id: 'exhaust', label: 'Abluft', icon: '🌀', items: EXHAUSTS },
  { id: 'fan', label: 'Ventilatoren', icon: '💨', items: FANS },
  { id: 'filter', label: 'Filter', icon: '🫧', items: FILTERS },
  { id: 'pot', label: 'Töpfe', icon: '🪴', items: POTS },
  { id: 'nutrients', label: 'Dünger', icon: '🧪', items: NUTRIENTS },
  { id: 'tool', label: 'Werkzeuge', icon: '🔧', items: TOOLS },
];

function ItemCard({ item, category, equipped, owned, onBuy, money }) {
  const canAfford = money >= item.price;
  const isEquipped = equipped && equipped.id === item.id;
  const isOwned = owned;

  let statusLabel = null;
  let statusStyle = '';
  if (isEquipped) { statusLabel = 'Aktiv'; statusStyle = 'bg-green-900/50 text-green-400 border-green-700'; }
  else if (isOwned) { statusLabel = 'Vorhanden'; statusStyle = 'bg-gray-800 text-gray-500 border-gray-700'; }

  return (
    <div className={`bg-gray-900 border rounded-lg p-4 space-y-2 transition-all ${
      isEquipped ? 'border-green-700/60' : 'border-gray-800 hover:border-gray-600'
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-bold text-gray-200">{item.name}</div>
          <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-yellow-400 font-bold text-sm">{item.price} €</div>
          {item.watt > 0 && <div className="text-xs text-gray-600">{item.watt}W</div>}
        </div>
      </div>

      {/* Specs */}
      <div className="flex flex-wrap gap-2 text-xs">
        {item.maxPlants && <span className="bg-gray-800 px-2 py-0.5 rounded text-gray-400">max {item.maxPlants} Pflanzen</span>}
        {item.heat && <span className="bg-gray-800 px-2 py-0.5 rounded text-orange-400">+{item.heat}°C Wärme</span>}
        {item.ppfd && <span className="bg-gray-800 px-2 py-0.5 rounded text-yellow-400">PPFD ×{item.ppfd}</span>}
        {item.cooling && <span className="bg-gray-800 px-2 py-0.5 rounded text-blue-400">-{item.cooling}°C Kühlung</span>}
        {item.dehumid && <span className="bg-gray-800 px-2 py-0.5 rounded text-blue-300">-{item.dehumid}% LF</span>}
        {item.qualityMult && <span className="bg-gray-800 px-2 py-0.5 rounded text-green-400">×{item.qualityMult} Qualität</span>}
        {item.qualityBonus && <span className="bg-gray-800 px-2 py-0.5 rounded text-green-400">+{item.qualityBonus}% Qualität</span>}
        {item.yieldFactor && <span className="bg-gray-800 px-2 py-0.5 rounded text-purple-400">×{item.yieldFactor} Ertrag</span>}
        {item.yieldBonus && <span className="bg-gray-800 px-2 py-0.5 rounded text-purple-400">+{(item.yieldBonus * 100).toFixed(0)}% Ertrag</span>}
        {item.required && <span className="bg-red-900/40 px-2 py-0.5 rounded text-red-400">Pflicht</span>}
        {item.liters && <span className="bg-gray-800 px-2 py-0.5 rounded text-gray-400">{item.liters}L</span>}
      </div>

      {statusLabel ? (
        <div className={`text-center text-xs py-1 rounded border ${statusStyle}`}>{statusLabel}</div>
      ) : (
        <button
          onClick={() => onBuy(item)}
          disabled={!canAfford}
          className={`w-full text-xs py-2 rounded font-bold uppercase tracking-wide transition-colors ${
            canAfford
              ? 'bg-green-800 hover:bg-green-700 text-white'
              : 'bg-gray-800 text-gray-600 cursor-not-allowed'
          }`}
        >
          {canAfford ? 'Kaufen' : 'Zu teuer'}
        </button>
      )}
    </div>
  );
}

export default function Shop() {
  const [activeCat, setActiveCat] = useState('tent');
  const money = useGameStore(s => s.money);
  const equipment = useGameStore(s => s.equipment);
  const buyEquipment = useGameStore(s => s.buyEquipment);
  const buyTool = useGameStore(s => s.buyTool);
  const buyPot = useGameStore(s => s.buyPot);

  const cat = CATEGORIES.find(c => c.id === activeCat);

  function handleBuy(item) {
    if (activeCat === 'tool') {
      buyTool(item);
    } else if (activeCat === 'pot') {
      buyPot(item);
    } else {
      buyEquipment(activeCat, item);
    }
  }

  function isOwned(item) {
    if (activeCat === 'tool') return equipment.tools.includes(item.id);
    if (activeCat === 'pot') return false; // multiple allowed
    return false;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
      {/* Budget */}
      <div className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-lg px-5 py-3">
        <span className="text-xs text-gray-500 uppercase tracking-wide">Verfügbares Budget</span>
        <span className={`font-bold text-lg ${money < 200 ? 'text-red-400' : 'text-yellow-400'}`}>
          {money.toFixed(2)} €
        </span>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(c => (
          <button
            key={c.id}
            onClick={() => setActiveCat(c.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-colors ${
              activeCat === c.id
                ? 'bg-green-900/50 border border-green-700 text-green-400'
                : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-gray-200'
            }`}
          >
            <span>{c.icon}</span>
            <span>{c.label}</span>
            {c.id === 'tent' && equipment.tent && <span className="text-green-500">✓</span>}
            {c.id === 'lamp' && equipment.lamp && <span className="text-green-500">✓</span>}
            {c.id === 'exhaust' && equipment.exhaust && <span className="text-green-500">✓</span>}
            {c.id === 'pot' && equipment.pots.length > 0 && <span className="text-green-500">{equipment.pots.length}</span>}
            {c.id === 'nutrients' && equipment.nutrients && <span className="text-green-500">✓</span>}
            {c.id === 'tool' && equipment.tools.length > 0 && <span className="text-green-500">{equipment.tools.length}</span>}
          </button>
        ))}
      </div>

      {/* Items */}
      {cat && (
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-3">
            {cat.icon} {cat.label}
            {activeCat === 'pot' && (
              <span className="ml-2 text-gray-600">
                ({equipment.pots.length}/{equipment.tent?.maxPlants ?? 0} im Zelt)
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {cat.items.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                category={activeCat}
                equipped={equipment[activeCat]}
                owned={isOwned(item)}
                onBuy={handleBuy}
                money={money}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
