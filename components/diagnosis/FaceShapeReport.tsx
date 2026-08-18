'use client';

import React from 'react';
import { FaceAnalysisResult } from '@/types/diagnosis';
import { CustomerQuickMeta } from '@/types/camera';
import {
  Sparkles,
  Scissors,
  HelpCircle,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Award,
  CheckCircle,
} from 'lucide-react';

interface FaceShapeReportProps {
  analysis: FaceAnalysisResult;
  customerMeta: CustomerQuickMeta;
  onProceedToLookbook: () => void;
  onRetake: () => void;
}

export function FaceShapeReport({
  analysis,
  customerMeta,
  onProceedToLookbook,
  onRetake,
}: FaceShapeReportProps) {
  const { facialThirds, facialWidths, stylingTips } = analysis;

  return (
    <div className="flex flex-col gap-6 w-full max-w-full text-white">
      
      {/* 1. Main Face Shape Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-amber-400/40 bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 p-6 shadow-[0_0_40px_rgba(245,208,97,0.15)]">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Award className="w-44 h-44 text-amber-400" />
        </div>

        <div className="relative z-10 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-amber-400/20 px-3 py-1 text-xs font-bold text-amber-300 border border-amber-400/40 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                AI 두상 & 안면 분석 결과
              </span>
              <span className="text-xs text-zinc-400">신뢰도 {analysis.confidence}%</span>
            </div>

            <span className="text-xs font-semibold text-zinc-300">
              {customerMeta.name} ({customerMeta.gender === 'female' ? '여성' : customerMeta.gender === 'male' ? '남성' : '공통'})
            </span>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
                {analysis.faceShapeKorean}
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 mt-1 leading-relaxed">
              {analysis.description}
            </p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {analysis.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-xl bg-zinc-800/80 px-2.5 py-1 text-[11px] font-semibold text-amber-300 border border-zinc-700/60"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 2. 3단 안부 비율 (Facial Thirds) 카드 */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-5 sm:p-6 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-400/20 text-amber-400 text-xs font-bold">
              3:3:3
            </span>
            상안부 · 중안부 · 하안부 3단 길이 비율
          </h3>
          <span className="text-[11px] text-zinc-400 font-mono">황금기준 1 : 1 : 1</span>
        </div>

        {/* 3-Section Percentage Visual Bar */}
        <div className="space-y-4">
          <div className="w-full h-8 rounded-2xl bg-zinc-950 border border-zinc-800 p-1 flex overflow-hidden gap-1 font-mono text-xs font-bold text-zinc-950">
            <div
              style={{ width: `${facialThirds.upperPercent}%` }}
              className="bg-amber-200 rounded-xl flex items-center justify-center transition-all"
              title={`상안부: ${facialThirds.upperPercent}%`}
            >
              <span className="truncate px-1 text-[10px]">상 {facialThirds.upperPercent}%</span>
            </div>
            <div
              style={{ width: `${facialThirds.middlePercent}%` }}
              className="bg-amber-400 rounded-xl flex items-center justify-center transition-all shadow-[0_0_10px_rgba(245,208,97,0.5)]"
              title={`중안부: ${facialThirds.middlePercent}%`}
            >
              <span className="truncate px-1 text-[10px]">중 {facialThirds.middlePercent}%</span>
            </div>
            <div
              style={{ width: `${facialThirds.lowerPercent}%` }}
              className="bg-yellow-500 rounded-xl flex items-center justify-center transition-all"
              title={`하안부: ${facialThirds.lowerPercent}%`}
            >
              <span className="truncate px-1 text-[10px]">하 {facialThirds.lowerPercent}%</span>
            </div>
          </div>

          {/* Detailed Measurement Row */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
            <div className="rounded-2xl bg-zinc-950/60 border border-zinc-800 p-3">
              <span className="text-[11px] text-zinc-400 block mb-0.5">상안부 (이마~눈썹)</span>
              <span className="text-base font-bold text-amber-200">
                {facialThirds.upperRatio} <span className="text-xs font-normal text-zinc-500">ratio</span>
              </span>
              <p className="text-[10px] text-zinc-500 mt-0.5">
                {facialThirds.upperRatio > 1.08 ? '약간 넓은 편' : facialThirds.upperRatio < 0.92 ? '약간 좁은 편' : '표준 균형'}
              </p>
            </div>

            <div className="rounded-2xl bg-zinc-950/60 border border-amber-400/40 p-3 shadow-[0_0_15px_rgba(245,208,97,0.08)]">
              <span className="text-[11px] text-amber-300 font-semibold block mb-0.5">중안부 (눈썹~코끝)</span>
              <span className="text-base font-bold text-amber-400">
                {facialThirds.middleRatio} <span className="text-xs font-normal text-zinc-500">ratio</span>
              </span>
              <p className="text-[10px] text-amber-300/80 mt-0.5 font-medium">
                {facialThirds.middleRatio > 1.08 ? '긴 중안부 (사이드뱅 추천)' : facialThirds.middleRatio < 0.92 ? '짧은 중안부 (동안형)' : '이상적 황금비율'}
              </p>
            </div>

            <div className="rounded-2xl bg-zinc-950/60 border border-zinc-800 p-3">
              <span className="text-[11px] text-zinc-400 block mb-0.5">하안부 (코끝~턱끝)</span>
              <span className="text-base font-bold text-yellow-400">
                {facialThirds.lowerRatio} <span className="text-xs font-normal text-zinc-500">ratio</span>
              </span>
              <p className="text-[10px] text-zinc-500 mt-0.5">
                {facialThirds.lowerRatio > 1.08 ? '갸름한 긴 턱선' : facialThirds.lowerRatio < 0.92 ? '짧고 귀여운 턱선' : '표준 균형'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 안면 가로/세로 폭 및 골격 비율 */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-5 sm:p-6 backdrop-blur-md">
        <h3 className="text-sm font-bold text-zinc-100 mb-3 flex items-center gap-2">
          <Award className="h-4 w-4 text-amber-400" />
          안면 골격 및 대칭 측정치
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="rounded-2xl bg-zinc-950/60 border border-zinc-800 p-3 text-center">
            <span className="text-[10px] text-zinc-400 block">세로/광대 비율</span>
            <span className="text-sm font-bold text-zinc-100 mt-1 block">
              1 : {facialWidths.lengthToWidthRatio}
            </span>
            <span className="text-[10px] text-zinc-500">표준 1:1.36</span>
          </div>

          <div className="rounded-2xl bg-zinc-950/60 border border-zinc-800 p-3 text-center">
            <span className="text-[10px] text-zinc-400 block">이마 폭</span>
            <span className="text-sm font-bold text-zinc-100 mt-1 block">
              {facialWidths.foreheadWidth}px
            </span>
            <span className="text-[10px] text-zinc-500">광대 대비 {Math.round(facialWidths.foreheadToCheekRatio * 100)}%</span>
          </div>

          <div className="rounded-2xl bg-zinc-950/60 border border-zinc-800 p-3 text-center">
            <span className="text-[10px] text-zinc-400 block">광대 가로폭</span>
            <span className="text-sm font-bold text-zinc-100 mt-1 block">
              {facialWidths.cheekboneWidth}px
            </span>
            <span className="text-[10px] text-zinc-500">기준 폭 (100%)</span>
          </div>

          <div className="rounded-2xl bg-zinc-950/60 border border-zinc-800 p-3 text-center">
            <span className="text-[10px] text-zinc-400 block">턱선 가로폭</span>
            <span className="text-sm font-bold text-zinc-100 mt-1 block">
              {facialWidths.jawWidth}px
            </span>
            <span className="text-[10px] text-zinc-500">광대 대비 {Math.round(facialWidths.jawToCheekRatio * 100)}%</span>
          </div>
        </div>
      </div>

      {/* 4. 헤어 디자이너 전문가 제언 카드 */}
      <div className="rounded-3xl border border-amber-400/40 bg-zinc-900/80 p-5 sm:p-6 backdrop-blur-md shadow-lg space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
          <Scissors className="h-5 w-5 text-amber-400" />
          <h3 className="text-sm font-bold text-zinc-100">
            {customerMeta.name} 고객님 맞춤 살롱 스타일링 가이드
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="rounded-2xl bg-zinc-950/80 border border-zinc-800 p-3.5 space-y-1">
            <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5 text-amber-400" />
              추천 컷 & 펌 디자인
            </span>
            <p className="text-zinc-200 font-semibold">{stylingTips.recommendedCut}</p>
          </div>

          <div className="rounded-2xl bg-zinc-950/80 border border-zinc-800 p-3.5 space-y-1">
            <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5 text-amber-400" />
              추천 앞머리 (뱅)
            </span>
            <p className="text-zinc-200 font-semibold">{stylingTips.recommendedBang}</p>
          </div>
        </div>

        <div className="rounded-2xl bg-zinc-950/60 border border-zinc-800 p-3.5 text-xs text-zinc-300 leading-relaxed">
          <strong className="text-amber-300 block mb-1">💡 디자이너 스타일링 코멘트:</strong>
          {stylingTips.stylingAdvice}
        </div>

        {stylingTips.cautionNote && (
          <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-300/90 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
            <span>{stylingTips.cautionNote}</span>
          </div>
        )}
      </div>

      {/* 5. Navigation & Next Step Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="button"
          onClick={onProceedToLookbook}
          className="group flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 py-4 text-sm font-bold text-zinc-950 shadow-[0_0_25px_rgba(245,208,97,0.4)] hover:brightness-105 active:scale-[0.99] transition"
        >
          <span>맞춤 헤어스타일 룩북 추천 보기 (Step 3)</span>
          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          type="button"
          onClick={onRetake}
          className="flex items-center justify-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/80 px-6 py-4 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
        >
          <RefreshCw className="h-4 w-4" />
          <span>처음부터 다시 촬영</span>
        </button>
      </div>

    </div>
  );
}
