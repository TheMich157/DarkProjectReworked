import { KeyboardProfile } from '../types';

export class DarkProjectHallEffectProtocol {
  /**
   * Encodes Global Actuation Point (0.1mm - 4.0mm) & Rapid Trigger Sensitivity
   * Opcode: 0x22 (SparkLink Magnetic Switch Calibration)
   */
  static encodeActuationPacket(profile: KeyboardProfile): Uint8Array {
    const packet = new Uint8Array(64);
    packet[0] = 0x07; // Report ID
    packet[1] = 0x22; // Hall Effect Actuation Opcode

    const actuation = profile.actuation || {
      globalActuationMm: 1.5,
      rapidTriggerEnabled: true,
      rapidTriggerPressMm: 0.1,
      rapidTriggerReleaseMm: 0.1,
      perKeyActuation: {},
    };

    // Actuation in 0.01mm resolution (e.g. 1.50mm = 150)
    const actRaw = Math.round(Math.max(0.1, Math.min(4.0, actuation.globalActuationMm)) * 100);
    packet[2] = actRaw & 0xff;
    packet[3] = (actRaw >> 8) & 0xff;

    packet[4] = actuation.rapidTriggerEnabled ? 1 : 0;

    // Rapid trigger press sensitivity (e.g. 0.10mm = 10)
    const rtPress = Math.round(Math.max(0.02, Math.min(2.0, actuation.rapidTriggerPressMm)) * 100);
    packet[5] = rtPress;

    // Rapid trigger release sensitivity (e.g. 0.10mm = 10)
    const rtRelease = Math.round(Math.max(0.02, Math.min(2.0, actuation.rapidTriggerReleaseMm)) * 100);
    packet[6] = rtRelease;

    return packet;
  }

  /**
   * Encodes continuous travel calibration mode trigger
   */
  static encodeTravelCalibrationPacket(startCalibration: boolean): Uint8Array {
    const packet = new Uint8Array(64);
    packet[0] = 0x07;
    packet[1] = 0x25; // Calibration opcode
    packet[2] = startCalibration ? 0x01 : 0x00;
    return packet;
  }
}
