import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { PHASES, getClimateScore } from '../data/phases';
import { SEEDS } from '../data/equipment';
import PixelView from './PixelView';

function PlantCard({ plant, climate, onHarvest, onSell, onRemove, onWater, onFertilize }) {
  const phase = PHASES[plant.phase];
  if (!phase) return null;

  const score = getClimateScore(climate, plant.phase);
  const isPostHarvest = ['drying', 'curing', 'ready'].includes(plant.phase);
  const isReady = plant.phase === 'ready';
  const isHarvestReady = plant.phase === 'harvest_ready';
  const isActive = !isPostHarvest && !isHarvestReady;

  const pricePerG = plant.quality >= 90 ? 12 : plant.quality >= 75 ? 10 : plant.quality >= 55 ? 8 : 5;
  const estimatedRevenue = plant.harvestedGrams ? plant.harvestedGrams * pricePerG : 0;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: `1px solid ${phase.color}30` }}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{phase.icon}</span>
          <div>
            <div className="text-sm font-bold" style={{ color: plant.strainColor }}>
              {plant.strainName}
            </div>
            <div className="text-xs" style={{ color: phase.color }}>{phase.label}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isPostHarvest && (
            <div
              className="text-xs px-2 py-0.5 rounded font-bold"
              style={{
                background: score > 80 ? '#14532d' : score > 50 ? '#713f12' : '#450a0a',
                color: score > 80 ? '#86efac' : score > 50 ? '#fde68a' : '#fca5a5',
              }}
            >
              {score.toFixed(0)}%
            </div>
          )}
          <button
            onClick={() => onRemove(plant.id)}
            className="text-gray-700 hover:text-red-500 text-xs px-1"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-3">
        {/* Quality Bar */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500">Qualität</span>
            <span className={plant.quality > 70 ? 'text-green-400' : plant.quality > 40 ? 'text-yellow-400' : 'text-red-400'}>
              {plant.quality.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${plant.quality}%`,
                background: plant.quality > 70 ? '#22c55e' : plant.quality > 40 ? '#eab308' : '#ef4444',
              }}
            />
          </div>
        </div>

        {/* Health Bar */}
        {!isPostHarvest && (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500">Gesundheit</span>
              <span className={plant.health > 60 ? 'text-green-400' : plant.health > 30 ? 'text-yellow-400' : 'text-red-400'}>
                {plant.health}%
              </span>
            </div>
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${plant.health}%`,
                  background: plant.health > 60 ? '#22c55e' : plant.health > 30 ? '#eab308' : '#ef4444',
                }}
              />
            </div>
          </div>
        )}

        {/* Phase Progress */}
        {!isPostHarvest && (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500">Phasenfortschritt</span>
              <span className="text-gray-400">Tag {plant.phaseDay}</span>
            </div>
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-green-800 transition-all duration-500"
                style={{ width: `${Math.min(100, (plant.phaseDay / 20) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Post-Harvest Progress */}
        {plant.phase === 'drying' && (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500">Trocknung</span>
              <span className="text-orange-400">{plant.dryingDay}/10 Tage</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-orange-700 rounded-full transition-all duration-500"
                style={{ width: `${(plant.dryingDay / 10) * 100}%` }}
              />
            </div>
          </div>
        )}
        {plant.phase === 'curing' && (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500">Curing</span>
              <span className="text-orange-300">{plant.curingDay}/14 Tage</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${(plant.curingDay / 14) * 100}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">{plant.harvestedGrams}g • Qualität steigt…</div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {!isPostHarvest && (
            <>
              <div className="text-gray-500">Topf: <span className="text-gray-300">{plant.potLiters}L</span></div>
              <div className="text-gray-500">Gesamttage: <span className="text-gray-300">{plant.totalDays}</span></div>
            </>
          )}
          {isReady && (
            <>
              <div className="text-gray-500">Ertrag: <span className="text-green-400 font-bold">{plant.harvestedGrams}g</span></div>
              <div className="text-gray-500">Preis: <span className="text-green-400 font-bold">{pricePerG}€/g</span></div>
            </>
          )}
          {(plant.phase === 'drying' || plant.phase === 'curing') && (
            <div className="col-span-2 text-gray-500">Ertrag: <span className="text-gray-300">{plant.harvestedGrams}g</span></div>
          )}
        </div>

        {/* Water + Fertilize buttons (only for actively growing plants) */}
        {isActive && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onWater(plant.id)}
              disabled={plant.wateredToday}
              className={`text-xs py-1.5 rounded font-bold transition-colors ${
                plant.wateredToday
                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                  : 'bg-blue-900/40 hover:bg-blue-800/60 border border-blue-700/60 text-blue-400'
              }`}
            >
              {plant.wateredToday ? '💧 Gegossen' : '💧 Gießen'}
            </button>
            <button
              onClick={() => onFertilize(plant.id)}
              disabled={plant.fertilizedToday}
              className={`text-xs py-1.5 rounded font-bold transition-colors ${
                plant.fertilizedToday
                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                  : 'bg-green-900/40 hover:bg-green-800/60 border border-green-700/60 text-green-400'
              }`}
            >
              {plant.fertilizedToday ? '🧪 Gedüngt' : '🧪 Düngen (1.50€)'}
            </button>
          </div>
        )}

        {/* Harvest Action */}
        {isHarvestReady && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onWater(plant.id)}
                disabled={plant.wateredToday}
                className={`text-xs py-1.5 rounded font-bold transition-colors ${
                  plant.wateredToday
                    ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                    : 'bg-blue-900/40 hover:bg-blue-800/60 border border-blue-700/60 text-blue-400'
                }`}
              >
                {plant.wateredToday ? '💧 Gegossen' : '💧 Gießen'}
              </button>
              <button
                onClick={() => onFertilize(plant.id)}
                disabled={plant.fertilizedToday}
                className={`text-xs py-1.5 rounded font-bold transition-colors ${
                  plant.fertilizedToday
                    ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                    : 'bg-green-900/40 hover:bg-green-800/60 border border-green-700/60 text-green-400'
                }`}
              >
                {plant.fertilizedToday ? '🧪 Gedüngt' : '🧪 Düngen (1.50€)'}
              </button>
            </div>
            <button
              onClick={() => onHarvest(plant.id)}
              className="w-full bg-yellow-700 hover:bg-yellow-600 text-white text-xs py-2 rounded font-bold uppercase tracking-wide transition-colors"
            >
              ✂️ Ernten
            </button>
          </div>
        )}

        {/* Sell Action */}
        {isReady && (
          <div className="space-y-2">
            <div className="text-center text-xs text-cyan-400 font-bold">
              Geschätzter Erlös: {estimatedRevenue} €
            </div>
            <button
              onClick={() => onSell(plant.id)}
              className="w-full bg-cyan-700 hover:bg-cyan-600 text-white text-xs py-2 rounded font-bold uppercase tracking-wide transition-colors"
            >
              💰 Verkaufen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyPot({ index, onPlant }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col items-center justify-center gap-3 min-h-40">
      <div className="text-4xl opacity-30">🪴</div>
      <div className="text-xs text-gray-600">Topf {index + 1} – leer</div>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="text-xs bg-gray-800 hover:bg-green-900/50 border border-gray-700 hover:border-green-700 text-gray-400 hover:text-green-400 px-4 py-1.5 rounded transition-colors"
        >
          Samen einpflanzen
        </button>
      ) : (
        <div className="w-full space-y-2">
          {SEEDS.map(s => (
            <button
              key={s.id}
              onClick={() => { onPlant(s.id, index); setOpen(false); }}
              className="w-full text-left px-3 py-2 bg-gray-800 hover:bg-green-900/30 border border-gray-700 hover:border-green-800 rounded text-xs transition-colors"
            >
              <div className="flex justify-between">
                <span style={{ color: s.color }}>{s.name}</span>
                <span className="text-yellow-400">{s.price} €</span>
              </div>
              <div className="text-gray-500 text-xs mt-0.5">{s.desc} • {s.type === 'auto' ? 'Auto' : 'Foto'}</div>
            </button>
          ))}
          <button onClick={() => setOpen(false)} className="w-full text-xs text-gray-600 hover:text-gray-400 py-1">Abbrechen</button>
        </div>
      )}
    </div>
  );
}

export default function GrowRoom() {
  const plants = useGameStore(s => s.plants);
  const equipment = useGameStore(s => s.equipment);
  const climate = useGameStore(s => s.climate);
  const harvestPlant = useGameStore(s => s.harvestPlant);
  const sellHarvest = useGameStore(s => s.sellHarvest);
  const plantSeed = useGameStore(s => s.plantSeed);
  const removePlant = useGameStore(s => s.removePlant);
  const waterPlant = useGameStore(s => s.waterPlant);
  const fertilizePlant = useGameStore(s => s.fertilizePlant);
  const settings = useGameStore(s => s.settings);

  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'pixel'

  const maxSlots = equipment.tent?.maxPlants ?? 0;
  const pots = equipment.pots;

  if (!equipment.tent) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-gray-500">
        <div className="text-5xl mb-4">🏕️</div>
        <div className="text-sm">Kein Zelt vorhanden. Kaufe zuerst ein Grow-Zelt im Shop.</div>
      </div>
    );
  }

  const activePlantCount = plants.filter(p => !['ready'].includes(p.phase)).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">
          {equipment.tent.name} • {activePlantCount}/{maxSlots} Plätze belegt
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-gray-500">
            {pots.length} Töpfe • {plants.length} Pflanzen gesamt
          </div>
          {/* View toggle */}
          <div className="flex border border-gray-700 rounded overflow-hidden">
            <button
              onClick={() => setViewMode('cards')}
              className={`text-xs px-3 py-1.5 transition-colors ${
                viewMode === 'cards'
                  ? 'bg-green-900/50 text-green-400'
                  : 'bg-gray-900 text-gray-500 hover:text-gray-300'
              }`}
            >
              ▤ Karten
            </button>
            <button
              onClick={() => setViewMode('pixel')}
              className={`text-xs px-3 py-1.5 transition-colors ${
                viewMode === 'pixel'
                  ? 'bg-green-900/50 text-green-400'
                  : 'bg-gray-900 text-gray-500 hover:text-gray-300'
              }`}
            >
              ▦ Grundriss
            </button>
          </div>
        </div>
      </div>

      {/* Pixel floor plan view */}
      {viewMode === 'pixel' && (
        <div className="overflow-x-auto pb-2">
          <PixelView plants={plants} pots={pots} equipment={equipment} settings={settings} />
        </div>
      )}

      {/* Card view */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Aktive / Post-Harvest Pflanzen */}
          {plants
            .filter(p => !['ready'].includes(p.phase))
            .map(p => (
              <PlantCard
                key={p.id}
                plant={p}
                climate={climate}
                onHarvest={harvestPlant}
                onSell={sellHarvest}
                onRemove={removePlant}
                onWater={waterPlant}
                onFertilize={fertilizePlant}
              />
            ))}

          {/* Leere Töpfe */}
          {Array.from({ length: Math.max(0, pots.length - plants.filter(p => !['ready'].includes(p.phase)).length) }).map((_, i) => {
            const idx = plants.filter(p => !['ready'].includes(p.phase)).length + i;
            return <EmptyPot key={idx} index={idx} onPlant={plantSeed} />;
          })}

          {/* Verkaufsfertige Pflanzen */}
          {plants
            .filter(p => p.phase === 'ready')
            .map(p => (
              <PlantCard
                key={p.id}
                plant={p}
                climate={climate}
                onHarvest={harvestPlant}
                onSell={sellHarvest}
                onRemove={removePlant}
                onWater={waterPlant}
                onFertilize={fertilizePlant}
              />
            ))}
        </div>
      )}

      {pots.length === 0 && (
        <div className="text-center text-gray-600 text-sm py-8">
          Keine Töpfe vorhanden. Kaufe Töpfe im Shop.
        </div>
      )}
    </div>
  );
}
