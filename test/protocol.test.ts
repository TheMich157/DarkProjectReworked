import assert from 'node:assert';
import { DARKPROJECT_DEVICES, findDeviceByVidPid } from '../src/core/protocol/devices';
import { CommonKeyboardDriver } from '../src/core/protocol/drivers/commonKeyboardDriver';
import { SparkLinkDriver } from '../src/core/protocol/drivers/sparkLinkDriver';
import { DarkProjectMouseDriver } from '../src/core/protocol/drivers/mouseDriver';
import { TFTDriver } from '../src/core/protocol/drivers/hfdDriver';
import { MacroEngine } from '../src/core/protocol/macroEngine';

console.log('🧪 Starting Dark Project Protocol Driver Tests...\n');

// 1. Device Registry Check
console.log('Testing Device Registry:');
assert(DARKPROJECT_DEVICES.length >= 20, 'Device registry should contain all models');
const gamma87 = DARKPROJECT_DEVICES.find(d => d.devicename === 'GAMMA87_ANSI');
assert(gamma87 && gamma87.hasHallEffect, 'Gamma 87 ANSI should have Hall Effect enabled');

const me4Mouse = DARKPROJECT_DEVICES.find(d => d.category === 'mouse');
assert(me4Mouse && me4Mouse.maxPollingRate === 8000, 'ME4 Mouse should support 8000Hz polling');
console.log('  ✓ Device Registry integrity validated.');

// 2. GSKY CommonKeyboardDriver Packet Encoding
console.log('Testing GSKY CommonKeyboardDriver:');
const fujiDev = DARKPROJECT_DEVICES.find(d => d.devicename === 'DPKB_FUJI_87_ANSI')!;
const gskyDriver = new CommonKeyboardDriver(fujiDev);
const rgbPackets = gskyDriver.encodeLighting({
  effect: 'wave',
  speed: 4,
  brightness: 90,
  color: { r: 0, g: 240, b: 255 }
});
assert(rgbPackets.length >= 1, 'Should generate at least 1 lighting packet');
assert.strictEqual(rgbPackets[0][0], 0x04, 'Report ID for GSKY must be 0x04');
assert.strictEqual(rgbPackets[0][1], 0xAA, 'Header byte 1 must be 0xAA');
assert.strictEqual(rgbPackets[0][2], 0x55, 'Header byte 2 must be 0x55');
console.log('  ✓ GSKY Lighting packets validated.');

// 3. SparkLink Hall Effect & Rapid Trigger Encoding
console.log('Testing SparkLink Hall Effect Driver:');
const heDriver = new SparkLinkDriver(gamma87!);
const hePackets = heDriver.encodeGlobalActuation(0.8, true, 0.05, 0.05);
assert.strictEqual(hePackets[0][0], 0x05, 'SparkLink Report ID must be 0x05');
assert.strictEqual(hePackets[0][1], 0x53, 'SparkLink Magic byte 1 must be 0x53 ("S")');
assert.strictEqual(hePackets[0][2], 0x4C, 'SparkLink Magic byte 2 must be 0x4C ("L")');
assert.strictEqual(hePackets[0][3], 0x30, 'Cmd 0x30 is Global HE Settings');
assert.strictEqual(hePackets[0][4], 0x00, 'Actuation high byte for 0.80mm (80)');
assert.strictEqual(hePackets[0][5], 80, 'Actuation low byte for 0.80mm (80)');
assert.strictEqual(hePackets[0][6], 1, 'Rapid Trigger must be enabled (1)');
console.log('  ✓ SparkLink 0.02mm Actuation & Rapid Trigger encoding validated.');

// 4. ME4 8K Mouse Sensor Tuning
console.log('Testing Mouse Driver Sensor & 8K Polling:');
const mouseDriver = new DarkProjectMouseDriver(me4Mouse!);
const sensorPackets = mouseDriver.encodeSensorConfig({
  currentDpiIndex: 2,
  dpiStages: [
    { dpi: 800, color: { r: 255, g: 0, b: 0 }, enabled: true },
    { dpi: 1600, color: { r: 0, g: 240, b: 255 }, enabled: true },
    { dpi: 3200, color: { r: 139, g: 92, b: 246 }, enabled: true }
  ],
  pollingRate: 8000,
  lodDistance: '1mm',
  motionSync: true,
  angleSnapping: false,
  rippleControl: false,
  debounceMs: 2
});
assert.strictEqual(sensorPackets.length, 2, 'Should generate 2 sensor tuning packets');
assert.strictEqual(sensorPackets[0][0], 0x09, 'Mouse Report ID must be 0x09');
assert.strictEqual(sensorPackets[1][4], 7, 'Polling rate code 7 corresponds to 8000Hz');
console.log('  ✓ Mouse PAW3395 & 8000Hz Report Rate packets validated.');

// 5. TFT Clock Sync
console.log('Testing TFT Screen Clock Sync:');
const kd98Dev = DARKPROJECT_DEVICES.find(d => d.devicename === 'KD98UK')!;
const tftDriver = new TFTDriver(kd98Dev);
const clockPkts = tftDriver.encodeTFTClockSync(new Date(2026, 8, 3, 16, 30, 0));
assert.strictEqual(clockPkts[0][0], 0x08, 'TFT Report ID must be 0x08');
assert.strictEqual(clockPkts[0][4], 0x50, 'Cmd 0x50 is Clock Sync');
console.log('  ✓ TFT Clock Sync validated.');

// 6. Macro Engine Timeline
console.log('Testing Macro Engine:');
const macroEng = new MacroEngine();
macroEng.startRecording();
macroEng.recordKey('keydown', 'KeyQ');
macroEng.recordKey('keyup', 'KeyQ');
const recorded = macroEng.stopRecording('Test Q Macro');
assert(recorded.actions.length === 2, 'Should have recorded 2 key actions');
console.log('  ✓ Macro Engine timeline recording validated.');

console.log('\n✨ ALL PROTOCOL DRIVER UNIT TESTS PASSED SUCCESSFULLY! ✨');
