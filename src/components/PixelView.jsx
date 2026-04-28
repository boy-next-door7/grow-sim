// 8-bit Pokemon-style floor plan visualization
// Each plant phase is rendered as a pixel-art sprite on a top-down tent map.

// 8×8 pixel sprites: 'X'=main color, 'D'=dark shade, 'L'=light, '.'=transparent
const SPRITES = {
  germination: [
    '........',
    '........',
    '..XXXX..',
    '.XXXXXX.',
    '.XXXXXX.',
    '..XXXX..',
    '........',
    '........',
  ],
  seedling: [
    '........',
    '...X....',
    '..XXX...',
    '...X....',
    '..XXX...',
    '.X.X.X..',
    '..XXX...',
    '........',
  ],
  vegetative: [
    '.X...X..',
    '..XXX...',
    '.XXXXX..',
    'XXXXXXX.',
    '.XXXXX..',
    '...X....',
    '..DXD...',
    '..DDD...',
  ],
  flowering: [
    'X.X.X.X.',
    '.XXXXXXX',
    'XXXXXXXX',
    '.XXXXXX.',
    '..XXXX..',
    '...XX...',
    '..DXD...',
    '..DDD...',
  ],
  late_flower: [
    'XXXXXXXX',
    'XXXXXXXX',
    'XXXXXXXX',
    '.XXXXXX.',
    '.XXXXXX.',
    '...XX...',
    '..DXD...',
    '..DDD...',
  ],
  harvest_ready: [
    '.X.XX.X.',
    'XXXXXXXX',
    'XXXXXXXX',
    'XXXXXXXX',
    '.XXXXXX.',
    '...XX...',
    '..DXD...',
    '..DDD...',
  ],
  drying: [
    'XXXXXXXX',
    '.XX.XX..',
    '..X.X...',
    '...X....',
    '...X....',
    '...X....',
    '........',
    '........',
  ],
  curing: [
    '.XXXXXX.',
    'XXXXXXXX',
    'X.XXXX.X',
    'X......X',
    'X.XXXX.X',
    'X......X',
    'XXXXXXXX',
    '........',
  ],
  ready: [
    '...X....',
    '..X.X...',
    '.X...X..',
    'X.XXX..X',
    '.X...X..',
    '..X.X...',
    '...X....',
    '........',
  ],
};

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return { r, g, b };
}

function darken(hex, amount = 60) {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${Math.max(0, r - amount)},${Math.max(0, g - amount)},${Math.max(0, b - amount)})`;
}

function lighten(hex, amount = 60) {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${Math.min(255, r + amount)},${Math.min(255, g + amount)},${Math.min(255, b + amount)})`;
}

