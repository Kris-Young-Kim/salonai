'use client';

import React, { Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CameraCapture } from '@/components/camera/CameraCapture';

// ─── 내부 컴포넌트 (useSearchParams 사용) ────────────────────────────────────
// Next.js 16 App Router: useSearchParams()는 Suspense boundary 안에서만 사용 가능

function CameraPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const customerName = searchParams.get('name') ?? undefined;

  const handleDiagnoseStart = useCallback(
    (data: { dataUrl: string; width: number; height: number; capturedAt: Date }) => {
      // FR-102 연계: 실제 구현 시 이미지 데이터를 전달하거나 상태 관리로 넘김
      // 현재는 AI 진단 결과 페이지(미구현)로 라우팅하는 자리
      console.log('[FR-101] Capture complete, ready for FR-102:', {
        width: data.width,
        height: data.height,
        capturedAt: data.capturedAt,
        dataUrlLength: data.dataUrl.length,
        customerName,
      });

      // TODO: FR-102 구현 후 아래 경로로 교체
      // router.push('/dashboard/diagnose/result?...')
      alert(
        `[${customerName ?? '고객님'}] 촬영 완료!\n` +
          `해상도: ${data.width}×${data.height}px\n` +
          `FR-102 AI 진단 연동 대기 중...`,
      );
    },
    [customerName],
  );

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  return (
    // dashboard layout의 <main>이 flex-1 overflow-y-auto이므로
    // h-full로 해당 영역 전체를 채우고 overflow-hidden으로 스크롤 차단
    <div className="flex flex-col h-full min-h-[calc(100vh-64px)] w-full bg-black overflow-hidden">
      {/* 카메라 상단 정보 바 */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 pt-3 pb-2 pointer-events-none">
        {/* 고객 이름 배지 (있을 때만) */}
        {customerName && (
          <div className="rounded-full bg-black/60 border border-white/15 px-3.5 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-sm pointer-events-none">
            {customerName} 고객님
          </div>
        )}
        {/* FR-101 배지 */}
        <div className="ml-auto rounded-full bg-black/60 border border-amber-400/30 px-3 py-1 text-[10px] font-bold tracking-widest text-amber-300/90 uppercase backdrop-blur-sm pointer-events-none">
          FR-101
        </div>
      </div>

      {/* CameraCapture 컴포넌트 */}
      <CameraCapture
        customerName={customerName}
        onDiagnoseStart={handleDiagnoseStart}
        onBack={handleBack}
      />
    </div>
  );
}

// ─── 페이지 컴포넌트 (Suspense 래퍼) ─────────────────────────────────────────

export default function DiagnoseCameraPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full min-h-[calc(100vh-64px)] w-full items-center justify-center bg-black">
          <div className="flex flex-col items-center gap-3 text-white/60">
            <svg
              className="h-8 w-8 animate-spin text-amber-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
            <span className="text-sm font-medium">카메라 준비 중...</span>
          </div>
        </div>
      }
    >
      <CameraPageInner />
    </Suspense>
  );
}
