'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  Camera,
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  Palette,
  CheckCircle2,
  ScanFace,
} from 'lucide-react';

export function InteractiveHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 }); // normalized -1 to 1
  const [isHovered, setIsHovered] = useState(false);
  const [activeColorTint, setActiveColorTint] = useState<'ash' | 'rose' | 'milktea' | 'natural'>('ash');

  // Mouse move handler for smooth mouse parallax & vivid spotlight
  const [mouseCoord, setMouseCoord] = useState({ x: 0, y: 0 }); // pixel coordinates

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    setMousePos({ x, y });
    setMouseCoord({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  // Color tint filters for hair glow overlay
  const tintGradients = {
    ash: 'from-amber-400/20 via-zinc-400/20 to-sky-400/20',
    rose: 'from-rose-500/25 via-pink-400/20 to-purple-500/20',
    milktea: 'from-amber-300/25 via-yellow-200/20 to-amber-500/15',
    natural: 'from-amber-600/15 via-orange-400/10 to-yellow-600/15',
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-[85vh] lg:min-h-[90vh] flex items-center justify-center overflow-hidden bg-zinc-950 text-white select-none py-16 lg:py-24"
    >
      {/* ── 1. Full-Width Background Photo (Static & Cinematic) ─────────────── */}
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1580618672591-eb180b1a973f?q=80&w=2000&auto=format&fit=crop"
          alt="AI Hair Styling Model with Flowing Shiny Hair"
          className="h-full w-full object-cover object-[center_35%] filter brightness-90 contrast-105"
        />

        {/* Dynamic Color Tint Gradient Overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t ${tintGradients[activeColorTint]} mix-blend-color transition-all duration-700 opacity-60`}
        />

        {/* Cinematic Dark Vignette (Leaves center clear for the photo) */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-zinc-950/40" />
        <div className="absolute inset-0 bg-black/25" />

        {/* Active AI Live Scan Line Animation */}
        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400/60 to-transparent shadow-[0_0_20px_#fbbf24] animate-[scanline_5s_easeInOut_infinite] pointer-events-none" />
      </div>

      {/* ── 2. Natural Clear Spotlight (Softly illuminates the photo behind) ─── */}
      {/* Gentle Illuminating Core (Reveals photo details smoothly) */}
      <div
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full blur-[70px] mix-blend-screen transition-opacity duration-300 ease-out will-change-transform z-10"
        style={{
          left: isHovered ? `${mouseCoord.x}px` : '50%',
          top: isHovered ? `${mouseCoord.y}px` : '50%',
          width: isHovered ? '650px' : '450px',
          height: isHovered ? '650px' : '450px',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.28) 0%, rgba(254, 240, 138, 0.18) 35%, rgba(245, 158, 11, 0.08) 60%, transparent 80%)',
          opacity: isHovered ? 1 : 0.4,
        }}
      />

      {/* Wide Soft Atmospheric Glow */}
      <div
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full blur-[130px] mix-blend-screen transition-opacity duration-500 ease-out will-change-transform z-10"
        style={{
          left: isHovered ? `${mouseCoord.x}px` : '50%',
          top: isHovered ? `${mouseCoord.y}px` : '50%',
          width: isHovered ? '850px' : '600px',
          height: isHovered ? '850px' : '600px',
          background: 'radial-gradient(circle, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.06) 50%, transparent 75%)',
          opacity: isHovered ? 1 : 0.3,
        }}
      />

      {/* ── 3. Foreground Content with Parallax Moving Texts ─────────────────── */}
      <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        
        {/* Center-aligned Cinematic Layout with Responsive HUD Badges */}
        <div className="relative flex flex-col items-center text-center max-w-4xl mx-auto">
          
          {/* Top Pill Badge (Moving with mouse) */}
          <div
            className="transition-transform duration-300 ease-out will-change-transform mb-6"
            style={{
              transform: `translate3d(${mousePos.x * 16}px, ${mousePos.y * 16}px, 0)`,
            }}
          >
            <div className="inline-flex items-center gap-2.5 rounded-full border border-amber-400/40 bg-zinc-950/80 pl-2 pr-4 py-1 text-xs font-semibold text-amber-300 backdrop-blur-xl shadow-lg hover:border-amber-400/70 transition-colors">
              <div className="h-5 w-5 rounded-full overflow-hidden border border-amber-400/50 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.jpg" alt="유니헤어샵 로고" className="h-full w-full object-cover" />
              </div>
              <span>유니헤어샵 태블릿 전용 AI 정밀 스타일 컨설팅</span>
            </div>
          </div>

          {/* Main Title (Direct user-requested typography + mouse parallax) */}
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15] mb-6 break-keep transition-transform duration-300 ease-out will-change-transform drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]"
            style={{
              transform: `translate3d(${mousePos.x * 26}px, ${mousePos.y * 26}px, 0)`,
            }}
          >
            1분 만에 완성되는
            <br />
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(245,208,97,0.45)]">
              AI 스타일 컨설팅 & 맞춤 레시피
            </span>
          </h1>

          {/* Subtitle (Direct user-requested paragraph + mouse parallax) */}
          <p
            className="max-w-2xl text-base sm:text-lg text-zinc-300 leading-relaxed mb-8 break-keep transition-transform duration-300 ease-out will-change-transform drop-shadow-md font-medium"
            style={{
              transform: `translate3d(${mousePos.x * 18}px, ${mousePos.y * 18}px, 0)`,
            }}
          >
            태블릿 카메라로 얼굴 정면을 가이드에 맞춰 3초 촬영하세요. AI가 얼굴형 랜드마크 468개와 퍼스널 컬러를 정밀 분석하여 최적의 살롱 룩북과 실시간 가상 컬러 시뮬레이션을 제공합니다.
          </p>

          {/* Interactive Color Tint Selector (Moving with mouse) */}
          <div
            className="mb-8 w-full max-w-md rounded-2xl border border-zinc-700/70 bg-zinc-950/85 p-3.5 backdrop-blur-xl shadow-2xl transition-transform duration-300 ease-out will-change-transform"
            style={{
              transform: `translate3d(${mousePos.x * 12}px, ${mousePos.y * 12}px, 0)`,
            }}
          >
            <div className="flex items-center justify-between text-xs font-bold text-zinc-400 mb-2.5 px-1">
              <span className="flex items-center gap-1.5 text-amber-300">
                <Palette className="h-3.5 w-3.5 text-amber-400" />
                실시간 헤어 컬러 틴트 체험
              </span>
              <span className="text-[11px] text-zinc-500 font-mono">CIE-Lab Blend</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'ash', label: '스모키 애쉬', color: 'bg-[#7D7571]' },
                { id: 'rose', label: '로즈 플럼', color: 'bg-[#8E5265]' },
                { id: 'milktea', label: '밀크티 베이지', color: 'bg-[#C4A482]' },
                { id: 'natural', label: '내추럴 브라운', color: 'bg-[#5A3825]' },
              ].map((tint) => (
                <button
                  key={tint.id}
                  type="button"
                  onClick={() => setActiveColorTint(tint.id as 'ash' | 'rose' | 'milktea' | 'natural')}
                  className={`flex flex-col items-center gap-1 rounded-xl p-2 text-[11px] font-bold transition-all border ${
                    activeColorTint === tint.id
                      ? 'border-amber-400 bg-amber-400/25 text-white shadow-md scale-105'
                      : 'border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span className={`h-3 w-3 rounded-full ${tint.color} shadow-sm`} />
                  <span className="truncate">{tint.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* CTA Buttons (Moving with mouse) */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto transition-transform duration-300 ease-out will-change-transform"
            style={{
              transform: `translate3d(${mousePos.x * 10}px, ${mousePos.y * 10}px, 0)`,
            }}
          >
            <Link
              href="/diagnose"
              className="group flex h-14 w-full sm:w-auto items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 px-8 text-base font-extrabold text-zinc-950 shadow-[0_0_40px_rgba(245,208,97,0.5)] hover:brightness-110 active:scale-95 transition-all"
            >
              <Camera className="h-5 w-5 text-zinc-950" />
              <span>1분 AI 스타일 컨설팅 시작</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/dashboard/records"
              className="flex h-14 w-full sm:w-auto items-center justify-center rounded-2xl border border-zinc-700/70 bg-zinc-950/85 px-8 text-sm font-semibold text-zinc-200 hover:bg-zinc-800 hover:text-white transition shadow-lg backdrop-blur-md"
            >
              고객 스타일 보관함
            </Link>
          </div>

          {/* Trust Badges */}
          <div
            className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400 font-medium transition-transform duration-300 ease-out will-change-transform"
            style={{
              transform: `translate3d(${mousePos.x * 8}px, ${mousePos.y * 8}px, 0)`,
            }}
          >
            <span className="flex items-center gap-1.5 bg-zinc-950/60 border border-zinc-800/80 px-3 py-1.5 rounded-full backdrop-blur-md">
              <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />
              MediaPipe 468 비전 엔진
            </span>
            <span className="flex items-center gap-1.5 bg-zinc-950/60 border border-zinc-800/80 px-3 py-1.5 rounded-full backdrop-blur-md">
              <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />
              CIE-Lab 4계절 분석
            </span>
            <span className="flex items-center gap-1.5 bg-zinc-950/60 border border-zinc-800/80 px-3 py-1.5 rounded-full backdrop-blur-md">
              <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />
              K-살롱 24종 룩북
            </span>
          </div>

        </div>

        {/* ── 4. Floating 3D HUD Badges in Left & Right Space ───────────────── */}
        {/* Floating Badge 1: Top Left - Face Landmark */}
        <div
          className="hidden xl:flex absolute top-12 left-6 z-20 rounded-2xl border border-amber-400/40 bg-zinc-950/90 p-3.5 shadow-2xl backdrop-blur-2xl transition-transform duration-300 ease-out will-change-transform items-center gap-3 pointer-events-none"
          style={{
            transform: `translate3d(${mousePos.x * 35}px, ${mousePos.y * 35}px, 0)`,
          }}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/20 text-amber-400 border border-amber-400/40">
            <ScanFace className="h-5 w-5" />
          </div>
          <div className="text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
              AI 얼굴형 정밀 분석
            </span>
            <span className="text-xs font-black text-white block">
              황금비율 계란형 (1 : 1 : 0.98)
            </span>
          </div>
        </div>

        {/* Floating Badge 2: Top Right - Personal Color */}
        <div
          className="hidden xl:flex absolute top-16 right-6 z-20 rounded-2xl border border-rose-400/40 bg-zinc-950/90 p-3.5 shadow-2xl backdrop-blur-2xl transition-transform duration-300 ease-out will-change-transform items-center gap-3 pointer-events-none"
          style={{
            transform: `translate3d(${mousePos.x * 40}px, ${mousePos.y * 40}px, 0)`,
          }}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-400/20 text-rose-400 border border-rose-400/40">
            <Palette className="h-5 w-5" />
          </div>
          <div className="text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block">
              퍼스널 컬러 스펙트럼
            </span>
            <span className="text-xs font-black text-white block">
              여름 쿨톤 뮤트 (Summer Mute)
            </span>
          </div>
        </div>

        {/* Floating Badge 3: Bottom Left - Recommended Style */}
        <div
          className="hidden xl:flex absolute bottom-8 left-8 z-20 rounded-2xl border border-sky-400/40 bg-zinc-950/90 p-3.5 shadow-2xl backdrop-blur-2xl transition-transform duration-300 ease-out will-change-transform items-center gap-3 pointer-events-none"
          style={{
            transform: `translate3d(${mousePos.x * 30}px, ${mousePos.y * 30}px, 0)`,
          }}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-400/20 text-sky-400 border border-sky-400/40">
            <SlidersHorizontal className="h-5 w-5" />
          </div>
          <div className="text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 block">
              살롱 추천 룩북 매칭
            </span>
            <span className="text-xs font-black text-white block">
              내추럴 레이어드 C컬 펌 (98% 일치)
            </span>
          </div>
        </div>

        {/* Floating Badge 4: Bottom Right - Hair Dye Recipe */}
        <div
          className="hidden xl:flex absolute bottom-8 right-8 z-20 rounded-2xl border border-amber-400/40 bg-zinc-950/95 p-3.5 shadow-2xl backdrop-blur-2xl transition-transform duration-300 ease-out will-change-transform items-center gap-3 pointer-events-none"
          style={{
            transform: `translate3d(${mousePos.x * 45}px, ${mousePos.y * 45}px, 0)`,
          }}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 text-zinc-950 font-black text-sm shadow-md">
            ★
          </div>
          <div className="text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">
              맞춤 염색 조색 레시피
            </span>
            <span className="text-xs font-black text-white block">
              밀본 8-sAS + 로레알 8.1
            </span>
          </div>
        </div>

      </div>

    </section>
  );
}
