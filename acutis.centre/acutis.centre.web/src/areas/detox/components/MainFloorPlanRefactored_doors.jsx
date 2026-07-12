import React, { useEffect, useRef, useState } from 'react';

// Geometry-first refactor of MainFloorPlan.jsx into the Detox-style layout model.
// Labels are intentionally ignored here so the file focuses on recognisable structure.

const SC = 0.62;
const s = (v) => Math.round(v * SC);

const Rect = ({ x, y, w, h, bg = '#D9D9D9', border = '1px solid #333', style = {}, children }) => (
  <div
    style={{
      position: 'absolute',
      left: s(x),
      top: s(y),
      width: s(w),
      height: s(h),
      background: bg,
      border,
      boxSizing: 'border-box',
      ...style,
    }}
  >
    {children}
  </div>
);

const Room = ({ x, y, w, h, style = {}, children }) => (
  <Rect x={x} y={y} w={w} h={h} style={style}>
    {children}
  </Rect>
);

const Wall = ({ x, y, w, h, color = '#111', zIndex = 3 }) => (
  <div
    style={{
      position: 'absolute',
      left: s(x),
      top: s(y),
      width: s(w),
      height: s(h),
      background: color,
      zIndex,
    }}
  />
);

const WindowSlot = ({ x, y, w = 20, h = 6, vertical = false, zIndex = 4 }) => (
  <div
    style={{
      position: 'absolute',
      left: s(x),
      top: s(y),
      width: s(vertical ? h : w),
      height: s(vertical ? w : h),
      background: '#F5F5F5',
      zIndex,
    }}
  />
);

const WallRun = ({ x, y, w, h, slots = [], vertical = false, thickness = 8, color = '#111', zIndex = 4 }) => (
  <div
    style={{
      position: 'absolute',
      left: s(x),
      top: s(y),
      width: s(w),
      height: s(h),
      background: color,
      zIndex,
    }}
  >
    {slots.map((slot, i) => (
      vertical ? (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: s((w - thickness) / 2),
            top: s(slot.offset),
            width: s(thickness),
            height: s(slot.span),
            background: '#F5F5F5',
          }}
        />
      ) : (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: s(slot.offset),
            top: s((h - thickness) / 2),
            width: s(slot.span),
            height: s(thickness),
            background: '#F5F5F5',
          }}
        />
      )
    ))}
  </div>
);

const DoorGap = ({ x, y, span = 20, vertical = false, wallThickness = 8, zIndex = 5, hinge = 'start' }) => {
  const leafColor = '#555';

  if (vertical) {
    const leafLeft = hinge === 'start' ? x + 2 : x - span + 3;
    const leafTop = y + 2;

    return (
      <>
        <div style={{ position: 'absolute', left: s(x), top: s(y), width: s(5), height: s(span), background: '#D9D9D9', zIndex }} />
        <div style={{ position: 'absolute', left: s(x - 2), top: s(y - 3), width: s(wallThickness), height: s(3), background: '#111', zIndex }} />
        <div style={{ position: 'absolute', left: s(x - 2), top: s(y + span), width: s(wallThickness), height: s(3), background: '#111', zIndex }} />
        <svg
          style={{ position: 'absolute', left: s(leafLeft), top: s(leafTop), width: s(span), height: s(span), overflow: 'visible', zIndex: zIndex + 1, pointerEvents: 'none' }}
        >
          {hinge === 'start' ? (
            <>
              <line x1={0} y1={0} x2={s(span - 4)} y2={s(span - 4)} stroke={leafColor} strokeWidth="1.5" />
              <path d={`M 0 ${s(span - 2)} A ${s(span - 2)} ${s(span - 2)} 0 0 1 ${s(span - 2)} 0`} fill="none" stroke="#999" strokeWidth="1" />
            </>
          ) : (
            <>
              <line x1={s(span - 4)} y1={0} x2={0} y2={s(span - 4)} stroke={leafColor} strokeWidth="1.5" />
              <path d={`M ${s(span - 2)} ${s(span - 2)} A ${s(span - 2)} ${s(span - 2)} 0 0 0 0 0`} fill="none" stroke="#999" strokeWidth="1" />
            </>
          )}
        </svg>
      </>
    );
  }

  const leafLeft = x + 2;
  const leafTop = hinge === 'start' ? y + 2 : y - span + 3;

  return (
    <>
      <div style={{ position: 'absolute', left: s(x), top: s(y), width: s(span), height: s(5), background: '#D9D9D9', zIndex }} />
      <div style={{ position: 'absolute', left: s(x - 3), top: s(y - 2), width: s(3), height: s(wallThickness), background: '#111', zIndex }} />
      <div style={{ position: 'absolute', left: s(x + span), top: s(y - 2), width: s(3), height: s(wallThickness), background: '#111', zIndex }} />
      <svg
        style={{ position: 'absolute', left: s(leafLeft), top: s(leafTop), width: s(span), height: s(span), overflow: 'visible', zIndex: zIndex + 1, pointerEvents: 'none' }}
      >
        {hinge === 'start' ? (
          <>
            <line x1={0} y1={0} x2={s(span - 4)} y2={s(span - 4)} stroke={leafColor} strokeWidth="1.5" />
            <path d={`M 0 ${s(span - 2)} A ${s(span - 2)} ${s(span - 2)} 0 0 1 ${s(span - 2)} 0`} fill="none" stroke="#999" strokeWidth="1" />
          </>
        ) : (
          <>
            <line x1={0} y1={s(span - 4)} x2={s(span - 4)} y2={0} stroke={leafColor} strokeWidth="1.5" />
            <path d={`M 0 0 A ${s(span - 2)} ${s(span - 2)} 0 0 0 ${s(span - 2)} ${s(span - 2)}`} fill="none" stroke="#999" strokeWidth="1" />
          </>
        )}
      </svg>
    </>
  );
};

