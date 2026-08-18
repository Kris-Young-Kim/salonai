'use client';

import React from 'react';

interface CountdownOverlayProps {
  countdown: number | null;
  isFlashing: boolean;
}

export function CountdownOverlay({ countdown, isFlashing }: CountdownOverlayProps) {
  return (
    <>
      {/* Shutter Flash Animation */}
      {isFlashing && (
        <div className="absolute inset-0 z-50 bg-white animate-out fade-out duration-300 pointer-events-none" />
      )}

      {/* Countdown Number Badge */}
      {countdown !== null && countdown > 0 && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
          <div className="flex flex-col items-center gap-3">
            <div
              key={countdown}
              className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-amber-400 bg-black/70 text-7xl font-bold text-amber-300 shadow-[0_0_50px_rgba(245,208,97,0.6)] animate-ping-once"
              style={{
                animation: 'scaleUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              }}
            >
              {countdown}
            </div>
            <p className="text-sm font-medium tracking-wide text-white/90 drop-shadow">
              움직이지 마시고 카메라를 응시해주세요
            </p>
          </div>
        </div>
      )}
    </>
  );
}
