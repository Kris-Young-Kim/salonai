'use client';

import React, { useState } from 'react';
import { Beaker, ChevronDown, ChevronUp, Sparkles, Clock, Layers } from 'lucide-react';
import { ColorTintEntry, DyeFormula } from '@/lib/data/hairDyeChart';
import { cn } from '@/lib/utils';

interface HairDyeRecommendationProps {
  tints: ColorTintEntry[];
  selectedTintHex?: string;
  className?: string;
}

const BRAND_BADGE: Record<DyeFormula['brand'], { label: string; color: string }> = {
  MILBON: { label: '밀본', color: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/30' },
  LOREAL: { label: '로레알', color: 'bg-sky-400/10 text-sky-300 border-sky-400/30' },
  WELLA: { label: '웰라', color: 'bg-violet-400/10 text-violet-300 border-violet-400/30' },
  SCHWARZKOPF: { label: '슈바르츠코프', color: 'bg-rose-400/10 text-rose-300 border-rose-400/30' },
};

function FormulaCard({ formula }: { formula: DyeFormula }) {
  const badge = BRAND_BADGE[formula.brand];
  return (
    <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-3.5">
      <div className="flex items-center gap-2 mb-2">
        <span className={cn('rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase', badge.color)}>
          {badge.label}
        </span>
        <span className="text-[11px] text-zinc-500">{formula.series}</span>
      </div>

      <div className="flex items-baseline gap-2 mb-1.5">
        <span className="text-sm font-black text-white tracking-widest font-mono">{formula.formula}</span>
        {formula.ratio && formula.ratio !== 'straight' && (
          <span className="text-[10px] text-amber-300 font-bold bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
            {formula.ratio} 혼합
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-zinc-400">
        <span className="flex items-center gap-1">
          <Layers className="h-3 w-3 text-zinc-500" />
          산화제 {formula.developer}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3 text-zinc-500" />
          방치 {formula.processTime}
        </span>
      </div>

      {formula.notes && (
        <p className="mt-1.5 text-[10px] text-zinc-500 leading-relaxed border-t border-zinc-800/80 pt-1.5">
          💡 {formula.notes}
        </p>
      )}
    </div>
  );
}

function TintSection({ entry, isHighlighted }: { entry: ColorTintEntry; isHighlighted: boolean }) {
  const [open, setOpen] = useState(isHighlighted);

  return (
    <div
      className={cn(
        'rounded-2xl border p-4 transition-all',
        isHighlighted
          ? 'border-amber-400/50 bg-zinc-900/90 shadow-[0_0_20px_rgba(245,208,97,0.08)]'
          : 'border-zinc-800 bg-zinc-900/50'
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 text-left"
      >
        <span
          className="h-7 w-7 rounded-xl shrink-0 border border-white/10 shadow-inner"
          style={{ backgroundColor: entry.hex }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-white">{entry.tintName}</span>
            <span className="text-[10px] text-zinc-500">{entry.tintNameEn}</span>
            <span className="text-[10px] text-zinc-500 font-mono">{entry.level}</span>
            {isHighlighted && (
              <span className="rounded-full bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                선택된 컬러
              </span>
            )}
          </div>
          <p className="text-[11px] text-zinc-500 mt-0.5 truncate">{entry.salonTip}</p>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-zinc-500 shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-zinc-500 shrink-0" />
        )}
      </button>

      {open && (
        <div className="mt-4 space-y-3">
          <p className="text-[11px] text-amber-200/80 leading-relaxed bg-amber-400/5 border border-amber-400/15 rounded-xl p-3">
            <Sparkles className="h-3 w-3 inline mr-1 text-amber-400" />
            {entry.salonTip}
          </p>
          <div className="space-y-2">
            {entry.formulas.map((f) => (
              <FormulaCard key={`${f.brand}-${f.formula}`} formula={f} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function HairDyeRecommendation({
  tints,
  selectedTintHex,
  className,
}: HairDyeRecommendationProps) {
  const [showFormulas, setShowFormulas] = useState(false);

  if (!tints.length) return null;

  return (
    <div className={cn('rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5 sm:p-6 backdrop-blur-md shadow-xl', className)}>
      
      {/* Customer Friendly Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-400/15 text-rose-400 border border-rose-400/30">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-white">퍼스널 추천 헤어 컬러 & 무드</h3>
          <p className="text-[11px] text-zinc-400">피부톤을 가장 맑고 생기있게 밝혀주는 베스트 헤어 컬러</p>
        </div>
      </div>

      {/* Recommended Color Cards */}
      <div className="space-y-3 mb-5">
        {tints.map((entry) => {
          const isSelected = selectedTintHex?.toLowerCase() === entry.hex.toLowerCase();
          return (
            <div
              key={entry.hex}
              className={cn(
                'rounded-2xl border p-4 transition-all',
                isSelected
                  ? 'border-amber-400/60 bg-gradient-to-r from-amber-400/10 via-zinc-900 to-zinc-900 shadow-md'
                  : 'border-zinc-800 bg-zinc-950/60'
              )}
            >
              <div className="flex items-start gap-3.5">
                <span
                  className="h-10 w-10 rounded-2xl shrink-0 border border-white/20 shadow-md mt-0.5"
                  style={{ backgroundColor: entry.hex }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-black text-white">{entry.tintName}</span>
                    <span className="text-[11px] text-zinc-400">({entry.tintNameEn})</span>
                    {isSelected && (
                      <span className="rounded-full bg-amber-400/20 border border-amber-400/40 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                        ✨ 맞춤 추천
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed font-medium">
                    {entry.salonTip}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Collapsible Designer Pro Formula Section */}
      <div className="border-t border-zinc-800/80 pt-3">
        <button
          type="button"
          onClick={() => setShowFormulas((v) => !v)}
          className="w-full flex items-center justify-between py-2 text-xs font-bold text-zinc-400 hover:text-amber-300 transition"
        >
          <span className="flex items-center gap-2">
            <Beaker className="h-4 w-4 text-amber-400" />
            <span>다음 방문 시 제시용 전문 살롱 조색 레시피</span>
          </span>
          <span className="text-[11px] text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-xl border border-amber-400/20">
            {showFormulas ? '접기 ▲' : '상세 배합표 보기 ▼'}
          </span>
        </button>

        {showFormulas && (
          <div className="mt-3 pt-3 space-y-3 border-t border-zinc-800/50">
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              💡 유니헤어샵 재방문 시 본 화면을 보여주시면 오늘과 동일한 정밀 비율로 시술이 진행됩니다.
            </p>
            {tints.map((entry) => (
              <div key={`formula-${entry.hex}`} className="space-y-2">
                <p className="text-xs font-bold text-zinc-300 flex items-center gap-1.5 mt-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.hex }} />
                  {entry.tintName} 배합표
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {entry.formulas.map((f) => (
                    <FormulaCard key={`${f.brand}-${f.formula}`} formula={f} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
