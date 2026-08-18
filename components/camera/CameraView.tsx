'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Camera, AlertCircle, RefreshCw, Sparkles, ShieldAlert } from 'lucide-react';
import { useCamera } from '@/hooks/useCamera';
import { FaceGuideOverlay } from './FaceGuideOverlay';
import { CameraControls } from './CameraControls';
import { CountdownOverlay } from './CountdownOverlay';
import { CapturePreview } from './CapturePreview';
import { ImageUploader } from './ImageUploader';
import { GuideMode, TimerMode, CapturedImage, CustomerQuickMeta } from '@/types/camera';

interface CameraViewProps {
  onCaptureComplete?: (image: CapturedImage, customerMeta: CustomerQuickMeta) => void;
}

export function CameraView({ onCaptureComplete }: CameraViewProps) {
  const {
    videoRef,
    isStreaming,
    isLoading,
    error,
    hasPermission,
    facingMode,
    isMirrored,
    availableDevices,
    currentDeviceId,
    startStream,
    switchFacingMode,
    selectDevice,
    toggleMirror,
    captureFrame,
  } = useCamera({
    initialFacingMode: 'user',
    idealWidth: 1920,
    idealHeight: 1080,
  });

  const [guideMode, setGuideMode] = useState<GuideMode>('standard');
  const [timerMode, setTimerMode] = useState<TimerMode>(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<CapturedImage | null>(null);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);

  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, []);

  const triggerCapture = async () => {
    if (isCapturing) return;

    if (timerMode > 0) {
      setIsCapturing(true);
      setCountdown(timerMode);

      let currentCount = timerMode;
      countdownTimerRef.current = setInterval(async () => {
        currentCount -= 1;
        if (currentCount > 0) {
          setCountdown(currentCount);
        } else {
          if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
          setCountdown(null);
          await executeCapture();
        }
      }, 1000);
    } else {
      await executeCapture();
    }
  };

  const executeCapture = async () => {
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 300);

    const image = await captureFrame();
    setIsCapturing(false);

    if (image) {
      setCapturedImage(image);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleConfirm = (image: CapturedImage, customerMeta: CustomerQuickMeta) => {
    if (onCaptureComplete) {
      onCaptureComplete(image, customerMeta);
    } else {
      console.log('Capture confirmed:', { image, customerMeta });
      alert(`[${customerMeta.name}] 고객님의 진단 데이터가 준비되었습니다. (다음 단계: AI 분석)`);
    }
  };

  const handleImageUploaded = (image: CapturedImage) => {
    setCapturedImage(image);
  };

  // If already captured, show Preview screen
  if (capturedImage) {
    return (
      <CapturePreview
        image={capturedImage}
        onRetake={handleRetake}
        onConfirm={handleConfirm}
      />
    );
  }

  return (
    <div className="relative flex flex-col h-full w-full bg-zinc-950 text-white select-none overflow-hidden">
      
      {/* Video Viewport Container */}
      <div className="relative flex-1 flex items-center justify-center bg-black overflow-hidden">
        
        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-950/90 gap-4">
            <RefreshCw className="h-10 w-10 animate-spin text-amber-400" />
            <p className="text-sm font-medium text-zinc-300">카메라를 불러오는 중입니다...</p>
          </div>
        )}

        {/* Error / Permission Denied State */}
        {error && !isLoading && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center bg-zinc-950/95 max-w-md mx-auto">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-4">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-zinc-100 mb-2">카메라 연결 안내</h3>
            <p className="text-xs text-zinc-400 mb-6 leading-relaxed">{error}</p>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                type="button"
                onClick={() => startStream()}
                className="flex-1 rounded-xl bg-amber-400 py-3 text-xs font-bold text-zinc-950 hover:bg-amber-300 transition"
              >
                다시 시도
              </button>
              <button
                type="button"
                onClick={() => setIsUploaderOpen(true)}
                className="flex-1 rounded-xl border border-zinc-700 bg-zinc-900 py-3 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 transition"
              >
                사진 파일 업로드
              </button>
            </div>
          </div>
        )}

        {/* Live Video Element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`h-full w-full object-cover transition-transform duration-300 ${
            isMirrored ? '-scale-x-100' : ''
          }`}
        />

        {/* Face Alignment Guide Overlay */}
        {isStreaming && (
          <FaceGuideOverlay mode={guideMode} isCapturing={isCapturing} />
        )}

        {/* Shutter Countdown & Flash Burst Overlay */}
        <CountdownOverlay countdown={countdown} isFlashing={isFlashing} />
      </div>

      {/* Bottom Camera Control Console */}
      <CameraControls
        onCapture={triggerCapture}
        isCapturing={isCapturing}
        disabled={!isStreaming || isLoading}
        timerMode={timerMode}
        onTimerChange={setTimerMode}
        guideMode={guideMode}
        onGuideChange={setGuideMode}
        isMirrored={isMirrored}
        onToggleMirror={toggleMirror}
        facingMode={facingMode}
        onSwitchCamera={switchFacingMode}
        availableDevices={availableDevices}
        currentDeviceId={currentDeviceId}
        onSelectDevice={selectDevice}
        onUploadClick={() => setIsUploaderOpen(true)}
      />

      {/* Image File Uploader Modal */}
      <ImageUploader
        isOpen={isUploaderOpen}
        onClose={() => setIsUploaderOpen(false)}
        onImageSelected={handleImageUploaded}
      />
    </div>
  );
}
