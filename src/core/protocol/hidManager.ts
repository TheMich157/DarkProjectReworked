import { DeviceDefinition, ConnectionState, ConnectionType, DeviceProfile, LightingConfig, KeyRemapEntry, MouseSensorConfig, HallEffectKeyConfig } from './types';
import { DARKPROJECT_DEVICES, findDeviceByVidPid } from './devices';
import { IDeviceDriver } from './drivers/baseDriver';
import { CommonKeyboardDriver } from './drivers/commonKeyboardDriver';
import { SparkLinkDriver } from './drivers/sparkLinkDriver';
import { WitmodDriver } from './drivers/witmodDriver';
import { HFDDriver, TFTDriver } from './drivers/hfdDriver';
import { DarkProjectMouseDriver } from './drivers/mouseDriver';

export type HIDEventCallback = (event: string, payload?: any) => void;

export function detectCategory(rawDev: any, productName?: string): 'keyboard' | 'mouse' | 'dongle' {
  const name = (productName || rawDev?.productName || '').toLowerCase();
  if (name.includes('mouse') || name.includes('me4') || name.includes('me3') || name.includes('me2') || name.includes('one pro') || name.includes('pointer')) {
    return 'mouse';
  }
  if (name.includes('dongle') || name.includes('receiver')) {
    return 'dongle';
  }
  if (rawDev?.collections) {
    for (const c of rawDev.collections) {
      if (c.usagePage === 1 && c.usage === 2) return 'mouse';
      if (c.usagePage === 1 && c.usage === 6) return 'keyboard';
    }
  }
  return 'keyboard';
}

export class HIDManager {
  private static instance: HIDManager;
  
  public currentDevice: DeviceDefinition | null = null;
  public currentDriver: IDeviceDriver | null = null;
  public connectionState: ConnectionState = 'disconnected';
  public isSimulated = false;
  
  private rawDevice: HIDDevice | null = null;
  private listeners: Set<HIDEventCallback> = new Set();
  
  private constructor() {
    if (typeof window !== 'undefined' && 'hid' in navigator) {
      navigator.hid.addEventListener('connect', (e) => this.onDeviceConnected(e as HIDConnectionEvent));
      navigator.hid.addEventListener('disconnect', (e) => this.onDeviceDisconnected(e as HIDConnectionEvent));
    }
  }

  public static getInstance(): HIDManager {
    if (!HIDManager.instance) {
      HIDManager.instance = new HIDManager();
    }
    return HIDManager.instance;
  }

  public subscribe(cb: HIDEventCallback): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify(event: string, payload?: any) {
    for (const cb of this.listeners) {
      try {
        cb(event, payload);
      } catch (err) {
        console.error('Error in HID listener:', err);
      }
    }
  }

  public isWebHIDSupported(): boolean {
    return typeof window !== 'undefined' && 'hid' in navigator;
  }

  public async getConnectedDevices(): Promise<DeviceDefinition[]> {
    const connected: DeviceDefinition[] = [];
    if (this.isWebHIDSupported()) {
      try {
        const paired = await navigator.hid.getDevices();
        for (const dev of paired) {
          const category = detectCategory(dev, dev.productName);
          const match = findDeviceByVidPid(dev.vendorId, dev.productId, dev.productName) || {
            id: `custom-${dev.vendorId}-${dev.productId}`,
            devicename: dev.productName || 'Dark Project Peripheral',
            displayName: dev.productName || 'Dark Project Peripheral',
            category: category,
            routerID: category === 'mouse' ? 'DarkProjectMouseSeries' : 'CommonKeyboardSeries',
            StateList: [{ vid: `0x${dev.vendorId.toString(16)}`, pid: `0x${dev.productId.toString(16)}`, StateType: 'USB' }],
            img: category === 'mouse' ? 'ME4_Wireless' : 'DPKB_FUJI_87_ANSI',
            battery: false,
            layoutType: category === 'mouse' ? 'Mouse-6B' : '87-ANSI',
            deviceInfo: { HardwareProfileNum: 3 }
          };

          // Check if already in connected list (deduplicate multiple HID interfaces of same USB device)
          const isAlreadyAdded = connected.some(c => 
            c.id === match.id || 
            (c.StateList?.some(s1 => 
              match.StateList?.some(s2 => s1.vid.toUpperCase() === s2.vid.toUpperCase() && s1.pid.toUpperCase() === s2.pid.toUpperCase())
            ))
          );

          if (!isAlreadyAdded) {
            connected.push(match);
          }
        }
      } catch (err) {
        console.warn('Error fetching connected devices:', err);
      }
    }
    if (this.currentDevice && !this.isSimulated) {
      const exists = connected.some(c => c.id === this.currentDevice?.id);
      if (!exists) {
        connected.push(this.currentDevice);
      }
    }
    return connected;
  }

