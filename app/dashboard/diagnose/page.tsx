'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Camera, ArrowLeft, User, Phone, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardDiagnosePage() {
  const router = useRouter();
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);

  const handleStart = () => {
    setIsNavigating(true);
    const params = new URLSearchParams();
    if (customerName.trim()) params.set('name', customerName.trim());
    if (phone.trim()) params.set('phone', phone.trim());

    const query = params.toString();
    router.push(`/dashboard/diagnose/camera${query ? `?${query}` : ''}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleStart();
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] w-full bg-zinc-950 text-white">
      {/* 페이지 헤더 */}
      <div className="border-b border-zinc-800/80 bg-zinc-900/80 px-5 sm:px-8 py-4 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-4 max-w-2xl mx-auto">
          <Link
            href="/dashboard"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-bold tracking-widest text-amber-400">
                유니헤어샵 스타일 컨설팅
              </span>
              <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-[9px] font-semibold text-amber-300 border border-amber-400/20">
                1:1 맞춤 분석
              </span>
            </div>
            <h1 className="text-base font-bold text-zinc-100">고객 정보 입력</h1>
          </div>
        </div>
      </div>

      {/* 본문 */}
      <div className="flex-1 flex items-center justify-center p-5 sm:p-8">
        <div className="w-full max-w-md">

          {/* 아이콘 + 타이틀 */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400/20 to-amber-500/10 border border-amber-400/30 text-amber-400 mb-4 shadow-[0_0_30px_rgba(245,208,97,0.15)]">
              <Camera className="h-8 w-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-100 mb-2 tracking-tight">
              AI 헤어 진단 시작
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-xs">
              고객 정보를 입력한 후 카메라 촬영을 시작하세요.
              <br />
              이름 입력은 선택 사항입니다.
            </p>
          </div>

          {/* 입력 폼 카드 */}
          <div className="rounded-3xl bg-zinc-900/60 border border-zinc-800/80 p-6 sm:p-7 backdrop-blur-md space-y-5">

            {/* 고객 이름 */}
            <div className="space-y-2">
              <label
                htmlFor="cc-customer-name"
                className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300"
              >
                <User className="h-3.5 w-3.5 text-zinc-500" />
                고객 이름
                <span className="ml-1 text-zinc-600 font-normal">(선택)</span>
              </label>
              <input
                id="cc-customer-name"
                type="text"
                placeholder="고객 이름을 입력하세요"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={20}
                className={cn(
                  'w-full rounded-xl bg-zinc-950/80 border px-4 py-3 text-sm text-white',
                  'placeholder:text-zinc-600 transition',
                  'focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400/60',
                  'border-zinc-700/80',
                )}
              />
            </div>

            {/* 전화번호 */}
            <div className="space-y-2">
              <label
                htmlFor="cc-customer-phone"
                className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300"
              >
                <Phone className="h-3.5 w-3.5 text-zinc-500" />
                전화번호
                <span className="ml-1 text-zinc-600 font-normal">(선택)</span>
              </label>
              <input
                id="cc-customer-phone"
                type="tel"
                placeholder="010-0000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={13}
                className={cn(
                  'w-full rounded-xl bg-zinc-950/80 border px-4 py-3 text-sm text-white',
                  'placeholder:text-zinc-600 transition',
                  'focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400/60',
                  'border-zinc-700/80',
                )}
              />
            </div>

            {/* 촬영 시작 버튼 */}
            <button
              type="button"
              onClick={handleStart}
              disabled={isNavigating}
              className={cn(
                'group relative mt-2 flex w-full items-center justify-center gap-2.5',
                'rounded-2xl py-4 text-sm font-bold transition-all',
                'bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-zinc-950',
                'shadow-[0_0_25px_rgba(245,208,97,0.3)] hover:brightness-105 hover:shadow-[0_0_35px_rgba(245,208,97,0.45)]',
                'active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none',
              )}
            >
              <Camera className="h-5 w-5" />
              <span>카메라 촬영 시작</span>
              <ChevronRight className="h-4 w-4 opacity-70 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* 안내 배지 */}
          <div className="mt-5 flex items-start gap-2.5 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 px-4 py-3.5">
            <Sparkles className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
            <p className="text-xs text-zinc-400 leading-relaxed">
              <span className="font-semibold text-zinc-200">촬영 팁:</span>{' '}
              밝은 조명 아래에서 정면을 바라보고 촬영하면 AI 진단 정확도가 높아집니다.
              머리카락이 얼굴을 가리지 않도록 해주세요.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
