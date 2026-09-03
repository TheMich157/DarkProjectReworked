import React, { useState, useRef } from 'react';
import { DeviceDefinition } from '../../core/protocol/types';
import { Tv, Upload, Clock, Image as ImageIcon, Sparkles, Check, RefreshCw } from 'lucide-react';

interface TFTStudioProps {
  device: DeviceDefinition;
  onSyncClock: () => void;
  onUploadImage: (imageData: string) => void;
}

export const TFTStudio: React.FC<TFTStudioProps> = ({
  device,
  onSyncClock,
  onUploadImage
}) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [clockSyncStatus, setClockSyncStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setPreviewImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = () => {
    if (!previewImage) return;
    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          onUploadImage(previewImage);
          return 100;
        }
        return prev + 15;
      });
    }, 150);
  };

  const handleClock = () => {
    onSyncClock();
    setClockSyncStatus('Clock synchronized with system time!');
    setTimeout(() => setClockSyncStatus(null), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Screen Upload Panel */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Tv size={18} color="var(--accent-amber)" />
              <span>TFT Display Screen Studio</span>
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Upload custom static images, animated GIFs, or status dashboards to the onboard color LCD
            </p>
          </div>
          <span className="badge badge-amber">128x128 COLOR LCD</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {/* Virtual Screen Preview */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            background: '#090c12',
            borderRadius: 'var(--radius-lg)',
            border: '2px solid #242c3d'
          }}>
            <div style={{
              width: '160px',
              height: '160px',
              borderRadius: '12px',
              background: '#000',
              border: '3px solid #1e2637',
              boxShadow: '0 0 20px rgba(0, 240, 255, 0.2)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="TFT Screen Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '12px' }}>
                  <ImageIcon size={32} color="var(--text-muted)" style={{ margin: '0 auto 8px auto' }} />
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>No Image Loaded</div>
                </div>
              )}

              {isUploading && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0, 0, 0, 0.75)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <RefreshCw size={24} color="var(--accent-cyan)" className="glow-animation" />
                  <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                    {uploadProgress}%
                  </span>
                </div>
              )}
            </div>

            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '12px', fontFamily: 'var(--font-mono)' }}>
              Hardware Display Resolution: 128x128 px
            </span>
          </div>

          {/* Upload Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center' }}>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png, image/jpeg, image/gif"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />

            <button
              className="btn btn-secondary"
              onClick={() => fileInputRef.current?.click()}
              style={{ padding: '12px', width: '100%' }}
            >
              <Upload size={16} />
              <span>Select Image or GIF (128x128)</span>
            </button>

            <button
              className="btn btn-primary"
              onClick={handleUpload}
              disabled={!previewImage || isUploading}
              style={{ padding: '12px', width: '100%' }}
            >
              <Check size={16} />
              <span>{isUploading ? `Uploading (${uploadProgress}%)...` : 'Upload to Keyboard Display'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Clock & Rotary Knob Sync */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} color="var(--accent-cyan)" />
              <span>Real-Time Clock & Status Synchronization</span>
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Sync the keyboard screen's onboard time and date with your computer's local clock
            </p>
          </div>
          <button
            className="btn btn-secondary"
            onClick={handleClock}
          >
            <Clock size={15} />
            <span>Sync Time Now</span>
          </button>
        </div>
        {clockSyncStatus && (
          <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
            ✓ {clockSyncStatus}
          </div>
        )}
      </div>
    </div>
  );
};
