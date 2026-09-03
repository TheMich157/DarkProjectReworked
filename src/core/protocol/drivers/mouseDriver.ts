import { DeviceDefinition, LightingConfig, KeyRemapEntry, MouseSensorConfig, DPISlot } from '../types';
import { IDeviceDriver, createReportBuffer } from './baseDriver';

export class DarkProjectMouseDriver implements IDeviceDriver {
  constructor(public device: DeviceDefinition) {}

  encodeLighting(config: LightingConfig): Uint8Array[] {
    const buf = createReportBuffer(64, 0x09);
    buf[1] = 0x4D; // 'M'
    buf[2] = 0x45; // 'E'
    buf[3] = 0x01; // Cmd: Mouse RGB
    buf[4] = config.effect === 'static' ? 1 : config.effect === 'breathing' ? 2 : config.effect === 'wave' ? 3 : 4;
    buf[5] = config.speed;
    buf[6] = config.brightness;
    buf[7] = config.color.r;
    buf[8] = config.color.g;
    buf[9] = config.color.b;
    return [buf];
  }

  encodeKeyRemap(remaps: KeyRemapEntry[]): Uint8Array[] {
    const buf = createReportBuffer(64, 0x09);
    buf[1] = 0x4D;
    buf[2] = 0x45;
    buf[3] = 0x10; // Cmd: 6-Button Remap
    let offset = 4;
    for (const r of remaps.slice(0, 6)) {
      buf[offset++] = r.keyIndex; // Button 0-5 (Left, Right, Middle, Back, Forward, DPI)
      buf[offset++] = r.mappedType === 'mouse' ? 1 : r.mappedType === 'keyboard' ? 2 : 0;
    }
    return [buf];
  }

  encodeDebounce(ms: number): Uint8Array[] {
    const buf = createReportBuffer(64, 0x09);
    buf[1] = 0x4D;
    buf[2] = 0x45;
    buf[3] = 0x20; // Cmd: Debounce
    buf[4] = Math.min(Math.max(ms, 0), 20);
    return [buf];
  }

  encodeProfileSwitch(profileIndex: number): Uint8Array[] {
    const buf = createReportBuffer(64, 0x09);
    buf[1] = 0x4D;
    buf[2] = 0x45;
    buf[3] = 0x05;
    buf[4] = profileIndex;
    return [buf];
  }

  // Mouse Sensor Tuning (PAW3395 / PAW3311)
  encodeSensorConfig(sensor: MouseSensorConfig): Uint8Array[] {
    const packets: Uint8Array[] = [];

    // Packet 1: DPI Stages and Current DPI Stage
    const dpiBuf = createReportBuffer(64, 0x09);
    dpiBuf[1] = 0x4D;
    dpiBuf[2] = 0x45;
    dpiBuf[3] = 0x30; // Cmd: DPI Configuration
    dpiBuf[4] = sensor.currentDpiIndex; // Active DPI stage (0-5)
    dpiBuf[5] = sensor.dpiStages.length;

    let offset = 6;
    for (const stage of sensor.dpiStages.slice(0, 6)) {
      // Store DPI in 50-step units or 16-bit uint
      dpiBuf[offset++] = (stage.dpi >> 8) & 0xFF;
      dpiBuf[offset++] = stage.dpi & 0xFF;
      dpiBuf[offset++] = stage.color.r;
      dpiBuf[offset++] = stage.color.g;
      dpiBuf[offset++] = stage.color.b;
      dpiBuf[offset++] = stage.enabled ? 1 : 0;
    }
    packets.push(dpiBuf);

    // Packet 2: Polling rate, LOD, MotionSync, Angle Snapping, Ripple Control
    const perfBuf = createReportBuffer(64, 0x09);
    perfBuf[1] = 0x4D;
    perfBuf[2] = 0x45;
    perfBuf[3] = 0x31; // Cmd: Sensor Performance
    
    // Polling rate code: 125Hz=1, 250Hz=2, 500Hz=3, 1000Hz=4, 2000Hz=5, 4000Hz=6, 8000Hz=7
    const rateCode = sensor.pollingRate === 8000 ? 7 :
                     sensor.pollingRate === 4000 ? 6 :
                     sensor.pollingRate === 2000 ? 5 :
                     sensor.pollingRate === 1000 ? 4 :
                     sensor.pollingRate === 500 ? 3 :
                     sensor.pollingRate === 250 ? 2 : 1;

    perfBuf[4] = rateCode;
    perfBuf[5] = sensor.lodDistance === '2mm' ? 2 : 1; // LOD 1mm or 2mm
    perfBuf[6] = sensor.motionSync ? 1 : 0;
    perfBuf[7] = sensor.angleSnapping ? 1 : 0;
    perfBuf[8] = sensor.rippleControl ? 1 : 0;
    perfBuf[9] = sensor.debounceMs;
    packets.push(perfBuf);

    return packets;
  }

  encodeBatteryQuery(): Uint8Array {
    const buf = createReportBuffer(64, 0x09);
    buf[1] = 0x4D;
    buf[2] = 0x45;
    buf[3] = 0x80; // Cmd: Query Mouse Battery
    return buf;
  }

  decodeBatteryResponse(data: Uint8Array): { level: number; isCharging: boolean } | null {
    if (data.length >= 6 && data[1] === 0x4D && data[2] === 0x45 && data[3] === 0x80) {
      return {
        level: Math.min(100, Math.max(0, data[4])),
        isCharging: Boolean(data[5] & 0x01)
      };
    }
    return null;
  }
}
