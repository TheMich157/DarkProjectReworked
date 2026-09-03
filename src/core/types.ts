export type DeviceType = 'keyboard' | 'mouse';

export type DeviceSeries =
  | 'CommonKeyboardSeries'
  | 'WitmodSeries'
  | 'SparkLinkSeries'
  | 'HFDKBSeries'
  | 'HFDKBRGBSeries'
  | 'TFTKeyboardSeries'
  | 'DponeSeries'
  | 'ModelOV2WiredSeries';

export interface DeviceDefinition {
  id: string;
  name: string;
  displayName: string;
  series: DeviceSeries;
  vendorId: number;
  productId: number;
  deviceType: DeviceType;
  sn: string;
  image?: string;
  layoutType?: 'ansi' | 'iso';
  keyCount?: number;
  sensor?: string;
  maxDpi?: number;
  maxPollingRate?: number;
  hasRgb: boolean;
  hasRapidTrigger?: boolean;
  hasSnapTap?: boolean;
  hasTftScreen?: boolean;
  hasBattery?: boolean;
  isWireless?: boolean;
  hardwareProfilesCount?: number;
}

export interface DpiStage {
  id: number;
  dpi: number;
  color: string;
  enabled: boolean;
}

export interface MouseButtonMapping {
  buttonIndex: number; // 1: Left, 2: Right, 3: Middle, 4: Back, 5: Forward, 6: DPI
  name: string;
  action: 'click' | 'menu' | 'middle' | 'back' | 'forward' | 'dpi_cycle' | 'key_combo' | 'fire_key' | 'macro';
  keyCombo?: string;
  macroId?: string;
}

export interface MouseSettings {
  dpiStages: DpiStage[];
  currentDpiIndex: number;
  pollingRate: 125 | 250 | 500 | 1000 | 2000 | 4000 | 8000;
  lod: '1mm' | '2mm';
  debounceTimeMs: number; // 0 - 20ms
  motionSync: boolean;
  angleSnapping: boolean;
  rippleControl: boolean;
  buttonMappings: Record<number, MouseButtonMapping>;
  rgb: {
    effect: 'static' | 'breathing' | 'neon' | 'wave' | 'off';
    brightness: number; // 0 - 100
    speed: number; // 1 - 10
    color: string;
    sleepTimeoutMin: number;
  };
  batteryLevel?: number;
  isCharging?: boolean;
}

export interface KeyMapEntry {
  code: string;
  label: string;
  mappedKey: string;
  fnMappedKey?: string;
  macroId?: string;
  actuationMm?: number;
}

export interface KeyboardProfile {
  id: number;
  name: string;
  rgb: {
    effect: 'wave' | 'breathing' | 'rainbow' | 'reactive' | 'ripple' | 'static' | 'aurora' | 'custom' | 'off';
    brightness: number; // 0 - 100
    speed: number; // 1 - 10
    primaryColor: string;
    secondaryColor?: string;
    perKeyColors: Record<string, string>; // keycode -> hex color
  };
  keyMappings: Record<string, KeyMapEntry>;
  debounceTimeMs: number; // 0 - 30ms
  pollingRate: 1000 | 8000;
  snapTap: {
    enabled: boolean;
    primaryPair: [string, string]; // e.g. ['KeyA', 'KeyD']
    secondaryPair: [string, string]; // e.g. ['KeyW', 'KeyS']
    mode: 'last_input_priority' | 'neutral';
  };
  actuation?: {
    globalActuationMm: number; // 0.1mm - 4.0mm
    rapidTriggerEnabled: boolean;
    rapidTriggerPressMm: number; // 0.02mm - 2.0mm
    rapidTriggerReleaseMm: number; // 0.02mm - 2.0mm
    perKeyActuation: Record<string, number>;
  };
  tftSettings?: {
    uploadedImageUrl?: string;
    displayMode: 'image' | 'clock' | 'system_info';
  };
}

export interface KeyboardSettings {
  profiles: Record<number, KeyboardProfile>;
  activeProfileIndex: number;
  activeLayer: 'base' | 'fn1' | 'fn2' | 'fn3';
  batteryLevel?: number;
  isWireless?: boolean;
}

export interface MacroEvent {
  id: string;
  type: 'keydown' | 'keyup' | 'delay';
  code?: string;
  keyLabel?: string;
  delayMs?: number;
}

export interface Macro {
  id: string;
  name: string;
  repeatMode: 'once' | 'while_pressed' | 'toggle' | 'count';
  repeatCount: number;
  events: MacroEvent[];
}
