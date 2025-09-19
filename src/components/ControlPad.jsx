import { useCallback, useEffect, useRef, useState } from "react";
import { useSocket } from "../context/WebSocketContext";

export default function ControlPad({ disabled = false }) {
  const { sendCommand } = useSocket();
  const [speed, setSpeed] = useState(0);
  const pressedRef = useRef(new Set());

  const start = useCallback((cmd) => () => {
    if (disabled) return;
    sendCommand(cmd, { speed });
  }, [sendCommand, speed, disabled]);
  const stop = useCallback(() => {
    if (disabled) return;
    sendCommand("stop");
  }, [sendCommand, disabled]);

  function adjustSpeed(delta) {
    if (disabled) return;
    setSpeed((s) => Math.min(30, Math.max(0, s + delta)));
  }

  // Keyboard controls
  useEffect(() => {
    function onKeyDown(e) {
      if (disabled) return;
      const key = e.key.toLowerCase();
      if (pressedRef.current.has(key)) return; // prevent repeats
      let cmd = null;
      if (key === "arrowup" || key === "w") cmd = "move_forward";
      else if (key === "arrowdown" || key === "s") cmd = "move_backward";
      else if (key === "arrowleft" || key === "a") cmd = "turn_left";
      else if (key === "arrowright" || key === "d") cmd = "turn_right";
      if (cmd) {
        pressedRef.current.add(key);
        sendCommand(cmd, { speed });
        e.preventDefault();
      }
      if (key === "+") adjustSpeed(5);
      if (key === "-") adjustSpeed(-5);
    }
    function onKeyUp(e) {
      if (disabled) return;
      const key = e.key.toLowerCase();
      if (pressedRef.current.has(key)) {
        pressedRef.current.delete(key);
        stop();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [sendCommand, stop, speed, disabled]);

  // return (
  //   <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 grid grid-cols-3 gap-4 place-items-center">
  //     <button onMouseDown={start("move_forward")} onMouseUp={stop} onTouchStart={start("move_forward")} onTouchEnd={stop} className="col-span-3 text-3xl bg-sky-600/30 hover:bg-sky-600/40 border border-sky-500/50 rounded-lg py-6 w-full">⬆️</button>
  //     <button onMouseDown={start("turn_left")} onMouseUp={stop} onTouchStart={start("turn_left")} onTouchEnd={stop} className="text-3xl bg-sky-600/30 hover:bg-sky-600/40 border border-sky-500/50 rounded-lg py-6 w-full">⬅️</button>
  //     <button onClick={() => sendCommand("emergency_stop")} className="text-sm bg-rose-700/80 hover:bg-rose-700 text-white border border-rose-500/60 rounded-lg py-6 w-full">EMERGENCY STOP</button>
  //     <button onMouseDown={start("turn_right")} onMouseUp={stop} onTouchStart={start("turn_right")} onTouchEnd={stop} className="text-3xl bg-sky-600/30 hover:bg-sky-600/40 border border-sky-500/50 rounded-lg py-6 w-full">➡️</button>
  //     <button onMouseDown={start("move_backward")} onMouseUp={stop} onTouchStart={start("move_backward")} onTouchEnd={stop} className="col-span-3 text-3xl bg-sky-600/30 hover:bg-sky-600/40 border border-sky-500/50 rounded-lg py-6 w-full">⬇️</button>
  //     <div className="col-span-3 flex items-center justify-center gap-3 mt-2">
  //       <button onClick={() => adjustSpeed(-5)} className="px-3 py-1 rounded bg-slate-800 border border-slate-700">-5</button>
  //       <div className="text-slate-300">Speed: <span className="text-cyan-300 font-semibold">{speed}</span> / 30</div>
  //       <button onClick={() => adjustSpeed(5)} className="px-3 py-1 rounded bg-slate-800 border border-slate-700">+5</button>
  //     </div>
  //   </div>
  // );

  return (
    <div className="relative bg-slate-900/60 border border-slate-800 rounded-xl p-4 grid grid-cols-3 gap-2 place-items-center">
      {disabled && (
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
          <div className="text-center">
            <div className="text-slate-300">Remote control is disabled</div>
            <div className="text-slate-400 text-xs">Enabled automatically on critical events</div>
          </div>
        </div>
      )}
      <button
        onMouseDown={start("move_forward")}
        onMouseUp={stop}
        onTouchStart={start("move_forward")}
        onTouchEnd={stop}
        className="col-span-3 text-2xl bg-sky-600/30 hover:bg-sky-600/40 border border-sky-500/50 rounded-lg py-3 w-full disabled:opacity-50"
        disabled={disabled}
      >
        ⬆️
      </button>
  
      <button
        onMouseDown={start("turn_left")}
        onMouseUp={stop}
        onTouchStart={start("turn_left")}
        onTouchEnd={stop}
        className="text-2xl bg-sky-600/30 hover:bg-sky-600/40 border border-sky-500/50 rounded-lg py-3 w-full disabled:opacity-50"
        disabled={disabled}
      >
        ⬅️
      </button>
  
      <button
        onClick={() => !disabled && sendCommand("emergency_stop")}
        className="text-xs bg-rose-700/80 hover:bg-rose-700 text-white border border-rose-500/60 rounded-lg py-3 w-full disabled:opacity-50"
        disabled={disabled}
      >
        EMERGENCY STOP
      </button>
  
      <button
        onMouseDown={start("turn_right")}
        onMouseUp={stop}
        onTouchStart={start("turn_right")}
        onTouchEnd={stop}
        className="text-2xl bg-sky-600/30 hover:bg-sky-600/40 border border-sky-500/50 rounded-lg py-3 w-full disabled:opacity-50"
        disabled={disabled}
      >
        ➡️
      </button>
  
      <button
        onMouseDown={start("move_backward")}
        onMouseUp={stop}
        onTouchStart={start("move_backward")}
        onTouchEnd={stop}
        className="col-span-3 text-2xl bg-sky-600/30 hover:bg-sky-600/40 border border-sky-500/50 rounded-lg py-3 w-full disabled:opacity-50"
        disabled={disabled}
      >
        ⬇️
      </button>
  
      <div className="col-span-3 flex items-center justify-center gap-2 mt-1">
        <button
          onClick={() => adjustSpeed(-5)}
          className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-sm disabled:opacity-50"
          disabled={disabled}
        >
          -5
        </button>
        <div className="text-slate-300 text-sm">
          Speed: <span className="text-cyan-300 font-semibold">{speed}</span> / 30
        </div>
        <button
          onClick={() => adjustSpeed(5)}
          className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-sm disabled:opacity-50"
          disabled={disabled}
        >
          +5
        </button>
      </div>
    </div>
  );
  
}
