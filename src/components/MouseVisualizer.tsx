import React, { useState } from 'react';
import { DeviceDefinition, MouseSettings, MouseButtonMapping } from '../core/types';
import { MousePointer, Check, Sliders, Shield, Zap, Sparkles } from 'lucide-react';

interface MouseVisualizerProps {
  device: DeviceDefinition;
  settings: MouseSettings;
  onChange: (updated: MouseSettings) => void;
}

export const MouseVisualizer: React.FC<MouseVisualizerProps> = ({
  device,
  settings,
  onChange,
}) => {
  const [selectedBtn, setSelectedBtn] = useState<number>(1);
  const currentMapping = settings.buttonMappings[selectedBtn] || {
    buttonIndex: selectedBtn,
    name: `Button ${selectedBtn}`,
    action: 'click',
  };

  const actionOptions: Array<{ action: MouseButtonMapping['action']; label: string; desc: string }> = [
    { action: 'click', label: 'Left Primary Click', desc: 'Standard left mouse click' },
    { action: 'menu', label: 'Right Context Menu', desc: 'Standard right mouse click' },
    { action: 'middle', label: 'Middle Click / Scroll', desc: 'Scroll wheel button click' },
    { action: 'back', label: 'Side Back (MB4)', desc: 'Browser or gaming back navigation' },
    { action: 'forward', label: 'Side Forward (MB5)', desc: 'Browser or gaming forward navigation' },
    { action: 'dpi_cycle', label: 'DPI Stage Cycle', desc: 'Cycles through configured DPI stages' },
    { action: 'fire_key', label: 'Rapid Fire Burst', desc: 'Simulates rapid repeated mouse clicks' },
    { action: 'key_combo', label: 'Keyboard Shortcut', desc: 'Custom key combination' },
    { action: 'macro', label: 'Custom Macro', desc: 'Executes recorded macro sequence' },
  ];

  const handleUpdateAction = (action: MouseButtonMapping['action']) => {
    const updated = {
      ...settings.buttonMappings,
      [selectedBtn]: {
        ...currentMapping,
        action,
      },
    };
    onChange({ ...settings, buttonMappings: updated });
  };

  const activeDpiStage = settings.dpiStages[settings.currentDpiIndex] || settings.dpiStages[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-6 px-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive Mouse Silhouette with Clickable Hotspots (7 cols) */}
        <div className="lg:col-span-7 glass-panel p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <MousePointer className="w-5 h-5 text-cyan-400" />
              <h3 className="font-display font-bold text-base text-white">
                {device.displayName} Ergonomic Layout
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              6 Programmable Switches
            </span>
          </div>

          {/* Interactive Mouse Visualizer Frame */}
          <div className="relative w-full max-w-md mx-auto aspect-[4/5] bg-[#0c0e17] rounded-3xl border border-white/10 p-6 flex flex-col items-center justify-between shadow-2xl overflow-hidden">
            {/* Ambient LED underglow */}
            <div
              className="absolute -bottom-10 inset-x-0 h-40 opacity-30 blur-3xl transition-all duration-500 pointer-events-none"
              style={{ backgroundColor: activeDpiStage.color }}
            />

            {/* Mouse Top Body Silhouette */}
            <div className="relative w-48 h-80 bg-[#161926] rounded-t-[5rem] rounded-b-[4rem] border-2 border-white/15 p-2 flex flex-col items-center justify-between shadow-inner">
              {/* Left & Right Click split */}
              <div className="w-full flex gap-1 h-36">
                {/* Left Click (MB1) */}
                <button
                  onClick={() => setSelectedBtn(1)}
                  className={`flex-1 rounded-tl-[4.5rem] rounded-tr-lg border transition-all flex flex-col items-center justify-center p-2 cursor-pointer ${
                    selectedBtn === 1
                      ? 'bg-cyan-500/20 border-cyan-400 shadow-lg shadow-cyan-500/30'
                      : 'bg-[#1a1e2e] border-white/5 hover:border-white/20'
                  }`}
                >
                  <span className="font-mono text-xs font-bold text-white">MB1</span>
                  <span className="text-[9px] text-slate-400 mt-1">Left</span>
                </button>

                {/* Scroll Wheel & DPI Switch (MB3 & MB6) */}
                <div className="w-8 flex flex-col items-center justify-between py-2">
                  {/* Scroll Wheel Click */}
                  <button
                    onClick={() => setSelectedBtn(3)}
                    className={`w-6 h-12 rounded-full border transition-all flex items-center justify-center cursor-pointer ${
                      selectedBtn === 3
                        ? 'bg-cyan-500 border-white text-black shadow-md shadow-cyan-500/50'
                        : 'bg-[#0d0f18] border-white/10 hover:border-white/30 text-slate-300'
                    }`}
                    title="Middle Click (MB3)"
                  >
                    <span className="text-[8px] font-mono font-bold">M3</span>
                  </button>

                  {/* DPI Cycle Switch */}
                  <button
                    onClick={() => setSelectedBtn(6)}
                    className={`w-5 h-6 rounded-md border mt-2 transition-all flex items-center justify-center cursor-pointer ${
                      selectedBtn === 6
                        ? 'bg-cyan-500 border-white text-black'
                        : 'bg-[#1e2335] border-white/10 text-slate-300'
                    }`}
                    title="DPI Switch (MB6)"
                  >
                    <span className="text-[7px] font-mono font-bold">DPI</span>
                  </button>
                </div>

                {/* Right Click (MB2) */}
                <button
                  onClick={() => setSelectedBtn(2)}
                  className={`flex-1 rounded-tr-[4.5rem] rounded-tl-lg border transition-all flex flex-col items-center justify-center p-2 cursor-pointer ${
                    selectedBtn === 2
                      ? 'bg-cyan-500/20 border-cyan-400 shadow-lg shadow-cyan-500/30'
                      : 'bg-[#1a1e2e] border-white/5 hover:border-white/20'
                  }`}
                >
                  <span className="font-mono text-xs font-bold text-white">MB2</span>
                  <span className="text-[9px] text-slate-400 mt-1">Right</span>
                </button>
              </div>

              {/* Side Buttons (MB4 & MB5) */}
              <div className="absolute left-[-16px] top-32 flex flex-col gap-1.5">
                <button
                  onClick={() => setSelectedBtn(5)}
                  className={`w-4 h-9 rounded-l-lg border transition-all cursor-pointer ${
                    selectedBtn === 5
                      ? 'bg-cyan-400 border-white shadow-md shadow-cyan-500/50'
                      : 'bg-[#22273d] border-white/10 hover:bg-cyan-500/30'
                  }`}
                  title="Side Forward (MB5)"
                />
                <button
                  onClick={() => setSelectedBtn(4)}
                  className={`w-4 h-9 rounded-l-lg border transition-all cursor-pointer ${
                    selectedBtn === 4
                      ? 'bg-cyan-400 border-white shadow-md shadow-cyan-500/50'
                      : 'bg-[#22273d] border-white/10 hover:bg-cyan-500/30'
                  }`}
                  title="Side Back (MB4)"
                />
              </div>

              {/* Palm Rest Logo / DPI LED */}
              <div className="mb-6 flex flex-col items-center gap-1">
                <div
                  className="w-4 h-4 rounded-full shadow-lg border border-white/30 animate-pulse-subtle"
                  style={{ backgroundColor: activeDpiStage.color }}
                />
                <span className="text-[9px] font-mono text-slate-400 tracking-wider">
                  {activeDpiStage.dpi} DPI
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Button Configuration Inspector (5 cols) */}
        <div className="lg:col-span-5 glass-panel p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-cyan-400" />
              <h3 className="font-display font-bold text-base text-white">
                Button Action Assignment
              </h3>
            </div>
            <span className="font-mono text-xs font-bold text-cyan-400">
              BUTTON {selectedBtn}
            </span>
          </div>

          {/* Action List */}
          <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
            {actionOptions.map((opt) => {
              const isSelected = currentMapping.action === opt.action;
              return (
                <button
                  key={opt.action}
                  onClick={() => handleUpdateAction(opt.action)}
                  className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-400 text-white shadow-md shadow-cyan-500/10'
                      : 'bg-[#121520] border-white/5 text-slate-300 hover:border-white/15'
                  }`}
                >
                  <div>
                    <p className="font-semibold text-xs text-white">{opt.label}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{opt.desc}</p>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-cyan-400 shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
