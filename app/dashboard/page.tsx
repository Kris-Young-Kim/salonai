'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import {
  Camera,
  Users,
  TrendingUp,
  Clock,
  ChevronRight,
  Sparkles,
  Calendar,
  Scissors,
  Palette,
  FileCheck2,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsData {
  today: number;
  thisMonth: number;
  total: number;
}

// ─── 날짜 포맷 헬퍼 ──────────────────────────────────────────────────────────
function getTodayKorean() {
  const d = new Date();
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [stats, setStats] = useState<StatsData>({ today: 0, thisMonth: 0, total: 0 });

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(() => {});
  }, []);

  const displayName =
    isLoaded && user
      ? user.firstName ?? user.username ?? user.emailAddresses[0]?.emailAddress?.split('@')[0] ?? '디자이너'
      : '디자이너';

  return (
    <div className="min-h-[calc(100vh-64px)] bg-zinc-950 text-white px-4 sm:px-6 md:px-10 py-8 max-w-6xl mx-auto">
      
      {/* ── 상단 럭셔리 인사말 헤더 ───────────────────────────────────────────── */}
      <header className="mb-8 flex items-start justify-between gap-4 flex-wrap border-b border-zinc-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="rounded-full bg-amber-400/10 px-3 py-1 text-[11px] font-bold text-amber-300 border border-amber-400/20 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              SalonAI Pro 태블릿 에디션
            </span>
          </div>
          {isLoaded ? (
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              반갑습니다, <span className="text-amber-400">{displayName}</span> 원장님 ✨
            </h1>
          ) : (
            <div className="h-9 w-60 rounded-2xl bg-zinc-800 animate-pulse" />
          )}
          <div className="flex items-center gap-2 mt-2 text-xs sm:text-sm text-zinc-400 font-medium">
            <Calendar className="h-4 w-4 text-amber-400/80" />
            <span>{getTodayKorean()}</span>
          </div>
        </div>

        {/* 살롱 매장 상태 배지 */}
        <div className="flex items-center gap-2.5 rounded-2xl border border-zinc-800 bg-zinc-900/80 px-4 py-2.5 backdrop-blur-md">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div className="text-right">
            <p className="text-xs font-bold text-zinc-200">플래그십 강남점</p>
            <p className="text-[10px] text-zinc-500 font-mono">Neon Live Connected</p>
          </div>
        </div>
      </header>

      {/* ── 메인 CTA: 1분 AI 헤어 진단 시작 ────────────────────────────────────── */}
      <Link
        href="/diagnose"
        className="group relative flex items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 p-6 sm:p-8 shadow-[0_0_40px_rgba(245,208,97,0.25)] hover:shadow-[0_0_55px_rgba(245,208,97,0.4)] hover:brightness-105 active:scale-[0.99] transition-all mb-8 text-zinc-950 overflow-hidden"
      >
        <div className="relative z-10 flex items-center gap-5 sm:gap-6">
          <div className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-3xl bg-zinc-950 text-amber-400 shadow-xl border border-amber-400/40">
            <Camera className="h-8 w-8 sm:h-10 sm:w-10 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-full bg-zinc-950/15 px-2.5 py-0.5 text-[10px] sm:text-xs font-black uppercase tracking-wider text-zinc-900">
                1분 초정밀 분석
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950">
              새 고객 AI 진단 시작하기
            </p>
            <p className="text-xs sm:text-sm text-zinc-900/80 mt-1 font-medium max-w-md">
              카메라 촬영 1번에 얼굴형 · 3단 안부 · 퍼스널컬러 진단 및 맞춤 룩북을 즉시 추천합니다.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-950/10 group-hover:bg-zinc-950/20 group-hover:translate-x-1 transition-all shrink-0">
          <ChevronRight className="h-7 w-7 text-zinc-950" />
        </div>

        {/* Ambient background deco */}
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/20 blur-2xl pointer-events-none" />
      </Link>

      {/* ── 살롱 통계 지표 카드 그리드 ────────────────────────────────────────── */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-3xl border border-amber-400/40 bg-zinc-900/90 p-5 backdrop-blur-md shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">오늘 AI 진단 완료</p>
            <p className="text-3xl font-black text-white">
              {stats.today}<span className="text-sm font-semibold text-zinc-400 ml-1">건</span>
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400 border border-amber-400/30">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5 backdrop-blur-md shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-400 mb-1">이번 달 진단</p>
            <p className="text-3xl font-black text-white">
              {stats.thisMonth}<span className="text-sm font-semibold text-zinc-400 ml-1">건</span>
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-800 text-sky-400 border border-zinc-700">
            <FileCheck2 className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5 backdrop-blur-md shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-400 mb-1">누적 진단</p>
            <p className="text-3xl font-black text-white">
              {stats.total}<span className="text-sm font-semibold text-zinc-400 ml-1">건</span>
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-800 text-rose-400 border border-zinc-700">
            <Users className="h-6 w-6" />
          </div>
        </div>
      </section>

      {/* ── 퀵 살롱 액션 및 워크플로우 ────────────────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* Left: 4단계 진단 워크플로우 */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 backdrop-blur-md">
          <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400" />
            스마트 태블릿 살롱 워크플로우
          </h3>

          <div className="space-y-3.5">
            {[
              {
                step: '01',
                title: '실시간 가이드 촬영 (FR-101)',
                desc: '황금비율 계란형 오버레이에 맞춰 3초 촬영',
                color: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
              },
              {
                step: '02',
                title: '얼굴형 & 퍼스널컬러 AI 진단 (FR-102, 103)',
                desc: '468 랜드마크 분석 및 CIE-Lab 피부톤 4계절 분류',
                color: 'text-rose-400 bg-rose-400/10 border-rose-400/30',
              },
              {
                step: '03',
                title: '맞춤 룩북 매칭 및 스타일 선택 (FR-104)',
                desc: '24종 K-살롱 마스터 룩북 다차원 적합도 갤러리',
                color: 'text-sky-400 bg-sky-400/10 border-sky-400/30',
              },
              {
                step: '04',
                title: '모바일 헤어 처방전 발송 (FR-202)',
                desc: '디자이너 시술 메모와 함께 고객 카카오톡으로 즉시 전송',
                color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="flex items-center gap-3.5 rounded-2xl bg-zinc-950/80 p-3.5 border border-zinc-800/80"
              >
                <span
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-xs font-black',
                    item.color
                  )}
                >
                  {item.step}
                </span>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-zinc-100">{item.title}</h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: 빠른 기능 메뉴 */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 backdrop-blur-md flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Layers className="h-4 w-4 text-amber-400" />
              디자이너 빠른 실행
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <Link
                href="/diagnose"
                className="group rounded-2xl bg-zinc-950 border border-zinc-800 p-4 hover:border-amber-400/50 transition-all flex flex-col justify-between h-28"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400">
                    <Camera className="h-4 w-4" />
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-zinc-600 group-hover:text-amber-400 transition" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-amber-300">카메라 진단</p>
                  <p className="text-[10px] text-zinc-500">실시간 얼굴/두상 분석</p>
                </div>
              </Link>

              <Link
                href="/diagnose"
                className="group rounded-2xl bg-zinc-950 border border-zinc-800 p-4 hover:border-amber-400/50 transition-all flex flex-col justify-between h-28"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-400/10 text-rose-400">
                    <Palette className="h-4 w-4" />
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-zinc-600 group-hover:text-rose-400 transition" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-rose-300">퍼스널 컬러</p>
                  <p className="text-[10px] text-zinc-500">4계절 염색약 매칭</p>
                </div>
              </Link>
            </div>
          </div>

          {/* 하단 살롱 팁 */}
          <div className="rounded-2xl bg-amber-400/10 border border-amber-400/20 p-4 text-xs text-amber-200/90 leading-relaxed">
            <strong className="text-amber-300 block mb-1">💡 오늘의 살롱 컨설팅 팁:</strong>
            중안부가 긴 고객님에게는 사이드뱅과 허쉬 레이어드 컷으로 시선을 가로로 분할해주면 만족도가 매우 높습니다.
          </div>
        </div>

      </section>

    </div>
  );
}