const AngledPanel = ({ points, fill = '#F5F5F5', stroke = '#111', strokeWidth = 1.5, zIndex = 4 }) => {
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const pad = 4;
  const minX = Math.min(...xs) - pad;
  const minY = Math.min(...ys) - pad;
  const maxX = Math.max(...xs) + pad;
  const maxY = Math.max(...ys) + pad;
  const local = points.map(([px, py]) => `${s(px - minX)},${s(py - minY)}`).join(' ');

  return (
    <svg
      style={{
        position: 'absolute',
        left: s(minX),
        top: s(minY),
        width: s(maxX - minX),
        height: s(maxY - minY),
        overflow: 'visible',
        zIndex,
      }}
    >
      <polygon points={local} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
    </svg>
  );
};

function TopBand() {
  return (
    <>
      <Room x={767.5} y={0.5} w={104} h={109} />
      <Room x={872.5} y={0.5} w={110} h={109} />
      <Room x={979.5} y={0.5} w={46} h={109} />
      <Room x={1026.5} y={38.5} w={152} h={73} />
      <Room x={1179.5} y={38.5} w={74} h={73} />
      <Room x={1254.5} y={37.5} w={74} h={73} />
      <Room x={1325.5} y={37.5} w={233} h={73} />
      <Room x={1559.5} y={37.5} w={57} h={72} />
      <Room x={1617.5} y={37.5} w={45} h={37} />
      <Room x={1691.5} y={1.5} w={75} h={44} />
      <Room x={1792.5} y={19.5} w={52} h={91} />
      <Room x={1845.5} y={19.5} w={50} h={26} />
      <Room x={1845.5} y={75.5} w={69} h={35} />

      <Wall x={870.5} y={0.5} w={896} h={1} />
      <Wall x={870.5} y={109.5} w={896} h={1} />

      <Rect x={772} y={99} w={26} h={18} border="none" />
      <Rect x={832} y={93} w={26} h={18} border="none" />
      <Rect x={922} y={93} w={26} h={18} border="none" />
      <Rect x={987} y={93} w={26} h={18} border="none" />
      <Rect x={1168} y={12} w={22} h={26} border="none" />
      <Rect x={1204} y={28} w={26} h={18} border="none" />
      <Rect x={1279} y={99} w={26} h={18} border="none" />
      <Rect x={1435} y={18} w={26} h={37} border="none" />
      <Rect x={1574} y={18} w={26} h={37} border="none" />

      {[1706.5, 1709.5, 1710.5, 1717.5, 1720.5, 1723.5, 1727.5, 1730.5, 1733.5, 1736.5, 1740.5].map((x, i) => (
        <Rect key={i} x={x} y={92.5} w={x === 1710.5 || x === 1723.5 ? 2 : 1} h={15} />
      ))}
      <Rect x={1704.5} y={92.5} w={41} h={15} />
      <Rect x={1743.25} y={92.25} w={0.5} h={15.5} />
    </>
  );
}