function PixelSprite({ phase, color, pixelSize = 5 }) {
  const rows = SPRITES[phase] ?? SPRITES.germination;
  const dark = darken(color);
  const light = lighten(color, 40);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(8, ${pixelSize}px)`,
        gridTemplateRows: `repeat(8, ${pixelSize}px)`,
        imageRendering: 'pixelated',
        gap: 0,
      }}
    >
      {rows.flatMap((row, y) =>
        row.split('').map((cell, x) => {
          let bg = 'transparent';
          if (cell === 'X') bg = color;
          else if (cell === 'D') bg = dark;
          else if (cell === 'L') bg = light;
          return (
            <div
              key={`${y}-${x}`}
              style={{ width: pixelSize, height: pixelSize, backgroundColor: bg }}
            />
          );
        })
      )}
    </div>
  );
}

const PHASE_LABELS = {
  germination: 'KEIM',
  seedling: 'KEIMLING',
  vegetative: 'VEG',
  flowering: 'BLÜTE',
  late_flower: 'SPÄTBLÜTE',
  harvest_ready: 'ERNTEREIF',
  drying: 'TROCKNEND',
  curing: 'CURING',
  ready: 'BEREIT',
};

function PlantTile({ plant, hasPot, potIndex, size }) {
  const isHarvestReady = plant?.phase === 'harvest_ready';
  const isReady = plant?.phase === 'ready';
  const pixelSize = size >= 80 ? 6 : 5;

  if (!hasPot) {
    return (
      <div
        className="flex flex-col items-center justify-center"
        style={{
          width: size,
          height: size,
          background: '#0d0d0d',
          border: '2px solid #1a1a1a',
          imageRendering: 'pixelated',
        }}
      >
        <div style={{ color: '#222', fontSize: 8, fontFamily: 'monospace' }}>···</div>
      </div>
    );
  }

  if (!plant) {
    // empty pot
    return (
      <div
        className="flex flex-col items-center justify-center gap-1"
        style={{
          width: size,
          height: size,
          background: '#1a0f05',
          border: '2px solid #3d2a14',
          imageRendering: 'pixelated',
        }}
      >
        {/* pot icon: simple brown circle */}
        <div style={{
          width: 24, height: 20,
          background: '#7c4a1e',
          borderRadius: '0 0 6px 6px',
          border: '2px solid #5a3410',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', top: -4, left: -2, right: -2, height: 6,
            background: '#8b5e2e', border: '2px solid #5a3410',
          }} />
        </div>
        <div style={{ color: '#5a3d1e', fontSize: 6, fontFamily: 'monospace', lineHeight: 1 }}>
          LEER
        </div>
      </div>
    );
  }

  const color = plant.strainColor || '#86efac';

  return (
    <div
      className={`flex flex-col items-center justify-center gap-1 ${
        isHarvestReady ? 'pixel-blink' : ''
      } ${isReady ? 'pixel-glow' : ''}`}
      style={{
        width: size,
        height: size,
        background: '#0d1a08',
        border: `2px solid ${color}40`,
        imageRendering: 'pixelated',
        position: 'relative',
      }}
    >
      <PixelSprite phase={plant.phase} color={color} pixelSize={pixelSize} />
      <div style={{
        fontFamily: "'Press Start 2P', monospace",
        fontSize: 4,
        color: color,
        lineHeight: 1.4,
        textAlign: 'center',
        letterSpacing: 0,
      }}>
        {PHASE_LABELS[plant.phase] || plant.phase.toUpperCase()}
      </div>
      {/* Health bar */}
      <div style={{ width: '80%', height: 2, background: '#1a1a1a' }}>
        <div style={{
          height: '100%',
          width: `${plant.health}%`,
          background: plant.health > 60 ? '#22c55e' : plant.health > 30 ? '#eab308' : '#ef4444',
        }} />
      </div>
    </div>
  );
}

// Border tile patterns for the tent walls
function WallTile({ size, corner = false, top = false, side = false }) {
  return (
    <div style={{
      width: size,
      height: size,
      background: corner ? '#3d2a14' : '#2a1c0a',
      border: '2px solid #4a3318',
      imageRendering: 'pixelated',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {corner && (
        <div style={{ width: 6, height: 6, background: '#6b4a22', border: '1px solid #8b6a32' }} />
      )}
      {(top || side) && !corner && (
        <div style={{
          width: top ? '60%' : 4,
          height: top ? 4 : '60%',
          background: '#4a3318',
        }} />
      )}
    </div>
  );
}

function getLampColor(lamp) {
  if (!lamp) return '#333';
  if (lamp.id?.startsWith('led')) return '#4ade80';
  if (lamp.id?.startsWith('hps')) return '#fde68a';
  if (lamp.id?.startsWith('cmh')) return '#f0abfc';
  return '#fbbf24';
}

export default function PixelView({ plants, pots, equipment, settings }) {
  const tent = equipment?.tent;
  if (!tent) return null;

  const maxPlants = tent.maxPlants;

  // grid layout inside tent
  const cols = maxPlants <= 1 ? 1 : maxPlants <= 2 ? 2 : maxPlants <= 4 ? 2 : 3;
  const rows = Math.ceil(maxPlants / cols);

  // Tile size adapts to number of plants
  const tileSize = maxPlants <= 4 ? 80 : maxPlants <= 6 ? 72 : 64;

  // Build slot array
  const slots = Array.from({ length: maxPlants }, (_, i) => {
    const plant = plants.find(p => p.potIndex === i && p.phase !== 'ready');
    const hasPot = i < pots.length;
    return { index: i, plant, hasPot };
  });

  // Ready-to-sell plants (not in tent)
  const readyPlants = plants.filter(p => p.phase === 'ready');

  const lampColor = getLampColor(equipment.lamp);

  // Total grid width/height with border tiles
  const totalCols = cols + 2;
  const totalRows = rows + 2;

  return (
    <div className="space-y-4">
      {/* Pokemon dialog box style header */}
      <div
        className="pixel-font pixel-border"
        style={{
          borderColor: '#22c55e',
          background: '#0a1a0a',
          padding: '10px 16px',
          display: 'inline-block',
          fontSize: 8,
          color: '#4ade80',
          letterSpacing: 1,
        }}
      >
        ▶ {tent.name.toUpperCase()} — GRUNDRISS
      </div>

      <div className="flex flex-wrap gap-6 items-start">
        {/* Tent floor plan */}
        <div className="pixel-tent pixel-border" style={{ borderColor: '#4a3318', display: 'inline-block', padding: 8 }}>
          {/* Lamp indicator */}
          {equipment.lamp && (
            <div
              className="pixel-font mb-2"
              style={{
                fontSize: 6,
                color: lampColor,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                borderBottom: `1px solid ${lampColor}40`,
                paddingBottom: 6,
              }}
            >
              <div style={{ width: 6, height: 6, background: lampColor, borderRadius: 0 }} />
              {equipment.lamp.name.toUpperCase()} — {settings?.lampHours ?? '?'}H/TAG
              <div style={{ width: 6, height: 6, background: lampColor, borderRadius: 0 }} />
            </div>
          )}

          {/* Grid: border tiles + plant tiles */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${totalCols}, ${tileSize}px)`,
              gridTemplateRows: `repeat(${totalRows}, ${tileSize}px)`,
              gap: 2,
              imageRendering: 'pixelated',
            }}
          >
            {Array.from({ length: totalRows }).flatMap((_, r) =>
              Array.from({ length: totalCols }).map((_, c) => {
                const isCorner = (r === 0 || r === totalRows - 1) && (c === 0 || c === totalCols - 1);
                const isTopOrBottom = r === 0 || r === totalRows - 1;
                const isLeftOrRight = c === 0 || c === totalCols - 1;
                const isBorder = isTopOrBottom || isLeftOrRight;

                if (isBorder) {
                  return (
                    <WallTile
                      key={`${r}-${c}`}
                      size={tileSize}
                      corner={isCorner}
                      top={isTopOrBottom && !isCorner}
                      side={isLeftOrRight && !isCorner}
                    />
                  );
                }

                const slotIndex = (r - 1) * cols + (c - 1);
                const slot = slots[slotIndex];
                if (!slot) {
                  return <div key={`${r}-${c}`} style={{ width: tileSize, height: tileSize, background: '#0d0d0d' }} />;
                }

                return (
                  <PlantTile
                    key={`${r}-${c}`}
                    plant={slot.plant}
                    hasPot={slot.hasPot}
                    potIndex={slot.index}
                    size={tileSize}
                  />
                );
              })
            )}
          </div>

          {/* Legend */}
          <div
            className="pixel-font mt-3 flex gap-4 flex-wrap"
            style={{ fontSize: 5, color: '#555', borderTop: '1px solid #1a1a1a', paddingTop: 6 }}
          >
            <span style={{ color: '#3d2a14' }}>█ WAND</span>
            <span style={{ color: '#7c4a1e' }}>▣ LEERER TOPF</span>
            <span style={{ color: '#22c55e' }}>▦ PFLANZE</span>
            {readyPlants.length > 0 && (
              <span style={{ color: '#fbbf24' }} className="pixel-glow">★ BEREIT ZU VERKAUFEN</span>
            )}
          </div>
        </div>

        {/* Ready-to-sell panel */}
        {readyPlants.length > 0 && (
          <div
            className="pixel-border pixel-font"
            style={{
              borderColor: '#854d0e',
              background: '#1a1005',
              padding: 12,
              minWidth: 160,
            }}
          >
            <div style={{ fontSize: 7, color: '#fbbf24', marginBottom: 8 }} className="pixel-glow">
              ★ LAGER ★
            </div>
            {readyPlants.map(p => (
              <div key={p.id} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 5, color: p.strainColor, marginBottom: 2 }}>
                  {p.strainName.toUpperCase()}
                </div>
                <div style={{ fontSize: 5, color: '#4ade80' }}>
                  {p.harvestedGrams}G — BEREIT
                </div>
                <div style={{ width: '100%', height: 2, background: '#1a1a1a', marginTop: 2 }}>
                  <div style={{
                    height: '100%',
                    width: `${p.quality}%`,
                    background: p.quality > 75 ? '#22c55e' : p.quality > 50 ? '#eab308' : '#ef4444',
                  }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Equipment status panel */}
        <div
          className="pixel-border pixel-font"
          style={{
            borderColor: '#1e3a1e',
            background: '#050d05',
            padding: 12,
            minWidth: 140,
          }}
        >
          <div style={{ fontSize: 7, color: '#4ade80', marginBottom: 8 }}>EQUIPMENT</div>
          {[
            { label: 'LAMPE', val: equipment.lamp?.name ?? '—', color: equipment.lamp ? lampColor : '#333' },
            { label: 'ABLUFT', val: equipment.exhaust?.name ?? '—', color: equipment.exhaust ? '#60a5fa' : '#333' },
            { label: 'LÜFTER', val: equipment.fan?.name ?? '—', color: equipment.fan ? '#93c5fd' : '#333' },
            { label: 'FILTER', val: equipment.filter?.name ?? '—', color: equipment.filter ? '#a78bfa' : '#333' },
            { label: 'DÜNGER', val: equipment.nutrients?.name ?? '—', color: equipment.nutrients ? '#86efac' : '#333' },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ marginBottom: 6 }}>
              <div style={{ fontSize: 4, color: '#555' }}>{label}</div>
              <div style={{ fontSize: 5, color, marginTop: 1 }}>{val.substring(0, 16).toUpperCase()}</div>
            </div>
          ))}
          <div style={{ borderTop: '1px solid #1a1a1a', marginTop: 4, paddingTop: 4 }}>
            <div style={{ fontSize: 4, color: '#555' }}>TÖPFE</div>
            <div style={{ fontSize: 5, color: '#c4b5fd' }}>
              {pots.length} / {tent.maxPlants} BELEGT
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
