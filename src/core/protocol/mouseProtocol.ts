import { MouseSettings } from '../types';

export class DarkProjectMouseProtocol {
  /**
   * Encodes DPI stages into device packets
   * Opcode: 0x0B (DPI Configuration)
   */
  static encodeDpiPacket(settings: MouseSettings): Uint8Array {
    const packet = new Uint8Array(64);
    packet[0] = 0x07; // Report ID
    packet[1] = 0x0B; // DPI Command Opcode
    packet[2] = settings.dpiStages.filter((s) => s.enabled).length; // Active stages count
    packet[3] = settings.currentDpiIndex; // Current active index

    let offset = 4;
    for (let i = 0; i < settings.dpiStages.length && i < 8; i++) {
      const stage = settings.dpiStages[i];
      // DPI value encoded in 16-bit (little endian, step = 50)
      const rawDpi = Math.max(50, Math.min(26000, stage.dpi));
      packet[offset++] = rawDpi & 0xff;
      packet[offset++] = (rawDpi >> 8) & 0xff;

      // Color RGB
      const hex = stage.color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16) || 255;
      const g = parseInt(hex.substring(2, 4), 16) || 0;
      const b = parseInt(hex.substring(4, 6), 16) || 0;

      packet[offset++] = r;
      packet[offset++] = g;
      packet[offset++] = b;
      packet[offset++] = stage.enabled ? 1 : 0;
    }

    return packet;
  }

  /**
   * Encodes Polling Rate (125Hz, 250Hz, 500Hz, 1000Hz, 2000Hz, 4000Hz, 8000Hz)
   * Opcode: 0x82 / 0x01
   */
  static encodePollingRatePacket(pollingRate: number): Uint8Array {
    const packet = new Uint8Array(64);
    packet[0] = 0x07;
    packet[1] = 0x82; // Polling rate command
    
    // Map rate to firmware enum
    let rateCode = 3; // default 1000Hz
    switch (pollingRate) {
      case 125: rateCode = 0; break;
      case 250: rateCode = 1; break;
      case 500: rateCode = 2; break;
      case 1000: rateCode = 3; break;
      case 2000: rateCode = 4; break;
      case 4000: rateCode = 5; break;
      case 8000: rateCode = 6; break;
    }
    packet[2] = rateCode;
    return packet;
  }

  /**
   * Encodes Performance & Sensor Settings (LOD, MotionSync, Angle Snapping, Debounce)
   * Opcode: 0x88 / 0x04
   */
  static encodeSensorConfigPacket(settings: MouseSettings): Uint8Array {
    const packet = new Uint8Array(64);
    packet[0] = 0x07;
    packet[1] = 0x88;
    packet[2] = settings.lod === '2mm' ? 1 : 0; // Lift Off Distance
    packet[3] = settings.motionSync ? 1 : 0;
    packet[4] = settings.angleSnapping ? 1 : 0;
    packet[5] = settings.rippleControl ? 1 : 0;
    packet[6] = Math.max(0, Math.min(20, settings.debounceTimeMs)); // Debounce ms
    return packet;
  }

  /**
   * Encodes RGB Lighting Settings
   * Opcode: 0x8B / 0x02
   */
  static encodeRgbPacket(settings: MouseSettings): Uint8Array {
    const packet = new Uint8Array(64);
    packet[0] = 0x07;
    packet[1] = 0x8B;
    
    // Effect: 0=Static, 1=Breathing, 2=Neon, 3=Wave, 4=Off
    const effectMap: Record<string, number> = {
      static: 0,
      breathing: 1,
      neon: 2,
      wave: 3,
      off: 4,
    };
    packet[2] = effectMap[settings.rgb.effect] ?? 0;
    packet[3] = Math.max(0, Math.min(100, settings.rgb.brightness));
    packet[4] = Math.max(1, Math.min(10, settings.rgb.speed));

    const hex = settings.rgb.color.replace('#', '');
    packet[5] = parseInt(hex.substring(0, 2), 16) || 0;
    packet[6] = parseInt(hex.substring(2, 4), 16) || 240;
    packet[7] = parseInt(hex.substring(4, 6), 16) || 255;
    packet[8] = Math.max(1, Math.min(30, settings.rgb.sleepTimeoutMin));

    return packet;
  }

  /**
   * Encodes 6-Button Remapping Packet
   */
  static encodeButtonMappingPacket(settings: MouseSettings): Uint8Array {
    const packet = new Uint8Array(64);
    packet[0] = 0x07;
    packet[1] = 0x09; // Button mapping opcode

    const actionMap: Record<string, number> = {
      click: 0x01,
      menu: 0x02,
      middle: 0x04,
      back: 0x08,
      forward: 0x10,
      dpi_cycle: 0x20,
      fire_key: 0x30,
      key_combo: 0x40,
      macro: 0x50,
    };

    for (let btn = 1; btn <= 6; btn++) {
      const mapping = settings.buttonMappings[btn];
      const offset = 2 + (btn - 1) * 3;
      packet[offset] = btn;
      packet[offset + 1] = mapping ? actionMap[mapping.action] ?? 0x01 : 0x01;
      packet[offset + 2] = 0x00; // Reserved/param
    }

    return packet;
  }

  /**
   * Creates a Battery Status Request packet
   */
  static encodeBatteryQueryPacket(): Uint8Array {
    const packet = new Uint8Array(64);
    packet[0] = 0x07;
    packet[1] = 0x11; // Query battery
    return packet;
  }
}
