'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Camera,
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  Palette,
  Layers,
  Flame,
  CheckCircle2,
  ScanFace,
} from 'lucide-react';

export function InteractiveHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 }); // normalized -1 to 1
  const [isHovered, setIsHovered] = useState(false);
  const [activeColorTint, setActiveColorTint] = useState<'ash' | 'rose' | 'milktea' | 'natural'>('ash');

  // Mouse move handler for 3D parallax
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    setMousePos({ x, y });
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
      className="relative overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-28 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 text-white select-none"
    >
      {/* ── Interactive Cursor Follower Aura ──────────────────────────────────── */}
      <div
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400/15 blur-[120px] transition-all duration-300 ease-out will-change-transform"
        style={{
          left: `${(mousePos.x + 1) * 50}%`,
          top: `${(mousePos.y + 1) * 50}%`,
          width: isHovered ? '600px' : '450px',
          height: isHovered ? '600px' : '450px',
        }}
      />

      {/* ── Ambient Background Glows ─────────────────────────────────────────── */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-amber-500/20 via-yellow-600/10 to-rose-500/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ── 2-Column Responsive Layout: Text Left, Interactive 3D Model Right ─ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headlines & CTA (6 cols) */}
          <div className="lg:col-span-6 text-center lg:text-left flex flex-col items-center lg:items-start">
            
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-1.5 text-xs font-semibold text-amber-300 backdrop-blur-md mb-6 shadow-sm hover:border-amber-400/60 transition-colors">
              <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
              <span>미용실 태블릿 전용 AI 정밀 진단 & 스타일 레시피</span>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15] mb-6 break-keep">
              1분 만에 완성되는
              <br />
              <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(245,208,97,0.3)]">
                AI 헤어 진단 & 맞춤 레시피
              </span>
            </h1>

            {/* Subtitle */}
            <p className="max-w-xl text-base sm:text-lg text-zinc-400 leading-relaxed mb-8 break-keep">
              태블릿 카메라로 얼굴 정면을 가이드에 맞춰 3초 촬영하세요. AI가 얼굴형 랜드마크 468개와 퍼스널 컬러를 정밀 분석하여 최적의 살롱 룩북과 실시간 가상 컬러 시뮬레이션을 제공합니다.
            </p>

            {/* Interactive Color Tint Selector */}
            <div className="mb-8 w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/80 p-3 backdrop-blur-md">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-400 mb-2 px-1">
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
                    onClick={() => setActiveColorTint(tint.id as any)}
                    className={`flex flex-col items-center gap-1 rounded-xl p-2 text-[11px] font-bold transition-all border ${
                      activeColorTint === tint.id
                        ? 'border-amber-400 bg-amber-400/20 text-white shadow-md scale-105'
                        : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span className={`h-3 w-3 rounded-full ${tint.color} shadow-sm`} />
                    <span className="truncate">{tint.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link
                href="/diagnose"
                className="group flex h-14 w-full sm:w-auto items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 px-8 text-base font-extrabold text-zinc-950 shadow-[0_0_35px_rgba(245,208,97,0.4)] hover:brightness-105 active:scale-95 transition-all"
              >
                <Camera className="h-5 w-5 text-zinc-950" />
                <span>1분 AI 진단 시작하기</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/dashboard"
                className="flex h-14 w-full sm:w-auto items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/90 px-8 text-sm font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition shadow-sm"
              >
                디자이너 CRM 보관함
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="mt-8 flex items-center gap-6 text-xs text-zinc-500 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />
                MediaPipe 468 비전 엔진
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />
                CIE-Lab 4계절 진단
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />
                K-살롱 24종 룩북
              </span>
            </div>

          </div>

          {/* Right Column: 3D Interactive Floating Model Visualizer (6 cols) */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            
            {/* ── 3D Parallax Tilt Container ─────────────────────────────────── */}
            <div
              className="relative w-full max-w-lg aspect-[4/5] rounded-[36px] overflow-hidden border border-amber-400/30 bg-zinc-900/60 shadow-[0_0_60px_rgba(245,208,97,0.15)] transition-transform duration-200 ease-out will-change-transform"
              style={{
                transform: `perspective(1000px) rotateY(${mousePos.x * 12}deg) rotateX(${-mousePos.y * 12}deg) scale3d(1.02, 1.02, 1.02)`,
              }}
            >
              {/* Dynamic Model Image with Flowing Hair */}
              <div className="relative h-full w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1580618672591-eb180b1a973f?q=80&w=1200&auto=format&fit=crop"
                  alt="AI Hair Styling Model with Flowing Shiny Hair"
                  className="h-full w-full object-cover object-center filter brightness-95 contrast-105 scale-105 transition-transform duration-700 hover:scale-110"
                />

                {/* Dynamic Color Tint Gradient Overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${tintGradients[activeColorTint]} mix-blend-color transition-all duration-500`}
                />

                {/* Dark Vignette & Edge Shadow */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent pointer-events-none" />
                <div className="absolute inset-0 ring-1 ring-inset ring-amber-400/20 rounded-[36px] pointer-events-none" />

                {/* Active Live AI Scan Line Animation */}
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-75 shadow-[0_0_20px_#fbbf24] animate-[scanline_4s_easeInOut_infinite]" />
              </div>

              {/* ── 3D Floating Interactive HUD Badges (Hover Parallax) ─────── */}
              
              {/* Badge 1: Top Left - Face Landmark & Ratio */}
              <div
                className="absolute top-6 left-6 z-20 rounded-2xl border border-amber-400/40 bg-zinc-950/85 p-3 shadow-2xl backdrop-blur-xl transition-transform duration-300 ease-out will-change-transform flex items-center gap-2.5 pointer-events-none"
                style={{
                  transform: `translate3d(${mousePos.x * -18}px, ${mousePos.y * -18}px, 40px)`,
                }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400/20 text-amber-400 border border-amber-400/40">
                  <ScanFace className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                    AI 얼굴형 분석
                  </span>
                  <span className="text-xs font-black text-white block">
                    계란형 (비율 1 : 1 : 0.98)
                  </span>
                </div>
              </div>

              {/* Badge 2: Top Right - Personal Color Match */}
              <div
                className="absolute top-16 right-6 z-20 rounded-2xl border border-rose-400/40 bg-zinc-950/85 p-3 shadow-2xl backdrop-blur-xl transition-transform duration-300 ease-out will-change-transform flex items-center gap-2.5 pointer-events-none"
                style={{
                  transform: `translate3d(${mousePos.x * 22}px, ${mousePos.y * 22}px, 50px)`,
                }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-400/20 text-rose-400 border border-rose-400/40">
                  <Palette className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block">
                    퍼스널 컬러 진단
                  </span>
                  <span className="text-xs font-black text-white block">
                    여름 쿨톤 뮤트 (Summer Mute)
                  </span>
                </div>
              </div>

              {/* Badge 3: Bottom Left - Recommended Style */}
              <div
                className="absolute bottom-20 left-6 z-20 rounded-2xl border border-sky-400/40 bg-zinc-950/85 p-3 shadow-2xl backdrop-blur-xl transition-transform duration-300 ease-out will-change-transform flex items-center gap-2.5 pointer-events-none"
                style={{
                  transform: `translate3d(${mousePos.x * -25}px, ${mousePos.y * -25}px, 60px)`,
                }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-400/20 text-sky-400 border border-sky-400/40">
                  <SlidersHorizontal className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 block">
                    살롱 추천 룩북 매칭
                  </span>
                  <span className="text-xs font-black text-white block">
                    내추럴 레이어드 C컬 펌 (98% 일치)
                  </span>
                </div>
              </div>

              {/* Badge 4: Bottom Right - Hair Dye Recipe Blend */}
              <div
                className="absolute bottom-6 right-6 z-20 rounded-2xl border border-amber-400/40 bg-zinc-950/90 p-3 shadow-2xl backdrop-blur-xl transition-transform duration-300 ease-out will-change-transform flex items-center gap-2.5 pointer-events-none"
                style={{
                  transform: `translate3d(${mousePos.x * 28}px, ${mousePos.y * 28}px, 70px)`,
                }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 text-zinc-950 font-black text-xs shadow-md">
                  ★
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">
                    맞춤 시술 레시피
                  </span>
                  <span className="text-xs font-black text-white block">
                    밀본 8-sAS + 로레알 8.1
                  </span>
                </div>
              </div>

            </div>

            {/* Decorative Glow Ring behind card */}
            <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-purple-500/20 blur-2xl -z-10 rounded-[48px] pointer-events-none" />

          </div>

        </div>

      </div>

    </section>
  );
}
