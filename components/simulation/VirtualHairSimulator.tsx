'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MatchedLookbookItem } from '@/types/lookbook';
import { Sparkles, Palette, ArrowLeftRight, Wand2, Loader2 } from 'lucide-react';

interface VirtualHairSimulatorProps {
  originalImageUrl: string;
  selectedStyles: MatchedLookbookItem[];
  personalColorHex: string;
  onApplyStyle?: (style: MatchedLookbookItem) => void;
  onSynthesized?: (url: string) => void;
}

const COLOR_SWATCHES = [
  { name: '스모키 애쉬', hex: '#7D7571' },
  { name: '밀크티 베이지', hex: '#D6B494' },
  { name: '올리브 카키', hex: '#635B47' },
  { name: '블루 블랙', hex: '#161B2E' },
  { name: '로즈 플럼', hex: '#9E6D76' },
  { name: '다크 초콜릿', hex: '#4A3B32' },
] as const;

/** Resize image to maxDim × maxDim while preserving aspect ratio */
function resizeImage(dataUrl: string, maxDim = 768): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const ratio = Math.min(maxDim / img.width, maxDim / img.height, 1);
      const w = Math.round(img.width * ratio);
      const h = Math.round(img.height * ratio);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.src = dataUrl;
  });
}

/**
 * Generate a hair-region mask: white ellipse (top ~35% of frame) on black background.
 * Blurred edges produce smoother SD inpainting transitions.
 */
function generateHairMask(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;

      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.filter = 'blur(20px)';
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.ellipse(
        canvas.width * 0.5,
        canvas.height * 0.18,
        canvas.width * 0.44,
        canvas.height * 0.28,
        0, 0, Math.PI * 2
      );
      ctx.fill();

      resolve(canvas.toDataURL('image/png'));
    };
    img.src = dataUrl;
  });
}

