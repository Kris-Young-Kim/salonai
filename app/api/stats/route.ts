import { NextRequest, NextResponse } from 'next/server';
import { getSalonContext } from '@/lib/auth/getSalonContext';
import { prisma } from '@/lib/db/prisma';

// ─── KST 헬퍼 ────────────────────────────────────────────────────────────────

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** KST 기준 해당 날짜의 자정을 UTC Date로 반환 */
function kstDayStartUTC(date: Date): Date {
  const kst = new Date(date.getTime() + KST_OFFSET_MS);
  return new Date(
    Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate()) - KST_OFFSET_MS,
  );
}

/** UTC Date를 KST 날짜 문자열(YYYY-MM-DD)로 변환 */
function toKSTDateStr(date: Date): string {
  return new Date(date.getTime() + KST_OFFSET_MS).toISOString().slice(0, 10);
}

// ─── GET /api/stats ──────────────────────────────────────────────────────────
export async function GET(_req: NextRequest) {
  try {
    const ctx = await getSalonContext();
    if (!ctx) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const salon = ctx.salon;
    if (!salon) {
      return NextResponse.json({
        today: 0,
        thisMonth: 0,
        total: 0,
        dailyStats: buildEmptyDailyStats(),
      });
    }

    const now = new Date();
    const todayStartUTC = kstDayStartUTC(now);
    const tomorrowStartUTC = new Date(todayStartUTC.getTime() + 24 * 60 * 60 * 1000);

    // 이번 달 1일 KST 자정 → UTC
    const nowKST = new Date(now.getTime() + KST_OFFSET_MS);
    const thisMonthStartUTC = new Date(
      Date.UTC(nowKST.getUTCFullYear(), nowKST.getUTCMonth(), 1) - KST_OFFSET_MS,
    );

    // 7일 전 시작 (KST 기준 오늘 포함 총 7일)
    const sevenDaysAgoUTC = new Date(todayStartUTC.getTime() - 6 * 24 * 60 * 60 * 1000);

    // 살롱 고객 ID 목록 → 진단 쿼리 필터에 사용
    const salonCustomers = await prisma.customer.findMany({
      where: { salonId: salon.id },
      select: { id: true },
    });
    const customerIds = salonCustomers.map((c: { id: string }) => c.id);

    if (customerIds.length === 0) {
      return NextResponse.json({
        today: 0,
        thisMonth: 0,
        total: 0,
        dailyStats: buildEmptyDailyStats(),
      });
    }

    const baseWhere = { customerId: { in: customerIds } };

    const [todayCount, thisMonthCount, totalCount, last7DaysDiagnoses] = await Promise.all([
      prisma.diagnosis.count({
        where: { ...baseWhere, createdAt: { gte: todayStartUTC, lt: tomorrowStartUTC } },
      }),
      prisma.diagnosis.count({
        where: { ...baseWhere, createdAt: { gte: thisMonthStartUTC } },
      }),
      prisma.diagnosis.count({ where: baseWhere }),
      prisma.diagnosis.findMany({
        where: { ...baseWhere, createdAt: { gte: sevenDaysAgoUTC } },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    return NextResponse.json({
      today: todayCount,
      thisMonth: thisMonthCount,
      total: totalCount,
      dailyStats: buildDailyStats(last7DaysDiagnoses, todayStartUTC),
    });
  } catch (error: any) {
    console.error('[GET /api/stats]', error);
    return NextResponse.json(
      { error: error.message || '통계를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}

// ─── 헬퍼: 빈 7일 통계 배열 ──────────────────────────────────────────────────
function buildEmptyDailyStats(): Array<{ date: string; count: number }> {
  const todayStartUTC = kstDayStartUTC(new Date());
  return Array.from({ length: 7 }, (_, i) => ({
    date: toKSTDateStr(new Date(todayStartUTC.getTime() - (6 - i) * 24 * 60 * 60 * 1000)),
    count: 0,
  }));
}

// ─── 헬퍼: 날짜별 집계 ───────────────────────────────────────────────────────
function buildDailyStats(
  diagnoses: Array<{ createdAt: Date }>,
  todayStartUTC: Date,
): Array<{ date: string; count: number }> {
  const countMap = new Map<string, number>();
  for (const d of diagnoses) {
    const dateStr = toKSTDateStr(d.createdAt);
    countMap.set(dateStr, (countMap.get(dateStr) ?? 0) + 1);
  }

  return Array.from({ length: 7 }, (_, i) => {
    const dateStr = toKSTDateStr(
      new Date(todayStartUTC.getTime() - (6 - i) * 24 * 60 * 60 * 1000),
    );
    return { date: dateStr, count: countMap.get(dateStr) ?? 0 };
  });
}
