export interface KeyCapDefinition {
  index: number;
  code: string;
  label: string;
  subLabel?: string;
  width?: number; // 1 = 1u (default), 1.25, 1.5, 1.75, 2, 2.25, 2.75, 6.25
  height?: number; // 1 = 1u (default), 2u
  isSpacer?: boolean;
  row: number;
  col: number;
  isSpecial?: boolean;
  heSupported?: boolean;
}

export const LAYOUT_87_ANSI: KeyCapDefinition[] = [
  // Row 0: Function Keys
  { index: 0, code: 'Escape', label: 'ESC', row: 0, col: 0, heSupported: true },
  { index: -1, code: 'Spacer1', label: '', isSpacer: true, width: 1, row: 0, col: 1 },
  { index: 1, code: 'F1', label: 'F1', row: 0, col: 2, heSupported: true },
  { index: 2, code: 'F2', label: 'F2', row: 0, col: 3, heSupported: true },
  { index: 3, code: 'F3', label: 'F3', row: 0, col: 4, heSupported: true },
  { index: 4, code: 'F4', label: 'F4', row: 0, col: 5, heSupported: true },
  { index: -2, code: 'Spacer2', label: '', isSpacer: true, width: 0.5, row: 0, col: 6 },
  { index: 5, code: 'F5', label: 'F5', row: 0, col: 7, heSupported: true },
  { index: 6, code: 'F6', label: 'F6', row: 0, col: 8, heSupported: true },
  { index: 7, code: 'F7', label: 'F7', row: 0, col: 9, heSupported: true },
  { index: 8, code: 'F8', label: 'F8', row: 0, col: 10, heSupported: true },
  { index: -3, code: 'Spacer3', label: '', isSpacer: true, width: 0.5, row: 0, col: 11 },
  { index: 9, code: 'F9', label: 'F9', row: 0, col: 12, heSupported: true },
  { index: 10, code: 'F10', label: 'F10', row: 0, col: 13, heSupported: true },
  { index: 11, code: 'F11', label: 'F11', row: 0, col: 14, heSupported: true },
  { index: 12, code: 'F12', label: 'F12', row: 0, col: 15, heSupported: true },
  { index: -4, code: 'Spacer4', label: '', isSpacer: true, width: 0.5, row: 0, col: 16 },
  { index: 13, code: 'PrintScreen', label: 'PRT', row: 0, col: 17, heSupported: true },
  { index: 14, code: 'ScrollLock', label: 'SCR', row: 0, col: 18, heSupported: true },
  { index: 15, code: 'Pause', label: 'PAU', row: 0, col: 19, heSupported: true },

  // Row 1: Number Row
  { index: 16, code: 'Backquote', label: '~', subLabel: '`', row: 1, col: 0, heSupported: true },
  { index: 17, code: 'Digit1', label: '!', subLabel: '1', row: 1, col: 1, heSupported: true },
  { index: 18, code: 'Digit2', label: '@', subLabel: '2', row: 1, col: 2, heSupported: true },
  { index: 19, code: 'Digit3', label: '#', subLabel: '3', row: 1, col: 3, heSupported: true },
  { index: 20, code: 'Digit4', label: '$', subLabel: '4', row: 1, col: 4, heSupported: true },
  { index: 21, code: 'Digit5', label: '%', subLabel: '5', row: 1, col: 5, heSupported: true },
  { index: 22, code: 'Digit6', label: '^', subLabel: '6', row: 1, col: 6, heSupported: true },
  { index: 23, code: 'Digit7', label: '&', subLabel: '7', row: 1, col: 7, heSupported: true },
  { index: 24, code: 'Digit8', label: '*', subLabel: '8', row: 1, col: 8, heSupported: true },
  { index: 25, code: 'Digit9', label: '(', subLabel: '9', row: 1, col: 9, heSupported: true },
  { index: 26, code: 'Digit0', label: ')', subLabel: '0', row: 1, col: 10, heSupported: true },
  { index: 27, code: 'Minus', label: '_', subLabel: '-', row: 1, col: 11, heSupported: true },
  { index: 28, code: 'Equal', label: '+', subLabel: '=', row: 1, col: 12, heSupported: true },
  { index: 29, code: 'Backspace', label: 'BACKSPACE', width: 2, isSpecial: true, row: 1, col: 13, heSupported: true },
  { index: -5, code: 'Spacer5', label: '', isSpacer: true, width: 0.5, row: 1, col: 14 },
  { index: 30, code: 'Insert', label: 'INS', row: 1, col: 15, heSupported: true },
  { index: 31, code: 'Home', label: 'HOME', row: 1, col: 16, heSupported: true },
  { index: 32, code: 'PageUp', label: 'PGUP', row: 1, col: 17, heSupported: true },

  // Row 2: QWERTY Row
  { index: 33, code: 'Tab', label: 'TAB', width: 1.5, isSpecial: true, row: 2, col: 0, heSupported: true },
  { index: 34, code: 'KeyQ', label: 'Q', row: 2, col: 1, heSupported: true },
  { index: 35, code: 'KeyW', label: 'W', row: 2, col: 2, heSupported: true },
  { index: 36, code: 'KeyE', label: 'E', row: 2, col: 3, heSupported: true },
  { index: 37, code: 'KeyR', label: 'R', row: 2, col: 4, heSupported: true },
  { index: 38, code: 'KeyT', label: 'T', row: 2, col: 5, heSupported: true },
  { index: 39, code: 'KeyY', label: 'Y', row: 2, col: 6, heSupported: true },
  { index: 40, code: 'KeyU', label: 'U', row: 2, col: 7, heSupported: true },
  { index: 41, code: 'KeyI', label: 'I', row: 2, col: 8, heSupported: true },
  { index: 42, code: 'KeyO', label: 'O', row: 2, col: 9, heSupported: true },
  { index: 43, code: 'KeyP', label: 'P', row: 2, col: 10, heSupported: true },
  { index: 44, code: 'BracketLeft', label: '{', subLabel: '[', row: 2, col: 11, heSupported: true },
  { index: 45, code: 'BracketRight', label: '}', subLabel: ']', row: 2, col: 12, heSupported: true },
  { index: 46, code: 'Backslash', label: '|', subLabel: '\\', width: 1.5, row: 2, col: 13, heSupported: true },
  { index: -6, code: 'Spacer6', label: '', isSpacer: true, width: 0.5, row: 2, col: 14 },
  { index: 47, code: 'Delete', label: 'DEL', row: 2, col: 15, heSupported: true },
  { index: 48, code: 'End', label: 'END', row: 2, col: 16, heSupported: true },
  { index: 49, code: 'PageDown', label: 'PGDN', row: 2, col: 17, heSupported: true },

  // Row 3: ASDF Row
  { index: 50, code: 'CapsLock', label: 'CAPS', width: 1.75, isSpecial: true, row: 3, col: 0, heSupported: true },
  { index: 51, code: 'KeyA', label: 'A', row: 3, col: 1, heSupported: true },
  { index: 52, code: 'KeyS', label: 'S', row: 3, col: 2, heSupported: true },
  { index: 53, code: 'KeyD', label: 'D', row: 3, col: 3, heSupported: true },
  { index: 54, code: 'KeyF', label: 'F', row: 3, col: 4, heSupported: true },
  { index: 55, code: 'KeyG', label: 'G', row: 3, col: 5, heSupported: true },
  { index: 56, code: 'KeyH', label: 'H', row: 3, col: 6, heSupported: true },
  { index: 57, code: 'KeyJ', label: 'J', row: 3, col: 7, heSupported: true },
  { index: 58, code: 'KeyK', label: 'K', row: 3, col: 8, heSupported: true },
  { index: 59, code: 'KeyL', label: 'L', row: 3, col: 9, heSupported: true },
  { index: 60, code: 'Semicolon', label: ':', subLabel: ';', row: 3, col: 10, heSupported: true },
  { index: 61, code: 'Quote', label: '"', subLabel: '\'', row: 3, col: 11, heSupported: true },
  { index: 62, code: 'Enter', label: 'ENTER', width: 2.25, isSpecial: true, row: 3, col: 12, heSupported: true },
  { index: -7, code: 'Spacer7', label: '', isSpacer: true, width: 3.5, row: 3, col: 13 },

  // Row 4: ZXCV Row
  { index: 63, code: 'ShiftLeft', label: 'SHIFT', width: 2.25, isSpecial: true, row: 4, col: 0, heSupported: true },
  { index: 64, code: 'KeyZ', label: 'Z', row: 4, col: 1, heSupported: true },
  { index: 65, code: 'KeyX', label: 'X', row: 4, col: 2, heSupported: true },
  { index: 66, code: 'KeyC', label: 'C', row: 4, col: 3, heSupported: true },
  { index: 67, code: 'KeyV', label: 'V', row: 4, col: 4, heSupported: true },
  { index: 68, code: 'KeyB', label: 'B', row: 4, col: 5, heSupported: true },
  { index: 69, code: 'KeyN', label: 'N', row: 4, col: 6, heSupported: true },
  { index: 70, code: 'KeyM', label: 'M', row: 4, col: 7, heSupported: true },
  { index: 71, code: 'Comma', label: '<', subLabel: ',', row: 4, col: 8, heSupported: true },
  { index: 72, code: 'Period', label: '>', subLabel: '.', row: 4, col: 9, heSupported: true },
  { index: 73, code: 'Slash', label: '?', subLabel: '/', row: 4, col: 10, heSupported: true },
  { index: 74, code: 'ShiftRight', label: 'SHIFT', width: 2.75, isSpecial: true, row: 4, col: 11, heSupported: true },
  { index: -8, code: 'Spacer8', label: '', isSpacer: true, width: 1.5, row: 4, col: 12 },
  { index: 75, code: 'ArrowUp', label: '▲', row: 4, col: 13, heSupported: true },
  { index: -9, code: 'Spacer9', label: '', isSpacer: true, width: 1, row: 4, col: 14 },

  // Row 5: Bottom Row
  { index: 76, code: 'ControlLeft', label: 'CTRL', width: 1.25, isSpecial: true, row: 5, col: 0, heSupported: true },
  { index: 77, code: 'MetaLeft', label: 'WIN', width: 1.25, isSpecial: true, row: 5, col: 1, heSupported: true },
  { index: 78, code: 'AltLeft', label: 'ALT', width: 1.25, isSpecial: true, row: 5, col: 2, heSupported: true },
  { index: 79, code: 'Space', label: 'DARK PROJECT', width: 6.25, isSpecial: true, row: 5, col: 3, heSupported: true },
  { index: 80, code: 'AltRight', label: 'ALT', width: 1.25, isSpecial: true, row: 5, col: 4, heSupported: true },
  { index: 81, code: 'MetaRight', label: 'WIN', width: 1.25, isSpecial: true, row: 5, col: 5, heSupported: true },
  { index: 82, code: 'ContextMenu', label: 'FN', width: 1.25, isSpecial: true, row: 5, col: 6, heSupported: true },
  { index: 83, code: 'ControlRight', label: 'CTRL', width: 1.25, isSpecial: true, row: 5, col: 7, heSupported: true },
  { index: -10, code: 'Spacer10', label: '', isSpacer: true, width: 0.5, row: 5, col: 8 },
  { index: 84, code: 'ArrowLeft', label: '◀', row: 5, col: 9, heSupported: true },
  { index: 85, code: 'ArrowDown', label: '▼', row: 5, col: 10, heSupported: true },
  { index: 86, code: 'ArrowRight', label: '▶', row: 5, col: 11, heSupported: true }
];

