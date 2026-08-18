'use client';

import React from 'react';
import { MatchedLookbookItem } from '@/types/lookbook';
import { Sparkles, ArrowRight, X, Scissors, Palette } from 'lucide-react';

interface SelectedStyleDrawerProps {
  selectedItems: MatchedLookbookItem[];
  onRemoveItem: (id: string) => void;
  onProceedToPrescription: () => void;
}

export function SelectedStyleDrawer({
  selectedItems,
  onRemoveItem,
  onProceedToPrescription,
}: SelectedStyleDrawerProps) {
  if (selectedItems.length === 0) return null;

  return (
    <div className="sticky bottom-4 inset-x-4 z-40 mx-auto max-w-5xl animate-in slide-in-from-bottom-6 duration-300">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border-2 border-amber-400/60 bg-zinc-950/95 p-4 sm:px-6 sm:py-4 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] text-white">
        
        {/* Left: Selected Styles Thumbnails List */}
        <div className="flex items-center gap-3 overflow-x-auto w-full sm:w-auto">
          <div className="flex items-center gap-2 pr-2 border-r border-zinc-800 shrink-0">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-400 text-zinc-950 font-bold text-xs">
              {selectedItems.length}
            </span>
            <span className="text-xs font-bold text-zinc-200 hidden md:inline">
              선택된 맞춤 스타일
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {selectedItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 rounded-2xl bg-zinc-900 border border-zinc-700/80 pl-2 pr-3 py-1.5 shrink-0"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrl}
                  alt={item.styleName}
                  className="h-7 w-7 rounded-xl object-cover"
                />
                <div className="flex flex-col max-w-[130px]">
                  <span className="text-[11px] font-bold text-zinc-100 truncate">{item.styleName}</span>
                  <span className="text-[9px] text-amber-300 font-medium">
                    {item.category === 'CUT' ? '컷' : item.category === 'PERM' ? '펌' : '염색'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveItem(item.id)}
                  className="rounded-full p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Proceed Button */}
        <button
          type="button"
          onClick={onProceedToPrescription}
          className="group w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 px-6 py-3.5 text-xs sm:text-sm font-bold text-zinc-950 shadow-[0_0_25px_rgba(245,208,97,0.4)] hover:brightness-105 active:scale-95 transition shrink-0"
        >
          <span>선택 완료 및 스타일 레시피 생성</span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </button>

      </div>
    </div>
  );
}
