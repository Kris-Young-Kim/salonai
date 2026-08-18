'use client';

import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { CapturedImage } from '@/types/camera';

interface ImageUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSelected: (image: CapturedImage) => void;
}

export function ImageUploader({ isOpen, onClose, onImageSelected }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const processFile = (file: File) => {
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일(JPG, PNG, WEBP 등)만 업로드할 수 있습니다.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        onImageSelected({
          dataUrl,
          blob: file,
          width: img.naturalWidth || img.width,
          height: img.naturalHeight || img.height,
          mirrored: false,
          capturedAt: new Date(),
        });
        onClose();
      };
      img.onerror = () => {
        setError('이미지를 읽는 중 오류가 발생했습니다.');
      };
      img.src = dataUrl;
    };
    reader.onerror = () => {
      setError('파일을 불러오는 데 실패했습니다.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-3xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Upload className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-100">사진 파일 업로드</h3>
            <p className="text-xs text-zinc-400">정면 얼굴이 잘 나온 사진을 선택해주세요.</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Drag and Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition ${
            isDragging
              ? 'border-amber-400 bg-amber-500/10'
              : 'border-zinc-700 bg-zinc-950/60 hover:border-zinc-500 hover:bg-zinc-800/40'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                processFile(e.target.files[0]);
              }
            }}
          />

          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-800 text-zinc-300 mb-3 shadow-inner">
            <ImageIcon className="h-7 w-7" />
          </div>

          <p className="text-sm font-semibold text-zinc-200">
            클릭하여 사진 선택 또는 드래그 & 드롭
          </p>
          <p className="text-xs text-zinc-500 mt-1">JPG, PNG, WEBP (최대 20MB)</p>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
