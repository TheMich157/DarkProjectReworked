import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DeviceDefinition, DeviceProfile, LightingConfig, KeyRemapEntry, MouseSensorConfig, HallEffectKeyConfig, ConnectionState, ConnectionType } from './core/protocol/types';
import { DARKPROJECT_DEVICES } from './core/protocol/devices';
import { HIDManager } from './core/protocol/hidManager';
import { MacroEngine } from './core/protocol/macroEngine';
import { Header } from './components/layout/Header';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { DevicePickerModal } from './components/layout/DevicePickerModal';
import { KeyboardVisualizer } from './components/keyboard/KeyboardVisualizer';
import { KeyRemapper } from './components/keyboard/KeyRemapper';
import { MouseVisualizer } from './components/mouse/MouseVisualizer';
import { SensorStudio } from './components/mouse/SensorStudio';
import { RGBStudio } from './components/rgb/RGBStudio';
import { RapidTriggerStudio } from './components/halleffect/RapidTriggerStudio';
import { TFTStudio } from './components/screen/TFTStudio';
import { MacroStudio } from './components/macros/MacroStudio';
import { DeviceSettings } from './components/settings/DeviceSettings';
import { KeyCapDefinition } from './core/layouts/keyboardLayouts';
import { Sparkles } from 'lucide-react';

const hidManager = HIDManager.getInstance();
const macroEngine = new MacroEngine();

