import React, { useState } from 'react';
import { Terminal, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';

export interface LogEntry {
  id: string;
  time: string;
  message: string;
  level: 'info' | 'warn' | 'error';
}

interface ConsoleLogProps {
  logs: LogEntry[];
  onClearLogs: () => void;
}

export const ConsoleLog: React.FC<ConsoleLogProps> = ({
  logs,
  onClearLogs,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-[#08090f]/95 backdrop-blur-md border-t border-white/10 transition-all">
      {/* Top Bar Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all select-none"
      >
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="font-mono text-xs font-semibold text-slate-300">
            Hardware & Protocol Telemetry Console
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            {logs.length} events
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClearLogs();
            }}
            className="text-slate-500 hover:text-red-400 p-1 transition-all"
            title="Clear logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </div>

      {/* Log Entries Viewport */}
      {isOpen && (
        <div className="max-w-7xl mx-auto px-6 py-3 max-h-48 overflow-y-auto font-mono text-[11px] space-y-1.5 border-t border-white/5">
          {logs.length === 0 ? (
            <p className="text-slate-500 italic">No telemetry messages recorded.</p>
          ) : (
            logs.map((l) => (
              <div key={l.id} className="flex items-start gap-3">
                <span className="text-slate-500 shrink-0">{l.time}</span>
                <span
                  className={`font-semibold shrink-0 uppercase text-[10px] px-1.5 py-0.2 rounded ${
                    l.level === 'error'
                      ? 'bg-red-500/20 text-red-400'
                      : l.level === 'warn'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-cyan-500/10 text-cyan-400'
                  }`}
                >
                  {l.level}
                </span>
                <span
                  className={
                    l.level === 'error'
                      ? 'text-red-300'
                      : l.level === 'warn'
                      ? 'text-amber-300'
                      : 'text-slate-300'
                  }
                >
                  {l.message}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
