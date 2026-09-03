import React from 'react';
import { MouseSettings } from '../core/types';
import {
  Gauge,
  Sliders,
  Activity,
  ShieldCheck,
  Zap,
  Crosshair,
  Sparkles,
} from 'lucide-react';

interface SensorStudioProps {
  settings: MouseSettings;
  onChange: (updated: MouseSettings) => void;
}

export const SensorStudio: React.FC<SensorStudioProps> = ({
  settings,
  onChange,
}) => {
  const currentStage = settings.dpiStages[settings.currentDpiIndex] || settings.dpiStages[0];

  const handleUpdateDpiStage = (index: number, newDpi: number) => {
    const updatedStages = [...settings.dpiStages];
    updatedStages[index] = {
      ...updatedStages[index],
      dpi: Math.max(50, Math.min(26000, newDpi)),
    };
    onChange({ ...settings, dpiStages: updatedStages });
  };

  const handleUpdateStageColor = (index: number, newColor: string) => {
    const updatedStages = [...settings.dpiStages];
    updatedStages[index] = {
      ...updatedStages[index],
      color: newColor,
    };
    onChange({ ...settings, dpiStages: updatedStages });
  };

  const handleToggleStage = (index: number) => {
    const updatedStages = [...settings.dpiStages];
    updatedStages[index] = {
      ...updatedStages[index],
      enabled: !updatedStages[index].enabled,
    };
    onChange({ ...settings, dpiStages: updatedStages });
  };

  const pollingRates = [
    { rate: 125, latency: '8.0 ms', label: '125Hz' },
    { rate: 250, latency: '4.0 ms', label: '250Hz' },
    { rate: 500, latency: '2.0 ms', label: '500Hz' },
    { rate: 1000, latency: '1.0 ms', label: '1000Hz (1K)' },
    { rate: 2000, latency: '0.5 ms', label: '2000Hz (2K)' },
    { rate: 4000, latency: '0.25 ms', label: '4000Hz (4K)' },
    { rate: 8000, latency: '0.125 ms', label: '8000Hz (8K Ultra)' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-6 px-6">
      {/* Top Banner: Active Sensor Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Current DPI
            </p>
            <p className="text-2xl font-mono font-bold text-cyan-400 mt-1">
              {currentStage.dpi} <span className="text-xs text-slate-500">DPI</span>
            </p>
          </div>
          <div
            className="w-8 h-8 rounded-full shadow-lg border border-white/20"
            style={{ backgroundColor: currentStage.color }}
          />
        </div>

        <div className="glass-panel p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Polling Rate
            </p>
            <p className="text-2xl font-mono font-bold text-violet-400 mt-1">
              {settings.pollingRate} <span className="text-xs text-slate-500">Hz</span>
            </p>
          </div>
          <Zap className="w-6 h-6 text-violet-400" />
        </div>

        <div className="glass-panel p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Lift-Off Distance (LOD)
            </p>
            <p className="text-2xl font-mono font-bold text-emerald-400 mt-1">
              {settings.lod}
            </p>
          </div>
          <Crosshair className="w-6 h-6 text-emerald-400" />
        </div>

        <div className="glass-panel p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Debounce Time
            </p>
            <p className="text-2xl font-mono font-bold text-amber-400 mt-1">
              {settings.debounceTimeMs} <span className="text-xs text-slate-500">ms</span>
            </p>
          </div>
          <Activity className="w-6 h-6 text-amber-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: DPI Stages Customizer (8 cols) */}
        <div className="lg:col-span-7 glass-panel p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <Gauge className="w-5 h-5 text-cyan-400" />
              <h2 className="font-display font-bold text-base text-white">
                DPI Stages & Optical Calibration
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              PAW3395 Optical Sensor • 50-26,000 DPI
            </span>
          </div>

          {/* DPI Stages List */}
          <div className="space-y-4">
            {settings.dpiStages.map((stage, idx) => {
              const isActive = settings.currentDpiIndex === idx;
              return (
                <div
                  key={stage.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-cyan-500/10 border-cyan-500/50 shadow-md shadow-cyan-500/10'
                      : 'bg-[#121520] border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onChange({ ...settings, currentDpiIndex: idx })}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/40'
                            : 'bg-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        STAGE {stage.id}
                      </button>
                      <input
                        type="color"
                        value={stage.color}
                        onChange={(e) => handleUpdateStageColor(idx, e.target.value)}
                        className="w-6 h-6 rounded-md border-0 bg-transparent cursor-pointer"
                        title="Change LED color for this DPI stage"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-[#0d0f18] px-3 py-1 rounded-lg border border-white/10">
                        <input
                          type="number"
                          value={stage.dpi}
                          step={50}
                          min={50}
                          max={26000}
                          onChange={(e) =>
                            handleUpdateDpiStage(idx, parseInt(e.target.value) || 50)
                          }
                          className="w-20 bg-transparent text-right font-mono text-sm font-bold text-cyan-300 focus:outline-none"
                        />
                        <span className="text-xs text-slate-500 ml-1.5 font-mono">DPI</span>
                      </div>

                      <button
                        onClick={() => handleToggleStage(idx)}
                        className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                          stage.enabled
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-500 border border-white/5'
                        }`}
                      >
                        {stage.enabled ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>
                  </div>

                  {/* Range Slider */}
                  <input
                    type="range"
                    min={50}
                    max={26000}
                    step={50}
                    value={stage.dpi}
                    onChange={(e) =>
                      handleUpdateDpiStage(idx, parseInt(e.target.value))
                    }
                    className="w-full"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Polling Rate & Advanced Sensor Options (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Polling Rate */}
          <div className="glass-panel p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-violet-400" />
                <h3 className="font-display font-bold text-sm text-white">
                  USB Polling Rate (Hyper-Polling)
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {pollingRates.map((pr) => {
                const isSelected = settings.pollingRate === pr.rate;
                return (
                  <button
                    key={pr.rate}
                    onClick={() => onChange({ ...settings, pollingRate: pr.rate as any })}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-violet-600/30 to-blue-600/30 border-violet-500 text-white shadow-lg shadow-violet-500/20'
                        : 'bg-[#121520] border-white/5 text-slate-400 hover:text-slate-200 hover:border-white/15'
                    }`}
                  >
                    <p className="font-mono font-bold text-sm">{pr.label}</p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Latency: {pr.latency}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sensor Precision & Angle Snapping */}
          <div className="glass-panel p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-emerald-400" />
                <h3 className="font-display font-bold text-sm text-white">
                  Precision Tuning & Sensor Features
                </h3>
              </div>
            </div>

            {/* LOD Switch */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#121520] border border-white/5">
              <div>
                <p className="text-xs font-semibold text-white">Lift-Off Distance (LOD)</p>
                <p className="text-[11px] text-slate-400">Sensor tracking cutoff height</p>
              </div>
              <div className="flex items-center gap-1 bg-[#0b0d14] p-1 rounded-lg border border-white/10">
                {(['1mm', '2mm'] as const).map((lodOption) => (
                  <button
                    key={lodOption}
                    onClick={() => onChange({ ...settings, lod: lodOption })}
                    className={`px-3 py-1 rounded-md text-xs font-mono font-bold transition-all ${
                      settings.lod === lodOption
                        ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {lodOption}
                  </button>
                ))}
              </div>
            </div>

            {/* MotionSync */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#121520] border border-white/5">
              <div>
                <p className="text-xs font-semibold text-white">MotionSync</p>
                <p className="text-[11px] text-slate-400">Syncs sensor events with USB frames</p>
              </div>
              <input
                type="checkbox"
                checked={settings.motionSync}
                onChange={(e) => onChange({ ...settings, motionSync: e.target.checked })}
                className="w-5 h-5 accent-cyan-500 rounded cursor-pointer"
              />
            </div>

            {/* Angle Snapping */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#121520] border border-white/5">
              <div>
                <p className="text-xs font-semibold text-white">Angle Snapping (StraightLine)</p>
                <p className="text-[11px] text-slate-400">Predictive linear cursor alignment</p>
              </div>
              <input
                type="checkbox"
                checked={settings.angleSnapping}
                onChange={(e) => onChange({ ...settings, angleSnapping: e.target.checked })}
                className="w-5 h-5 accent-cyan-500 rounded cursor-pointer"
              />
            </div>

            {/* Debounce Time Slider */}
            <div className="p-3 rounded-xl bg-[#121520] border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-white">Button Debounce Time</p>
                  <p className="text-[11px] text-slate-400">Eliminates switch double-clicks</p>
                </div>
                <span className="font-mono text-sm font-bold text-amber-400">
                  {settings.debounceTimeMs} ms
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={20}
                step={1}
                value={settings.debounceTimeMs}
                onChange={(e) =>
                  onChange({ ...settings, debounceTimeMs: parseInt(e.target.value) })
                }
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
