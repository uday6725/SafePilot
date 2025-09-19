export default function VideoFeed({ title, src }) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
      <div className="px-3 py-2 text-slate-300 border-b border-slate-800 flex items-center justify-between">
        <span>{title}</span>
        <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400">Feed Offline</span>
      </div>
      <div className="aspect-video w-full bg-slate-950 flex items-center justify-center">
        {src ? (
          <img src={src} alt={title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-slate-600">No stream</span>
        )}
      </div>
    </div>
  );
}
