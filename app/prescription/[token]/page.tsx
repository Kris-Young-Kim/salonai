import React from 'react';
import { prisma } from '@/lib/db/prisma';
import { notFound } from 'next/navigation';
import {
  Sparkles,
  Scissors,
  Phone,
  MapPin,
  HeartHandshake,
  Wind,
  Droplets,
  CalendarCheck,
} from 'lucide-react';
import { HairDyeRecommendation } from '@/components/prescription/HairDyeRecommendation';
import { PrescriptionShareButtons } from '@/components/prescription/PrescriptionShareButtons';
import { getRecommendedDyesByKorean } from '@/lib/data/hairDyeChart';

interface PrescriptionPageProps {
  params: Promise<{ token: string }>;
}

// ─── 고객 친화적 얼굴형 솔루션 매핑 ──────────────────────────────────────────
const FACE_SHAPE_BENEFITS: Record<string, { title: string; desc: string }> = {
  계란형: {
    title: '황금 비율의 이상적인 페이스라인',
    desc: '다양한 기장과 스타일을 자유롭게 소화할 수 있는 균형 잡힌 얼굴형입니다. 사이드 볼륨과 페이스라인 컷으로 이목구비를 더욱 입체적으로 살려드렸습니다.',
  },
  둥근형: {
    title: '사랑스럽고 부드러운 이미지',
    desc: '정수리 쪽 볼륨을 살리고 턱선을 부드럽게 감싸는 레이어드로 세련되고 갸름한 슬림 페이스라인을 연출해 드립니다.',
  },
  각진형: {
    title: '도시적이고 시크한 무드',
    desc: '광대와 턱선의 각을 부드러운 곡선 웨이브와 사이드뱅으로 커버하여 한층 우아하고 부드러운 인상을 완성합니다.',
  },
  하트형: {
    title: '도회적이고 트렌디한 라인',
    desc: '하안부의 샤프함을 보완하기 위해 턱선 아래쪽에 부드러운 C컬 볼륨을 더해 완벽한 하모니를 만들어 드립니다.',
  },
  긴얼굴형: {
    title: '지적이고 단아한 분위기',
    desc: '옆 볼륨감을 풍성하게 채우고 시스루뱅이나 사이드뱅을 매치하여 얼굴 길이를 짧아 보이게 연출합니다.',
  },
};

// ─── 고객 친화적 퍼스널 컬러 솔루션 매핑 ────────────────────────────────────
const PERSONAL_COLOR_BENEFITS: Record<string, { title: string; desc: string; glow: string }> = {
  '여름 쿨톤': {
    title: '맑고 투명한 청량 무드',
    desc: '노란기와 붉은기를 중화시켜 피부를 우윳빛처럼 뽀얗고 투명하게 정돈해 주는 컬러 팔레트가 가장 돋보입니다.',
    glow: 'from-sky-400/20 via-purple-400/20 to-pink-400/20',
  },
  '봄 웜톤': {
    title: '생기 있고 화사한 비타민 무드',
    desc: '따뜻하고 화사한 골드·피치 톤이 이목구비에 건강한 생기와 혈색을 가득 채워주는 퍼스널 컬러입니다.',
    glow: 'from-amber-400/20 via-yellow-400/20 to-rose-400/20',
  },
  '가을 웜톤': {
    title: '우아하고 깊이 있는 무드',
    desc: '차분하고 고급스러운 브라운·올리브 톤이 고객님의 지적인 우아함을 극대화시켜 줍니다.',
    glow: 'from-amber-500/20 via-yellow-600/20 to-stone-400/20',
  },
  '겨울 쿨톤': {
    title: '선명하고 또렷한 모던 무드',
    desc: '선명하고 딥한 대비감이 피부를 극적으로 하얗게 밝혀주고 세련된 아우라를 완성합니다.',
    glow: 'from-indigo-400/20 via-sky-400/20 to-purple-400/20',
  },
};

