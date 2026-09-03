import React from 'react';
import { KeyboardProfile, MouseSettings, DeviceType } from '../core/types';
import { Palette, Sun, Gauge, Sparkles, Moon, Wand2 } from 'lucide-react';

interface RgbStudioProps {
  deviceType: DeviceType;
  keyboardProfile?: KeyboardProfile;
  mouseSettings?: MouseSettings;
  onUpdateKeyboardRgb?: (rgb: KeyboardProfile['rgb']) => void;
  onUpdateMouseRgb?: (rgb: MouseSettings['rgb']) => void;
}

export const RgbStudio: React.FC<RgbStudioProps> = ({
  deviceType,
  keyboardProfile,
  mouseSettings,
  onUpdateKeyboardRgb,
  onUpdateMouseRgb,
}) => {
  const isMouse = deviceType === 'mouse';

  const currentRgb = isMouse
    ? mouseSettings?.rgb || {
        effect: 'wave',
        brightness: 80,
        speed: 6,
        color: '#00f0ff',
        sleepTimeoutMin: 5,
      }
    : keyboardProfile?.rgb || {
        effect: 'wave',
        brightness: 90,
        speed: 7,
        primaryColor: '#00f0ff',
        secondaryColor: '#8b5cf6',
        perKeyColors: {},
      };

  const keyboardEffects = [
    { id: 'wave', label: 'Color Wave', desc: 'Smooth flowing spectrum' },
    { id: 'rainbow', label: 'Rainbow Spectrum', desc: 'Full dynamic RGB cycle' },
    { id: 'breathing', label: 'Breathing Glow', desc: 'Pulsing ambient color' },
    { id: 'reactive', label: 'Reactive Keypress', desc: 'Lights up on touch' },
    { id: 'ripple', label: 'Water Ripple', desc: 'Waves expand from pressed key' },
    { id: 'aurora', label: 'Northern Lights', desc: 'Cosmic shifting gradients' },
    { id: 'static', label: 'Static Solid', desc: 'Single constant color' },
    { id: 'off', label: 'Lights Off (Stealth)', desc: 'Maximizes battery life' },
  ];

  const mouseEffects = [
    { id: 'wave', label: 'RGB Flow Wave', desc: 'Dynamic spectrum flow' },
    { id: 'breathing', label: 'Breathing Pulse', desc: 'Soft glowing transition' },
    { id: 'neon', label: 'Neon Cycle', desc: 'Vibrant cyberpunk shifts' },
    { id: 'static', label: 'Static Glow', desc: 'Solid color illuminate' },
    { id: 'off', label: 'LED Off', desc: 'Maximum battery mode' },
  ];

  const colorPresets = [
    '#00f0ff', // Cyber Cyan
    '#0066ff', // Deep Blue
    '#8b5cf6', // Electric Violet
    '#ec4899', // Cyber Pink
    '#10b981', // Emerald Green
    '#f59e0b', // Amber Gold
    '#ef4444', // Neon Red
    '#ffffff', // Pure White
  ];

  const handleEffectChange = (effect: any) => {
    if (isMouse && onUpdateMouseRgb && mouseSettings) {
      onUpdateMouseRgb({ ...mouseSettings.rgb, effect });
    } else if (!isMouse && onUpdateKeyboardRgb && keyboardProfile) {
      onUpdateKeyboardRgb({ ...keyboardProfile.rgb, effect });
    }
  };

  const handleBrightnessChange = (brightness: number) => {
    if (isMouse && onUpdateMouseRgb && mouseSettings) {
      onUpdateMouseRgb({ ...mouseSettings.rgb, brightness });
    } else if (!isMouse && onUpdateKeyboardRgb && keyboardProfile) {
      onUpdateKeyboardRgb({ ...keyboardProfile.rgb, brightness });
    }
  };

  const handleSpeedChange = (speed: number) => {
    if (isMouse && onUpdateMouseRgb && mouseSettings) {
      onUpdateMouseRgb({ ...mouseSettings.rgb, speed });
    } else if (!isMouse && onUpdateKeyboardRgb && keyboardProfile) {
      onUpdateKeyboardRgb({ ...keyboardProfile.rgb, speed });
    }
  };

  const handleColorChange = (color: string) => {
    if (isMouse && onUpdateMouseRgb && mouseSettings) {
      onUpdateMouseRgb({ ...mouseSettings.rgb, color });
    } else if (!isMouse && onUpdateKeyboardRgb && keyboardProfile) {
      onUpdateKeyboardRgb({ ...keyboardProfile.rgb, primaryColor: color });
    }
  };

  const effects = isMouse ? mouseEffects : keyboardEffects;
  const activeColor = isMouse
    ? (currentRgb as any).color || '#00f0ff'
    : (currentRgb as any).primaryColor || '#00f0ff';

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-6 px-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Effect selector (7 cols) */}
        <div className="lg:col-span-7 glass-panel p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <Palette className="w-5 h-5 text-cyan-400" />
              <h2 className="font-display font-bold text-base text-white">
                RGB Lighting Profiles & Dynamic Animation
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">16.8M Colors</span>
          </div>

          {/* Effects Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {effects.map((fx) => {
              const isSelected = currentRgb.effect === fx.id;
              return (
                <button
                  key={fx.id}
                  onClick={() => handleEffectChange(fx.id)}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-400 shadow-lg shadow-cyan-500/10'
                      : 'bg-[#121520] border-white/5 hover:border-white/15'
                  }`}
                >
                  <p
                    className={`font-semibold text-sm ${
                      isSelected ? 'text-cyan-300' : 'text-slate-200'
                    }`}
                  >
                    {fx.label}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">{fx.desc}</p>
                </button>
              );
            })}
          </div>

          {/* Color Palettes */}
          <div className="space-y-3 pt-2">
            <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Quick Color Presets & Custom Hex
            </p>
            <div className="flex flex-wrap items-center gap-3">
              {colorPresets.map((hex) => (
                <button
                  key={hex}
                  onClick={() => handleColorChange(hex)}
                  className={`w-9 h-9 rounded-xl border-2 transition-all cursor-pointer shadow-md ${
                    activeColor.toLowerCase() === hex.toLowerCase()
                      ? 'border-white scale-110 shadow-lg'
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: hex }}
                />
              ))}

              <div className="flex items-center gap-2 bg-[#121520] px-3 py-1.5 rounded-xl border border-white/10 ml-auto">
                <input
                  type="color"
                  value={activeColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-6 h-6 rounded-md bg-transparent border-0 cursor-pointer"
                />
                <span className="font-mono text-xs text-slate-300 uppercase">
                  {activeColor}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Brightness & Animation Speed Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <Wand2 className="w-5 h-5 text-violet-400" />
                <h3 className="font-display font-bold text-base text-white">
                  Intensity & Timing
                </h3>
              </div>
            </div>

            {/* Brightness */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>Brightness</span>
                </div>
                <span className="font-mono text-sm font-bold text-amber-400">
                  {currentRgb.brightness}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={currentRgb.brightness}
                onChange={(e) => handleBrightnessChange(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Speed */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Gauge className="w-4 h-4 text-cyan-400" />
                  <span>Animation Speed</span>
                </div>
                <span className="font-mono text-sm font-bold text-cyan-400">
                  Level {currentRgb.speed}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={currentRgb.speed}
                onChange={(e) => handleSpeedChange(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Inactivity / Sleep Timer */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Moon className="w-4 h-4 text-violet-400" />
                  <span>Auto-Sleep Timeout</span>
                </div>
                <span className="font-mono text-xs font-bold text-violet-300">
                  {isMouse ? (currentRgb as any).sleepTimeoutMin || 5 : 5} min
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Turns off RGB LEDs when idle to conserve wireless battery.
              </p>
            </div>
          </div>

          {/* Live Animation Glow Demonstration */}
          <div className="glass-panel p-6 text-center space-y-3 relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-20 blur-2xl transition-all duration-700"
              style={{
                backgroundColor: activeColor,
              }}
            />
            <Sparkles className="w-8 h-8 text-cyan-400 mx-auto animate-pulse-subtle" />
            <p className="font-display font-bold text-sm text-white">
              Live Hardware Sync Ready
            </p>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Changes are immediately mirrored in the interactive visualizer and sent to the MCU
              on sync.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
