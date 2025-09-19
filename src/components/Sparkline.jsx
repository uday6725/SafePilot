export default function Sparkline({ data = [], color = "#22d3ee", width = 200, height = 48, strokeWidth = 2 }) {
  if (!Array.isArray(data) || data.length === 0) {
    return <div className="text-slate-500 text-xs">No data</div>;
  }
  const max = Math.max(...data);
  const min = Math.min(...data);
  const dx = width / Math.max(1, data.length - 1);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = i * dx;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={width} height={height} className="w-full h-12">
      <polyline fill="none" stroke={color} strokeWidth={strokeWidth} points={points} />
    </svg>
  );
}
