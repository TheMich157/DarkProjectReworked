import React, { useState, useEffect, useRef } from 'react';
import { DeviceDefinition, LightingConfig, KeyRemapEntry, RGBColor, HallEffectKeyConfig } from '../../core/protocol/types';
import { getLayoutForDevice, KeyCapDefinition } from '../../core/layouts/keyboardLayouts';
import { rgbToHex } from '../../core/protocol/drivers/baseDriver';
import { Sparkles, Radio } from 'lucide-react';

interface KeyboardVisualizerProps {
  device: DeviceDefinition;
  lighting: LightingConfig;
  selectedKeyIndex: number | null;
  onSelectKey: (key: KeyCapDefinition) => void;
  remaps?: KeyRemapEntry[];
  hallEffectKeys?: Record<string, HallEffectKeyConfig>;
  activeLayer?: number;
}

export const KeyboardVisualizer: React.FC<KeyboardVisualizerProps> = ({
  device,
  lighting,
  selectedKeyIndex,
  onSelectKey,
  remaps = [],
  hallEffectKeys = {},
  activeLayer = 0
}) => {
  const [pressedCodes, setPressedCodes] = useState<Set<string>>(new Set());
  const [lastPressedCode, setLastPressedCode] = useState<string | null>(null);
  const [animTick, setAnimTick] = useState<number>(0);
  const animFrameRef = useRef<number | null>(null);

  // 60fps Real-time Animated RGB Engine
  useEffect(() => {
    if (lighting.effect === 'off') return;

    let lastTime = performance.now();
    const loop = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      const speedFactor = (lighting.speed || 3) * 45;
      setAnimTick(prev => (prev + delta * speedFactor) % 3600);

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [lighting.effect, lighting.speed]);

  // Physical keypress listener for live tactile responsiveness
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setPressedCodes(prev => new Set(prev).add(e.code));
      setLastPressedCode(e.code);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setPressedCodes(prev => {
        const next = new Set(prev);
        next.delete(e.code);
        return next;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const keys = getLayoutForDevice(device.layoutType);
  const rows = [0, 1, 2, 3, 4, 5];

  // Derive theme class from device model name
  const themeClass = device.devicename.toLowerCase().includes('fuji') ? 'theme-fuji' :
                     device.devicename.toLowerCase().includes('violet') ? 'theme-violet' :
                     device.devicename.toLowerCase().includes('bushido') ? 'theme-bushido' :
                     device.devicename.toLowerCase().includes('gamma') ? 'theme-gamma' : '';

  // Calculate live dynamic RGB color per key based on current animation effect
  const getKeyColor = (key: KeyCapDefinition): string => {
    if (lighting.effect === 'off') return '#111722';

    const brightnessFactor = (lighting.brightness ?? 100) / 100;
    if (brightnessFactor <= 0) return '#111722';

    // Custom per-key matrix
    if (lighting.customMatrix && lighting.customMatrix[key.index]) {
      const c = lighting.customMatrix[key.index];
      return `rgb(${Math.round(c.r * brightnessFactor)}, ${Math.round(c.g * brightnessFactor)}, ${Math.round(c.b * brightnessFactor)})`;
    }

    // 1. RGB Wave (Flowing horizontal spectrum)
    if (lighting.effect === 'wave') {
      const hue = (key.col * 22 - animTick * 2.2) % 360;
      const normHue = (hue + 360) % 360;
      return `hsl(${normHue}, 100%, ${52 * brightnessFactor}%)`;
    }

    // 2. Rainbow / Spectrum (Diagonal chromatic flow)
    if (lighting.effect === 'rainbow') {
      const hue = (key.col * 14 + key.row * 18 + animTick * 1.8) % 360;
      const normHue = (hue + 360) % 360;
      return `hsl(${normHue}, 100%, ${54 * brightnessFactor}%)`;
    }

    // 3. Breathing (Smooth brightness pulsing)
    if (lighting.effect === 'breathing') {
      const pulse = (Math.sin(animTick * 0.05) + 1) / 2;
      const r = Math.round(lighting.color.r * pulse * brightnessFactor);
      const g = Math.round(lighting.color.g * pulse * brightnessFactor);
      const b = Math.round(lighting.color.b * pulse * brightnessFactor);
      return `rgb(${r}, ${g}, ${b})`;
    }

    // 4. Aurora (Shimmering organic neon gradients)
    if (lighting.effect === 'aurora') {
      const shift = Math.sin(key.col * 0.4 + animTick * 0.04) * 60;
      const hue = (185 + shift + key.row * 15) % 360;
      const normHue = (hue + 360) % 360;
      return `hsl(${normHue}, 95%, ${55 * brightnessFactor}%)`;
    }

    // 5. Sinewave (Oscillating row waves)
    if (lighting.effect === 'sinewave') {
      const val = Math.sin(key.col * 0.5 - animTick * 0.07);
      const hue = (key.col * 20 + val * 45 + 360) % 360;
      return `hsl(${hue}, 100%, ${50 * brightnessFactor}%)`;
    }

    // 6. Spiral (Vortex rotating around center)
    if (lighting.effect === 'spiral') {
      const dx = key.col - 7;
      const dy = key.row - 2.5;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      const hue = (angle + dist * 22 + animTick * 2.5) % 360;
      const normHue = (hue + 360) % 360;
      return `hsl(${normHue}, 100%, ${55 * brightnessFactor}%)`;
    }

    // 7. Rain (Vertical falling green digital raindrops)
    if (lighting.effect === 'rain') {
      const colDrop = Math.floor((animTick * 0.12 + key.col * 2.5) % 9);
      if (Math.abs(key.row - colDrop) < 0.8) return `hsl(145, 100%, ${75 * brightnessFactor}%)`;
      if (key.row < colDrop && (colDrop - key.row) < 2.5) return `hsl(145, 100%, ${35 * brightnessFactor}%)`;
      return '#0b141e';
    }

    // 8. Reactive (Illuminates upon actuation)
    if (lighting.effect === 'reactive') {
      if (pressedCodes.has(key.code)) {
        return rgbToHex(lighting.color);
      }
      return '#111722';
    }

    // 9. Ripple (Radial glow effect)
    if (lighting.effect === 'ripple') {
      if (pressedCodes.has(key.code)) {
        return rgbToHex(lighting.color);
      }
      return '#0e1522';
    }

    // Static default color
    const r = Math.round(lighting.color.r * brightnessFactor);
    const g = Math.round(lighting.color.g * brightnessFactor);
    const b = Math.round(lighting.color.b * brightnessFactor);
    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <div className={`keyboard-container ${themeClass}`}>
      {/* Visualizer Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: '16px',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.3px' }}>
            {device.displayName}
          </span>
          <span className="badge badge-cyan">{device.layoutType}</span>
          {device.hasHallEffect && <span className="badge badge-purple">Magnetic Hall Effect 0.02mm</span>}
          {activeLayer > 0 && <span className="badge badge-emerald">Layer Fn{activeLayer}</span>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--accent-pink)' }}>
            <Sparkles size={13} />
            <span>RGB Sync: <strong>{lighting.effect.toUpperCase()}</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Radio size={12} color="var(--accent-cyan)" />
            <span>Keypress: <strong>{lastPressedCode ? lastPressedCode.replace('Key', '') : 'Ready'}</strong></span>
          </div>
        </div>
      </div>

      {/* 1:1 Keyboard Chassis Frame */}
      <div className="keyboard-chassis">
        <div className="keyboard-plate">
          {rows.map(rowNum => {
            const rowKeys = keys.filter(k => k.row === rowNum);
            return (
              <div key={rowNum} className="keyboard-row">
                {rowKeys.map(k => {
                  if (k.isSpacer) {
                    return (
                      <div 
                        key={`spacer-${k.code}`} 
                        style={{ width: `${(k.width || 1) * 44}px` }} 
                      />
                    );
                  }

                  const isPressed = pressedCodes.has(k.code);
                  const isSelected = selectedKeyIndex === k.index;
                  const remap = remaps.find(r => r.keyIndex === k.index && r.layer === activeLayer);
                  const heConfig = hallEffectKeys[k.code];
                  const keyColor = getKeyColor(k);
                  const keyWidth = (k.width || 1) * 48;
                  const isModifier = ['ShiftLeft', 'ShiftRight', 'ControlLeft', 'ControlRight', 'AltLeft', 'AltRight', 'MetaLeft', 'MetaRight', 'Enter', 'Backspace', 'CapsLock', 'Tab', 'Escape'].includes(k.code);

                  return (
                    <button
                      key={k.code}
                      className={`keycap ${isPressed ? 'pressed' : ''} ${isSelected ? 'selected' : ''} ${remap ? 'has-remap' : ''} ${heConfig ? 'he-active' : ''} ${isModifier ? 'is-modifier' : ''}`}
                      onClick={() => onSelectKey(k)}
                      style={{
                        width: `${keyWidth}px`,
                        minWidth: `${keyWidth}px`
                      }}
                      title={`${k.label} (${k.code})${remap ? ` -> ${remap.mappedValue}` : ''}${heConfig ? ` [Actuation: ${heConfig.actuationPoint}mm]` : ''}`}
                    >
                      {/* Live RGB Backlight Glow */}
                      <div 
                        className="keycap-rgb-glow" 
                        style={{ 
                          background: keyColor, 
                          opacity: isPressed ? 1 : (lighting.effect === 'off' ? 0 : 0.7),
                          boxShadow: lighting.effect === 'off' ? 'none' : `0 0 12px ${keyColor}`
                        }} 
                      />

                      {/* Double-Shot Backlit Key Legend */}
                      <span 
                        className="keycap-label"
                        style={{
                          color: lighting.effect === 'off' ? '#94a3b8' : '#ffffff',
                          textShadow: lighting.effect === 'off' ? 'none' : `0 0 8px ${keyColor}, 0 0 2px ${keyColor}`
                        }}
                      >
                        {remap ? remap.mappedValue : k.label}
                      </span>

                      {k.subLabel && !remap && (
                        <span className="keycap-sublabel">{k.subLabel}</span>
                      )}

                      {/* Hall Effect Live Actuation Tag */}
                      {device.hasHallEffect && isPressed && (
                        <span className="keycap-he-indicator" style={{ background: 'var(--accent-cyan)', color: '#05070a' }}>
                          PRESSED
                        </span>
                      )}
                      {heConfig && !isPressed && (
                        <span className="keycap-he-indicator">
                          {heConfig.actuationPoint}mm
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
