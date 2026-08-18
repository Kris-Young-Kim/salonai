'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Sparkles, SlidersHorizontal, ArrowLeftRight, Check, Palette } from 'lucide-react';
import { VIRTUAL_HAIR_PIECES, VirtualHairPiece } from '@/lib/data/virtualHairStyles';
import { calculateHairFittingTransform, NormalizedLandmark } from '@/lib/ai/hairFittingMath';

interface RealtimeHairFittingProps {
  originalImageUrl: string;
  landmarks?: NormalizedLandmark[] | null;
  defaultGender?: 'female' | 'male' | 'unisex';
  onSelectHairPiece?: (hairPiece: VirtualHairPiece) => void;
  className?: string;
}

const COLOR_TINTS = [
  { id: 'natural-black', name: '내추럴 블랙', hex: '#1E1E20' },
  { id: 'dark-brown', name: '다크 브라운', hex: '#422B1D' },
  { id: 'smoky-ash', name: '스모키 애쉬', hex: '#635B57' },
  { id: 'milktea-beige', name: '밀크티 베이지', hex: '#B89B7D' },
  { id: 'rose-plum', name: '로즈 플럼', hex: '#7D4857' },
  { id: 'olive-khaki', name: '올리브 카키', hex: '#524B3C' },
];

export function RealtimeHairFitting({
  originalImageUrl,
  landmarks,
  defaultGender = 'female',
  onSelectHairPiece,
  className = '',
}: RealtimeHairFittingProps) {
  // 필터 카테고리
  const [selectedGender, setSelectedGender] = useState<'female' | 'male'>(
    defaultGender === 'male' ? 'male' : 'female'
  );
  
  // 현재 선택된 헤어피스
  const [activePieceId, setActivePieceId] = useState<string>(
    defaultGender === 'male' ? 'vh-m-guile' : 'vh-f-layered-c'
  );
  
  // 헤어 컬러 틴트
  const [activeColor, setActiveColor] = useState<string>('#422B1D');
  
  // 수동 미세조정 오프셋
  const [manualScale, setManualScale] = useState<number>(100); // 80 ~ 120%
  const [manualOffsetY, setManualOffsetY] = useState<number>(0); // -20 ~ 20px
  const [opacity, setOpacity] = useState<number>(90); // 50 ~ 100%
  
  // Before / After 슬라이더 위치
  const [sliderPosition, setSliderPosition] = useState<number>(100); // 100% = 완전 After
  const [isComparing, setIsComparing] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerDim, setContainerDim] = useState<{ width: number; height: number }>({
    width: 600,
    height: 750,
  });

  // 컨테이너 크기 감지
  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const updateDim = () => {
      setContainerDim({ width: el.offsetWidth, height: el.offsetHeight });
    };
    updateDim();
    const observer = new ResizeObserver(updateDim);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 랜드마크 기반 자동 변환 계산
  const baseTransform = useMemo(() => {
    return calculateHairFittingTransform(landmarks, containerDim.width, containerDim.height);
  }, [landmarks, containerDim.width, containerDim.height]);

  // 현재 활성화된 헤어피스 객체
  const currentPiece = useMemo(() => {
    return VIRTUAL_HAIR_PIECES.find((p) => p.id === activePieceId) || VIRTUAL_HAIR_PIECES[0];
  }, [activePieceId]);

  // 카테고리별 헤어피스 목록
  const filteredPieces = useMemo(() => {
    return VIRTUAL_HAIR_PIECES.filter((p) => p.category === selectedGender || p.category === 'unisex');
  }, [selectedGender]);

  const handleSelectPiece = (piece: VirtualHairPiece) => {
    setActivePieceId(piece.id);
    onSelectHairPiece?.(piece);
  };

  // 슬라이더 드래그 핸들러
  const handlePointerMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pos = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(pos);
  }, []);

  // 렌더링될 실제 헤어 스타일 계산치
  const calculatedWidth = (baseTransform.scaleWidth * (currentPiece.scaleMultiplier || 1) * (manualScale / 100));
  const calculatedHeight = (baseTransform.scaleHeight * (currentPiece.scaleMultiplier || 1) * (manualScale / 100));
  const calculatedTopPercent = baseTransform.centerY + (currentPiece.offsetYPercent || 0) + (manualOffsetY * 0.1);
  const calculatedLeftPercent = baseTransform.centerX;

  return (
    <div className={`flex flex-col w-full rounded-3xl border border-zinc-800 bg-zinc-900/90 p-5 sm:p-7 backdrop-blur-md shadow-2xl text-white ${className}`}>
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded-full bg-amber-400/20 px-3 py-1 text-xs font-bold text-amber-300 border border-amber-400/30 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              0.1초 즉시 착용 • 실시간 가상 헤어 피팅
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-white">
            내 얼굴에 어울리는 헤어스타일 실시간 피팅
          </h3>
        </div>

        {/* Gender Toggle */}
        <div className="flex rounded-2xl bg-zinc-950 p-1 border border-zinc-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setSelectedGender('female');
              setActivePieceId('vh-f-layered-c');
            }}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${
              selectedGender === 'female'
                ? 'bg-amber-400 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            여성 스타일
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedGender('male');
              setActivePieceId('vh-m-guile');
            }}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${
              selectedGender === 'male'
                ? 'bg-amber-400 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            남성 스타일
          </button>
        </div>
      </div>

      {/* Main Canvas / Fitting Area */}
      <div className="relative aspect-[3/4] sm:aspect-[4/3] w-full select-none overflow-hidden rounded-3xl border-2 border-zinc-800 bg-zinc-950 shadow-2xl mb-5">
        
        {/* Container for measurement */}
        <div ref={containerRef} className="relative h-full w-full">
          
          {/* Base Layer: Original Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={originalImageUrl}
            alt="Customer Original"
            className="h-full w-full object-cover"
          />

          {/* Virtual Hair Overlay Layer */}
          <div
            className="absolute inset-0 pointer-events-none overflow-hidden"
            style={{
              clipPath: isComparing ? `inset(0 ${100 - sliderPosition}% 0 0)` : 'none',
              opacity: opacity / 100,
            }}
          >
            {/* Fitted Hairpiece Vector Shape */}
            <div
              className="absolute transition-transform duration-75 ease-out"
              style={{
                top: `${calculatedTopPercent}%`,
                left: `${calculatedLeftPercent}%`,
                width: `${calculatedWidth}px`,
                height: `${calculatedHeight}px`,
                transform: `translate(-50%, -45%) rotate(${baseTransform.rotationDeg}deg)`,
              }}
            >
              {/* Stylized Hair Silhouette & Texture */}
              <svg
                viewBox="0 0 400 450"
                className="w-full h-full filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]"
                fill={activeColor}
              >
                {/* Hair Strands Gradients */}
                <defs>
                  <linearGradient id="hairSheen" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={activeColor} stopOpacity="0.95" />
                    <stop offset="50%" stopColor="#ffffff" stopOpacity="0.18" />
                    <stop offset="100%" stopColor={activeColor} stopOpacity="0.92" />
                  </linearGradient>
                  <radialGradient id="hairVolume" cx="50%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
                    <stop offset="60%" stopColor={activeColor} stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#000000" stopOpacity="0.6" />
                  </radialGradient>
                </defs>

                {/* Dynamic Hair Shape rendering based on shapeType */}
                {currentPiece.shapeType === 'layered-c-curl' && (
                  <g>
                    {/* Top Volume */}
                    <path d="M 80 160 C 80 40, 320 40, 320 160 C 340 180, 350 250, 340 320 C 330 380, 290 420, 260 410 C 275 350, 280 280, 270 200 C 240 120, 160 120, 130 200 C 120 280, 125 350, 140 410 C 110 420, 70 380, 60 320 C 50 250, 60 180, 80 160 Z" fill="url(#hairVolume)" />
                    {/* Face Framing Bangs */}
                    <path d="M 130 110 C 170 140, 230 140, 270 110 C 260 170, 230 190, 210 180 C 190 190, 140 170, 130 110 Z" fill="url(#hairSheen)" opacity="0.85" />
                    {/* C-Curl Wing Tips */}
                    <path d="M 60 320 C 80 370, 120 400, 150 390 C 120 370, 95 330, 85 290 Z" fill={activeColor} />
                    <path d="M 340 320 C 320 370, 280 400, 250 390 C 280 370, 305 330, 315 290 Z" fill={activeColor} />
                  </g>
                )}

                {currentPiece.shapeType === 'tassel-bob' && (
                  <g>
                    {/* Sleek Bob Cut */}
                    <path d="M 90 150 C 90 50, 310 50, 310 150 C 330 210, 335 290, 320 330 C 305 340, 280 330, 270 290 C 270 220, 260 160, 240 140 C 200 120, 160 140, 130 160 C 140 220, 130 290, 80 330 C 65 290, 70 210, 90 150 Z" fill="url(#hairVolume)" />
                    {/* Straight Tassel Ends */}
                    <path d="M 80 300 L 95 345 L 110 320 L 125 340 L 135 300 Z" fill={activeColor} />
                    <path d="M 320 300 L 305 345 L 290 320 L 275 340 L 265 300 Z" fill={activeColor} />
                  </g>
                )}

                {currentPiece.shapeType === 'build-perm' && (
                  <g>
                    {/* Long S-Wave Feminine Volume */}
                    <path d="M 70 160 C 70 30, 330 30, 330 160 C 360 210, 380 320, 350 430 C 320 450, 290 410, 280 330 C 290 260, 280 180, 260 150 C 230 120, 170 120, 140 150 C 120 180, 110 260, 120 330 C 110 410, 80 450, 50 430 C 20 320, 40 210, 70 160 Z" fill="url(#hairVolume)" />
                    <path d="M 120 120 Q 200 160 280 120 Q 250 190 200 170 Q 150 190 120 120 Z" fill="url(#hairSheen)" opacity="0.9" />
                  </g>
                )}

                {currentPiece.shapeType === 'guile-cut' && (
                  <g>
                    {/* Classic Guile Cut Volume */}
                    <path d="M 110 170 C 100 80, 290 60, 300 150 C 310 180, 300 220, 280 230 C 270 200, 265 170, 250 160 C 220 140, 180 150, 140 180 C 125 190, 115 210, 105 230 C 95 210, 95 180, 110 170 Z" fill="url(#hairVolume)" />
                    {/* Guile Swept Parting */}
                    <path d="M 130 120 C 170 90, 220 100, 270 130 C 240 165, 200 150, 160 160 Z" fill="url(#hairSheen)" />
                    {/* Clean Fade Sides */}
                    <path d="M 95 180 L 110 240 L 125 210 Z" fill={activeColor} opacity="0.85" />
                    <path d="M 305 180 L 290 240 L 275 210 Z" fill={activeColor} opacity="0.85" />
                  </g>
                )}

                {/* Default Fallback for other shapes */}
                {['hershey', 'hippie-wave', 'dandy-cut', 'as-perm', 'ivy-league'].includes(currentPiece.shapeType) && (
                  <g>
                    <path d="M 90 150 C 90 40, 310 40, 310 150 C 335 190, 340 270, 320 360 C 290 400, 265 340, 260 250 C 240 160, 160 160, 140 250 C 135 340, 110 400, 80 360 C 60 270, 65 190, 90 150 Z" fill="url(#hairVolume)" />
                    <path d="M 120 120 Q 200 150 280 120 Q 240 180 200 160 Q 160 180 120 120 Z" fill="url(#hairSheen)" opacity="0.8" />
                  </g>
                )}
              </svg>
            </div>
          </div>

          {/* Before/After Split Line Indicator */}
          {isComparing && (
            <div
              className="absolute inset-y-0 border-r-2 border-amber-400 shadow-[0_0_15px_rgba(245,208,97,0.8)]"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-zinc-950 font-bold shadow-lg border border-white">
                <ArrowLeftRight className="h-4 w-4" />
              </div>
            </div>
          )}

          {/* Active Style Badge Overlay */}
          <div className="absolute bottom-3 left-3 rounded-2xl bg-zinc-950/85 border border-zinc-800/80 px-3.5 py-2 backdrop-blur-md flex items-center gap-2.5">
            <span className="h-3 w-3 rounded-full border border-white/20" style={{ backgroundColor: activeColor }} />
            <div>
              <span className="text-[10px] text-zinc-400 block leading-tight">가상 착용 중인 스타일</span>
              <span className="text-xs font-bold text-amber-300">{currentPiece.name}</span>
            </div>
          </div>

          {/* Compare Mode Toggle */}
          <button
            type="button"
            onClick={() => {
              setIsComparing(!isComparing);
              setSliderPosition(isComparing ? 100 : 50);
            }}
            className={`absolute top-3 right-3 rounded-xl px-3 py-1.5 text-xs font-bold backdrop-blur-md border transition ${
              isComparing
                ? 'bg-amber-400 text-zinc-950 border-amber-300 shadow-md'
                : 'bg-zinc-900/80 text-zinc-300 border-zinc-700 hover:text-white'
            }`}
          >
            {isComparing ? '슬라이더 비교 ON' : '원형 비교 슬라이더'}
          </button>
        </div>

      </div>

      {/* Slider Range Controller (when comparing) */}
      {isComparing && (
        <div className="flex items-center gap-3 bg-zinc-950 rounded-2xl p-3 border border-zinc-800 mb-5">
          <span className="text-xs font-bold text-zinc-400 shrink-0">원본 Before</span>
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPosition}
            onChange={(e) => handlePointerMove(Number(e.target.value))}
            className="flex-1 accent-amber-400 h-2 bg-zinc-800 rounded-lg cursor-pointer"
          />
          <span className="text-xs font-bold text-amber-300 shrink-0">착용 After</span>
        </div>
      )}

      {/* Style Piece Selector (Horizontal Scroll Chips) */}
      <div className="mb-5">
        <label className="text-xs font-bold text-zinc-300 mb-2 block flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span>0.1초 즉시 착용 헤어 룩북 ({filteredPieces.length}종)</span>
        </label>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {filteredPieces.map((piece) => {
            const isSelected = piece.id === activePieceId;
            return (
              <button
                key={piece.id}
                type="button"
                onClick={() => handleSelectPiece(piece)}
                className={`flex flex-col items-start p-3 rounded-2xl border text-left transition ${
                  isSelected
                    ? 'border-amber-400 bg-amber-400/15 shadow-md scale-[1.02]'
                    : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 hover:bg-zinc-950'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className={`text-xs font-bold ${isSelected ? 'text-amber-300' : 'text-zinc-200'}`}>
                    {piece.name}
                  </span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-amber-400" />}
                </div>
                <span className="text-[10px] text-zinc-400 line-clamp-1">
                  {piece.tags.join(' ')}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hair Color Palette Selector */}
      <div className="mb-5">
        <label className="text-xs font-bold text-zinc-300 mb-2 block flex items-center gap-1.5">
          <Palette className="h-3.5 w-3.5 text-amber-400" />
          <span>헤어 컬러 틴트 선택</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {COLOR_TINTS.map((tint) => (
            <button
              key={tint.id}
              type="button"
              onClick={() => setActiveColor(tint.hex)}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold border transition ${
                activeColor === tint.hex
                  ? 'border-amber-400 bg-amber-400/20 text-white shadow-md scale-105'
                  : 'border-zinc-800 bg-zinc-950/70 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span className="h-3.5 w-3.5 rounded-full border border-white/20" style={{ backgroundColor: tint.hex }} />
              <span>{tint.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Fine-Tuning Controllers (Collapsible Accordion) */}
      <div className="rounded-2xl bg-zinc-950/80 border border-zinc-800/80 p-4">
        <div className="flex items-center gap-2 mb-3">
          <SlidersHorizontal className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-xs font-bold text-zinc-300">내 두상 맞춤 정밀 피팅 조절</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {/* Zoom / Scale */}
          <div>
            <div className="flex justify-between text-zinc-400 mb-1">
              <span>헤어 크기</span>
              <span className="text-amber-300 font-mono">{manualScale}%</span>
            </div>
            <input
              type="range"
              min="85"
              max="125"
              value={manualScale}
              onChange={(e) => setManualScale(Number(e.target.value))}
              className="w-full accent-amber-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Position Y */}
          <div>
            <div className="flex justify-between text-zinc-400 mb-1">
              <span>상하 위치</span>
              <span className="text-amber-300 font-mono">{manualOffsetY > 0 ? `+${manualOffsetY}` : manualOffsetY}px</span>
            </div>
            <input
              type="range"
              min="-15"
              max="15"
              value={manualOffsetY}
              onChange={(e) => setManualOffsetY(Number(e.target.value))}
              className="w-full accent-amber-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Opacity */}
          <div>
            <div className="flex justify-between text-zinc-400 mb-1">
              <span>자연스러움(투명도)</span>
              <span className="text-amber-300 font-mono">{opacity}%</span>
            </div>
            <input
              type="range"
              min="60"
              max="100"
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="w-full accent-amber-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

    </div>
  );
}
