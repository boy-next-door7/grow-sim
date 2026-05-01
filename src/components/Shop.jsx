import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import {
  TENTS, LAMPS, EXHAUSTS, FANS, FILTERS, POTS, HUMIDIFIERS,
  NUTRIENTS, TOOLS, SEEDS, SUBSTRATES, DRIP_SYSTEMS, CONTROLLERS,
} from '../data/equipment';

// ── Category config ───────────────────────────────────────
const CATEGORIES = [
  { id: 'tent',       label: 'Zelte',         icon: '🏕️',  color: 'text-amber-400',  bg: 'bg-amber-950/40',  border: 'border-amber-800/50' },
  { id: 'lamp',       label: 'Lampen',        icon: '💡',  color: 'text-yellow-400', bg: 'bg-yellow-950/40', border: 'border-yellow-800/50' },
  { id: 'exhaust',    label: 'Abluft',        icon: '🌀',  color: 'text-blue-400',   bg: 'bg-blue-950/40',   border: 'border-blue-800/50' },
  { id: 'fan',        label: 'Lüfter',        icon: '💨',  color: 'text-cyan-400',   bg: 'bg-cyan-950/40',   border: 'border-cyan-800/50' },
  { id: 'filter',     label: 'Filter',        icon: '🫧',  color: 'text-slate-400',  bg: 'bg-slate-950/40',  border: 'border-slate-800/50' },
  { id: 'humidifier', label: 'Befeuchter',    icon: '💦',  color: 'text-cyan-300',   bg: 'bg-cyan-950/40',   border: 'border-cyan-700/50' },
  { id: 'pot',        label: 'Töpfe',         icon: '🪴',  color: 'text-orange-400', bg: 'bg-orange-950/40', border: 'border-orange-800/50' },
  { id: 'drip',       label: 'Bewässerung',   icon: '💧',  color: 'text-sky-400',    bg: 'bg-sky-950/40',    border: 'border-sky-800/50' },
  { id: 'controller', label: 'Controller',    icon: '🤖',  color: 'text-green-400',  bg: 'bg-green-950/40',  border: 'border-green-800/50' },
  { id: 'seeds',      label: 'Samen',         icon: '🌱',  color: 'text-lime-400',   bg: 'bg-lime-950/40',   border: 'border-lime-800/50' },
  { id: 'substrate',  label: 'Substrat',      icon: '🪨',  color: 'text-stone-400',  bg: 'bg-stone-950/40',  border: 'border-stone-800/50' },
  { id: 'nutrients',  label: 'Dünger',        icon: '🧪',  color: 'text-teal-400',   bg: 'bg-teal-950/40',   border: 'border-teal-800/50' },
  { id: 'tool',       label: 'Werkzeug',      icon: '🔧',  color: 'text-purple-400', bg: 'bg-purple-950/40', border: 'border-purple-800/50' },
];

const EQUIP_ITEMS = {
  tent: TENTS, lamp: LAMPS, exhaust: EXHAUSTS, fan: FANS, filter: FILTERS,
  humidifier: HUMIDIFIERS, drip: DRIP_SYSTEMS, controller: CONTROLLERS,
};

