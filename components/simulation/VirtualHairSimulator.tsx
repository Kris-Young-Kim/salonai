'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { MatchedLookbookItem } from '@/types/lookbook';
import {
  Sparkles,
  Palette,
  ArrowLeftRight,
  Wand2,
  Loader2,
  Check,
  RotateCcw,
  SlidersHorizontal,
  Flame,
  Clock,
  Layers,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { generateRefinedHairMask } from '@/lib/ai/hairMaskGenerator';
import { getHairPromptConfig } from '@/lib/data/hairPromptMap';

interface VirtualHairSimulatorProps {
  originalImageUrl: string;
  selectedStyles: MatchedLookbookItem[];
  personalColorHex: string;
  initialStyle?: MatchedLookbookItem | null;
  onApplyStyle?: (style: MatchedLookbookItem) => void;
  onSynthesized?: (url: string) => void;
}

const SALON_PREVIEW_COLORS = [
  { name: '스모키 애쉬', hex: '#68625E', tone: '쿨톤 추천' },
  { name: '밀크티 베이지', hex: '#C2A383', tone: '웜톤 추천' },
  { name: '올리브 매트 카키', hex: '#58513E', tone: '가을 웜톤' },
  { name: '미드나잇 블루블랙', hex: '#161928', tone: '겨울 쿨톤' },
  { name: '로즈 와인 플럼', hex: '#7D4353', tone: '여름 쿨톤' },
  { name: '다크 에스프레소', hex: '#3B2A23', tone: '내추럴 웜톤' },
] as const;

/** Resize image to maxDim × maxDim while preserving aspect ratio */
function resizeImage(dataUrl: string, maxDim = 768): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
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

export function VirtualHairSimulator({
  originalImageUrl,
  selectedStyles,
  personalColorHex,
  initialStyle,
  onApplyStyle,
  onSynthesized,
}: VirtualHairSimulatorProps) {
  // 모드 전환: 'live' (0.1초 캔버스 틴트) vs 'ai' (생성형 AI 인페인팅)
  const [simulationMode, setSimulationMode] = useState<'live' | 'ai'>('live');

  // 활성화된 헤어 스타일
  const [activeStyle, setActiveStyle] = useState<MatchedLookbookItem | null>(
    initialStyle || (selectedStyles && selectedStyles.length > 0 ? selectedStyles[0] : null)
  );

  // 활성화된 조색 컬러
  const [activeColorTint, setActiveColorTint] = useState<string>(
    personalColorHex || SALON_PREVIEW_COLORS[0].hex
  );
  const [colorIntensity, setColorIntensity] = useState<number>(70); // 20 ~ 100%

  // Before / After 슬라이더
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);

  // AI 인페인팅 상태
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiOutputUrl, setAiOutputUrl] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const liveCanvasRef = useRef<HTMLCanvasElement>(null);
  const maskCacheRef = useRef<string | null>(null);

  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // external initialStyle 변경 동기화
  useEffect(() => {
    if (initialStyle) {
      setActiveStyle(initialStyle);
    }
  }, [initialStyle]);

  // ─── 0.1초 실시간 캔버스 컬러 틴트 렌더링 ────────────────────────────────
  useEffect(() => {
    const canvas = liveCanvasRef.current;
    if (!canvas || !originalImageUrl) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // 1. 원본 이미지 드로잉
      ctx.clearRect(0, 0, img.width, img.height);
      ctx.drawImage(img, 0, 0);

      // 2. 모발 영역에 부드러운 살롱 틴트 레이어 합성
      ctx.save();
      const styleConfig = getHairPromptConfig(activeStyle?.id || activeStyle?.styleName);
      const { foreheadCoverage, sideExtension, bottomExtension } = styleConfig.maskConfig;

      const w = img.width;
      const h = img.height;

      // 헤어 마스크 영역 Radial Gradient 생성
      const hairGrad = ctx.createRadialGradient(
        w * 0.5,
        h * 0.18,
        w * 0.1,
        w * 0.5,
        h * 0.38,
        w * 0.45 * sideExtension
      );
      hairGrad.addColorStop(0, activeColorTint);
      hairGrad.addColorStop(0.7, activeColorTint);
      hairGrad.addColorStop(1, 'transparent');

      // 'soft-light' 및 'color' 블렌드 모드로 자연스러운 모발 질감 보존
      ctx.globalCompositeOperation = 'soft-light';
      ctx.globalAlpha = colorIntensity / 100;
      ctx.fillStyle = hairGrad;

      // 두상 상단 및 사이드 헤어 영역에 틴트 칠하기
      ctx.beginPath();
      ctx.ellipse(w * 0.5, h * 0.22, w * 0.42 * sideExtension, h * 0.28, 0, 0, Math.PI * 2);
      ctx.fill();

      if (bottomExtension > 0.3) {
        // 어깨 / 롱헤어 사이드 틴트
        ctx.beginPath();
        ctx.ellipse(w * 0.2, h * (0.42 + bottomExtension * 0.2), w * 0.18, h * 0.3, 0, 0, Math.PI * 2);
        ctx.ellipse(w * 0.8, h * (0.42 + bottomExtension * 0.2), w * 0.18, h * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // 두 번째 패스: 'color' 블렌딩으로 광택 색소 정착
      ctx.globalCompositeOperation = 'color';
      ctx.globalAlpha = (colorIntensity / 100) * 0.55;
      ctx.fillStyle = activeColorTint;
      ctx.beginPath();
      ctx.ellipse(w * 0.5, h * 0.2, w * 0.38 * sideExtension, h * 0.24, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    img.src = originalImageUrl;
  }, [originalImageUrl, activeStyle, activeColorTint, colorIntensity]);

  // ─── AI 인페인팅 생성 파이프라인 ──────────────────────────────────────────
  const startTimer = () => {
    setElapsedSeconds(0);
    timerRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleCancelAi = () => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    pollIntervalRef.current = null;
    stopTimer();
    setAiGenerating(false);
    setElapsedSeconds(0);
  };

  const startPolling = (predictionId: string) => {
    let pollCount = 0;
    const MAX_POLLS = 60; // 2 minutes

    pollIntervalRef.current = setInterval(async () => {
      pollCount++;

      if (pollCount > MAX_POLLS) {
        clearInterval(pollIntervalRef.current!);
        pollIntervalRef.current = null;
        stopTimer();
        setAiError('생성 요청 시간이 초과되었습니다 (2분). 네트워크 상태를 확인해주세요.');
        setAiGenerating(false);
        return;
      }

      try {
        const res = await fetch(`/api/hair-synthesis?id=${predictionId}`);
        const data = await res.json();

        if (data.status === 'succeeded' && Array.isArray(data.output) && data.output.length > 0) {
          clearInterval(pollIntervalRef.current!);
          pollIntervalRef.current = null;
          stopTimer();
          setAiOutputUrl(data.output[0]);
          setAiGenerating(false);
          setSimulationMode('ai');
          onSynthesized?.(data.output[0]);
        } else if (data.status === 'failed' || data.status === 'canceled') {
          clearInterval(pollIntervalRef.current!);
          pollIntervalRef.current = null;
          stopTimer();
          setAiError(`AI 생성 실패: ${data.error ?? data.status}`);
          setAiGenerating(false);
        }
      } catch {
        clearInterval(pollIntervalRef.current!);
        pollIntervalRef.current = null;
        stopTimer();
        setAiError('상태 확인 중 네트워크 오류가 발생했습니다.');
        setAiGenerating(false);
      }
    }, 2000);
  };

  const handleGenerateAiHair = async () => {
    if (aiGenerating) return;

    setAiGenerating(true);
    setAiError(null);
    setAiOutputUrl(null);
    startTimer();

    try {
      // 1. 이미지 리사이징 (768px)
      const resizedImg = await resizeImage(originalImageUrl, 768);

      // 2. 헤어 마스크 생성
      const styleConfig = getHairPromptConfig(activeStyle?.id || activeStyle?.styleName);
      const maskDataUrl = await generateRefinedHairMask(resizedImg, { styleConfig });
      maskCacheRef.current = maskDataUrl;

      // 3. Replicate Inpainting API 요청
      const res = await fetch('/api/hair-synthesis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageDataUrl: resizedImg,
          maskDataUrl,
          tintHex: activeColorTint,
          colorIntensity,
          styleId: activeStyle?.id,
          styleName: activeStyle?.styleName,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success || !data.predictionId) {
        throw new Error(data.error || 'AI 서버 생성 요청 실패');
      }

      // 4. 폴링 시작
      startPolling(data.predictionId);
    } catch (err: any) {
      stopTimer();
      setAiError(err?.message || '가상 헤어 생성 중 오류가 발생했습니다.');
      setAiGenerating(false);
    }
  };

  // 슬라이더 인터랙션 핸들러
  const handlePointerDown = () => setIsDraggingSlider(true);
  const handlePointerUp = () => setIsDraggingSlider(false);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDraggingSlider || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pos = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(pos);
    },
    [isDraggingSlider]
  );

  const activeColorObj =
    SALON_PREVIEW_COLORS.find((c) => c.hex.toLowerCase() === activeColorTint.toLowerCase()) || {
      name: '퍼스널 맞춤 컬러',
      hex: activeColorTint,
      tone: 'CIE-Lab 분석',
    };

  return (
    <div className="flex flex-col w-full rounded-3xl border border-zinc-800 bg-zinc-900/90 p-4 sm:p-7 backdrop-blur-md shadow-2xl text-white">
      {/* ── 상단 헤더 & 모드 스위처 ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded-full bg-amber-400/20 px-3 py-1 text-xs font-bold text-amber-300 border border-amber-400/30 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              살롱 Pro AI 듀얼 시뮬레이터
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-white">
            {simulationMode === 'live' ? '0.1초 실시간 살롱 조색 시뮬레이션' : '초고화질 AI 생성형 헤어 시뮬레이션'}
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            {simulationMode === 'live'
              ? '고객님의 모발에 퍼스널 컬러와 프리미엄 염색약 조색을 즉시 입혀봅니다.'
              : '추천 헤어스타일 컷/펌 디자인을 Stable Diffusion 딥러닝으로 포토리얼리스틱 합성합니다.'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex rounded-2xl bg-zinc-950 p-1 border border-zinc-800 self-start sm:self-auto shrink-0 shadow-lg">
          <button
            type="button"
            onClick={() => setSimulationMode('live')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition ${
              simulationMode === 'live'
                ? 'bg-amber-400 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Palette className="h-3.5 w-3.5" />
            <span>0.1초 실시간 조색</span>
          </button>
          <button
            type="button"
            onClick={() => setSimulationMode('ai')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition ${
              simulationMode === 'ai'
                ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Wand2 className="h-3.5 w-3.5" />
            <span>포토리얼 AI 합성</span>
          </button>
        </div>
      </div>

      {/* ── 메인 뷰포트 (인터랙티브 Before/After 분할 슬라이더) ───────────────── */}
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="relative aspect-[3/4] sm:aspect-[4/3] w-full select-none overflow-hidden rounded-3xl border-2 border-zinc-800 bg-zinc-950 shadow-2xl mb-6 touch-none"
      >
        {/* Layer 1: Base Original Image (Left Side) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={originalImageUrl}
          alt="고객 원본 사진"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Layer 2: Simulated Result Image (Right Side - Live Canvas or AI Output) */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
        >
          {simulationMode === 'live' || !aiOutputUrl ? (
            <canvas ref={liveCanvasRef} className="h-full w-full object-cover" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={aiOutputUrl}
              alt="AI 시뮬레이션 합성 결과"
              className="h-full w-full object-cover"
            />
          )}
        </div>

        {/* Split Divider Slider Line */}
        <div
          onPointerDown={handlePointerDown}
          className="absolute inset-y-0 cursor-ew-resize z-20 touch-none flex items-center justify-center"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="w-0.5 h-full bg-amber-400 shadow-[0_0_15px_rgba(245,208,97,0.95)]" />
          <div className="absolute top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-amber-400 text-zinc-950 font-black shadow-2xl border-2 border-zinc-950 active:scale-95 transition-transform">
            <ArrowLeftRight className="h-4 w-4" />
          </div>
        </div>

        {/* Before / After Labels */}
        <div className="absolute top-4 left-4 rounded-xl bg-black/75 px-3 py-1 text-[11px] font-bold text-zinc-300 backdrop-blur-md border border-white/15 pointer-events-none">
          BEFORE (원본)
        </div>
        <div className="absolute top-4 right-4 rounded-xl bg-amber-400/90 px-3 py-1 text-[11px] font-black text-zinc-950 backdrop-blur-md border border-amber-300 pointer-events-none">
          AFTER ({simulationMode === 'live' ? '실시간 조색' : 'AI 합성'})
        </div>

        {/* Active Applied Style & Tint Status Badge */}
        <div className="absolute bottom-4 left-4 right-4 sm:right-auto rounded-2xl bg-zinc-950/90 border border-zinc-800/90 p-3.5 backdrop-blur-md flex items-center justify-between gap-4 shadow-xl z-10">
          <div className="flex items-center gap-3">
            <span
              className="h-6 w-6 rounded-xl border border-white/30 shadow-md shrink-0"
              style={{ backgroundColor: activeColorTint }}
            />
            <div>
              <span className="text-[10px] text-zinc-400 block leading-tight">적용 중인 스타일 & 조색</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-amber-300">
                  {activeStyle?.styleName || '기본 스타일'}
                </span>
                <span className="text-[11px] text-zinc-300 font-semibold">
                  • {activeColorObj.name}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Inpainting Loading Overlay */}
        {aiGenerating && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/85 p-6 backdrop-blur-md text-center animate-in fade-in duration-200">
            <div className="relative mb-5">
              <div className="h-16 w-16 rounded-3xl bg-amber-400/20 flex items-center justify-center animate-pulse border border-amber-400/40">
                <Wand2 className="h-8 w-8 text-amber-400 animate-spin" />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-zinc-950 font-bold text-[10px]">
                AI
              </span>
            </div>

            <h4 className="text-base sm:text-lg font-black text-white mb-1">
              {activeStyle?.styleName || '맞춤 헤어'} 포토리얼리스틱 생성 중...
            </h4>
            <p className="text-xs text-zinc-400 max-w-sm mb-4 leading-relaxed">
              {elapsedSeconds < 8
                ? '1단계: 고객 안면 윤곽 및 모발 마스크 정밀 분할 중'
                : elapsedSeconds < 20
                ? '2단계: Stable Diffusion 인페인팅 고화질 텍스처 합성 중'
                : '3단계: 피부톤 조화 및 자연스러운 블렌딩 마무리 중'}
            </p>

            {/* Progress Timer & Cancel */}
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs font-mono font-bold text-amber-300">
                ⏱ {elapsedSeconds}초 경과
              </span>
              <button
                type="button"
                onClick={handleCancelAi}
                className="rounded-xl bg-zinc-800 hover:bg-zinc-700 px-3.5 py-1.5 text-xs font-semibold text-zinc-300 transition"
              >
                취소
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── 에러 알림 배너 ─────────────────────────────────────────────────── */}
      {aiError && (
        <div className="mb-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 p-4 flex items-center justify-between gap-3 text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{aiError}</span>
          </div>
          <button
            type="button"
            onClick={() => setAiError(null)}
            className="text-[11px] font-bold text-rose-400 underline shrink-0"
          >
            닫기
          </button>
        </div>
      )}

      {/* ── 컨트롤 1: 살롱 헤어 컬러 조색 & 농도 슬라이더 ────────────────── */}
      <div className="mb-6 rounded-3xl bg-zinc-950 p-5 border border-zinc-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-bold text-zinc-100">살롱 시그니처 조색 컬러 체인지 (0.1초 즉시 반응)</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-400">발색 강도:</span>
            <span className="font-mono font-bold text-amber-300">{colorIntensity}%</span>
          </div>
        </div>

        {/* Color Palette Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {SALON_PREVIEW_COLORS.map((col) => {
            const isSelected = activeColorTint.toLowerCase() === col.hex.toLowerCase();
            return (
              <button
                key={col.hex}
                type="button"
                onClick={() => setActiveColorTint(col.hex)}
                className={`flex items-center gap-2.5 rounded-2xl p-2.5 border text-left transition ${
                  isSelected
                    ? 'border-amber-400 bg-amber-400/15 shadow-md'
                    : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-900'
                }`}
              >
                <span
                  className="h-6 w-6 rounded-xl border border-white/20 shadow-sm shrink-0"
                  style={{ backgroundColor: col.hex }}
                />
                <div className="min-w-0">
                  <span className="text-xs font-bold text-zinc-200 block truncate">{col.name}</span>
                  <span className="text-[10px] text-zinc-500 font-medium">{col.tone}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Intensity Range Slider */}
        <div className="pt-2 border-t border-zinc-800/80">
          <input
            type="range"
            min="20"
            max="100"
            value={colorIntensity}
            onChange={(e) => setColorIntensity(Number(e.target.value))}
            className="w-full accent-amber-400 h-2 bg-zinc-800 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* ── 컨트롤 2: 추천 스타일 선택 및 포토리얼 AI 생성 액션 ─────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-bold text-zinc-100">
              시뮬레이션 대상 헤어 디자인 선택 ({selectedStyles.length}종)
            </span>
          </div>

          {/* AI Generate CTA Button */}
          <button
            type="button"
            disabled={aiGenerating}
            onClick={handleGenerateAiHair}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:brightness-105 active:scale-95 px-5 py-2.5 text-xs sm:text-sm font-black text-zinc-950 shadow-[0_0_25px_rgba(245,208,97,0.35)] transition disabled:opacity-50 disabled:pointer-events-none shrink-0"
          >
            {aiGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>AI 인페인팅 생성 중...</span>
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                <span>선택 스타일 초고화질 AI 생성</span>
              </>
            )}
          </button>
        </div>

        {/* Selected Styles List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {selectedStyles.map((item) => {
            const isSelected = activeStyle?.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => {
                  setActiveStyle(item);
                  onApplyStyle?.(item);
                }}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition ${
                  isSelected
                    ? 'border-amber-400 bg-zinc-900 shadow-lg ring-1 ring-amber-400/40'
                    : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrl}
                  alt={item.styleName}
                  className="h-12 w-12 rounded-xl object-cover border border-zinc-700 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-xs font-bold text-white truncate">{item.styleName}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-amber-400 shrink-0" />}
                  </div>
                  <p className="text-[10px] text-zinc-400 truncate">{item.styleNameEn}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
