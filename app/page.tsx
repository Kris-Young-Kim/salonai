import { Camera, Sparkles, Smartphone, CheckCircle2, SlidersHorizontal } from "lucide-react";
import { InteractiveHero } from "@/components/home/InteractiveHero";

export default function Home() {
  return (
    <div className="flex flex-col min-h-full bg-zinc-950 text-zinc-100 font-sans selection:bg-amber-400 selection:text-zinc-950">
      
      {/* ── High-Fashion 3D Parallax Interactive Hero Section ──────────────── */}
      <InteractiveHero />

      {/* Feature Highlights Grid */}
      <section id="features" className="border-t border-zinc-800/80 bg-zinc-900/40 py-24 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-amber-400/5 blur-[120px] pointer-events-none" />

        <div className="mx-auto max-w-6xl px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/10 px-3.5 py-1 text-xs font-bold text-amber-300 border border-amber-400/20 mb-3">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              THE PERFECT SALON EXPERIENCE
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight break-keep">
              당신만의 인생 헤어스타일을 찾는 <br className="sm:hidden" />
              <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
                가장 완벽한 1분
              </span>
            </h2>
            <p className="text-sm sm:text-base text-zinc-300 mt-3 max-w-2xl mx-auto break-keep font-medium leading-relaxed">
              정밀 AI 비전 분석부터 원장님의 1:1 맞춤 시술 레시피까지, 실패 없는 헤어 디자인의 새로운 기준을 경험하세요.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1 */}
            <div className="relative rounded-3xl border border-amber-400/30 bg-gradient-to-b from-zinc-900/90 to-zinc-950 p-6 sm:p-7 shadow-[0_0_30px_rgba(245,208,97,0.08)] flex flex-col hover:border-amber-400/60 hover:-translate-y-1 transition duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/20 text-amber-400 mb-5 border border-amber-400/40 shadow-inner">
                <Camera className="h-6 w-6" />
              </div>
              <span className="text-[11px] font-extrabold tracking-widest text-amber-400 uppercase mb-1">
                STEP 01
              </span>
              <h3 className="text-lg font-extrabold text-white mb-2">
                3초 페이스 스캔
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed flex-1 break-keep font-medium">
                황금비율 계란형 가이드로 정면 안면 윤곽과 이마·광대·턱선 3단 비율을 정밀하게 측정합니다.
              </p>
              <div className="mt-5 pt-3 border-t border-zinc-800/80 flex items-center gap-1.5 text-xs font-bold text-amber-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />
                <span>황금비율 페이스 스캔</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="relative rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900/80 to-zinc-950 p-6 sm:p-7 flex flex-col hover:border-purple-400/50 hover:-translate-y-1 transition duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-400 mb-5 border border-purple-500/40 shadow-inner">
                <Sparkles className="h-6 w-6" />
              </div>
              <span className="text-[11px] font-extrabold tracking-widest text-purple-400 uppercase mb-1">
                STEP 02
              </span>
              <h3 className="text-lg font-extrabold text-white mb-2">
                얼굴형 & 퍼스널컬러 진단
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed flex-1 break-keep font-medium">
                468개 랜드마크 분석과 피부톤 4계절(봄/여름/가을/겨울) 매칭으로 찰떡 컬러와 실루엣을 도출합니다.
              </p>
              <div className="mt-5 pt-3 border-t border-zinc-800/80 flex items-center gap-1.5 text-xs font-bold text-purple-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-purple-400" />
                <span>4계절 맞춤 퍼스널 진단</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="relative rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900/80 to-zinc-950 p-6 sm:p-7 flex flex-col hover:border-emerald-400/50 hover:-translate-y-1 transition duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 mb-5 border border-emerald-500/40 shadow-inner">
                <SlidersHorizontal className="h-6 w-6" />
              </div>
              <span className="text-[11px] font-extrabold tracking-widest text-emerald-400 uppercase mb-1">
                STEP 03
              </span>
              <h3 className="text-lg font-extrabold text-white mb-2">
                가상 헤어 & 컬러 피팅
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed flex-1 break-keep font-medium">
                자르거나 염색하기 전, 24종 K-살롱 마스터 룩북과 실시간 Before/After 틴트로 미리 확인합니다.
              </p>
              <div className="mt-5 pt-3 border-t border-zinc-800/80 flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>실패 없는 가상 스타일링</span>
              </div>
            </div>

            {/* Card 4 */}
            <div className="relative rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900/80 to-zinc-950 p-6 sm:p-7 flex flex-col hover:border-sky-400/50 hover:-translate-y-1 transition duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-400 mb-5 border border-sky-500/40 shadow-inner">
                <Smartphone className="h-6 w-6" />
              </div>
              <span className="text-[11px] font-extrabold tracking-widest text-sky-400 uppercase mb-1">
                STEP 04
              </span>
              <h3 className="text-lg font-extrabold text-white mb-2">
                모바일 헤어 처방전 발급
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed flex-1 break-keep font-medium">
                나만의 맞춤 레시피, 염색약 배합표, 홈케어 꿀팁을 스마트폰으로 전송해 언제든 열어볼 수 있습니다.
              </p>
              <div className="mt-5 pt-3 border-t border-zinc-800/80 flex items-center gap-1.5 text-xs font-bold text-sky-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-sky-400" />
                <span>평생 소장 맞춤 레시피</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-12 text-center text-xs text-zinc-500 space-y-3">
        <div className="flex flex-wrap items-center justify-center gap-4 text-zinc-400 font-medium">
          <a
            href="https://m.place.naver.com/hairshop/1724847178/home"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-200 font-extrabold hover:text-amber-400 transition"
          >
            유니헤어샵 (원주 원동점)
          </a>
          <span>•</span>
          <a href="tel:033-734-4754" className="hover:text-zinc-200 transition">
            📞 033-734-4754
          </a>
          <span>•</span>
          <a
            href="https://m.place.naver.com/hairshop/1724847178/home"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-200 transition"
          >
            📍 강원 원주시 무실로 91, 한주아파트 상가 101호
          </a>
        </div>
        <p className="text-[11px] text-zinc-600">
          © 2026 유니헤어샵. All rights reserved. 프리미엄 AI 헤어 스타일 컨설팅 & 맞춤 레시피 솔루션
        </p>
      </footer>
    </div>
  );
}
