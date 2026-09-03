import { DeviceDefinition, LightingConfig, KeyRemapEntry } from '../types';
import { IDeviceDriver, createReportBuffer } from './baseDriver';

export class WitmodDriver implements IDeviceDriver {
  constructor(public device: DeviceDefinition) {}

  encodeLighting(config: LightingConfig): Uint8Array[] {
    const buf = createReportBuffer(64, 0x07);
    buf[1] = 0x57; // 'W'
    buf[2] = 0x4D; // 'M'
    buf[3] = 0x01; // Cmd: RGB
    buf[4] = config.effect === 'static' ? 1 : config.effect === 'breathing' ? 2 : config.effect === 'wave' ? 3 : 4;
    buf[5] = config.speed;
    buf[6] = config.brightness;
    buf[7] = config.color.r;
    buf[8] = config.color.g;
    buf[9] = config.color.b;
    return [buf];
  }

  encodeKeyRemap(remaps: KeyRemapEntry[]): Uint8Array[] {
    const buf = createReportBuffer(64, 0x07);
    buf[1] = 0x57;
    buf[2] = 0x4D;
    buf[3] = 0x02; // Remap
    return [buf];
  }

  encodeDebounce(ms: number): Uint8Array[] {
    const buf = createReportBuffer(64, 0x07);
    buf[1] = 0x57;
    buf[2] = 0x4D;
    buf[3] = 0x03;
    buf[4] = ms;
    return [buf];
  }

  encodeProfileSwitch(profileIndex: number): Uint8Array[] {
    const buf = createReportBuffer(64, 0x07);
    buf[1] = 0x57;
    buf[2] = 0x4D;
    buf[3] = 0x04;
    buf[4] = profileIndex;
    return [buf];
  }
}
