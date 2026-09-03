import React, { useState, useEffect } from 'react';
import { Macro, MacroAction } from '../../core/protocol/types';
import { MacroEngine } from '../../core/protocol/macroEngine';
import { Cpu, Play, Square, Circle, Plus, Trash2, Download, Upload, Clock } from 'lucide-react';

interface MacroStudioProps {
  macroEngine: MacroEngine;
  onUpdate: () => void;
}

export const MacroStudio: React.FC<MacroStudioProps> = ({ macroEngine, onUpdate }) => {
  const [macros, setMacros] = useState<Macro[]>(macroEngine.getMacros());
  const [selectedMacroId, setSelectedMacroId] = useState<string>(macros[0]?.id || '');
  const [isRecording, setIsRecording] = useState(false);
  const [macroName, setMacroName] = useState('');

  const selectedMacro = macros.find(m => m.id === selectedMacroId);

  // Key event capture during recording
  useEffect(() => {
    if (!isRecording) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      macroEngine.recordKey('keydown', e.code);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      e.preventDefault();
      macroEngine.recordKey('keyup', e.code);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isRecording, macroEngine]);

  const handleStartRecord = () => {
    setIsRecording(true);
    macroEngine.startRecording();
  };

  const handleStopRecord = () => {
    const newMacro = macroEngine.stopRecording(macroName || `Macro ${macros.length + 1}`);
    setIsRecording(false);
    setMacros(macroEngine.getMacros());
    setSelectedMacroId(newMacro.id);
    setMacroName('');
    onUpdate();
  };

  const handleDeleteMacro = (id: string) => {
    macroEngine.deleteMacro(id);
    const updated = macroEngine.getMacros();
    setMacros(updated);
    if (selectedMacroId === id) {
      setSelectedMacroId(updated[0]?.id || '');
    }
    onUpdate();
  };

  const handleExport = () => {
    const jsonStr = macroEngine.exportToJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'darkproject_macros.json';
    a.click();
  };

  return (
    <div style={{ display: 'flex', gap: '24px', height: 'calc(100vh - 200px)' }}>
      {/* Left List of Saved Macros */}
      <div className="glass-panel" style={{ width: '280px', display: 'flex', flexDirection: 'column', padding: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Cpu size={16} color="var(--accent-emerald)" />
            <span>Macros</span>
          </h3>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={handleExport}
              className="btn btn-secondary"
              style={{ padding: '6px', fontSize: '11px' }}
              title="Export Macros JSON"
            >
              <Download size={14} />
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto', flex: 1 }}>
          {macros.map(m => {
            const isSelected = m.id === selectedMacroId;
            return (
              <div
                key={m.id}
                className="glass-card"
                onClick={() => setSelectedMacroId(m.id)}
                style={{
                  padding: '10px 12px',
                  cursor: 'pointer',
                  border: isSelected ? '1px solid var(--accent-emerald)' : '1px solid var(--border-subtle)',
                  background: isSelected ? 'var(--bg-surface-active)' : undefined,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {m.name}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {m.actions.length} steps
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteMacro(m.id);
                  }}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Timeline Inspector & Recorder */}
      <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px' }}>
        {/* Recorder Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: '18px',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isRecording ? (
              <button
                className="btn btn-danger"
                onClick={handleStopRecord}
                style={{ padding: '8px 18px' }}
              >
                <Square size={16} />
                <span>Stop Recording</span>
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={handleStartRecord}
                style={{ padding: '8px 18px' }}
              >
                <Circle size={16} fill="#05070a" />
                <span>Record New Macro</span>
              </button>
            )}

            <input
              type="text"
              placeholder="Macro Name..."
              value={macroName}
              onChange={(e) => setMacroName(e.target.value)}
              style={{
                padding: '8px 14px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                outline: 'none',
                width: '240px'
              }}
            />
          </div>

          {isRecording && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--accent-crimson)',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700
            }}>
              <Circle size={10} fill="currentColor" className="glow-animation" />
              RECORDING HARDWARE INPUTS...
            </div>
          )}
        </div>

        {/* Macro Timeline Display */}
        {selectedMacro ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 700 }}>
                {selectedMacro.name}
              </h4>
              <span className="badge badge-emerald">Mode: {selectedMacro.repeatMode}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {selectedMacro.actions.map((act, idx) => (
                <div
                  key={act.id || idx}
                  className="glass-card"
                  style={{
                    padding: '10px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ color: 'var(--text-muted)', width: '24px' }}>#{idx + 1}</span>
                    {act.type === 'delay' ? (
                      <span style={{ color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} /> Delay {act.delayMs} ms
                      </span>
                    ) : act.type === 'keydown' ? (
                      <span style={{ color: 'var(--accent-cyan)' }}>
                        ⬇ Key Down: <strong>{act.code}</strong>
                      </span>
                    ) : (
                      <span style={{ color: 'var(--accent-purple)' }}>
                        ⬆ Key Up: <strong>{act.code}</strong>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-muted)' }}>
            Select or record a macro to view the timeline
          </div>
        )}
      </div>
    </div>
  );
};
