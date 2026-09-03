import { DARKPROJECT_DEVICES, findDeviceByUsbIds } from './devices';
import { DeviceDefinition, KeyboardSettings, MouseSettings } from './types';
import { DarkProjectMouseProtocol } from './protocol/mouseProtocol';
import { DarkProjectKeyboardProtocol } from './protocol/keyboardProtocol';
import { DarkProjectHallEffectProtocol } from './protocol/hallEffectProtocol';

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'simulated';

export interface HidEventCallback {
  onStateChange: (state: ConnectionState) => void;
  onBatteryUpdate?: (level: number, isCharging: boolean) => void;
  onDpiChange?: (dpiIndex: number) => void;
  onLog?: (message: string, level: 'info' | 'warn' | 'error') => void;
}

export class DarkProjectHidManager {
  private static instance: DarkProjectHidManager;
  private hidDevice: any = null; // HIDDevice from WebHID
  private currentDevice: DeviceDefinition | null = null;
  private connectionState: ConnectionState = 'disconnected';
  private callbacks: HidEventCallback | null = null;
  private simulationActive: boolean = false;

  private constructor() {
    this.setupWebHidListeners();
  }

  public static getInstance(): DarkProjectHidManager {
    if (!DarkProjectHidManager.instance) {
      DarkProjectHidManager.instance = new DarkProjectHidManager();
    }
    return DarkProjectHidManager.instance;
  }

  public registerCallbacks(callbacks: HidEventCallback) {
    this.callbacks = callbacks;
    this.notifyState();
  }

  public isWebHidSupported(): boolean {
    return typeof navigator !== 'undefined' && 'hid' in navigator;
  }

  public getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  public getCurrentDevice(): DeviceDefinition | null {
    return this.currentDevice;
  }

  /**
   * Scans and prompts user for USB/Bluetooth Dark Project hardware via WebHID
   */
  public async connectHardware(): Promise<boolean> {
    if (!this.isWebHidSupported()) {
      this.log('WebHID is not supported in this browser. Running in Simulation Mode.', 'warn');
      return this.startSimulation();
    }

    try {
      this.setState('connecting');
      this.log('Scanning for connected Dark Project hardware...', 'info');

      // Generate USB vendor filters for all known Dark Project MCUs
      const filters = DARKPROJECT_DEVICES.map((d) => ({
        vendorId: d.vendorId,
        productId: d.productId,
      }));

      // Deduplicate filters
      const uniqueFilters = filters.filter(
        (v, i, a) =>
          a.findIndex((t) => t.vendorId === v.vendorId && t.productId === v.productId) === i
      );

      const navHid = (navigator as any).hid;
      const devices: any[] = await navHid.requestDevice({ filters: uniqueFilters });

      if (!devices || devices.length === 0) {
        this.log('No hardware selected by user. Switching to Simulation Mode.', 'info');
        return this.startSimulation();
      }

      const selected = devices[0];
      await this.attachDevice(selected);
      return true;
    } catch (err: any) {
      this.log(`Failed to connect hardware: ${err?.message || err}. Starting Simulation.`, 'warn');
      return this.startSimulation();
    }
  }

  private async attachDevice(device: any) {
    try {
      if (!device.opened) {
        await device.open();
      }

      this.hidDevice = device;
      this.simulationActive = false;

      // Identify device from registry
      const matched = findDeviceByUsbIds(device.vendorId, device.productId);
      this.currentDevice = matched || {
        id: `custom-${device.vendorId}-${device.productId}`,
        name: device.productName || 'Dark Project Device',
        displayName: device.productName || 'Dark Project Peripheral',
        series: 'CommonKeyboardSeries',
        vendorId: device.vendorId,
        productId: device.productId,
        deviceType: device.collections?.[0]?.usage === 2 ? 'mouse' : 'keyboard',
        sn: 'CUSTOM-HID',
        hasRgb: true,
      };

      this.setupInputReportHandler();
      this.setState('connected');
      this.log(`Successfully connected to ${this.currentDevice.name}`, 'info');
    } catch (err: any) {
      this.log(`Error opening device: ${err?.message}`, 'error');
      this.startSimulation();
    }
  }

  public startSimulation(device?: DeviceDefinition): boolean {
    this.simulationActive = true;
    this.hidDevice = null;
    this.currentDevice = device || DARKPROJECT_DEVICES[0]; // Default to ME4 Wireless 8K or Fuji 87
    this.setState('simulated');
    this.log(`Hardware simulation active for ${this.currentDevice.name}`, 'info');
    return true;
  }

  public selectDevice(device: DeviceDefinition) {
    this.currentDevice = device;
    if (this.connectionState === 'simulated' || !this.hidDevice) {
      this.setState('simulated');
    }
    this.log(`Active device switched to ${device.name}`, 'info');
  }