export const LAYOUT_87_ISO: KeyCapDefinition[] = [
  ...LAYOUT_87_ANSI.map(k => {
    if (k.code === 'ShiftLeft') {
      return { ...k, width: 1.25 };
    }
    if (k.code === 'Enter') {
      return { ...k, label: 'ISO ↵', width: 1.5 };
    }
    return k;
  })
];

export const LAYOUT_83_ANSI: KeyCapDefinition[] = [
  ...LAYOUT_87_ANSI.filter(k => !['Insert', 'ScrollLock', 'Pause', 'PrintScreen'].includes(k.code))
];

export const LAYOUT_98_ANSI: KeyCapDefinition[] = [
  ...LAYOUT_87_ANSI,
  // Numeric Pad additions
  { index: 87, code: 'Numpad7', label: '7', row: 1, col: 18 },
  { index: 88, code: 'Numpad8', label: '8', row: 1, col: 19 },
  { index: 89, code: 'Numpad9', label: '9', row: 1, col: 20 },
  { index: 90, code: 'Numpad4', label: '4', row: 2, col: 18 },
  { index: 91, code: 'Numpad5', label: '5', row: 2, col: 19 },
  { index: 92, code: 'Numpad6', label: '6', row: 2, col: 20 },
  { index: 93, code: 'Numpad1', label: '1', row: 3, col: 18 },
  { index: 94, code: 'Numpad2', label: '2', row: 3, col: 19 },
  { index: 95, code: 'Numpad3', label: '3', row: 3, col: 20 },
  { index: 96, code: 'Numpad0', label: '0', width: 2, row: 4, col: 18 },
  { index: 97, code: 'NumpadDecimal', label: '.', row: 4, col: 20 }
];

export function getLayoutForDevice(layoutType: string): KeyCapDefinition[] {
  switch (layoutType) {
    case '87-ISO':
      return LAYOUT_87_ISO;
    case '83-ANSI':
    case '83-ISO':
      return LAYOUT_83_ANSI;
    case '98-ANSI':
    case '98-ISO':
      return LAYOUT_98_ANSI;
    case '87-ANSI':
    default:
      return LAYOUT_87_ANSI;
  }
}
