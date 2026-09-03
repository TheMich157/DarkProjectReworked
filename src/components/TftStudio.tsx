import React, { useState } from 'react';
import { DeviceDefinition, KeyboardProfile } from '../core/types';
import { Tv, Upload, Clock, Image, Sparkles, Check } from 'lucide-react';

interface TftStudioProps {
  device: DeviceDefinition;
  profile: KeyboardProfile;
  onChangeProfile: (profile: KeyboardProfile) => void;
}

export const TftStudio: React.FC<TftStudioProps> = ({
  device,
  profile,
  onChangeProfile,
}) => {
  const [displayMode, setDisplayMode] = useState<'image' | 'clock' | 'system_info'>('image');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-6 px-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: TFT Screen Frame & Real-time Live Preview (6 cols) */}
        <div className="lg:col-span-6 glass-panel p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <Tv className="w-5 h-5 text-cyan-400" />
              <h3 className="font-display font-bold text-base text-white">
                {device.displayName} TFT Display
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">240x240 LCD</span>
          </div>

          {/* Screen Bezel Simulation */}
          <div className="relative w-64 h-64 mx-auto bg-[#0a0c14] rounded-2xl border-4 border-[#222738] p-3 shadow-2xl flex flex-col items-center justify-center overflow-hidden">
            {displayMode === 'image' ? (
              previewImage ? (
                <img
                  src={previewImage}
                  alt="TFT Custom Display"
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-cyan-950 via-[#0a0d1a] to-blue-950 rounded-xl flex flex-col items-center justify-center p-4 text-center border border-cyan-500/20">
                  <Sparkles className="w-8 h-8 text-cyan-400 mb-2 animate-pulse-subtle" />
                  <p className="text-xs font-display font-bold text-white">DARK PROJECT</p>
                  <p className="text-[10px] text-cyan-300 font-mono mt-1">Smart OLED / TFT</p>
                </div>
              )
            ) : displayMode === 'clock' ? (
              <div className="w-full h-full bg-[#070910] rounded-xl flex flex-col items-center justify-center p-4 border border-white/10">
                <Clock className="w-6 h-6 text-cyan-400 mb-2" />
                <p className="text-2xl font-mono font-bold text-white">17:42</p>
                <p className="text-[10px] font-mono text-slate-400 mt-1">FRI, SEP 03</p>
              </div>
            ) : (
              <div className="w-full h-full bg-[#070910] rounded-xl flex flex-col items-center justify-center p-4 border border-white/10 space-y-2">
                <p className="text-[10px] font-mono text-cyan-400">CPU TEMP: 48°C</p>
                <p className="text-[10px] font-mono text-emerald-400">GPU LOAD: 32%</p>
                <p className="text-[10px] font-mono text-violet-400">PROFILE: P1 (FPS)</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Upload & Mode Picker (6 cols) */}
        <div className="lg:col-span-6 glass-panel p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="font-display font-bold text-base text-white">
              Display Mode & Assets
            </h3>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'image', label: 'Custom Image / GIF', icon: <Image className="w-4 h-4" /> },
              { id: 'clock', label: 'Live Clock', icon: <Clock className="w-4 h-4" /> },
              { id: 'system_info', label: 'Hardware Stats', icon: <Tv className="w-4 h-4" /> },
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setDisplayMode(mode.id as any)}
                className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                  displayMode === mode.id
                    ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-md shadow-cyan-500/10'
                    : 'bg-[#121520] border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {mode.icon}
                <span className="text-xs font-semibold text-center">{mode.label}</span>
              </button>
            ))}
          </div>

          {displayMode === 'image' && (
            <div className="space-y-3 p-4 rounded-xl bg-[#121520] border border-white/5">
              <label className="text-xs font-semibold text-white block">
                Upload Custom Image or Animated GIF:
              </label>
              <div className="border-2 border-dashed border-white/15 rounded-xl p-6 text-center hover:border-cyan-400/50 transition-all cursor-pointer">
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/gif"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="tft-file-upload"
                />
                <label
                  htmlFor="tft-file-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="w-6 h-6 text-cyan-400" />
                  <span className="text-xs text-slate-300 font-medium">
                    Click to select GIF / PNG / JPEG (240x240 recommended)
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
