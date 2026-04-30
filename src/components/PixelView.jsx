// 8-bit Pokemon-style floor plan — interactive tiles

// X = main plant color, D = dark stem/shadow, B = bright trichome frost
const SPRITES = {
  germination:   ['........','........','..XXXX..','..XXXXXX','.XXXXXX.','..XXXX..','........','........'],
  clone_rooting: ['........','...X....','..XX....', '.XXX....','..XX....','...X....','..XXX...','........'],
  seedling:      ['........','...X....','..XXX...','.XXXXX..','..XXX...','.X.X.X..','...X....','........'],
  vegetative:    ['.X...X..','..XXX...','.XXXXX..','XXXXXXX.','.XXXXX..','...X....','..DXD...','..DDD...'],
  // generic fallback for flowering (overridden by STRAIN_SPRITES below)
  flowering:     ['X.X.X.X.','.XXXXXXX','XXXXXXXX','.XXXXXX.','..XXXX..','...XX...','..DXD...','..DDD...'],
  late_flower:   ['XXXXXXXX','XXXXXXXX','XXXXXXXX','.XXXXXX.','.XXXXXX.','...XX...','..DXD...','..DDD...'],
  harvest_ready: ['.X.XX.X.','XXXXXXXX','XXXXXXXX','XXXXXXXX','.XXXXXX.','...XX...','..DXD...','..DDD...'],
  drying:        ['X.X.X.X.','.XX.XX..','..X.X...','...X....','...X....','...X....','........','........'],
  curing:        ['.XXXXXX.','XXXXXXXX','X.XXXX.X','X......X','X.XXXX.X','X......X','XXXXXXXX','........'],
  ready:         ['...X....','..X.X...','.X...X..','X.XXX..X','.X...X..','..X.X...','...X....','........'],
};

