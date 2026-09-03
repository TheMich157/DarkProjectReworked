import { DeviceDefinition, LightingConfig, KeyRemapEntry } from '../types';
import { IDeviceDriver, createReportBuffer } from './baseDriver';

export class HFDDriver implements IDeviceDriver {
  constructor(public device: DeviceDefinition) {}

  encodeLighting(config: LightingConfig): Uint8Array[] {
    const buf = createReportBuffer(64, 0x06);
    buf[1] = 0x04; // Sonix / HFD Header
    buf[2] = 0x01; // Cmd: RGB
    buf[3] = config.effect === 'static' ? 1 : config.effect === 'breathing' ? 2 : 3;
    buf[4] = config.speed;
    buf[5] = config.brightness;
    buf[6] = config.color.r;
    buf[7] = config.color.g;
    buf[8] = config.color.b;
    return [buf];
  }

  encodeKeyRemap(remaps: KeyRemapEntry[]): Uint8Array[] {
    const buf = createReportBuffer(64, 0x06);
    buf[1] = 0x04;
    buf[2] = 0x02; // Remap
    return [buf];
  }

  encodeDebounce(ms: number): Uint8Array[] {
    const buf = createReportBuffer(64, 0x06);
    buf[1] = 0x04;
    buf[2] = 0x03;
    buf[3] = ms;
    return [buf];
  }

  encodeProfileSwitch(profileIndex: number): Uint8Array[] {
    const buf = createReportBuffer(64, 0x06);
    buf[1] = 0x04;
    buf[2] = 0x04;
    buf[3] = profileIndex;
    return [buf];
  }
}

export class TFTDriver implements IDeviceDriver {
  constructor(public device: DeviceDefinition) {}

  encodeLighting(config: LightingConfig): Uint8Array[] {
    const buf = createReportBuffer(64, 0x08);
    buf[1] = 0x54; // 'T'
    buf[2] = 0x46; // 'F'
    buf[3] = 0x54; // 'T'
    buf[4] = 0x01; // Cmd: RGB
    buf[5] = config.speed;
    buf[6] = config.brightness;
    buf[7] = config.color.r;
    buf[8] = config.color.g;
    buf[9] = config.color.b;
    return [buf];
  }

  encodeKeyRemap(remaps: KeyRemapEntry[]): Uint8Array[] {
    const buf = createReportBuffer(64, 0x08);
    buf[1] = 0x54;
    buf[2] = 0x46;
    buf[3] = 0x54;
    buf[4] = 0x02;
    return [buf];
  }

  encodeDebounce(ms: number): Uint8Array[] {
    const buf = createReportBuffer(64, 0x08);
    buf[1] = 0x54;
    buf[2] = 0x46;
    buf[3] = 0x54;
    buf[4] = 0x03;
    buf[5] = ms;
    return [buf];
  }

  encodeProfileSwitch(profileIndex: number): Uint8Array[] {
    const buf = createReportBuffer(64, 0x08);
    buf[1] = 0x54;
    buf[2] = 0x46;
    buf[3] = 0x54;
    buf[4] = 0x04;
    buf[5] = profileIndex;
    return [buf];
  }

  encodeTFTClockSync(date = new Date()): Uint8Array[] {
    const buf = createReportBuffer(64, 0x08);
    buf[1] = 0x54;
    buf[2] = 0x46;
    buf[3] = 0x54;
    buf[4] = 0x50; // Cmd: Clock sync
    buf[5] = date.getFullYear() - 2000;
    buf[6] = date.getMonth() + 1;
    buf[7] = date.getDate();
    buf[8] = date.getHours();
    buf[9] = date.getMinutes();
    buf[10] = date.getSeconds();
    return [buf];
  }

  encodeTFTFrameChunk(chunkIndex: number, totalChunks: number, rgb565Data: Uint8Array): Uint8Array {
    const buf = createReportBuffer(64, 0x08);
    buf[1] = 0x54;
    buf[2] = 0x46;
    buf[3] = 0x54;
    buf[4] = 0x55; // Cmd: Display Frame Packet
    buf[5] = (chunkIndex >> 8) & 0xFF;
    buf[6] = chunkIndex & 0xFF;
    buf[7] = (totalChunks >> 8) & 0xFF;
    buf[8] = totalChunks & 0xFF;
    
    // Copy up to 52 payload bytes
    const copyLen = Math.min(52, rgb565Data.length);
    buf.set(rgb565Data.subarray(0, copyLen), 9);
    
    return buf;
  }
}