function CentralSpine() {
  return (
    <>
      <Room x={766.5} y={108.5} w={104} h={109} />
      <Room x={767} y={272.5} w={104} h={512} />
      <Room x={767.5} y={350.5} w={102} h={141} />
      <Room x={801.5} y={646.5} w={69} h={50} />
      <Room x={802.5} y={696.5} w={69} h={88} />
      <Room x={716.5} y={784.5} w={118} h={38} />
      <Room x={716} y={823} w={42} h={44} />
      <Room x={835.5} y={785.5} w={34} h={141} />

      <Wall x={870.5} y={784} w={1} h={70} />
      <Rect x={748} y={823} w={19} h={1} border="none" />
      <Rect x={726} y={784} w={32} h={9} border="none" />
      <Rect x={721} y={819} w={35} h={24} border="none" />
      <Rect x={748} y={841} w={15} h={19} border="none" />
      <Rect x={751} y={888} w={12} h={14} border="none" />
      <Rect x={748} y={946} w={15} h={10} border="none" />
      <Rect x={797} y={660} w={22} h={14} border="none" />
      <Rect x={858} y={652} w={14} h={16} border="none" />
      <Rect x={829.5} y={675.5} w={1} h={15} />
      <Rect x={797} y={727} w={16} h={21} border="none" />
      <Rect x={778} y={632} w={15} h={28} border="none" />
      <Rect x={808} y={484} w={23} h={17} border="none" />
      <Rect x={805} y={340} w={26} h={18} border="none" />
      <Rect x={819} y={786} w={23} h={33} border="none" />
    </>
  );
}

function MidLeftAndBase() {
  return (
    <>
      <Room x={136} y={580} w={49} h={151} style={{ background: '#F5F5F5' }} />
      <Room x={187.5} y={581.5} w={121} h={171} />
      <Room x={309.5} y={639.5} w={126} h={113} />
      <Room x={436.5} y={639.5} w={139} h={183} />
      <Room x={576.5} y={688.5} w={90} h={134} />

      <Rect x={276} y={745} w={23} h={16} border="none" />
      <Rect x={276} y={745} w={20} h={16} border="none" />
      <Rect x={367} y={745} w={23} h={16} border="none" />
      <Rect x={424} y={774} w={23} h={16} border="none" />
      <Rect x={569} y={691} w={23} h={16} border="none" />
      <Rect x={644} y={802} w={23} h={16} border="none" />
    </>
  );
}

function LowerWestCluster() {
  return (
    <>
      <Room x={39.5} y={842.5} w={138} h={126} />
      <Room x={70.5} y={774.5} w={67} h={67} />
      <Room x={70.5} y={642.5} w={67} h={134} />
      <Room x={174.5} y={863.5} w={50} h={105} />
      <Room x={225.5} y={863.5} w={92} h={124} />
      <Room x={268.5} y={753.5} w={167} h={31} />
      <Room x={268.5} y={783.5} w={49} h={83} />

      <AngledPanel points={[[21.4674, 811], [55.767, 841.576], [39.2995, 860.049], [5.00001, 829.473]]} />
      <AngledPanel points={[[39.0115, 948], [57.4634, 967.726], [18.4519, 1004.22], [0, 984.493]]} />
      <AngledPanel points={[[226.012, 968], [244.463, 987.726], [205.452, 1024.22], [187, 1004.49]]} />
      <AngledPanel points={[[317.467, 969], [351.767, 999.576], [335.3, 1018.05], [301, 987.473]]} />

      <Rect x={115} y={798} w={23} h={16} border="none" />
      <Rect x={151} y={842} w={23} h={16} border="none" />
      <Rect x={191} y={863} w={23} h={16} border="none" />
      <Rect x={237} y={863} w={23} h={16} border="none" />
      <Rect x={268} y={839} w={23} h={16} border="none" />
      <Rect x={272} y={776} w={37} h={21} border="none" />
    </>
  );
}

function LowerEastCluster() {
  return (
    <>
      <Room x={390.5} y={823.5} w={325} h={43} />
      <Room x={390} y={786} w={45} h={48} />
      <Room x={390.5} y={867.5} w={469} h={318} />
      <Room x={390.5} y={867.5} w={37} h={95} />
      <Room x={428.5} y={868.5} w={73} h={94} />
      <Room x={541.5} y={867.5} w={78} h={94} />
      <Room x={620.5} y={868.5} w={83} h={94} />
      <Room x={704.5} y={868.5} w={53} h={42} />
      <Room x={704.5} y={909.5} w={53} h={52} />

      <Wall x={390.5} y={867.5} w={469} h={1} />
      <Wall x={859.5} y={867.5} w={1} h={318} />
      <Rect x={390} y={770} w={38} h={28} border="none" />
      <Rect x={704} y={824} w={22} h={43} border="none" />
      <Rect x={662.25} y={965.25} w={0.5} h={220.5} />
    </>
  );
}

