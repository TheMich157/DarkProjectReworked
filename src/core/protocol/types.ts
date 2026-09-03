// Dark Project Peripheral Protocol Types

export type DeviceCategory = 'keyboard' | 'mouse' | 'dongle';

export type RouterID = 
  | 'CommonKeyboardSeries'
  | 'WitmodSeries'
  | 'SparkLinkSeries'
  | 'HFDKBSeries'
  | 'HFDKBRGBSeries'
  | 'TFTKeyboardSeries'
  | 'DponeSeries'
  | 'DarkProjectMouseSeries';

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'simulated';

export type ConnectionType = 'USB' | 'Dongle' | 'Bluetooth' | 'Simulated';

export interface DeviceVIDPID {
  vid: string; // e.g. "0x342D"
  pid: string; // e.g. "0xE40F"
  StateType: ConnectionType;
}

export interface UsageFilter {
  usagepage: string; // e.g. "0xff01"
  usage: string;     // e.g. "0x01"
  StateType?: ConnectionType;
}

export interface DeviceDefinition {
  id: string;
  devicename: string;
  displayName: string;
  category: DeviceCategory;
  routerID: RouterID;
  dongleRouterID?: string;
  StateList: DeviceVIDPID[];
  FWUpdateExtension?: string[];
  SN?: string;
  img: string;
  battery: boolean;
  layoutType: '87-ANSI' | '87-ISO' | '83-ANSI' | '83-ISO' | '98-ANSI' | '98-ISO' | '68-ANSI' | '60-ANSI' | 'Mouse-6B';
  keyCount?: number;
  hasHallEffect?: boolean;
  hasTFTDisplay?: boolean;
  hasRotaryKnob?: boolean;
  hasRGB?: boolean;
  maxPollingRate?: number; // up to 8000Hz
  maxDPI?: number;         // up to 26000 DPI
  deviceInfo: {
    RedirectWebFlag?: boolean;
    RedirectWebUrl?: string;
    FnNums?: number;
    MacroRepeattype?: number;
    Actuation?: boolean;
    ActuationData?: {
      UpstrokeMin: number;
      UpstrokeMax: number;
      DownstrokeMin: number;
      DownstrokeMax: number;
      UpstrokeStep: number;
      DownstrokeStep: number;
    };
    AdvancedKey?: boolean;
    HardwareProfileNum?: number;
    MacroMaxRepeatNumber?: number;
    DPIMaxStage?: number;
    DPIMaxNumber?: number;
  };
}

export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export type RGBEffect = 
  | 'static'
  | 'breathing'
  | 'wave'
  | 'rainbow'
  | 'reactive'
  | 'ripple'
  | 'aurora'
  | 'sinewave'
  | 'spiral'
  | 'shoot'
  | 'rain'
  | 'off';

export interface LightingConfig {
  effect: RGBEffect;
  speed: number;       // 1-5
  brightness: number;  // 0-100%
  color: RGBColor;
  customMatrix?: RGBColor[]; // Per-key RGB
  direction?: 'left' | 'right' | 'up' | 'down';
}

export interface KeyRemapEntry {
  keyIndex: number;
  code: string;       // Original key code e.g. "KeyQ"
  mappedType: 'default' | 'keyboard' | 'mouse' | 'multimedia' | 'macro' | 'disabled';
  mappedValue: string; // e.g. "KeyE", "MouseLeft", "VolumeUp", "Macro_1"
  layer: number;      // 0 = Base, 1 = Fn1, 2 = Fn2, 3 = Fn3
}

export interface HallEffectKeyConfig {
  keyIndex: number;
  code: string;
  actuationPoint: number;    // 0.1mm - 4.0mm (default 2.0mm)
  rapidTriggerEnabled: boolean;
  pressSensitivity: number;  // 0.02mm - 2.0mm
  releaseSensitivity: number;// 0.02mm - 2.0mm
  bottomDeadzone: number;    // 0.0mm - 0.5mm
  topDeadzone: number;       // 0.0mm - 0.5mm
  socdGroup?: 'A-D' | 'W-S' | 'Custom1' | 'None';
  socdMode?: 'LastInputPriority' | 'Neutral' | 'FirstInputPriority';
}

export interface DPISlot {
  dpi: number;
  color: RGBColor;
  enabled: boolean;
}

export interface MouseSensorConfig {
  currentDpiIndex: number;
  dpiStages: DPISlot[];
  pollingRate: 125 | 250 | 500 | 1000 | 2000 | 4000 | 8000;
  lodDistance: '1mm' | '2mm'; // Lift-off distance
  motionSync: boolean;
  angleSnapping: boolean;     // StraightLine
  rippleControl: boolean;
  debounceMs: number;         // 0 - 20ms
  batteryLevel?: number;      // 0 - 100%
  isCharging?: boolean;
}

export interface MacroAction {
  id: string;
  type: 'keydown' | 'keyup' | 'delay' | 'mousedown' | 'mouseup' | 'wheel';
  code?: string;
  delayMs?: number;
  button?: number;
}

export interface Macro {
  id: string;
  name: string;
  repeatMode: 'once' | 'repeat_while_pressed' | 'toggle';
  repeatCount?: number;
  actions: MacroAction[];
}

export interface DeviceProfile {
  id: string;
  name: string;
  lighting: LightingConfig;
  keyRemaps: KeyRemapEntry[];
  hallEffect?: {
    globalActuationPoint: number;
    globalRapidTrigger: boolean;
    keys: Record<string, HallEffectKeyConfig>;
  };
  mouseSensor?: MouseSensorConfig;
  debounceMs: number;
  sleepTimeoutMin: number;
}
