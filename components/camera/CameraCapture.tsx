'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, ShieldAlert, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CapturedData {
  dataUrl: string;
  width: number;
  height: number;
  capturedAt: Date;
}

interface CameraCaptureProps {
  /** 고객 이름 (선택) — 미리보기 화면에 표시 */
  customerName?: string;
  /** 진단 시작 버튼 클릭 시 호출 */
  onDiagnoseStart?: (data: CapturedData) => void;
  /** 뒤로 가기 버튼 클릭 시 호출 */
  onBack?: () => void;
}

// ─── 계란형 타원 오버레이 ────────────────────────────────────────────────────

function OvalGuideOverlay({ isCapturing }: { isCapturing: boolean }) {
  // viewBox 400×560, 타원 중심 (200, 260), rx=130, ry=169 (너비의 65% / 높이 1.3× 너비)
  const cx = 200;
  const cy = 260;
  const rx = 130;
  const ry = 169;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
      <svg
        viewBox="0 0 400 560"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(
          'absolute inset-0 w-full h-full transition-opacity duration-300',
          isCapturing ? 'opacity-70' : 'opacity-100',
        )}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* 마스크: 타원 바깥을 반투명 검정으로 */}
          <mask id="cc-oval-mask">
            {/* 전체 흰 배경 → 마스크 적용 대상 */}
            <rect width="400" height="560" fill="white" />
            {/* 타원은 검정 → 이 영역은 마스크에서 제외 */}
            <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="black" />
          </mask>
        </defs>

        {/* 타원 바깥 반투명 어두운 마스크 */}
        <rect
          width="400"
          height="560"
          fill="rgba(0, 0, 0, 0.52)"
          mask="url(#cc-oval-mask)"
        />

        {/* 타원 테두리 — 흰색 점선 */}
        <ellipse
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeDasharray="10 6"
          strokeLinecap="round"
        />

        {/* 상단 중앙 헤어라인 마커 */}
        <line
          x1={cx}
          y1={cy - ry - 16}
          x2={cx}
          y2={cy - ry + 10}
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* 하단 중앙 턱 마커 */}
        <line
          x1={cx}
          y1={cy + ry - 10}
          x2={cx}
          y2={cy + ry + 16}
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* 좌우 귀 위치 마커 */}
        <line
          x1={cx - rx - 16}
          y1={cy}
          x2={cx - rx + 10}
          y2={cy}
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1={cx + rx - 10}
          y1={cy}
          x2={cx + rx + 16}
          y2={cy}
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* 눈 수평선 — 황금색 */}
        <line
          x1={cx - rx + 20}
          y1={cy - 40}
          x2={cx + rx - 20}
          y2={cy - 40}
          stroke="rgba(245,208,97,0.75)"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
      </svg>

      {/* 상단 안내 배지 */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/60 px-4 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm border border-white/15 flex items-center gap-2">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
        얼굴을 타원 안에 맞춰주세요
      </div>
    </div>
  );
}

// ─── 셔터 플래시 효과 ─────────────────────────────────────────────────────────

function ShutterFlash({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-50 bg-white animate-[fadeOut_0.35s_ease-out_forwards]" />
  );
}

// ─── 미리보기 화면 ────────────────────────────────────────────────────────────

interface PreviewScreenProps {
  data: CapturedData;
  customerName?: string;
  onRetake: () => void;
  onDiagnoseStart: () => void;
}

