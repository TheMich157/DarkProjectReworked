import React, { useState } from 'react';
import { Macro, MacroEvent } from '../core/types';
import { Timer, Plus, Trash2, Play, CircleDot, Clock, ArrowDown, ArrowUp, Repeat } from 'lucide-react';

interface MacroStudioProps {
  macros: Macro[];
  onChangeMacros: (macros: Macro[]) => void;
}

export const MacroStudio: React.FC<MacroStudioProps> = ({
  macros,
  onChangeMacros,
}) => {
  const [activeMacroId, setActiveMacroId] = useState<string>(macros[0]?.id || '');
  const [isRecording, setIsRecording] = useState(false);

  const activeMacro = macros.find((m) => m.id === activeMacroId) || macros[0];

  const handleCreateMacro = () => {
    const newId = `macro-${Date.now()}`;
    const newMacro: Macro = {
      id: newId,
      name: `New Macro ${macros.length + 1}`,
      repeatMode: 'once',
      repeatCount: 1,
      events: [
        { id: '1', type: 'keydown', code: 'KeyE', keyLabel: 'E' },
        { id: '2', type: 'delay', delayMs: 25 },
        { id: '3', type: 'keyup', code: 'KeyE', keyLabel: 'E' },
      ],
    };
    onChangeMacros([...macros, newMacro]);
    setActiveMacroId(newId);
  };

  const handleDeleteMacro = (id: string) => {
    const filtered = macros.filter((m) => m.id !== id);
    onChangeMacros(filtered);
    if (activeMacroId === id && filtered.length > 0) {
      setActiveMacroId(filtered[0].id);
    }
  };

  const handleUpdateActiveMacro = (updated: Macro) => {
    onChangeMacros(macros.map((m) => (m.id === updated.id ? updated : m)));
  };

  const handleAddEvent = (type: 'keydown' | 'delay') => {
    if (!activeMacro) return;
    const newEvent: MacroEvent =
      type === 'delay'
        ? { id: `${Date.now()}`, type: 'delay', delayMs: 50 }
        : { id: `${Date.now()}`, type: 'keydown', code: 'Space', keyLabel: 'Space' };
    handleUpdateActiveMacro({
      ...activeMacro,
      events: [...activeMacro.events, newEvent],
    });
  };

  const handleDeleteEvent = (eventId: string) => {
    if (!activeMacro) return;
    handleUpdateActiveMacro({
      ...activeMacro,
      events: activeMacro.events.filter((e) => e.id !== eventId),
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-6 px-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Macro List (4 cols) */}
        <div className="lg:col-span-4 glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Timer className="w-5 h-5 text-cyan-400" />
              <h3 className="font-display font-bold text-base text-white">Macro Library</h3>
            </div>
            <button
              onClick={handleCreateMacro}
              className="p-1.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/30 transition-all cursor-pointer"
              title="Add new macro"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            {macros.map((m) => {
              const isSelected = m.id === activeMacroId;
              return (
                <div
                  key={m.id}
                  onClick={() => setActiveMacroId(m.id)}
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-md shadow-cyan-500/10'
                      : 'bg-[#121520] border-white/5 text-slate-300 hover:border-white/15'
                  }`}
                >
                  <div>
                    <p className="font-semibold text-xs text-white">{m.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {m.events.length} Actions • Mode: {m.repeatMode}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteMacro(m.id);
                    }}
                    className="text-slate-500 hover:text-red-400 p-1 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Timeline Event Editor (8 cols) */}
        {activeMacro && (
          <div className="lg:col-span-8 glass-panel p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <input
                  type="text"
                  value={activeMacro.name}
                  onChange={(e) =>
                    handleUpdateActiveMacro({ ...activeMacro, name: e.target.value })
                  }
                  className="font-display font-bold text-lg bg-transparent text-white border-b border-transparent hover:border-white/20 focus:border-cyan-400 focus:outline-none"
                />
                <p className="text-xs text-slate-400 mt-0.5">
                  Milliseconds timeline sequence with keypress & mouse hooks
                </p>
              </div>

              {/* Repeat Mode */}
              <div className="flex items-center gap-2">
                <Repeat className="w-4 h-4 text-violet-400" />
                <select
                  value={activeMacro.repeatMode}
                  onChange={(e) =>
                    handleUpdateActiveMacro({
                      ...activeMacro,
                      repeatMode: e.target.value as any,
                    })
                  }
                  className="bg-[#121520] border border-white/10 rounded-lg text-xs text-slate-300 px-3 py-1.5 focus:outline-none"
                >
                  <option value="once">Run Once</option>
                  <option value="while_pressed">Hold while Pressed</option>
                  <option value="toggle">Toggle On/Off</option>
                  <option value="count">Repeat Specific Times</option>
                </select>
              </div>
            </div>

            {/* Timeline Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsRecording(!isRecording)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  isRecording
                    ? 'bg-red-500/20 text-red-400 border-red-500/50 shadow-lg shadow-red-500/20'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                }`}
              >
                <CircleDot className={`w-3.5 h-3.5 ${isRecording ? 'animate-ping' : ''}`} />
                <span>{isRecording ? 'Recording Live...' : 'Record Keystrokes'}</span>
              </button>

              <button
                onClick={() => handleAddEvent('keydown')}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#121520] text-xs font-semibold text-slate-300 border border-white/10 rounded-xl hover:text-white cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-cyan-400" /> Key Press
              </button>

              <button
                onClick={() => handleAddEvent('delay')}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#121520] text-xs font-semibold text-slate-300 border border-white/10 rounded-xl hover:text-white cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5 text-amber-400" /> Delay (ms)
              </button>
            </div>

            {/* Event Sequence Flow */}
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {activeMacro.events.map((ev, idx) => (
                <div
                  key={ev.id}
                  className="p-3 rounded-xl bg-[#121520] border border-white/5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-slate-500 w-6">#{idx + 1}</span>

                    {ev.type === 'delay' ? (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-400" />
                        <span className="text-xs text-slate-300">Wait Delay:</span>
                        <input
                          type="number"
                          value={ev.delayMs || 20}
                          min={1}
                          max={5000}
                          onChange={(e) => {
                            const updatedEvents = [...activeMacro.events];
                            updatedEvents[idx] = {
                              ...ev,
                              delayMs: parseInt(e.target.value) || 1,
                            };
                            handleUpdateActiveMacro({
                              ...activeMacro,
                              events: updatedEvents,
                            });
                          }}
                          className="w-16 bg-[#0c0e17] px-2 py-0.5 rounded font-mono text-xs font-bold text-amber-300 border border-white/10 focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-500 font-mono">ms</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {ev.type === 'keydown' ? (
                          <ArrowDown className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <ArrowUp className="w-4 h-4 text-cyan-400" />
                        )}
                        <span className="text-xs font-semibold text-white">
                          {ev.type === 'keydown' ? 'Key Down' : 'Key Up'}:
                        </span>
                        <span className="px-2 py-0.5 bg-[#0c0e17] rounded text-xs font-mono font-bold text-cyan-300 border border-white/10">
                          {ev.keyLabel || ev.code}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteEvent(ev.id)}
                    className="text-slate-500 hover:text-red-400 transition-all p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