function Apertures() {
  return (
    <>
      <Rect x={193.5} y={792.5} w={77} h={23} />
      {[196.5, 202.5, 205.5, 211.5, 217.5, 223.5, 229.5, 235.5, 241.5, 247.5, 253.5, 259.5, 265.5].map((x, i) => (
        <Rect key={i} x={x} y={792.5} w={x === 265.5 ? 2 : 3} h={23} />
      ))}
      <Rect x={194} y={802} w={57} h={2} bg="#111" border="none" />

      {[
        [859.59, 883.534, 41, 15],
        [859.521, 915.534, 1, 15],
        [859.534, 909.534, 1, 15],
        [859.586, 885.534, 1, 15],
        [859.579, 888.534, 1, 15],
        [859.577, 889.534, 2, 15],
        [859.568, 893.534, 1, 15],
        [859.562, 896.534, 1, 15],
        [859.555, 899.534, 1, 15],
        [859.549, 902.534, 2, 15],
        [859.54, 906.534, 1, 15],
        [859.527, 912.534, 1, 15],
        [859.512, 919.534, 1, 15],
        [859.756, 922.284, 0.5, 15.5],
      ].map(([x, y, w, h], i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: s(x),
            top: s(y),
            width: s(h),
            height: s(w),
            background: '#D9D9D9',
            border: '1px solid #333',
            boxSizing: 'border-box',
            transform: 'rotate(90.1246deg)',
            transformOrigin: 'top left',
            zIndex: 4,
          }}
        />
      ))}

      <Rect x={800.5} y={679.5} w={41} h={15} />
      {[802.5, 805.5, 806.5, 813.5, 816.5, 819.5, 823.5, 826.5, 829.5, 832.5, 836.5].map((x, i) => (
        <Rect key={i} x={x} y={679.5} w={x === 806.5 || x === 819.5 ? 2 : 1} h={15} />
      ))}
      <Rect x={839.25} y={679.25} w={0.5} h={15.5} />
    </>
  );
}



function JoinResolution() {
  return (
    <>
      {/* top band joining into the central spine */}
      <Wall x={870.5} y={108.5} w={1} h={109} />
      <Wall x={767.5} y={108.5} w={103} h={1} />
      <Wall x={767.5} y={217.5} w={103} h={1} />

      {/* spine joining to the lower horizontal run */}
      <Wall x={767} y={784.5} w={104} h={1} />
      <Wall x={834.5} y={784.5} w={1} h={82} />
      <Wall x={716.5} y={822.5} w={118} h={1} />
      <Wall x={758} y={823} w={1} h={44} />

      {/* mid-left lower strip joins */}
      <Wall x={308.5} y={639.5} w={1} h={113} />
      <Wall x={435.5} y={639.5} w={1} h={113} />
      <Wall x={435.5} y={639.5} w={140} h={1} />
      <Wall x={575.5} y={688.5} w={1} h={134} />
      <Wall x={575.5} y={822.5} w={91} h={1} />

      {/* lower west cluster joins */}
      <Wall x={137.5} y={776.5} w={1} h={65} />
      <Wall x={177.5} y={842.5} w={1} h={126} />
      <Wall x={224.5} y={863.5} w={1} h={124} />
      <Wall x={317.5} y={783.5} w={1} h={84} />
      <Wall x={268.5} y={784.5} w={167} h={1} />

      {/* lower east cluster joins */}
      <Wall x={390.5} y={823.5} w={325} h={1} />
      <Wall x={390.5} y={866.5} w={325} h={1} />
      <Wall x={501.5} y={867.5} w={1} h={95} />
      <Wall x={619.5} y={867.5} w={1} h={95} />
      <Wall x={703.5} y={867.5} w={1} h={95} />
      <Wall x={757.5} y={868.5} w={1} h={93} />

      {/* principal diagonal joints so the southwest pieces read as attachments */}
      <Wall x={39.5} y={842.5} w={98} h={1} />
      <Wall x={174.5} y={863.5} w={50} h={1} />
      <Wall x={225.5} y={863.5} w={92} h={1} />
    </>
  );
}

