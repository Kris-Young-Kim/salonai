'use client';

import React, { useState } from 'react';
import { Share2, Copy, Check, MessageCircle, Heart } from 'lucide-react';

interface PrescriptionShareButtonsProps {
  customerName?: string;
  faceShape?: string;
  personalColor?: string;
}

export function PrescriptionShareButtons({
  customerName = '고객',
  faceShape,
  personalColor,
}: PrescriptionShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      if (typeof window !== 'undefined') {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // fallback
      const textArea = document.createElement('textarea');
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (typeof window === 'undefined') return;

    const shareData = {
      title: `${customerName}님의 유니헤어샵 맞춤 스타일 리포트`,
      text: `유니헤어샵에서 완성된 ${customerName}님의 AI 헤어 스타일 & 퍼스널 컬러(${personalColor || ''}) 분석 리포트입니다! ✨`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // 사용자가 취소한 경우는 무시
        if ((err as Error).name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="rounded-3xl border border-amber-400/30 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 p-5 sm:p-6 backdrop-blur-md shadow-xl text-center space-y-4 mb-6">
      
      {/* Header */}
      <div className="flex items-center justify-center gap-2">
        <Heart className="h-4 w-4 text-rose-400 fill-rose-400 animate-pulse" />
        <h3 className="text-sm font-extrabold text-white">
          내 맞춤 스타일 리포트 공유하기
        </h3>
      </div>
      
      <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto break-keep">
        나만을 위해 분석된 인생 헤어스타일과 퍼스널 컬러를 친구·가족에게 자랑하고 의견을 물어보세요!
      </p>

      {/* Share Actions */}
      <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
        
        {/* Kakao / Native Share Button */}
        <button
          type="button"
          onClick={handleNativeShare}
          className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[#FEE500] hover:bg-[#FADA0A] py-3.5 px-4 text-xs font-black text-[#191919] shadow-md transition active:scale-[0.99]"
        >
          <MessageCircle className="h-4 w-4 fill-[#191919]" />
          <span>카카오톡 / 스마트폰으로 공유</span>
        </button>

        {/* Copy Link Button */}
        <button
          type="button"
          onClick={handleCopyLink}
          className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-800/90 hover:bg-zinc-700 py-3.5 px-4 text-xs font-bold text-zinc-200 hover:text-white transition active:scale-[0.99]"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-emerald-400" />
              <span className="text-emerald-400 font-bold">리포트 링크 복사됨!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 text-amber-400" />
              <span>리포트 링크 복사하기</span>
            </>
          )}
        </button>

      </div>

      {copied && (
        <p className="text-[11px] text-emerald-400 animate-fade-in font-medium">
          ✓ 링크가 클립보드에 복사되었습니다. 카카오톡이나 SNS에 붙여넣기(Ctrl+V)하세요!
        </p>
      )}

    </div>
  );
}
