import React, { useState } from 'react';
import { DARKPROJECT_DEVICES } from '../../core/protocol/devices';
import { DeviceDefinition, DeviceCategory } from '../../core/protocol/types';
import { Search, X, Keyboard, Mouse, Check, Sparkles, Cpu, Target } from 'lucide-react';

interface DevicePickerModalProps {
  isOpen: boolean;
  activeDeviceId: string;
  onSelectDevice: (dev: DeviceDefinition) => void;
  onClose: () => void;
}

export const DevicePickerModal: React.FC<DevicePickerModalProps> = ({
  isOpen,
  activeDeviceId,
  onSelectDevice,
  onClose
}) => {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<DeviceCategory | 'all'>('all');

  if (!isOpen) return null;

  const filtered = DARKPROJECT_DEVICES.filter(dev => {
    const matchesCategory = filterCategory === 'all' || dev.category === filterCategory;
    const matchesSearch = 
      dev.displayName.toLowerCase().includes(search.toLowerCase()) ||
      dev.devicename.toLowerCase().includes(search.toLowerCase()) ||
      dev.routerID.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        width: '850px',
        maxWidth: '100%',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 240, 255, 0.2)'
      }}>
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Select Dark Project Device
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Choose any hardware model to inspect, tune, or operate in simulation mode
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div style={{
          display: 'flex',
          gap: '12px',
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          alignItems: 'center'
        }}>
          <div style={{
            position: 'relative',
            flex: 1,
            display: 'flex',
            alignItems: 'center'
          }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px' }} />
            <input 
              type="text"
              placeholder="Search by name, series, or VID/PID (e.g. Gamma 87, ME4, Fuji, ALU85)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 38px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-main)',
                fontSize: '13px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            {(['all', 'keyboard', 'mouse'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`btn ${filterCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '8px 14px', fontSize: '12px', textTransform: 'capitalize' }}
              >
                {cat === 'all' ? 'All Models' : cat + 's'}
              </button>
            ))}
          </div>
        </div>

        {/* Device Grid List */}
        <div style={{
          padding: '20px 24px',
          overflowY: 'auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '14px'
        }}>
          {filtered.map(dev => {
            const isSelected = dev.id === activeDeviceId;
            return (
              <div
                key={dev.id}
                className="glass-card"
                onClick={() => {
                  onSelectDevice(dev);
                  onClose();
                }}
                style={{
                  padding: '16px',
                  cursor: 'pointer',
                  border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                  boxShadow: isSelected ? '0 0 16px var(--accent-cyan-glow)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: dev.hasHallEffect ? 'rgba(236, 72, 153, 0.15)' : 'rgba(0, 240, 255, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {dev.category === 'mouse' ? (
                      <Mouse size={18} color="var(--accent-cyan)" />
                    ) : dev.hasHallEffect ? (
                      <Target size={18} color="var(--accent-pink)" />
                    ) : (
                      <Keyboard size={18} color="var(--accent-cyan)" />
                    )}
                  </div>
                  {isSelected && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: 'var(--accent-cyan)',
                      fontSize: '11px',
                      fontWeight: 700
                    }}>
                      <Check size={14} /> Active
                    </div>
                  )}
                </div>

                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                    {dev.displayName}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                    {dev.routerID}
                  </div>
                </div>

                {/* Feature Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: 'auto' }}>
                  {dev.hasHallEffect && <span className="badge badge-purple">Rapid Trigger</span>}
                  {dev.hasTFTDisplay && <span className="badge badge-amber">TFT Screen</span>}
                  {dev.battery && <span className="badge badge-emerald">Wireless 2.4G</span>}
                  {dev.maxPollingRate && dev.maxPollingRate > 1000 && (
                    <span className="badge badge-cyan">{dev.maxPollingRate / 1000}K Polling</span>
                  )}
                  {dev.layoutType && <span className="badge">{dev.layoutType}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