  public async autoConnectPairedDevices(): Promise<boolean> {
    if (!this.isWebHIDSupported()) return false;

    try {
      const paired = await navigator.hid.getDevices();
      for (const dev of paired) {
        const match = findDeviceByVidPid(dev.vendorId, dev.productId, dev.productName);
        if (match) {
          await this.attachDevice(dev, match);
          return true;
        }
      }
    } catch (err) {
      console.warn('Auto-connect paired devices failed:', err);
    }
    return false;
  }

  public async requestDevice(): Promise<boolean> {
    if (!this.isWebHIDSupported()) {
      throw new Error('WebHID is not supported in this browser. Please use Chrome, Edge, Brave, or Arc on macOS/Windows.');
    }

    // Build filter list from all registered Dark Project devices
    const filters: HIDDeviceFilter[] = [];
    for (const dev of DARKPROJECT_DEVICES) {
      for (const st of dev.StateList) {
        const vidNum = parseInt(st.vid, 16);
        const pidNum = parseInt(st.pid, 16);
        if (!isNaN(vidNum) && !isNaN(pidNum)) {
          filters.push({ vendorId: vidNum, productId: pidNum });
        }
      }
    }

    try {
      this.connectionState = 'connecting';
      this.notify('stateChange', this.connectionState);

      const devices = await navigator.hid.requestDevice({ filters });
      if (devices && devices.length > 0) {
        const dev = devices[0];
        const category = detectCategory(dev, dev.productName);
        const match = findDeviceByVidPid(dev.vendorId, dev.productId, dev.productName) || {
          id: `custom-${dev.vendorId}-${dev.productId}`,
          devicename: dev.productName || 'Dark Project Device',
          displayName: dev.productName || 'Dark Project Device',
          category: category,
          routerID: category === 'mouse' ? 'DarkProjectMouseSeries' : 'CommonKeyboardSeries',
          StateList: [{ vid: `0x${dev.vendorId.toString(16)}`, pid: `0x${dev.productId.toString(16)}`, StateType: 'USB' }],
          img: category === 'mouse' ? 'ME4_Wireless' : 'DPKB_FUJI_87_ANSI',
          battery: false,
          layoutType: category === 'mouse' ? 'Mouse-6B' : '87-ANSI',
          deviceInfo: { FnNums: 1, HardwareProfileNum: 3 }
        };

        await this.attachDevice(dev, match);
        return true;
      }
    } catch (err) {
      console.error('Request device cancelled or failed:', err);
      this.connectionState = 'disconnected';
      this.notify('stateChange', this.connectionState);
    }
    return false;
  }

  public async attachDevice(rawDev: HIDDevice, def: DeviceDefinition): Promise<void> {
    try {
      if (!rawDev.opened) {
        await rawDev.open();
      }

      this.rawDevice = rawDev;
      this.currentDevice = def;
      this.currentDriver = this.createDriverForDevice(def);
      this.isSimulated = false;
      this.connectionState = 'connected';

      const connType = this.detectConnectionType(rawDev, def);

      rawDev.oninputreport = (e) => {
        this.onInputReport(e);
      };

      this.notify('connectionTypeChange', connType);
      this.notify('deviceAttached', { device: def, simulated: false, connectionType: connType });
      this.notify('stateChange', this.connectionState);
    } catch (err) {
      console.error('Failed to open HID device:', err);
      this.connectionState = 'disconnected';
      this.notify('stateChange', this.connectionState);
      throw err;
    }
  }

  public switchSimulatedDevice(def: DeviceDefinition): void {
    if (this.rawDevice && this.rawDevice.opened) {
      this.rawDevice.close().catch(() => {});
      this.rawDevice = null;
    }

    this.currentDevice = def;
    this.currentDriver = this.createDriverForDevice(def);
    this.isSimulated = true;
    this.connectionState = 'simulated';

    this.notify('deviceAttached', { device: def, simulated: true });
    this.notify('stateChange', this.connectionState);
  }

  public async disconnect(): Promise<void> {
    if (this.rawDevice && this.rawDevice.opened) {
      await this.rawDevice.close();
      this.rawDevice = null;
    }
    this.currentDevice = null;
    this.currentDriver = null;
    this.isSimulated = false;
    this.connectionState = 'disconnected';
    this.notify('stateChange', this.connectionState);
    this.notify('deviceDetached');
  }