export default async function PrescriptionPage({ params }: PrescriptionPageProps) {
  const { token } = await params;

  if (!token) {
    notFound();
  }

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

  const { customer, originalImageUrl, faceShape, personalColor, selectedStyleTags, designerNotes, createdAt } = diagnosis;

  const dateStr = new Date(createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const faceShapeInfo = FACE_SHAPE_BENEFITS[faceShape] || {
    title: `${faceShape} 맞춤 디자인`,
    desc: '고객님의 얼굴형 장점을 극대화하고 단점을 자연스럽게 커버하는 맞춤 헤어 솔루션입니다.',
  };

  const personalColorKey = Object.keys(PERSONAL_COLOR_BENEFITS).find((k) => personalColor.includes(k));
  const personalColorInfo = personalColorKey ? PERSONAL_COLOR_BENEFITS[personalColorKey] : {
    title: `${personalColor} 퍼스널 매치`,
    desc: '고객님의 고유 피부톤에 가장 잘 어울리는 화사하고 안정적인 헤어 컬러입니다.',
    glow: 'from-amber-400/20 via-rose-400/20 to-amber-500/20',
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-amber-400 selection:text-zinc-950 pb-20">
      
      {/* Mobile-Optimized Container */}
      <div className="mx-auto max-w-lg px-4 pt-6 sm:pt-8">
        
        {/* Salon Brand Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="relative h-10 w-10 rounded-2xl overflow-hidden border border-amber-400/40 shadow-[0_0_15px_rgba(245,208,97,0.35)] shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.jpg"
                alt="유니헤어샵 로고"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <span className="text-sm font-extrabold tracking-tight text-white block">
                유니헤어샵
              </span>
              <span className="text-[9px] text-zinc-400 font-mono">
                MY PERSONAL STYLE RECIPE
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 rounded-full bg-amber-400/10 px-3 py-1 text-[11px] font-bold text-amber-300 border border-amber-400/30">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>AI 맞춤 스타일 리포트</span>
          </div>
        </div>

        {/* Customer Welcome Card */}
        <div className="rounded-3xl border border-amber-400/30 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 p-6 mb-6 shadow-2xl backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 h-32 w-32 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />
          
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1.5">
            <HeartHandshake className="h-3.5 w-3.5" />
            유니헤어샵 고객 전용 리포트
          </span>
          <h1 className="text-2xl font-black text-white leading-tight mb-2">
            {customer?.name || '고객'} 님의<br />
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
              퍼스널 헤어 스타일 가이드
            </span>
          </h1>
          <p className="text-xs text-zinc-400 leading-relaxed">
            오늘 분석된 얼굴형과 퍼스널 컬러를 바탕으로 완성된 나만의 스타일링 & 홈케어 레시피입니다.
          </p>

          <div className="flex items-center justify-between pt-4 mt-4 border-t border-zinc-800/80 text-xs">
            <span className="text-zinc-500">컨설팅 일자</span>
            <span className="font-semibold text-zinc-300">{dateStr}</span>
          </div>
        </div>

        {/* Client Photo Card */}
        {originalImageUrl && (
          <div className="relative rounded-3xl border border-zinc-800 bg-zinc-900 overflow-hidden mb-6 shadow-2xl">
            <div className="relative aspect-[3/4] w-full bg-zinc-950">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={originalImageUrl}
                alt="고객 스타일 분석 사진"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
            </div>
            <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-zinc-900/90 border border-zinc-700/60 p-3.5 backdrop-blur-md flex items-center justify-between">
              <div>
                <span className="text-[10px] text-zinc-400 block">분석된 나의 매력 키워드</span>
                <span className="text-xs font-bold text-amber-300">#{faceShape} • #{personalColor}</span>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400/20 text-amber-400">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>
          </div>
        )}

        {/* Section 1: My Beauty Profile Analysis (고객 눈높이 해석) */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5 sm:p-6 mb-6 backdrop-blur-md shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <h2 className="text-sm font-extrabold text-white">나만의 매력 분석 & 스타일링 솔루션</h2>
          </div>

          {/* Face Shape Card */}
          <div className="rounded-2xl bg-zinc-950 border border-zinc-800/80 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                얼굴형 솔루션: {faceShape}
              </span>
              <span className="text-[10px] text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800">
                Face Design
              </span>
            </div>
            <p className="text-xs font-bold text-zinc-100 mb-1">{faceShapeInfo.title}</p>
            <p className="text-xs text-zinc-400 leading-relaxed break-keep">{faceShapeInfo.desc}</p>
          </div>

          {/* Personal Color Card */}
          <div className="rounded-2xl bg-zinc-950 border border-zinc-800/80 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-400" />
                퍼스널 컬러 솔루션: {personalColor}
              </span>
              <span className="text-[10px] text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800">
                Color Tone
              </span>
            </div>
            <p className="text-xs font-bold text-zinc-100 mb-1">{personalColorInfo.title}</p>
            <p className="text-xs text-zinc-400 leading-relaxed break-keep">{personalColorInfo.desc}</p>
          </div>
        </div>

        {/* Section 2: Selected Style Tags */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5 sm:p-6 mb-6 backdrop-blur-md shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <Scissors className="h-4 w-4 text-amber-400" />
            <h2 className="text-sm font-extrabold text-white">오늘 결정된 추천 헤어 디자인</h2>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            {selectedStyleTags && selectedStyleTags.length > 0 ? (
              selectedStyleTags.map((tag: string, idx: number) => (
                <span
                  key={idx}
                  className="rounded-xl bg-amber-400/15 border border-amber-400/40 px-3.5 py-1.5 text-xs font-bold text-amber-300"
                >
                  #{tag}
                </span>
              ))
            ) : (
              <span className="text-xs text-zinc-500">지정된 스타일 태그가 없습니다.</span>
            )}
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed break-keep">
            고객님의 이목구비 비율과 모발 흐름을 고려하여 자연스러운 볼륨감과 손쉬운 일상 손질이 가능한 디자인으로 맞춤 설계되었습니다.
          </p>
        </div>

        {/* Section 3: Recommended Hair Color (Brand Dye Recipe Collapsible) */}
        {personalColor && (
          <HairDyeRecommendation
            tints={getRecommendedDyesByKorean(personalColor)}
            className="mb-6"
          />
        )}

        {/* Section 4: Home Care & Styling Tips */}
        <div className="rounded-3xl border border-amber-400/40 bg-zinc-900/90 p-5 sm:p-6 mb-6 backdrop-blur-md shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <h2 className="text-sm font-extrabold text-white">원장님의 1:1 홈케어 & 스타일링 가이드</h2>
          </div>

          {/* Designer Comments */}
          <div className="rounded-2xl bg-zinc-950/80 p-4 border border-zinc-800 text-xs text-zinc-300 leading-relaxed whitespace-pre-line break-keep">
            {designerNotes || '오늘 시술받으신 스타일을 집에서도 오랫동안 예쁘게 유지하실 수 있도록 정성껏 디자인해 드렸습니다.'}
          </div>

          {/* Practical 3-Step Daily Routine */}
          <div className="grid grid-cols-1 gap-2.5 pt-1">
            <div className="flex items-start gap-3 rounded-2xl bg-zinc-950 p-3.5 border border-zinc-800/80">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-sky-400/10 text-sky-400 shrink-0">
                <Wind className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-zinc-200 block mb-0.5">3분 드라이 꿀팁</span>
                <span className="text-[11px] text-zinc-400 leading-relaxed block break-keep">
                  머리를 감은 후 고개를 가볍게 숙여 뒤에서 앞으로 80% 털어 말린 뒤, 얼굴 바깥 방향으로 돌려 말려주시면 자연스러운 볼륨이 완성됩니다.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl bg-zinc-950 p-3.5 border border-zinc-800/80">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-purple-400/10 text-purple-400 shrink-0">
                <Droplets className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-zinc-200 block mb-0.5">에센스 및 보습 관리</span>
                <span className="text-[11px] text-zinc-400 leading-relaxed block break-keep">
                  타월 드라이 후 젖은 모발 끝에 헤어 세럼을 500원 동전만큼 바르면 부스스함을 잡고 윤기가 하루 종일 유지됩니다.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl bg-zinc-950 p-3.5 border border-zinc-800/80">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-400 shrink-0">
                <CalendarCheck className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-zinc-200 block mb-0.5">다음 추천 관리 주기</span>
                <span className="text-[11px] text-zinc-400 leading-relaxed block break-keep">
                  가장 예쁜 핏을 유지하기 위해 <strong className="text-amber-300">6~8주 뒤</strong> 커트 라인 정돈 및 뿌리 관리를 추천해 드립니다.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Viral Share & Copy Link Card */}
        <PrescriptionShareButtons
          customerName={customer?.name}
          faceShape={faceShape}
          personalColor={personalColor}
        />

        {/* Section 6: Salon Direct Contact & Action Card */}
        <div className="rounded-3xl bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-zinc-800 p-6 text-center space-y-4 shadow-2xl">
          <div className="flex flex-col items-center">
            <div className="relative h-14 w-14 rounded-2xl overflow-hidden border border-amber-400/40 shadow-[0_0_20px_rgba(245,208,97,0.3)] mb-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.jpg"
                alt="유니헤어샵"
                className="h-full w-full object-cover"
              />
            </div>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block mb-0.5">
              Hair Salon & AI Studio
            </span>
            <p className="font-extrabold text-xl text-white">유니헤어샵</p>
            <p className="text-xs text-zinc-400 mt-1 flex items-center justify-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-zinc-500" />
              <span>강원 원주시 무실로 91, 한주아파트 상가 101호</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <a
              href="tel:033-734-4754"
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 py-3.5 text-xs font-bold text-zinc-950 shadow-[0_0_20px_rgba(245,208,97,0.3)] hover:brightness-105 transition active:scale-[0.99]"
            >
              <Phone className="h-4 w-4" />
              <span>원장님께 전화 예약 / 문의</span>
            </a>
          </div>

          <p className="text-[10px] text-zinc-600 pt-3 border-t border-zinc-800/80">
            © 2026 유니헤어샵. All rights reserved. 고객님의 빛나는 스타일을 응원합니다.
          </p>
        </div>

      </div>

    </div>
  );
}