export const App: React.FC = () => {
  // Active Hardware / Simulated Device
  const [currentDevice, setCurrentDevice] = useState<DeviceDefinition>(DARKPROJECT_DEVICES[0]); // Default to Gamma 87 ANSI (Hall Effect)
  const [connectionState, setConnectionState] = useState<ConnectionState>('simulated');
  const [connectionType, setConnectionType] = useState<ConnectionType>('Simulated');
  const [isSimulated, setIsSimulated] = useState(true);
  const [activeProfile, setActiveProfile] = useState(0);
  const [activeTab, setActiveTab] = useState<ActiveTab>('lighting');
  const [activeLayer, setActiveLayer] = useState(0);
  
  // Modals & Selection
  const [isDevicePickerOpen, setIsDevicePickerOpen] = useState(false);
  const [selectedKeyCap, setSelectedKeyCap] = useState<KeyCapDefinition | null>(null);
  const [batteryLevel, setBatteryLevel] = useState(92);
  const [isCharging, setIsCharging] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Profiles State
  const [profile, setProfile] = useState<DeviceProfile>({
    id: 'p-1',
    name: 'Default Gaming Profile',
    lighting: {
      effect: 'rainbow',
      speed: 3,
      brightness: 85,
      color: { r: 0, g: 240, b: 255 }
    },
    keyRemaps: [],
    hallEffect: {
      globalActuationPoint: 1.8,
      globalRapidTrigger: true,
      keys: {}
    },
    mouseSensor: {
      currentDpiIndex: 1,
      dpiStages: [
        { dpi: 800, color: { r: 239, g: 68, b: 68 }, enabled: true },
        { dpi: 1600, color: { r: 0, g: 240, b: 255 }, enabled: true },
        { dpi: 3200, color: { r: 139, g: 92, b: 246 }, enabled: true },
        { dpi: 6400, color: { r: 245, g: 158, b: 11 }, enabled: true },
        { dpi: 12000, color: { r: 236, g: 72, b: 153 }, enabled: true },
        { dpi: 26000, color: { r: 16, g: 185, b: 129 }, enabled: true }
      ],
      pollingRate: 8000,
      lodDistance: '1mm',
      motionSync: true,
      angleSnapping: false,
      rippleControl: false,
      debounceMs: 2
    },
    debounceMs: 2,
    sleepTimeoutMin: 10
  });

  const showToast = useCallback((msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  }, []);

  // Auto-Updater State
  const [updaterInfo, setUpdaterInfo] = useState<{
    status: 'checking' | 'available' | 'downloading' | 'downloaded' | 'up-to-date' | 'error' | null;
    version?: string;
    percent?: number;
    message?: string;
  }>({ status: null });

  // Initialize HID connection and auto-detect
  useEffect(() => {
    hidManager.switchSimulatedDevice(currentDevice);

    const unsubscribe = hidManager.subscribe((event, payload) => {
      if (event === 'stateChange') {
        setConnectionState(payload);
        setIsSimulated(hidManager.isSimulated);
      } else if (event === 'connectionTypeChange') {
        setConnectionType(payload);
      } else if (event === 'deviceAttached') {
        setCurrentDevice(payload.device);
        setIsSimulated(payload.simulated);
        if (payload.connectionType) {
          setConnectionType(payload.connectionType);
        }
        showToast(`Connected to ${payload.device.displayName} via ${payload.connectionType || 'USB'}`);
      } else if (event === 'batteryUpdate') {
        setBatteryLevel(payload.level);
        setIsCharging(payload.isCharging);
      }
    });

    hidManager.autoConnectPairedDevices();

    // Setup Electron Auto-Updater listener
    const bridge = (window as any).darkProjectBridge;
    if (bridge?.onUpdaterStatus) {
      const cleanupUpdater = bridge.onUpdaterStatus((info: any) => {
        setUpdaterInfo(info);
        if (info.status === 'downloaded') {
          showToast(`✨ Dark Project Studio v${info.version || ''} update is ready to install!`);
        } else if (info.status === 'available') {
          showToast(`New update v${info.version || ''} found! Downloading in background...`);
        }
      });
      return () => {
        unsubscribe();
        cleanupUpdater();
      };
    }

    return () => {
      unsubscribe();
    };
  }, []);

  // Sync tab when device type switches
  const handleSelectDevice = (dev: DeviceDefinition) => {
    setCurrentDevice(dev);
    hidManager.switchSimulatedDevice(dev);
    setConnectionType('Simulated');
    
    // Tab fallbacks for mouse vs keyboard and RGB support
    if (dev.category === 'mouse') {
      if (activeTab === 'halleffect' || activeTab === 'tft' || (dev.hasRGB === false && activeTab === 'lighting')) {
        setActiveTab('sensor');
      }
    } else {
      if (activeTab === 'sensor' || (dev.hasRGB === false && activeTab === 'lighting')) {
        setActiveTab(dev.hasHallEffect ? 'halleffect' : 'keyremap');
      }
    }
    showToast(`Switched to ${dev.displayName}`);
  };

  // Hardware USB Cable Connection
  const handleConnectUsb = async () => {
    try {
      const ok = await hidManager.requestDevice();
      if (ok) {
        setConnectionType('USB');
        showToast('Connected directly via USB Cable!');
      }
    } catch (err: any) {
      showToast(err.message || 'USB Connection failed');
    }
  };

  // 2.4GHz Dongle Connection
  const handleConnectDongle = async () => {
    try {
      const ok = await hidManager.requestDevice();
      if (ok) {
        setConnectionType('Dongle');
        showToast('Paired with 2.4GHz Wireless HyperDongle!');
      }
    } catch (err: any) {
      showToast(err.message || 'Dongle pairing failed');
    }
  };

  // Bluetooth 5.3 Connection
  const handleConnectBluetooth = async () => {
    try {
      const ok = await hidManager.requestBluetoothDevice();
      if (ok) {
        setConnectionType('Bluetooth');
        showToast('Paired via Bluetooth 5.3 BLE!');
      } else {
        showToast('Web Bluetooth pairing unavailable or cancelled.');
      }
    } catch (err: any) {
      showToast(err.message || 'Bluetooth pairing failed');
    }
  };

  const handleToggleSimulator = () => {
    hidManager.switchSimulatedDevice(currentDevice);
    setConnectionType('Simulated');
    showToast('No device connected - Model preview mode active');
  };

  // Profile switches
  const handleSelectProfile = (idx: number) => {
    setActiveProfile(idx);
    if (hidManager.currentDriver?.encodeProfileSwitch) {
      const packets = hidManager.currentDriver.encodeProfileSwitch(idx);
      hidManager.sendPackets(packets);
    }
    showToast(`Switched to Onboard Profile ${idx + 1}`);
  };

  // Lighting updates
  const handleLightingChange = (newLighting: LightingConfig) => {
    setProfile(prev => ({ ...prev, lighting: newLighting }));
    if (hidManager.currentDriver?.encodeLighting) {
      const packets = hidManager.currentDriver.encodeLighting(newLighting);
      hidManager.sendPackets(packets);
    }
  };

  // Mouse Sensor updates
  const handleSensorChange = (newSensor: MouseSensorConfig) => {
    setProfile(prev => ({ ...prev, mouseSensor: newSensor }));
    if (hidManager.currentDriver && 'encodeSensorConfig' in hidManager.currentDriver) {
      const packets = (hidManager.currentDriver as any).encodeSensorConfig(newSensor);
      hidManager.sendPackets(packets);
    }
  };

  // Key Remap handlers
  const handleSaveRemap = (entry: KeyRemapEntry) => {
    setProfile(prev => {
      const filtered = prev.keyRemaps.filter(r => !(r.keyIndex === entry.keyIndex && r.layer === entry.layer));
      return { ...prev, keyRemaps: [...filtered, entry] };
    });
    if (hidManager.currentDriver?.encodeKeyRemap) {
      const packets = hidManager.currentDriver.encodeKeyRemap([...profile.keyRemaps, entry]);
      hidManager.sendPackets(packets);
    }
    showToast(`Remapped ${entry.code} to ${entry.mappedValue}`);
  };

  const handleResetRemap = (keyIndex: number, layer: number) => {
    setProfile(prev => ({
      ...prev,
      keyRemaps: prev.keyRemaps.filter(r => !(r.keyIndex === keyIndex && r.layer === layer))
    }));
    showToast(`Reset key mapping to default`);
  };

  // Hall Effect Settings updates
  const handleGlobalActuationChange = (val: number) => {
    setProfile(prev => ({
      ...prev,
      hallEffect: {
        ...prev.hallEffect!,
        globalActuationPoint: val
      }
    }));
    if (hidManager.currentDriver && 'encodeGlobalActuation' in hidManager.currentDriver) {
      const packets = (hidManager.currentDriver as any).encodeGlobalActuation(
        val,
        profile.hallEffect?.globalRapidTrigger || false,
        0.1,
        0.1
      );
      hidManager.sendPackets(packets);
    }
  };

  const handleRapidTriggerToggle = (val: boolean) => {
    setProfile(prev => ({
      ...prev,
      hallEffect: {
        ...prev.hallEffect!,
        globalRapidTrigger: val
      }
    }));
    if (hidManager.currentDriver && 'encodeGlobalActuation' in hidManager.currentDriver) {
      const packets = (hidManager.currentDriver as any).encodeGlobalActuation(
        profile.hallEffect?.globalActuationPoint || 2.0,
        val,
        0.1,
        0.1
      );
      hidManager.sendPackets(packets);
    }
  };

  const handleSOCDChange = (enabled: boolean, mode: any) => {
    if (hidManager.currentDriver && 'encodeSOCD' in hidManager.currentDriver) {
      const packets = (hidManager.currentDriver as any).encodeSOCD({
        enabled,
        mode,
        keys: ['KeyA', 'KeyD']
      });
      hidManager.sendPackets(packets);
    }
  };

  // TFT Screen actions
  const handleSyncClock = () => {
    if (hidManager.currentDriver && 'encodeTFTClockSync' in hidManager.currentDriver) {
      const packets = (hidManager.currentDriver as any).encodeTFTClockSync(new Date());
      hidManager.sendPackets(packets);
    }
    showToast('TFT Clock synchronized!');
  };

  const handleUploadImage = (img: string) => {
    showToast('Image transmitted to TFT Display memory!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Auto-Updater Ready Notification Banner */}
      {updaterInfo.status === 'downloaded' && (
        <div style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          padding: '10px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#ffffff',
          fontWeight: 700,
          fontSize: '13px',
          boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)',
          zIndex: 3000
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={16} />
            <span>Dark Project Studio v{updaterInfo.version || ''} update is downloaded and ready to install!</span>
          </div>
          <button
            onClick={() => (window as any).darkProjectBridge?.restartAndInstall()}
            style={{
              padding: '6px 16px',
              background: '#ffffff',
              color: '#047857',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 800,
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Restart & Update Now
          </button>
        </div>
      )}

      {/* App Header */}
      <Header
        currentDevice={currentDevice}
        connectionState={connectionState}
        connectionType={connectionType}
        isSimulated={isSimulated}
        batteryLevel={batteryLevel}
        isCharging={isCharging}
        activeProfile={activeProfile}
        onSelectProfile={handleSelectProfile}
        onOpenDevicePicker={() => setIsDevicePickerOpen(true)}
        onConnectUsb={handleConnectUsb}
        onConnectDongle={handleConnectDongle}
        onConnectBluetooth={handleConnectBluetooth}
        onToggleSimulator={handleToggleSimulator}
      />

      {/* Main Workspace Layout */}
      <div style={{ display: 'flex', flex: 1, padding: '16px 24px 24px 24px', gap: '20px' }}>
        {/* Navigation Sidebar */}
        <Sidebar
          currentDevice={currentDevice}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
        />

        {/* Content Area */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
          {/* Main Visualizer Canvas (Keyboard / Mouse) */}
          {currentDevice.category === 'mouse' ? (
            <MouseVisualizer
              device={currentDevice}
              lighting={profile.lighting}
              sensorConfig={profile.mouseSensor!}
              remaps={profile.keyRemaps}
              onSelectButton={(btnIdx) => {
                setSelectedKeyCap({
                  index: btnIdx,
                  code: `MouseButton${btnIdx + 1}`,
                  label: `Button ${btnIdx + 1}`,
                  row: 0,
                  col: 0
                });
              }}
            />
          ) : (
            <KeyboardVisualizer
              device={currentDevice}
              lighting={profile.lighting}
              selectedKeyIndex={selectedKeyCap?.index ?? null}
              onSelectKey={(k) => setSelectedKeyCap(k)}
              remaps={profile.keyRemaps}
              hallEffectKeys={profile.hallEffect?.keys}
              activeLayer={activeLayer}
            />
          )}

          {/* Module Tab Content */}
          {activeTab === 'lighting' && (
            <RGBStudio
              lighting={profile.lighting}
              onChange={handleLightingChange}
            />
          )}

          {activeTab === 'sensor' && currentDevice.category === 'mouse' && (
            <SensorStudio
              config={profile.mouseSensor!}
              maxDpi={currentDevice.maxDPI || 26000}
              maxPollingRate={currentDevice.maxPollingRate || 8000}
              onChange={handleSensorChange}
            />
          )}

          {activeTab === 'halleffect' && (
            <RapidTriggerStudio
              globalActuation={profile.hallEffect?.globalActuationPoint || 1.8}
              globalRapidTrigger={profile.hallEffect?.globalRapidTrigger || false}
              pressSensitivity={0.1}
              releaseSensitivity={0.1}
              socdEnabled={true}
              socdMode="LastInputPriority"
              onChangeGlobalActuation={handleGlobalActuationChange}
              onChangeRapidTrigger={handleRapidTriggerToggle}
              onChangePressSensitivity={() => {}}
              onChangeReleaseSensitivity={() => {}}
              onChangeSocdEnabled={(e) => handleSOCDChange(e, 'LastInputPriority')}
              onChangeSocdMode={(m) => handleSOCDChange(true, m)}
            />
          )}

          {activeTab === 'tft' && (
            <TFTStudio
              device={currentDevice}
              onSyncClock={handleSyncClock}
              onUploadImage={handleUploadImage}
            />
          )}

          {activeTab === 'macros' && (
            <MacroStudio
              macroEngine={macroEngine}
              onUpdate={() => setProfile(prev => ({ ...prev }))}
            />
          )}

          {activeTab === 'settings' && (
            <DeviceSettings
              device={currentDevice}
              debounceMs={profile.debounceMs}
              sleepTimeoutMin={profile.sleepTimeoutMin}
              onChangeDebounce={(ms) => {
                setProfile(prev => ({ ...prev, debounceMs: ms }));
                if (hidManager.currentDriver?.encodeDebounce) {
                  const pkts = hidManager.currentDriver.encodeDebounce(ms);
                  hidManager.sendPackets(pkts);
                }
              }}
              onChangeSleepTimeout={(min) => setProfile(prev => ({ ...prev, sleepTimeoutMin: min }))}
              onFactoryReset={() => showToast('Device factory settings restored!')}
              onExportProfile={() => {
                const blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${currentDevice.devicename}_profile.json`;
                a.click();
              }}
            />
          )}
        </main>
      </div>

      {/* Key Remapper Modal */}
      {selectedKeyCap && (
        <KeyRemapper
          keyCap={selectedKeyCap}
          activeLayer={activeLayer}
          currentRemap={profile.keyRemaps.find(r => r.keyIndex === selectedKeyCap.index && r.layer === activeLayer)}
          macros={macroEngine.getMacros()}
          onSaveRemap={handleSaveRemap}
          onResetRemap={handleResetRemap}
          onClose={() => setSelectedKeyCap(null)}
        />
      )}

      {/* Device Picker Inventory Modal */}
      <DevicePickerModal
        isOpen={isDevicePickerOpen}
        activeDeviceId={currentDevice.id}
        onSelectDevice={handleSelectDevice}
        onClose={() => setIsDevicePickerOpen(false)}
      />

      {/* Status Toast Banner */}
      {statusMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'rgba(13, 17, 24, 0.95)',
          border: '1px solid var(--accent-cyan)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 20px',
          color: 'var(--text-primary)',
          fontSize: '13px',
          fontWeight: 600,
          boxShadow: '0 8px 30px rgba(0, 240, 255, 0.3)',
          backdropFilter: 'blur(16px)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-cyan)' }} />
          <span>{statusMessage}</span>
        </div>
      )}
    </div>
  );
};
export default App;
