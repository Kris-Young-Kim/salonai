'use client';

import React, { useState, useMemo } from 'react';
import { MatchedLookbookItem, LookbookCategory, HairLengthType } from '@/types/lookbook';
import { FaceAnalysisResult } from '@/types/diagnosis';
import { PersonalColorResult } from '@/types/personalColor';
import { CustomerQuickMeta } from '@/types/camera';
import { LookbookCard } from './LookbookCard';
import { LookbookDetailModal } from './LookbookDetailModal';
import { SelectedStyleDrawer } from './SelectedStyleDrawer';
import {
  Sparkles,
  Search,
  SlidersHorizontal,
  Scissors,
  Palette,
  Flame,
  CheckCircle2,
} from 'lucide-react';

interface LookbookGalleryProps {
  matchedLookbooks: MatchedLookbookItem[];
  faceAnalysis: FaceAnalysisResult;
  personalColor: PersonalColorResult;
  customerMeta: CustomerQuickMeta;
  onProceedToPrescription: (selectedStyles: MatchedLookbookItem[]) => void;
  onQuickFit?: (item: MatchedLookbookItem) => void;
  onQuickSimulate?: (item: MatchedLookbookItem) => void;
}

export function LookbookGallery({
  matchedLookbooks,
  faceAnalysis,
  personalColor,
  customerMeta,
  onProceedToPrescription,
  onQuickFit,
  onQuickSimulate,
}: LookbookGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<LookbookCategory>('ALL');
  const [selectedLength, setSelectedLength] = useState<HairLengthType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedItems, setSelectedItems] = useState<MatchedLookbookItem[]>([]);
  const [detailItem, setDetailItem] = useState<MatchedLookbookItem | null>(null);

  // Toggle selection
  const handleToggleSelect = (item: MatchedLookbookItem) => {
    setSelectedItems((prev) => {
      const exists = prev.some((i) => i.id === item.id);
      if (exists) {
        return prev.filter((i) => i.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  };

  const handleRemoveSelectedItem = (id: string) => {
    setSelectedItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Filtered List
  const filteredList = useMemo(() => {
    return matchedLookbooks.filter((item) => {
      // Category filter
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
        return false;
      }
      // Length filter
      if (selectedLength !== 'ALL' && item.length !== selectedLength) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.styleName.toLowerCase().includes(q);
        const matchesEn = item.styleNameEn.toLowerCase().includes(q);
        const matchesTag = item.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesEn && !matchesTag) return false;
      }
      return true;
    });
  }, [matchedLookbooks, selectedCategory, selectedLength, searchQuery]);

  return (
    <div className="relative flex flex-col w-full min-h-full pb-28 text-white">
      
      {/* Top Diagnosis Summary Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-400/40 bg-zinc-900/80 p-5 sm:p-6 mb-8 backdrop-blur-md shadow-[0_0_30px_rgba(245,208,97,0.1)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-full bg-amber-400/20 px-3 py-1 text-xs font-bold text-amber-300 border border-amber-400/40 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                AI 맞춤 룩북 매칭 엔진
              </span>
              <span className="text-xs text-zinc-400 font-medium">
                {customerMeta.name} 고객님
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              <span className="text-amber-300">{faceAnalysis.faceShapeKorean}</span> &{' '}
              <span className="text-rose-300">{personalColor.seasonKorean}</span> 맞춤 헤어 추천
            </h2>
          </div>

          {/* Quick Tag Badges */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-xl bg-zinc-950 px-3 py-1.5 text-xs font-bold text-amber-300 border border-zinc-800">
              #{faceAnalysis.faceShapeKorean.split(' ')[0]}
            </span>
            <span className="rounded-xl bg-zinc-950 px-3 py-1.5 text-xs font-bold text-rose-300 border border-zinc-800">
              #{personalColor.seasonKorean.split(' ')[0]}
            </span>
            <span className="rounded-xl bg-zinc-950 px-3 py-1.5 text-xs font-bold text-sky-300 border border-zinc-800 uppercase">
              #{customerMeta.hairLength || '미디엄'}기장
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-6">
        
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 rounded-2xl bg-zinc-900 p-1.5 border border-zinc-800 overflow-x-auto text-xs font-bold shrink-0">
          {(
            [
              { id: 'ALL', label: '🌟 AI 베스트 추천' },
              { id: 'CUT', label: '✂️ 컷 (Cut)' },
              { id: 'PERM', label: '🌀 펌 (Perm)' },
              { id: 'COLOR', label: '🎨 컬러 (Color)' },
            ] as const
          ).map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-xl px-4 py-2 transition whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-amber-400 text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Hair Length & Search Box */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Hair Length Pills */}
          <div className="flex items-center gap-1 rounded-2xl bg-zinc-900 p-1 border border-zinc-800 text-xs">
            {(
              [
                { id: 'ALL', label: '전체' },
                { id: 'short', label: '숏' },
                { id: 'medium', label: '미디엄' },
                { id: 'long', label: '롱' },
              ] as const
            ).map((len) => (
              <button
                key={len.id}
                type="button"
                onClick={() => setSelectedLength(len.id)}
                className={`rounded-xl px-3 py-1.5 font-medium transition ${
                  selectedLength === len.id
                    ? 'bg-zinc-800 text-amber-300 font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {len.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute top-1/2 left-3 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="스타일 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl bg-zinc-900 border border-zinc-800 pl-9 pr-4 py-2 text-xs text-white placeholder:text-zinc-500 focus:border-amber-400 focus:outline-none transition"
            />
          </div>
        </div>

      </div>

      {/* Lookbook Cards Grid */}
      {filteredList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-zinc-900/40 rounded-3xl border border-zinc-800">
          <Scissors className="h-10 w-10 text-zinc-600 mb-3" />
          <p className="text-sm font-bold text-zinc-400">검색 조건에 맞는 스타일이 없습니다.</p>
          <p className="text-xs text-zinc-500 mt-1">필터를 초기화하거나 다른 검색어를 입력해보세요.</p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('ALL');
              setSelectedLength('ALL');
              setSearchQuery('');
            }}
            className="mt-4 rounded-xl bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white"
          >
            필터 초기화
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredList.map((item) => (
            <LookbookCard
              key={item.id}
              item={item}
              isSelected={selectedItems.some((i) => i.id === item.id)}
              onToggleSelect={handleToggleSelect}
              onOpenDetail={setDetailItem}
              onQuickFit={onQuickFit}
              onQuickSimulate={onQuickSimulate}
            />
          ))}
        </div>
      )}

      {/* Style Detail Modal */}
      <LookbookDetailModal
        item={detailItem}
        isOpen={Boolean(detailItem)}
        isSelected={Boolean(detailItem && selectedItems.some((i) => i.id === detailItem.id))}
        onClose={() => setDetailItem(null)}
        onToggleSelect={handleToggleSelect}
        onQuickFit={onQuickFit}
        onQuickSimulate={onQuickSimulate}
      />

      {/* Floating Selected Styles Bottom Drawer */}
      <SelectedStyleDrawer
        selectedItems={selectedItems}
        onRemoveItem={handleRemoveSelectedItem}
        onProceedToPrescription={() => onProceedToPrescription(selectedItems)}
      />

    </div>
  );
}
