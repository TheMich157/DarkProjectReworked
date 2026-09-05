import React from 'react';
import { DeviceDefinition, ConnectionState, ConnectionType } from '../../core/protocol/types';
import { 
  Keyboard, 
  Mouse, 
  Battery, 
  BatteryCharging, 
  Usb, 
  Wifi, 
  Bluetooth,
  ChevronDown,
  Sliders,
  Radio
} from 'lucide-react';

interface HeaderProps {
  currentDevice: DeviceDefinition;
  connectionState: ConnectionState;
  connectionType: ConnectionType;
  isSimulated: boolean;
  batteryLevel?: number;
  isCharging?: boolean;
  activeProfile: number;
  onSelectProfile: (index: number) => void;
  onOpenDevicePicker: () => void;
  onConnectUsb: () => void;
  onConnectDongle: () => void;
  onConnectBluetooth: () => void;
  onToggleSimulator: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDevice,
  connectionState,
  connectionType,
  isSimulated,
  batteryLevel = 92,
  isCharging = false,
  activeProfile,
  onSelectProfile,
  onOpenDevicePicker,
  onConnectUsb,
  onConnectDongle,
  onConnectBluetooth,
  onToggleSimulator
}) => {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 24px',
      background: '#0a0d14',
      borderBottom: '1px solid #1a2232',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
    }}>
      {/* Left: Brand & Active Device Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            background: '#00f0ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 12px rgba(0, 240, 255, 0.4)'
          }}>
            <span style={{ color: '#05070a', fontWeight: 900, fontSize: '15px', fontFamily: 'var(--font-mono)' }}>DP</span>
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '0.8px', color: '#ffffff', lineHeight: 1 }}>
              DARK PROJECT <span style={{ color: '#00f0ff', fontSize: '11px', fontWeight: 600 }}>STUDIO</span>
            </div>
            <div style={{ fontSize: '10px', color: '#64748b', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
              v2.0.4 • HARDWARE CONTROLLER
            </div>
          </div>
        </div>

        <div style={{ width: '1px', height: '24px', background: '#1e2638' }} />

        {/* Selected Device Menu Button */}
        <button 
          onClick={onOpenDevicePicker}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '7px 14px',
            background: '#121722',
            border: '1px solid #222c3e',
            borderRadius: '6px',
            color: '#ffffff',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          {currentDevice.category === 'mouse' ? (
            <Mouse size={16} color="#00f0ff" />
          ) : (
            <Keyboard size={16} color="#00f0ff" />
          )}
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9' }}>
              {currentDevice.displayName}
            </div>
            <div style={{ fontSize: '10px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
              {currentDevice.layoutType} • {currentDevice.routerID}
            </div>
          </div>
          <ChevronDown size={14} color="#64748b" style={{ marginLeft: '4px' }} />
        </button>
      </div>

      {/* Center: Hardware Profile Switcher */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        background: '#0d111a',
        padding: '3px',
        borderRadius: '6px',
        border: '1px solid #1a2232'
      }}>
        <div style={{ padding: '0 8px', fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Profile
        </div>
        {[1, 2, 3, 4].map((p, idx) => (
          <button
            key={p}
            onClick={() => onSelectProfile(idx)}
            style={{
              padding: '4px 12px',
              fontSize: '12px',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              borderRadius: '4px',
              border: 'none',
              background: activeProfile === idx ? '#00f0ff' : 'transparent',
              color: activeProfile === idx ? '#05070a' : '#94a3b8',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            P{p}
          </button>
        ))}
      </div>

      {/* Right: Connection State & Mode Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Battery Level */}
        {currentDevice.battery && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            color: isCharging ? '#10b981' : '#cbd5e1',
            background: '#121722',
            padding: '5px 10px',
            borderRadius: '4px',
            border: '1px solid #1e2638'
          }}>
            {isCharging ? <BatteryCharging size={15} color="#10b981" /> : <Battery size={15} color="#94a3b8" />}
            <span>{batteryLevel}%</span>
          </div>
        )}

        {/* Live Active Status LED */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '5px 12px',
          background: isSimulated ? 'rgba(245, 158, 11, 0.12)' : 'rgba(16, 185, 129, 0.12)',
          border: isSimulated ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '6px',
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          fontWeight: 700
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: isSimulated ? '#f59e0b' : '#10b981',
            boxShadow: `0 0 8px ${isSimulated ? '#f59e0b' : '#10b981'}`
          }} />
          <span style={{ color: isSimulated ? '#fcd34d' : '#6ee7b7', letterSpacing: '0.3px' }}>
            {isSimulated ? 'NO DEVICE CONNECTED' : `${connectionType.toUpperCase()} CONNECTED`}
          </span>
        </div>

        {/* Mode Selector Buttons */}
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={onConnectUsb}
            title="Connect via Direct USB Cable"
            style={{
              padding: '6px 10px',
              background: connectionType === 'USB' && !isSimulated ? '#162032' : '#0d111a',
              border: connectionType === 'USB' && !isSimulated ? '1px solid #00f0ff' : '1px solid #1e2638',
              borderRadius: '4px',
              color: connectionType === 'USB' && !isSimulated ? '#00f0ff' : '#94a3b8',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Usb size={13} />
            <span>USB</span>
          </button>

          <button
            onClick={onConnectDongle}
            title="Pair via 2.4GHz Wireless Dongle"
            style={{
              padding: '6px 10px',
              background: connectionType === 'Dongle' && !isSimulated ? '#162032' : '#0d111a',
              border: connectionType === 'Dongle' && !isSimulated ? '1px solid #10b981' : '1px solid #1e2638',
              borderRadius: '4px',
              color: connectionType === 'Dongle' && !isSimulated ? '#10b981' : '#94a3b8',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Wifi size={13} />
            <span>2.4G</span>
          </button>

          <button
            onClick={onConnectBluetooth}
            title="Pair via Bluetooth BLE"
            style={{
              padding: '6px 10px',
              background: connectionType === 'Bluetooth' && !isSimulated ? '#162032' : '#0d111a',
              border: connectionType === 'Bluetooth' && !isSimulated ? '1px solid #a855f7' : '1px solid #1e2638',
              borderRadius: '4px',
              color: connectionType === 'Bluetooth' && !isSimulated ? '#a855f7' : '#94a3b8',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Bluetooth size={13} />
            <span>BT</span>
          </button>
        </div>
      </div>
    </header>
  );
};
