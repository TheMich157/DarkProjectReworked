import React from 'react';
import { DeviceDefinition } from '../core/types';
import {
  Gauge,
  Zap,
  Palette,
  Keyboard,
  MousePointer,
  Timer,
  Tv,
  Settings,
} from 'lucide-react';

export type TabId =
  | 'sensor'
  | 'rapid_trigger'
  | 'remap'
  | 'rgb'
  | 'macro'
  | 'tft';

interface NavigationProps {
  currentDevice: DeviceDefinition;
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentDevice,
  activeTab,
  onSelectTab,
}) => {
  const isMouse = currentDevice.deviceType === 'mouse';
  const hasRapidTrigger = !!currentDevice.hasRapidTrigger;
  const hasTft = !!currentDevice.hasTftScreen;

  const tabs: Array<{ id: TabId; label: string; icon: React.ReactNode; show: boolean }> = [
    {
      id: 'sensor',
      label: 'Sensor & Performance',
      icon: <Gauge className="w-4 h-4" />,
      show: isMouse,
    },
    {
      id: 'rapid_trigger',
      label: 'Rapid Trigger (HE)',
      icon: <Zap className="w-4 h-4" />,
      show: !isMouse && hasRapidTrigger,
    },
    {
      id: 'remap',
      label: isMouse ? 'Button Mapping' : 'Key Remap & Snap Tap',
      icon: isMouse ? <MousePointer className="w-4 h-4" /> : <Keyboard className="w-4 h-4" />,
      show: true,
    },
    {
      id: 'rgb',
      label: 'RGB Studio',
      icon: <Palette className="w-4 h-4" />,
      show: true,
    },
    {
      id: 'macro',
      label: 'Macro Studio',
      icon: <Timer className="w-4 h-4" />,
      show: true,
    },
    {
      id: 'tft',
      label: 'TFT Screen',
      icon: <Tv className="w-4 h-4" />,
      show: !isMouse && hasTft,
    },
  ];

  return (
    <nav className="flex items-center gap-2 overflow-x-auto py-3 px-6 max-w-7xl mx-auto border-b border-white/5">
      {tabs
        .filter((t) => t.show)
        .map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              <span className={isActive ? 'text-cyan-400' : 'text-slate-400'}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
            </button>
          );
        })}
    </nav>
  );
};
