import Link from "next/link";
import { Camera, Sparkles, Smartphone, CheckCircle2, SlidersHorizontal } from "lucide-react";
import { InteractiveHero } from "@/components/home/InteractiveHero";

export default function Home() {
  return (
    <div className="flex flex-col min-h-full bg-zinc-950 text-zinc-100 font-sans selection:bg-amber-400 selection:text-zinc-950">
      
      {/* ── High-Fashion 3D Parallax Interactive Hero Section ──────────────── */}
      <InteractiveHero />

      {/* Feature Highlights Grid */}
      <section id="features" className="border-t border-zinc-800/80 bg-zinc-900/40 py-20">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100 break-keep">
              미용실 태블릿에 최적화된 4단계 스마트 워크플로우
            </h2>
            <p className="text-sm text-zinc-400 mt-2 break-keep">
              디자이너의 전문성을 돋보이게 하고 고객 만족도를 극대화하는 올인원 시스템
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1 */}
            <div className="relative rounded-3xl border border-amber-400/30 bg-zinc-900/80 p-6 shadow-[0_0_20px_rgba(245,208,97,0.05)] flex flex-col hover:border-amber-400/50 transition">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/20 text-amber-400 mb-4 border border-amber-400/30">
                <Camera className="h-6 w-6" />
              </div>
              <span className="text-[11px] font-bold tracking-wider text-amber-400 uppercase mb-1">
                Step 01
              </span>
              <h3 className="text-base font-bold text-zinc-100 mb-2">
                스마트 가이드 촬영
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed flex-1 break-keep">
                황금비율 계란형 오버레이와 3단 안부(상·중·하) 보조선으로 흔들림 없는 정밀 정면 촬영.
              </p>
              <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>원터치 간편 촬영</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="relative rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 flex flex-col hover:border-zinc-700 transition">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-400 mb-4 border border-purple-500/30">
                <Sparkles className="h-6 w-6" />
              </div>
              <span className="text-[11px] font-bold tracking-wider text-purple-400 uppercase mb-1">
                Step 02
              </span>
              <h3 className="text-base font-bold text-zinc-100 mb-2">
                얼굴형 & 퍼스널 컬러
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed flex-1 break-keep">
                468개 3D 랜드마크 분석 및 피부 톤 샘플링을 통한 4계절 웜/쿨 정밀 진단.
              </p>
              <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center gap-1.5 text-xs font-semibold text-purple-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>AI 비전 정밀 진단</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="relative rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 flex flex-col hover:border-zinc-700 transition">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 mb-4 border border-emerald-500/30">
                <SlidersHorizontal className="h-6 w-6" />
              </div>
              <span className="text-[11px] font-bold tracking-wider text-emerald-400 uppercase mb-1">
                Step 03
              </span>
              <h3 className="text-base font-bold text-zinc-100 mb-2">
                맞춤 룩북 & 시뮬레이터
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed flex-1 break-keep">
                진단 태그 기반 24종 K-살롱 스타일 매칭 및 실시간 헤어 Before/After 컬러 시뮬레이션.
              </p>
              <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>실시간 가상 스타일링</span>
              </div>
            </div>

            {/* Card 4 */}
            <div className="relative rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 flex flex-col hover:border-zinc-700 transition">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-400 mb-4 border border-sky-500/30">
                <Smartphone className="h-6 w-6" />
              </div>
              <span className="text-[11px] font-bold tracking-wider text-sky-400 uppercase mb-1">
                Step 04
              </span>
              <h3 className="text-base font-bold text-zinc-100 mb-2">
                모바일 스타일 레시피 & 알림톡
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed flex-1 break-keep">
                맞춤 스타일, 시술 레시피 및 홈케어 가이드를 고객 스마트폰으로 즉시 전송.
              </p>
              <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center gap-1.5 text-xs font-semibold text-sky-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>카카오톡 즉시 발송</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-10 text-center text-xs text-zinc-500 space-y-2">
        <div className="flex flex-wrap items-center justify-center gap-4 text-zinc-400 font-medium">
          <span className="text-zinc-200 font-bold">유니헤어샵</span>
          <span>•</span>
          <span>📞 033-734-4754</span>
          <span>•</span>
          <span>📍 강원 원주시 무실로 91, 한주아파트 상가 101호</span>
        </div>
        <p className="text-[11px] text-zinc-600">
          © 2026 유니헤어샵. All rights reserved. AI 헤어 진단 & 맞춤 스타일 레시피
        </p>
      </footer>

    </div>
  );
}
