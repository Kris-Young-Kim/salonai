'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { CameraDevice, FacingMode, CapturedImage } from '@/types/camera';

interface UseCameraOptions {
  initialFacingMode?: FacingMode;
  idealWidth?: number;
  idealHeight?: number;
}

export function useCamera({
  initialFacingMode = 'user',
  idealWidth = 1920,
  idealHeight = 1080,
}: UseCameraOptions = {}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [facingMode, setFacingMode] = useState<FacingMode>(initialFacingMode);
  const [availableDevices, setAvailableDevices] = useState<CameraDevice[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isMirrored, setIsMirrored] = useState(initialFacingMode === 'user');

  // Enumerate video input devices
  const updateDevices = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) return;
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices
        .filter((d) => d.kind === 'videoinput')
        .map((d, index) => ({
          deviceId: d.deviceId,
          label: d.label || `카메라 ${index + 1}`,
        }));
      setAvailableDevices(videoDevices);
    } catch (err) {
      console.warn('Failed to enumerate media devices:', err);
    }
  }, []);

  // Stop current active media stream
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  }, []);

  // Start media stream
  const startStream = useCallback(
    async (deviceId?: string, targetFacingMode?: FacingMode) => {
      setIsLoading(true);
      setError(null);
      stopStream();

      const activeFacingMode = targetFacingMode || facingMode;

      const constraints: MediaStreamConstraints = {
        audio: false,
        video: deviceId
          ? {
              deviceId: { exact: deviceId },
              width: { ideal: idealWidth },
              height: { ideal: idealHeight },
            }
          : {
              facingMode: activeFacingMode,
              width: { ideal: idealWidth },
              height: { ideal: idealHeight },
            },
      };

      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('이 브라우저는 카메라 스트리밍을 지원하지 않습니다.');
        }

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }

        // Detect actual active device ID
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          const settings = videoTrack.getSettings();
          if (settings.deviceId) {
            setCurrentDeviceId(settings.deviceId);
          }
        }

        setHasPermission(true);
        setIsStreaming(true);
        setIsMirrored(activeFacingMode === 'user');
        await updateDevices();
      } catch (err: unknown) {
        console.error('Camera access error:', err);
        const errorObj = err as { name?: string; message?: string };
        let message = '카메라를 시작할 수 없습니다.';

        if (errorObj.name === 'NotAllowedError' || errorObj.name === 'PermissionDeniedError') {
          message = '카메라 접근 권한이 거부되었습니다. 브라우저 주소창에서 권한을 허용해주세요.';
          setHasPermission(false);
        } else if (errorObj.name === 'NotFoundError' || errorObj.name === 'DevicesNotFoundError') {
          message = '사용 가능한 카메라 장치를 찾을 수 없습니다.';
        } else if (errorObj.name === 'NotReadableError' || errorObj.name === 'TrackStartError') {
          message = '카메라가 다른 애플리케이션에서 사용 중입니다.';
        } else if (errorObj.message) {
          message = errorObj.message;
        }

        setError(message);
        setIsStreaming(false);
      } finally {
        setIsLoading(false);
      }
    },
    [facingMode, idealHeight, idealWidth, stopStream, updateDevices]
  );

  // Switch facing mode (Front <-> Back)
  const switchFacingMode = useCallback(async () => {
    const nextMode: FacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    setCurrentDeviceId(null);
    await startStream(undefined, nextMode);
  }, [facingMode, startStream]);

  // Select a specific device ID
  const selectDevice = useCallback(
    async (deviceId: string) => {
      setCurrentDeviceId(deviceId);
      await startStream(deviceId);
    },
    [startStream]
  );

  // Toggle mirror manually
  const toggleMirror = useCallback(() => {
    setIsMirrored((prev) => !prev);
  }, []);

  // Capture current video frame to high-res image
  const captureFrame = useCallback((): Promise<CapturedImage | null> => {
    return new Promise((resolve) => {
      if (!videoRef.current || !isStreaming) {
        resolve(null);
        return;
      }

      const video = videoRef.current;
      const width = video.videoWidth || 1920;
      const height = video.videoHeight || 1080;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve(null);
        return;
      }

      // Handle mirroring
      if (isMirrored) {
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(video, 0, 0, width, height);

      // Restore transform
      if (isMirrored) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      }

      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve({
              dataUrl,
              blob,
              width,
              height,
              mirrored: isMirrored,
              capturedAt: new Date(),
            });
          } else {
            resolve(null);
          }
        },
        'image/jpeg',
        0.95
      );
    });
  }, [isMirrored, isStreaming]);

  // Initial startup
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

  return {
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
    stopStream,
    switchFacingMode,
    selectDevice,
    toggleMirror,
    captureFrame,
  };
}
