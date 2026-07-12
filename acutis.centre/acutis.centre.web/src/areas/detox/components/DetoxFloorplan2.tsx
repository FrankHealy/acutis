type ShapeRect = {
  left: number;
  top: number;
  width: number;
  height: number;
  fill?: string;
  border?: string;
  label?: string;
  labelClassName?: string;
};

type ShapeLine = {
  left: number;
  top: number;
  width: number;
  height: number;
  rotation: number;
};

const wallFill = "#d9d9d9";
const baseFill = "#f5f5f5";
const stroke = "#111827";
const border = `1px solid ${stroke}`;

const rects: ShapeRect[] = [
  { left: 975, top: 57, width: 70, height: 631, fill: wallFill },
  { left: 897.5, top: 545.5, width: 77, height: 72, fill: wallFill, border, label: "R12" },
  { left: 0.5, top: 688.5, width: 77, height: 72, fill: wallFill, border, label: "R7" },
  { left: 78.5, top: 688.5, width: 77, height: 72, fill: wallFill, border, label: "R8" },
  { left: 156.5, top: 688.5, width: 77, height: 72, fill: wallFill, border, label: "R9" },
  { left: 234.5, top: 688.5, width: 77, height: 72, fill: wallFill, border, label: "R10" },
  { left: 305.5, top: 688.5, width: 77, height: 72, fill: wallFill, border, label: "R11" },
  { left: 795.5, top: 688.5, width: 77, height: 72, fill: wallFill, border, label: "R13" },
  { left: 873.5, top: 688.5, width: 77, height: 72, fill: wallFill, border, label: "R14" },
  { left: 967.5, top: 689.5, width: 77, height: 72, fill: wallFill, border, label: "R15" },
  { left: 967.5, top: 762.5, width: 77, height: 72, fill: wallFill, border, label: "R16" },
  { left: 897.5, top: 107.5, width: 77, height: 72, fill: wallFill, border, label: "R1" },
  { left: 897.5, top: 180.5, width: 77, height: 72, fill: wallFill, border, label: "R2" },
  { left: 897.5, top: 253.5, width: 77, height: 72, fill: wallFill, border, label: "R3" },
  { left: 897.5, top: 326.5, width: 77, height: 72, fill: wallFill, border, label: "R4" },
  { left: 897.5, top: 399.5, width: 77, height: 72, fill: wallFill, border, label: "R5" },
  { left: 897.5, top: 472.5, width: 77, height: 72, fill: wallFill, border, label: "R6" },
  { left: 897.5, top: 0.5, width: 147, height: 56, fill: wallFill, border, label: "Front Exit" },
  { left: 897, top: 57, width: 78, height: 50, fill: wallFill, label: "FE" },
  { left: 0, top: 618, width: 975, height: 70, fill: wallFill, label: "Main Corridor", labelClassName: "text-sm tracking-[0.2em]" },
  { left: 78, top: 561, width: 61, height: 57, fill: wallFill },
  { left: 459.5, top: 688.5, width: 147, height: 72, fill: wallFill, border, label: "Dining" },
  { left: 607.5, top: 688.5, width: 148, height: 72, fill: wallFill, border, label: "Kitchen" },
  { left: 459.5, top: 761.5, width: 147, height: 54, fill: wallFill, border, label: "Store" },
  { left: 607.5, top: 761.5, width: 147, height: 54, fill: wallFill, border, label: "Utility" },
  { left: 459.5, top: 816.5, width: 147, height: 217, fill: wallFill, border, label: "Day Room" },
  { left: 298.5, top: 799.5, width: 84, height: 68, fill: wallFill, border, label: "WC 1" },
  { left: 298.5, top: 868.5, width: 84, height: 68, fill: wallFill, border, label: "WC 2" },
  { left: 298.5, top: 799.5, width: 45, height: 16, fill: wallFill, border },
  { left: 340.5, top: 799.5, width: 42, height: 25, fill: wallFill, border },
  { left: 1057, top: 614, width: 108, height: 73, fill: wallFill, label: "Staff" },
  { left: 273.5, top: 271.5, width: 439, height: 289, fill: baseFill, border: `1px solid ${wallFill}` },
  { left: 459.5, top: 271.5, width: 43, height: 94, fill: baseFill, border: `1px solid ${wallFill}` },
  { left: 459.5, top: 462.5, width: 39, height: 98, fill: baseFill, border: `1px solid ${wallFill}` },
] as const;

const lines: ShapeLine[] = [
  { left: 0.5, top: 618, width: 70, height: 1, rotation: 90 },
  { left: 0, top: 617.5, width: 78, height: 1, rotation: 0 },
  { left: 78.5, top: 561, width: 57, height: 1, rotation: 90 },
  { left: 139.5, top: 561, width: 57, height: 1, rotation: 90 },
  { left: 139, top: 617.5, width: 758, height: 1, rotation: 0 },
  { left: 383.5, top: 761, width: 38, height: 1, rotation: 90 },
  { left: 1045.5, top: 57, width: 574, height: 1, rotation: 90 },
  { left: 1044.5, top: 689, width: 31, height: 1, rotation: -90 },
  { left: 298, top: 761, width: 38, height: 1, rotation: 90 },
  { left: 383, top: 1033, width: 76, height: 1, rotation: 0 },
];

function FloorRect({ left, top, width, height, fill = "transparent", border = "none", label, labelClassName }: ShapeRect) {
  return (
    <div
      className="absolute flex items-center justify-center text-center text-[11px] font-semibold uppercase text-slate-800"
      style={{
        left,
        top,
        width,
        height,
        background: fill,
        border,
      }}
    >
      {label ? <span className={labelClassName}>{label}</span> : null}
    </div>
  );
}

function FloorLine({ left, top, width, height, rotation }: ShapeLine) {
  return (
    <div
      className="absolute bg-slate-900"
      style={{
        left,
        top,
        width,
        height,
        transform: `rotate(${rotation}deg)`,
        transformOrigin: "top left",
      }}
    />
  );
}

export default function DetoxFloorplan2() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Detox Floor Map</h2>
        <p className="text-sm text-gray-600">Draft 2 using positioned HTML elements with visible reference labels.</p>
      </div>

      <div className="overflow-x-auto">
        <div className="mx-auto min-w-[1165px] rounded-xl bg-slate-100 p-4 shadow-inner">
          <div
            aria-label="Detox floor plan"
            className="relative overflow-hidden bg-[#F5F5F5]"
            style={{ width: 1165, height: 1034 }}
          >
            {rects.map((rect, index) => (
              <FloorRect key={`rect-${index}`} {...rect} />
            ))}

            <div
              className="absolute flex items-center justify-center border text-[11px] font-semibold uppercase text-slate-800"
              style={{
                left: 47.137,
                top: 441.139,
                width: 122.787,
                height: 122.787,
                background: wallFill,
                borderColor: stroke,
                clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
              }}
            >
              Quiet
            </div>

            <div
              className="absolute flex items-center justify-center border text-[11px] font-semibold uppercase text-slate-800"
              style={{
                left: 429,
                top: 367,
                width: 94,
                height: 95,
                background: baseFill,
                borderColor: stroke,
                clipPath: "polygon(50% 0%, 100% 39%, 81% 100%, 19% 100%, 0% 39%)",
              }}
            >
              PT
            </div>

            {lines.map((line, index) => (
              <FloorLine key={`line-${index}`} {...line} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
