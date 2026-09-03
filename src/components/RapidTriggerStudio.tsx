import React, { useState, useEffect } from 'react';
import { KeyboardProfile } from '../core/types';
import {
  Zap,
  Sliders,
  Crosshair,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

interface RapidTriggerStudioProps {
  profile: KeyboardProfile;
  onChange: (updatedProfile: KeyboardProfile) => void;
}

export const RapidTriggerStudio: React.FC<RapidTriggerStudioProps> = ({
  profile,
  onChange,
}) => {
  const actuation = profile.actuation || {
    globalActuationMm: 1.2,
    rapidTriggerEnabled: true,
    rapidTriggerPressMm: 0.08,
    rapidTriggerReleaseMm: 0.08,
    perKeyActuation: {},
  };

  const [testKeyTravel, setTestKeyTravel] = useState(0); // Simulated travel depth 0.0 - 4.0mm
  const [isSimulatingPress, setIsSimulatingPress] = useState(false);

  // Auto-simulate smooth press animation for testing
  useEffect(() => {
    let animationFrame: number;
    let direction = 1;
    let current = 0;

    const animate = () => {
      if (isSimulatingPress) {
        current += direction * 0.06;
        if (current >= 4.0) {
          current = 4.0;
          direction = -1;
        } else if (current <= 0) {
          current = 0;
          direction = 1;
        }
        setTestKeyTravel(current);
        animationFrame = requestAnimationFrame(animate);
      }
    };

    if (isSimulatingPress) {
      animationFrame = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(animationFrame);
  }, [isSimulatingPress]);

  const isActuated = testKeyTravel >= actuation.globalActuationMm;

  const handleUpdateGlobalActuation = (valMm: number) => {
    const updated = {
      ...profile,
      actuation: {
        ...actuation,
        globalActuationMm: Math.max(0.1, Math.min(4.0, valMm)),
      },
    };
    onChange(updated);
  };

  const handleUpdateRtPress = (valMm: number) => {
    const updated = {
      ...profile,
      actuation: {
        ...actuation,
        rapidTriggerPressMm: Math.max(0.02, Math.min(2.0, valMm)),
      },
    };
    onChange(updated);
  };

  const handleUpdateRtRelease = (valMm: number) => {
    const updated = {
      ...profile,
      actuation: {
        ...actuation,
        rapidTriggerReleaseMm: Math.max(0.02, Math.min(2.0, valMm)),
      },
    };
    onChange(updated);
  };

  const handleToggleSnapTap = (enabled: boolean) => {
    onChange({
      ...profile,
      snapTap: {
        ...profile.snapTap,
        enabled,
      },
    });
  };

  const handleSnapTapMode = (mode: 'last_input_priority' | 'neutral') => {
    onChange({
      ...profile,
      snapTap: {
        ...profile.snapTap,
        mode,
      },
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-6 px-6">
      {/* Top Banner: Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Actuation Depth
            </p>
            <p className="text-2xl font-mono font-bold text-cyan-400 mt-1">
              {actuation.globalActuationMm.toFixed(2)}{' '}
              <span className="text-xs text-slate-500">mm</span>
            </p>
          </div>
          <Zap className="w-7 h-7 text-cyan-400" />
        </div>

        <div className="glass-panel p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Rapid Trigger
            </p>
            <p className="text-2xl font-mono font-bold text-violet-400 mt-1">
              {actuation.rapidTriggerEnabled ? 'Enabled' : 'Disabled'}
            </p>
          </div>
          <Sparkles className="w-7 h-7 text-violet-400" />
        </div>

        <div className="glass-panel p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Snap Tap (SOCD)
            </p>
            <p className="text-2xl font-mono font-bold text-emerald-400 mt-1">
              {profile.snapTap.enabled ? 'Active (A/D & W/S)' : 'Disabled'}
            </p>
          </div>
          <Crosshair className="w-7 h-7 text-emerald-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Magnetic Actuation & Rapid Trigger (7 cols) */}
        <div className="lg:col-span-7 glass-panel p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <Zap className="w-5 h-5 text-cyan-400" />
              <h2 className="font-display font-bold text-base text-white">
                Hall Effect & Magnetic Switch Tuning
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              0.1mm - 4.0mm Range • 0.02mm RT Step
            </span>
          </div>

          {/* Actuation Point Slider */}
          <div className="p-4 rounded-xl bg-[#121520] border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">Global Actuation Point</p>
                <p className="text-xs text-slate-400">
                  Distance required to register key press
                </p>
              </div>
              <div className="flex items-center bg-[#0d0f18] px-3 py-1 rounded-lg border border-white/10">
                <span className="font-mono text-base font-bold text-cyan-300">
                  {actuation.globalActuationMm.toFixed(2)}
                </span>
                <span className="text-xs text-slate-500 ml-1.5 font-mono">mm</span>
              </div>
            </div>

            <input
              type="range"
              min={0.1}
              max={4.0}
              step={0.05}
              value={actuation.globalActuationMm}
              onChange={(e) => handleUpdateGlobalActuation(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500 px-1">
              <span>0.1 mm (Ultra-Fast)</span>
              <span>2.0 mm (Standard)</span>
              <span>4.0 mm (Deep)</span>
            </div>
          </div>

          {/* Rapid Trigger Section */}
          <div className="p-4 rounded-xl bg-[#121520] border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">Dynamic Rapid Trigger</p>
                <p className="text-xs text-slate-400">
                  Instant key reset on upward stroke & re-actuate on downward stroke
                </p>
              </div>
              <input
                type="checkbox"
                checked={actuation.rapidTriggerEnabled}
                onChange={(e) =>
                  onChange({
                    ...profile,
                    actuation: {
                      ...actuation,
                      rapidTriggerEnabled: e.target.checked,
                    },
                  })
                }
                className="w-5 h-5 accent-cyan-500 rounded cursor-pointer"
              />
            </div>

            {actuation.rapidTriggerEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/5">
                {/* Press Sensitivity */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">Press Sensitivity (Down)</span>
                    <span className="font-mono text-cyan-400 font-bold">
                      {actuation.rapidTriggerPressMm.toFixed(2)} mm
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.02}
                    max={2.0}
                    step={0.02}
                    value={actuation.rapidTriggerPressMm}
                    onChange={(e) => handleUpdateRtPress(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Release Sensitivity */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">Release Sensitivity (Up)</span>
                    <span className="font-mono text-violet-400 font-bold">
                      {actuation.rapidTriggerReleaseMm.toFixed(2)} mm
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.02}
                    max={2.0}
                    step={0.02}
                    value={actuation.rapidTriggerReleaseMm}
                    onChange={(e) => handleUpdateRtRelease(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Snap Tap / SOCD Counter-Strafing */}
          <div className="p-4 rounded-xl bg-[#121520] border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">Snap Tap (SOCD Counter-Strafe)</p>
                <p className="text-xs text-slate-400">
                  Prioritizes the latest key without letting go of the opposite key
                </p>
              </div>
              <input
                type="checkbox"
                checked={profile.snapTap.enabled}
                onChange={(e) => handleToggleSnapTap(e.target.checked)}
                className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
              />
            </div>

            {profile.snapTap.enabled && (
              <div className="space-y-3 pt-2 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSnapTapMode('last_input_priority')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                      profile.snapTap.mode === 'last_input_priority'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-md shadow-emerald-500/10'
                        : 'bg-white/5 text-slate-400 border-white/5 hover:text-white'
                    }`}
                  >
                    Last Input Priority (Counter-Strafe)
                  </button>
                  <button
                    onClick={() => handleSnapTapMode('neutral')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                      profile.snapTap.mode === 'neutral'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-md shadow-cyan-500/10'
                        : 'bg-white/5 text-slate-400 border-white/5 hover:text-white'
                    }`}
                  >
                    Neutral (Cancels Out)
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
                  <span>Pair 1: [A] + [D] (Strafe)</span>
                  <span>Pair 2: [W] + [S] (Forward/Back)</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Interactive Switch Cross-Section Visualizer (5 cols) */}
        <div className="lg:col-span-5 glass-panel p-6 space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Crosshair className="w-5 h-5 text-cyan-400" />
                <h3 className="font-display font-bold text-sm text-white">
                  Real-Time Switch Simulation
                </h3>
              </div>
              <button
                onClick={() => setIsSimulatingPress(!isSimulatingPress)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                  isSimulatingPress
                    ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30'
                    : 'bg-white/5 text-slate-300 hover:text-white'
                }`}
              >
                <RefreshCw className={`w-3 h-3 ${isSimulatingPress ? 'animate-spin' : ''}`} />
                <span>{isSimulatingPress ? 'Stop Motion' : 'Auto Press'}</span>
              </button>
            </div>

            {/* Travel Tube Visualizer */}
            <div className="mt-6 flex gap-6 items-center justify-center p-6 bg-[#0b0d14] rounded-2xl border border-white/10">
              {/* Vertical ruler & switch stem */}
              <div className="relative w-16 h-64 bg-[#151824] rounded-xl border border-white/10 overflow-hidden flex flex-col justify-between p-1">
                {/* Switch Stem */}
                <div
                  className={`w-full rounded-lg transition-all shadow-lg flex items-center justify-center ${
                    isActuated
                      ? 'bg-gradient-to-b from-cyan-400 to-blue-500 shadow-cyan-500/50'
                      : 'bg-gradient-to-b from-slate-600 to-slate-700'
                  }`}
                  style={{
                    height: '36px',
                    transform: `translateY(${Math.min(210, testKeyTravel * 52)}px)`,
                  }}
                >
                  <span className="text-[10px] font-mono font-bold text-white">
                    {testKeyTravel.toFixed(2)}mm
                  </span>
                </div>

                {/* Actuation Threshold Marker */}
                <div
                  className="absolute left-0 right-0 border-b-2 border-cyan-400 border-dashed pointer-events-none z-10"
                  style={{
                    top: `${actuation.globalActuationMm * 52 + 18}px`,
                  }}
                >
                  <span className="absolute right-1 -top-4 text-[9px] font-mono font-bold text-cyan-400 bg-black/80 px-1 rounded">
                    ACT: {actuation.globalActuationMm}mm
                  </span>
                </div>
              </div>

              {/* Status readout */}
              <div className="space-y-4">
                <div
                  className={`px-4 py-3 rounded-xl border text-center transition-all ${
                    isActuated
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-500/20'
                      : 'bg-white/5 border-white/10 text-slate-400'
                  }`}
                >
                  <p className="text-[10px] uppercase font-mono font-semibold">Switch State</p>
                  <p className="text-base font-display font-bold mt-0.5">
                    {isActuated ? 'ACTUATED (FIRED)' : 'RELEASED'}
                  </p>
                </div>

                {/* Manual Travel Slider */}
                <div className="space-y-1.5">
                  <p className="text-xs text-slate-400 font-medium">Manual Travel Depth</p>
                  <input
                    type="range"
                    min={0}
                    max={4.0}
                    step={0.05}
                    value={testKeyTravel}
                    onChange={(e) => {
                      setIsSimulatingPress(false);
                      setTestKeyTravel(parseFloat(e.target.value));
                    }}
                    className="w-36"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p className="text-xs text-cyan-200/90 leading-relaxed">
              Magnetic Hall Effect sensors measure switch depth continuously via magnetic flux,
              providing near-zero latency and instant counter-strafing in CS2, Valorant, and Apex Legends.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
