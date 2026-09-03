import React, { useState } from 'react';
import { KeyCapDefinition } from '../../core/layouts/keyboardLayouts';
import { KeyRemapEntry } from '../../core/protocol/types';
import { Macro } from '../../core/protocol/types';
import { X, Check, Trash2, Layers, Volume2, Mouse, Cpu } from 'lucide-react';

interface KeyRemapperProps {
  keyCap: KeyCapDefinition | null;
  activeLayer: number;
  currentRemap?: KeyRemapEntry;
  macros: Macro[];
  onSaveRemap: (entry: KeyRemapEntry) => void;
  onResetRemap: (keyIndex: number, layer: number) => void;
  onClose: () => void;
}

const STANDARD_KEYS = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
  'Enter', 'Space', 'Backspace', 'Tab', 'Escape', 'Caps Lock', 'Shift', 'Ctrl', 'Alt', 'Win'
];

const MEDIA_KEYS = [
  { label: 'Volume Up', code: 'VolumeUp' },
  { label: 'Volume Down', code: 'VolumeDown' },
  { label: 'Mute Audio', code: 'AudioVolumeMute' },
  { label: 'Play / Pause', code: 'MediaPlayPause' },
  { label: 'Next Track', code: 'MediaTrackNext' },
  { label: 'Previous Track', code: 'MediaTrackPrevious' },
  { label: 'Stop Media', code: 'MediaStop' },
  { label: 'Calculator', code: 'LaunchCalculator' },
  { label: 'My Computer', code: 'LaunchMyComputer' },
  { label: 'Browser Home', code: 'BrowserHome' }
];

const MOUSE_FUNCTIONS = [
  { label: 'Left Click', code: 'MouseLeft' },
  { label: 'Right Click', code: 'MouseRight' },
  { label: 'Middle Click', code: 'MouseMiddle' },
  { label: 'Forward (Button 5)', code: 'MouseForward' },
  { label: 'Back (Button 4)', code: 'MouseBack' },
  { label: 'Scroll Up', code: 'MouseWheelUp' },
  { label: 'Scroll Down', code: 'MouseWheelDown' },
  { label: 'DPI Cycle', code: 'MouseDpiCycle' }
];

export const KeyRemapper: React.FC<KeyRemapperProps> = ({
  keyCap,
  activeLayer,
  currentRemap,
  macros,
  onSaveRemap,
  onResetRemap,
  onClose
}) => {
  if (!keyCap) return null;

  const [remapType, setRemapType] = useState<'default' | 'keyboard' | 'multimedia' | 'mouse' | 'macro' | 'disabled'>(
    currentRemap?.mappedType || 'default'
  );
  const [selectedValue, setSelectedValue] = useState<string>(currentRemap?.mappedValue || keyCap.label);

  const handleSave = () => {
    onSaveRemap({
      keyIndex: keyCap.index,
      code: keyCap.code,
      mappedType: remapType,
      mappedValue: selectedValue,
      layer: activeLayer
    });
    onClose();
  };

  const handleReset = () => {
    onResetRemap(keyCap.index, activeLayer);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        width: '680px',
        maxWidth: '100%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Remap Key: <span style={{ color: 'var(--accent-cyan)' }}>{keyCap.label}</span>
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              Layer {activeLayer === 0 ? 'Base' : `Fn${activeLayer}`} • Hardware Code: {keyCap.code}
            </span>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Categories Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          padding: '14px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(0, 0, 0, 0.2)'
        }}>
          {[
            { id: 'keyboard', label: 'Standard Keys', icon: Layers },
            { id: 'multimedia', label: 'Multimedia', icon: Volume2 },
            { id: 'mouse', label: 'Mouse Buttons', icon: Mouse },
            { id: 'macro', label: 'Macro Sequence', icon: Cpu }
          ].map(tab => {
            const Icon = tab.icon;
            const isCurrent = remapType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setRemapType(tab.id as any)}
                className={`btn ${isCurrent ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '7px 12px', fontSize: '12px' }}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Remap Picker Content */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {remapType === 'keyboard' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: '8px' }}>
              {STANDARD_KEYS.map(k => (
                <button
                  key={k}
                  onClick={() => setSelectedValue(k)}
                  className="glass-card"
                  style={{
                    padding: '12px 6px',
                    textAlign: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: selectedValue === k ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                    background: selectedValue === k ? 'var(--bg-surface-active)' : undefined
                  }}
                >
                  {k}
                </button>
              ))}
            </div>
          )}

          {remapType === 'multimedia' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
              {MEDIA_KEYS.map(m => (
                <button
                  key={m.code}
                  onClick={() => setSelectedValue(m.label)}
                  className="glass-card"
                  style={{
                    padding: '14px',
                    textAlign: 'left',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: selectedValue === m.label ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                    background: selectedValue === m.label ? 'var(--bg-surface-active)' : undefined
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>
          )}

          {remapType === 'mouse' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
              {MOUSE_FUNCTIONS.map(m => (
                <button
                  key={m.code}
                  onClick={() => setSelectedValue(m.label)}
                  className="glass-card"
                  style={{
                    padding: '14px',
                    textAlign: 'left',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: selectedValue === m.label ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                    background: selectedValue === m.label ? 'var(--bg-surface-active)' : undefined
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>
          )}

          {remapType === 'macro' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {macros.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                  No macros created yet. Go to Macro Timeline to record new actions.
                </div>
              ) : (
                macros.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedValue(m.name)}
                    className="glass-card"
                    style={{
                      padding: '14px',
                      textAlign: 'left',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: selectedValue === m.name ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                      background: selectedValue === m.name ? 'var(--bg-surface-active)' : undefined,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span>{m.name}</span>
                    <span className="badge badge-purple">{m.actions.length} actions</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          borderTop: '1px solid var(--border-subtle)',
          background: 'rgba(0, 0, 0, 0.3)'
        }}>
          <button 
            className="btn btn-danger" 
            onClick={handleReset}
            style={{ padding: '8px 14px', fontSize: '12px' }}
          >
            <Trash2 size={14} />
            <span>Reset to Default</span>
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-secondary" onClick={onClose} style={{ padding: '8px 16px', fontSize: '13px' }}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSave} style={{ padding: '8px 18px', fontSize: '13px' }}>
              <Check size={16} />
              <span>Save Assignment</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
