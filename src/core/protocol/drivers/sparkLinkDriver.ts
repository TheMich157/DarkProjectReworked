import { DeviceDefinition, LightingConfig, KeyRemapEntry, HallEffectKeyConfig } from '../types';
import { IDeviceDriver, createReportBuffer } from './baseDriver';

export class SparkLinkDriver implements IDeviceDriver {
  constructor(public device: DeviceDefinition) {}

  encodeLighting(config: LightingConfig): Uint8Array[] {
    const buf = createReportBuffer(64, 0x05);
    buf[1] = 0x53; // SparkLink Magic 'S'
    buf[2] = 0x4C; // 'L'
    buf[3] = 0x01; // Cmd: RGB Lighting
    buf[4] = config.effect === 'static' ? 1 : config.effect === 'breathing' ? 2 : config.effect === 'wave' ? 3 : 4;
    buf[5] = config.speed;
    buf[6] = config.brightness;
    buf[7] = config.color.r;
    buf[8] = config.color.g;
    buf[9] = config.color.b;

    return [buf];
  }

  encodeKeyRemap(remaps: KeyRemapEntry[]): Uint8Array[] {
    const buf = createReportBuffer(64, 0x05);
    buf[1] = 0x53;
    buf[2] = 0x4C;
    buf[3] = 0x02; // Cmd: Remap
    return [buf];
  }

  encodeDebounce(ms: number): Uint8Array[] {
    const buf = createReportBuffer(64, 0x05);
    buf[1] = 0x53;
    buf[2] = 0x4C;
    buf[3] = 0x03;
    buf[4] = ms;
    return [buf];
  }

  encodeProfileSwitch(profileIndex: number): Uint8Array[] {
    const buf = createReportBuffer(64, 0x05);
    buf[1] = 0x53;
    buf[2] = 0x4C;
    buf[3] = 0x04;
    buf[4] = profileIndex;
    return [buf];
  }

  // Hall Effect Specific Commands
  encodeGlobalActuation(actuationPointMm: number, rapidTrigger: boolean, pressMm: number, releaseMm: number): Uint8Array[] {
    const buf = createReportBuffer(64, 0x05);
    buf[1] = 0x53;
    buf[2] = 0x4C;
    buf[3] = 0x30; // Cmd: Global HE Settings
    
    // Convert mm to 0.01mm integer units (e.g. 2.00mm -> 200)
    const actInt = Math.round(Math.min(Math.max(actuationPointMm, 0.1), 4.0) * 100);
    const pressInt = Math.round(Math.min(Math.max(pressMm, 0.02), 2.0) * 100);
    const relInt = Math.round(Math.min(Math.max(releaseMm, 0.02), 2.0) * 100);

    buf[4] = (actInt >> 8) & 0xFF;
    buf[5] = actInt & 0xFF;
    buf[6] = rapidTrigger ? 1 : 0;
    buf[7] = (pressInt >> 8) & 0xFF;
    buf[8] = pressInt & 0xFF;
    buf[9] = (relInt >> 8) & 0xFF;
    buf[10] = relInt & 0xFF;

    return [buf];
  }

  encodePerKeyActuation(keys: HallEffectKeyConfig[]): Uint8Array[] {
    const packets: Uint8Array[] = [];
    
    // Chunk 8 keys per packet
    for (let i = 0; i < keys.length; i += 8) {
      const chunk = keys.slice(i, i + 8);
      const buf = createReportBuffer(64, 0x05);
      buf[1] = 0x53;
      buf[2] = 0x4C;
      buf[3] = 0x31; // Cmd: Per-Key HE Actuation Table
      buf[4] = Math.floor(i / 8); // Chunk index
      buf[5] = chunk.length;

      let offset = 6;
      for (const k of chunk) {
        const actInt = Math.round(Math.min(Math.max(k.actuationPoint, 0.1), 4.0) * 100);
        const pressInt = Math.round(Math.min(Math.max(k.pressSensitivity, 0.02), 2.0) * 100);
        const relInt = Math.round(Math.min(Math.max(k.releaseSensitivity, 0.02), 2.0) * 100);

        buf[offset++] = k.keyIndex & 0xFF;
        buf[offset++] = (actInt >> 8) & 0xFF;
        buf[offset++] = actInt & 0xFF;
        buf[offset++] = k.rapidTriggerEnabled ? 1 : 0;
        buf[offset++] = pressInt & 0xFF;
        buf[offset++] = relInt & 0xFF;
      }

      packets.push(buf);
    }

    return packets;
  }

  encodeSOCD(config: { enabled: boolean; mode: 'LastInputPriority' | 'Neutral' | 'FirstInputPriority'; keys: string[] }): Uint8Array[] {
    const buf = createReportBuffer(64, 0x05);
    buf[1] = 0x53;
    buf[2] = 0x4C;
    buf[3] = 0x35; // Cmd: SOCD / Snap Tap configuration
    buf[4] = config.enabled ? 1 : 0;
    buf[5] = config.mode === 'LastInputPriority' ? 0x01 : config.mode === 'Neutral' ? 0x02 : 0x03;

    return [buf];
  }
}
