import Link from 'next/link';
import { ClipboardList, Search, ChevronRight, UserRound, Sparkles, Phone, ArrowLeft, Plus } from 'lucide-react';
import { prisma } from '@/lib/db/prisma';

// ─── 날짜 포맷 헬퍼 ──────────────────────────────────────────────────────────
function formatDate(date: Date): string {
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

// ─── 서버 컴포넌트 Props ──────────────────────────────────────────────────────
interface PageProps {
  searchParams: Promise<{ search?: string }>;
}

// ─── 빈 상태 UI ──────────────────────────────────────────────────────────────
function EmptyState({ search }: { search: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-zinc-900 border border-zinc-800 text-zinc-600 mb-5 shadow-inner">
        <ClipboardList className="h-8 w-8 text-amber-400/60" />
      </div>
      {search ? (
        <>
          <p className="text-base font-bold text-zinc-300 mb-1">
            &ldquo;{search}&rdquo; 검색 결과가 없습니다
          </p>
          <p className="text-xs text-zinc-500 leading-relaxed max-w-xs mb-6">
            고객 이름 또는 전화번호를 다시 확인해보세요.
          </p>
          <Link
            href="/dashboard/records"
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white"
          >
            전체 목록 보기
          </Link>
        </>
      ) : (
        <>
          <p className="text-base font-bold text-zinc-200 mb-1">
            아직 등록된 고객 진단 이력이 없습니다
          </p>
          <p className="text-xs text-zinc-500 leading-relaxed max-w-xs mb-6">
            첫 번째 고객 진단을 완료하면 이 곳에 맞춤 스타일 레시피와 분석 기록이 안전하게 누적됩니다.
          </p>
          <Link
            href="/diagnose"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 px-6 py-3 text-xs font-bold text-zinc-950 shadow-lg hover:brightness-105 transition"
          >
            <Plus className="h-4 w-4" />
            첫 AI 고객 진단 시작하기
          </Link>
        </>
      )}
    </div>
  );
}

// ─── 메인 페이지 (서버 컴포넌트) ─────────────────────────────────────────────
export default async function RecordsPage({ searchParams }: PageProps) {
  const { search = '' } = await searchParams;
  const trimmedSearch = search.trim();

  // 살롱 조회
  const salon = await prisma.salon.findFirst();

  // 진단이 1건 이상인 고객 + 최근 진단 포함
  const customers = salon
    ? await prisma.customer.findMany({
        where: {
          salonId: salon.id,
          diagnoses: { some: {} },
          ...(trimmedSearch
            ? {
                OR: [
                  { name: { contains: trimmedSearch, mode: 'insensitive' } },
                  { phone: { contains: trimmedSearch, mode: 'insensitive' } },
                ],
              }
            : {}),
        },
        orderBy: { createdAt: 'desc' },
        include: {
          diagnoses: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: {
              id: true,
              faceShape: true,
              personalColor: true,
              prescriptionToken: true,
              createdAt: true,
            },
          },
        },
      })
    : [];

  const hasRecords = customers.length > 0;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-zinc-950 text-white px-4 sm:px-6 md:px-10 py-8 max-w-6xl mx-auto">

      {/* ── 상단 헤더 ──────────────────────────────────────────────────────────── */}
      <header className="mb-8 flex items-start justify-between gap-4 flex-wrap border-b border-zinc-800/80 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/dashboard"
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <span className="rounded-full bg-amber-400/10 px-3 py-1 text-[11px] font-bold text-amber-300 border border-amber-400/20 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              유니헤어샵 스타일 아카이브
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            고객 스타일 보관함
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-medium">
            살롱 고객별 AI 얼굴형·퍼스널컬러 컨설팅 데이터와 발송된 맞춤 스타일 레시피 이력을 확인합니다.
          </p>
        </div>

        <Link
          href="/diagnose"
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 px-5 py-3 text-xs font-bold text-zinc-950 shadow-md hover:brightness-105 transition shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>새 스타일 컨설팅</span>
        </Link>
      </header>

      {/* ── 검색 폼 ───────────────────────────────────────────────────────── */}
      <form method="GET" className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="고객 이름 또는 전화번호 뒷자리 검색..."
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/90 pl-11 pr-20 py-3.5 text-xs sm:text-sm text-white placeholder:text-zinc-600 focus:border-amber-400 focus:outline-none transition shadow-inner font-sans"
          />
          {trimmedSearch && (
            <Link
              href="/dashboard/records"
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg bg-zinc-800 px-2.5 py-1 text-xs font-semibold text-zinc-400 hover:text-white transition"
            >
              초기화
            </Link>
          )}
        </div>
      </form>

      {/* ── 결과 개수 표시 ─────────────────────────────────────────────────── */}
      {hasRecords && (
        <div className="flex items-center justify-between mb-4 px-1">
          <p className="text-xs text-zinc-400 font-medium">
            총 <span className="font-bold text-amber-300">{customers.length}</span>명의 고객 스타일 레시피 기록
            {trimmedSearch && (
              <span className="text-zinc-500">
                {' '}— &ldquo;{trimmedSearch}&rdquo; 검색 결과
              </span>
            )}
          </p>
        </div>
      )}

      {/* ── 기록 테이블 / 카드 목록 ─────────────────────────────────────────── */}
      <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/60 shadow-xl overflow-hidden backdrop-blur-md">
        {!hasRecords ? (
          <EmptyState search={trimmedSearch} />
        ) : (
          <>
            {/* 테이블 헤더 (데스크탑) */}
            <div className="hidden lg:grid grid-cols-[1.5fr_1.5fr_1.5fr_1.5fr_1.2fr_auto] gap-4 px-6 py-3.5 border-b border-zinc-800 bg-zinc-950/60 text-xs font-bold text-zinc-400 uppercase tracking-wider">
              <span>고객명</span>
              <span>연락처</span>
              <span>진단 얼굴형</span>
              <span>퍼스널 컬러</span>
              <span>최근 진단일</span>
              <span className="text-right">스타일 레시피</span>
            </div>

            {/* 행 목록 */}
            <ul className="divide-y divide-zinc-800/60">
              {customers.map((customer) => {
                const diagnosis = customer.diagnoses[0];
                if (!diagnosis) return null;

                return (
                  <li key={customer.id}>
                    {/* 데스크탑 행 */}
                    <div className="hidden lg:grid grid-cols-[1.5fr_1.5fr_1.5fr_1.5fr_1.2fr_auto] gap-4 items-center px-6 py-4 hover:bg-zinc-800/40 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-zinc-800 text-amber-400 border border-zinc-700/60">
                          <UserRound className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-bold text-zinc-100 group-hover:text-amber-300 transition">
                          {customer.name}
                        </span>
                      </div>

                      <span className="text-xs text-zinc-400 font-mono flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-zinc-600" />
                        {customer.phone}
                      </span>

                      <div>
                        <span className="rounded-xl bg-zinc-950 px-2.5 py-1 text-xs font-bold text-amber-300 border border-zinc-800">
                          {diagnosis.faceShape}
                        </span>
                      </div>

                      <div>
                        <span className="rounded-xl bg-zinc-950 px-2.5 py-1 text-xs font-bold text-rose-300 border border-zinc-800">
                          {diagnosis.personalColor}
                        </span>
                      </div>

                      <span className="text-xs text-zinc-500 font-medium">
                        {formatDate(diagnosis.createdAt)}
                      </span>

                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/prescription/${diagnosis.prescriptionToken}`}
                          target="_blank"
                          className="flex items-center gap-1 rounded-xl bg-amber-400/10 border border-amber-400/30 px-3.5 py-2 text-xs font-bold text-amber-300 hover:bg-amber-400 hover:text-zinc-950 transition-colors whitespace-nowrap"
                        >
                          레시피 보기
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>

                    {/* 모바일 / 태블릿 카드 */}
                    <div className="lg:hidden p-5 hover:bg-zinc-800/30 transition-colors">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-zinc-800 text-amber-400 border border-zinc-700">
                            <UserRound className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-white truncate">
                              {customer.name}
                            </p>
                            <p className="text-xs text-zinc-400 font-mono mt-0.5 flex items-center gap-1">
                              <Phone className="h-3 w-3 text-zinc-500" />
                              {customer.phone}
                            </p>
                          </div>
                        </div>

                        <Link
                          href={`/prescription/${diagnosis.prescriptionToken}`}
                          target="_blank"
                          className="shrink-0 flex items-center gap-1 rounded-xl bg-amber-400/15 border border-amber-400/30 px-3 py-1.5 text-xs font-bold text-amber-300"
                        >
                          레시피 열기
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-800/60">
                        <span className="rounded-lg bg-zinc-950 px-2 py-0.5 text-[11px] font-semibold text-amber-300 border border-zinc-800">
                          {diagnosis.faceShape}
                        </span>
                        <span className="rounded-lg bg-zinc-950 px-2 py-0.5 text-[11px] font-semibold text-rose-300 border border-zinc-800">
                          {diagnosis.personalColor}
                        </span>
                        <span className="text-[11px] text-zinc-500 ml-auto font-medium">
                          {formatDate(diagnosis.createdAt)}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>

    </div>
  );
}