  public async applyMouseSettings(settings: MouseSettings): Promise<boolean> {
    if (this.simulationActive || !this.hidDevice) {
      this.log('Simulated: Applied Mouse settings (DPI, Polling, LOD, RGB, Buttons)', 'info');
      return true;
    }

    try {
      // 1. Send DPI packet
      const dpiPacket = DarkProjectMouseProtocol.encodeDpiPacket(settings);
      await this.hidDevice.sendReport(0x07, dpiPacket.slice(1));

      // 2. Send Polling Rate packet
      const pollPacket = DarkProjectMouseProtocol.encodePollingRatePacket(settings.pollingRate);
      await this.hidDevice.sendReport(0x07, pollPacket.slice(1));

      // 3. Send Sensor/LOD/Debounce packet
      const sensorPacket = DarkProjectMouseProtocol.encodeSensorConfigPacket(settings);
      await this.hidDevice.sendReport(0x07, sensorPacket.slice(1));

      // 4. Send RGB Lighting packet
      const rgbPacket = DarkProjectMouseProtocol.encodeRgbPacket(settings);
      await this.hidDevice.sendReport(0x07, rgbPacket.slice(1));

      // 5. Send Button Mappings
      const btnPacket = DarkProjectMouseProtocol.encodeButtonMappingPacket(settings);
      await this.hidDevice.sendReport(0x07, btnPacket.slice(1));

      this.log('Successfully synced all mouse settings to onboard memory.', 'info');
      return true;
    } catch (err: any) {
      this.log(`Failed to write mouse settings: ${err?.message}`, 'error');
      return false;
    }
  }

  public async applyKeyboardSettings(settings: KeyboardSettings): Promise<boolean> {
    const activeProfile = settings.profiles[settings.activeProfileIndex] || settings.profiles[1];
    
    if (this.simulationActive || !this.hidDevice) {
      this.log(`Simulated: Applied Keyboard settings for Profile ${activeProfile.id} (${activeProfile.name})`, 'info');
      return true;
    }

    try {
      // 1. Send Lighting
      const lightPacket = DarkProjectKeyboardProtocol.encodeLightingPacket(activeProfile);
      await this.hidDevice.sendReport(0x07, lightPacket.slice(1));

      // 2. Send Debounce
      const debouncePacket = DarkProjectKeyboardProtocol.encodeDebouncePacket(activeProfile.debounceTimeMs);
      await this.hidDevice.sendReport(0x07, debouncePacket.slice(1));

      // 3. Send Snap Tap (SOCD)
      const snapPacket = DarkProjectKeyboardProtocol.encodeSnapTapPacket(activeProfile);
      await this.hidDevice.sendReport(0x07, snapPacket.slice(1));

      // 4. Send Hall Effect / Rapid Trigger if supported
      if (this.currentDevice?.hasRapidTrigger && activeProfile.actuation) {
        const hePacket = DarkProjectHallEffectProtocol.encodeActuationPacket(activeProfile);
        await this.hidDevice.sendReport(0x07, hePacket.slice(1));
      }

      this.log('Successfully synced keyboard profile to onboard memory.', 'info');
      return true;
    } catch (err: any) {
      this.log(`Failed to write keyboard settings: ${err?.message}`, 'error');
      return false;
    }
  }

  public async disconnect() {
    if (this.hidDevice) {
      try {
        await this.hidDevice.close();
      } catch (e) {}
      this.hidDevice = null;
    }
    this.setState('disconnected');
    this.log('Hardware disconnected.', 'info');
  }

  private setupInputReportHandler() {
    if (!this.hidDevice) return;

    this.hidDevice.oninputreport = (event: any) => {
      const { data, reportId } = event;
      const buffer = new Uint8Array(data.buffer);

      // Check battery response (Opcode 0x11)
      if (reportId === 0x07 && buffer[0] === 0x11) {
        const batteryPct = buffer[1];
        const isCharging = buffer[2] === 1;
        this.callbacks?.onBatteryUpdate?.(batteryPct, isCharging);
      }

      // Check DPI stage change button press
      if (reportId === 0x07 && buffer[0] === 0x0B) {
        const currentDpiIndex = buffer[1];
        this.callbacks?.onDpiChange?.(currentDpiIndex);
      }
    };
  }

  private setupWebHidListeners() {
    if (typeof navigator !== 'undefined' && 'hid' in navigator) {
      const navHid = (navigator as any).hid;
      navHid.addEventListener('disconnect', (event: any) => {
        if (event.device === this.hidDevice) {
          this.log('Dark Project device unplugged. Falling back to Simulation Mode.', 'warn');
          this.startSimulation();
        }
      });
    }
  }

  private setState(state: ConnectionState) {
    this.connectionState = state;
    this.notifyState();
  }

  private notifyState() {
    if (this.callbacks) {
      this.callbacks.onStateChange(this.connectionState);
    }
  }

  private log(message: string, level: 'info' | 'warn' | 'error' = 'info') {
    if (this.callbacks?.onLog) {
      this.callbacks.onLog(message, level);
    } else {
      console.log(`[DarkProjectHID][${level.toUpperCase()}] ${message}`);
    }
  }
}