  public createDriverForDevice(def: DeviceDefinition): IDeviceDriver {
    switch (def.routerID) {
      case 'SparkLinkSeries':
        return new SparkLinkDriver(def);
      case 'WitmodSeries':
        return new WitmodDriver(def);
      case 'HFDKBSeries':
      case 'HFDKBRGBSeries':
        return new HFDDriver(def);
      case 'TFTKeyboardSeries':
      case 'DponeSeries':
        return new TFTDriver(def);
      case 'DarkProjectMouseSeries':
        return new DarkProjectMouseDriver(def);
      case 'CommonKeyboardSeries':
      default:
        return new CommonKeyboardDriver(def);
    }
  }

  public detectConnectionType(rawDev: HIDDevice, def: DeviceDefinition): ConnectionType {
    const prodName = (rawDev.productName || '').toLowerCase();
    if (prodName.includes('bluetooth') || prodName.includes('ble') || prodName.includes('bt5.')) {
      return 'Bluetooth';
    }
    if (prodName.includes('2.4g') || prodName.includes('dongle') || prodName.includes('receiver') || prodName.includes('wireless')) {
      return 'Dongle';
    }
    const stateMatch = def.StateList.find(s => 
      parseInt(s.vid, 16) === rawDev.vendorId && parseInt(s.pid, 16) === rawDev.productId
    );
    if (stateMatch) {
      return stateMatch.StateType;
    }
    return 'USB';
  }

  public async requestBluetoothDevice(): Promise<boolean> {
    if (typeof navigator !== 'undefined' && 'bluetooth' in navigator) {
      try {
        const btDev = await (navigator as any).bluetooth.requestDevice({
          filters: [
            { namePrefix: 'Dark Project' },
            { namePrefix: 'DP_' },
            { namePrefix: 'ME4' },
            { namePrefix: 'Gamma' },
            { services: ['human_interface_device'] }
          ],
          optionalServices: ['battery_service', 'device_information']
        });

        if (btDev) {
          console.log('Bluetooth device selected:', btDev.name);
          const match = DARKPROJECT_DEVICES.find(d => 
            d.devicename.toLowerCase().includes(btDev.name?.toLowerCase() || '') ||
            d.displayName.toLowerCase().includes(btDev.name?.toLowerCase() || '')
          ) || DARKPROJECT_DEVICES[0];

          this.currentDevice = match;
          this.currentDriver = this.createDriverForDevice(match);
          this.connectionState = 'connected';
          this.isSimulated = false;
          this.notify('connectionTypeChange', 'Bluetooth');
          this.notify('deviceAttached', { device: match, simulated: false, connectionType: 'Bluetooth' });
          this.notify('stateChange', this.connectionState);
          return true;
        }
      } catch (err) {
        console.warn('Bluetooth pairing cancelled or unavailable:', err);
      }
    } else {
      console.info('Web Bluetooth not supported on this browser; fallback available via WebHID / USB.');
    }
    return false;
  }

  public async sendPackets(packets: Uint8Array[]): Promise<void> {
    if (this.isSimulated) {
      // In simulation mode, packets are acknowledged instantly
      return;
    }

    if (!this.rawDevice || !this.rawDevice.opened) {
      console.warn('Cannot send packet: No active HID device connected');
      return;
    }

    for (const pkt of packets) {
      try {
        const reportId = pkt[0];
        // Create an explicit ArrayBuffer copy for BufferSource type compliance
        const data = new Uint8Array(pkt.buffer.slice(pkt.byteOffset + 1, pkt.byteOffset + pkt.byteLength));
        await this.rawDevice.sendReport(reportId, data as any);
      } catch (err) {
        console.error('Failed to send HID report:', err);
      }
    }
  }

  private onInputReport(e: HIDInputReportEvent) {
    const data = new Uint8Array(e.data.buffer);
    this.notify('inputReport', { reportId: e.reportId, data });

    if (this.currentDriver?.decodeBatteryResponse) {
      const bat = this.currentDriver.decodeBatteryResponse(data);
      if (bat) {
        this.notify('batteryUpdate', bat);
      }
    }
  }

  private onDeviceConnected(e: HIDConnectionEvent) {
    console.log('HID device plugged in:', e.device);
    const match = findDeviceByVidPid(e.device.vendorId, e.device.productId, e.device.productName);
    if (match && !this.rawDevice) {
      this.attachDevice(e.device, match);
    }
    this.notify('connectedListChanged');
  }

  private onDeviceDisconnected(e: HIDConnectionEvent) {
    console.log('HID device unplugged:', e.device);
    if (this.rawDevice === e.device) {
      this.disconnect();
    }
    this.notify('connectedListChanged');
  }
}
