import { KeyboardProfile, KeyboardSettings } from '../types';

export class DarkProjectKeyboardProtocol {
  /**
   * Encodes RGB Lighting Effects into GSKY / Witmod / HFDKB packets
   */
  static encodeLightingPacket(profile: KeyboardProfile): Uint8Array {
    const packet = new Uint8Array(64);
    packet[0] = 0x07; // Report ID
    packet[1] = 0x01; // Lighting Command Opcode

    const effectMap: Record<string, number> = {
      wave: 0,
      breathing: 1,
      rainbow: 2,
      reactive: 3,
      ripple: 4,
      static: 5,
      aurora: 6,
      custom: 7,
      off: 8,
    };

    packet[2] = effectMap[profile.rgb.effect] ?? 0;
    packet[3] = Math.max(0, Math.min(100, profile.rgb.brightness));
    packet[4] = Math.max(1, Math.min(10, profile.rgb.speed));

    const hex = profile.rgb.primaryColor.replace('#', '');
    packet[5] = parseInt(hex.substring(0, 2), 16) || 0;
    packet[6] = parseInt(hex.substring(2, 4), 16) || 240;
    packet[7] = parseInt(hex.substring(4, 6), 16) || 255;

    return packet;
  }

  /**
   * Encodes Debounce Time Packet (0ms to 30ms)
   */
  static encodeDebouncePacket(debounceTimeMs: number): Uint8Array {
    const packet = new Uint8Array(64);
    packet[0] = 0x07;
    packet[1] = 0x04; // Debounce opcode
    packet[2] = Math.max(0, Math.min(30, debounceTimeMs));
    return packet;
  }

  /**
   * Encodes Snap Tap / SOCD Counter-Strafing Settings
   * Mode: Last Input Priority vs Neutral
   */
  static encodeSnapTapPacket(profile: KeyboardProfile): Uint8Array {
    const packet = new Uint8Array(64);
    packet[0] = 0x07;
    packet[1] = 0x1A; // Snap Tap Opcode
    packet[2] = profile.snapTap.enabled ? 1 : 0;
    packet[3] = profile.snapTap.mode === 'last_input_priority' ? 1 : 0;
    
    // Key codes encoded (ASCII / ScanCode)
    const p1 = profile.snapTap.primaryPair;
    packet[4] = p1[0].charCodeAt(p1[0].length - 1) || 65; // 'A'
    packet[5] = p1[1].charCodeAt(p1[1].length - 1) || 68; // 'D'

    const p2 = profile.snapTap.secondaryPair;
    packet[6] = p2[0].charCodeAt(p2[0].length - 1) || 87; // 'W'
    packet[7] = p2[1].charCodeAt(p2[1].length - 1) || 83; // 'S'

    return packet;
  }

  /**
   * Encodes Profile Switch Command (Profile 1, 2, 3, 4)
   */
  static encodeProfileSwitchPacket(profileIndex: number): Uint8Array {
    const packet = new Uint8Array(64);
    packet[0] = 0x07;
    packet[1] = 0x03; // Switch Profile Opcode
    packet[2] = profileIndex;
    return packet;
  }
}
