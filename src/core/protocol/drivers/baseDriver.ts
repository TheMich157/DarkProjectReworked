import { DeviceDefinition, DeviceProfile, LightingConfig, KeyRemapEntry, RGBColor } from '../types';

export interface IDeviceDriver {
  device: DeviceDefinition;
  encodeLighting(config: LightingConfig): Uint8Array[];
  encodeKeyRemap(remaps: KeyRemapEntry[]): Uint8Array[];
  encodeDebounce(ms: number): Uint8Array[];
  encodeProfileSwitch(profileIndex: number): Uint8Array[];
  encodeBatteryQuery?(): Uint8Array;
  decodeBatteryResponse?(data: Uint8Array): { level: number; isCharging: boolean } | null;
}

export function createReportBuffer(size = 64, reportId = 0): Uint8Array {
  const buf = new Uint8Array(size);
  if (reportId > 0) {
    buf[0] = reportId;
  }
  return buf;
}

export function hexToRgb(hex: string): RGBColor {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

export function rgbToHex(rgb: RGBColor): string {
  const r = rgb.r.toString(16).padStart(2, '0');
  const g = rgb.g.toString(16).padStart(2, '0');
  const b = rgb.b.toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}
