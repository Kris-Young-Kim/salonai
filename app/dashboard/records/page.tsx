import Link from 'next/link';
import { ClipboardList, Search, ChevronRight, UserRound } from 'lucide-react';
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
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-stone-100 text-stone-300 mb-5">
        <ClipboardList className="h-8 w-8" />
      </div>
      {search ? (
        <>
          <p className="text-base font-bold text-stone-400 mb-1">
            &ldquo;{search}&rdquo; 검색 결과가 없어요
          </p>
          <p className="text-sm text-stone-300 leading-relaxed max-w-xs">
            이름 또는 전화번호를 다시 확인해보세요.
          </p>
        </>
      ) : (
        <>
          <p className="text-base font-bold text-stone-400 mb-1">
            아직 진단 기록이 없어요
          </p>
          <p className="text-sm text-stone-300 leading-relaxed max-w-xs">
            첫 번째 고객 진단을 완료하면<br />이 곳에 기록이 쌓입니다.
          </p>
          <Link
            href="/dashboard/diagnose"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-stone-100 px-5 py-2.5 text-sm font-semibold text-stone-500 hover:bg-amber-50 hover:text-amber-700 transition-colors"
          >
            진단 시작하기
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
  // search: 고객 이름 또는 전화번호 필터
  const customers = salon
    ? await prisma.customer.findMany({
        where: {
          salonId: salon.id,
          diagnoses: { some: {} }, // 진단 이력이 있는 고객만
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
    <div className="min-h-full bg-[#F9FAFB] px-6 py-8 md:px-10 md:py-10 max-w-4xl mx-auto">

      {/* ── 헤더 ──────────────────────────────────────────────────────────── */}
      <header className="mb-8">
        <h1 className="text-2xl font-extrabold text-stone-800 tracking-tight flex items-center gap-2.5">
          <ClipboardList className="h-6 w-6 text-amber-500" />
          진단 기록
        </h1>
        <p className="text-sm text-stone-400 mt-1 font-medium">
          고객별 AI 진단 이력을 확인하세요.
        </p>
      </header>

      {/* ── 검색 폼 ───────────────────────────────────────────────────────── */}
      <form method="GET" className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="고객 이름 또는 전화번호 검색"
            className="w-full rounded-2xl border border-stone-200 bg-white pl-11 pr-4 py-3 text-sm text-stone-700 placeholder:text-stone-300 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition shadow-sm"
          />
          {trimmedSearch && (
            <Link
              href="/dashboard/records"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600 transition"
            >
              초기화
            </Link>
          )}
        </div>
      </form>

      {/* ── 결과 개수 표시 ─────────────────────────────────────────────────── */}
      {hasRecords && (
        <p className="text-xs text-stone-400 font-medium mb-4">
          총{' '}
          <span className="font-bold text-stone-600">{customers.length}</span>
          명의 고객
          {trimmedSearch && (
            <span className="text-amber-600">
              {' '}— &ldquo;{trimmedSearch}&rdquo; 검색 결과
            </span>
          )}
        </p>
      )}

      {/* ── 기록 테이블 / 빈 상태 ─────────────────────────────────────────── */}
      <div className="rounded-3xl border border-stone-200 bg-white shadow-sm overflow-hidden">
        {!hasRecords ? (
          <EmptyState search={trimmedSearch} />
        ) : (
          <>
            {/* 테이블 헤더 — 데스크탑 */}
            <div className="hidden md:grid grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3 border-b border-stone-100 bg-stone-50/70 text-xs font-bold text-stone-400 uppercase tracking-widest">
              <span>고객명</span>
              <span>전화번호</span>
              <span>얼굴형</span>
              <span>퍼스널컬러</span>
              <span>진단일</span>
              <span />
            </div>

            {/* 행 목록 */}
            <ul className="divide-y divide-stone-100">
              {customers.map((customer) => {
                const diagnosis = customer.diagnoses[0];
                if (!diagnosis) return null;

                return (
                  <li key={customer.id}>
                    {/* 데스크탑 행 */}
                    <div className="hidden md:grid grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] gap-4 items-center px-6 py-4 hover:bg-amber-50/30 transition-colors group">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-400">
                          <UserRound className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-semibold text-stone-700 truncate">
                          {customer.name}
                        </span>
                      </div>
                      <span className="text-sm text-stone-500 font-medium">
                        {customer.phone}
                      </span>
                      <span className="text-sm text-stone-600">
                        {diagnosis.faceShape}
                      </span>
                      <span className="text-sm text-stone-600">
                        {diagnosis.personalColor}
                      </span>
                      <span className="text-sm text-stone-400 font-medium">
                        {formatDate(diagnosis.createdAt)}
                      </span>
                      <Link
                        href={`/prescription/${diagnosis.prescriptionToken}`}
                        className="flex items-center gap-1 rounded-xl bg-stone-100 px-3 py-1.5 text-xs font-semibold text-stone-500 hover:bg-amber-100 hover:text-amber-700 transition-colors whitespace-nowrap group-hover:bg-amber-100 group-hover:text-amber-700"
                      >
                        처방전 보기
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    </div>

                    {/* 모바일 카드 */}
                    <div className="md:hidden px-5 py-4 hover:bg-amber-50/30 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-400">
                            <UserRound className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-stone-700 truncate">
                              {customer.name}
                            </p>
                            <p className="text-xs text-stone-400 font-medium mt-0.5">
                              {customer.phone}
                            </p>
                          </div>
                        </div>
                        <Link
                          href={`/prescription/${diagnosis.prescriptionToken}`}
                          className="shrink-0 flex items-center gap-1 rounded-xl bg-stone-100 px-3 py-1.5 text-xs font-semibold text-stone-500 hover:bg-amber-100 hover:text-amber-700 transition-colors"
                        >
                          처방전
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 ml-11">
                        <span className="inline-flex items-center rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-600">
                          {diagnosis.faceShape}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                          {diagnosis.personalColor}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-stone-50 px-2.5 py-0.5 text-xs font-medium text-stone-400">
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
