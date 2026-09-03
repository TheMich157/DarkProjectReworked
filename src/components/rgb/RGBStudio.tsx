import React from 'react';
import { LightingConfig, RGBEffect, RGBColor } from '../../core/protocol/types';
import { hexToRgb, rgbToHex } from '../../core/protocol/drivers/baseDriver';
import { Sparkles, Sun, Gauge, Palette, ArrowRight, ArrowLeft, ArrowUp, ArrowDown } from 'lucide-react';

interface RGBStudioProps {
  lighting: LightingConfig;
  onChange: (newConfig: LightingConfig) => void;
}

const PRESET_EFFECTS: { id: RGBEffect; name: string; desc: string }[] = [
  { id: 'wave', name: 'RGB Wave', desc: 'Flowing multi-color wave across the matrix' },
  { id: 'rainbow', name: 'Rainbow Spectrum', desc: 'Smooth full RGB chromatic cycling' },
  { id: 'breathing', name: 'Breathing Pulse', desc: 'Rhythmic fade in and fade out' },
  { id: 'static', name: 'Solid Color', desc: 'Constant customizable solid lighting' },
  { id: 'reactive', name: 'Reactive Click', desc: 'Illuminates switches on actuation' },
  { id: 'ripple', name: 'Water Ripple', desc: 'Radial wave expanding from pressed keys' },
  { id: 'aurora', name: 'Aurora Borealis', desc: 'Shimmering organic neon gradients' },
  { id: 'sinewave', name: 'Sine Wave', desc: 'Oscillating lighting frequencies' },
  { id: 'spiral', name: 'Spiral Galaxy', desc: 'Rotating vortex of dynamic colors' },
  { id: 'rain', name: 'Matrix Rain', desc: 'Vertical falling digital raindrops' },
  { id: 'off', name: 'Lights Off', desc: 'Disable all LED lighting to conserve battery' }
];

const QUICK_COLORS = [
  '#00f0ff', // Cyber Cyan
  '#8b5cf6', // Electric Violet
  '#ec4899', // Crimson Pink
  '#10b981', // Emerald Green
  '#f59e0b', // Amber Orange
  '#ef4444', // Red Flame
  '#ffffff', // Pure White
  '#3b82f6'  // Ocean Blue
];

export const RGBStudio: React.FC<RGBStudioProps> = ({ lighting, onChange }) => {
  const currentHex = rgbToHex(lighting.color);

  const handleEffectChange = (effect: RGBEffect) => {
    onChange({
      ...lighting,
      effect
    });
  };

  const handleColorChange = (hex: string) => {
    onChange({
      ...lighting,
      color: hexToRgb(hex)
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Lighting Presets Grid */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="var(--accent-pink)" />
              <span>RGB Dynamic Effects</span>
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Select real-time hardware lighting mode
            </p>
          </div>
          <span className="badge badge-purple">{lighting.effect.toUpperCase()}</span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '12px'
        }}>
          {PRESET_EFFECTS.map(eff => {
            const isActive = lighting.effect === eff.id;
            return (
              <div
                key={eff.id}
                className="glass-card"
                onClick={() => handleEffectChange(eff.id)}
                style={{
                  padding: '14px',
                  cursor: 'pointer',
                  border: isActive ? '1px solid var(--accent-pink)' : '1px solid var(--border-subtle)',
                  background: isActive ? 'var(--bg-surface-active)' : undefined,
                  boxShadow: isActive ? '0 0 16px var(--accent-pink-glow)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <span style={{ fontSize: '13px', fontWeight: 700, color: isActive ? 'var(--accent-pink)' : 'var(--text-primary)' }}>
                  {eff.name}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {eff.desc}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lighting Controls: Brightness, Speed, Color Swatches */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
        {/* Color Palette & Custom Hex */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Palette size={18} color="var(--accent-cyan)" />
              <h4 style={{ fontSize: '14px', fontWeight: 700 }}>Accent Color</h4>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="color"
                value={currentHex}
                onChange={(e) => handleColorChange(e.target.value)}
                style={{
                  width: '28px',
                  height: '28px',
                  border: 'none',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  background: 'transparent'
                }}
              />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent-cyan)' }}>
                {currentHex.toUpperCase()}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {QUICK_COLORS.map(c => (
              <button
                key={c}
                onClick={() => handleColorChange(c)}
                style={{
                  height: '36px',
                  borderRadius: 'var(--radius-sm)',
                  background: c,
                  border: currentHex.toLowerCase() === c.toLowerCase() ? '2px solid #fff' : '1px solid rgba(0,0,0,0.3)',
                  boxShadow: currentHex.toLowerCase() === c.toLowerCase() ? `0 0 12px ${c}` : 'none',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease'
                }}
              />
            ))}
          </div>
        </div>

        {/* Sliders: Brightness & Animation Speed */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Brightness */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sun size={16} color="var(--accent-amber)" />
                <span style={{ fontSize: '13px', fontWeight: 600 }}>LED Brightness</span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent-cyan)' }}>
                {lighting.brightness}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={lighting.brightness}
              onChange={(e) => onChange({ ...lighting, brightness: Number(e.target.value) })}
            />
          </div>

          {/* Animation Speed */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Gauge size={16} color="var(--accent-purple)" />
                <span style={{ fontSize: '13px', fontWeight: 600 }}>Animation Speed</span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent-cyan)' }}>
                Level {lighting.speed}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={lighting.speed}
              onChange={(e) => onChange({ ...lighting, speed: Number(e.target.value) })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
