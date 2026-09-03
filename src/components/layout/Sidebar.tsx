import React from 'react';
import { DeviceDefinition } from '../../core/protocol/types';
import { 
  Sparkles, 
  Target, 
  Activity, 
  Tv, 
  Cpu, 
  Settings, 
  Layers
} from 'lucide-react';

export type ActiveTab = 'lighting' | 'sensor' | 'halleffect' | 'keyremap' | 'tft' | 'macros' | 'settings';

interface SidebarProps {
  currentDevice: DeviceDefinition;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentDevice,
  activeTab,
  onSelectTab
}) => {
  const isMouse = currentDevice.category === 'mouse' || currentDevice.category === 'dongle';
  const hasHallEffect = Boolean(currentDevice.hasHallEffect);
  const hasTFT = Boolean(currentDevice.hasTFTDisplay);
  const hasRGB = currentDevice.hasRGB !== false;

  const navItems = [
    {
      id: 'lighting' as ActiveTab,
      label: 'RGB Studio',
      icon: Sparkles,
      visible: hasRGB
    },
    {
      id: 'sensor' as ActiveTab,
      label: 'Sensor & 8K Polling',
      icon: Activity,
      visible: isMouse
    },
    {
      id: 'halleffect' as ActiveTab,
      label: 'Rapid Trigger & HE',
      icon: Target,
      visible: hasHallEffect
    },
    {
      id: 'keyremap' as ActiveTab,
      label: isMouse ? 'Button Mapping' : 'Key Mapping & Fn',
      icon: Layers,
      visible: true
    },
    {
      id: 'tft' as ActiveTab,
      label: 'TFT Screen & GIF',
      icon: Tv,
      visible: hasTFT
    },
    {
      id: 'macros' as ActiveTab,
      label: 'Macro Engine',
      icon: Cpu,
      visible: true
    },
    {
      id: 'settings' as ActiveTab,
      label: 'Device Settings',
      icon: Settings,
      visible: true
    }
  ];

  return (
    <aside style={{
      width: '240px',
      minWidth: '240px',
      display: 'flex',
      flexDirection: 'column',
      background: '#0a0d14',
      borderRight: '1px solid #1a2232',
      padding: '20px 12px',
      gap: '4px'
    }}>
      <div style={{
        padding: '0 10px 14px 10px',
        fontSize: '10px',
        fontWeight: 800,
        textTransform: 'uppercase',
        letterSpacing: '1.2px',
        color: '#64748b',
        fontFamily: 'var(--font-mono)'
      }}>
        CONFIGURATION
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {navItems.filter(item => item.visible).map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '6px',
                border: 'none',
                borderLeft: isActive ? '3px solid #00f0ff' : '3px solid transparent',
                background: isActive ? '#131a28' : 'transparent',
                color: isActive ? '#ffffff' : '#94a3b8',
                cursor: 'pointer',
                fontFamily: 'var(--font-main)',
                fontSize: '13px',
                fontWeight: isActive ? 700 : 500,
                textAlign: 'left',
                transition: 'all 0.12s ease'
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = '#0e1420';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent';
              }}
            >
              <Icon size={16} color={isActive ? '#00f0ff' : '#64748b'} />
              <span style={{ flex: 1 }}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Hardware Specs Footnote */}
      <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #1a2232' }}>
        <div style={{
          background: '#0d111a',
          padding: '10px 12px',
          borderRadius: '6px',
          border: '1px solid #1a2232',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px' }}>
            MCU PROTOCOL DRIVER
          </div>
          <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#00f0ff', fontWeight: 700 }}>
            {currentDevice.routerID}
          </div>
          <div style={{ fontSize: '10px', color: '#64748b', fontFamily: 'var(--font-mono)', display: 'flex', justifyContent: 'space-between' }}>
            <span>VID {currentDevice.StateList[0]?.vid}</span>
            <span>PID {currentDevice.StateList[0]?.pid}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
