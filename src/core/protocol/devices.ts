import { DeviceDefinition } from './types';
import rawJsonDevices from '../../../darkproject_devices.json';

// Helper to sanitize and expand raw device definitions from darkproject_devices.json
function buildKeyboardDefinitions(): DeviceDefinition[] {
  return rawJsonDevices.map((raw: any, index: number) => {
    const isIso = raw.devicename.includes('ISO') || raw.img?.includes('ISO');
    const is98 = raw.devicename.includes('98') || raw.img?.includes('98');
    const is83 = raw.devicename.includes('83') || raw.img?.includes('83') || raw.devicename.includes('85');
    const isWireless = raw.battery || raw.devicename.includes('WL') || raw.StateList.some((s: any) => s.StateType === 'Dongle');
    const isHallEffect = raw.routerID === 'SparkLinkSeries' || raw.deviceInfo?.Actuation === true;
    const isTft = raw.routerID === 'TFTKeyboardSeries' || raw.routerID === 'DponeSeries';
    const isKnob = isTft || raw.devicename.includes('ALU85') || raw.img?.includes('ALU85');

    // Human-readable friendly display name
    let cleanName = raw.devicename
      .replace(/DPKB_/g, 'Dark Project ')
      .replace(/DPP/g, 'Dark Project Pro ')
      .replace(/_GSH/g, '')
      .replace(/_SUNS/g, '')
      .replace(/_INK/g, ' Ink')
      .replace(/_NAVY/g, ' Navy')
      .replace(/_BL_WL/g, ' Bluetooth & Wireless')
      .replace(/_WL\.\./g, ' Wireless v2')
      .replace(/_WL/g, ' Wireless')
      .replace(/_BL/g, ' Bluetooth')
      .replace(/\._/g, ' ')
      .replace(/\./g, '')
      .replace(/_/g, ' ')
      .trim();

    if (!cleanName.startsWith('Dark Project')) {
      cleanName = `Dark Project ${cleanName}`;
    }

    let layoutType: DeviceDefinition['layoutType'] = '87-ANSI';
    if (is98) layoutType = isIso ? '98-ISO' : '98-ANSI';
    else if (is83) layoutType = isIso ? '83-ISO' : '83-ANSI';
    else layoutType = isIso ? '87-ISO' : '87-ANSI';

    return {
      id: `dp-kb-${index + 1}-${raw.devicename.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      devicename: raw.devicename,
      displayName: cleanName,
      category: 'keyboard',
      routerID: raw.routerID,
      dongleRouterID: raw.dongleRouterID,
      StateList: raw.StateList || [],
      FWUpdateExtension: raw.FWUpdateExtension || ['.bin'],
      SN: raw.SN || `DP-SN-${raw.devicename}`,
      img: raw.img || raw.devicename,
      battery: Boolean(isWireless),
      layoutType,
      keyCount: is98 ? (isIso ? 99 : 98) : is83 ? 83 : (isIso ? 88 : 87),
      hasHallEffect: isHallEffect,
      hasTFTDisplay: isTft,
      hasRotaryKnob: isKnob,
      hasRGB: !raw.devicename.includes('NO_RGB') && !raw.devicename.includes('STEALTH'),
      deviceInfo: {
        RedirectWebFlag: raw.deviceInfo?.RedirectWebFlag ?? false,
        RedirectWebUrl: raw.deviceInfo?.RedirectWebUrl ?? '',
        FnNums: raw.deviceInfo?.FnNums ?? 1,
        MacroRepeattype: raw.deviceInfo?.MacroRepeattype ?? 0,
        Actuation: isHallEffect,
        ActuationData: raw.deviceInfo?.ActuationData ?? {
          UpstrokeMin: 0.1,
          UpstrokeMax: 4.0,
          DownstrokeMin: 0.1,
          DownstrokeMax: 4.0,
          UpstrokeStep: 0.02,
          DownstrokeStep: 0.02
        },
        AdvancedKey: Boolean(isHallEffect || raw.deviceInfo?.AdvancedKey),
        HardwareProfileNum: raw.deviceInfo?.HardwareProfileNum ?? 3,
        MacroMaxRepeatNumber: raw.deviceInfo?.MacroMaxRepeatNumber ?? 255
      }
    };
  });
}

// Complete Mice & Dongles Series
const MICE_AND_ACCESSORIES: DeviceDefinition[] = [
  {
    id: 'dp-mouse-me4-wireless-8k',
    devicename: 'ME4_Wireless_8K',
    displayName: 'Dark Project ME4 Wireless 8K (PAW3395)',
    category: 'mouse',
    routerID: 'DarkProjectMouseSeries',
    StateList: [
      { vid: '0x3554', pid: '0xFB06', StateType: 'USB' },
      { vid: '0x3554', pid: '0xFB07', StateType: 'Dongle' }
    ],
    img: 'ME4_Wireless_8K',
    battery: true,
    hasRGB: true,
    layoutType: 'Mouse-6B',
    maxPollingRate: 8000,
    maxDPI: 26000,
    deviceInfo: {
      HardwareProfileNum: 4,
      DPIMaxStage: 6,
      DPIMaxNumber: 26000
    }
  },
  {
    id: 'dp-mouse-me4-wireless-4k',
    devicename: 'ME4_Wireless_4K',
    displayName: 'Dark Project ME4 Wireless 4K (PAW3395)',
    category: 'mouse',
    routerID: 'DarkProjectMouseSeries',
    StateList: [
      { vid: '0x3554', pid: '0xFB08', StateType: 'USB' },
      { vid: '0x3554', pid: '0xFB09', StateType: 'Dongle' }
    ],
    img: 'ME4_Wireless',
    battery: true,
    hasRGB: true,
    layoutType: 'Mouse-6B',
    maxPollingRate: 4000,
    maxDPI: 26000,
    deviceInfo: {
      HardwareProfileNum: 4,
      DPIMaxStage: 6,
      DPIMaxNumber: 26000
    }
  },
  {
    id: 'dp-mouse-me4-ultralight',
    devicename: 'ME4_UltraLight_3395',
    displayName: 'Dark Project ME4 Ultra-Light Superlight (PAW3395)',
    category: 'mouse',
    routerID: 'DarkProjectMouseSeries',
    StateList: [
      { vid: '0x3554', pid: '0xFB0A', StateType: 'USB' },
      { vid: '0x3554', pid: '0xFB0B', StateType: 'Dongle' }
    ],
    img: 'ME4_UltraLight',
    battery: true,
    hasRGB: false,
    layoutType: 'Mouse-6B',
    maxPollingRate: 4000,
    maxDPI: 26000,
    deviceInfo: {
      HardwareProfileNum: 4,
      DPIMaxStage: 6,
      DPIMaxNumber: 26000
    }
  },
  {
    id: 'dp-mouse-me4-speed-3311',
    devicename: 'ME4_Speed_3311',
    displayName: 'Dark Project ME4 Speed Edition (PAW3311)',
    category: 'mouse',
    routerID: 'DarkProjectMouseSeries',
    StateList: [
      { vid: '0x3554', pid: '0xFB05', StateType: 'USB' }
    ],
    img: 'ME4_Speed',
    battery: false,
    hasRGB: false,
    layoutType: 'Mouse-6B',
    maxPollingRate: 1000,
    maxDPI: 12000,
    deviceInfo: {
      HardwareProfileNum: 4,
      DPIMaxStage: 6,
      DPIMaxNumber: 12000
    }
  },
  {
    id: 'dp-mouse-me4-rgb-wired',
    devicename: 'ME4_RGB_Wired',
    displayName: 'Dark Project ME4 RGB Wired (PAW3395)',
    category: 'mouse',
    routerID: 'DarkProjectMouseSeries',
    StateList: [
      { vid: '0x3554', pid: '0xFB01', StateType: 'USB' }
    ],
    img: 'ME4_RGB',
    battery: false,
    hasRGB: true,
    layoutType: 'Mouse-6B',
    maxPollingRate: 1000,
    maxDPI: 26000,
    deviceInfo: {
      HardwareProfileNum: 4,
      DPIMaxStage: 6,
      DPIMaxNumber: 26000
    }
  },
  {
    id: 'dp-mouse-me3-rgb',
    devicename: 'ME3_RGB',
    displayName: 'Dark Project ME3 RGB Pro (PMW3389)',
    category: 'mouse',
    routerID: 'DarkProjectMouseSeries',
    StateList: [
      { vid: '0x3554', pid: '0xFB02', StateType: 'USB' }
    ],
    img: 'ME3_RGB',
    battery: false,
    hasRGB: true,
    layoutType: 'Mouse-6B',
    maxPollingRate: 1000,
    maxDPI: 16000,
    deviceInfo: {
      HardwareProfileNum: 3,
      DPIMaxStage: 5,
      DPIMaxNumber: 16000
    }
  },
  {
    id: 'dp-mouse-me2-pro',
    devicename: 'ME2_Pro_RGB',
    displayName: 'Dark Project ME2 Pro (PMW3360)',
    category: 'mouse',
    routerID: 'DarkProjectMouseSeries',
    StateList: [
      { vid: '0x3554', pid: '0xFB03', StateType: 'USB' }
    ],
    img: 'ME2_Pro',
    battery: false,
    hasRGB: true,
    layoutType: 'Mouse-6B',
    maxPollingRate: 1000,
    maxDPI: 12000,
    deviceInfo: {
      HardwareProfileNum: 3,
      DPIMaxStage: 5,
      DPIMaxNumber: 12000
    }
  },
  {
    id: 'dp-mouse-one-pro-wireless',
    devicename: 'One_Pro_Wireless',
    displayName: 'Dark Project One Pro Wireless (PAW3395 4K/8K)',
    category: 'mouse',
    routerID: 'DarkProjectMouseSeries',
    StateList: [
      { vid: '0x3554', pid: '0xFB0C', StateType: 'USB' },
      { vid: '0x3554', pid: '0xFB0D', StateType: 'Dongle' }
    ],
    img: 'One_Pro',
    battery: true,
    hasRGB: false,
    layoutType: 'Mouse-6B',
    maxPollingRate: 8000,
    maxDPI: 26000,
    deviceInfo: {
      HardwareProfileNum: 4,
      DPIMaxStage: 6,
      DPIMaxNumber: 26000
    }
  },
  {
    id: 'dp-dongle-8k-receiver',
    devicename: 'DP_8K_Dongle_Receiver',
    displayName: 'Dark Project 8000Hz HyperPolling Wireless Dongle',
    category: 'dongle',
    routerID: 'DarkProjectMouseSeries',
    StateList: [
      { vid: '0x3554', pid: '0xFB0E', StateType: 'USB' },
      { vid: '0x2442', pid: '0xB071', StateType: 'Dongle' },
      { vid: '0x8888', pid: '0x2222', StateType: 'Dongle' }
    ],
    img: 'Dongle_8K',
    battery: false,
    hasRGB: false,
    layoutType: 'Mouse-6B',
    maxPollingRate: 8000,
    deviceInfo: {
      HardwareProfileNum: 1
    }
  }
];

export const DARKPROJECT_DEVICES: DeviceDefinition[] = [
  ...MICE_AND_ACCESSORIES,
  ...buildKeyboardDefinitions()
];

export function findDeviceByVidPid(vid: number, pid: number, productName?: string): DeviceDefinition | undefined {
  const vidHex = `0x${vid.toString(16).toUpperCase().padStart(4, '0')}`;
  const pidHex = `0x${pid.toString(16).toUpperCase().padStart(4, '0')}`;
  
  // Find all candidate definitions matching VID and PID
  const matches = DARKPROJECT_DEVICES.filter(dev => 
    dev.StateList.some(s => 
      s.vid.toUpperCase() === vidHex && s.pid.toUpperCase() === pidHex
    )
  );

  if (matches.length === 0) {
    // Secondary string search match if productName is available
    if (productName) {
      const lowerName = productName.toLowerCase();
      const stringMatch = DARKPROJECT_DEVICES.find(dev => {
        const dName = dev.devicename.toLowerCase();
        const dispName = dev.displayName.toLowerCase();
        return lowerName.includes(dName) || lowerName.includes(dispName) || dName.includes(lowerName);
      });
      if (stringMatch) return stringMatch;
    }
    return undefined;
  }

  if (matches.length === 1 || !productName) {
    return matches[0];
  }

  // Exact model scoring if multiple models share VID/PID
  const lowerProd = productName.toLowerCase();
  let bestMatch = matches[0];
  let bestScore = -1;

  for (const m of matches) {
    let score = 0;
    const devLower = m.devicename.toLowerCase();
    const dispLower = m.displayName.toLowerCase();

    if (lowerProd.includes(devLower)) score += 100;
    if (lowerProd.includes(dispLower)) score += 80;

    // Layout matching
    if (lowerProd.includes('iso') && m.layoutType.includes('ISO')) score += 50;
    if (lowerProd.includes('ansi') && m.layoutType.includes('ANSI')) score += 50;
    if (lowerProd.includes('98') && m.layoutType.includes('98')) score += 40;
    if (lowerProd.includes('83') && m.layoutType.includes('83')) score += 40;
    if (lowerProd.includes('87') && m.layoutType.includes('87')) score += 40;

    // Specific model series keywords
    const keywords = ['fuji', 'violet', 'bushido', 'gamma', 'alu85', 'kd98', 'dpp87', 'dpp83', 'me4', 'me3', 'me2', 'one pro'];
    keywords.forEach(kw => {
      if (lowerProd.includes(kw) && (devLower.includes(kw) || dispLower.includes(kw))) {
        score += 30;
      }
    });

    if (score > bestScore) {
      bestScore = score;
      bestMatch = m;
    }
  }

  return bestMatch;
}
