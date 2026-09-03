import { Macro, MacroAction } from './types';

export class MacroEngine {
  private macros: Map<string, Macro> = new Map();
  private isRecording = false;
  private currentRecording: MacroAction[] = [];
  private lastActionTime = 0;

  constructor() {
    this.loadDefaultMacros();
  }

  private loadDefaultMacros() {
    const defaultMacro: Macro = {
      id: 'macro-1',
      name: 'Counter-Strike Fast Quickswitch (Q-Q)',
      repeatMode: 'once',
      actions: [
        { id: '1', type: 'keydown', code: 'KeyQ' },
        { id: '2', type: 'delay', delayMs: 25 },
        { id: '3', type: 'keyup', code: 'KeyQ' },
        { id: '4', type: 'delay', delayMs: 40 },
        { id: '5', type: 'keydown', code: 'KeyQ' },
        { id: '6', type: 'delay', delayMs: 25 },
        { id: '7', type: 'keyup', code: 'KeyQ' }
      ]
    };

    const crouchJump: Macro = {
      id: 'macro-2',
      name: 'Super Jump (Space + Ctrl)',
      repeatMode: 'once',
      actions: [
        { id: '1', type: 'keydown', code: 'Space' },
        { id: '2', type: 'keydown', code: 'ControlLeft' },
        { id: '3', type: 'delay', delayMs: 60 },
        { id: '4', type: 'keyup', code: 'Space' },
        { id: '5', type: 'keyup', code: 'ControlLeft' }
      ]
    };

    this.macros.set(defaultMacro.id, defaultMacro);
    this.macros.set(crouchJump.id, crouchJump);
  }

  public getMacros(): Macro[] {
    return Array.from(this.macros.values());
  }

  public getMacro(id: string): Macro | undefined {
    return this.macros.get(id);
  }

  public saveMacro(macro: Macro): void {
    this.macros.set(macro.id, macro);
  }

  public deleteMacro(id: string): void {
    this.macros.delete(id);
  }

  public startRecording(): void {
    this.isRecording = true;
    this.currentRecording = [];
    this.lastActionTime = performance.now();
  }

  public recordKey(type: 'keydown' | 'keyup', code: string): void {
    if (!this.isRecording) return;

    const now = performance.now();
    const delay = Math.round(now - this.lastActionTime);
    this.lastActionTime = now;

    if (delay > 5 && this.currentRecording.length > 0) {
      this.currentRecording.push({
        id: `act-${Date.now()}-${Math.random()}`,
        type: 'delay',
        delayMs: Math.min(delay, 2000)
      });
    }

    this.currentRecording.push({
      id: `act-${Date.now()}-${Math.random()}`,
      type,
      code
    });
  }

  public stopRecording(name: string): Macro {
    this.isRecording = false;
    const newMacro: Macro = {
      id: `macro-${Date.now()}`,
      name: name || `Recorded Macro ${this.macros.size + 1}`,
      repeatMode: 'once',
      actions: [...this.currentRecording]
    };
    this.macros.set(newMacro.id, newMacro);
    return newMacro;
  }

  public exportToJson(): string {
    return JSON.stringify(Array.from(this.macros.values()), null, 2);
  }

  public importFromJson(jsonStr: string): boolean {
    try {
      const list = JSON.parse(jsonStr) as Macro[];
      if (Array.isArray(list)) {
        for (const m of list) {
          if (m.id && m.name && Array.isArray(m.actions)) {
            this.macros.set(m.id, m);
          }
        }
        return true;
      }
    } catch (err) {
      console.error('Failed to parse macro JSON:', err);
    }
    return false;
  }
}
