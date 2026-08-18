'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Sparkles,
  SlidersHorizontal,
  ArrowLeftRight,
  Check,
  Palette,
  RotateCcw,
  ZoomIn,
  MoveVertical,
  Layers,
  Scissors,
  Wand2,
} from 'lucide-react';
import { VIRTUAL_HAIR_PIECES, VirtualHairPiece } from '@/lib/data/virtualHairStyles';
import { calculateHairFittingTransform, NormalizedLandmark } from '@/lib/ai/hairFittingMath';

interface RealtimeHairFittingProps {
  originalImageUrl: string;
  landmarks?: NormalizedLandmark[] | null;
  defaultGender?: 'female' | 'male' | 'unisex';
  initialPieceId?: string;
  initialPieceVersion?: number;
  onSelectHairPiece?: (hairPiece: VirtualHairPiece) => void;
  className?: string;
}

const SALON_COLOR_PALETTES = [
  { id: 'natural-black', name: '내추럴 블랙', hex: '#1C1B1F', highlight: '#3A3840' },
  { id: 'dark-brown', name: '초콜릿 브라운', hex: '#3E2723', highlight: '#6D4C41' },
  { id: 'smoky-ash', name: '스모키 애쉬', hex: '#5D5A58', highlight: '#8E8B88' },
  { id: 'milktea-beige', name: '밀크티 베이지', hex: '#B89B7D', highlight: '#DECDBC' },
  { id: 'rose-plum', name: '로즈 와인', hex: '#6A3845', highlight: '#9E5B6D' },
  { id: 'olive-khaki', name: '올리브 매트', hex: '#4A4637', highlight: '#78735C' },
];

