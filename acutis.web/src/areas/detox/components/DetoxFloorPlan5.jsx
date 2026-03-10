import React, { useEffect, useRef, useState } from 'react';

// ─── Scale factor — change this one value to resize the entire plan ───────────
const SC = 0.78;
const s = (v) => Math.round(v * SC);

// ─── LABELS — amend any label here ───────────────────────────────────────────
const LABELS = {
  // Right wing (top → bottom)
  rm15:   '15',
  fe:     'FE',
  rm14:   '14',
  rm13:   '13',
  rm12:   '12',
  rm11:   '11',
  rm10:   '10',
  rm9:    '9',
  rm8:    '8',
  vc:     'VC',

  // Bottom row — left
  rm1: '1', rm2: '2', rm3: '3',
  rm4: '4', rm5: '5',

  // Bottom row — right of corridor
  rhs1: '16',
  rhs2: '6',
  rhs3: '7',
  rhs4: 'RM 7b',

  // Middle wider rooms
  ns:     'NS',
  tr:     'TR',
  op:     'OP',
  store:  'Store',
  common: 'Detox Kitchen',

  // Bottom-left cluster
  sa2:    'SA1 (Smoking Area)',
  sa2r:   'SA2',
  lc1:    'LC1',
  storeA: 'Staff WC',
  storeB: 'Waiting Room',
  storeC: 'Utility',

  // Central shapes
  pt:       'PT',
  diamond:  '',
  entrance:     'Entrance',
  se:           'SE',
  mainEntrance: 'Main Entrance',
};

// ─── Primitives ───────────────────────────────────────────────────────────────

const Rect = ({ x, y, w, h, bg = '#D9D9D9', border = '1px solid #333', style = {}, children }) => (
  <div style={{
    position: 'absolute',
    left: s(x), top: s(y),
    width: s(w), height: s(h),
    background: bg, border,
    boxSizing: 'border-box',
    ...style,
  }}>
    {children}
  </div>
);

const Room = ({ x, y, w, h, label, fontSize = 11, style = {} }) => (
  <Rect x={x} y={y} w={w} h={h} style={{
    fontFamily: '"Segoe UI", Arial, sans-serif',
    ...style,
  }}>
    <span style={{
      position: 'absolute', top: s(3), right: s(4),
      fontSize: s(fontSize), fontWeight: 700, lineHeight: 1.25, color: '#111',
      whiteSpace: 'pre-line',
    }}>
      {label}
    </span>
  </Rect>
);

const WALL_THIN  = 1;   // internal partition
const WALL_THICK = 4;   // outer structural wall

const Wall = ({ x, y, w = WALL_THIN, h = WALL_THIN, color = '#111', zIndex = 2 }) => (
  <div style={{
    position: 'absolute',
    left:   s(x), top:    s(y),
    width:  w <= WALL_THIN ? WALL_THIN  : s(w),
    height: h <= WALL_THIN ? WALL_THIN  : s(h),
    background: color,
    zIndex,
  }} />
);

