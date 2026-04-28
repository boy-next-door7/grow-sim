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

// Single-slot equipment categories (one item at a time)
const SINGLE_SLOT = ['tent', 'lamp', 'exhaust', 'fan', 'filter', 'nutrients'];

function ItemCard({ item, category, equipped, owned, onBuy, onSell, money }) {
  const canAfford = money >= item.price;
  const isEquipped = equipped && equipped.id === item.id;
  const isOwned = owned;
  const refund = Math.floor(item.price / 2);

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
        <div className="space-y-2">
          <div className={`text-center text-xs py-1 rounded border ${statusStyle}`}>{statusLabel}</div>
          {/* Sell button for owned/active items */}
          {onSell && (
            <button
              onClick={() => onSell(item)}
              className="w-full text-xs py-1.5 rounded border border-orange-700/60 bg-orange-900/20 hover:bg-orange-800/30 text-orange-400 transition-colors font-bold"
            >
              💰 Verkaufen ({refund} €)
            </button>
          )}
        </div>
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

function OwnedPotsList({ pots, onSell, plants }) {
  if (pots.length === 0) return null;

  return (
    <div className="mb-4 bg-gray-900/50 border border-gray-800 rounded-lg p-4">
      <div className="text-xs text-gray-500 uppercase tracking-wide mb-3">🪴 Meine Töpfe</div>
      <div className="space-y-2">
        {pots.map((pot, index) => {
          const occupied = plants.some(p => p.potIndex === index && !['ready'].includes(p.phase));
          const refund = Math.floor(pot.price / 2);
          return (
            <div key={index} className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded px-3 py-2">
              <div>
                <span className="text-xs text-gray-300">{pot.name}</span>
                <span className="text-xs text-gray-600 ml-2">Slot {index + 1}</span>
                {occupied && <span className="text-xs text-red-500 ml-2">• belegt</span>}
              </div>
              <button
                onClick={() => onSell(index)}
                disabled={occupied}
                className={`text-xs px-3 py-1 rounded font-bold transition-colors ${
                  occupied
                    ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                    : 'bg-orange-900/30 hover:bg-orange-800/40 border border-orange-700/60 text-orange-400'
                }`}
              >
                {occupied ? 'Belegt' : `Verkaufen (${refund}€)`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Shop() {
  const [activeCat, setActiveCat] = useState('tent');
  const money = useGameStore(s => s.money);
  const equipment = useGameStore(s => s.equipment);
  const plants = useGameStore(s => s.plants);
  const buyEquipment = useGameStore(s => s.buyEquipment);
  const buyTool = useGameStore(s => s.buyTool);
  const buyPot = useGameStore(s => s.buyPot);
  const sellEquipment = useGameStore(s => s.sellEquipment);
  const sellTool = useGameStore(s => s.sellTool);
  const sellPot = useGameStore(s => s.sellPot);

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

  function handleSell(item) {
    if (activeCat === 'tool') {
      sellTool(item.id);
    } else if (SINGLE_SLOT.includes(activeCat)) {
      sellEquipment(activeCat);
    }
  }

  function isOwned(item) {
    if (activeCat === 'tool') return equipment.tools.includes(item.id);
    if (activeCat === 'pot') return false;
    return false;
  }

  function canSell(item) {
    if (activeCat === 'tool') return equipment.tools.includes(item.id);
    if (SINGLE_SLOT.includes(activeCat)) {
      return equipment[activeCat]?.id === item.id;
    }
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

      {/* Sell hint */}
      <div className="flex items-center gap-2 text-xs text-orange-400/70 bg-orange-900/10 border border-orange-900/30 rounded px-3 py-2">
        <span>💰</span>
        <span>Ausrüstung kann für 50% des Kaufpreises weiterverkauft werden.</span>
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

          {/* Owned pots list with sell buttons */}
          {activeCat === 'pot' && (
            <OwnedPotsList pots={equipment.pots} onSell={sellPot} plants={plants} />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {cat.items.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                category={activeCat}
                equipped={equipment[activeCat]}
                owned={isOwned(item)}
                onBuy={handleBuy}
                onSell={canSell(item) ? handleSell : null}
                money={money}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
