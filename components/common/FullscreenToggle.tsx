'use client';

import React, { useState, useEffect } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';

interface FullscreenToggleProps {
  className?: string;
  showText?: boolean;
}

export function FullscreenToggle({ className = '', showText = false }: FullscreenToggleProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    const checkFullscreenSupport = () => {
      const doc = document as unknown as {
        fullscreenEnabled?: boolean;
        webkitFullscreenEnabled?: boolean;
        mozFullScreenEnabled?: boolean;
        msFullscreenEnabled?: boolean;
      };
      const supported = !!(
        doc.fullscreenEnabled ||
        doc.webkitFullscreenEnabled ||
        doc.mozFullScreenEnabled ||
        doc.msFullscreenEnabled
      );
      setIsSupported(supported);
    };

    const handleFullscreenChange = () => {
      const doc = document as unknown as {
        fullscreenElement?: Element;
        webkitFullscreenElement?: Element;
        mozFullScreenElement?: Element;
        msFullscreenElement?: Element;
      };
      setIsFullscreen(
        !!(
          doc.fullscreenElement ||
          doc.webkitFullscreenElement ||
          doc.mozFullScreenElement ||
          doc.msFullscreenElement
        )
      );
    };

    checkFullscreenSupport();
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!isFullscreen) {
        const el = document.documentElement as unknown as {
          requestFullscreen?: () => Promise<void>;
          webkitRequestFullscreen?: () => Promise<void>;
          mozRequestFullScreen?: () => Promise<void>;
          msRequestFullscreen?: () => Promise<void>;
        };
        if (el.requestFullscreen) {
          await el.requestFullscreen();
        } else if (el.webkitRequestFullscreen) {
          await el.webkitRequestFullscreen();
        } else if (el.mozRequestFullScreen) {
          await el.mozRequestFullScreen();
        } else if (el.msRequestFullscreen) {
          await el.msRequestFullscreen();
        }
      } else {
        const doc = document as unknown as {
          exitFullscreen?: () => Promise<void>;
          webkitExitFullscreen?: () => Promise<void>;
          mozCancelFullScreen?: () => Promise<void>;
          msExitFullscreen?: () => Promise<void>;
        };
        if (doc.exitFullscreen) {
          await doc.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen();
        } else if (doc.mozCancelFullScreen) {
          await doc.mozCancelFullScreen();
        } else if (doc.msExitFullscreen) {
          await doc.msExitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Fullscreen request failed or was blocked by browser:', err);
    }
  };

  if (!isSupported) return null;

  return (
    <button
      type="button"
      onClick={toggleFullscreen}
      title={isFullscreen ? '창 모드로 복귀' : '태블릿 전체화면 모드'}
      className={`flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/90 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-amber-300 hover:border-amber-400/40 transition shadow-sm active:scale-95 ${className}`}
    >
      {isFullscreen ? (
        <>
          <Minimize2 className="h-3.5 w-3.5 text-amber-400" />
          {showText && <span>화면 축소</span>}
        </>
      ) : (
        <>
          <Maximize2 className="h-3.5 w-3.5 text-amber-400" />
          {showText && <span>태블릿 풀스크린</span>}
        </>
      )}
    </button>
  );
}
