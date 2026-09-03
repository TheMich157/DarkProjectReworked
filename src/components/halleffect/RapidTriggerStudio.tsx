import React, { useState, useEffect } from 'react';
import { HallEffectKeyConfig } from '../../core/protocol/types';
import { Target, Zap, Shield, Sparkles, Activity } from 'lucide-react';

interface RapidTriggerStudioProps {
  globalActuation: number;
  globalRapidTrigger: boolean;
  pressSensitivity: number;
  releaseSensitivity: number;
  socdEnabled: boolean;
  socdMode: 'LastInputPriority' | 'Neutral' | 'FirstInputPriority';
  onChangeGlobalActuation: (val: number) => void;
  onChangeRapidTrigger: (val: boolean) => void;
  onChangePressSensitivity: (val: number) => void;
  onChangeReleaseSensitivity: (val: number) => void;
  onChangeSocdEnabled: (val: boolean) => void;
  onChangeSocdMode: (mode: 'LastInputPriority' | 'Neutral' | 'FirstInputPriority') => void;
}

export const RapidTriggerStudio: React.FC<RapidTriggerStudioProps> = ({
  globalActuation,
  globalRapidTrigger,
  pressSensitivity,
  releaseSensitivity,
  socdEnabled,
  socdMode,
  onChangeGlobalActuation,
  onChangeRapidTrigger,
  onChangePressSensitivity,
  onChangeReleaseSensitivity,
  onChangeSocdEnabled,
  onChangeSocdMode
}) => {
  const [simulatedTravel, setSimulatedTravel] = useState(0.0); // 0.0 to 4.0mm
  const [isActuated, setIsActuated] = useState(false);
  const [activeSocdKey, setActiveSocdKey] = useState<'A' | 'D' | null>(null);

  // Live calculation of actuation status
  useEffect(() => {
    setIsActuated(simulatedTravel >= globalActuation);
  }, [simulatedTravel, globalActuation]);

  // Handle keyboard events for interactive testing of A/D counter-strafing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyA') setActiveSocdKey('A');
      if (e.code === 'KeyD') setActiveSocdKey('D');
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyA' && activeSocdKey === 'A') setActiveSocdKey(null);
      if (e.code === 'KeyD' && activeSocdKey === 'D') setActiveSocdKey(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeSocdKey]);

  return (
    <div className="he-studio-container">
      {/* Visual Switch Stem Actuation Gauge & Realtime Simulation */}
      <div className="actuation-visualizer-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Target size={18} color="var(--accent-pink)" />
              <span>Hall Effect Magnetic Switch Actuation</span>
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Continuous magnetic sensing with 0.02mm resolution and instant Rapid Trigger reset
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span className={`badge ${isActuated ? 'badge-emerald' : 'badge-purple'}`}>
              {isActuated ? '● SWITCH ACTUATED' : '○ RELEASED'}
            </span>
          </div>
        </div>

        {/* Interactive Stem & Travel Section */}
        <div className="switch-cross-section">
          <div className="stem-travel-gauge">
            {/* Travel Fill */}
            <div
              className="stem-travel-fill"
              style={{
                height: `${(simulatedTravel / 4.0) * 210}px`
              }}
            />

            {/* Actuation Point Line Marker */}
            <div
              className="actuation-marker-line"
              style={{
                top: `${(globalActuation / 4.0) * 210 + 4}px`
              }}
            >
              <div className="actuation-marker-label">
                {globalActuation.toFixed(2)} mm
              </div>
            </div>
          </div>

          {/* Test Travel Slider / Live Switch Tester */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Interactive Stem Travel Simulation
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700, color: 'var(--accent-pink)' }}>
                  {simulatedTravel.toFixed(2)} mm
                </span>
              </div>
              <input
                type="range"
                min="0.0"
                max="4.0"
                step="0.02"
                value={simulatedTravel}
                onChange={(e) => setSimulatedTravel(Number(e.target.value))}
              />
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              background: 'rgba(0, 0, 0, 0.3)',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>ACTUATION POINT</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                  {globalActuation.toFixed(2)} mm
                </div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>RAPID TRIGGER</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 700, color: globalRapidTrigger ? 'var(--accent-pink)' : 'var(--text-muted)' }}>
                  {globalRapidTrigger ? 'ENABLED' : 'DISABLED'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>RESET DISTANCE</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                  {releaseSensitivity.toFixed(2)} mm
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actuation & Rapid Trigger Sensitivity Tuning Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
        {/* Global Actuation Point */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={18} color="var(--accent-cyan)" />
              <h4 style={{ fontSize: '14px', fontWeight: 700 }}>Actuation Point Calibration</h4>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>
              {globalActuation.toFixed(2)} mm
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Custom depth for switch actuation (0.10mm ultra-fast to 4.00mm deep press)
          </p>
          <input
            type="range"
            min="0.1"
            max="4.0"
            step="0.02"
            value={globalActuation}
            onChange={(e) => onChangeGlobalActuation(Number(e.target.value))}
          />
        </div>

        {/* Rapid Trigger Master Switch & Sensitivities */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="var(--accent-pink)" />
              <h4 style={{ fontSize: '14px', fontWeight: 700 }}>Rapid Trigger Engine</h4>
            </div>
            <button
              onClick={() => onChangeRapidTrigger(!globalRapidTrigger)}
              className={`btn ${globalRapidTrigger ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 14px', fontSize: '12px' }}
            >
              {globalRapidTrigger ? 'Active' : 'Disabled'}
            </button>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Dynamically reset the key the moment you lift your finger by 0.02mm
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Press Sensitivity (Downstroke)</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-pink)' }}>{pressSensitivity.toFixed(2)} mm</span>
              </div>
              <input
                type="range"
                min="0.02"
                max="2.0"
                step="0.02"
                value={pressSensitivity}
                onChange={(e) => onChangePressSensitivity(Number(e.target.value))}
                disabled={!globalRapidTrigger}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Release Sensitivity (Upstroke Reset)</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)' }}>{releaseSensitivity.toFixed(2)} mm</span>
              </div>
              <input
                type="range"
                min="0.02"
                max="2.0"
                step="0.02"
                value={releaseSensitivity}
                onChange={(e) => onChangeReleaseSensitivity(Number(e.target.value))}
                disabled={!globalRapidTrigger}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Snap Tap / SOCD Counter-Strafing Engine */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} color="var(--accent-purple)" />
              <span>Snap Tap / SOCD Counter-Strafing Engine</span>
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Hardware Simultaneous Opposing Cardinal Direction resolution for instant Counter-Strike & Valorant stops
            </p>
          </div>
          <button
            onClick={() => onChangeSocdEnabled(!socdEnabled)}
            className={`btn ${socdEnabled ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 18px', fontSize: '13px' }}
          >
            {socdEnabled ? 'Snap Tap Enabled' : 'Snap Tap Disabled'}
          </button>
        </div>

        <div className="socd-matrix">
          {/* A-D Strafe Pair */}
          <div className={`socd-card ${socdEnabled ? 'active' : ''}`}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Strafe Key Pair: A ⇄ D
            </div>
            <div className="key-pair-display">
              <div className={`he-key-box ${activeSocdKey === 'A' ? 'active' : ''}`}>A</div>
              <span style={{ color: 'var(--text-muted)' }}>⇄</span>
              <div className={`he-key-box ${activeSocdKey === 'D' ? 'active' : ''}`}>D</div>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
              Press 'A' or 'D' on your keyboard to test real-time priority
            </div>
          </div>

          {/* SOCD Mode Selector */}
          <div className="socd-card">
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Priority Algorithm
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { id: 'LastInputPriority', label: 'Last Input Priority (Snap Tap / Rappy Snappy)' },
                { id: 'Neutral', label: 'Neutral (Both cancel out)' },
                { id: 'FirstInputPriority', label: 'First Input Priority' }
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => onChangeSocdMode(m.id as any)}
                  className={`btn ${socdMode === m.id ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '8px 12px', fontSize: '12px', textAlign: 'left', justifyContent: 'flex-start' }}
                  disabled={!socdEnabled}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