export function RealtimeHairFitting({
  originalImageUrl,
  landmarks,
  defaultGender = 'female',
  initialPieceId,
  initialPieceVersion,
  onSelectHairPiece,
  className = '',
}: RealtimeHairFittingProps) {
  const [selectedGender, setSelectedGender] = useState<'female' | 'male'>(
    defaultGender === 'male' ? 'male' : 'female'
  );

  const [activePieceId, setActivePieceId] = useState<string>(
    initialPieceId || (defaultGender === 'male' ? 'vh-m-guile' : 'vh-f-layered-c')
  );

  const [activeColor, setActiveColor] = useState<{ id: string; name: string; hex: string; highlight: string }>(
    SALON_COLOR_PALETTES[1] // Chocolate brown default
  );

  // 미세 조정 슬라이더
  const [manualScale, setManualScale] = useState<number>(100); // 85 ~ 125%
  const [manualOffsetY, setManualOffsetY] = useState<number>(0); // -25 ~ 25px
  const [manualOffsetX, setManualOffsetX] = useState<number>(0); // -20 ~ 20px
  const [opacity, setOpacity] = useState<number>(95); // 60 ~ 100%
  const [showControls, setShowControls] = useState<boolean>(false);

  // Before / After 슬라이더
  const [sliderPosition, setSliderPosition] = useState<number>(100);
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const hairCanvasRef = useRef<HTMLCanvasElement>(null);

  const [containerDim, setContainerDim] = useState<{ width: number; height: number }>({
    width: 600,
    height: 750,
  });

  // 컨테이너 크기 관찰
  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const updateDim = () => {
      if (el.offsetWidth > 0 && el.offsetHeight > 0) {
        setContainerDim({ width: el.offsetWidth, height: el.offsetHeight });
      }
    };
    updateDim();
    const observer = new ResizeObserver(updateDim);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 외부 initialPieceId 변경 시 동기화 (version 포함하여 동일 ID 재요청도 감지)
  useEffect(() => {
    if (initialPieceId) {
      setActivePieceId(initialPieceId);
      const piece = VIRTUAL_HAIR_PIECES.find((p) => p.id === initialPieceId);
      if (piece && (piece.category === 'female' || piece.category === 'male')) {
        setSelectedGender(piece.category);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPieceId, initialPieceVersion]);

  // 랜드마크 기반 자동 변환 계산
  const baseTransform = useMemo(() => {
    return calculateHairFittingTransform(landmarks, containerDim.width, containerDim.height);
  }, [landmarks, containerDim.width, containerDim.height]);

  // 현재 활성화된 헤어피스
  const currentPiece = useMemo(() => {
    return VIRTUAL_HAIR_PIECES.find((p) => p.id === activePieceId) || VIRTUAL_HAIR_PIECES[0];
  }, [activePieceId]);

  // 필터링된 헤어피스 목록
  const filteredPieces = useMemo(() => {
    return VIRTUAL_HAIR_PIECES.filter(
      (p) => p.category === selectedGender || p.category === 'unisex'
    );
  }, [selectedGender]);

  const handleSelectPiece = (piece: VirtualHairPiece) => {
    setActivePieceId(piece.id);
    onSelectHairPiece?.(piece);
  };

  // ─── Canvas 2D 고해상도 모발 텍스처 렌더링 ────────────────────────────────
  useEffect(() => {
    const canvas = hairCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 800;
    const height = 900;
    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    const mainColor = activeColor.hex;
    const highlightColor = activeColor.highlight;

    // Helper: Hex to RGBA
    const hexToRgba = (hex: string, alpha: number) => {
      const c = hex.replace('#', '');
      const r = parseInt(c.substring(0, 2), 16) || 0;
      const g = parseInt(c.substring(2, 4), 16) || 0;
      const b = parseInt(c.substring(4, 6), 16) || 0;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    ctx.save();

    // ─── 1. 드롭 섀도우 (두상/이마 경계면 자연스러운 그림자) ─────────────
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 12;

    const shape = currentPiece.shapeType;

    // ─── 2. 백그라운드 모발 볼륨 베이스 레이어 ────────────────────────────
    const gradBase = ctx.createRadialGradient(
      width * 0.5,
      height * 0.28,
      width * 0.1,
      width * 0.5,
      height * 0.4,
      width * 0.45
    );
    gradBase.addColorStop(0, highlightColor);
    gradBase.addColorStop(0.5, mainColor);
    gradBase.addColorStop(1, hexToRgba('#050505', 0.95));

    ctx.fillStyle = gradBase;
    ctx.beginPath();

    if (shape === 'layered-c-curl') {
      // 소프트 레이어드 C컬 베이스
      ctx.moveTo(width * 0.2, height * 0.35);
      ctx.bezierCurveTo(width * 0.15, height * 0.1, width * 0.85, height * 0.1, width * 0.8, height * 0.35);
      ctx.bezierCurveTo(width * 0.88, height * 0.55, width * 0.85, height * 0.75, width * 0.72, height * 0.88);
      ctx.bezierCurveTo(width * 0.65, height * 0.82, width * 0.68, height * 0.55, width * 0.65, height * 0.42);
      ctx.bezierCurveTo(width * 0.55, height * 0.28, width * 0.45, height * 0.28, width * 0.35, height * 0.42);
      ctx.bezierCurveTo(width * 0.32, height * 0.55, width * 0.35, height * 0.82, width * 0.28, height * 0.88);
      ctx.bezierCurveTo(width * 0.15, height * 0.75, width * 0.12, height * 0.55, width * 0.2, height * 0.35);
    } else if (shape === 'tassel-bob') {
      // 슬릭 태슬 단발 컷
      ctx.moveTo(width * 0.22, height * 0.35);
      ctx.bezierCurveTo(width * 0.18, height * 0.12, width * 0.82, height * 0.12, width * 0.78, height * 0.35);
      ctx.bezierCurveTo(width * 0.82, height * 0.52, width * 0.82, height * 0.68, width * 0.76, height * 0.74);
      ctx.lineTo(width * 0.68, height * 0.72);
      ctx.bezierCurveTo(width * 0.68, height * 0.5, width * 0.62, height * 0.35, width * 0.5, height * 0.32);
      ctx.bezierCurveTo(width * 0.38, height * 0.35, width * 0.32, height * 0.5, width * 0.32, height * 0.72);
      ctx.lineTo(width * 0.24, height * 0.74);
      ctx.bezierCurveTo(width * 0.18, height * 0.68, width * 0.18, height * 0.52, width * 0.22, height * 0.35);
    } else if (shape === 'build-perm' || shape === 'hippie-wave') {
      // 풍성한 엘리자벳/빌드 S웨이브
      ctx.moveTo(width * 0.18, height * 0.35);
      ctx.bezierCurveTo(width * 0.12, height * 0.08, width * 0.88, height * 0.08, width * 0.82, height * 0.35);
      ctx.bezierCurveTo(width * 0.92, height * 0.55, width * 0.88, height * 0.8, width * 0.76, height * 0.95);
      ctx.bezierCurveTo(width * 0.66, height * 0.85, width * 0.7, height * 0.6, width * 0.66, height * 0.44);
      ctx.bezierCurveTo(width * 0.56, height * 0.26, width * 0.44, height * 0.26, width * 0.34, height * 0.44);
      ctx.bezierCurveTo(width * 0.3, height * 0.6, width * 0.34, height * 0.85, width * 0.24, height * 0.95);
      ctx.bezierCurveTo(width * 0.12, height * 0.8, width * 0.08, height * 0.55, width * 0.18, height * 0.35);
    } else if (shape === 'guile-cut' || shape === 'as-perm') {
      // 남성 가일 컷 / 애즈 펌
      ctx.moveTo(width * 0.26, height * 0.4);
      ctx.bezierCurveTo(width * 0.22, height * 0.16, width * 0.78, height * 0.14, width * 0.74, height * 0.38);
      ctx.bezierCurveTo(width * 0.78, height * 0.48, width * 0.74, height * 0.54, width * 0.68, height * 0.52);
      ctx.bezierCurveTo(width * 0.62, height * 0.42, width * 0.58, height * 0.38, width * 0.52, height * 0.36);
      ctx.bezierCurveTo(width * 0.46, height * 0.38, width * 0.38, height * 0.44, width * 0.32, height * 0.52);
      ctx.bezierCurveTo(width * 0.26, height * 0.54, width * 0.22, height * 0.48, width * 0.26, height * 0.4);
    } else {
      // 댄디/아이비리그/기본 볼륨 컷
      ctx.moveTo(width * 0.25, height * 0.38);
      ctx.bezierCurveTo(width * 0.2, height * 0.15, width * 0.8, height * 0.15, width * 0.75, height * 0.38);
      ctx.bezierCurveTo(width * 0.78, height * 0.5, width * 0.72, height * 0.56, width * 0.66, height * 0.5);
      ctx.bezierCurveTo(width * 0.6, height * 0.38, width * 0.4, height * 0.38, width * 0.34, height * 0.5);
      ctx.bezierCurveTo(width * 0.28, height * 0.56, width * 0.22, height * 0.5, width * 0.25, height * 0.38);
    }

    ctx.closePath();
    ctx.fill();

    // ─── 3. 정밀 모발 텍스처 결 드로잉 (Hair Strands Texture) ───────────
    ctx.shadowColor = 'transparent';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const strandCount = 110;
    for (let i = 0; i < strandCount; i++) {
      const t = i / strandCount;
      const startX = width * (0.22 + t * 0.56);
      const startY = height * (0.14 + Math.sin(t * Math.PI) * 0.08);

      ctx.lineWidth = i % 4 === 0 ? 1.8 : 1.1;
      ctx.strokeStyle = i % 4 === 0
        ? hexToRgba(highlightColor, 0.55)
        : i % 2 === 0
        ? hexToRgba(mainColor, 0.75)
        : hexToRgba('#080808', 0.5);

      ctx.beginPath();
      ctx.moveTo(startX, startY);

      if (shape.includes('curl') || shape.includes('wave') || shape.includes('perm')) {
        // 부드러운 S-컬 흐름
        const ctrl1X = startX + (t > 0.5 ? 28 : -28);
        const ctrl1Y = startY + height * 0.24;
        const ctrl2X = startX + (t > 0.5 ? -22 : 22);
        const ctrl2Y = startY + height * 0.46;
        const endX = startX + (t > 0.5 ? 32 : -32);
        const endY = startY + height * 0.62;
        ctx.bezierCurveTo(ctrl1X, ctrl1Y, ctrl2X, ctrl2Y, endX, endY);
      } else {
        // 스트레이트/슬릭/가일 흐름
        const ctrlX = startX + (t > 0.5 ? 14 : -14);
        const ctrlY = startY + height * 0.22;
        const endX = startX + (t > 0.5 ? 18 : -18);
        const endY = startY + height * 0.42;
        ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
      }

      ctx.stroke();
    }

    // ─── 3.1. 헤어라인 잔머리 및 페더링 텍스처 (Natural Baby Hairs) ────────
    for (let b = 0; b < 25; b++) {
      const bt = b / 25;
      const bx = width * (0.35 + bt * 0.3);
      const by = height * 0.24 + Math.sin(bt * Math.PI) * 12;
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = hexToRgba(mainColor, 0.4);
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.quadraticCurveTo(bx + (bt > 0.5 ? 6 : -6), by + 14, bx + (bt > 0.5 ? 10 : -10), by + 24);
      ctx.stroke();
    }

    // ─── 4. 탑 크라운 살롱 광택 하이라이트 (Salon Gloss Sheen) ───────────
    const sheenGrad = ctx.createLinearGradient(
      width * 0.28,
      height * 0.14,
      width * 0.72,
      height * 0.28
    );
    sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    sheenGrad.addColorStop(0.35, hexToRgba('#FFFFFF', 0.32));
    sheenGrad.addColorStop(0.55, hexToRgba(highlightColor, 0.45));
    sheenGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = sheenGrad;
    ctx.beginPath();
    ctx.ellipse(width * 0.5, height * 0.21, width * 0.3, height * 0.08, -0.04, 0, Math.PI * 2);
    ctx.fill();

    // ─── 5. 앞머리 / 사이드뱅 자연스러운 페이스 프레임 ────────────────────
    ctx.fillStyle = hexToRgba(mainColor, 0.88);
    ctx.beginPath();
    if (shape === 'guile-cut') {
      // 가일 7:3 쉼표 가르마
      ctx.moveTo(width * 0.38, height * 0.26);
      ctx.quadraticCurveTo(width * 0.48, height * 0.22, width * 0.62, height * 0.34);
      ctx.quadraticCurveTo(width * 0.52, height * 0.38, width * 0.44, height * 0.34);
      ctx.closePath();
      ctx.fill();
    } else if (shape === 'layered-c-curl' || shape === 'build-perm') {
      // 사이드뱅 여신 앞머리
      ctx.moveTo(width * 0.42, height * 0.24);
      ctx.quadraticCurveTo(width * 0.34, height * 0.34, width * 0.28, height * 0.48);
      ctx.quadraticCurveTo(width * 0.32, height * 0.42, width * 0.42, height * 0.3);
      ctx.moveTo(width * 0.58, height * 0.24);
      ctx.quadraticCurveTo(width * 0.66, height * 0.34, width * 0.72, height * 0.48);
      ctx.quadraticCurveTo(width * 0.68, height * 0.42, width * 0.58, height * 0.3);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }, [currentPiece, activeColor]);

  // 슬라이더 이동 이벤트 핸들러
  const handlePointerDown = () => {
    setIsDraggingSlider(true);
  };

  const handlePointerUp = () => {
    setIsDraggingSlider(false);
  };

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

  // 최종 계산된 좌표
  const calculatedWidth =
    baseTransform.scaleWidth *
    (currentPiece.scaleMultiplier || 1.1) *
    (manualScale / 100);
  const calculatedHeight =
    baseTransform.scaleHeight *
    (currentPiece.scaleMultiplier || 1.1) *
    (manualScale / 100) *
    1.15;
  const calculatedTopPercent =
    baseTransform.centerY + (currentPiece.offsetYPercent || 0) + manualOffsetY * 0.08;
  const calculatedLeftPercent = baseTransform.centerX + manualOffsetX * 0.08;

  return (
    <div
      className={`flex flex-col w-full rounded-3xl border border-zinc-800 bg-zinc-900/90 p-4 sm:p-7 backdrop-blur-md shadow-2xl text-white ${className}`}
    >
      {/* ── 상단 헤더 & 성별 탭 ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded-full bg-amber-400/20 px-3 py-1 text-xs font-bold text-amber-300 border border-amber-400/30 flex items-center gap-1.5">
              <Wand2 className="h-3.5 w-3.5 text-amber-400" />
              0.1초 실시간 랜드마크 피팅 엔진
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-white">
            내 얼굴형에 밀착되는 실시간 헤어 피팅
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            468개 안면 윤곽 포인트에 모발 텍스처와 살롱 조색 컬러를 0.1초 만에 입혀봅니다.
          </p>
        </div>

        {/* Gender Toggle */}
        <div className="flex rounded-2xl bg-zinc-950 p-1 border border-zinc-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setSelectedGender('female');
              setActivePieceId('vh-f-layered-c');
            }}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
              selectedGender === 'female'
                ? 'bg-amber-400 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            여성 시그니처
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedGender('male');
              setActivePieceId('vh-m-guile');
            }}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
              selectedGender === 'male'
                ? 'bg-amber-400 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            남성 시그니처
          </button>
        </div>
      </div>

      {/* ── 메인 뷰포트 (고화질 사진 + 실시간 모발 오버레이) ────────────────── */}
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="relative aspect-[3/4] sm:aspect-[4/3] w-full select-none overflow-hidden rounded-3xl border-2 border-zinc-800 bg-zinc-950 shadow-2xl mb-5 touch-none"
      >
        {/* Base Layer: Customer Original Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={originalImageUrl}
          alt="고객 원본 사진"
          className="h-full w-full object-cover"
        />

        {/* Overlay Layer: High-Definition Hair Canvas */}
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{
            clipPath: isComparing ? `inset(0 ${100 - sliderPosition}% 0 0)` : 'none',
            opacity: opacity / 100,
          }}
        >
          <div
            className="absolute transition-transform duration-75 ease-out origin-center"
            style={{
              top: `${calculatedTopPercent}%`,
              left: `${calculatedLeftPercent}%`,
              width: `${calculatedWidth}px`,
              height: `${calculatedHeight}px`,
              transform: `translate(-50%, -46%) rotate(${baseTransform.rotationDeg}deg)`,
            }}
          >
            <canvas ref={hairCanvasRef} className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Before / After Split Slider Line */}
        {isComparing && (
          <div
            onPointerDown={handlePointerDown}
            className="absolute inset-y-0 cursor-ew-resize z-20 touch-none flex items-center justify-center"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="w-0.5 h-full bg-amber-400 shadow-[0_0_12px_rgba(245,208,97,0.9)]" />
            <div className="absolute top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-zinc-950 font-bold shadow-2xl border-2 border-zinc-950">
              <ArrowLeftRight className="h-4 w-4" />
            </div>
          </div>
        )}

        {/* Badge: Current Applied Style */}
        <div className="absolute bottom-4 left-4 rounded-2xl bg-zinc-950/90 border border-zinc-800/90 px-4 py-2.5 backdrop-blur-md flex items-center gap-3 shadow-xl z-10">
          <span
            className="h-4 w-4 rounded-full border border-white/40 shadow-sm"
            style={{ backgroundColor: activeColor.hex }}
          />
          <div>
            <span className="text-[10px] text-zinc-400 block leading-tight">실시간 착용 스타일</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-amber-300">{currentPiece.name}</span>
              <span className="text-[10px] text-zinc-500 font-medium">({activeColor.name})</span>
            </div>
          </div>
        </div>

        {/* Top Floating Controls */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          <button
            type="button"
            onClick={() => setShowControls(!showControls)}
            className={`rounded-2xl px-3.5 py-2 text-xs font-bold backdrop-blur-md border transition flex items-center gap-1.5 shadow-lg ${
              showControls
                ? 'bg-amber-400 text-zinc-950 border-amber-300'
                : 'bg-zinc-900/85 text-zinc-300 border-zinc-700 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>핏 미세조정</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsComparing(!isComparing);
              setSliderPosition(isComparing ? 100 : 50);
            }}
            className={`rounded-2xl px-3.5 py-2 text-xs font-bold backdrop-blur-md border transition flex items-center gap-1.5 shadow-lg ${
              isComparing
                ? 'bg-amber-400 text-zinc-950 border-amber-300'
                : 'bg-zinc-900/85 text-zinc-300 border-zinc-700 hover:text-white'
            }`}
          >
            <ArrowLeftRight className="h-3.5 w-3.5" />
            <span>{isComparing ? '비교 ON' : '원형 비교'}</span>
          </button>
        </div>

        {/* Micro-Adjustment Popup Panel */}
        {showControls && (
          <div className="absolute top-16 right-4 w-72 rounded-3xl bg-zinc-950/95 border border-zinc-800 p-4 backdrop-blur-xl shadow-2xl z-20 space-y-3.5 animate-in fade-in zoom-in-95 duration-150 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <span className="font-bold text-zinc-200">헤어 핏 디테일 조절</span>
              <button
                type="button"
                onClick={() => {
                  setManualScale(100);
                  setManualOffsetY(0);
                  setManualOffsetX(0);
                  setOpacity(95);
                }}
                className="text-[10px] text-amber-400 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="h-3 w-3" />
                초기화
              </button>
            </div>

            <div>
              <div className="flex justify-between text-zinc-400 mb-1">
                <span>크기 볼륨 (Scale)</span>
                <span className="font-mono text-amber-300">{manualScale}%</span>
              </div>
              <input
                type="range"
                min="85"
                max="125"
                value={manualScale}
                onChange={(e) => setManualScale(Number(e.target.value))}
                className="w-full accent-amber-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-zinc-400 mb-1">
                <span>상하 위치 (Vertical)</span>
                <span className="font-mono text-amber-300">{manualOffsetY}px</span>
              </div>
              <input
                type="range"
                min="-25"
                max="25"
                value={manualOffsetY}
                onChange={(e) => setManualOffsetY(Number(e.target.value))}
                className="w-full accent-amber-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-zinc-400 mb-1">
                <span>좌우 위치 (Horizontal)</span>
                <span className="font-mono text-amber-300">{manualOffsetX}px</span>
              </div>
              <input
                type="range"
                min="-20"
                max="20"
                value={manualOffsetX}
                onChange={(e) => setManualOffsetX(Number(e.target.value))}
                className="w-full accent-amber-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-zinc-400 mb-1">
                <span>모발 블렌딩 선명도</span>
                <span className="font-mono text-amber-300">{opacity}%</span>
              </div>
              <input
                type="range"
                min="60"
                max="100"
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
                className="w-full accent-amber-400"
              />
            </div>
          </div>
        )}
      </div>

      {/* ── 하단 컨트롤 1: 살롱 헤어 컬러 조색 팔레트 ──────────────────────── */}
      <div className="mb-6 rounded-2xl bg-zinc-950 p-4 border border-zinc-800">
        <div className="flex items-center gap-2 mb-3">
          <Palette className="h-4 w-4 text-amber-400" />
          <span className="text-xs font-bold text-zinc-200">살롱 시그니처 조색 컬러 체인지</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {SALON_COLOR_PALETTES.map((color) => {
            const isSelected = activeColor.id === color.id;
            return (
              <button
                key={color.id}
                type="button"
                onClick={() => setActiveColor(color)}
                className={`flex items-center gap-2 rounded-xl p-2 border transition ${
                  isSelected
                    ? 'border-amber-400 bg-amber-400/15 shadow-md'
                    : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                }`}
              >
                <span
                  className="h-5 w-5 rounded-full border border-white/20 shadow-sm shrink-0"
                  style={{ backgroundColor: color.hex }}
                />
                <span className="text-[11px] font-bold text-zinc-300 truncate">
                  {color.name.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 하단 컨트롤 2: 가상 착용 스타일 선택 목록 ───────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Scissors className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-bold text-zinc-200">
              {selectedGender === 'female' ? '여성 인기 디자인 피스' : '남성 인기 디자인 피스'} ({filteredPieces.length}종)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredPieces.map((piece) => {
            const isSelected = activePieceId === piece.id;
            return (
              <button
                key={piece.id}
                type="button"
                onClick={() => handleSelectPiece(piece)}
                className={`flex flex-col items-start p-3 rounded-2xl border text-left transition ${
                  isSelected
                    ? 'border-amber-400 bg-gradient-to-br from-zinc-900 to-amber-950/30 ring-1 ring-amber-400/50 shadow-lg'
                    : 'border-zinc-800 bg-zinc-950/70 hover:border-zinc-700 hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs font-bold text-zinc-100">{piece.name}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-amber-400" />}
                </div>
                <p className="text-[10px] text-zinc-500 line-clamp-1">{piece.description}</p>
                <div className="mt-2 flex items-center gap-1">
                  <span className="rounded-md bg-zinc-900 px-1.5 py-0.5 text-[9px] font-medium text-amber-300/80 border border-zinc-800">
                    {piece.shapeType}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
