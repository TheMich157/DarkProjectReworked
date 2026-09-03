import React, { useState } from 'react';
import { DeviceDefinition, KeyboardProfile } from '../core/types';
import { Keyboard, Layers, Sparkles, Sliders, Check } from 'lucide-react';

interface KeyboardVisualizerProps {
  device: DeviceDefinition;
  profile: KeyboardProfile;
  onChangeProfile: (updated: KeyboardProfile) => void;
  activeLayer: 'base' | 'fn1' | 'fn2' | 'fn3';
  onChangeLayer: (layer: 'base' | 'fn1' | 'fn2' | 'fn3') => void;
}

interface KeyDefinition {
  code: string;
  label: string;
  width?: number; // default 1 (e.g. 1.25, 1.5, 1.75, 2.0, 2.25, 2.75, 6.25)
}

export const KeyboardVisualizer: React.FC<KeyboardVisualizerProps> = ({
  device,
  profile,
  onChangeProfile,
  activeLayer,
  onChangeLayer,
}) => {
  const [selectedKey, setSelectedKey] = useState<string | null>('KeyW');
  const [remapValue, setRemapValue] = useState<string>('');
  const [isEditingKey, setIsEditingKey] = useState(false);

  // Standard TKL 87-key ANSI layout structure
  const keyboardRows: KeyDefinition[][] = [
    // Function Row
    [
      { code: 'Escape', label: 'ESC' },
      { code: 'F1', label: 'F1' },
      { code: 'F2', label: 'F2' },
      { code: 'F3', label: 'F3' },
      { code: 'F4', label: 'F4' },
      { code: 'F5', label: 'F5' },
      { code: 'F6', label: 'F6' },
      { code: 'F7', label: 'F7' },
      { code: 'F8', label: 'F8' },
      { code: 'F9', label: 'F9' },
      { code: 'F10', label: 'F10' },
      { code: 'F11', label: 'F11' },
      { code: 'F12', label: 'F12' },
      { code: 'PrintScreen', label: 'PRT' },
      { code: 'ScrollLock', label: 'SCR' },
      { code: 'Pause', label: 'PAU' },
    ],
    // Number Row
    [
      { code: 'Backquote', label: '~' },
      { code: 'Digit1', label: '1' },
      { code: 'Digit2', label: '2' },
      { code: 'Digit3', label: '3' },
      { code: 'Digit4', label: '4' },
      { code: 'Digit5', label: '5' },
      { code: 'Digit6', label: '6' },
      { code: 'Digit7', label: '7' },
      { code: 'Digit8', label: '8' },
      { code: 'Digit9', label: '9' },
      { code: 'Digit0', label: '0' },
      { code: 'Minus', label: '-' },
      { code: 'Equal', label: '=' },
      { code: 'Backspace', label: 'BKSP', width: 2.0 },
      { code: 'Insert', label: 'INS' },
      { code: 'Home', label: 'HOME' },
      { code: 'PageUp', label: 'PGUP' },
    ],
    // QWERTY Row
    [
      { code: 'Tab', label: 'TAB', width: 1.5 },
      { code: 'KeyQ', label: 'Q' },
      { code: 'KeyW', label: 'W' },
      { code: 'KeyE', label: 'E' },
      { code: 'KeyR', label: 'R' },
      { code: 'KeyT', label: 'T' },
      { code: 'KeyY', label: 'Y' },
      { code: 'KeyU', label: 'U' },
      { code: 'KeyI', label: 'I' },
      { code: 'KeyO', label: 'O' },
      { code: 'KeyP', label: 'P' },
      { code: 'BracketLeft', label: '[' },
      { code: 'BracketRight', label: ']' },
      { code: 'Backslash', label: '\\', width: 1.5 },
      { code: 'Delete', label: 'DEL' },
      { code: 'End', label: 'END' },
      { code: 'PageDown', label: 'PGDN' },
    ],
    // ASDF Row
    [
      { code: 'CapsLock', label: 'CAPS', width: 1.75 },
      { code: 'KeyA', label: 'A' },
      { code: 'KeyS', label: 'S' },
      { code: 'KeyD', label: 'D' },
      { code: 'KeyF', label: 'F' },
      { code: 'KeyG', label: 'G' },
      { code: 'KeyH', label: 'H' },
      { code: 'KeyJ', label: 'J' },
      { code: 'KeyK', label: 'K' },
      { code: 'KeyL', label: 'L' },
      { code: 'Semicolon', label: ';' },
      { code: 'Quote', label: "'" },
      { code: 'Enter', label: 'ENTER', width: 2.25 },
    ],
    // ZXCV Row
    [
      { code: 'ShiftLeft', label: 'SHIFT', width: 2.25 },
      { code: 'KeyZ', label: 'Z' },
      { code: 'KeyX', label: 'X' },
      { code: 'KeyC', label: 'C' },
      { code: 'KeyV', label: 'V' },
      { code: 'KeyB', label: 'B' },
      { code: 'KeyN', label: 'N' },
      { code: 'KeyM', label: 'M' },
      { code: 'Comma', label: ',' },
      { code: 'Period', label: '.' },
      { code: 'Slash', label: '/' },
      { code: 'ShiftRight', label: 'SHIFT', width: 2.75 },
      { code: 'ArrowUp', label: '▲' },
    ],
    // Bottom Row
    [
      { code: 'ControlLeft', label: 'CTRL', width: 1.25 },
      { code: 'MetaLeft', label: 'WIN', width: 1.25 },
      { code: 'AltLeft', label: 'ALT', width: 1.25 },
      { code: 'Space', label: 'SPACE', width: 6.25 },
      { code: 'AltRight', label: 'ALT', width: 1.25 },
      { code: 'Fn', label: 'FN', width: 1.25 },
      { code: 'ContextMenu', label: 'APP', width: 1.25 },
      { code: 'ControlRight', label: 'CTRL', width: 1.25 },
      { code: 'ArrowLeft', label: '◀' },
      { code: 'ArrowDown', label: '▼' },
      { code: 'ArrowRight', label: '▶' },
    ],
  ];

  const handleKeyClick = (code: string) => {
    setSelectedKey(code);
    setIsEditingKey(true);
    const existing = profile.keyMappings[code];
    setRemapValue(existing ? existing.mappedKey : '');
  };

  const handleSaveRemap = () => {
    if (!selectedKey) return;
    const updated = { ...profile.keyMappings };
    if (remapValue.trim()) {
      updated[selectedKey] = {
        code: selectedKey,
        label: selectedKey,
        mappedKey: remapValue.trim(),
      };
    } else {
      delete updated[selectedKey];
    }
    onChangeProfile({ ...profile, keyMappings: updated });
    setIsEditingKey(false);
  };

  const handlePerKeyActuation = (valMm: number) => {
    if (!selectedKey) return;
    const actuation = profile.actuation || {
      globalActuationMm: 1.2,
      rapidTriggerEnabled: true,
      rapidTriggerPressMm: 0.1,
      rapidTriggerReleaseMm: 0.1,
      perKeyActuation: {},
    };
    const updatedPerKey = { ...actuation.perKeyActuation, [selectedKey]: valMm };
    onChangeProfile({
      ...profile,
      actuation: { ...actuation, perKeyActuation: updatedPerKey },
    });
  };

  // Get active key RGB color
  const getKeyColor = (code: string) => {
    if (profile.rgb.perKeyColors[code]) {
      return profile.rgb.perKeyColors[code];
    }
    return profile.rgb.primaryColor || '#00f0ff';
  };

  const selectedKeyActuation =
    profile.actuation?.perKeyActuation[selectedKey || ''] ??
    profile.actuation?.globalActuationMm ??
    1.2;

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-6 px-6">
      {/* Header Controls: Layer Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-4">
        <div className="flex items-center gap-2.5">
          <Keyboard className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="font-display font-bold text-sm text-white">
              {device.displayName} Keyboard Layout
            </h3>
            <p className="text-xs text-slate-400">
              Click any key to remap, assign macros, or adjust individual magnetic actuation point.
            </p>
          </div>
        </div>

        {/* Layers */}
        <div className="flex items-center gap-1.5 bg-[#0e111a] p-1 rounded-xl border border-white/10">
          <span className="text-xs font-semibold text-slate-400 px-2 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> Layer:
          </span>
          {(['base', 'fn1', 'fn2'] as const).map((layer) => (
            <button
              key={layer}
              onClick={() => onChangeLayer(layer)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeLayer === layer
                  ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {layer.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Main Visualizer Board */}
      <div className="glass-panel p-6 overflow-x-auto shadow-2xl">
        <div className="min-w-[880px] bg-[#0c0e17] p-5 rounded-2xl border border-white/10 shadow-inner flex flex-col gap-2">
          {keyboardRows.map((row, rIdx) => (
            <div key={rIdx} className="flex items-center gap-1.5">
              {row.map((k) => {
                const isSelected = selectedKey === k.code;
                const isMapped = !!profile.keyMappings[k.code];
                const keyColor = getKeyColor(k.code);
                const widthUnit = k.width || 1;

                return (
                  <button
                    key={k.code}
                    onClick={() => handleKeyClick(k.code)}
                    className={`h-11 rounded-lg font-mono text-xs font-bold transition-all flex flex-col items-center justify-center relative cursor-pointer select-none ${
                      isSelected
                        ? 'border-2 border-white scale-105 shadow-lg shadow-cyan-500/40 z-20'
                        : 'border border-white/10 hover:border-white/40 hover:scale-[1.02]'
                    }`}
                    style={{
                      width: `${Math.round(widthUnit * 48)}px`,
                      backgroundColor: isSelected ? '#1e2438' : '#141824',
                      color: isSelected ? '#ffffff' : '#cbd5e1',
                      boxShadow: isSelected
                        ? `0 0 15px ${keyColor}80`
                        : `inset 0 -2px 0 rgba(0,0,0,0.5), 0 0 8px ${keyColor}25`,
                    }}
                  >
                    <span>{k.label}</span>
                    {/* Micro LED underline */}
                    <span
                      className="w-3 h-0.5 rounded-full mt-0.5"
                      style={{ backgroundColor: keyColor }}
                    />
                    {isMapped && (
                      <span className="absolute top-0.5 right-1 text-[8px] text-cyan-400 font-bold">
                        •
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Key Inspector & Remap Panel */}
      {selectedKey && (
        <div className="glass-panel p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Key Remapping */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <h4 className="font-display font-bold text-sm text-white">
                  Key Remap: <span className="font-mono text-cyan-400">{selectedKey}</span>
                </h4>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-300">
                Assigned Action / Keystroke:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. MediaPlay, F13, Ctrl+Shift+S, Macro1"
                  value={remapValue}
                  onChange={(e) => setRemapValue(e.target.value)}
                  className="flex-1 bg-[#121520] border border-white/10 rounded-xl px-3.5 py-2 text-sm font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={handleSaveRemap}
                  className="px-4 py-2 bg-cyan-500 text-black font-semibold rounded-xl text-xs hover:bg-cyan-400 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Save
                </button>
              </div>
            </div>
          </div>

          {/* Per-Key Actuation (If Rapid Trigger is enabled) */}
          {device.hasRapidTrigger && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  <h4 className="font-display font-bold text-sm text-white">
                    Per-Key Magnetic Actuation Point
                  </h4>
                </div>
                <span className="font-mono text-xs font-bold text-violet-400">
                  {selectedKeyActuation.toFixed(2)} mm
                </span>
              </div>

              <div className="space-y-2">
                <input
                  type="range"
                  min={0.1}
                  max={4.0}
                  step={0.05}
                  value={selectedKeyActuation}
                  onChange={(e) => handlePerKeyActuation(parseFloat(e.target.value))}
                  className="w-full"
                />
                <p className="text-[11px] text-slate-400">
                  Override global actuation point specifically for this key (e.g., ultra-light WASD
                  for competitive FPS).
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
