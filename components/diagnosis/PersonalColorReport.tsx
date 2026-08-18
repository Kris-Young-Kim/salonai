'use client';

import React from 'react';
import { PersonalColorResult } from '@/types/personalColor';
import { CustomerQuickMeta } from '@/types/camera';
import { SkinToneSwatch } from './SkinToneSwatch';
import {
  Palette,
  Sparkles,
  CheckCircle2,
  XCircle,
  Gem,
  ArrowRight,
  RefreshCw,
  Award,
} from 'lucide-react';

interface PersonalColorReportProps {
  personalColor: PersonalColorResult;
  customerMeta: CustomerQuickMeta;
  onProceedToLookbook: () => void;
  onRetake: () => void;
}

export function PersonalColorReport({
  personalColor,
  customerMeta,
  onProceedToLookbook,
  onRetake,
}: PersonalColorReportProps) {
  const getSeasonTheme = () => {
    switch (personalColor.season) {
      case 'SPRING_WARM':
        return {
          gradient: 'from-amber-400/20 via-orange-400/10 to-yellow-500/20',
          border: 'border-amber-400/50',
          badgeBg: 'bg-amber-400/20 text-amber-300 border-amber-400/40',
          accent: 'text-amber-300',
        };
      case 'SUMMER_COOL':
        return {
          gradient: 'from-rose-400/20 via-pink-400/10 to-indigo-500/20',
          border: 'border-rose-400/50',
          badgeBg: 'bg-rose-400/20 text-rose-300 border-rose-400/40',
          accent: 'text-rose-300',
        };
      case 'AUTUMN_WARM':
        return {
          gradient: 'from-amber-600/20 via-yellow-600/10 to-stone-700/20',
          border: 'border-amber-500/50',
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          accent: 'text-amber-300',
        };
      case 'WINTER_COOL':
        return {
          gradient: 'from-indigo-600/20 via-purple-600/10 to-cyan-500/20',
          border: 'border-indigo-400/50',
          badgeBg: 'bg-indigo-400/20 text-indigo-300 border-indigo-400/40',
          accent: 'text-indigo-300',
        };
    }
  };

  const theme = getSeasonTheme();

  return (
    <div className="flex flex-col gap-6 w-full max-w-full text-white">
      
      {/* 1. Personal Color Hero Banner */}
      <div className={`relative overflow-hidden rounded-3xl border-2 ${theme.border} bg-gradient-to-br ${theme.gradient} p-6 shadow-[0_0_40px_rgba(0,0,0,0.4)]`}>
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Palette className="w-44 h-44 text-white" />
        </div>

        <div className="relative z-10 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-bold border flex items-center gap-1.5 ${theme.badgeBg}`}>
                <Sparkles className="h-3.5 w-3.5" />
                퍼스널 컬러 진단 결과
              </span>
              <span className="text-xs text-zinc-400">신뢰도 {personalColor.confidence}%</span>
            </div>

            <span className="text-xs font-semibold text-zinc-300">
              {customerMeta.name} 고객님
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-2.5">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {personalColor.seasonKorean}
              </h2>
              <span className="text-xs font-bold text-zinc-400 uppercase">
                {personalColor.seasonSubtype}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 mt-1 leading-relaxed">
              {personalColor.description}
            </p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {personalColor.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-xl bg-zinc-900/80 px-2.5 py-1 text-[11px] font-semibold text-amber-300 border border-zinc-700/60"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Extracted Skin Tone ROI Swatch */}
      <SkinToneSwatch skinTone={personalColor.skinTone} />

      {/* 3. Recommended Salon Hair Color Chips */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-5 sm:p-6 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            {personalColor.seasonKorean} 베스트 추천 염색 컬러
          </h3>
          <span className="text-[11px] font-mono text-zinc-400">살롱 레시피 매칭</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {personalColor.bestHairColors.map((color) => (
            <div
              key={color.name}
              className="flex items-center gap-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800 p-3.5 hover:border-amber-400/40 transition group"
            >
              <div
                className="h-12 w-12 rounded-xl border border-white/20 shadow-md shrink-0 group-hover:scale-105 transition-transform"
                style={{ backgroundColor: color.hex }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-100 truncate">{color.name}</span>
                  <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] font-mono text-amber-300 font-semibold">
                    {color.level}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5 truncate">{color.toneDesc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Worst / Avoid Hair Colors */}
      <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/40 p-5 sm:p-6 backdrop-blur-md">
        <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2 mb-3">
          <XCircle className="h-4 w-4 text-rose-400" />
          피해야 할 워스트 염색 컬러
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {personalColor.worstHairColors.map((color) => (
            <div
              key={color.name}
              className="flex items-center gap-3.5 rounded-2xl bg-zinc-950/40 border border-zinc-800/60 p-3 opacity-80"
            >
              <div
                className="h-10 w-10 rounded-xl border border-white/10 shrink-0"
                style={{ backgroundColor: color.hex }}
              />
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-zinc-300 block truncate">{color.name}</span>
                <p className="text-[10px] text-rose-300/80 mt-0.5 truncate">{color.toneDesc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Makeup & Jewelry Synergy Card */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-5 sm:p-6 backdrop-blur-md">
        <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2 mb-4">
          <Gem className="h-4 w-4 text-amber-400" />
          메이크업 & 액세서리 시너지 제언
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="rounded-2xl bg-zinc-950/60 border border-zinc-800 p-3.5 space-y-1">
            <span className="text-[11px] font-semibold text-zinc-400 block">추천 립 & 블러셔</span>
            <p className="text-zinc-200 font-bold">{personalColor.makeupAdvice.lipColor}</p>
            <p className="text-[11px] text-zinc-400">{personalColor.makeupAdvice.blusher}</p>
          </div>

          <div className="rounded-2xl bg-zinc-950/60 border border-zinc-800 p-3.5 space-y-1">
            <span className="text-[11px] font-semibold text-zinc-400 block">베스트 주얼리 & 금속</span>
            <p className="text-amber-300 font-bold">{personalColor.makeupAdvice.jewelryKorean}</p>
            <p className="text-[11px] text-zinc-400">아이섀도: {personalColor.makeupAdvice.eyeShadow}</p>
          </div>
        </div>
      </div>

      {/* 6. Navigation Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="button"
          onClick={onProceedToLookbook}
          className="group flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 py-4 text-sm font-bold text-zinc-950 shadow-[0_0_25px_rgba(245,208,97,0.4)] hover:brightness-105 active:scale-[0.99] transition"
        >
          <span>맞춤 헤어스타일 룩북 추천 보기 (Step 3)</span>
          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          type="button"
          onClick={onRetake}
          className="flex items-center justify-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/80 px-6 py-4 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
        >
          <RefreshCw className="h-4 w-4" />
          <span>처음부터 다시 촬영</span>
        </button>
      </div>

    </div>
  );
}