function OuterEnvelope() {
  return (
    <>
      {/* top band outer runs */}
      <WallRun x={767.5} y={0} w={999} h={8} slots={[{ offset: 421, span: 497 }]} thickness={4} />
      <WallRun x={766} y={0.5} w={8} h={217} slots={[{ offset: 99, span: 18 }]} vertical thickness={4} />
      <WallRun x={869.5} y={109.5} w={8} h={675} slots={[{ offset: 51, span: 26 }, { offset: 231, span: 20 }, { offset: 289, span: 20 }, { offset: 447, span: 20 }]} vertical thickness={4} />
      <WallRun x={1041} y={0.5} w={8} h={784} slots={[{ offset: 92, span: 20 }, { offset: 651, span: 18 }]} vertical thickness={4} />
      <WallRun x={1762.5} y={1.5} w={8} h={109} slots={[{ offset: 91, span: 16 }]} vertical thickness={4} />
      <WallRun x={1914.5} y={19.5} w={8} h={91} slots={[{ offset: 55, span: 24 }]} vertical thickness={4} />

      {/* lower perimeter hints */}
      <WallRun x={39.5} y={968.5} w={138} h={8} slots={[{ offset: 40, span: 26 }]} thickness={4} />
      <WallRun x={70.5} y={642.5} w={8} h={199} slots={[{ offset: 56, span: 24 }]} vertical thickness={4} />
      <WallRun x={137.5} y={642.5} w={8} h={134} slots={[{ offset: 51, span: 25 }]} vertical thickness={4} />
      <WallRun x={174.5} y={968.5} w={50} h={8} slots={[{ offset: 15, span: 18 }]} thickness={4} />
      <WallRun x={390.5} y={1181.5} w={469} h={8} slots={[{ offset: 115, span: 26 }, { offset: 386, span: 20 }]} thickness={4} />
      <WallRun x={390.5} y={867.5} w={8} h={318} slots={[{ offset: 39, span: 28 }]} vertical thickness={4} />
    </>
  );
}

function StructuralHints() {
  return (
    <>
      <DoorGap x={852.5} y={885.5} span={36} vertical={true} hinge="start" />
      <DoorGap x={390} y={786} span={20} vertical={false} hinge="start" />
      <DoorGap x={716} y={823} span={18} vertical={false} hinge="end" />
      <DoorGap x={1179} y={38.5} span={20} vertical={true} hinge="start" />
      <DoorGap x={1254} y={37.5} span={20} vertical={true} hinge="end" />

      <DoorGap x={1041} y={628} span={27} vertical={true} hinge="start" />
      <DoorGap x={870.5} y={145} span={24} vertical={true} hinge="end" />
      <DoorGap x={309.5} y={683} span={22} vertical={true} hinge="start" />
      <DoorGap x={575.5} y={731} span={22} vertical={true} hinge="end" />
      <DoorGap x={432} y={823.5} span={20} vertical={false} hinge="start" />
      <DoorGap x={725} y={867.5} span={20} vertical={false} hinge="end" />

      <WindowSlot x={1187} y={1} w={497} h={2} />
      <WindowSlot x={1704.5} y={92.5} w={41} h={4} />
      <WindowSlot x={853} y={659} w={17} h={1} />
      <WindowSlot x={748} y={823} w={19} h={1} />
      <WindowSlot x={114} y={748} w={25} h={25} />
    </>
  );
}

export default function MainFloorPlanRefactored() {
  const wrapperRef = useRef(null);
  const canvasWidth = s(1994);
  const canvasHeight = s(1186);
  const [fitScale, setFitScale] = useState(1);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (!wrapperRef.current) return;
      const availableWidth = wrapperRef.current.clientWidth - 40;
      if (availableWidth <= 0) return;
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
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 12,
          fontFamily: 'Arial, sans-serif',
          fontSize: 13,
          color: '#111827',
          marginBottom: 12,
          fontWeight: 600,
        }}
      >
        <div>
          Main Floor Plan — join-resolution pass
          <span style={{ fontSize: 10, fontWeight: 400, color: '#6b7280', marginLeft: 14 }}>
            Geometry tightened so the joins read structurally
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
          <div style={{ minWidth: 46, textAlign: 'center', fontSize: 12, color: '#4b5563' }}>{zoomPercent}%</div>
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

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            position: 'relative',
            width: canvasWidth,
            height: canvasHeight,
            background: '#F5F5F5',
            boxShadow: '0 4px 24px rgba(0,0,0,0.45)',
            isolation: 'isolate',
            transform: `scale(${effectiveScale})`,
            transformOrigin: 'top center',
            marginBottom: -(canvasHeight * (1 - effectiveScale)),
            borderRadius: 12,
          }}
        >
          <TopBand />
          <CentralSpine />
          <OuterEnvelope />
          <JoinResolution />
          <MidLeftAndBase />
          <LowerWestCluster />
          <LowerEastCluster />
          <Apertures />
          <StructuralHints />
        </div>
      </div>
    </div>
  );
}
