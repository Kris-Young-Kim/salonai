'use client';

import React, { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, X, Sparkles, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 1. 이미 PWA Standalone 모드로 실행 중인지 확인
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    setIsStandalone(isStandaloneMode);
    if (isStandaloneMode) return;

    // 2. iOS 기기 감지
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // 3. Android / Chrome beforeinstallprompt 이벤트 리스닝
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // 로컬 스토리지에 닫은 기록이 없으면 표시
      const dismissed = localStorage.getItem('salonai_pwa_dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // iOS 사파리이고 아직 PWA가 아니며 dismiss 안 한 경우 안내
    if (isIosDevice) {
      const dismissed = localStorage.getItem('salonai_pwa_dismissed');
      if (!dismissed) {
        // 3초 후 은은하게 표시
        const timer = setTimeout(() => setShowPrompt(true), 3000);
        return () => clearTimeout(timer);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('salonai_pwa_dismissed', 'true');
  };

  if (isStandalone || !showPrompt) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-[calc(100vw-40px)] animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="relative rounded-2xl border border-amber-400/40 bg-zinc-900/95 p-4 shadow-2xl backdrop-blur-xl text-white">
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-zinc-400 hover:text-white transition p-1"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="relative h-11 w-11 shrink-0 rounded-xl overflow-hidden border border-amber-400/40 shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.jpg"
              alt="유니헤어샵"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex-1 pr-4">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                살롱 태블릿 전용 앱 모드
              </span>
            </div>
            <p className="text-xs font-bold text-white mb-1">
              홈 화면에 추가하여 풀스크린으로 사용하세요
            </p>
            <p className="text-[11px] text-zinc-400 leading-relaxed mb-3">
              주소창 없이 네이티브 살롱 키오스크 앱처럼 전체 화면으로 빠르고 쾌적하게 상담할 수 있습니다.
            </p>

            {isIos ? (
              <div className="flex flex-col gap-1 rounded-xl bg-zinc-950/80 p-2.5 border border-zinc-800 text-[11px] text-zinc-300">
                <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                  <Share className="h-3.5 w-3.5" />
                  <span>하단 공유 버튼</span> ➡️ <span>[홈 화면에 추가]</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-400 text-[10px]">
                  <PlusSquare className="h-3.5 w-3.5" />
                  <span>터치 시 전용 앱 아이콘이 생성됩니다.</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 px-3.5 py-1.5 text-xs font-bold text-zinc-950 hover:brightness-105 transition shadow-md"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>홈 화면에 앱 추가</span>
                </button>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="text-[11px] font-medium text-zinc-400 hover:text-white px-2 py-1"
                >
                  나중에
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
