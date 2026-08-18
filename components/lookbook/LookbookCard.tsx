'use client';

import React from 'react';
import { MatchedLookbookItem } from '@/types/lookbook';
import { Sparkles, Check, Info, Wand2, Scissors } from 'lucide-react';

interface LookbookCardProps {
  item: MatchedLookbookItem;
  isSelected: boolean;
  onToggleSelect: (item: MatchedLookbookItem) => void;
  onOpenDetail: (item: MatchedLookbookItem) => void;
  onQuickFit?: (item: MatchedLookbookItem) => void;
  onQuickSimulate?: (item: MatchedLookbookItem) => void;
}

export function LookbookCard({
  item,
  isSelected,
  onToggleSelect,
  onOpenDetail,
  onQuickFit,
  onQuickSimulate,
}: LookbookCardProps) {
  const isColor = item.category === 'COLOR';

  return (
    <div
      className={`group relative flex flex-col rounded-3xl border transition-all duration-300 overflow-hidden bg-zinc-900/80 backdrop-blur-md shadow-lg ${
        isSelected
          ? 'border-amber-400 ring-2 ring-amber-400/50 shadow-[0_0_30px_rgba(245,208,97,0.25)]'
          : 'border-zinc-800 hover:border-zinc-700 hover:shadow-2xl'
      }`}
    >
      {/* Top Image & Overlays (Click to open detail modal) */}
      <div
        onClick={() => onOpenDetail(item)}
        className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-950 cursor-pointer"
        role="button"
        tabIndex={0}
        aria-label={`${item.styleName} 상세정보 보기`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpenDetail(item);
          }
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.imageUrl}
          alt={item.styleName}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Ambient Gradient on Image */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />

        {/* Match Score Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/75 px-3 py-1 text-xs font-extrabold text-amber-300 backdrop-blur-md border border-amber-400/40 shadow-lg">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span>{item.matchScore}% 매칭</span>
        </div>

        {/* Category Pill */}
        <div className="absolute top-3 right-3 rounded-full bg-zinc-900/80 px-2.5 py-1 text-[10px] font-bold text-zinc-300 backdrop-blur-md border border-zinc-700/60">
          {item.category === 'CUT' ? '✂️ 컷' : item.category === 'PERM' ? '🌀 펌' : '🎨 염색'}
        </div>

        {/* Live Color Swatch Indicator (For COLOR category) */}
        {isColor && item.colorHex && (
          <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-xl bg-black/80 px-2.5 py-1 backdrop-blur-md border border-white/20">
            <span
              className="h-4 w-4 rounded-full border border-white/40 shadow-sm"
              style={{ backgroundColor: item.colorHex }}
            />
            <span className="text-[11px] font-bold text-zinc-200 font-mono">
              {item.colorLevel || item.colorHex}
            </span>
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        
        {/* Style Name & En (Clickable to open detail) */}
        <div
          onClick={() => onOpenDetail(item)}
          className="mb-2 cursor-pointer"
          role="button"
          tabIndex={0}
        >
          <h4 className="text-base font-bold text-zinc-100 group-hover:text-amber-300 transition-colors">
            {item.styleName}
          </h4>
          <p className="text-[11px] text-zinc-500 font-medium">{item.styleNameEn}</p>
        </div>

        {/* AI Matching Reason Badges */}
        <div className="mb-3 flex flex-col gap-1">
          {item.matchReasons.map((reason, idx) => (
            <span
              key={idx}
              className="text-[11px] font-semibold text-amber-300/90 leading-tight flex items-start gap-1"
            >
              <span className="text-amber-400 mt-0.5">•</span>
              <span>{reason}</span>
            </span>
          ))}
        </div>

        {/* Quick Simulation Shortcuts */}
        {(onQuickFit || onQuickSimulate) && (
          <div className="flex items-center gap-1.5 mb-3">
            {onQuickFit && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickFit(item);
                }}
                className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-zinc-800/80 hover:bg-amber-400/20 hover:text-amber-300 border border-zinc-700/60 py-1.5 text-[11px] font-semibold text-zinc-300 transition"
              >
                <Wand2 className="h-3 w-3 text-amber-400" />
                <span>0.1초 피팅</span>
              </button>
            )}
            {onQuickSimulate && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickSimulate(item);
                }}
                className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-zinc-800/80 hover:bg-amber-400/20 hover:text-amber-300 border border-zinc-700/60 py-1.5 text-[11px] font-semibold text-zinc-300 transition"
              >
                <Sparkles className="h-3 w-3 text-sky-400" />
                <span>AI 시뮬레이션</span>
              </button>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800/80 mt-auto">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetail(item);
            }}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-zinc-700/80 bg-zinc-800/60 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-700 hover:text-white transition active:scale-95 cursor-pointer"
          >
            <Info className="h-3.5 w-3.5" />
            <span>상세정보</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect(item);
            }}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition shadow-md active:scale-95 cursor-pointer ${
              isSelected
                ? 'bg-amber-400 text-zinc-950 shadow-[0_0_15px_rgba(245,208,97,0.4)]'
                : 'bg-zinc-800 text-amber-300 hover:bg-amber-400/20 border border-amber-400/30'
            }`}
          >
            {isSelected ? (
              <>
                <Check className="h-4 w-4 stroke-[3]" />
                <span>선택됨</span>
              </>
            ) : (
              <span>스타일 선택</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
