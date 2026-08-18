'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { MatchedLookbookItem } from '@/types/lookbook';
import { X, Sparkles, Check, Wand2, Heart } from 'lucide-react';

interface LookbookDetailModalProps {
  item: MatchedLookbookItem | null;
  isOpen: boolean;
  isSelected: boolean;
  onClose: () => void;
  onToggleSelect: (item: MatchedLookbookItem) => void;
  onQuickFit?: (item: MatchedLookbookItem) => void;
  onQuickSimulate?: (item: MatchedLookbookItem) => void;
}

export function LookbookDetailModal({
  item,
  isOpen,
  isSelected,
  onClose,
  onToggleSelect,
  onQuickFit,
  onQuickSimulate,
}: LookbookDetailModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !item || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 p-4 sm:p-6 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col lg:flex-row w-full max-w-4xl max-h-[90vh] rounded-3xl border border-zinc-700 bg-zinc-900 overflow-hidden shadow-2xl text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 rounded-full bg-black/70 p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white backdrop-blur-md transition shadow-lg"
          aria-label="닫기"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Left / Top: Style Image */}
        <div className="relative lg:w-1/2 min-h-[260px] sm:min-h-[320px] lg:min-h-full bg-zinc-950 flex flex-col justify-end">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.imageUrl}
            alt={item.styleName}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent" />

          {/* Match Score Badge */}
          <div className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full bg-black/80 px-3.5 py-1.5 text-xs font-bold text-amber-300 backdrop-blur-md border border-amber-400/40 shadow-lg">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>{item.matchScore}% 고객 맞춤 매칭</span>
          </div>

          {/* Quick Simulation Shortcuts on Image Footer */}
          {(onQuickFit || onQuickSimulate) && (
            <div className="relative z-10 p-4 flex gap-2">
              {onQuickFit && (
                <button
                  type="button"
                  onClick={() => {
                    onQuickFit(item);
                    onClose();
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl bg-zinc-900/90 hover:bg-amber-400 hover:text-zinc-950 text-amber-300 border border-amber-400/40 py-2.5 text-xs font-bold backdrop-blur-md transition shadow-lg"
                >
                  <Wand2 className="h-3.5 w-3.5" />
                  <span>0.1초 실시간 피팅</span>
                </button>
              )}
              {onQuickSimulate && (
                <button
                  type="button"
                  onClick={() => {
                    onQuickSimulate(item);
                    onClose();
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl bg-zinc-900/90 hover:bg-sky-400 hover:text-zinc-950 text-sky-300 border border-sky-400/40 py-2.5 text-xs font-bold backdrop-blur-md transition shadow-lg"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>AI 시뮬레이션</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right / Bottom: Detailed Info & Advice */}
        <div className="flex-1 flex flex-col p-6 sm:p-8 overflow-y-auto max-h-[60vh] lg:max-h-[85vh]">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-md bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-400/30 uppercase">
                {item.category === 'CUT' ? '헤어 컷' : item.category === 'PERM' ? '헤어 펌' : '헤어 염색'}
              </span>
              <span className="text-xs text-zinc-500 font-medium">{item.styleNameEn}</span>
            </div>
            <h3 className="text-2xl font-extrabold text-white">{item.styleName}</h3>
          </div>

          {/* Description */}
          <p className="text-sm text-zinc-300 leading-relaxed mb-6">
            {item.description}
          </p>

          {/* Key Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-6">
            <div className="rounded-2xl bg-zinc-950/60 border border-zinc-800 p-3 text-center">
              <span className="text-[10px] text-zinc-500 block mb-0.5">손질 난이도</span>
              <span className="text-xs font-bold text-zinc-200">
                {item.difficulty === 'EASY' ? '초보자 쉬움' : item.difficulty === 'NORMAL' ? '보통' : '스타일링 필요'}
              </span>
            </div>

            <div className="rounded-2xl bg-zinc-950/60 border border-zinc-800 p-3 text-center">
              <span className="text-[10px] text-zinc-500 block mb-0.5">예상 시술 시간</span>
              <span className="text-xs font-bold text-amber-300">{item.timeEstimate || '1시간 30분'}</span>
            </div>

            <div className="rounded-2xl bg-zinc-950/60 border border-zinc-800 p-3 text-center col-span-2 sm:col-span-1">
              <span className="text-[10px] text-zinc-500 block mb-0.5">추천 기장</span>
              <span className="text-xs font-bold text-zinc-200 uppercase">{item.length}</span>
            </div>
          </div>

          {/* Recommended Hair Types */}
          <div className="mb-5">
            <h4 className="text-xs font-bold text-zinc-400 mb-2">추천 모질 조건</h4>
            <div className="flex flex-wrap gap-1.5">
              {item.suitableHairTypes.map((ht) => (
                <span
                  key={ht}
                  className="rounded-xl bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-300 border border-zinc-700/60"
                >
                  ✓ {ht}
                </span>
              ))}
            </div>
          </div>

          {/* Designer Styling Tips */}
          <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 mb-6 text-xs text-amber-200/90 leading-relaxed">
            <strong className="text-amber-300 block mb-1">💡 살롱 디자이너 손질 & 홈케어 팁:</strong>
            {item.stylingTips}
          </div>

          {/* Action Footer */}
          <div className="mt-auto pt-4 border-t border-zinc-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl px-5 py-3 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
            >
              닫기
            </button>

            <button
              type="button"
              onClick={() => {
                onToggleSelect(item);
                onClose();
              }}
              className={`flex-1 flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold transition shadow-lg ${
                isSelected
                  ? 'bg-zinc-800 text-amber-300 border border-amber-400/40 hover:bg-zinc-700'
                  : 'bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-zinc-950 hover:brightness-105'
              }`}
            >
              {isSelected ? (
                <>
                  <Check className="h-4 w-4 stroke-[3]" />
                  <span>선택 해제하기</span>
                </>
              ) : (
                <>
                  <Heart className="h-4 w-4 fill-zinc-950 text-zinc-950" />
                  <span>이 스타일 레시피에 담기</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
