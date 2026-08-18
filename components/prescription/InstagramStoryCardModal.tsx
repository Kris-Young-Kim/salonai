'use client';

import React, { useState, useEffect } from 'react';
import {
  Download,
  Share2,
  X,
  Sparkles,
  Loader2,
  Check,
  Smartphone,
  Camera,
} from 'lucide-react';
import { renderInstagramStoryCard, StoryCardRenderOptions } from '@/lib/prescription/storyCardRenderer';

interface InstagramStoryCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  options: StoryCardRenderOptions;
}

export function InstagramStoryCardModal({
  isOpen,
  onClose,
  options,
}: InstagramStoryCardModalProps) {
  const [cardDataUrl, setCardDataUrl] = useState<string | null>(null);
  const [rendering, setRendering] = useState(true);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    setRendering(true);
    setCardDataUrl(null);
    setDownloaded(false);

    renderInstagramStoryCard(options)
      .then((url) => {
        if (mounted) {
          setCardDataUrl(url);
          setRendering(false);
        }
      })
      .catch((err) => {
        console.error('Story card render error:', err);
        if (mounted) setRendering(false);
      });

    return () => {
      mounted = false;
    };
  }, [isOpen, options]);

  const handleDownload = () => {
    if (!cardDataUrl) return;
    const a = document.createElement('a');
    a.href = cardDataUrl;
    a.download = `유니헤어샵_헤어처방전_${options.customerName || '고객'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  const handleShare = async () => {
    if (!cardDataUrl) return;

    if (navigator.share && navigator.canShare) {
      try {
        const blob = await (await fetch(cardDataUrl)).blob();
        const file = new File([blob], `유니헤어샵_헤어처방전.png`, { type: 'image/png' });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `${options.customerName}님의 유니헤어샵 헤어 처방전`,
            text: `유니헤어샵에서 완성된 나의 인생 헤어스타일 & 퍼스널 컬러 처방전 ✨`,
            files: [file],
          });
          return;
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          handleDownload();
        }
      }
    } else {
      handleDownload();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-md text-white animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm sm:max-w-md rounded-3xl border border-amber-400/40 bg-zinc-900 p-5 sm:p-6 shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white shadow-sm">
              <Camera className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-white">인스타 스토리용 카드 이미지</h3>
              <p className="text-[10px] text-zinc-400 font-mono">9:16 HIGH RESOLUTION CARD</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Card Preview Body */}
        <div className="flex-1 overflow-y-auto my-3 flex items-center justify-center min-h-[360px] bg-zinc-950/80 rounded-2xl p-2 border border-zinc-800/80">
          {rendering ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <Loader2 className="h-9 w-9 text-amber-400 animate-spin" />
              <p className="text-xs font-bold text-amber-300">고화질 처방전 카드 렌더링 중...</p>
              <p className="text-[10px] text-zinc-500">인스타그램 스토리에 최적화된 9:16 비율로 변환합니다.</p>
            </div>
          ) : cardDataUrl ? (
            <div className="relative aspect-[9/16] w-full max-h-[500px] rounded-xl overflow-hidden shadow-2xl border border-amber-400/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cardDataUrl}
                alt="Instagram Story Prescription Card"
                className="h-full w-full object-contain"
              />
            </div>
          ) : (
            <p className="text-xs text-rose-400">카드 렌더링에 실패했습니다.</p>
          )}
        </div>

        {/* Action Buttons Footer */}
        <div className="pt-2 border-t border-zinc-800 shrink-0 space-y-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              disabled={rendering || !cardDataUrl}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 py-3.5 text-xs font-bold text-zinc-950 shadow-lg hover:brightness-105 transition disabled:opacity-50 active:scale-[0.99]"
            >
              {downloaded ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>갤러리에 저장 완료!</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>스마트폰 갤러리에 저장</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleShare}
              disabled={rendering || !cardDataUrl}
              className="flex items-center justify-center gap-1.5 rounded-2xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 px-4 py-3.5 text-xs font-bold text-zinc-200 transition disabled:opacity-50"
            >
              <Share2 className="h-4 w-4 text-amber-400" />
              <span>공유</span>
            </button>
          </div>

          <p className="text-[10px] text-zinc-500 text-center leading-tight">
            💡 저장된 이미지를 인스타그램 스토리나 카카오톡 프로필에 업로드하여 공유해 보세요.
          </p>
        </div>
      </div>
    </div>
  );
}
