'use client';

import React, { useState } from 'react';
import { RefreshCw, ArrowRight, CheckCircle2, Sparkles, User, Scissors, FlipHorizontal } from 'lucide-react';
import { CapturedImage, CustomerQuickMeta } from '@/types/camera';
import { PrivacyConsentModal } from '@/components/legal/PrivacyConsentModal';

interface CapturePreviewProps {
  image: CapturedImage;
  onRetake: () => void;
  onConfirm: (image: CapturedImage, customerMeta: CustomerQuickMeta) => void;
  isProcessing?: boolean;
}

export function CapturePreview({
  image,
  onRetake,
  onConfirm,
  isProcessing = false,
}: CapturePreviewProps) {
  const [customerName, setCustomerName] = useState('');
  const [gender, setGender] = useState<'female' | 'male' | 'unisex'>('female');
  const [hairLength, setHairLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [isMirrored, setIsMirrored] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState(true);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  const handleConfirm = () => {
    if (!privacyConsent) return;
    onConfirm(image, {
      name: customerName.trim() || '고객님',
      gender,
      hairLength,
    });
  };

  return (
    <div className="relative flex flex-col h-full w-full bg-zinc-950 text-white overflow-y-auto">
      {/* Top Status Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-900/60 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/30">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-zinc-100">촬영이 완료되었습니다</h2>
            <p className="text-xs text-zinc-400">
              사진의 초점과 수평이 맞는지 확인 후 진단을 진행해주세요.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsMirrored(!isMirrored)}
          className="flex items-center gap-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 px-3.5 py-2 text-xs font-medium text-zinc-300 transition"
        >
          <FlipHorizontal className="h-4 w-4" />
          <span>{isMirrored ? '반전 취소' : '좌우 반전'}</span>
        </button>
      </div>

      {/* Main Content: Split view on desktop / stacked on mobile */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 sm:p-6 max-w-6xl mx-auto w-full items-center">
        
        {/* Left / Top: Photo Preview Card */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center">
          <div className="relative w-full max-w-[420px] aspect-[3/4] rounded-3xl overflow-hidden border-2 border-amber-400/40 shadow-[0_0_40px_rgba(0,0,0,0.8)] bg-zinc-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.dataUrl}
              alt="촬영된 고객 얼굴 사진"
              className={`w-full h-full object-cover transition-transform duration-200 ${
                isMirrored ? '-scale-x-100' : ''
              }`}
            />

            {/* Subtly overlayed face scan grid preview */}
            <div className="absolute inset-0 pointer-events-none border border-white/10 rounded-3xl" />
            
            {/* Resolution Tag Badge */}
            <div className="absolute bottom-3 left-3 rounded-lg bg-black/70 px-2.5 py-1 text-[11px] font-mono text-zinc-300 backdrop-blur-md border border-white/10">
              {image.width} × {image.height}px
            </div>
          </div>
        </div>

        {/* Right / Bottom: Quick Customer Meta & Action Controls */}
        <div className="lg:col-span-5 flex flex-col gap-5 bg-zinc-900/60 p-5 sm:p-6 rounded-3xl border border-zinc-800/80 backdrop-blur-md">
          <div className="border-b border-zinc-800 pb-3">
            <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-400" />
              진단 기본 옵션
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              선택한 옵션에 맞춰 최적화된 헤어스타일 룩북을 추천해드립니다.
            </p>
          </div>

          {/* Customer Name Input */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-zinc-400" />
              고객명 (선택)
            </label>
            <input
              type="text"
              placeholder="예: 김민지 고객님"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full rounded-xl bg-zinc-950/80 border border-zinc-700/80 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition"
            />
          </div>

          {/* Gender Selector */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-300">성별 기준 추천</label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'female', label: '여성 스타일' },
                  { id: 'male', label: '남성 스타일' },
                  { id: 'unisex', label: '공통' },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setGender(item.id)}
                  className={`rounded-xl py-2.5 text-xs font-semibold transition border ${
                    gender === item.id
                      ? 'bg-amber-400 text-zinc-950 border-amber-300 shadow-md'
                      : 'bg-zinc-950/60 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Current Hair Length */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
              <Scissors className="h-3.5 w-3.5 text-zinc-400" />
              현재 모발 기장
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'short', label: '숏 / 숏단발' },
                  { id: 'medium', label: '미디엄 / 중단발' },
                  { id: 'long', label: '롱 / 롱레이어드' },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setHairLength(item.id)}
                  className={`rounded-xl py-2.5 text-xs font-semibold transition border ${
                    hairLength === item.id
                      ? 'bg-amber-400 text-zinc-950 border-amber-300 shadow-md'
                      : 'bg-zinc-950/60 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Privacy Consent Checkbox */}
          <div className="rounded-2xl bg-zinc-950/80 border border-zinc-800 p-3.5 flex items-start gap-2.5">
            <input
              id="privacy-consent"
              type="checkbox"
              checked={privacyConsent}
              onChange={(e) => setPrivacyConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded accent-amber-400 cursor-pointer"
            />
            <div className="flex-1 text-[11px] leading-tight">
              <label htmlFor="privacy-consent" className="text-zinc-300 font-medium cursor-pointer">
                <span className="text-amber-400 font-bold">[필수]</span> AI 안면 랜드마크 분석 및 개인정보 수집·이용 동의
              </label>
              <div className="flex items-center gap-1.5 mt-1 text-zinc-500">
                <span>안면 이미지 암호화 및 1년 보관 후 파기</span>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setIsTermsOpen(true)}
                  className="text-amber-400/80 hover:text-amber-300 underline font-medium"
                >
                  약관 전체보기
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col gap-3">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isProcessing || !privacyConsent}
              className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 py-3.5 text-sm font-bold text-zinc-950 shadow-[0_0_25px_rgba(245,208,97,0.4)] hover:brightness-105 active:scale-[0.99] transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin text-zinc-950" />
                  <span>AI 분석 준비 중...</span>
                </>
              ) : (
                <>
                  <span>AI 얼굴형 & 퍼스널컬러 스타일 컨설팅 시작</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onRetake}
              disabled={isProcessing}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-700/80 bg-zinc-800/60 py-3 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
            >
              <RefreshCw className="h-4 w-4" />
              <span>사진 다시 촬영하기</span>
            </button>
          </div>

        </div>

      </div>

      {/* Privacy Terms Modal */}
      <PrivacyConsentModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
        onAccept={() => setPrivacyConsent(true)}
      />
    </div>
  );
}