function PreviewScreen({ data, customerName, onRetake, onDiagnoseStart }: PreviewScreenProps) {
  return (
    <div className="flex flex-col h-full w-full bg-zinc-950 text-white overflow-y-auto">
      {/* 상단 헤더 */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-900/80 px-5 py-4 backdrop-blur-md shrink-0">
        <div>
          <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-0.5">
            촬영 완료
          </p>
          <h2 className="text-base font-bold text-zinc-100">
            {customerName ? `${customerName} 고객님` : '고객 사진'} 확인
          </h2>
        </div>
        <div className="rounded-xl bg-zinc-800/60 border border-zinc-700/60 px-3 py-1.5 text-[11px] font-mono text-zinc-400">
          {data.width} × {data.height}px
        </div>
      </div>

      {/* 본문 */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 p-5 sm:p-8">
        {/* 촬영 이미지 */}
        <div className="relative w-full max-w-xs aspect-[3/4] rounded-3xl overflow-hidden border-2 border-amber-400/40 shadow-[0_0_50px_rgba(0,0,0,0.8)] bg-zinc-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.dataUrl}
            alt="촬영된 얼굴 사진"
            className="w-full h-full object-cover"
          />
          {/* 계란형 가이드 미리보기 오버레이 (미세하게) */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <svg
              viewBox="0 0 300 400"
              className="absolute inset-0 w-full h-full opacity-20"
              preserveAspectRatio="xMidYMid meet"
            >
              <ellipse
                cx="150"
                cy="195"
                rx="90"
                ry="117"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeDasharray="8 5"
              />
            </svg>
          </div>
          {/* 촬영 시각 */}
          <div className="absolute bottom-3 right-3 rounded-lg bg-black/70 px-2 py-1 text-[10px] font-mono text-zinc-400 backdrop-blur-sm border border-white/10">
            {data.capturedAt.toLocaleTimeString('ko-KR')}
          </div>
        </div>

        {/* 안내 텍스트 */}
        <p className="text-xs text-zinc-400 text-center leading-relaxed max-w-[280px]">
          사진의 초점이 맞고 얼굴이 타원 안에 잘 들어왔는지 확인해주세요.
          <br />
          문제가 있다면 다시 찍을 수 있습니다.
        </p>

        {/* 액션 버튼 */}
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            type="button"
            onClick={onDiagnoseStart}
            className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 py-4 text-sm font-bold text-zinc-950 shadow-[0_0_25px_rgba(245,208,97,0.35)] hover:brightness-105 active:scale-[0.98] transition-all"
          >
            <Sparkles className="h-5 w-5" />
            <span>AI 스타일 컨설팅 시작하기</span>
          </button>

          <button
            type="button"
            onClick={onRetake}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-700/80 bg-zinc-800/60 py-3.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white active:scale-[0.98] transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            <span>다시 찍기</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── 카메라 에러 화면 ─────────────────────────────────────────────────────────

function CameraError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center bg-zinc-950">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 mb-4">
        <ShieldAlert className="h-8 w-8" />
      </div>
      <h3 className="text-base font-bold text-zinc-100 mb-2">카메라를 사용할 수 없습니다</h3>
      <p className="text-xs text-zinc-400 mb-6 leading-relaxed max-w-xs">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-xl bg-amber-400 px-6 py-3 text-sm font-bold text-zinc-950 hover:bg-amber-300 active:scale-95 transition"
      >
        다시 시도하기
      </button>
    </div>
  );
}

// ─── 메인 CameraCapture 컴포넌트 ─────────────────────────────────────────────

export function CameraCapture({ customerName, onDiagnoseStart, onBack }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [capturedData, setCapturedData] = useState<CapturedData | null>(null);

  // 스트림 정지
  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsStreaming(false);
  }, []);

  // 카메라 시작
  const startStream = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    stopStream();

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw Object.assign(new Error('이 브라우저는 카메라를 지원하지 않습니다.'), {
          name: 'NotSupportedError',
        });
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      setIsStreaming(true);
    } catch (err: unknown) {
      const e = err as { name?: string; message?: string };
      let msg = '카메라를 시작할 수 없습니다.';

      if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
        msg =
          '카메라 접근 권한이 거부되었습니다. 브라우저 주소창의 자물쇠 아이콘을 클릭하여 카메라 권한을 허용해주세요.';
      } else if (e.name === 'NotFoundError' || e.name === 'DevicesNotFoundError') {
        msg = '연결된 카메라 장치를 찾을 수 없습니다. 카메라가 제대로 연결되어 있는지 확인해주세요.';
      } else if (e.name === 'NotReadableError' || e.name === 'TrackStartError') {
        msg = '카메라가 다른 앱에서 사용 중입니다. 다른 앱을 종료한 후 다시 시도해주세요.';
      } else if (e.name === 'NotSupportedError') {
        msg = e.message ?? msg;
      }

      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [stopStream]);

  // 마운트 시 자동 시작, 언마운트 시 정리
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      if (isMounted) {
        await startStream();
      }
    };

    init();

    return () => {
      isMounted = false;
      stopStream();
    };
  }, [startStream, stopStream]);

  // 촬영 실행
  const handleCapture = useCallback(async () => {
    if (isCapturing || !isStreaming || !videoRef.current) return;
    setIsCapturing(true);

    // 셔터 플래시
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 350);

    const video = videoRef.current;
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      setIsCapturing(false);
      return;
    }

    // 전면 카메라 → 좌우 반전 보정 (자연스러운 셀카 방향으로 저장)
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, width, height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

    setCapturedData({ dataUrl, width, height, capturedAt: new Date() });
    setIsCapturing(false);

    // 미리보기로 전환 후 스트림 정지
    stopStream();
  }, [isCapturing, isStreaming, stopStream]);

  // 다시 찍기
  const handleRetake = useCallback(() => {
    setCapturedData(null);
    startStream();
  }, [startStream]);

  // 진단 시작
  const handleDiagnoseStart = useCallback(() => {
    if (capturedData && onDiagnoseStart) {
      onDiagnoseStart(capturedData);
    }
  }, [capturedData, onDiagnoseStart]);

  // ── 미리보기 화면 ──
  if (capturedData) {
    return (
      <PreviewScreen
        data={capturedData}
        customerName={customerName}
        onRetake={handleRetake}
        onDiagnoseStart={handleDiagnoseStart}
      />
    );
  }

  // ── 카메라 뷰 ──
  return (
    <div className="relative flex flex-col h-full w-full bg-black select-none overflow-hidden">
      {/* 라이브 비디오 — 전면 카메라는 CSS mirror (미리보기만, 캡처는 별도 처리) */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 h-full w-full object-cover -scale-x-100"
      />

      {/* 로딩 스피너 */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 gap-3">
          <RefreshCw className="h-9 w-9 animate-spin text-amber-400" />
          <p className="text-sm font-medium text-zinc-300">카메라 준비 중...</p>
        </div>
      )}

      {/* 에러 */}
      {error && !isLoading && (
        <CameraError message={error} onRetry={startStream} />
      )}

      {/* 계란형 오버레이 */}
      {isStreaming && !isLoading && (
        <OvalGuideOverlay isCapturing={isCapturing} />
      )}

      {/* 셔터 플래시 */}
      <ShutterFlash visible={isFlashing} />

      {/* 상단 뒤로가기 버튼 (onBack prop이 있을 때만) */}
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="absolute top-4 left-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm border border-white/20 hover:bg-black/70 transition"
          aria-label="뒤로가기"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      )}

      {/* 하단 촬영 버튼 패널 */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex flex-col items-center pb-10 pt-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        {/* 촬영 버튼 */}
        <button
          type="button"
          onClick={handleCapture}
          disabled={!isStreaming || isCapturing || isLoading || !!error}
          aria-label="사진 촬영"
          className={cn(
            'group relative flex h-[76px] w-[76px] sm:h-[84px] sm:w-[84px] items-center justify-center rounded-full',
            'transition-transform active:scale-90 disabled:opacity-40 disabled:pointer-events-none',
          )}
        >
          {/* 외부 테두리 링 */}
          <span className="absolute inset-0 rounded-full border-[3px] border-white/80" />
          {/* 내부 흰색 원 */}
          <span
            className={cn(
              'relative flex h-[58px] w-[58px] sm:h-[66px] sm:w-[66px] items-center justify-center rounded-full',
              'bg-white shadow-inner transition-transform group-hover:scale-95',
              isCapturing && 'scale-90 bg-amber-100',
            )}
          >
            <Camera className="h-7 w-7 text-zinc-800" />
          </span>
        </button>

        {/* 안내 텍스트 */}
        <p className="mt-4 text-[11px] font-medium text-white/60 tracking-wide">
          버튼을 눌러 촬영하세요
        </p>
      </div>
    </div>
  );
}

export default CameraCapture;
