import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import {
  TENTS, LAMPS, EXHAUSTS, FANS, FILTERS, POTS,
  NUTRIENTS, TOOLS, SEEDS, SUBSTRATES, DRIP_SYSTEMS, CONTROLLERS,
} from '../data/equipment';

const CATEGORIES = [
  { id: 'tent',       label: 'Zelte',        icon: '🏕️' },
  { id: 'lamp',       label: 'Lampen',       icon: '💡' },
  { id: 'exhaust',    label: 'Abluft',       icon: '🌀' },
  { id: 'fan',        label: 'Ventilatoren', icon: '💨' },
  { id: 'filter',     label: 'Filter',       icon: '🫧' },
  { id: 'pot',        label: 'Töpfe',        icon: '🪴' },
  { id: 'drip',       label: 'Bewässerung',  icon: '💧' },
  { id: 'controller', label: 'Controller',   icon: '🤖' },
  { id: 'seeds',      label: 'Samen',        icon: '🌱' },
  { id: 'substrate',  label: 'Substrat',     icon: '🪨' },
  { id: 'nutrients',  label: 'Dünger',       icon: '🧪' },
  { id: 'tool',       label: 'Werkzeuge',    icon: '🔧' },
];

const EQUIP_ITEMS = {
  tent: TENTS, lamp: LAMPS, exhaust: EXHAUSTS, fan: FANS, filter: FILTERS,
  drip: DRIP_SYSTEMS, controller: CONTROLLERS,
};

