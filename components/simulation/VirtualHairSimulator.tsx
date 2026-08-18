'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MatchedLookbookItem } from '@/types/lookbook';
import { Sparkles, SlidersHorizontal, Eye, Scissors, Palette, ArrowLeftRight, Check, Heart } from 'lucide-react';

interface VirtualHairSimulatorProps {
  originalImageUrl: string;
  selectedStyles: MatchedLookbookItem[];
  personalColorHex: string;
  onApplyStyle?: (style: MatchedLookbookItem) => void;
}

export function VirtualHairSimulator({
  originalImageUrl,
  selectedStyles,
  personalColorHex,
  onApplyStyle,
}: VirtualHairSimulatorProps) {
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [activeColorTint, setActiveColorTint] = useState<string>(personalColorHex || '#7D7571');
  const [colorIntensity, setColorIntensity] = useState<number>(65); // 0 ~ 100%
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle Dragging
  const handleTouchOrMouseMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const width = rect.width;
    const percentage = Math.max(0, Math.min(100, (x / width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleTouchOrMouseMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    handleTouchOrMouseMove(e.touches[0].clientX);
  };

  return (
    <div className="flex flex-col w-full rounded-3xl border border-zinc-800 bg-zinc-900/90 p-5 sm:p-7 backdrop-blur-md shadow-2xl text-white">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded-full bg-amber-400/20 px-3 py-1 text-xs font-bold text-amber-300 border border-amber-400/30 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              FR-301 AI 가상 헤어 & 컬러 시뮬레이션
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-white">
            실시간 Before / After 헤어스타일 가상 체험
          </h3>
        </div>

        {/* Color Blend Controls */}
        <div className="flex items-center gap-3 rounded-2xl bg-zinc-950 px-4 py-2 border border-zinc-800 self-start sm:self-auto">
          <Palette className="h-4 w-4 text-amber-400" />
          <span className="text-xs text-zinc-400 font-medium">염색 틴트 농도</span>
          <input
            type="range"
            min="20"
            max="90"
            value={colorIntensity}
            onChange={(e) => setColorIntensity(Number(e.target.value))}
            className="w-24 accent-amber-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
          />
          <span className="text-xs font-bold text-amber-300 font-mono">{colorIntensity}%</span>
        </div>
      </div>

      {/* Interactive Split Slider Canvas Area */}
      <div
        ref={containerRef}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={handleMouseMove}
        onTouchStart={() => setIsDragging(true)}
        onTouchEnd={() => setIsDragging(false)}
        onTouchMove={handleTouchMove}
        className="relative aspect-[4/3] sm:aspect-[16/10] w-full select-none overflow-hidden rounded-3xl border-2 border-zinc-800 bg-zinc-950 cursor-ew-resize shadow-2xl"
      >
        {/* Background / After Layer (Simulated Transformation) */}
        <div className="absolute inset-0 h-full w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={originalImageUrl}
            alt="Simulated Transformation"
            className="h-full w-full object-cover"
          />

          {/* Color Matrix Overlay on Hair */}
          <div
            className="absolute inset-0 mix-blend-color pointer-events-none transition-opacity duration-300"
            style={{
              backgroundColor: activeColorTint,
              opacity: colorIntensity / 100,
            }}
          />
          <div
            className="absolute inset-0 mix-blend-soft-light pointer-events-none transition-opacity duration-300"
            style={{
              backgroundColor: activeColorTint,
              opacity: (colorIntensity / 100) * 0.7,
            }}
          />

          {/* After Badge */}
          <div className="absolute bottom-4 right-4 rounded-full bg-black/80 px-3.5 py-1.5 text-xs font-black text-amber-300 border border-amber-400/40 backdrop-blur-md">
            AFTER • AI 스타일 적용
          </div>
        </div>

        {/* Foreground / Before Layer (Original, Clipped) */}
        <div
          className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-amber-400 shadow-[0_0_20px_rgba(245,208,97,0.8)]"
          style={{ width: `${sliderPosition}%` }}
        >
          <div
            className="relative h-full"
            style={{ width: containerRef.current?.offsetWidth || '100%' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={originalImageUrl}
              alt="Original Before"
              className="h-full w-full object-cover"
            />
            {/* Before Badge */}
            <div className="absolute bottom-4 left-4 rounded-full bg-black/80 px-3.5 py-1.5 text-xs font-black text-zinc-300 border border-zinc-700 backdrop-blur-md">
              BEFORE • 원본 상태
            </div>
          </div>
        </div>

        {/* Center Drag Handle */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-amber-400 text-zinc-950 shadow-[0_0_25px_rgba(245,208,97,0.8)] border-2 border-white pointer-events-none z-20"
          style={{ left: `${sliderPosition}%` }}
        >
          <ArrowLeftRight className="h-5 w-5 stroke-[2.5]" />
        </div>
      </div>

      {/* Color Swatch Preset Palette */}
      <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5 border-t border-zinc-800">
        <div>
          <span className="text-xs font-bold text-zinc-300 block mb-2">
            🎨 실시간 염색 컬러 반사빛 변경:
          </span>
          <div className="flex flex-wrap items-center gap-2.5">
            {[
              { name: '스모키 애쉬', hex: '#7D7571' },
              { name: '밀크티 베이지', hex: '#D6B494' },
              { name: '올리브 카키', hex: '#635B47' },
              { name: '블루 블랙', hex: '#161B2E' },
              { name: '로즈 플럼', hex: '#9E6D76' },
              { name: '다크 초콜릿', hex: '#4A3B32' },
            ].map((color) => (
              <button
                key={color.name}
                type="button"
                onClick={() => setActiveColorTint(color.hex)}
                className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition border ${
                  activeColorTint === color.hex
                    ? 'bg-zinc-800 text-amber-300 border-amber-400 shadow-md ring-1 ring-amber-400/50'
                    : 'bg-zinc-950/80 text-zinc-400 border-zinc-800 hover:text-white'
                }`}
              >
                <span
                  className="h-3.5 w-3.5 rounded-full border border-white/30 shadow-inner"
                  style={{ backgroundColor: color.hex }}
                />
                <span>{color.name}</span>
              </button>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-zinc-500 max-w-xs leading-tight">
          💡 슬라이더를 좌우로 드래그하여 전/후 비교 이미지를 고객님과 함께 실시간으로 확인해보세요.
        </p>
      </div>

    </div>
  );
}
