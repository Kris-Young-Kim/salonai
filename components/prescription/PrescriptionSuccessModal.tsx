'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Copy, Check, ExternalLink, Share2, X } from 'lucide-react';

interface PrescriptionSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerName: string;
  customerPhone: string;
  prescriptionToken: string;
  prescriptionUrl: string;
  onResetDiagnosis: () => void;
}

export function PrescriptionSuccessModal({
  isOpen,
  onClose,
  customerName,
  prescriptionUrl,
  onResetDiagnosis,
}: PrescriptionSuccessModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${prescriptionUrl}` : prescriptionUrl;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 sm:p-6 backdrop-blur-md text-white animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-amber-400/50 bg-zinc-900 p-6 sm:p-8 shadow-[0_0_50px_rgba(245,208,97,0.2)]">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Success Icon */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-400/20 text-amber-400 border border-amber-400/40 mb-4 shadow-[0_0_30px_rgba(245,208,97,0.3)]">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <span className="rounded-full bg-amber-400/10 px-3 py-0.5 text-[11px] font-bold text-amber-300 border border-amber-400/20 mb-1">
            맞춤 스타일 레시피 발행 완료
          </span>
          <h3 className="text-2xl font-extrabold text-white">
            디지털 스타일 레시피가 발행되었습니다!
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            아래 링크를 복사해 <strong className="text-zinc-200">{customerName}</strong> 고객님께 직접 공유하세요.
          </p>
        </div>

        {/* Share Guide Box */}
        <div className="rounded-2xl bg-zinc-800/60 border border-zinc-700 p-4 mb-5 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm text-zinc-200">
            <Share2 className="h-4 w-4 text-amber-400" />
            <span>고객에게 공유하는 방법</span>
          </div>
          <p className="text-zinc-400 leading-relaxed">
            아래 링크를 복사해 카카오톡 · 문자 · SNS로 직접 전송하세요.<br />
            고객이 링크를 열면 AI 스타일 분석 결과와 디자이너 맞춤 시술 레시피를 확인할 수 있습니다.
          </p>
        </div>

        {/* Recipe Link Copy Box */}
        <div className="rounded-2xl bg-zinc-950 border border-zinc-800 p-3 mb-6 flex items-center justify-between gap-2">
          <span className="text-xs text-zinc-400 font-mono truncate px-2">
            {fullUrl}
          </span>
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 px-3 py-2 text-xs font-bold text-amber-300 shrink-0 transition"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">복사됨</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>링크 복사</span>
              </>
            )}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href={prescriptionUrl}
            target="_blank"
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 py-3.5 text-xs font-bold text-zinc-950 shadow-md hover:brightness-105 transition"
          >
            <ExternalLink className="h-4 w-4" />
            <span>고객용 레시피 리포트 바로보기</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              onClose();
              onResetDiagnosis();
            }}
            className="rounded-2xl border border-zinc-700 bg-zinc-800 px-5 py-3.5 text-xs font-semibold text-zinc-300 hover:text-white transition"
          >
            새 고객 스타일 컨설팅
          </button>
        </div>

      </div>
    </div>
  );
}