export function VirtualHairSimulator({
  originalImageUrl,
  selectedStyles,
  personalColorHex,
  onApplyStyle,
  onSynthesized,
}: VirtualHairSimulatorProps) {
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [activeColorTint, setActiveColorTint] = useState<string>(personalColorHex || '#7D7571');
  const [colorIntensity, setColorIntensity] = useState<number>(65);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiOutputUrl, setAiOutputUrl] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const updateWidth = () => {
      setContainerWidth(el.offsetWidth);
    };
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(el);
    return () => {
      observer.disconnect();
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const activeSwatch = COLOR_SWATCHES.find((c) => c.hex === activeColorTint);

  const startPolling = (predictionId: string) => {
    let pollCount = 0;
    const MAX_POLLS = 60; // 2 minutes

    pollIntervalRef.current = setInterval(async () => {
      pollCount++;

      if (pollCount > MAX_POLLS) {
        clearInterval(pollIntervalRef.current!);
        pollIntervalRef.current = null;
        setAiError('생성 타임아웃 (2분 초과). 다시 시도해 주세요.');
        setAiGenerating(false);
        return;
      }

      try {
        const res = await fetch(`/api/hair-synthesis?id=${predictionId}`);
        const data = await res.json();

        if (data.status === 'succeeded' && Array.isArray(data.output) && data.output.length > 0) {
          clearInterval(pollIntervalRef.current!);
          pollIntervalRef.current = null;
          setAiOutputUrl(data.output[0]);
          setAiGenerating(false);
          onSynthesized?.(data.output[0]);
        } else if (data.status === 'failed' || data.status === 'canceled') {
          clearInterval(pollIntervalRef.current!);
          pollIntervalRef.current = null;
          setAiError(`생성 실패: ${data.error ?? data.status}`);
          setAiGenerating(false);
        }
        // 'starting' | 'processing' → continue polling
      } catch {
        clearInterval(pollIntervalRef.current!);
        pollIntervalRef.current = null;
        setAiError('폴링 중 네트워크 오류가 발생했습니다.');
        setAiGenerating(false);
      }
    }, 2000);
  };

  const handleAIGenerate = async () => {
    if (!activeSwatch) return;

    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    setAiGenerating(true);
    setAiError(null);
    setAiOutputUrl(null);

    try {
      const [resizedImage, maskDataUrl] = await Promise.all([
        resizeImage(originalImageUrl),
        generateHairMask(originalImageUrl),
      ]);

      const res = await fetch('/api/hair-synthesis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageDataUrl: resizedImage,
          maskDataUrl,
          tintName: activeSwatch.name,
          tintHex: activeSwatch.hex,
          colorIntensity,
        }),
      });

      const data = await res.json();

      if (!data.success || !data.predictionId) {
        setAiError(data.error ?? 'AI 합성 시작 실패');
        setAiGenerating(false);
        return;
      }

      startPolling(data.predictionId);
    } catch {
      setAiError('네트워크 오류. 다시 시도하세요.');
      setAiGenerating(false);
    }
  };

  const handleTouchOrMouseMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
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
              유니헤어샵 AI 가상 헤어 & 컬러 시뮬레이션
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-white">
            실시간 Before / After 헤어스타일 가상 체험
          </h3>
          {selectedStyles && selectedStyles.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[11px] text-zinc-400 font-medium">선택 스타일:</span>
              {selectedStyles.map((style, idx) => (
                <button
                  key={style.id || idx}
                  type="button"
                  onClick={() => onApplyStyle?.(style)}
                  className="rounded-lg bg-amber-400/15 border border-amber-400/30 px-2 py-0.5 text-[11px] font-semibold text-amber-300 hover:bg-amber-400/25 transition"
                >
                  #{style.styleName}
                </button>
              ))}
            </div>
          )}
        </div>

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

      {/* Before / After Split Slider */}
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
        {/* After Layer */}
        <div className="absolute inset-0 h-full w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={aiOutputUrl ?? originalImageUrl}
            alt="Simulated Transformation"
            className="h-full w-full object-cover"
          />

          {!aiOutputUrl && (
            <>
              <div
                className="absolute inset-0 mix-blend-color pointer-events-none transition-opacity duration-300"
                style={{ backgroundColor: activeColorTint, opacity: colorIntensity / 100 }}
              />
              <div
                className="absolute inset-0 mix-blend-soft-light pointer-events-none transition-opacity duration-300"
                style={{ backgroundColor: activeColorTint, opacity: (colorIntensity / 100) * 0.7 }}
              />
            </>
          )}

          {aiGenerating && (
            <div className="absolute inset-0 bg-zinc-950/70 flex flex-col items-center justify-center backdrop-blur-sm">
              <Loader2 className="h-10 w-10 text-amber-400 animate-spin mb-3" />
              <p className="text-xs text-amber-300 font-bold">AI 헤어 합성 중...</p>
              <p className="text-[10px] text-zinc-400 mt-1">약 30~60초 소요됩니다</p>
            </div>
          )}

          <div
            className="absolute bottom-4 right-4 rounded-full bg-black/80 px-3.5 py-1.5 text-xs font-black border backdrop-blur-md"
            style={{
              color: aiOutputUrl ? '#34d399' : '#fcd34d',
              borderColor: aiOutputUrl ? 'rgba(52,211,153,0.4)' : 'rgba(245,208,97,0.4)',
            }}
          >
            {aiOutputUrl ? 'AFTER • AI 합성 결과' : 'AFTER • CSS 프리뷰'}
          </div>
        </div>

        {/* Before Layer */}
        <div
          className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-amber-400 shadow-[0_0_20px_rgba(245,208,97,0.8)]"
          style={{ width: `${sliderPosition}%` }}
        >
          <div
            className="relative h-full"
            style={{ width: containerWidth ? `${containerWidth}px` : '100%' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={originalImageUrl}
              alt="Original Before"
              className="h-full w-full object-cover"
            />
            <div className="absolute bottom-4 left-4 rounded-full bg-black/80 px-3.5 py-1.5 text-xs font-black text-zinc-300 border border-zinc-700 backdrop-blur-md">
              BEFORE • 원본 상태
            </div>
          </div>
        </div>

        {/* Drag Handle */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-amber-400 text-zinc-950 shadow-[0_0_25px_rgba(245,208,97,0.8)] border-2 border-white pointer-events-none z-20"
          style={{ left: `${sliderPosition}%` }}
        >
          <ArrowLeftRight className="h-5 w-5 stroke-[2.5]" />
        </div>
      </div>

      {/* Color Swatches & AI CTA */}
      <div className="mt-6 pt-5 border-t border-zinc-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-zinc-300 block mb-2">
              🎨 실시간 염색 컬러 반사빛 변경:
            </span>
            <div className="flex flex-wrap items-center gap-2.5">
              {COLOR_SWATCHES.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => {
                    setActiveColorTint(color.hex);
                    setAiOutputUrl(null);
                    setAiError(null);
                  }}
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

          <p className="text-[11px] text-zinc-500 max-w-xs leading-tight shrink-0">
            💡 슬라이더를 좌우로 드래그하여 전/후 비교 이미지를 실시간으로 확인하세요.
          </p>
        </div>

        {/* AI Synthesis CTA */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 rounded-2xl bg-zinc-950 border border-zinc-800 p-4">
          <div className="flex-1">
            <p className="text-xs font-bold text-white flex items-center gap-1.5 mb-0.5">
              <Wand2 className="h-3.5 w-3.5 text-amber-400" />
              AI 생성 합성 (FR-301-API · SD Inpainting)
            </p>
            <p className="text-[10px] text-zinc-500 leading-relaxed">
              헤어 마스크를 자동 생성 후 Stable Diffusion Inpainting으로 정밀 합성합니다. 약 30~60초 소요.
            </p>
            {aiError && (
              <p className="text-[10px] text-rose-400 mt-1 font-semibold">{aiError}</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleAIGenerate}
            disabled={aiGenerating}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 px-4 py-2.5 text-xs font-bold text-zinc-950 hover:brightness-105 disabled:opacity-50 transition"
          >
            {aiGenerating ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>합성 중...</span>
              </>
            ) : aiOutputUrl ? (
              <>
                <Wand2 className="h-3.5 w-3.5" />
                <span>다시 합성</span>
              </>
            ) : (
              <>
                <Wand2 className="h-3.5 w-3.5" />
                <span>AI 헤어 합성</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