// Strain-specific sprites for flowering phases
const STRAIN_SPRITES = {
  indica: {
    // round, dense, fat bud structure
    flowering:     ['..XXXX..', '.XXXXXX.', 'XXXXXXXX', 'XXXXXXXX', '.XXXXXX.', '..XXXX..', '..DXD...', '..DDD...'],
    late_flower:   ['BXXXXXXB', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', '.XXXXXX.', '..XXXX..', '..DXD...', '..DDD...'],
    harvest_ready: ['BXBXXBXB', 'BXXXXXXB', 'XXXXXXXX', 'XXXXXXXX', '.XXXXXX.', '..XXXX..', '..DXD...', '..DDD...'],
  },
  sativa: {
    // elongated, loose, cola-style
    flowering:     ['X.X.X.X.', '.X.X.X.X', 'X..XX..X', '.XXXXXX.', '..XXXX..', '...XX...', '..DXD...', '..DDD...'],
    late_flower:   ['X.XXXX.X', 'BXXXXXXB', 'XXXXXXXX', '.XXXXXX.', '..XXXX..', '...XX...', '..DXD...', '..DDD...'],
    harvest_ready: ['XBX.XBX.', 'BXXXXXXB', 'XXXXXXXX', '.XXXXXX.', '..XXXX..', '...XX...', '..DXD...', '..DDD...'],
  },
  auto: {
    // compact, small but well-formed
    flowering:     ['..XXXX..', '.XXXXXX.', 'XXXXXXXX', '.XXXXXX.', '..XXXX..', '...XX...', '..DXD...', '..DDD...'],
    late_flower:   ['.XXXXXX.', 'BXXXXXXB', 'XXXXXXXX', '.XXXXXX.', '..XXXX..', '...XX...', '..DXD...', '..DDD...'],
    harvest_ready: ['.BXXXBX.', 'BXXXXXXB', 'XXXXXXXX', '.XXXXXX.', '..XXXX..', '...XX...', '..DXD...', '..DDD...'],
  },
};

const FLOWERING_PHASES = new Set(['flowering', 'late_flower', 'harvest_ready']);

const PHASE_ANIM = {
  germination:   'plant-sprout',
  clone_rooting: 'plant-sprout',
  seedling:      'plant-sprout',
  vegetative:    'plant-sway',
  flowering:     'bud-pulse',
  late_flower:   'bud-pulse',
  harvest_ready: 'pixel-blink',
  ready:         'pixel-glow',
};

function hexRgb(h) {
  const s = h.replace('#','');
  return [parseInt(s.slice(0,2),16), parseInt(s.slice(2,4),16), parseInt(s.slice(4,6),16)];
}
function darken(hex, a = 60) {
  const [r,g,b] = hexRgb(hex);
  return `rgb(${Math.max(0,r-a)},${Math.max(0,g-a)},${Math.max(0,b-a)})`;
}
function lighten(hex, factor = 0.65) {
  const [r,g,b] = hexRgb(hex);
  return `rgb(${Math.round(r+(255-r)*factor)},${Math.round(g+(255-g)*factor)},${Math.round(b+(255-b)*factor)})`;
}

function getBudStyle(plant) {
  if (plant.type === 'auto') return 'auto';
  // Deterministic hash: indica vs sativa for photo/hybrid strains
  const id = plant.strainId ?? '';
  let h = 0;
  for (let i = 0; i < id.length; i++) h += id.charCodeAt(i);
  return h % 2 === 0 ? 'indica' : 'sativa';
}

function Sprite({ phase, color, budStyle, px = 5 }) {
  let rows;
  if (budStyle && FLOWERING_PHASES.has(phase)) {
    rows = STRAIN_SPRITES[budStyle]?.[phase] ?? SPRITES[phase];
  } else {
    rows = SPRITES[phase] ?? SPRITES.germination;
  }
  const dark   = darken(color);
  const bright = lighten(color);
  return (
    <div style={{ display:'grid', gridTemplateColumns:`repeat(8,${px}px)`, gridTemplateRows:`repeat(8,${px}px)`, imageRendering:'pixelated' }}>
      {rows.flatMap((row, y) => row.split('').map((c, x) => (
        <div key={`${y}-${x}`} style={{
          width: px, height: px,
          backgroundColor: c==='X' ? color : c==='D' ? dark : c==='B' ? bright : 'transparent',
        }} />
      )))}
    </div>
  );
}

const PHASE_LABELS = {
  germination:'KEIM', clone_rooting:'STECKLING', seedling:'SÄML.', vegetative:'VEG',
  flowering:'BLÜTE', late_flower:'SPÄT', harvest_ready:'REIF', drying:'TROCKEN',
  curing:'CURING', ready:'FERTIG',
};

function PlantTile({ plant, size, spritePx, onClick }) {
  const px         = spritePx ?? (size >= 80 ? 6 : 5);
  const color      = plant.strainColor || '#86efac';
  const budStyle   = getBudStyle(plant);
  const animClass  = PHASE_ANIM[plant.phase] ?? '';
  const dry        = plant.daysUnwatered ?? 0;
  const needsWater = dry > 0 && !['drying','curing','ready'].includes(plant.phase);
  const dryColor   = dry >= 3 ? '#ef4444' : dry >= 2 ? '#f97316' : '#93c5fd';

  return (
    <div
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all hover:brightness-125 ${animClass}`}
      style={{
        width: size, height: size,
        background: '#0d1a08',
        border: `2px solid ${needsWater ? dryColor+'80' : color+'50'}`,
        imageRendering: 'pixelated',
        userSelect: 'none',
      }}
      title={`${plant.strainName} — ${plant.phase}${dry > 0 ? ` — ${dry}d ohne Wasser!` : ''}`}
    >
      <Sprite phase={plant.phase} color={color} budStyle={budStyle} px={px} />
      <div style={{ fontFamily:"'Press Start 2P',monospace", fontSize:4, color, letterSpacing:0, lineHeight:1.4, textAlign:'center' }}>
        {PHASE_LABELS[plant.phase] ?? plant.phase.toUpperCase()}
      </div>
      {/* health strip */}
      <div style={{ width:'80%', height:2, background:'#111' }}>
        <div style={{ height:'100%', width:`${plant.health}%`, background: plant.health>60?'#22c55e':plant.health>30?'#eab308':'#ef4444' }} />
      </div>
      {/* badges row */}
      <div style={{ display:'flex', gap:3, alignItems:'center', height:6 }}>
        {needsWater && (
          <div style={{ fontFamily:"'Press Start 2P',monospace", fontSize:3, color:dryColor, lineHeight:1 }}>
            {dry >= 2 ? '!!' : '!'}{dry}D
          </div>
        )}
        {plant.isMother && (
          <div style={{ fontFamily:"'Press Start 2P',monospace", fontSize:3, color:'#4ade80', lineHeight:1 }}>M</div>
        )}
      </div>
    </div>
  );
}

function EmptyPotTile({ size, potIndex, onClick }) {
  return (
    <div
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-1 cursor-pointer hover:brightness-125 transition-all"
      style={{ width:size, height:size, background:'#1a0f05', border:'2px solid #3d2a14', imageRendering:'pixelated', userSelect:'none' }}
      title={`Topf ${potIndex + 1} — leer (klicken zum Bepflanzen)`}
    >
      <div style={{ width:22, height:18, background:'#7c4a1e', borderRadius:'0 0 5px 5px', border:'2px solid #5a3410', position:'relative' }}>
        <div style={{ position:'absolute', top:-4, left:-2, right:-2, height:6, background:'#8b5e2e', border:'2px solid #5a3410' }} />
      </div>
      <div style={{ fontFamily:"'Press Start 2P',monospace", fontSize:4, color:'#4a3318' }}>LEER</div>
    </div>
  );
}

function NoSlotTile({ size }) {
  return (
    <div style={{ width:size, height:size, background:'#0a0a0a', border:'2px solid #111', imageRendering:'pixelated' }} />
  );
}

function WallTile({ size, corner, top, side }) {
  return (
    <div style={{ width:size, height:size, background: corner?'#3d2a14':'#2a1c0a', border:'2px solid #4a3318', imageRendering:'pixelated',
      display:'flex', alignItems:'center', justifyContent:'center' }}>
      {corner && <div style={{ width:6, height:6, background:'#6b4a22', border:'1px solid #8b6a32' }} />}
      {top  && !corner && <div style={{ width:'60%', height:4,   background:'#4a3318' }} />}
      {side && !corner && <div style={{ width:4,   height:'60%', background:'#4a3318' }} />}
    </div>
  );
}

export default function PixelView({ room, plants, onPlantClick, onEmptyPotClick }) {
  if (!room?.tent) return (
    <div className="pixel-border" style={{ borderColor:'#2a1c0a', background:'#0a0a0a', padding:16, display:'inline-block' }}>
      <div className="pixel-font" style={{ fontSize:7, color:'#4a3318' }}>KEIN ZELT — KAUFE EIN ZELT IM SHOP</div>
    </div>
  );

  const tent      = room.tent;
  const maxPlants = tent.maxPlants;
  const cols      = maxPlants <= 1 ? 1 : maxPlants <= 2 ? 2 : maxPlants <= 4 ? 2 : maxPlants <= 9 ? 3 : 4;
  const rows      = Math.ceil(maxPlants / cols);
  const totalCols = cols + 2;
  const totalRows = rows + 2;

  // Proportional tile sizes: tent_120 (120cm) should be 3× wider than tent_40 (40cm)
  // Widths: tent_40≈220px, tent_60≈342px (1.56×), tent_80≈438px (2×),
  //         tent_100≈548px (2.49×), tent_120≈668px (3×)
  const TENT_SIZES = {
    tent_40:  { tileSize: 72,  spritePx: 5 },
    tent_60:  { tileSize: 84,  spritePx: 5 },
    tent_80:  { tileSize: 108, spritePx: 6 },
    tent_100: { tileSize: 108, spritePx: 7 },
    tent_120: { tileSize: 132, spritePx: 8 },
  };
  const { tileSize, spritePx } = TENT_SIZES[tent.id] ?? { tileSize: 80, spritePx: 5 };

  const lampColor = !room.lamp ? '#333'
    : room.lamp.id?.startsWith('led') ? '#4ade80'
    : room.lamp.id?.startsWith('hps') ? '#fde68a'
    : room.lamp.id?.startsWith('cmh') ? '#f0abfc'
    : '#fbbf24';

  const slots = Array.from({ length: maxPlants }, (_, i) => {
    const plant  = plants.find(p => p.roomId === room.id && p.potIndex === i && p.phase !== 'ready');
    const hasPot = i < room.pots.length;
    return { index: i, plant, hasPot };
  });

  return (
    <div className="pixel-tent pixel-border" style={{ borderColor:'#4a3318', display:'inline-block', padding:8 }}>
      {/* Lamp strip */}
      {room.lamp ? (
        <div className="pixel-font" style={{ fontSize:5, color:lampColor, display:'flex', alignItems:'center', gap:6, borderBottom:`1px solid ${lampColor}40`, paddingBottom:5, marginBottom:4 }}>
          <div style={{ width:5, height:5, background:lampColor }} />
          {room.lamp.name.toUpperCase()} · {room.lampHours}H · {room.lampIntensity}%
          <div style={{ width:5, height:5, background:lampColor }} />
        </div>
      ) : (
        <div className="pixel-font" style={{ fontSize:5, color:'#333', borderBottom:'1px solid #222', paddingBottom:5, marginBottom:4 }}>
          — KEINE LAMPE —
        </div>
      )}

      {/* Grid */}
      <div style={{ display:'grid', gridTemplateColumns:`repeat(${totalCols},${tileSize}px)`, gridTemplateRows:`repeat(${totalRows},${tileSize}px)`, gap:2, imageRendering:'pixelated' }}>
        {Array.from({ length: totalRows }).flatMap((_, r) =>
          Array.from({ length: totalCols }).map((_, c) => {
            const key = `${r}-${c}`;
            const isCorner = (r===0||r===totalRows-1) && (c===0||c===totalCols-1);
            const isTB = r===0 || r===totalRows-1;
            const isLR = c===0 || c===totalCols-1;
            if (isTB || isLR) return <WallTile key={key} size={tileSize} corner={isCorner} top={isTB&&!isCorner} side={isLR&&!isCorner} />;

            const si   = (r-1)*cols + (c-1);
            const slot = slots[si];
            if (!slot) return <NoSlotTile key={key} size={tileSize} />;
            if (slot.plant) return <PlantTile key={key} plant={slot.plant} size={tileSize} spritePx={spritePx} onClick={() => onPlantClick(slot.plant.id)} />;
            if (slot.hasPot) return <EmptyPotTile key={key} size={tileSize} potIndex={slot.index} onClick={() => onEmptyPotClick(room.id, slot.index)} />;
            return <NoSlotTile key={key} size={tileSize} />;
          })
        )}
      </div>

      {/* Legend */}
      <div className="pixel-font" style={{ fontSize:5, color:'#444', borderTop:'1px solid #1a1a1a', paddingTop:5, marginTop:4, display:'flex', gap:12 }}>
        <span style={{ color:'#3d2a14' }}>█ WAND</span>
        <span style={{ color:'#7c4a1e' }}>▣ TOPF</span>
        <span style={{ color:'#22c55e' }}>▦ PFLANZE</span>
      </div>
    </div>
  );
}
