'use client';

import React from 'react';
import { PersonalColorResult } from '@/types/personalColor';
import { Pipette, Sun, Sparkles } from 'lucide-react';

interface SkinToneSwatchProps {
  skinTone: PersonalColorResult['skinTone'];
}

export function SkinToneSwatch({ skinTone }: SkinToneSwatchProps) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-5 sm:p-6 backdrop-blur-md text-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
          <Pipette className="h-4 w-4 text-amber-400" />
          피부 관심 영역(ROI) 색상 분석치
        </h3>
        <span className="text-[11px] font-mono text-zinc-400">CIE-L*a*b* & ITA</span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-5">
        
        {/* Main Extracted Skin Color Swatch */}
        <div className="flex flex-col items-center gap-2">
          <div
            className="h-20 w-20 rounded-2xl border-2 border-white/20 shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-transform hover:scale-105"
            style={{ backgroundColor: skinTone.hex }}
          />
          <div className="text-center font-mono">
            <span className="text-xs font-bold text-zinc-200 block">{skinTone.hex}</span>
            <span className="text-[10px] text-zinc-500">
              RGB({skinTone.rgb.r}, {skinTone.rgb.g}, {skinTone.rgb.b})
            </span>
          </div>
        </div>

        {/* Diagnostic Metrics Grid */}
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-2.5 w-full">
          
          {/* Skin Brightness */}
          <div className="col-span-2 sm:col-span-3 rounded-2xl bg-zinc-950/60 border border-zinc-800 p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-amber-400" />
              <span className="text-xs text-zinc-300">피부 밝기 호수</span>
            </div>
            <span className="text-xs font-bold text-amber-300">{skinTone.brightnessKorean}</span>
          </div>

          {/* L* Lightness */}
          <div className="rounded-2xl bg-zinc-950/60 border border-zinc-800 p-2.5 text-center">
            <span className="text-[10px] text-zinc-400 block">L* (명도)</span>
            <span className="text-sm font-bold text-zinc-100 mt-0.5 block">{skinTone.lab.L}</span>
            <span className="text-[9px] text-zinc-500">{skinTone.lab.L > 65 ? '화사함' : '차분함'}</span>
          </div>

          {/* a* Redness */}
          <div className="rounded-2xl bg-zinc-950/60 border border-zinc-800 p-2.5 text-center">
            <span className="text-[10px] text-zinc-400 block">a* (붉은기)</span>
            <span className="text-sm font-bold text-rose-300 mt-0.5 block">{skinTone.lab.a}</span>
            <span className="text-[9px] text-zinc-500">{skinTone.lab.a > 11 ? '혈색감 있음' : '투명함'}</span>
          </div>

          {/* b* Yellowness */}
          <div className="rounded-2xl bg-zinc-950/60 border border-zinc-800 p-2.5 text-center">
            <span className="text-[10px] text-zinc-400 block">b* (노란기)</span>
            <span className="text-sm font-bold text-amber-300 mt-0.5 block">{skinTone.lab.b}</span>
            <span className="text-[9px] text-zinc-500">{skinTone.lab.b > 14 ? '웜 베이스' : '쿨 베이스'}</span>
          </div>

        </div>

      </div>

      {/* Undertone Summary Badge */}
      <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
        <span className="text-zinc-400">피부 베이스 언더톤:</span>
        <span className="font-semibold text-amber-300 flex items-center gap-1">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          {skinTone.undertone}
        </span>
      </div>
    </div>
  );
}
