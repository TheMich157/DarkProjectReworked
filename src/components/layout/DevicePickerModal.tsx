import React, { useState, useEffect } from 'react';
import { DARKPROJECT_DEVICES } from '../../core/protocol/devices';
import { DeviceDefinition, DeviceCategory } from '../../core/protocol/types';
import { HIDManager } from '../../core/protocol/hidManager';
import { Search, X, Keyboard, Mouse, Check, Target, Radio, WifiOff, RefreshCw } from 'lucide-react';

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
  const [showConnectedOnly, setShowConnectedOnly] = useState(false);
  const [connectedDevices, setConnectedDevices] = useState<DeviceDefinition[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const hidManager = HIDManager.getInstance();

  const refreshConnectedDevices = async () => {
    try {
      const devList = await hidManager.getConnectedDevices();
      setConnectedDevices(devList);
    } catch (err) {
      console.warn('Failed to refresh connected devices:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshConnectedDevices();

      const unsubscribe = hidManager.subscribe((event) => {
        if (event === 'connectedListChanged' || event === 'deviceAttached' || event === 'deviceDetached' || event === 'stateChange') {
          refreshConnectedDevices();
        }
      });

      return () => {
        unsubscribe();
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const connectedIds = new Set(connectedDevices.map(d => d.id));
  const isCurrentDeviceConnected = !hidManager.isSimulated && hidManager.currentDevice !== null;

  const filtered = DARKPROJECT_DEVICES.filter(dev => {
    const isConnected = connectedIds.has(dev.id) || (isCurrentDeviceConnected && dev.id === hidManager.currentDevice?.id);
    const matchesConnected = !showConnectedOnly || isConnected;
    const matchesCategory = filterCategory === 'all' || dev.category === filterCategory;
    const matchesSearch = 
      dev.displayName.toLowerCase().includes(search.toLowerCase()) ||
      dev.devicename.toLowerCase().includes(search.toLowerCase()) ||
      dev.routerID.toLowerCase().includes(search.toLowerCase());
    return matchesConnected && matchesCategory && matchesSearch;
  });

  const handleScanHardware = async () => {
    setIsScanning(true);
    try {
      await hidManager.requestDevice();
      await refreshConnectedDevices();
    } catch (err) {
      console.warn('Hardware scan error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        width: '880px',
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
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Select Dark Project Device
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Filter by connected hardware devices or inspect models in preview mode
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
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          {/* Connected Only Switch Pill */}
          <button
            onClick={() => setShowConnectedOnly(!showConnectedOnly)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              borderRadius: '20px',
              border: showConnectedOnly ? '1px solid #10b981' : '1px solid #272a38',
              background: showConnectedOnly ? 'rgba(16, 185, 129, 0.15)' : '#121622',
              color: showConnectedOnly ? '#10b981' : '#94a3b8',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Radio size={14} color={showConnectedOnly ? '#10b981' : '#64748b'} />
            <span>Connected Only</span>
            <span style={{
              fontSize: '10px',
              padding: '1px 6px',
              borderRadius: '10px',
              background: showConnectedOnly ? '#10b981' : '#1e2638',
              color: showConnectedOnly ? '#05070a' : '#94a3b8'
            }}>
              {connectedDevices.length}
            </span>
          </button>

          <div style={{
            position: 'relative',
            flex: 1,
            minWidth: '220px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px' }} />
            <input 
              type="text"
              placeholder="Search model, series, or VID/PID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 14px 9px 38px',
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
                style={{
                  padding: '7px 12px',
                  fontSize: '12px',
                  fontWeight: filterCategory === cat ? 700 : 500,
                  borderRadius: '6px',
                  border: filterCategory === cat ? '1px solid #00f0ff' : '1px solid #1e2638',
                  background: filterCategory === cat ? '#162032' : '#0d111a',
                  color: filterCategory === cat ? '#00f0ff' : '#94a3b8',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {cat === 'all' ? 'All Models' : cat + 's'}
              </button>
            ))}
          </div>
        </div>

        {/* Device Grid List or No Device Connected State */}
        <div style={{
          padding: '20px 24px',
          overflowY: 'auto',
          display: filtered.length > 0 ? 'grid' : 'flex',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '14px',
          minHeight: '300px',
          alignItems: filtered.length === 0 ? 'center' : 'stretch',
          justifyContent: filtered.length === 0 ? 'center' : 'stretch'
        }}>
          {filtered.length === 0 ? (
            /* No Devices Found / No Device Connected Empty State */
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '40px 20px',
              gap: '16px',
              width: '100%'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(245, 158, 11, 0.2)'
              }}>
                <WifiOff size={32} color="#f59e0b" />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc' }}>
                  No Device Connected
                </h3>
                <p style={{ fontSize: '13px', color: '#94a3b8', maxWidth: '420px', marginTop: '6px', lineHeight: 1.5 }}>
                  {showConnectedOnly
                    ? 'No physical Dark Project hardware is currently detected via USB cable, 2.4GHz Dongle, or Bluetooth.'
                    : 'No device models matched your current search filters.'}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button
                  onClick={handleScanHardware}
                  disabled={isScanning}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 18px',
                    background: '#10b981',
                    color: '#05070a',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  <RefreshCw size={14} className={isScanning ? 'animate-spin' : ''} />
                  <span>{isScanning ? 'Scanning...' : 'Scan for Connected Hardware'}</span>
                </button>

                {showConnectedOnly && (
                  <button
                    onClick={() => setShowConnectedOnly(false)}
                    style={{
                      padding: '10px 18px',
                      background: '#1e2638',
                      color: '#f1f5f9',
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      fontWeight: 600,
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    View All Models
                  </button>
                )}
              </div>
            </div>
          ) : (
            filtered.map(dev => {
              const isSelected = dev.id === activeDeviceId;
              const isConnected = connectedIds.has(dev.id) || (isCurrentDeviceConnected && dev.id === hidManager.currentDevice?.id);

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
                    border: isSelected 
                      ? '1px solid var(--accent-cyan)' 
                      : isConnected 
                      ? '1px solid #10b981' 
                      : '1px solid var(--border-subtle)',
                    boxShadow: isSelected 
                      ? '0 0 16px var(--accent-cyan-glow)' 
                      : isConnected 
                      ? '0 0 16px rgba(16, 185, 129, 0.2)' 
                      : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    position: 'relative'
                  }}
                >
                  {/* Card Header & Status Badges */}
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

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      {isConnected ? (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: '#10b981',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: 'rgba(16, 185, 129, 0.15)',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          border: '1px solid rgba(16, 185, 129, 0.3)'
                        }}>
                          <Radio size={10} color="#10b981" /> Connected
                        </div>
                      ) : (
                        <div style={{
                          fontSize: '10px',
                          color: '#64748b',
                          fontFamily: 'var(--font-mono)'
                        }}>
                          Not Connected
                        </div>
                      )}

                      {isSelected && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          color: '#00f0ff',
                          fontSize: '11px',
                          fontWeight: 700
                        }}>
                          <Check size={12} /> Active
                        </div>
                      )}
                    </div>
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
            })
          )}
        </div>
      </div>
    </div>
  );
};
