import React from 'react';

// ─── Scale factor — change this one value to resize the entire plan ───────────
const SC = 0.78;
const s = (v) => Math.round(v * SC);

// ─── LABELS — amend any label here ───────────────────────────────────────────
const LABELS = {
  // Right wing (top → bottom)
  rm15:   'RM 15',
  fe:     'FE',
  rm14:   'RM 14',
  rm13:   'RM 13',
  rm12:   'RM 12',
  rm11:   'RM 11',
  rm10:   'RM 10',
  rm9:    'RM 9',
  rm8:    'RM 8',
  vc:     'VC',          // vertical corridor label

  // Bottom row — left
  rm1: 'RM 1', rm2: 'RM 2', rm3: 'RM 3',
  rm4: 'RM 4', rm5: 'RM 5',

  // Bottom row — right of corridor
  rhs1: 'RM 4',   // x=795 — amend if needed
  rhs2: 'RM 6',   // x=873
  rhs3: 'RM 7',   // far-right upper
  rhs4: 'RM 7b',  // far-right lower

  // Middle wider rooms
  ns:     'NS',
  tr:     'TR',
  op:     'OP',
  store:  'Store',
  common: 'Common\nRoom',

  // Bottom-left cluster
  sa2:    'SA2',   // section label
  sa2r:   'SA2',   // far-right exterior room
  lc1:    'LC1',   // corridor/closet between SA2 and middle rooms
  storeA: '',
  storeB: 'Storeroom',
  storeC: 'Utility',

  // Central shapes
  pt:       'PT',       // hexagon group room
  diamond:  '',         // diamond room
  entrance:     'Entrance',       // right wing entrance
  se:           'SE',             // staff entrance right of 6th window
  mainEntrance: 'Main Entrance',  // reception entrance on diamond top-right
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
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    textAlign: 'center', padding: 3,
    fontFamily: '"Segoe UI", Arial, sans-serif',
    whiteSpace: 'pre-line',
    ...style,
  }}>
    <span style={{ fontSize: s(fontSize), fontWeight: 700, lineHeight: 1.25, color: '#111' }}>
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

// ─── HEXAGON — pointy-top/bottom, flat vertical sides
// clip-path: left/right sides are straight vertical lines,
// matching the grey vertical rectangles of the courtyard recesses.
// Points (clockwise from top):  top, top-right, bottom-right, bottom, bottom-left, top-left
const Hexagon = ({ x, y, w, h, label, fontSize = 13 }) => (
  <div style={{
    position: 'absolute',
    left: s(x), top: s(y),
    width: s(w), height: s(h),
    background: '#D9D9D9',
    // flat vertical sides at 0%/100% x; angled at 25%/75% y
    clipPath: 'polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%)',
    // ↑ This is technically an octagon clip but the two short diagonals at corners
    //   reproduce the original shape exactly. For a true 6-sided hex with flat vertical sides:
    // clipPath: 'polygon(0% 25%, 50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%)',
    outline: '1.5px solid #333',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'Arial, sans-serif', fontWeight: 700,
    fontSize: s(fontSize), color: '#111',
    boxSizing: 'border-box',
  }}>
    {label}
  </div>
);