// ─── Roundel — circle representing a bed/occupant position ──────────────────
const Roundel = ({ cx, cy, r = 10, name = '' }) => (
  <div style={{
    position: 'absolute',
    left: s(cx - r), top: s(cy - r),
    width: s(r * 2), height: s(r * 2),
    borderRadius: '50%',
    background: '#fff',
    border: '1.5px solid #555',
    boxSizing: 'border-box',
    zIndex: 4,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    {/* Name tag — present in DOM but not visible */}
    <span style={{ fontSize: s(7), color: '#111', visibility: 'hidden', whiteSpace: 'nowrap' }}>{name}</span>
  </div>
);

// Place two roundels diagonally — top-left and bottom-right — max size
const TwoRoundels = ({ x, y, w, h, name1 = '', name2 = '' }) => {
  const r = Math.floor(Math.min(w * 0.26, h * 0.26));
  return (
    <React.Fragment>
      <Roundel cx={x + w * 0.28} cy={y + h * 0.32} r={r} name={name1} />
      <Roundel cx={x + w * 0.72} cy={y + h * 0.72} r={r} name={name2} />
    </React.Fragment>
  );
};


// clip-path: left/right sides are straight vertical lines,
// matching the grey vertical rectangles of the courtyard recesses.
// Points (clockwise from top):  top, top-right, bottom-right, bottom, bottom-left, top-left
const Hexagon = ({ x, y, w, h, label, fontSize = 13, bg = '#EBEBEB', border = '1.5px solid #333', useBorder = false }) => (
  <div style={{
    position: 'absolute',
    left: s(x), top: s(y),
    width: s(w), height: s(h),
    background: bg,
    clipPath: 'polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%)',
    ...(useBorder
      ? { border, borderTop: 'none', borderBottom: 'none' }
      : { outline: border }),
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'Arial, sans-serif', fontWeight: 700,
    fontSize: s(fontSize), color: '#111',
    boxSizing: 'border-box',
  }}>
    {label}
  </div>
);

// ─── Draws only the 4 visible border faces of the outer hexagon
// Skips: top, top-left diagonal, top-right diagonal, bottom
const OuterHexBorder = ({ x, y, w, h }) => {
  // 8 clip-path points mapped to actual coords
  const pts = [
    [x + w * 0.25, y],           // 0 top-left
    [x + w * 0.75, y],           // 1 top-right
    [x + w,        y + h * 0.25],// 2 right-top
    [x + w,        y + h * 0.75],// 3 right-bottom
    [x + w * 0.75, y + h],       // 4 bottom-right
    [x + w * 0.25, y + h],       // 5 bottom-left
    [x,            y + h * 0.75],// 6 left-bottom
    [x,            y + h * 0.25],// 7 left-top
  ];
  // Only draw: 7→6 (left), 6→5 (bottom-left diag), 4→3 (bottom-right diag), 3→2 (right)
  const lines = [[7,0],[7,6],[6,5],[4,3],[3,2],[1,2]];
  const pad = 4;
  const minX = x - pad, minY = y - pad;
  const svgW = w + pad * 2, svgH = h + pad * 2;
  const p = ([px, py]) => `${s(px - minX)},${s(py - minY)}`;
  return (
    <svg style={{
      position: 'absolute',
      left: s(minX), top: s(minY),
      width: s(svgW), height: s(svgH),
      overflow: 'visible', zIndex: 1, pointerEvents: 'none',
    }}>
      {lines.map(([a, b], i) => (
        <line key={i}
          x1={p(pts[a]).split(',')[0]} y1={p(pts[a]).split(',')[1]}
          x2={p(pts[b]).split(',')[0]} y2={p(pts[b]).split(',')[1]}
          stroke="#C0C0C0" strokeWidth="1"
        />
      ))}
    </svg>
  );
};
// passageLeft / passageRight are the x coords of the connecting passage walls
const Diamond = ({ cx, cy, size, label, fontSize = 11, passageLeft = 78, passageRight = 139, fill = '#D9D9D9' }) => {
  const half  = size / 2;
  const top   = [cx,        cy - half];
  const right = [cx + half, cy       ];
  const bot   = [cx,        cy + half];
  const left  = [cx - half, cy       ];

  // Intersection of bottom-right edge (right→bot) with x=passageRight
  const brT  = (right[0] - passageRight) / (right[0] - bot[0]);
  const brY  = right[1] + brT * (bot[1] - right[1]);

  // Intersection of bottom-left edge (left→bot) with x=passageLeft
  const blT  = (passageLeft - left[0]) / (bot[0] - left[0]);
  const blY  = left[1] + blT * (bot[1] - left[1]);

  const clipR = [passageRight, brY];   // where right edge meets passage right wall
  const clipL = [passageLeft,  blY];   // where left edge meets passage left wall

  // Gap on the top-right edge — main entrance to reception
  const gapSize = 44;
  const edgeLen = half * Math.sqrt(2);
  const ux  = (right[0] - top[0]) / edgeLen;
  const uy  = (right[1] - top[1]) / edgeLen;
  const gcx = (top[0] + right[0]) / 2;
  const gcy = (top[1] + right[1]) / 2;
  const g1  = [gcx - (gapSize / 2) * ux, gcy - (gapSize / 2) * uy];
  const g2  = [gcx + (gapSize / 2) * ux, gcy + (gapSize / 2) * uy];

  const jl  = 6;
  const px  =  uy;
  const py  = -ux;
  const j1a = [g1[0] - jl * px, g1[1] - jl * py];
  const j1b = [g1[0] + jl * px, g1[1] + jl * py];
  const j2a = [g2[0] - jl * px, g2[1] - jl * py];
  const j2b = [g2[0] + jl * px, g2[1] + jl * py];

  const pad  = 10;
  const minX = cx - half - pad;
  const minY = cy - half - pad;
  const svgW = size + pad * 2;
  const svgH = size + pad * 2;
  const p    = ([px, py]) => `${s(px - minX)},${s(py - minY)}`;

  // 5-point polygon: top → right → clipR → clipL → left  (no bottom vertex)
  const polyPoints = [top, right, clipR, clipL, left].map(p).join(' ');

  return (
    <svg style={{
      position: 'absolute',
      left: s(minX), top: s(minY),
      width: s(svgW), height: s(svgH),
      overflow: 'visible',
      zIndex: 0,
    }}>
      {/* Fill — truncated pentagon */}
      <polygon points={polyPoints} fill={fill} stroke="none" />
      {/* Border — all sides except the open bottom edge (clipR→clipL is the passage opening) */}
      {/* Left side: left → top */}
      <line x1={s(left[0]-minX)}  y1={s(left[1]-minY)}
            x2={s(top[0]-minX)}   y2={s(top[1]-minY)}
            stroke="#111" strokeWidth="8" />
      {/* Top-right side split by entrance gap */}
      <line x1={s(top[0]-minX)}  y1={s(top[1]-minY)}
            x2={s(g1[0]-minX)}   y2={s(g1[1]-minY)}
            stroke="#111" strokeWidth="8" />
      <line x1={s(g2[0]-minX)}   y1={s(g2[1]-minY)}
            x2={s(right[0]-minX)} y2={s(right[1]-minY)}
            stroke="#111" strokeWidth="8" />
      {/* Right side: right → clipR */}
      <line x1={s(right[0]-minX)} y1={s(right[1]-minY)}
            x2={s(clipR[0]-minX)} y2={s(clipR[1]-minY)}
            stroke="#111" strokeWidth="8" />
      {/* Left side: clipL → left */}
      <line x1={s(clipL[0]-minX)} y1={s(clipL[1]-minY)}
            x2={s(left[0]-minX)}  y2={s(left[1]-minY)}
            stroke="#111" strokeWidth="8" />
      {/* Door jambs at entrance gap */}
      <line x1={s(j1a[0]-minX)} y1={s(j1a[1]-minY)}
            x2={s(j1b[0]-minX)} y2={s(j1b[1]-minY)}
            stroke="#111" strokeWidth="8" />
      <line x1={s(j2a[0]-minX)} y1={s(j2a[1]-minY)}
            x2={s(j2b[0]-minX)} y2={s(j2b[1]-minY)}
            stroke="#111" strokeWidth="8" />
      {/* Label */}
      {label && (
        <text x={s(cx-minX)} y={s(cy-minY)}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={s(fontSize)} fontFamily="Arial, sans-serif"
          fontWeight="bold" fill="#111">
          {label}
        </text>
      )}
      {/* Entrance label */}
      <text x={s(gcx-minX+8)} y={s(gcy-minY-8)}
        textAnchor="start" dominantBaseline="middle"
        fontSize={s(9)} fontFamily="Arial, sans-serif"
        fontWeight="bold" fill="#333">
        {LABELS.mainEntrance}
      </text>
    </svg>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

export default function DetoxFloorPlan() {
  const wrapperRef = useRef(null);
  const canvasWidth = s(1600);
  const canvasHeight = s(1400);
  const [fitScale, setFitScale] = useState(1);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (!wrapperRef.current) {
        return;
      }

      const availableWidth = wrapperRef.current.clientWidth - 40;
      if (availableWidth <= 0) {
        return;
      }

      setFitScale(Math.min(1, availableWidth / canvasWidth));
    };

    updateScale();

    const resizeObserver = new ResizeObserver(updateScale);
    resizeObserver.observe(wrapperRef.current);
    window.addEventListener('resize', updateScale);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, [canvasWidth]);

  const effectiveScale = fitScale * zoom;
  const zoomPercent = Math.round(zoom * 100);

  return (
    <div
      ref={wrapperRef}
      style={{
        overflow: 'hidden',
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: 16,
        padding: 24,
        boxShadow: '0 1px 3px rgba(15,23,42,0.08)',
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 12,
        fontFamily: 'Arial, sans-serif', fontSize: 13, color: '#111827',
        marginBottom: 12, fontWeight: 600,
      }}>
        <div>
          Detox Floor Plan
          <span style={{ fontSize: 10, fontWeight: 400, color: '#6b7280', marginLeft: 14 }}>
            All labels are in the LABELS object at the top of the file
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            onClick={() => setZoom((current) => Math.max(0.6, current - 0.1))}
            style={{
              border: '1px solid #d1d5db',
              background: '#fff',
              borderRadius: 8,
              padding: '6px 10px',
              fontSize: 12,
              fontWeight: 600,
              color: '#374151',
              cursor: 'pointer',
            }}
          >
            Zoom Out
          </button>
          <div style={{ minWidth: 46, textAlign: 'center', fontSize: 12, color: '#4b5563' }}>
            {zoomPercent}%
          </div>
          <button
            type="button"
            onClick={() => setZoom((current) => Math.min(1.8, current + 0.1))}
            style={{
              border: '1px solid #d1d5db',
              background: '#fff',
              borderRadius: 8,
              padding: '6px 10px',
              fontSize: 12,
              fontWeight: 600,
              color: '#374151',
              cursor: 'pointer',
            }}
          >
            Zoom In
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          CANVAS
      ═══════════════════════════════════════════════════════════ */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{
          position: 'relative',
          width: canvasWidth, height: canvasHeight,
          background: '#F5F5F5',
          boxShadow: '0 4px 24px rgba(0,0,0,0.45)',
          isolation: 'isolate',
          transform: `scale(${effectiveScale})`,
          transformOrigin: 'top center',
          marginBottom: -(canvasHeight * (1 - effectiveScale)),
          borderRadius: 12,
        }}>

        {/* ── Centring wrapper — offsets content to middle of canvas ── */}
        <div style={{
          position: 'absolute',
          left: s(217), top: s(183),
        }}>

        {/* ───────────────────────────────────────────────────────
            RIGHT VERTICAL WING
        ─────────────────────────────────────────────────────── */}

        {/* Corridor strip */}
        <Rect x={975} y={57} w={70} h={631} bg="#FFFDE7" border="none" />

        {/* Top outer wall — spans full width x=897→1045 */}
        <div style={{
          position: 'absolute',
          left: s(897), top: s(0),
          width: s(148), height: s(8),
          background: '#111',
          zIndex: 2,
        }} />
        <Room x={927.5} y={0} w={117} h={57} label={LABELS.rm15} />
        {/* Door — bottom border of RM 15, towards right */}
        {(() => { const doorW=20, doorX=927.5+117-20-10; return (
          <React.Fragment>
            <div style={{ position:'absolute', left:s(doorX), top:s(55), width:s(doorW), height:s(6), background:'#D9D9D9', zIndex:3 }} />
            <div style={{ position:'absolute', left:s(doorX-3), top:s(53), width:s(3), height:s(10), background:'#111', zIndex:3 }} />
            <div style={{ position:'absolute', left:s(doorX+doorW), top:s(53), width:s(3), height:s(10), background:'#111', zIndex:3 }} />
          </React.Fragment>
        ); })()}
        {/* Window — right wall of RM 15, centred vertically */}
        <div style={{
          position: 'absolute',
          left: s(1042), top: s(19),
          width: s(6), height: s(20),
          background: '#F5F5F5',
          zIndex: 3,
        }} />
        {/* Grey fill left of RM 15 — stops before room left border */}
        <Rect x={905} y={8} w={20} h={49} bg="#FFFDE7" border="none" />

        {/* FE — fire exit, extension of vertical corridor
            No left border (open to corridor), no top border.
            Door gap in outer left wall at x=897             */}
        <Room x={897} y={57} w={78} h={50} label={LABELS.fe}
          style={{ borderLeft: 'none', borderTop: 'none', borderRight: 'none', background: '#FFFDE7' }} />

        {/* Door gap in left outer wall — punched into the s(8) wall at x=897 */}
        <div style={{
          position: 'absolute',
          left: s(897), top: s(67),
          width: s(8), height: s(20),
          background: '#F5F5F5',
          zIndex: 3,
        }} />
        {/* Jambs */}
        <div style={{
          position: 'absolute',
          left: s(893), top: s(64),
          width: s(14), height: s(4),
          background: '#111', zIndex: 3,
        }} />
        <div style={{
          position: 'absolute',
          left: s(893), top: s(87),
          width: s(14), height: s(4),
          background: '#111', zIndex: 3,
        }} />

        {/* RM 8–14 stacked bedrooms */}
        {[
          { y: 107, lbl: LABELS.rm14, h: 75 },
          { y: 182, lbl: LABELS.rm13, h: 75 },
          { y: 257, lbl: LABELS.rm12, h: 75 },
          { y: 332, lbl: LABELS.rm11, h: 75 },
          { y: 407, lbl: LABELS.rm10, h: 74 },
          { y: 481, lbl: LABELS.rm9,  h: 74 },
          { y: 555, lbl: LABELS.rm8,  h: 63 },
        ].map(({ y, lbl, h }) => (
          <Room key={lbl} x={897.5} y={y} w={77} h={h} label={lbl} />
        ))}

        {/* Doors — centred in right border of each room, facing corridor */}
        {[
          { y: 107, h: 75 }, { y: 182, h: 75 }, { y: 257, h: 75 },
          { y: 332, h: 75 }, { y: 407, h: 74 }, { y: 481, h: 74 },
          { y: 555, h: 63 },
        ].map(({ y, h }, i) => {
          const doorH = 20;
          const doorY = y + Math.round((h - doorH) / 2);
          return (
            <React.Fragment key={i}>
              {/* White gap over room right border — minimal intrusion */}
              <div style={{
                position: 'absolute',
                left: s(972), top: s(doorY),
                width: s(5), height: s(doorH),
                background: '#D9D9D9',
                zIndex: 3,
              }} />
              {/* Top jamb */}
              <div style={{
                position: 'absolute',
                left: s(970), top: s(doorY - 3),
                width: s(8), height: s(3),
                background: '#111', zIndex: 3,
              }} />
              {/* Bottom jamb */}
              <div style={{
                position: 'absolute',
                left: s(970), top: s(doorY + doorH),
                width: s(8), height: s(3),
                background: '#111', zIndex: 3,
              }} />
            </React.Fragment>
          );
        })}
        <div style={{
          position: 'absolute',
          left: s(980), top: s(160),
          writingMode: 'vertical-rl', textOrientation: 'mixed',
          fontSize: s(10), fontFamily: 'Arial', color: '#555',
          fontWeight: 600, letterSpacing: 1,
        }}>
          {LABELS.vc}
        </div>

        {/* Far-right stacked rooms */}
        <Room x={967.5} y={688} w={77} h={72} label={LABELS.rhs3} />
        <Room x={967.5} y={760} w={77} h={72} label={LABELS.rhs4} />

        {/* SA2 exterior room — flush with right corridor wall, no left border, light green */}
        <Room x={1049} y={614} w={116} h={73} label={LABELS.sa2r}
          style={{ background: '#c8e6c9', borderLeft: 'none' }} />
        {/* Fill gap left of SA2 with corridor grey */}
        <Rect x={1045} y={614} w={12} h={73} bg="#D9D9D9" border="none" />

        {/* ───────────────────────────────────────────────────────
            MAIN HORIZONTAL CORRIDOR
        ─────────────────────────────────────────────────────── */}

        {/* Corridor fill — same grey as diamond so no seam */}
        <Rect x={0} y={618} w={975} h={70} bg="#FFFDE7" border="none" style={{ zIndex: 1 }} />

        {/* ── CORRIDOR WALL ─────────────────────────────────────────
            Two black sections split by the SE staff entrance gap
            at x=468–496. Six window openings in the left section. */}

        {/* Far-left wall section: x=0 → x=78 (stops at passage opening) */}
        <div style={{
          position: 'absolute',
          left: s(0), top: s(610),
          width: s(78), height: s(8),
          background: '#111',
          zIndex: 1,
        }} />

        {/* Left wall section: x=139 → x=462 */}
        <div style={{
          position: 'absolute',
          left: s(139), top: s(610),
          width: s(323), height: s(8),
          background: '#111',
          zIndex: 1,
        }}>
          {[
            [143, 164], [197.5, 218.5], [257.5, 278.5],
            [316, 337], [382, 403],     [433.5, 454.5],
          ].map(([x1, x2], i) => (
            <div key={i} style={{
              position: 'absolute',
              left: s(x1 - 139),
              top: s(2),
              width: s(x2 - x1),
              height: s(4),
              background: '#F5F5F5',
            }} />
          ))}
        </div>

        {/* Right wall section: x=502 → x=897, 8 evenly spaced windows */}
        <div style={{
          position: 'absolute',
          left: s(502), top: s(610),
          width: s(395), height: s(8),
          background: '#111',
          zIndex: 1,
        }}>
          {Array.from({ length: 8 }, (_, i) => {
            const spacing = 401 / 9;
            const x1 = spacing * (i + 1) - 10;
            return (
              <div key={i} style={{
                position: 'absolute',
                left: s(x1), top: s(2),
                width: s(21), height: s(4),
                background: '#F5F5F5',
              }} />
            );
          })}
        </div>

        {/* SE staff entrance — clean gap x=462→502, with door-jamb marks */}
        {/* Left jamb */}
        <div style={{
          position: 'absolute',
          left: s(459), top: s(605),
          width: s(3), height: s(18),
          background: '#111', zIndex: 2,
        }} />
        {/* Right jamb */}
        <div style={{
          position: 'absolute',
          left: s(502), top: s(605),
          width: s(3), height: s(18),
          background: '#111', zIndex: 2,
        }} />

        {/* SE label */}
        <div style={{
          position: 'absolute',
          left: s(475), top: s(594),
          fontSize: s(9), fontFamily: 'Arial', fontWeight: 700,
          color: '#222', zIndex: 3,
        }}>
          {LABELS.se}
        </div>

        {/* ═══════════════════════════════════════════════════════
            OUTER STRUCTURAL WALLS  (WALL_THICK = 4px)
        ═══════════════════════════════════════════════════════ */}

        {/* ── LEFT OUTER WALL of vertical corridor ──────────────────
            Thick black div full height y=0→618.
            White child divs = windows, one per room.              */}
        <div style={{
          position: 'absolute',
          left: s(897), top: s(0),
          width: s(8), height: s(618),
          background: '#111',
          zIndex: 2,
        }}>
          {[
            { y: 107, h: 75 }, { y: 182, h: 75 },
            /* RM 12 & 11 replaced by 3 non-uniform windows below */
            { y: 407, h: 74 }, { y: 481, h: 74 },
            { y: 555, h: 63 },
          ].map(({ y, h }, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: s(2), top: s(y + Math.round(h/2) - 2),
              width: s(4), height: s(20),
              background: '#F5F5F5',
            }} />
          ))}
          {/* 3 non-uniform windows across RM 12→RM 11 (y=257→407) */}
          <div style={{ position:'absolute', left:s(2), top:s(268), width:s(4), height:s(14), background:'#F5F5F5' }} />
          <div style={{ position:'absolute', left:s(2), top:s(300), width:s(4), height:s(26), background:'#F5F5F5' }} />
          <div style={{ position:'absolute', left:s(2), top:s(358), width:s(4), height:s(18), background:'#F5F5F5' }} />
        </div>

        {/* ── RIGHT OUTER WALL of vertical corridor ─────────────────
            Thick black div full height y=0→689.
            White child divs = windows. Entrance gap at y=631→658. */}
        <div style={{
          position: 'absolute',
          left: s(1041), top: s(0),
          width: s(8), height: s(689),
          background: '#111',
          zIndex: 2,
        }}>
          {/* Window opposite RM 8 */}
          <div style={{ position:'absolute', left:s(2), top:s(561), width:s(4), height:s(20), background:'#F5F5F5' }} />
          <div style={{
            position: 'absolute',
            left: 0, top: s(631),
            width: s(8), height: s(27),
            background: '#FFFDE7',
          }} />
          {/* 3 non-uniform distribution windows opposite RM 12 & 11 (y=257→407) */}
          <div style={{ position:'absolute', left:s(2), top:s(270), width:s(4), height:s(20), background:'#F5F5F5' }} />
          <div style={{ position:'absolute', left:s(2), top:s(316), width:s(4), height:s(20), background:'#F5F5F5' }} />
          <div style={{ position:'absolute', left:s(2), top:s(372), width:s(4), height:s(20), background:'#F5F5F5' }} />
        </div>

        {/* Entrance jambs */}
        <div style={{
          position: 'absolute',
          left: s(1034), top: s(628),
          width: s(14), height: s(WALL_THICK),
          background: '#111', zIndex: 3,
        }} />
        <div style={{
          position: 'absolute',
          left: s(1034), top: s(655),
          width: s(14), height: s(WALL_THICK),
          background: '#111', zIndex: 3,
        }} />

        {/* Entrance label */}
        <div style={{
          position: 'absolute',
          left: s(1052), top: s(636),
          fontSize: s(9), fontFamily: 'Arial', fontWeight: 700,
          color: '#444', whiteSpace: 'nowrap', zIndex: 3,
        }}>
          {LABELS.entrance}
        </div>

        {/* Bottom corridor wall removed */}

        {/* ── Connecting passage walls — left and right only, open at top into diamond */}
        <Wall x={78}  y={556} w={8} h={62} />
        <Wall x={139} y={556} w={8} h={62} />
        

        {/* ───────────────────────────────────────────────────────
            BOTTOM ROW — LEFT  RM 1–5
        ─────────────────────────────────────────────────────── */}

        {[
          { x: 0.5,   lbl: LABELS.rm1 },
          { x: 78.5,  lbl: LABELS.rm2 },
          { x: 156.5, lbl: LABELS.rm3 },
          { x: 234.5, lbl: LABELS.rm4 },
          { x: 305.5, lbl: LABELS.rm5 },
        ].map(({ x, lbl }) => (
          <Room key={lbl} x={x} y={688.5} w={77} h={72} label={lbl} />
        ))}

        {/* Doors — centred in top border of RM 1-5, facing main corridor */}
        {[0.5, 78.5, 156.5, 234.5, 305.5].map((x, i) => {
          const doorW = 20;
          const doorX = x + Math.round((77 - doorW) / 2);
          return (
            <React.Fragment key={i}>
              {/* White gap over room top border — minimal intrusion */}
              <div style={{
                position: 'absolute',
                left: s(doorX), top: s(688),
                width: s(doorW), height: s(3),
                background: '#D9D9D9',
                zIndex: 3,
              }} />
              {/* Left jamb */}
              <div style={{
                position: 'absolute',
                left: s(doorX - 3), top: s(685),
                width: s(3), height: s(8),
                background: '#111', zIndex: 3,
              }} />
              {/* Right jamb */}
              <div style={{
                position: 'absolute',
                left: s(doorX + doorW), top: s(685),
                width: s(3), height: s(8),
                background: '#111', zIndex: 3,
              }} />
            </React.Fragment>
          );
        })}

        {/* ── Bottom outer wall of RM1-5 with windows ── */}
        <div style={{
          position: 'absolute',
          left: s(0), top: s(760),
          width: s(383), height: s(8),
          background: '#111',
          zIndex: 2,
        }}>
          {[0.5, 78.5, 156.5, 234.5, 305.5].map((x, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: s(x + Math.round((77 - 20) / 2)),
              top: s(2),
              width: s(20), height: s(4),
              background: '#F5F5F5',
            }} />
          ))}
        </div>

        {/* Observation/dispensary protrusion — trapezoid on top of NS
            Base: 40% of NS width (~59px) centred on NS top border
            Protrudes ~22 units up into the corridor                */}
        <svg style={{
          position: 'absolute',
          left: s(459.5), top: s(668),
          width: s(147), height: s(22),
          overflow: 'visible', zIndex: 3,
        }}>
          {/* Fill — no base stroke */}
          <polygon
            points={`${s(44)},0 ${s(103)},0 ${s(118)},${s(20)} ${s(29)},${s(20)}`}
            fill="#D9D9D9" stroke="none"
          />
          {/* Three sides only — top and two angled sides, no base */}
          <polyline
            points={`${s(29)},${s(20)} ${s(44)},0 ${s(103)},0 ${s(118)},${s(20)}`}
            fill="none" stroke="#333" strokeWidth="1.5"
          />
        </svg>

        <Room x={459.5} y={688.5} w={147} h={72} label={LABELS.ns}
          style={{ borderTop: 'none' }} />
        {/* Redraw top border — left stub only, right side rejoins adjacent room */}
        <Wall x={459.5} y={688.5} w={29} h={1} color="#333" />
        <Wall x={577.5} y={688.5} w={29} h={1} color="#333" />
        <div style={{
          position: 'absolute',
          left: s(463), top: s(687),
          width: s(20), height: s(4),
          background: '#D9D9D9',
          zIndex: 3,
        }} />
        {/* Left jamb */}
        <div style={{
          position: 'absolute',
          left: s(461), top: s(685),
          width: s(4), height: s(8),
          background: '#111', zIndex: 3,
        }} />
        {/* Right jamb */}
        <div style={{
          position: 'absolute',
          left: s(483), top: s(685),
          width: s(4), height: s(8),
          background: '#111', zIndex: 3,
        }} />
        <Room x={607.5} y={688.5} w={148} h={72}  label={LABELS.tr}     />
        <Room x={459.5} y={760.5} w={147} h={54}  label={LABELS.op}     />
        <Room x={607.5} y={760.5} w={147} h={54}  label={LABELS.store}  />
        <Room x={459.5} y={814.5} w={147} h={243} label={LABELS.common} />

        {/* Door — OP left border facing LC1, centred */}
        {(() => { const doorH=20, doorY=760.5+Math.round((54-doorH)/2); return (
          <React.Fragment>
            <div style={{ position:'absolute', left:s(458), top:s(doorY), width:s(3), height:s(doorH), background:'#D9D9D9', zIndex:3 }} />
            <div style={{ position:'absolute', left:s(456), top:s(doorY-3), width:s(8), height:s(3), background:'#111', zIndex:3 }} />
            <div style={{ position:'absolute', left:s(456), top:s(doorY+doorH), width:s(8), height:s(3), background:'#111', zIndex:3 }} />
          </React.Fragment>
        ); })()}

        {/* Door — Detox Kitchen left border near top, facing LC1 */}
        {(() => { const doorH=20, doorY=814.5+10; return (
          <React.Fragment>
            <div style={{ position:'absolute', left:s(458), top:s(doorY), width:s(3), height:s(doorH), background:'#D9D9D9', zIndex:3 }} />
            <div style={{ position:'absolute', left:s(456), top:s(doorY-3), width:s(8), height:s(3), background:'#111', zIndex:3 }} />
            <div style={{ position:'absolute', left:s(456), top:s(doorY+doorH), width:s(8), height:s(3), background:'#111', zIndex:3 }} />
          </React.Fragment>
        ); })()}

        {/* Doors — TR, RM4, RM6 top border facing main corridor, RM7 left border */}
        {/* TR */}
        {(() => { const x=607.5, w=148, doorW=20, doorX=x+Math.round((w-doorW)/2); return (
          <React.Fragment>
            <div style={{ position:'absolute', left:s(doorX), top:s(688), width:s(doorW), height:s(3), background:'#D9D9D9', zIndex:3 }} />
            <div style={{ position:'absolute', left:s(doorX-3), top:s(685), width:s(3), height:s(8), background:'#111', zIndex:3 }} />
            <div style={{ position:'absolute', left:s(doorX+doorW), top:s(685), width:s(3), height:s(8), background:'#111', zIndex:3 }} />
          </React.Fragment>
        ); })()}
        {/* RM4 and RM6 */}
        {[795.5, 873.5].map((x, i) => { const doorW=20, doorX=x+Math.round((77-doorW)/2); return (
          <React.Fragment key={i}>
            <div style={{ position:'absolute', left:s(doorX), top:s(688), width:s(doorW), height:s(3), background:'#D9D9D9', zIndex:3 }} />
            <div style={{ position:'absolute', left:s(doorX-3), top:s(685), width:s(3), height:s(8), background:'#111', zIndex:3 }} />
            <div style={{ position:'absolute', left:s(doorX+doorW), top:s(685), width:s(3), height:s(8), background:'#111', zIndex:3 }} />
          </React.Fragment>
        ); })}
        {/* RM7 — top border door facing main corridor */}
        {(() => { const x=967.5, w=77, doorW=20, doorX=x+Math.round((w-doorW)/2); return (
          <React.Fragment>
            <div style={{ position:'absolute', left:s(doorX), top:s(687), width:s(doorW), height:s(3), background:'#D9D9D9', zIndex:3 }} />
            <div style={{ position:'absolute', left:s(doorX-3), top:s(684), width:s(3), height:s(8), background:'#111', zIndex:3 }} />
            <div style={{ position:'absolute', left:s(doorX+doorW), top:s(684), width:s(3), height:s(8), background:'#111', zIndex:3 }} />
          </React.Fragment>
        ); })()}

        <Room x={795.5} y={688.5} w={77} h={72} label={LABELS.rhs1} />
        <Room x={873.5} y={688.5} w={77} h={72} label={LABELS.rhs2} />

        {/* ───────────────────────────────────────────────────────
            BOTTOM-LEFT CLUSTER  (SA2 section)
        ─────────────────────────────────────────────────────── */}

        {/* SA2 — 25% shorter, extended left to x=234.5 (start of RM4) */}
        <Room x={234.5} y={760} w={148} h={52} label={LABELS.sa2} style={{ background: '#c8e6c9' }} />

        {/* Door on right border of SA2 */}
        {(() => { const y=760, h=52, doorH=20, doorY=y+Math.round((h-doorH)/2); return (
          <React.Fragment>
            <div style={{ position:'absolute', left:s(380), top:s(doorY), width:s(8), height:s(doorH), background:'#D9D9D9', zIndex:3 }} />
            <div style={{ position:'absolute', left:s(377), top:s(doorY-3), width:s(14), height:s(3), background:'#111', zIndex:3 }} />
            <div style={{ position:'absolute', left:s(377), top:s(doorY+doorH), width:s(14), height:s(3), background:'#111', zIndex:3 }} />
          </React.Fragment>
        ); })()}

        {/* Inserted room with embedded sub-divisions */}
        <Room x={305.5} y={812} w={77} h={68} label={LABELS.storeA} fontSize={9} />
        <Rect x={305.5} y={812} w={38} h={16} bg="#C0C0C0" border="1px solid #555" />
        <Rect x={340.5} y={812} w={42} h={25} bg="#C0C0C0" border="1px solid #555" />
        {/* Door — right border of Staff WC facing LC1 corridor */}
        {(() => { const doorH=20, doorY=812+Math.round((68-doorH)/2); return (
          <React.Fragment>
            <div style={{ position:'absolute', left:s(381), top:s(doorY), width:s(3), height:s(doorH), background:'#D9D9D9', zIndex:3 }} />
            <div style={{ position:'absolute', left:s(379), top:s(doorY-3), width:s(8), height:s(3), background:'#111', zIndex:3 }} />
            <div style={{ position:'absolute', left:s(379), top:s(doorY+doorH), width:s(8), height:s(3), background:'#111', zIndex:3 }} />
          </React.Fragment>
        ); })()}

        <Room x={305.5} y={880} w={77} h={69} label={LABELS.storeB} fontSize={9} />
        {/* Door — right border of Waiting Room facing LC1 */}
        {(() => { const doorH=20, doorY=880+Math.round((69-doorH)/2); return (
          <React.Fragment>
            <div style={{ position:'absolute', left:s(381), top:s(doorY), width:s(3), height:s(doorH), background:'#D9D9D9', zIndex:3 }} />
            <div style={{ position:'absolute', left:s(379), top:s(doorY-3), width:s(8), height:s(3), background:'#111', zIndex:3 }} />
            <div style={{ position:'absolute', left:s(379), top:s(doorY+doorH), width:s(8), height:s(3), background:'#111', zIndex:3 }} />
          </React.Fragment>
        ); })()}
        <Room x={305.5} y={949} w={77} h={108} label={LABELS.storeC} fontSize={9} />

        {/* LC1 corridor background */}
        <Rect x={383} y={688} w={76} h={369} bg="#FFFDE7" border="1px solid #333" style={{ borderTop: 'none' }} />

        {/* LC1 label — corridor/closet between clusters */}
        <div style={{
          position: 'absolute', left: s(390), top: s(806),
          fontSize: s(11), fontFamily: 'Arial', fontWeight: 600, color: '#444',
          zIndex: 3,
        }}>
          {LABELS.lc1}
        </div>

        {/* Bottom edge line — split by centred door */}
        <Wall x={383}  y={1057} w={28} h={2} color="#111" />
        <Wall x={431}  y={1057} w={28} h={2} color="#111" />
        {/* Door gap fill */}
        <div style={{ position: 'absolute', left: s(411), top: s(1055), width: s(20), height: s(6), background: '#D9D9D9', zIndex: 3 }} />
        {/* Left jamb */}
        <div style={{ position: 'absolute', left: s(408), top: s(1053), width: s(3), height: s(10), background: '#111', zIndex: 3 }} />
        {/* Right jamb */}
        <div style={{ position: 'absolute', left: s(431), top: s(1053), width: s(3), height: s(10), background: '#111', zIndex: 3 }} />

        {/* ───────────────────────────────────────────────────────
            CENTRAL COURTYARD / INNER VOID
        ─────────────────────────────────────────────────────── */}

        {/* Courtyard background */}
        <Rect
          x={274.5} y={271.5} w={439} h={289}
          bg="#F0FFF0" border="1px solid #C8C8C8"
        />

        {/* North connector recess */}
        <Rect x={460.5} y={271.5} w={43} h={94} bg="#EBEBEB" border="1px solid #C0C0C0" style={{ borderBottom: 'none' }} />

        {/* South connector recess */}
        <Rect x={460.5} y={462.5} w={39} h={98} bg="#EBEBEB" border="1px solid #C0C0C0" style={{ borderTop: 'none' }} />

        {/* Sub-room alcove / passage connecting diamond to corridor */}
        <Rect x={78} y={556} w={61} h={62} bg="#FFFDE7" border="none" style={{ zIndex: 0 }} />

        {/* ───────────────────────────────────────────────────────
            HEXAGON — central group room
            Pointy top/bottom; flat vertical sides align with the
            grey north/south courtyard recesses (x≈459–502).
            Original SVG path spans x:429–523, y:367–462
        ─────────────────────────────────────────────────────── */}

        <Hexagon x={430} y={365} w={94} h={98} label="" bg="#EBEBEB" border="none" />
        <OuterHexBorder x={430} y={365} w={94} h={98} />
        <Hexagon x={442} y={379} w={70} h={70} label={LABELS.pt} bg="#C0C0C0" />

        {/* ───────────────────────────────────────────────────────
            DIAMOND — rotated square div
            Original SVG: top(109,415) right(195,503) bottom(108,589) left(22,502)
            Centre ≈ (108.5, 502), bounding square side ≈ 174
        ─────────────────────────────────────────────────────── */}

        <Diamond cx={108.5} cy={502} size={174} label={LABELS.diamond} fill="#FFFDE7" />

        {/* ───────────────────────────────────────────────────────
            ROUNDELS — two per room (bed positions), name tags hidden
        ─────────────────────────────────────────────────────── */}

        {/* Bottom left row — RM 1–5 */}
        <TwoRoundels x={0.5}   y={688.5} w={77} h={72} name1="RM 1 Bed A"  name2="RM 1 Bed B"  />
        <TwoRoundels x={78.5}  y={688.5} w={77} h={72} name1="RM 2 Bed A"  name2="RM 2 Bed B"  />
        <TwoRoundels x={156.5} y={688.5} w={77} h={72} name1="RM 3 Bed A"  name2="RM 3 Bed B"  />
        <TwoRoundels x={234.5} y={688.5} w={77} h={72} name1="RM 4 Bed A"  name2="RM 4 Bed B"  />
        <TwoRoundels x={305.5} y={688.5} w={77} h={72} name1="RM 5 Bed A"  name2="RM 5 Bed B"  />

        {/* Bottom right — RM 16, RM 6, RM 7 */}
        <TwoRoundels x={795.5} y={688.5} w={77} h={72} name1="RM 16 Bed A" name2="RM 16 Bed B" />
        <TwoRoundels x={873.5} y={688.5} w={77} h={72} name1="RM 6 Bed A"  name2="RM 6 Bed B"  />
        <TwoRoundels x={967.5} y={688}   w={77} h={72} name1="RM 7 Bed A"  name2="RM 7 Bed B"  />

        {/* Right vertical wing — RM 8–14 */}
        <TwoRoundels x={897.5} y={555}   w={77} h={63} name1="RM 8 Bed A"  name2="RM 8 Bed B"  />
        <TwoRoundels x={897.5} y={481}   w={77} h={74} name1="RM 9 Bed A"  name2="RM 9 Bed B"  />
        <TwoRoundels x={897.5} y={407}   w={77} h={74} name1="RM 10 Bed A" name2="RM 10 Bed B" />
        <TwoRoundels x={897.5} y={332}   w={77} h={75} name1="RM 11 Bed A" name2="RM 11 Bed B" />
        <TwoRoundels x={897.5} y={257}   w={77} h={75} name1="RM 12 Bed A" name2="RM 12 Bed B" />
        <TwoRoundels x={897.5} y={182}   w={77} h={75} name1="RM 13 Bed A" name2="RM 13 Bed B" />
        <TwoRoundels x={897.5} y={107}   w={77} h={75} name1="RM 14 Bed A" name2="RM 14 Bed B" />

        {/* RM 15 — roundels sized uniform with other rooms r=18 */}
        <Roundel cx={927.5+117*0.30} cy={0+57*0.55} r={18} name="RM 15 Bed A" />
        <Roundel cx={927.5+117*0.70} cy={0+57*0.55} r={18} name="RM 15 Bed B" />

        </div> {/* end centring wrapper */}

        </div>
      </div>
    </div>
  );
}
