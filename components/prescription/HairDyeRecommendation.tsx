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
  if (!tints.length) return null;

  return (
    <div className={cn('rounded-3xl border border-zinc-800 bg-zinc-900/70 p-5 sm:p-6', className)}>
      <div className="flex items-center gap-2.5 mb-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
          <Beaker className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-white">브랜드별 실물 염색 레시피</h3>
          <p className="text-[11px] text-zinc-500">밀본 · 로레알 · 웰라 실제 제품 코드 및 배합비</p>
        </div>
      </div>

      <div className="space-y-3">
        {tints.map((entry) => (
          <TintSection
            key={entry.hex}
            entry={entry}
            isHighlighted={selectedTintHex?.toLowerCase() === entry.hex.toLowerCase()}
          />
        ))}
      </div>
    </div>
  );
}
