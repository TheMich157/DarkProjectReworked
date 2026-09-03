import React from 'react';
import { DeviceDefinition } from '../core/types';
import { DARKPROJECT_DEVICES } from '../core/devices';
import { ConnectionState } from '../core/hidManager';
import {
  Keyboard,
  Mouse,
  Usb,
  BatteryCharging,
  Battery,
  Layers,
  Sparkles,
  RefreshCw,
  Cpu,
} from 'lucide-react';

interface HeaderProps {
  currentDevice: DeviceDefinition;
  onSelectDevice: (device: DeviceDefinition) => void;
  connectionState: ConnectionState;
  onConnectHardware: () => void;
  batteryLevel?: number;
  isCharging?: boolean;
  activeProfileIndex: number;
  onSelectProfile: (index: number) => void;
  onSaveToDevice: () => void;
  isSaving: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentDevice,
  onSelectDevice,
  connectionState,
  onConnectHardware,
  batteryLevel = 90,
  isCharging = false,
  activeProfileIndex,
  onSelectProfile,
  onSaveToDevice,
  isSaving,
}) => {
  return (
    <header className="border-b border-white/10 bg-[#0b0d14]/90 backdrop-blur-md sticky top-0 z-50 px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-violet-600 p-[1px] shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-[#0d0f18] rounded-[11px] flex items-center justify-center">
              <span className="font-display font-black text-xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                DP
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-lg text-white tracking-wide">
                DARK PROJECT
              </h1>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                STUDIO v2.0
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Universal Peripheral Suite • macOS & Windows
            </p>
          </div>
        </div>

        {/* Device Selector & Hardware Connect */}
        <div className="flex items-center gap-3">
          {/* Device Dropdown */}
          <div className="relative">
            <select
              value={currentDevice.id}
              onChange={(e) => {
                const dev = DARKPROJECT_DEVICES.find((d) => d.id === e.target.value);
                if (dev) onSelectDevice(dev);
              }}
              className="bg-[#151824] hover:bg-[#1a1e2e] text-slate-200 border border-white/10 rounded-xl px-3.5 py-2 text-sm font-medium focus:outline-none focus:border-cyan-500 transition-all cursor-pointer appearance-none pr-9"
            >
              <optgroup label="Gaming Mice">
                {DARKPROJECT_DEVICES.filter((d) => d.deviceType === 'mouse').map((d) => (
                  <option key={d.id} value={d.id}>
                    🐭 {d.displayName}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Magnetic / Rapid Trigger Keyboards">
                {DARKPROJECT_DEVICES.filter((d) => d.hasRapidTrigger).map((d) => (
                  <option key={d.id} value={d.id}>
                    ⚡ {d.displayName}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Mechanical & TFT Keyboards">
                {DARKPROJECT_DEVICES.filter(
                  (d) => d.deviceType === 'keyboard' && !d.hasRapidTrigger
                ).map((d) => (
                  <option key={d.id} value={d.id}>
                    ⌨️ {d.displayName}
                  </option>
                ))}
              </optgroup>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
              ▼
            </div>
          </div>

          {/* Connection Status Button */}
          <button
            onClick={onConnectHardware}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              connectionState === 'connected'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 shadow-lg shadow-emerald-500/10'
                : connectionState === 'simulated'
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
            }`}
            title="Click to scan and connect USB/Bluetooth hardware via WebHID"
          >
            {connectionState === 'connected' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <Usb className="w-3.5 h-3.5" />
                <span>USB Connected</span>
              </>
            ) : connectionState === 'simulated' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <Cpu className="w-3.5 h-3.5" />
                <span>Simulated Mode</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Connecting...</span>
              </>
            )}
          </button>

          {/* Battery Status (if supported) */}
          {currentDevice.hasBattery && (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#151824] border border-white/10 text-xs text-slate-300 font-mono">
              {isCharging ? (
                <BatteryCharging className="w-4 h-4 text-emerald-400 animate-pulse" />
              ) : (
                <Battery className="w-4 h-4 text-cyan-400" />
              )}
              <span>{batteryLevel}%</span>
            </div>
          )}
        </div>

        {/* Profile Tabs & Sync Button */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-[#151824] p-1 rounded-xl border border-white/10">
            {[1, 2, 3, 4].map((profileId) => (
              <button
                key={profileId}
                onClick={() => onSelectProfile(profileId)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeProfileIndex === profileId
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                P{profileId}
              </button>
            ))}
          </div>

          <button
            onClick={onSaveToDevice}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>{isSaving ? 'Syncing...' : 'Sync to Device'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
