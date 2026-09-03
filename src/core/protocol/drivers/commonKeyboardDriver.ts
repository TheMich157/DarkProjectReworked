import { DeviceDefinition, LightingConfig, KeyRemapEntry, RGBEffect } from '../types';
import { IDeviceDriver, createReportBuffer } from './baseDriver';

// GSKY MCU Effect IDs from decompiled web-lab runtime
const EFFECT_MAP: Record<RGBEffect, number> = {
  static: 0x01,
  breathing: 0x02,
  wave: 0x03,
  rainbow: 0x04,
  reactive: 0x05,
  ripple: 0x06,
  aurora: 0x07,
  sinewave: 0x08,
  spiral: 0x09,
  shoot: 0x0A,
  rain: 0x0B,
  off: 0x00
};

export class CommonKeyboardDriver implements IDeviceDriver {
  constructor(public device: DeviceDefinition) {}

  encodeLighting(config: LightingConfig): Uint8Array[] {
    const packets: Uint8Array[] = [];
    const buf = createReportBuffer(64, 0x04); // Report ID 0x04 for GSKY MCU

    const effectId = EFFECT_MAP[config.effect] ?? 0x01;

    buf[1] = 0xAA; // GSKY Magic Header
    buf[2] = 0x55;
    buf[3] = 0x01; // Cmd: Set Lighting
    buf[4] = effectId;
    buf[5] = Math.min(Math.max(config.speed, 1), 5); // Speed 1-5
    buf[6] = Math.min(Math.max(config.brightness, 0), 100); // Brightness 0-100%
    buf[7] = config.color.r;
    buf[8] = config.color.g;
    buf[9] = config.color.b;
    buf[10] = config.direction === 'right' ? 1 : config.direction === 'up' ? 2 : config.direction === 'down' ? 3 : 0;

    // Checksum byte at end
    let checksum = 0;
    for (let i = 1; i < 63; i++) {
      checksum = (checksum + buf[i]) & 0xFF;
    }
    buf[63] = checksum;

    packets.push(buf);

    // If custom matrix is present, send 64-byte chunks for per-key RGB
    if (config.customMatrix && config.customMatrix.length > 0) {
      const totalKeys = config.customMatrix.length;
      let keyOffset = 0;
      let chunkIndex = 0;

      while (keyOffset < totalKeys) {
        const matrixBuf = createReportBuffer(64, 0x04);
        matrixBuf[1] = 0xAA;
        matrixBuf[2] = 0x55;
        matrixBuf[3] = 0x02; // Cmd: Per-Key Matrix Data
        matrixBuf[4] = chunkIndex++;
        
        let bytePos = 5;
        while (bytePos <= 60 && keyOffset < totalKeys) {
          const col = config.customMatrix[keyOffset++];
          matrixBuf[bytePos++] = col.r;
          matrixBuf[bytePos++] = col.g;
          matrixBuf[bytePos++] = col.b;
        }

        let matrixChecksum = 0;
        for (let i = 1; i < 63; i++) {
          matrixChecksum = (matrixChecksum + matrixBuf[i]) & 0xFF;
        }
        matrixBuf[63] = matrixChecksum;
        packets.push(matrixBuf);
      }
    }

    return packets;
  }

  encodeKeyRemap(remaps: KeyRemapEntry[]): Uint8Array[] {
    const packets: Uint8Array[] = [];
    const buf = createReportBuffer(64, 0x04);

    buf[1] = 0xAA;
    buf[2] = 0x55;
    buf[3] = 0x10; // Cmd: Key Remap
    buf[4] = remaps.length;

    let byteIdx = 5;
    for (const entry of remaps.slice(0, 15)) {
      buf[byteIdx++] = entry.keyIndex & 0xFF;
      buf[byteIdx++] = entry.layer & 0x03;
      buf[byteIdx++] = entry.mappedType === 'disabled' ? 0 : 1;
    }

    let checksum = 0;
    for (let i = 1; i < 63; i++) {
      checksum = (checksum + buf[i]) & 0xFF;
    }
    buf[63] = checksum;

    packets.push(buf);
    return packets;
  }

  encodeDebounce(ms: number): Uint8Array[] {
    const buf = createReportBuffer(64, 0x04);
    buf[1] = 0xAA;
    buf[2] = 0x55;
    buf[3] = 0x20; // Cmd: Debounce Config
    buf[4] = Math.min(Math.max(ms, 0), 30); // 0-30ms debounce

    let checksum = 0;
    for (let i = 1; i < 63; i++) {
      checksum = (checksum + buf[i]) & 0xFF;
    }
    buf[63] = checksum;

    return [buf];
  }

  encodeProfileSwitch(profileIndex: number): Uint8Array[] {
    const buf = createReportBuffer(64, 0x04);
    buf[1] = 0xAA;
    buf[2] = 0x55;
    buf[3] = 0x05; // Cmd: Profile Switch
    buf[4] = profileIndex & 0x03;

    let checksum = 0;
    for (let i = 1; i < 63; i++) {
      checksum = (checksum + buf[i]) & 0xFF;
    }
    buf[63] = checksum;

    return [buf];
  }

  encodeBatteryQuery(): Uint8Array {
    const buf = createReportBuffer(64, 0x04);
    buf[1] = 0xAA;
    buf[2] = 0x55;
    buf[3] = 0x80; // Cmd: Query Battery
    return buf;
  }

  decodeBatteryResponse(data: Uint8Array): { level: number; isCharging: boolean } | null {
    if (data.length >= 6 && data[1] === 0xAA && data[2] === 0x55 && data[3] === 0x80) {
      return {
        level: Math.min(100, Math.max(0, data[4])),
        isCharging: Boolean(data[5] & 0x01)
      };
    }
    return null;
  }
}
