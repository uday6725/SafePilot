import { useCallback, useState } from "react";
import { useSocket } from "../context/WebSocketContext";

export default function ControlPad() {
  const { sendCommand } = useSocket();
  const [speed, setSpeed] = useState(0);

  const start = useCallback((cmd) => () => sendCommand(cmd, { speed }), [sendCommand, speed]);
  const stop = useCallback(() => sendCommand("stop"), [sendCommand]);

  function adjustSpeed(delta) {
    setSpeed((s) => Math.min(30, Math.max(0, s + delta)));
  }

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 grid grid-cols-3 gap-4 place-items-center">
      <button onMouseDown={start("move_forward")} onMouseUp={stop} className="col-span-3 text-3xl bg-sky-600/30 hover:bg-sky-600/40 border border-sky-500/50 rounded-lg py-6 w-full">⬆️</button>
      <button onMouseDown={start("turn_left")} onMouseUp={stop} className="text-3xl bg-sky-600/30 hover:bg-sky-600/40 border border-sky-500/50 rounded-lg py-6 w-full">⬅️</button>
      <button onClick={() => sendCommand("emergency_stop")} className="text-sm bg-rose-700/80 hover:bg-rose-700 text-white border border-rose-500/60 rounded-lg py-6 w-full">EMERGENCY STOP</button>
      <button onMouseDown={start("turn_right")} onMouseUp={stop} className="text-3xl bg-sky-600/30 hover:bg-sky-600/40 border border-sky-500/50 rounded-lg py-6 w-full">➡️</button>
      <button onMouseDown={start("move_backward")} onMouseUp={stop} className="col-span-3 text-3xl bg-sky-600/30 hover:bg-sky-600/40 border border-sky-500/50 rounded-lg py-6 w-full">⬇️</button>
      <div className="col-span-3 flex items-center justify-center gap-3 mt-2">
        <button onClick={() => adjustSpeed(-5)} className="px-3 py-1 rounded bg-slate-800 border border-slate-700">-5</button>
        <div className="text-slate-300">Speed: <span className="text-cyan-300 font-semibold">{speed}</span> / 30</div>
        <button onClick={() => adjustSpeed(5)} className="px-3 py-1 rounded bg-slate-800 border border-slate-700">+5</button>
      </div>
    </div>
  );
}
