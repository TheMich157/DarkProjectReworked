import React, { useState } from 'react';
import { DeviceDefinition } from '../../core/protocol/types';
import { Settings, RefreshCw, RotateCcw, Download, Upload, Shield, Moon, Zap, Check } from 'lucide-react';

interface DeviceSettingsProps {
  device: DeviceDefinition;
  debounceMs: number;
  sleepTimeoutMin: number;
  onChangeDebounce: (ms: number) => void;
  onChangeSleepTimeout: (min: number) => void;
  onFactoryReset: () => void;
  onExportProfile: () => void;
}

export const DeviceSettings: React.FC<DeviceSettingsProps> = ({
  device,
  debounceMs,
  sleepTimeoutMin,
  onChangeDebounce,
  onChangeSleepTimeout,
  onFactoryReset,
  onExportProfile
}) => {
  const [resetConfirmed, setResetConfirmed] = useState(false);

  const handleReset = () => {
    if (!resetConfirmed) {
      setResetConfirmed(true);
      setTimeout(() => setResetConfirmed(false), 4000);
      return;
    }
    onFactoryReset();
    setResetConfirmed(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Device Info Card */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Settings size={18} color="var(--accent-cyan)" />
          <span>Device Architecture & Firmware</span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          <div className="glass-card" style={{ padding: '14px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>DEVICE MODEL</div>
            <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '4px' }}>{device.displayName}</div>
          </div>
          <div className="glass-card" style={{ padding: '14px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>PROTOCOL ROUTER</div>
            <div style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)', marginTop: '4px' }}>
              {device.routerID}
            </div>
          </div>
          <div className="glass-card" style={{ padding: '14px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>HARDWARE REVISION</div>
            <div style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-emerald)', marginTop: '4px' }}>
              v1.0.4 (Latest)
            </div>
          </div>
          <div className="glass-card" style={{ padding: '14px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>SERIAL NUMBER (SN)</div>
            <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {device.SN || 'DP-HW-2026-X88'}
            </div>
          </div>
        </div>
      </div>

      {/* Hardware Timers: Debounce & Sleep */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
        {/* Debounce */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={18} color="var(--accent-cyan)" />
              <h4 style={{ fontSize: '14px', fontWeight: 700 }}>Debounce Delay Filter</h4>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>
              {debounceMs} ms
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Protects mechanical & optical switches from chatter and unwanted double strokes
          </p>
          <input
            type="range"
            min="0"
            max="30"
            value={debounceMs}
            onChange={(e) => onChangeDebounce(Number(e.target.value))}
          />
        </div>

        {/* Wireless Sleep Timeout */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Moon size={18} color="var(--accent-purple)" />
              <h4 style={{ fontSize: '14px', fontWeight: 700 }}>Wireless Sleep Timeout</h4>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-purple)' }}>
              {sleepTimeoutMin === 0 ? 'Never' : `${sleepTimeoutMin} min`}
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Idle duration before the device enters ultra-low power standby mode
          </p>
          <input
            type="range"
            min="0"
            max="30"
            step="5"
            value={sleepTimeoutMin}
            onChange={(e) => onChangeSleepTimeout(Number(e.target.value))}
          />
        </div>
      </div>

      {/* Backup & Factory Reset */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>
          Profile Backup & Hardware Reset
        </h4>

        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary"
            onClick={onExportProfile}
            style={{ padding: '10px 18px' }}
          >
            <Download size={16} />
            <span>Export Configuration JSON</span>
          </button>

          <button
            className="btn btn-danger"
            onClick={handleReset}
            style={{ padding: '10px 18px' }}
          >
            <RotateCcw size={16} />
            <span>{resetConfirmed ? 'Click Again to Confirm Reset!' : 'Factory Reset Onboard Memory'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
