'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, Scan } from 'lucide-react';

interface DiagnosisScannerProps {
  customerName: string;
}

export function DiagnosisScanner({ customerName }: DiagnosisScannerProps) {
  const [progress, setProgress] = useState(0);
  const [currentStatus, setCurrentStatus] = useState('고해상도 안면 이미지 로드 중...');

  useEffect(() => {
    const statuses = [
      { at: 15, text: 'Google MediaPipe 3D 안면 인식 엔진 가동...' },
      { at: 35, text: '468개 안면 랜드마크 키포인트 정밀 추출 중...' },
      { at: 60, text: '상안부 · 중안부 · 하안부 3단 길이 비율 계산 중...' },
      { at: 80, text: '이마 · 광대 · 하악각 안면 윤곽 및 대칭축 분석...' },
      { at: 95, text: '6대 살롱 얼굴형 매칭 및 헤어 솔루션 생성 완료!' },
    ];

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 3;
        const matching = statuses.find((s) => next >= s.at && prev < s.at);
        if (matching) {
          setCurrentStatus(matching.text);
        }
        return next >= 100 ? 100 : next;
      });
    }, 40);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-zinc-950/85 backdrop-blur-md p-6 text-white select-none">
      
      {/* High-Tech Radar Scanning Circle */}
      <div className="relative flex h-48 w-48 items-center justify-center mb-8">
        {/* Outer Rotating Glow Ring */}
        <div className="absolute inset-0 rounded-full border border-amber-400/40 border-t-amber-400 border-r-amber-400 animate-spin" style={{ animationDuration: '3s' }} />
        <div className="absolute inset-3 rounded-full border border-amber-500/20 border-b-amber-400/60 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
        <div className="absolute inset-8 rounded-full border border-dashed border-amber-300/30 animate-pulse" />

        {/* Center Scanner Icon */}
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-zinc-900/90 border border-amber-400/50 shadow-[0_0_30px_rgba(245,208,97,0.3)]">
          <Scan className="h-10 w-10 text-amber-400 animate-pulse" />
        </div>

        {/* Sweep Scan Line */}
        <div
          className="absolute inset-0 rounded-full overflow-hidden pointer-events-none"
        >
          <div className="w-full h-1/2 bg-gradient-to-b from-amber-400/25 to-transparent animate-sweep" />
        </div>
      </div>

      {/* Progress & Title */}
      <div className="text-center max-w-md w-full">
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/10 border border-amber-400/30 px-3.5 py-1 text-xs font-semibold text-amber-300 mb-3">
          <Sparkles className="h-3.5 w-3.5" />
          <span>AI MediaPipe 랜드마크 분석</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-zinc-100 mb-1">
          {customerName}님의 얼굴형 & 두상 분석 중
        </h3>

        {/* Animated Status Message */}
        <p className="text-xs text-zinc-400 min-h-[20px] mb-6 animate-fade-in font-mono">
          {currentStatus}
        </p>

        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700/60 p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 shadow-[0_0_12px_rgba(245,208,97,0.8)] transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[11px] font-mono text-zinc-500 mt-2 px-1">
          <span>468 POINTS SCAN</span>
          <span className="text-amber-400 font-bold">{progress}%</span>
        </div>
      </div>

    </div>
  );
}
