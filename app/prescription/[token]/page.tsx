import React from 'react';
import { prisma } from '@/lib/db/prisma';
import { notFound } from 'next/navigation';
import {
  Sparkles,
  Scissors,
  Palette,
  Calendar,
  User,
  Heart,
  Share2,
  CheckCircle2,
  Phone,
  MapPin,
  Flame,
} from 'lucide-react';
import Link from 'next/link';

interface PrescriptionPageProps {
  params: Promise<{ token: string }>;
}

export default async function PrescriptionPage({ params }: PrescriptionPageProps) {
  const { token } = await params;

  if (!token) {
    notFound();
  }

  // Fetch diagnosis from Neon DB
  const diagnosis = await prisma.diagnosis.findUnique({
    where: { prescriptionToken: token },
    include: {
      customer: true,
      designer: true,
    },
  });

  if (!diagnosis) {
    notFound();
  }

  const { customer, originalImageUrl, faceShape, personalColor, skinHexColor, selectedStyleTags, designerNotes, createdAt } = diagnosis;

  const dateStr = new Date(createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-amber-400 selection:text-zinc-950 pb-16">
      
      {/* Mobile-Optimized Container */}
      <div className="mx-auto max-w-lg px-4 pt-6 sm:pt-8">
        
        {/* Salon Brand Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 to-amber-500 text-zinc-950 font-black text-sm shadow-[0_0_15px_rgba(245,208,97,0.4)]">
              S
            </div>
            <div>
              <span className="text-sm font-extrabold tracking-tight text-white block">
                SalonAI 헤어살롱
              </span>
              <span className="text-[9px] text-zinc-400 font-mono">
                DIGITAL HAIR PRESCRIPTION
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 rounded-full bg-amber-400/10 px-2.5 py-1 text-[10px] font-bold text-amber-300 border border-amber-400/20">
            <Sparkles className="h-3 w-3 text-amber-400" />
            <span>AI 맞춤 처방전</span>
          </div>
        </div>

        {/* Customer & Issue Date Card */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-5 mb-6 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-0.5">
                Valued Client
              </span>
              <h1 className="text-xl font-extrabold text-white">
                {customer?.name || '고객'} 님의 헤어 처방전
              </h1>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-zinc-500 block">진단 일자</span>
              <span className="text-xs text-zinc-300 font-medium">{dateStr}</span>
            </div>
          </div>

          {/* Quick Tags */}
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-zinc-800/80">
            <span className="rounded-xl bg-zinc-950 px-2.5 py-1 text-xs font-bold text-amber-300 border border-zinc-800">
              #{faceShape}
            </span>
            <span className="rounded-xl bg-zinc-950 px-2.5 py-1 text-xs font-bold text-rose-300 border border-zinc-800">
              #{personalColor}
            </span>
          </div>
        </div>

        {/* Client Photo & Diagnosis Summary */}
        <div className="relative rounded-3xl border-2 border-amber-400/40 bg-zinc-900 overflow-hidden mb-6 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          {originalImageUrl ? (
            <div className="relative aspect-[3/4] w-full bg-zinc-950">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={originalImageUrl}
                alt="고객 진단 사진"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
            </div>
          ) : (
            <div className="aspect-[4/3] flex items-center justify-center bg-zinc-900 text-zinc-600">
              고객 사진
            </div>
          )}

          {/* Floating Diagnosis Overlay Card */}
          <div className="p-5 bg-zinc-900/95 border-t border-zinc-800">
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
              AI 랜드마크 & 퍼스널 컬러 진단 지표
            </h2>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-2xl bg-zinc-950 p-3 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block mb-0.5">얼굴형 분류</span>
                <span className="font-bold text-amber-300">{faceShape}</span>
              </div>

              <div className="rounded-2xl bg-zinc-950 p-3 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block mb-0.5">퍼스널 컬러</span>
                <span className="font-bold text-rose-300">{personalColor}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Styles & Tags Section */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5 mb-6 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-3">
            <Scissors className="h-4 w-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white">추천 및 결정된 헤어스타일</h2>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {selectedStyleTags && selectedStyleTags.length > 0 ? (
              selectedStyleTags.map((tag: string, idx: number) => (
                <span
                  key={idx}
                  className="rounded-xl bg-amber-400/15 border border-amber-400/40 px-3 py-1.5 text-xs font-bold text-amber-300"
                >
                  {tag}
                </span>
              ))
            ) : (
              <span className="text-xs text-zinc-500">지정된 스타일 태그가 없습니다.</span>
            )}
          </div>
        </div>

        {/* Designer Notes Card */}
        <div className="rounded-3xl border border-amber-400/30 bg-zinc-900/90 p-5 mb-6 backdrop-blur-md shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white">담당 디자이너 시술 코멘트 & 홈케어</h2>
          </div>

          <div className="rounded-2xl bg-zinc-950/80 p-4 border border-zinc-800 text-xs text-zinc-300 leading-relaxed whitespace-pre-line">
            {designerNotes || '살롱 맞춤 디자인 처방이 완료되었습니다.'}
          </div>
        </div>

        {/* Salon Contact & Footer */}
        <div className="rounded-3xl bg-zinc-900/40 border border-zinc-800/60 p-5 text-center text-xs text-zinc-400 space-y-2">
          <p className="font-bold text-zinc-200">SalonAI 플래그십 강남점</p>
          <p className="text-[11px] text-zinc-500">서울특별시 강남구 테헤란로 152 • Tel: 02-555-0123</p>
          <p className="text-[10px] text-zinc-600 pt-2">© 2026 SalonAI. All rights reserved.</p>
        </div>

      </div>

    </div>
  );
}