// ─── DIAMOND — inline SVG, bottom truncated where it meets the passage walls
// passageLeft / passageRight are the x coords of the connecting passage walls
const Diamond = ({ cx, cy, size, label, fontSize = 11, passageLeft = 78, passageRight = 139 }) => {
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
  const gapSize = 22;
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
      <polygon points={polyPoints} fill="#D9D9D9" stroke="none" />
      {/* Border — all sides except the open bottom edge (clipR→clipL is the passage opening) */}
      {/* Left side: left → top */}
      <line x1={s(left[0]-minX)}  y1={s(left[1]-minY)}
            x2={s(top[0]-minX)}   y2={s(top[1]-minY)}
            stroke="#111" strokeWidth="4" />
      {/* Top-right side split by entrance gap */}
      <line x1={s(top[0]-minX)}  y1={s(top[1]-minY)}
            x2={s(g1[0]-minX)}   y2={s(g1[1]-minY)}
            stroke="#111" strokeWidth="4" />
      <line x1={s(g2[0]-minX)}   y1={s(g2[1]-minY)}
            x2={s(right[0]-minX)} y2={s(right[1]-minY)}
            stroke="#111" strokeWidth="4" />
      {/* Right side: right → clipR */}
      <line x1={s(right[0]-minX)} y1={s(right[1]-minY)}
            x2={s(clipR[0]-minX)} y2={s(clipR[1]-minY)}
            stroke="#111" strokeWidth="4" />
      {/* Left side: clipL → left */}
      <line x1={s(clipL[0]-minX)} y1={s(clipL[1]-minY)}
            x2={s(left[0]-minX)}  y2={s(left[1]-minY)}
            stroke="#111" strokeWidth="4" />
      {/* Door jambs at entrance gap */}
      <line x1={s(j1a[0]-minX)} y1={s(j1a[1]-minY)}
            x2={s(j1b[0]-minX)} y2={s(j1b[1]-minY)}
            stroke="#111" strokeWidth="3" />
      <line x1={s(j2a[0]-minX)} y1={s(j2a[1]-minY)}
            x2={s(j2b[0]-minX)} y2={s(j2b[1]-minY)}
            stroke="#111" strokeWidth="3" />
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
  return (
    <div style={{ overflow: 'auto', background: '#9a9a9a', padding: 20, minHeight: '100vh' }}>
      <div style={{
        fontFamily: 'Arial, sans-serif', fontSize: 13, color: '#222',
        marginBottom: 10, fontWeight: 600,
      }}>
        Cuan Mhuire – Detox Unit · Floor Plan Draft 2
        <span style={{ fontSize: 10, fontWeight: 400, color: '#555', marginLeft: 14 }}>
          All labels are in the LABELS object at the top of the file
        </span>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          CANVAS
      ═══════════════════════════════════════════════════════════ */}
      <div style={{
        position: 'relative',
        width: s(1165), height: s(1034),
        background: '#F5F5F5',
        boxShadow: '0 4px 24px rgba(0,0,0,0.45)',
        isolation: 'isolate',
      }}>

        {/* ───────────────────────────────────────────────────────
            RIGHT VERTICAL WING
        ─────────────────────────────────────────────────────── */}

        {/* Corridor strip */}
        <Rect x={975} y={57} w={70} h={631} border="none" />

        {/* RM 15 — header room */}
        <Room x={897.5} y={0} w={147} h={57} label={LABELS.rm15} />

        {/* Thin divider inside header room */}
        <Wall x={913} y={0} w={0.5} h={57} color="#777" />
        {/* Small square fixture in header */}
        <Rect x={903} y={47} w={10} h={10} bg="#C8C8C8" border="none" />

        {/* FE — fire exit / stairwell */}
        <Room x={897} y={57} w={78} h={50} label={LABELS.fe} />

        {/* RM 8–14 stacked bedrooms */}
        {[
          { y: 107.5, lbl: LABELS.rm14 },
          { y: 180.5, lbl: LABELS.rm13 },
          { y: 253.5, lbl: LABELS.rm12 },
          { y: 326.5, lbl: LABELS.rm11 },
          { y: 399.5, lbl: LABELS.rm10 },
          { y: 472.5, lbl: LABELS.rm9  },
          { y: 545.5, lbl: LABELS.rm8  },
        ].map(({ y, lbl }) => (
          <Room key={lbl} x={897.5} y={y} w={77} h={72} label={lbl} />
        ))}

        {/* VC label in corridor strip */}
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
        <Room x={967.5} y={689.5} w={77} h={72} label={LABELS.rhs3} />
        <Room x={967.5} y={762.5} w={77} h={72} label={LABELS.rhs4} />

        {/* SA2 exterior room (far right of corridor) */}
        <Room x={1057} y={614} w={108} h={73} label={LABELS.sa2r} />

        {/* ───────────────────────────────────────────────────────
            MAIN HORIZONTAL CORRIDOR
        ─────────────────────────────────────────────────────── */}

        {/* Corridor fill — same grey as diamond so no seam */}
        <Rect x={0} y={618} w={975} h={70} bg="#D9D9D9" border="none" style={{ zIndex: 1 }} />

        {/* ── CORRIDOR WALL ─────────────────────────────────────────
            Two black sections split by the SE staff entrance gap
            at x=468–496. Six window openings in the left section. */}

        {/* Left wall section: x=139 → x=468 */}
        <div style={{
          position: 'absolute',
          left: s(139), top: s(610),
          width: s(329), height: s(8),
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

        {/* Right wall section: x=496 → x=897, 8 evenly spaced windows */}
        <div style={{
          position: 'absolute',
          left: s(496), top: s(610),
          width: s(401), height: s(8),
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

        {/* SE staff entrance — clean gap x=468→496, with door-jamb marks */}
        {/* Left jamb */}
        <div style={{
          position: 'absolute',
          left: s(465), top: s(605),
          width: s(3), height: s(18),
          background: '#111', zIndex: 2,
        }} />
        {/* Right jamb */}
        <div style={{
          position: 'absolute',
          left: s(496), top: s(605),
          width: s(3), height: s(18),
          background: '#111', zIndex: 2,
        }} />

        {/* SE label */}
        <div style={{
          position: 'absolute',
          left: s(471), top: s(594),
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
          {[107.5, 180.5, 253.5, 326.5, 399.5, 472.5, 545.5].map((roomY, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: s(2), top: s(roomY + 34),
              width: s(4), height: s(20),
              background: '#F5F5F5',
            }} />
          ))}
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
          <div style={{
            position: 'absolute',
            left: 0, top: s(631),
            width: s(8), height: s(27),
            background: '#F5F5F5',
          }} />
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

        {/* ── Horizontal corridor — BOTTOM outer wall */}
        <Wall x={0} y={688} w={975} h={WALL_THICK} />

        {/* ── Connecting passage walls — left and right only, open at top into diamond */}
        <Wall x={78}  y={561} w={WALL_THICK} h={57} />
        <Wall x={139} y={561} w={WALL_THICK} h={57} />
        <Wall x={0}   y={618} w={WALL_THICK} h={70} />

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

        {/* ───────────────────────────────────────────────────────
            BOTTOM ROW — MIDDLE (wider rooms)
        ─────────────────────────────────────────────────────── */}

        <Room x={459.5} y={688.5} w={147} h={72}  label={LABELS.ns}     />
        <Room x={607.5} y={688.5} w={148} h={72}  label={LABELS.tr}     />
        <Room x={459.5} y={761.5} w={147} h={54}  label={LABELS.op}     />
        <Room x={607.5} y={761.5} w={147} h={54}  label={LABELS.store}  />
        <Room x={459.5} y={816.5} w={147} h={217} label={LABELS.common} />

        {/* ───────────────────────────────────────────────────────
            BOTTOM ROW — RIGHT
        ─────────────────────────────────────────────────────── */}

        <Room x={795.5} y={688.5} w={77} h={72} label={LABELS.rhs1} />
        <Room x={873.5} y={688.5} w={77} h={72} label={LABELS.rhs2} />

        {/* ───────────────────────────────────────────────────────
            BOTTOM-LEFT CLUSTER  (SA2 section)
        ─────────────────────────────────────────────────────── */}

        {/* Section label "SA2" floating above rooms */}
        <div style={{
          position: 'absolute', left: s(307), top: s(778),
          fontSize: s(12), fontFamily: 'Arial', fontWeight: 700, color: '#333',
        }}>
          {LABELS.sa2}
        </div>

        {/* Main SA2 room (top) with two sub-divisions */}
        <Room x={298.5} y={799.5} w={84} h={68} label="" />
        <Rect x={298.5} y={799.5} w={45} h={16} bg="#C0C0C0" border="1px solid #555" />
        <Rect x={340.5} y={799.5} w={42} h={25} bg="#C0C0C0" border="1px solid #555" />

        {/* Two further rooms below */}
        <Room x={298.5} y={868.5} w={84} h={68}  label={LABELS.storeB} fontSize={9} />
        <Room x={298.5} y={925.5} w={84} h={108} label={LABELS.storeC} fontSize={9} />

        {/* Vertical divider at left of SA2 cluster */}
        <Wall x={298} y={761} w={WALL_THIN} h={38} />

        {/* LC1 label — corridor/closet between clusters */}
        <div style={{
          position: 'absolute', left: s(390), top: s(806),
          fontSize: s(11), fontFamily: 'Arial', fontWeight: 600, color: '#444',
        }}>
          {LABELS.lc1}
        </div>

        {/* Bottom edge line */}
        <Wall x={383} y={1033} w={76} h={1} color="#111" />

        {/* ───────────────────────────────────────────────────────
            CENTRAL COURTYARD / INNER VOID
        ─────────────────────────────────────────────────────── */}

        {/* Courtyard background */}
        <Rect
          x={273.5} y={271.5} w={439} h={289}
          bg="#F5F5F5" border="1px solid #C8C8C8"
        />

        {/* North connector recess (above pentagon) */}
        <Rect x={459.5} y={271.5} w={43} h={94} bg="#EBEBEB" border="1px solid #C0C0C0" />

        {/* South connector recess (below pentagon) */}
        <Rect x={459.5} y={462.5} w={39} h={98} bg="#EBEBEB" border="1px solid #C0C0C0" />

        {/* Sub-room alcove / passage connecting diamond to corridor */}
        <Rect x={78} y={561} w={61} h={57} bg="#D9D9D9" border="none" style={{ zIndex: 0 }} />

        {/* ───────────────────────────────────────────────────────
            HEXAGON — central group room
            Pointy top/bottom; flat vertical sides align with the
            grey north/south courtyard recesses (x≈459–502).
            Original SVG path spans x:429–523, y:367–462
        ─────────────────────────────────────────────────────── */}

        <Hexagon x={429} y={367} w={94} h={95} label={LABELS.pt} fontSize={13} />

        {/* ───────────────────────────────────────────────────────
            DIAMOND — rotated square div
            Original SVG: top(109,415) right(195,503) bottom(108,589) left(22,502)
            Centre ≈ (108.5, 502), bounding square side ≈ 174
        ─────────────────────────────────────────────────────── */}

        <Diamond cx={108.5} cy={502} size={174} label={LABELS.diamond} />

        {/* ───────────────────────────────────────────────────────
            DOOR SYMBOL (central corridor area)
        ─────────────────────────────────────────────────────── */}

        <Rect x={550.5} y={672.5} w={54} h={17} bg="#D9D9D9" border="1px solid #555" />

      </div>
    </div>
  );
}
