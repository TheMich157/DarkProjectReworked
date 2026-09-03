import React from 'react';
import { MouseSensorConfig, DPISlot } from '../../core/protocol/types';
import { rgbToHex, hexToRgb } from '../../core/protocol/drivers/baseDriver';
import { Activity, Gauge, Zap, Compass, Move, ShieldCheck, Check } from 'lucide-react';

interface SensorStudioProps {
  config: MouseSensorConfig;
  maxDpi?: number;
  maxPollingRate?: number;
  onChange: (newConfig: MouseSensorConfig) => void;
}

export const SensorStudio: React.FC<SensorStudioProps> = ({
  config,
  maxDpi = 26000,
  maxPollingRate = 8000,
  onChange
}) => {
  const POLLING_RATES = [125, 250, 500, 1000, 2000, 4000, 8000].filter(
    r => r <= maxPollingRate
  );

  const handleDpiChange = (stageIdx: number, newDpi: number) => {
    const updatedStages = [...config.dpiStages];
    updatedStages[stageIdx] = {
      ...updatedStages[stageIdx],
      dpi: Math.round(newDpi / 50) * 50
    };
    onChange({
      ...config,
      dpiStages: updatedStages
    });
  };

  const handleColorChange = (stageIdx: number, hexColor: string) => {
    const updatedStages = [...config.dpiStages];
    updatedStages[stageIdx] = {
      ...updatedStages[stageIdx],
      color: hexToRgb(hexColor)
    };
    onChange({
      ...config,
      dpiStages: updatedStages
    });
  };

  const handleSelectStage = (idx: number) => {
    onChange({
      ...config,
      currentDpiIndex: idx
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* DPI Stages Card */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Gauge size={18} color="var(--accent-cyan)" />
              <span>DPI Sensitivity Stages</span>
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Configure up to 6 custom DPI stages (50 - {maxDpi.toLocaleString()} DPI in 50 DPI steps)
            </p>
          </div>
          <span className="badge badge-cyan">PixArt PAW3395</span>
        </div>

        {/* DPI Stage Cards Grid */}
        <div className="dpi-stages-container">
          {config.dpiStages.map((stage, idx) => {
            const isActive = config.currentDpiIndex === idx;
            const hexColor = rgbToHex(stage.color);
            return (
              <div
                key={idx}
                className={`dpi-stage-card ${isActive ? 'active' : ''}`}
                onClick={() => handleSelectStage(idx)}
              >
                <div className="dpi-stage-header">
                  <span>Stage {idx + 1}</span>
                  <input
                    type="color"
                    value={hexColor}
                    onChange={(e) => handleColorChange(idx, e.target.value)}
                    style={{
                      width: '18px',
                      height: '18px',
                      border: 'none',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      background: 'transparent'
                    }}
                    title="Change stage LED color"
                  />
                </div>

                <div className="dpi-value" style={{ color: isActive ? 'var(--accent-cyan)' : undefined }}>
                  {stage.dpi}
                </div>

                <input
                  type="range"
                  min="50"
                  max={maxDpi}
                  step="50"
                  value={stage.dpi}
                  onChange={(e) => handleDpiChange(idx, Number(e.target.value))}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* High-Performance Polling Rate Selector */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} color="var(--accent-cyan)" />
              <span>Report Rate / Polling Rate (Hz)</span>
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Higher polling rates minimize input latency (8000Hz = 0.125ms response time)
            </p>
          </div>
          {config.pollingRate >= 4000 && (
            <span className="badge badge-purple">Ultra High 8K Ready</span>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${POLLING_RATES.length}, 1fr)`, gap: '10px' }}>
          {POLLING_RATES.map(rate => {
            const isCurrent = config.pollingRate === rate;
            const latencyMs = (1000 / rate).toFixed(3);
            return (
              <button
                key={rate}
                onClick={() => onChange({ ...config, pollingRate: rate as any })}
                className="glass-card"
                style={{
                  padding: '16px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  border: isCurrent ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                  background: isCurrent ? 'var(--bg-surface-active)' : undefined,
                  boxShadow: isCurrent ? '0 0 16px var(--accent-cyan-glow)' : 'none'
                }}
              >
                <span style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: isCurrent ? 'var(--accent-cyan)' : '#fff' }}>
                  {rate}Hz
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {latencyMs}ms
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Advanced Sensor Optimization Settings */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
        {/* Lift-Off Distance (LOD) */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Move size={18} color="var(--accent-cyan)" />
            <h4 style={{ fontSize: '14px', fontWeight: 700 }}>Lift-Off Distance (LOD)</h4>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Height at which sensor stops tracking when lifting the mouse
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            {(['1mm', '2mm'] as const).map(lod => (
              <button
                key={lod}
                onClick={() => onChange({ ...config, lodDistance: lod })}
                className={`btn ${config.lodDistance === lod ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, padding: '10px' }}
              >
                {lod === '1mm' ? '1.0 mm (Low / Competitive)' : '2.0 mm (Standard)'}
              </button>
            ))}
          </div>
        </div>

        {/* Debounce Time */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={18} color="var(--accent-cyan)" />
              <h4 style={{ fontSize: '14px', fontWeight: 700 }}>Click Debounce Time</h4>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>
              {config.debounceMs} ms
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            Filter switch chatter and double-clicking (0ms for optical/instant response)
          </p>
          <input
            type="range"
            min="0"
            max="20"
            value={config.debounceMs}
            onChange={(e) => onChange({ ...config, debounceMs: Number(e.target.value) })}
          />
        </div>

        {/* MotionSync Toggle */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <ShieldCheck size={18} color="var(--accent-emerald)" />
              <h4 style={{ fontSize: '14px', fontWeight: 700 }}>MotionSync</h4>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Synchronizes sensor data frames precisely with USB polling intervals
            </p>
          </div>
          <button
            onClick={() => onChange({ ...config, motionSync: !config.motionSync })}
            className={`btn ${config.motionSync ? 'btn-primary' : 'btn-secondary'}`}
            style={{ minWidth: '80px' }}
          >
            {config.motionSync ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        {/* Angle Snapping (StraightLine) */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Compass size={18} color="var(--accent-purple)" />
              <h4 style={{ fontSize: '14px', fontWeight: 700 }}>Angle Snapping (StraightLine)</h4>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Corrects minor vertical jitter when drawing straight horizontal lines
            </p>
          </div>
          <button
            onClick={() => onChange({ ...config, angleSnapping: !config.angleSnapping })}
            className={`btn ${config.angleSnapping ? 'btn-primary' : 'btn-secondary'}`}
            style={{ minWidth: '80px' }}
          >
            {config.angleSnapping ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      </div>
    </div>
  );
};