// ── Equipment (single-slot per room) ──────────────────────
function EquipCard({ item, equipped, onBuy, onSell, money }) {
  const canAfford = money >= item.price;
  const isEquipped = equipped?.id === item.id;
  const refund = Math.floor(item.price / 2);
  return (
    <div className={`bg-gray-900 border rounded-lg p-4 space-y-2 transition-all ${isEquipped ? 'border-green-700/60' : 'border-gray-800 hover:border-gray-600'}`}>
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
      <div className="flex flex-wrap gap-1.5 text-xs">
        {item.maxPlants  && <span className="bg-gray-800 px-2 py-0.5 rounded text-gray-400">max {item.maxPlants} Pfl.</span>}
        {item.heat       && <span className="bg-gray-800 px-2 py-0.5 rounded text-orange-400">+{item.heat}°C</span>}
        {item.ppfd       && <span className="bg-gray-800 px-2 py-0.5 rounded text-yellow-400">PPFD ×{item.ppfd}</span>}
        {item.dimmable !== undefined && (
          <span className={`px-2 py-0.5 rounded ${item.dimmable ? 'bg-green-900/40 text-green-400' : 'bg-gray-800 text-gray-500'}`}>
            {item.dimmable ? 'dimmbar' : 'fest 100%'}
          </span>
        )}
        {item.cooling    && <span className="bg-gray-800 px-2 py-0.5 rounded text-blue-400">-{item.cooling}°C</span>}
        {item.dehumid    && <span className="bg-gray-800 px-2 py-0.5 rounded text-blue-300">-{item.dehumid}% LF</span>}
        {item.waterEvery && <span className="bg-blue-900/40 px-2 py-0.5 rounded text-blue-300">💧 alle {item.waterEvery}d</span>}
        {item.autoClimate === true  && <span className="bg-green-900/40 px-2 py-0.5 rounded text-green-400">🤖 Smart-Auto</span>}
        {item.autoClimate === false && item.qualityBonus && <span className="bg-gray-800 px-2 py-0.5 rounded text-gray-400">Timer</span>}
        {item.qualityBonus && <span className="bg-green-900/30 px-2 py-0.5 rounded text-green-500">+{item.qualityBonus}/Tag Qual.</span>}
      </div>
      {isEquipped ? (
        <div className="space-y-1.5">
          <div className="text-center text-xs py-1 rounded border bg-green-900/50 text-green-400 border-green-700">Aktiv</div>
          {onSell && (
            <button onClick={onSell}
              className="w-full text-xs py-1.5 rounded border border-orange-700/60 bg-orange-900/20 hover:bg-orange-800/30 text-orange-400 font-bold transition-colors">
              💰 Verkaufen ({refund} €)
            </button>
          )}
        </div>
      ) : (
        <button onClick={() => onBuy(item)} disabled={!canAfford}
          className={`w-full text-xs py-2 rounded font-bold uppercase tracking-wide transition-colors ${canAfford ? 'bg-green-800 hover:bg-green-700 text-white' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}>
          {canAfford ? 'Kaufen' : 'Zu teuer'}
        </button>
      )}
    </div>
  );
}

// ── Pots ──────────────────────────────────────────────────
function PotShopCard({ item, onBuy, money }) {
  const canAfford = money >= item.price;
  return (
    <div className="bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-lg p-4 space-y-2 transition-all">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-bold text-gray-200">{item.name}</div>
          <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
        </div>
        <div className="text-right shrink-0 text-yellow-400 font-bold text-sm">{item.price} €</div>
      </div>
      <div className="flex flex-wrap gap-1.5 text-xs">
        <span className="bg-gray-800 px-2 py-0.5 rounded text-gray-400">{item.liters}L</span>
        <span className="bg-purple-900/40 px-2 py-0.5 rounded text-purple-400">×{item.yieldFactor} Ertrag</span>
      </div>
      <button onClick={() => onBuy(item)} disabled={!canAfford}
        className={`w-full text-xs py-2 rounded font-bold uppercase tracking-wide transition-colors ${canAfford ? 'bg-green-800 hover:bg-green-700 text-white' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}>
        {canAfford ? 'Kaufen' : 'Zu teuer'}
      </button>
    </div>
  );
}

function OwnedPotsList({ roomId, pots, onSell, plants }) {
  if (pots.length === 0) return null;
  return (
    <div className="mb-4 bg-gray-900/50 border border-gray-800 rounded-lg p-4">
      <div className="text-xs text-gray-500 uppercase tracking-wide mb-3">🪴 Töpfe im aktiven Zimmer</div>
      <div className="space-y-2">
        {pots.map((pot, i) => {
          const occupied = plants.some(p => p.roomId === roomId && p.potIndex === i && p.phase !== 'ready');
          const refund = Math.floor(pot.price / 2);
          return (
            <div key={i} className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded px-3 py-2">
              <div>
                <span className="text-xs text-gray-300">{pot.name}</span>
                <span className="text-xs text-gray-600 ml-2">Slot {i + 1}</span>
                {occupied && <span className="text-xs text-red-500 ml-2">• belegt</span>}
              </div>
              <button onClick={() => onSell(roomId, i)} disabled={occupied}
                className={`text-xs px-3 py-1 rounded font-bold transition-colors ${occupied ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-orange-900/30 hover:bg-orange-800/40 border border-orange-700/60 text-orange-400'}`}>
                {occupied ? 'Belegt' : `Verkaufen (${refund}€)`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Seeds ─────────────────────────────────────────────────
function SeedCard({ strain, count, onBuy, money }) {
  const canAfford = money >= strain.price;
  return (
    <div className="bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-lg p-4 space-y-2 transition-all">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-bold" style={{ color: strain.color }}>{strain.name}</div>
          <div className="text-xs text-gray-500 mt-0.5">{strain.desc}</div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-yellow-400 font-bold text-sm">{strain.price} €</div>
          <div className="text-xs text-gray-600">pro Samen</div>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 text-xs">
        <span className="bg-gray-800 px-2 py-0.5 rounded text-gray-400">{strain.type === 'auto' ? 'Auto' : 'Foto'}</span>
        <span className="bg-gray-800 px-2 py-0.5 rounded text-pink-400">THC {strain.thc}%</span>
        <span className="bg-gray-800 px-2 py-0.5 rounded text-purple-400">{strain.yieldMin}–{strain.yieldMax}g</span>
        {strain.isHybrid && <span className="bg-purple-900/40 px-2 py-0.5 rounded text-purple-300">F1 Hybrid</span>}
      </div>
      <div className="flex items-center gap-2">
        <div className="text-xs text-gray-500">
          Lager: <span className={count > 0 ? 'text-green-400 font-bold' : 'text-gray-600'}>{count}×</span>
        </div>
        <button onClick={() => onBuy(strain.id)} disabled={!canAfford}
          className={`flex-1 text-xs py-2 rounded font-bold transition-colors ${canAfford ? 'bg-green-800 hover:bg-green-700 text-white' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}>
          {canAfford ? '+ Kaufen' : 'Zu teuer'}
        </button>
      </div>
    </div>
  );
}

// ── Substrate ─────────────────────────────────────────────
function SubstrateCard({ item, owned, onBuy, money }) {
  const canAfford = money >= item.price;
  return (
    <div className="bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-lg p-4 space-y-2 transition-all">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-bold text-amber-300">{item.name}</div>
          <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-yellow-400 font-bold text-sm">{item.price} €</div>
          <div className="text-xs text-gray-600">{item.liters}L/Sack</div>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 text-xs">
        {item.qualityBonus > 0 && (
          <span className="bg-green-900/40 px-2 py-0.5 rounded text-green-400">+{(item.qualityBonus * 100).toFixed(0)}% Qual./Tag</span>
        )}
        <span className="bg-gray-800 px-2 py-0.5 rounded text-gray-400">Drainage ×{item.drainageFactor}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="text-xs text-gray-500">
          Lager: <span className={owned > 0 ? 'text-amber-400 font-bold' : 'text-gray-600'}>{owned}L</span>
        </div>
        <button onClick={() => onBuy(item)} disabled={!canAfford}
          className={`flex-1 text-xs py-2 rounded font-bold transition-colors ${canAfford ? 'bg-amber-800 hover:bg-amber-700 text-white' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}>
          {canAfford ? '+ Kaufen' : 'Zu teuer'}
        </button>
      </div>
    </div>
  );
}

// ── Nutrients ─────────────────────────────────────────────
function NutrientCard({ item, owned, onBuy, money }) {
  const canAfford = money >= item.price;
  return (
    <div className="bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-lg p-4 space-y-2 transition-all">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-bold text-teal-300">{item.name}</div>
          <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-yellow-400 font-bold text-sm">{item.price} €</div>
          <div className="text-xs text-gray-600">{item.mlPerBuy}ml</div>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 text-xs">
        <span className="bg-teal-900/40 px-2 py-0.5 rounded text-teal-300">
          NPK {item.npk.n}-{item.npk.p}-{item.npk.k}
        </span>
        <span className="bg-gray-800 px-2 py-0.5 rounded text-gray-400">{item.mlPerFeed}ml/Feed</span>
        <span className="bg-gray-800 px-2 py-0.5 rounded text-gray-500">{item.type}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="text-xs text-gray-500">
          Lager: <span className={owned > 0 ? 'text-teal-400 font-bold' : 'text-gray-600'}>{owned}ml</span>
        </div>
        <button onClick={() => onBuy(item)} disabled={!canAfford}
          className={`flex-1 text-xs py-2 rounded font-bold transition-colors ${canAfford ? 'bg-teal-800 hover:bg-teal-700 text-white' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}>
          {canAfford ? '+ Kaufen' : 'Zu teuer'}
        </button>
      </div>
    </div>
  );
}

// ── Tools ─────────────────────────────────────────────────
function ToolCard({ item, owned, onBuy, onSell, money }) {
  const canAfford = money >= item.price;
  const refund = Math.floor(item.price / 2);
  return (
    <div className={`bg-gray-900 border rounded-lg p-4 space-y-2 transition-all ${owned ? 'border-blue-700/40' : 'border-gray-800 hover:border-gray-600'}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-bold text-gray-200">{item.name}</div>
          <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
        </div>
        <div className="text-right shrink-0 text-yellow-400 font-bold text-sm">{item.price} €</div>
      </div>
      <div className="flex flex-wrap gap-1.5 text-xs">
        {item.qualityBonus && <span className="bg-green-900/40 px-2 py-0.5 rounded text-green-400">+{item.qualityBonus}% Qualität</span>}
        {item.yieldBonus   && <span className="bg-purple-900/40 px-2 py-0.5 rounded text-purple-400">+{(item.yieldBonus * 100).toFixed(0)}% Ertrag</span>}
        {item.required     && <span className="bg-red-900/40 px-2 py-0.5 rounded text-red-400">Pflicht</span>}
      </div>
      {owned ? (
        <div className="space-y-1.5">
          <div className="text-center text-xs py-1 rounded border bg-blue-900/30 text-blue-400 border-blue-700">Vorhanden</div>
          <button onClick={() => onSell(item.id)}
            className="w-full text-xs py-1.5 rounded border border-orange-700/60 bg-orange-900/20 hover:bg-orange-800/30 text-orange-400 font-bold transition-colors">
            💰 Verkaufen ({refund} €)
          </button>
        </div>
      ) : (
        <button onClick={() => onBuy(item)} disabled={!canAfford}
          className={`w-full text-xs py-2 rounded font-bold uppercase tracking-wide transition-colors ${canAfford ? 'bg-blue-800 hover:bg-blue-700 text-white' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}>
          {canAfford ? 'Kaufen' : 'Zu teuer'}
        </button>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────
export default function Shop() {
  const [activeCat, setActiveCat] = useState('tent');

  const money         = useGameStore(s => s.money);
  const rooms         = useGameStore(s => s.rooms);
  const activeRoomId  = useGameStore(s => s.activeRoomId);
  const inventory     = useGameStore(s => s.inventory);
  const plants        = useGameStore(s => s.plants);
  const customStrains = useGameStore(s => s.customStrains);

  const buyEquipment  = useGameStore(s => s.buyEquipment);
  const buyPot        = useGameStore(s => s.buyPot);
  const buyTool       = useGameStore(s => s.buyTool);
  const buySeeds      = useGameStore(s => s.buySeeds);
  const buySubstrate  = useGameStore(s => s.buySubstrate);
  const buyNutrients  = useGameStore(s => s.buyNutrients);
  const sellEquipment = useGameStore(s => s.sellEquipment);
  const sellTool      = useGameStore(s => s.sellTool);
  const sellPot       = useGameStore(s => s.sellPot);

  const activeRoom = rooms.find(r => r.id === activeRoomId);
  const allStrains = [...SEEDS, ...customStrains];

  const cat = CATEGORIES.find(c => c.id === activeCat);

  // Tab badge helpers
  function bagde(id) {
    if (id === 'pot')  return activeRoom?.pots.length > 0 ? activeRoom.pots.length : null;
    if (id === 'tool') return inventory.tools.length > 0 ? inventory.tools.length : null;
    if (EQUIP_ITEMS[id]) return activeRoom?.[id] ? '✓' : null;
    if (id === 'seeds') {
      const total = Object.values(inventory.seeds).reduce((a, b) => a + b, 0);
      return total > 0 ? total : null;
    }
    if (id === 'substrate') {
      const total = Object.values(inventory.substrate).reduce((a, b) => a + b, 0);
      return total > 0 ? `${total}L` : null;
    }
    if (id === 'nutrients') {
      const total = Object.values(inventory.nutrients).reduce((a, b) => a + b, 0);
      return total > 0 ? `${total}ml` : null;
    }
    return null;
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

      {activeRoom && (
        <div className="text-xs text-gray-500 bg-gray-900/50 border border-gray-800 rounded px-3 py-2">
          Aktives Zimmer: <span className="text-green-400">{activeRoom.tent?.name ?? 'Kein Zelt'}</span>
          {' '}— Ausrüstung wird in diesem Zimmer installiert.
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(c => {
          const b = bagde(c.id);
          return (
            <button key={c.id} onClick={() => setActiveCat(c.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-colors border ${
                activeCat === c.id
                  ? 'bg-green-900/50 border-green-700 text-green-400'
                  : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-gray-200'
              }`}>
              <span>{c.icon}</span>
              <span>{c.label}</span>
              {b !== null && <span className="text-green-500">{b}</span>}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {cat && (
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-3">
            {cat.icon} {cat.label}
            {activeCat === 'pot' && activeRoom && (
              <span className="ml-2 text-gray-600">
                ({activeRoom.pots.length}/{activeRoom.tent?.maxPlants ?? 0} im Zelt)
              </span>
            )}
          </div>

          {/* Equipment (single-slot) */}
          {EQUIP_ITEMS[activeCat] && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {EQUIP_ITEMS[activeCat].map(item => (
                <EquipCard key={item.id} item={item}
                  equipped={activeRoom?.[activeCat]}
                  onBuy={item => buyEquipment(activeCat, item)}
                  onSell={activeRoom?.[activeCat]?.id === item.id ? () => sellEquipment(activeCat) : null}
                  money={money}
                />
              ))}
            </div>
          )}

          {/* Pots */}
          {activeCat === 'pot' && (
            <>
              <OwnedPotsList roomId={activeRoomId} pots={activeRoom?.pots ?? []} onSell={sellPot} plants={plants} />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {POTS.map(item => (
                  <PotShopCard key={item.id} item={item} onBuy={buyPot} money={money} />
                ))}
              </div>
            </>
          )}

          {/* Seeds */}
          {activeCat === 'seeds' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {allStrains.map(strain => (
                <SeedCard key={strain.id} strain={strain}
                  count={inventory.seeds[strain.id] ?? 0}
                  onBuy={buySeeds}
                  money={money}
                />
              ))}
            </div>
          )}

          {/* Substrate */}
          {activeCat === 'substrate' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {SUBSTRATES.map(item => (
                <SubstrateCard key={item.id} item={item}
                  owned={inventory.substrate[item.id] ?? 0}
                  onBuy={buySubstrate}
                  money={money}
                />
              ))}
            </div>
          )}

          {/* Nutrients */}
          {activeCat === 'nutrients' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {NUTRIENTS.map(item => (
                <NutrientCard key={item.id} item={item}
                  owned={inventory.nutrients[item.id] ?? 0}
                  onBuy={buyNutrients}
                  money={money}
                />
              ))}
            </div>
          )}

          {/* Tools */}
          {activeCat === 'tool' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {TOOLS.map(item => (
                <ToolCard key={item.id} item={item}
                  owned={inventory.tools.includes(item.id)}
                  onBuy={buyTool}
                  onSell={sellTool}
                  money={money}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
