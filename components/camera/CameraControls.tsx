'use client';

import React from 'react';
import {
  Camera,
  Timer,
  FlipHorizontal,
  SwitchCamera,
  Grid,
  Upload,
  Sparkles,
} from 'lucide-react';
import { GuideMode, TimerMode, FacingMode, CameraDevice } from '@/types/camera';

interface CameraControlsProps {
  onCapture: () => void;
  isCapturing: boolean;
  disabled?: boolean;
  timerMode: TimerMode;
  onTimerChange: (mode: TimerMode) => void;
  guideMode: GuideMode;
  onGuideChange: (mode: GuideMode) => void;
  isMirrored: boolean;
  onToggleMirror: () => void;
  facingMode: FacingMode;
  onSwitchCamera: () => void;
  availableDevices: CameraDevice[];
  currentDeviceId: string | null;
  onSelectDevice: (deviceId: string) => void;
  onUploadClick: () => void;
}

export function CameraControls({
  onCapture,
  isCapturing,
  disabled = false,
  timerMode,
  onTimerChange,
  guideMode,
  onGuideChange,
  isMirrored,
  onToggleMirror,
  facingMode,
  onSwitchCamera,
  availableDevices,
  currentDeviceId,
  onSelectDevice,
  onUploadClick,
}: CameraControlsProps) {
  const nextTimer = () => {
    if (timerMode === 0) onTimerChange(3);
    else if (timerMode === 3) onTimerChange(5);
    else onTimerChange(0);
  };

  const nextGuide = () => {
    if (guideMode === 'standard') onGuideChange('minimal');
    else if (guideMode === 'minimal') onGuideChange('grid');
    else if (guideMode === 'grid') onGuideChange('off');
    else onGuideChange('standard');
  };

  return (
    <div className="w-full bg-gradient-to-t from-black/95 via-black/80 to-transparent p-4 pb-6 md:pb-8 pt-8">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-2 px-2 sm:px-6">
        
        {/* Left Action Cluster */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* File Upload Fallback */}
          <button
            type="button"
            onClick={onUploadClick}
            className="flex flex-col items-center justify-center h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-zinc-900/80 border border-zinc-700/60 text-zinc-300 hover:text-white hover:bg-zinc-800 transition active:scale-95 shadow-md"
            title="사진 파일 업로드"
          >
            <Upload className="h-5 w-5" />
            <span className="text-[10px] mt-0.5 font-medium text-zinc-400">파일</span>
          </button>

          {/* Shutter Timer Toggle */}
          <button
            type="button"
            onClick={nextTimer}
            className={`relative flex flex-col items-center justify-center h-12 w-12 sm:h-14 sm:w-14 rounded-2xl border transition active:scale-95 shadow-md ${
              timerMode > 0
                ? 'bg-amber-500/20 border-amber-400/80 text-amber-300'
                : 'bg-zinc-900/80 border-zinc-700/60 text-zinc-300 hover:text-white hover:bg-zinc-800'
            }`}
            title="타이머 설정"
          >
            <Timer className="h-5 w-5" />
            <span className="text-[10px] mt-0.5 font-medium">
              {timerMode === 0 ? '즉시' : `${timerMode}초`}
            </span>
          </button>
        </div>

        {/* Center: Main Shutter Button */}
        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={onCapture}
            disabled={disabled || isCapturing}
            aria-label="사진 촬영"
            className="group relative flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full transition-transform active:scale-90 disabled:opacity-50 disabled:pointer-events-none"
          >
            {/* Outer Glowing Ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 opacity-80 blur-sm group-hover:opacity-100 group-hover:blur transition" />
            
            {/* Outer Border Ring */}
            <div className="absolute inset-1 rounded-full border-2 border-white/80 bg-zinc-950/60" />
            
            {/* Inner Shutter Core */}
            <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 via-amber-400 to-yellow-500 text-zinc-950 shadow-inner group-hover:scale-105 transition-all">
              <Camera className="h-7 w-7 text-zinc-950 drop-shadow-sm" />
            </div>
          </button>
        </div>

        {/* Right Action Cluster */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Guide Mode Toggle */}
          <button
            type="button"
            onClick={nextGuide}
            className={`flex flex-col items-center justify-center h-12 w-12 sm:h-14 sm:w-14 rounded-2xl border transition active:scale-95 shadow-md ${
              guideMode !== 'off'
                ? 'bg-amber-500/20 border-amber-400/80 text-amber-300'
                : 'bg-zinc-900/80 border-zinc-700/60 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
            title="가이드 모드 변경"
          >
            <Grid className="h-5 w-5" />
            <span className="text-[10px] mt-0.5 font-medium">
              {guideMode === 'standard' ? '표준' : guideMode === 'minimal' ? '간략' : guideMode === 'grid' ? '격자' : '끄기'}
            </span>
          </button>

          {/* Mirror Flip Toggle */}
          <button
            type="button"
            onClick={onToggleMirror}
            className={`hidden sm:flex flex-col items-center justify-center h-12 w-12 sm:h-14 sm:w-14 rounded-2xl border transition active:scale-95 shadow-md ${
              isMirrored
                ? 'bg-amber-500/20 border-amber-400/80 text-amber-300'
                : 'bg-zinc-900/80 border-zinc-700/60 text-zinc-300 hover:text-white hover:bg-zinc-800'
            }`}
            title="좌우 반전"
          >
            <FlipHorizontal className="h-5 w-5" />
            <span className="text-[10px] mt-0.5 font-medium">좌우반전</span>
          </button>

          {/* Camera Switch (Front <-> Back or device switcher) */}
          <button
            type="button"
            onClick={onSwitchCamera}
            className="flex flex-col items-center justify-center h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-zinc-900/80 border border-zinc-700/60 text-zinc-300 hover:text-white hover:bg-zinc-800 transition active:scale-95 shadow-md"
            title={`카메라 전환 (현재: ${facingMode === 'user' ? '전면' : '후면'})`}
          >
            <SwitchCamera className="h-5 w-5" />
            <span className="text-[10px] mt-0.5 font-medium text-zinc-300">
              {facingMode === 'user' ? '전면' : '후면'}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
}