// ── Room setup overview strip ─────────────────────────────
function RoomSetup({ room }) {
  if (!room) return null;
  const slots = [
    { key: 'tent',       icon: '🏕️',  label: room.tent?.name },
    { key: 'lamp',       icon: '💡',  label: room.lamp?.name },
    { key: 'exhaust',    icon: '🌀',  label: room.exhaust?.name },
    { key: 'fan',        icon: '💨',  label: room.fan?.name },
    { key: 'filter',     icon: '🫧',  label: room.filter?.name },
    { key: 'humidifier', icon: '💦',  label: room.humidifier?.name },
    { key: 'drip',       icon: '💧',  label: room.drip?.name },
    { key: 'controller', icon: '🤖',  label: room.controller?.name },
  ];
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="text-xs text-gray-500 uppercase tracking-wide mb-3">
        Aktives Setup — <span className="text-green-400">{room.tent?.name ?? 'Kein Zelt'}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {slots.map(s => (
          <div key={s.key}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-all ${
              s.label
                ? 'bg-green-950/30 border-green-800/50 text-green-300'
                : 'bg-gray-800/50 border-gray-700/50 text-gray-600'
            }`}>
            <span>{s.icon}</span>
            <span className="hidden sm:inline truncate max-w-[100px]">{s.label ?? 'Leer'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Generic equipment card ─────────────────────────────────
function EquipCard({ item, cat, equipped, onBuy, onSell, money }) {
  const isEquipped = equipped?.id === item.id;
  const canAfford  = money >= item.price;
  const refund     = Math.floor(item.price / 2);

  return (
    <div className={`relative bg-gray-900 border rounded-xl overflow-hidden transition-all ${
      isEquipped ? `${cat.border} shadow-lg` : 'border-gray-800 hover:border-gray-600'
    }`}>
      {isEquipped && (
        <div className={`absolute top-0 left-0 right-0 h-0.5 ${cat.bg.replace('/40','')}`} />
      )}
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5">
            <div className={`text-xs font-bold uppercase tracking-wide ${isEquipped ? cat.color : 'text-gray-300'}`}>
              {item.name}
            </div>
            <div className="text-xs text-gray-500">{item.desc}</div>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-yellow-400 font-bold">{item.price} €</div>
            {item.watt > 0 && <div className="text-xs text-gray-600">{item.watt}W</div>}
          </div>
        </div>

        {/* Spec badges */}
        <div className="flex flex-wrap gap-1">
          {item.maxPlants   && <Badge>{item.maxPlants} Pflanzen</Badge>}
          {item.heat        && <Badge color="text-orange-400">+{item.heat}°C Wärme</Badge>}
          {item.ppfd        && <Badge color="text-yellow-400">PPFD ×{item.ppfd}</Badge>}
          {item.dimmable    && <Badge color="text-green-400">Dimmbar</Badge>}
          {item.cooling     && <Badge color="text-blue-400">-{item.cooling}°C</Badge>}
          {item.dehumid     && <Badge color="text-cyan-400">-{item.dehumid}% LF</Badge>}
          {item.humidify    && <Badge color="text-cyan-300">+{item.humidify}% LF</Badge>}
          {item.waterEvery  && <Badge color="text-sky-400">💧 alle {item.waterEvery}d</Badge>}
          {item.autoClimate && <Badge color="text-green-400">🤖 Auto-Klima</Badge>}
          {item.qualityBonus && <Badge color="text-lime-400">+Qualität/Tag</Badge>}
        </div>

        {/* Wattage bar */}
        {item.watt > 0 && (
          <div className="space-y-0.5">
            <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-orange-600/70" style={{ width: `${Math.min(100, (item.watt / 500) * 100)}%` }} />
            </div>
          </div>
        )}

        {/* Action */}
        {isEquipped ? (
          <div className="space-y-2">
            <div className={`text-center text-xs py-1.5 rounded-lg ${cat.bg} ${cat.color} border ${cat.border} font-bold`}>
              ✓ Installiert
            </div>
            {onSell && (
              <button onClick={onSell}
                className="w-full text-xs py-1.5 rounded-lg border border-orange-800/50 bg-orange-950/30 hover:bg-orange-900/40 text-orange-400 font-bold transition-colors">
                Verkaufen ({refund} €)
              </button>
            )}
          </div>
        ) : (
          <button onClick={() => onBuy(item)} disabled={!canAfford}
            className={`w-full py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors ${
              canAfford
                ? `${cat.bg} hover:brightness-125 ${cat.color} border ${cat.border}`
                : 'bg-gray-800 text-gray-600 border border-gray-700 cursor-not-allowed'
            }`}>
            {canAfford ? `Kaufen — ${item.price} €` : 'Zu teuer'}
          </button>
        )}
      </div>
    </div>
  );
}

function Badge({ children, color = 'text-gray-400' }) {
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700/50 ${color}`}>
      {children}
    </span>
  );
}

// ── Pots ──────────────────────────────────────────────────
function PotSection({ rooms, inventory, onBuy, onSell, money }) {
  const hasPots = Object.values(inventory.pots ?? {}).some(v => v > 0);
  return (
    <div className="space-y-4">
      {/* Inventory pots */}
      {hasPots && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-3">Im Inventar</div>
          <div className="flex flex-wrap gap-2">
            {POTS.filter(p => (inventory.pots?.[p.id] ?? 0) > 0).map(p => {
              const count = inventory.pots[p.id];
              return (
                <div key={p.id} className="flex items-center gap-2 bg-orange-950/20 border border-orange-800/40 rounded-lg px-3 py-2 text-xs">
                  <span className="text-orange-400">🪴</span>
                  <span className="text-orange-300 font-bold">{p.name}</span>
                  <span className="text-gray-500">×{count}</span>
                  <button onClick={() => onSell(p.id)}
                    className="text-red-700 hover:text-red-500 ml-1 transition-colors text-[10px]">
                    Verkaufen ({Math.floor(p.price / 2)}€)
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* Buy pots */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {POTS.map(item => {
          const canAfford = money >= item.price;
          return (
            <div key={item.id} className="bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl p-4 space-y-3 transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xs font-bold text-orange-300">{item.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
                </div>
                <div className="text-yellow-400 font-bold text-sm shrink-0">{item.price} €</div>
              </div>
              <div className="flex gap-1.5">
                <Badge color="text-orange-400">{item.liters}L</Badge>
                <Badge color="text-purple-400">×{item.yieldFactor} Ertrag</Badge>
              </div>
              <button onClick={() => onBuy(item)} disabled={!canAfford}
                className={`w-full py-2 rounded-lg text-xs font-bold transition-colors ${
                  canAfford ? 'bg-orange-950/40 border border-orange-800/50 text-orange-400 hover:brightness-125' : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                }`}>
                {canAfford ? '+ Kaufen → Inventar' : 'Zu teuer'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Seeds ─────────────────────────────────────────────────
function SeedsSection({ allStrains, inventory, onBuy, money }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {allStrains.map(s => {
        const count     = inventory.seeds[s.id] ?? 0;
        const canAfford = money >= s.price;
        return (
          <div key={s.id} className="bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl overflow-hidden transition-all">
            {/* Strain color bar */}
            <div className="h-1" style={{ background: s.color }} />
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm font-bold" style={{ color: s.color }}>{s.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{s.desc}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-yellow-400 font-bold">{s.price} €</div>
                  <div className="text-xs text-gray-600">/ Samen</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                <Badge color="text-gray-400">{s.type === 'auto' ? '⚡ Auto' : '📸 Foto'}</Badge>
                <Badge color="text-pink-400">THC {s.thc}%</Badge>
                <Badge color="text-purple-400">{s.yieldMin}–{s.yieldMax}g</Badge>
                {s.isHybrid && <Badge color="text-fuchsia-400">F1 Hybrid</Badge>}
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs">
                  <span className="text-gray-500">Lager: </span>
                  <span className={count > 0 ? 'text-green-400 font-bold' : 'text-gray-600'}>{count}×</span>
                </div>
                <button onClick={() => onBuy(s.id)} disabled={!canAfford}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${
                    canAfford ? 'bg-lime-950/40 border border-lime-800/50 text-lime-400 hover:brightness-125' : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                  }`}>
                  {canAfford ? '+ Kaufen' : 'Zu teuer'}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Consumables (substrate, nutrients) ────────────────────
function ConsumableCard({ item, owned, ownedLabel, accentColor, onBuy, money, badges }) {
  const canAfford = money >= item.price;
  return (
    <div className="bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl p-4 space-y-3 transition-all">
      <div className="flex justify-between items-start">
        <div>
          <div className={`text-xs font-bold ${accentColor}`}>{item.name}</div>
          <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-yellow-400 font-bold">{item.price} €</div>
        </div>
      </div>
      <div className="flex flex-wrap gap-1">{badges}</div>
      <div className="flex items-center gap-2">
        <div className="text-xs text-gray-500">Lager: <span className={owned > 0 ? `${accentColor} font-bold` : 'text-gray-600'}>{owned} {ownedLabel}</span></div>
        <button onClick={() => onBuy(item)} disabled={!canAfford}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${canAfford ? 'bg-gray-800 border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}>
          {canAfford ? '+ Kaufen' : 'Zu teuer'}
        </button>
      </div>
    </div>
  );
}

// ── Tools ─────────────────────────────────────────────────
function ToolsSection({ inventory, onBuy, onSell, money }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {TOOLS.map(item => {
        const owned     = inventory.tools.includes(item.id);
        const canAfford = money >= item.price;
        const refund    = Math.floor(item.price / 2);
        return (
          <div key={item.id} className={`bg-gray-900 border rounded-xl p-4 space-y-3 transition-all ${
            owned ? 'border-purple-800/50' : 'border-gray-800 hover:border-gray-600'
          }`}>
            <div className="flex justify-between items-start">
              <div>
                <div className={`text-xs font-bold ${owned ? 'text-purple-300' : 'text-gray-300'}`}>{item.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
              </div>
              <div className="text-yellow-400 font-bold shrink-0">{item.price} €</div>
            </div>
            <div className="flex flex-wrap gap-1">
              {item.qualityBonus && <Badge color="text-green-400">+{item.qualityBonus}% Qualität</Badge>}
              {item.yieldBonus   && <Badge color="text-purple-400">+{(item.yieldBonus*100).toFixed(0)}% Ertrag</Badge>}
              {item.required     && <Badge color="text-red-400">Pflicht</Badge>}
              {item.clonerBonus  && <Badge color="text-blue-400">+{(item.clonerBonus*100).toFixed(0)}% Clone</Badge>}
            </div>
            {owned ? (
              <div className="space-y-1.5">
                <div className="text-center text-xs py-1.5 rounded-lg bg-purple-950/30 text-purple-400 border border-purple-800/50 font-bold">✓ Vorhanden</div>
                <button onClick={() => onSell(item.id)}
                  className="w-full text-xs py-1.5 rounded-lg border border-orange-800/50 bg-orange-950/30 hover:brightness-125 text-orange-400 font-bold transition-colors">
                  Verkaufen ({refund} €)
                </button>
              </div>
            ) : (
              <button onClick={() => onBuy(item)} disabled={!canAfford}
                className={`w-full py-2 rounded-lg text-xs font-bold transition-colors ${
                  canAfford ? 'bg-purple-950/40 border border-purple-800/50 text-purple-400 hover:brightness-125' : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                }`}>
                {canAfford ? `Kaufen — ${item.price} €` : 'Zu teuer'}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main Shop ─────────────────────────────────────────────
export default function Shop() {
  const [activeCat, setActiveCat] = useState('tent');

  const money         = useGameStore(s => s.money);
  const rooms         = useGameStore(s => s.rooms);
  const activeRoomId  = useGameStore(s => s.activeRoomId);
  const inventory     = useGameStore(s => s.inventory);
  const customStrains = useGameStore(s => s.customStrains);

  const buyEquipment       = useGameStore(s => s.buyEquipment);
  const buyPot             = useGameStore(s => s.buyPot);
  const buyTool            = useGameStore(s => s.buyTool);
  const buySeeds           = useGameStore(s => s.buySeeds);
  const buySubstrate       = useGameStore(s => s.buySubstrate);
  const buyNutrients       = useGameStore(s => s.buyNutrients);
  const sellEquipment      = useGameStore(s => s.sellEquipment);
  const sellTool           = useGameStore(s => s.sellTool);
  const sellPotFromInventory = useGameStore(s => s.sellPotFromInventory);

  const activeRoom = rooms.find(r => r.id === activeRoomId);
  const allStrains = [...SEEDS, ...customStrains];
  const cat        = CATEGORIES.find(c => c.id === activeCat);

  function getBadge(id) {
    if (EQUIP_ITEMS[id])    return activeRoom?.[id] ? '✓' : null;
    if (id === 'pot')       { const t = Object.values(inventory.pots ?? {}).reduce((a,b)=>a+b,0); return t > 0 ? t : null; }
    if (id === 'tool')      return inventory.tools.length > 0 ? inventory.tools.length : null;
    if (id === 'seeds')     { const t = Object.values(inventory.seeds).reduce((a,b)=>a+b,0); return t > 0 ? t : null; }
    if (id === 'substrate') { const t = Object.values(inventory.substrate).reduce((a,b)=>a+b,0); return t > 0 ? `${t}L` : null; }
    if (id === 'nutrients') { const t = Object.values(inventory.nutrients).reduce((a,b)=>a+b,0); return t > 0 ? `${t}ml` : null; }
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">

      {/* Budget + room setup */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-xl px-5 py-4">
          <span className="text-xs text-gray-500 uppercase tracking-wide">Budget</span>
          <span className={`font-bold text-xl ${money < 200 ? 'text-red-400' : 'text-yellow-400'}`}>
            {money.toFixed(2)} €
          </span>
        </div>
        <div className="md:col-span-2">
          <RoomSetup room={activeRoom} />
        </div>
      </div>

      {/* Category tabs */}
      <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
        {CATEGORIES.map(c => {
          const badge   = getBadge(c.id);
          const isActive = activeCat === c.id;
          return (
            <button key={c.id} onClick={() => setActiveCat(c.id)}
              className={`relative flex flex-col items-center gap-1 px-1 py-2 rounded-xl text-center transition-all border ${
                isActive
                  ? `${c.bg} ${c.border} ${c.color}`
                  : 'bg-gray-900 border-gray-800 text-gray-500 hover:text-gray-300 hover:border-gray-600'
              }`}>
              <span className="text-lg leading-none">{c.icon}</span>
              <span className="text-[9px] uppercase tracking-wide leading-none hidden sm:block">{c.label}</span>
              {badge !== null && (
                <span className={`absolute -top-1 -right-1 text-[9px] px-1 rounded-full font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-green-700 text-white'}`}>
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {cat && (
        <div>
          <div className={`text-sm font-bold ${cat.color} mb-4 flex items-center gap-2`}>
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </div>

          {/* Equipment slots */}
          {EQUIP_ITEMS[activeCat] && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {EQUIP_ITEMS[activeCat].map(item => (
                <EquipCard key={item.id} item={item} cat={cat}
                  equipped={activeRoom?.[activeCat]}
                  onBuy={item => buyEquipment(activeCat, item)}
                  onSell={activeRoom?.[activeCat]?.id === item.id ? () => sellEquipment(activeCat) : null}
                  money={money}
                />
              ))}
            </div>
          )}

          {activeCat === 'pot' && (
            <PotSection rooms={rooms} inventory={inventory}
              onBuy={buyPot} onSell={sellPotFromInventory} money={money} />
          )}

          {activeCat === 'seeds' && (
            <SeedsSection allStrains={allStrains} inventory={inventory} onBuy={buySeeds} money={money} />
          )}

          {activeCat === 'substrate' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {SUBSTRATES.map(item => (
                <ConsumableCard key={item.id} item={item}
                  owned={inventory.substrate[item.id] ?? 0} ownedLabel="L"
                  accentColor="text-amber-300" onBuy={buySubstrate} money={money}
                  badges={<>
                    {item.qualityBonus > 0 && <Badge color="text-green-400">+{(item.qualityBonus*100).toFixed(0)}% Qual./Tag</Badge>}
                    <Badge color="text-gray-400">Drainage ×{item.drainageFactor}</Badge>
                    <Badge>{item.liters}L / Sack</Badge>
                  </>}
                />
              ))}
            </div>
          )}

          {activeCat === 'nutrients' && (
            <div className="space-y-4">
              <div className="text-xs text-gray-500">
                <span className="text-blue-400 font-bold">Synthetisch</span> — ins Gießwasser, sofortige NPK-Wirkung.{' '}
                <span className="text-amber-400 font-bold">Organisch</span> — Top-Dressing auf Substrat, langsame Freisetzung.
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {NUTRIENTS.map(item => {
                  const isOrganic = item.category === 'organic';
                  const npkValues = isOrganic ? item.npkBoost : item.npk;
                  return (
                    <ConsumableCard key={item.id} item={item}
                      owned={inventory.nutrients[item.id] ?? 0} ownedLabel={isOrganic ? 'g' : 'ml'}
                      accentColor={isOrganic ? 'text-amber-300' : 'text-teal-300'}
                      onBuy={buyNutrients} money={money}
                      badges={<>
                        {isOrganic
                          ? <Badge color="text-amber-400">🌿 Organisch</Badge>
                          : <Badge color="text-blue-400">💧 Synthetisch</Badge>
                        }
                        <Badge color="text-teal-400">N{npkValues.n} P{npkValues.p} K{npkValues.k}</Badge>
                        {isOrganic && item.releaseDays && <Badge color="text-orange-400">{item.releaseDays}d Freisetzung</Badge>}
                        {!isOrganic && <Badge>{item.mlPerFeed}ml / Feed</Badge>}
                        {item.qualityBonus > 0 && <Badge color="text-lime-400">+Qualität</Badge>}
                      </>}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {activeCat === 'tool' && (
            <ToolsSection inventory={inventory} onBuy={buyTool} onSell={sellTool} money={money} />
          )}
        </div>
      )}
    </div>
  );
}
