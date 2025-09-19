export default function MiniMap({ lat, lng, width = 280, height = 160 }) {
  // Simple SVG placeholder map with a dot; avoids external map libs
  // We just encode lat/lng text and show a centered dot
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
      <div className="text-slate-400 text-xs mb-2">Location</div>
      <svg width={width} height={height} className="w-full h-40 rounded-md bg-slate-950 border border-slate-800">
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1f2937" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="#0b1220" />
        <rect width="100%" height="100%" fill="url(#grid)" />
        <circle cx={width/2} cy={height/2} r="6" fill="#22d3ee" />
      </svg>
      <div className="text-slate-300 text-xs mt-2">Lat: {lat?.toFixed?.(5) ?? '-'} · Lng: {lng?.toFixed?.(5) ?? '-'}</div>
    </div>
  );
}
