const COLORS = {
  Pecho: "#3B82F6",
  Piernas: "#22C55E",
  Espalda: "#A855F7",
};

const LABELS = {
  Pecho: "Pecho",
  Piernas: "Piernas",
  Espalda: "Espalda",
};

export default function MuscleChart({ data = {} }) {
  const total = Object.values(data).reduce((s, v) => s + v, 0);
  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Sin datos de entrenamiento
      </div>
    );
  }

  const cx = 80, cy = 80, r = 70;
  let currentAngle = 0;

  const segments = Object.entries(COLORS)
    .filter(([key]) => data[key] > 0)
    .map(([key, color]) => {
      const value = data[key] || 0;
      const slice = (value / total) * (Math.PI * 2);
      const startAngle = currentAngle;
      const endAngle = currentAngle + slice;
      currentAngle = endAngle;

      const x1 = cx + r * Math.sin(startAngle);
      const y1 = cy - r * Math.cos(startAngle);
      const x2 = cx + r * Math.sin(endAngle);
      const y2 = cy - r * Math.cos(endAngle);
      const largeArc = slice > Math.PI ? 1 : 0;

      const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;

      return { key, color, path, value, percent: Math.round((value / total) * 100) };
    });

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width="160" height="160" viewBox="0 0 160 160" className="shrink-0">
        {segments.map((seg) => (
          <path key={seg.key} d={seg.path} fill={seg.color} />
        ))}
        <circle cx={cx} cy={cy} r="28" fill="white" />
        <text x={cx} y={cy - 4} textAnchor="middle" className="text-sm font-bold fill-gray-800">
          {total}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" className="text-[10px] fill-gray-500">
          ejercicios
        </text>
      </svg>

      <div className="flex flex-col gap-1.5 text-sm w-full">
        {Object.entries(COLORS).map(([key, color]) => {
          const count = data[key] || 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={key} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: color }} />
              <span className="text-gray-700 flex-1">{LABELS[key]}</span>
              <span className="font-medium text-gray-900">{count}</span>
              <span className="text-gray-400 text-xs w-8 text-right">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
