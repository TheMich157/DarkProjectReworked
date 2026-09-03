import React, { useState, useEffect, useRef } from 'react';
import { DeviceDefinition, LightingConfig, MouseSensorConfig, KeyRemapEntry } from '../../core/protocol/types';
import { rgbToHex } from '../../core/protocol/drivers/baseDriver';

interface MouseVisualizerProps {
  device: DeviceDefinition;
  lighting: LightingConfig;
  sensorConfig: MouseSensorConfig;
  remaps: KeyRemapEntry[];
  onSelectButton: (buttonIndex: number) => void;
}

export const MouseVisualizer: React.FC<MouseVisualizerProps> = ({
  device,
  lighting,
  sensorConfig,
  remaps,
  onSelectButton
}) => {
  const [selectedBtn, setSelectedBtn] = useState<number | null>(null);
  const [animTick, setAnimTick] = useState<number>(0);
  const animFrameRef = useRef<number | null>(null);

  // Real-time RGB animation tick loop
  useEffect(() => {
    if (lighting.effect === 'off') return;

    let lastTime = performance.now();
    const loop = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      const speedFactor = (lighting.speed || 3) * 45;
      setAnimTick(prev => (prev + delta * speedFactor) % 3600);

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [lighting.effect, lighting.speed]);

  const currentDpiStage = sensorConfig.dpiStages[sensorConfig.currentDpiIndex] || sensorConfig.dpiStages[0];
  const dpiColorHex = currentDpiStage ? rgbToHex(currentDpiStage.color) : '#00f0ff';

  // Calculate live dynamic RGB underglow color for mouse
  const getDynamicMouseRgb = (): string => {
    if (lighting.effect === 'off') return '#1e2637';

    const brightnessFactor = (lighting.brightness ?? 100) / 100;
    if (brightnessFactor <= 0) return '#1e2637';

    if (lighting.effect === 'wave' || lighting.effect === 'rainbow') {
      const hue = (animTick * 2.5) % 360;
      return `hsl(${hue}, 100%, ${55 * brightnessFactor}%)`;
    }

    if (lighting.effect === 'breathing') {
      const pulse = (Math.sin(animTick * 0.05) + 1) / 2;
      const r = Math.round(lighting.color.r * pulse * brightnessFactor);
      const g = Math.round(lighting.color.g * pulse * brightnessFactor);
      const b = Math.round(lighting.color.b * pulse * brightnessFactor);
      return `rgb(${r}, ${g}, ${b})`;
    }

    if (lighting.effect === 'aurora') {
      const hue = (190 + Math.sin(animTick * 0.04) * 60 + 360) % 360;
      return `hsl(${hue}, 95%, ${55 * brightnessFactor}%)`;
    }

    const r = Math.round(lighting.color.r * brightnessFactor);
    const g = Math.round(lighting.color.g * brightnessFactor);
    const b = Math.round(lighting.color.b * brightnessFactor);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const rgbGlowHex = getDynamicMouseRgb();

  const buttonLabels = [
    'Left Click',
    'Right Click',
    'Scroll Click (B3)',
    'Forward (B5)',
    'Back (B4)',
    'DPI Switch'
  ];

  const [viewMode, setViewMode] = useState<'top' | 'side' | 'perspective' | 'bottom'>('top');

  const mouseImageMap = {
    top: './assets/mice/mouse0.png',
    side: './assets/mice/mouse1.png',
    perspective: './assets/mice/mouse2.png',
    bottom: './assets/mice/mouse3.png'
  };

  return (
    <div className="mouse-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
      {/* Top HUD */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        alignItems: 'center'
      }}>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
            {device.displayName}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
            PAW3395 Sensor • 6-Button Ergonomic Layout
          </div>
        </div>

        {/* Multi-Perspective Switcher */}
        <div style={{
          display: 'flex',
          gap: '4px',
          background: '#0d111a',
          padding: '3px',
          borderRadius: '6px',
          border: '1px solid #1a2232'
        }}>
          <button
            onClick={() => setViewMode('top')}
            style={{
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              borderRadius: '4px',
              border: 'none',
              background: viewMode === 'top' ? '#00f0ff' : 'transparent',
              color: viewMode === 'top' ? '#05070a' : '#94a3b8',
              cursor: 'pointer'
            }}
          >
            Top View
          </button>

          <button
            onClick={() => setViewMode('side')}
            style={{
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              borderRadius: '4px',
              border: 'none',
              background: viewMode === 'side' ? '#00f0ff' : 'transparent',
              color: viewMode === 'side' ? '#05070a' : '#94a3b8',
              cursor: 'pointer'
            }}
          >
            Side Buttons
          </button>

          <button
            onClick={() => setViewMode('perspective')}
            style={{
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              borderRadius: '4px',
              border: 'none',
              background: viewMode === 'perspective' ? '#00f0ff' : 'transparent',
              color: viewMode === 'perspective' ? '#05070a' : '#94a3b8',
              cursor: 'pointer'
            }}
          >
            3D Ergonomic
          </button>

          <button
            onClick={() => setViewMode('bottom')}
            style={{
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              borderRadius: '4px',
              border: 'none',
              background: viewMode === 'bottom' ? '#00f0ff' : 'transparent',
              color: viewMode === 'bottom' ? '#05070a' : '#94a3b8',
              cursor: 'pointer'
            }}
          >
            Sensor / Base
          </button>
        </div>

        {/* Current Active DPI Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#0d111a',
          padding: '6px 14px',
          borderRadius: '6px',
          border: '1px solid #1a2232'
        }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: dpiColorHex,
            boxShadow: `0 0 10px ${dpiColorHex}`
          }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {currentDpiStage?.dpi || 1600} DPI
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            (Stage {sensorConfig.currentDpiIndex + 1})
          </span>
        </div>
      </div>

      {/* 1:1 Authentic Mouse Image Diagram with Interactive Hotspots */}
      <div style={{
        position: 'relative',
        width: '320px',
        height: '420px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 50%, rgba(19, 26, 40, 0.6) 0%, rgba(7, 9, 14, 0.95) 100%)',
        borderRadius: '12px',
        border: '1px solid #1a2232',
        overflow: 'hidden'
      }}>
        {/* Real 1:1 Hardware Image */}
        <img
          src={mouseImageMap[viewMode]}
          alt={device.displayName}
          style={{
            maxWidth: '260px',
            maxHeight: '380px',
            objectFit: 'contain',
            filter: lighting.effect === 'off' ? 'drop-shadow(0 8px 16px rgba(0,0,0,0.8))' : `drop-shadow(0 0 24px ${rgbGlowHex}) drop-shadow(0 10px 20px rgba(0,0,0,0.9))`,
            transition: 'all 0.3s ease'
          }}
        />

        {/* Interactive Hotspot Overlays */}
        {viewMode === 'top' && (
          <>
            {/* B1: Left Click */}
            <div
              onClick={() => { setSelectedBtn(0); onSelectButton(0); }}
              title="Button 1: Left Click"
              style={{
                position: 'absolute',
                top: '40px',
                left: '70px',
                width: '75px',
                height: '110px',
                border: selectedBtn === 0 ? '2px solid #00f0ff' : '1px dashed rgba(0, 240, 255, 0.3)',
                background: selectedBtn === 0 ? 'rgba(0, 240, 255, 0.2)' : 'transparent',
                borderRadius: '12px 0 0 0',
                cursor: 'pointer'
              }}
            />

            {/* B2: Right Click */}
            <div
              onClick={() => { setSelectedBtn(1); onSelectButton(1); }}
              title="Button 2: Right Click"
              style={{
                position: 'absolute',
                top: '40px',
                right: '70px',
                width: '75px',
                height: '110px',
                border: selectedBtn === 1 ? '2px solid #00f0ff' : '1px dashed rgba(0, 240, 255, 0.3)',
                background: selectedBtn === 1 ? 'rgba(0, 240, 255, 0.2)' : 'transparent',
                borderRadius: '0 12px 0 0',
                cursor: 'pointer'
              }}
            />

            {/* B3: Scroll Wheel */}
            <div
              onClick={() => { setSelectedBtn(2); onSelectButton(2); }}
              title="Button 3: Scroll Wheel Click"
              style={{
                position: 'absolute',
                top: '65px',
                left: '148px',
                width: '24px',
                height: '45px',
                border: selectedBtn === 2 ? '2px solid #00f0ff' : '1px solid ' + dpiColorHex,
                background: selectedBtn === 2 ? 'rgba(0, 240, 255, 0.4)' : 'rgba(0, 0, 0, 0.5)',
                borderRadius: '12px',
                boxShadow: `0 0 10px ${dpiColorHex}`,
                cursor: 'pointer'
              }}
            />

            {/* B6: DPI Switch */}
            <div
              onClick={() => { setSelectedBtn(5); onSelectButton(5); }}
              title="Button 6: DPI Switch"
              style={{
                position: 'absolute',
                top: '120px',
                left: '150px',
                width: '20px',
                height: '24px',
                border: selectedBtn === 5 ? '2px solid #00f0ff' : '1px dashed rgba(255, 255, 255, 0.4)',
                background: selectedBtn === 5 ? 'rgba(0, 240, 255, 0.4)' : 'transparent',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            />
          </>
        )}
      </div>

      {/* Button Mapping Labels Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '10px',
        width: '100%',
        marginTop: '10px'
      }}>
        {buttonLabels.map((label, idx) => {
          const remap = remaps.find(r => r.keyIndex === idx);
          const isSelected = selectedBtn === idx;
          return (
            <button
              key={idx}
              onClick={() => {
                setSelectedBtn(idx);
                onSelectButton(idx);
              }}
              style={{
                padding: '10px 12px',
                textAlign: 'left',
                border: isSelected ? '1px solid #00f0ff' : '1px solid #1a2232',
                background: isSelected ? '#131a28' : '#0d111a',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.12s ease'
              }}
            >
              <div style={{ fontSize: '10px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                B{idx + 1}
              </div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: isSelected ? '#00f0ff' : '#f1f5f9' }}>
                {remap ? remap.mappedValue : label}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
