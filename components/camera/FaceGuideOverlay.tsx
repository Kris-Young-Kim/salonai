'use client';

import React from 'react';
import { GuideMode } from '@/types/camera';

interface FaceGuideOverlayProps {
  mode: GuideMode;
  isCapturing?: boolean;
}

export function FaceGuideOverlay({ mode, isCapturing = false }: FaceGuideOverlayProps) {
  if (mode === 'off') return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center overflow-hidden">
      {/* 3x3 Grid Overlay */}
      {(mode === 'grid' || mode === 'standard') && (
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-25">
          <div className="border-r border-b border-white/40" />
          <div className="border-r border-b border-white/40" />
          <div className="border-b border-white/40" />
          <div className="border-r border-b border-white/40" />
          <div className="border-r border-b border-white/40" />
          <div className="border-b border-white/40" />
          <div className="border-r border-white/40" />
          <div className="border-r border-white/40" />
          <div />
        </div>
      )}

      {/* Main Oval Face Guide and Proportion Markers */}
      <svg
        viewBox="0 0 400 500"
        className={`w-full max-w-[340px] md:max-w-[420px] lg:max-w-[460px] h-auto transition-all duration-300 ${
          isCapturing ? 'scale-95 opacity-90' : 'opacity-85'
        }`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F5D061" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#E6AF2E" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#F5D061" stopOpacity="0.9" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Central Vertical Symmetry Axis */}
        <line
          x1="200"
          y1="50"
          x2="200"
          y2="450"
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth="1"
          strokeDasharray="4 4"
        />

        {/* Golden Ratio Oval (얼굴형 가이드) */}
        <ellipse
          cx="200"
          cy="250"
          rx="125"
          ry="165"
          stroke="url(#goldGradient)"
          strokeWidth="2.5"
          filter="url(#glow)"
          strokeDasharray={mode === 'minimal' ? 'none' : 'none'}
        />

        {/* Outer Head/Shoulder Silhouette Guide (미세 실루엣) */}
        {mode === 'standard' && (
          <path
            d="M 60 490 C 80 430, 110 400, 135 390 C 150 425, 250 425, 265 390 C 290 400, 320 430, 340 490"
            stroke="rgba(255, 255, 255, 0.25)"
            strokeWidth="1.5"
            strokeDasharray="5 5"
          />
        )}

        {/* Standard Detailed Guides: 3 Facial Zones & Eye Level */}
        {mode === 'standard' && (
          <>
            {/* 1. Hairline / Top of Forehead (상안부 상단: y=135) */}
            <line
              x1="120"
              y1="135"
              x2="280"
              y2="135"
              stroke="rgba(255, 255, 255, 0.35)"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <text x="290" y="139" fill="rgba(255, 255, 255, 0.6)" fontSize="10" fontFamily="Pretendard">
              헤어라인
            </text>

            {/* 2. Eye/Pupil Level & Balance (눈 수평선: y=210) */}
            <line
              x1="90"
              y1="210"
              x2="310"
              y2="210"
              stroke="#F5D061"
              strokeWidth="1.2"
              strokeOpacity="0.85"
            />
            {/* Eye Crosshairs */}
            <circle cx="155" cy="210" r="14" stroke="#F5D061" strokeWidth="1" strokeOpacity="0.7" fill="none" />
            <circle cx="155" cy="210" r="2" fill="#F5D061" />
            <circle cx="245" cy="210" r="14" stroke="#F5D061" strokeWidth="1" strokeOpacity="0.7" fill="none" />
            <circle cx="245" cy="210" r="2" fill="#F5D061" />
            <text x="320" y="214" fill="#F5D061" fontSize="10" fontWeight="600" fontFamily="Pretendard">
              눈 수평선
            </text>

            {/* 3. Subnasale / Base of Nose (중안부 하단 / 코끝: y=285) */}
            <line
              x1="130"
              y1="285"
              x2="270"
              y2="285"
              stroke="rgba(255, 255, 255, 0.35)"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <text x="280" y="289" fill="rgba(255, 255, 255, 0.6)" fontSize="10" fontFamily="Pretendard">
              코끝선
            </text>

            {/* 4. Menton / Chin Tip (하안부 하단 / 턱끝: y=385) */}
            <line
              x1="145"
              y1="385"
              x2="255"
              y2="385"
              stroke="rgba(255, 255, 255, 0.45)"
              strokeWidth="1.2"
            />
            <text x="265" y="389" fill="rgba(255, 255, 255, 0.6)" fontSize="10" fontFamily="Pretendard">
              턱끝선
            </text>
          </>
        )}

        {/* 4 Corner Markers for Pro View */}
        <path d="M 50 70 L 50 50 L 70 50" stroke="#F5D061" strokeWidth="2" strokeLinecap="round" />
        <path d="M 350 70 L 350 50 L 330 50" stroke="#F5D061" strokeWidth="2" strokeLinecap="round" />
        <path d="M 50 430 L 50 450 L 70 450" stroke="#F5D061" strokeWidth="2" strokeLinecap="round" />
        <path d="M 350 430 L 350 450 L 330 450" stroke="#F5D061" strokeWidth="2" strokeLinecap="round" />
      </svg>

      {/* Floating Guidance Badge */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 rounded-full bg-black/65 px-4 py-1.5 backdrop-blur-md border border-white/15 text-xs md:text-sm font-medium text-amber-200/90 shadow-lg flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        정면을 바라보고 눈 위치를 노란색 수평선에 맞춰주세요
      </div>
    </div>
  );
}
