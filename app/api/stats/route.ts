import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';

// ─── GET /api/stats ──────────────────────────────────────────────────────────
// 살롱 통계 데이터
// 응답: { today, thisMonth, total, dailyStats }
export async function GET(_req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const salon = await prisma.salon.findFirst();
    if (!salon) {
      return NextResponse.json({
        today: 0,
        thisMonth: 0,
        total: 0,
        dailyStats: buildEmptyDailyStats(),
      });
    }

    const now = new Date();

    // 오늘 00:00:00 KST → UTC 변환 (KST = UTC+9)
    const todayStartKST = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        // KST 자정은 전날 UTC 15:00이지만, 서버 환경에 따라 단순 날짜 기준으로 처리
        0, 0, 0, 0,
      ),
    );
    // KST 기준 오늘 = UTC 기준 오늘 - 9h 오프셋 적용
    const kstOffsetMs = 9 * 60 * 60 * 1000;
    const nowKST = new Date(now.getTime() + kstOffsetMs);
    const todayKSTMidnight = new Date(
      Date.UTC(nowKST.getUTCFullYear(), nowKST.getUTCMonth(), nowKST.getUTCDate()),
    );
    const todayStartUTC = new Date(todayKSTMidnight.getTime() - kstOffsetMs);
    const tomorrowStartUTC = new Date(todayStartUTC.getTime() + 24 * 60 * 60 * 1000);

    // 이번 달 1일 00:00 (KST 기준)
    const thisMonthStartKST = new Date(
      Date.UTC(nowKST.getUTCFullYear(), nowKST.getUTCMonth(), 1),
    );
    const thisMonthStartUTC = new Date(thisMonthStartKST.getTime() - kstOffsetMs);

    // 7일 전 시작 (KST 기준 오늘 포함 총 7일)
    const sevenDaysAgoUTC = new Date(todayStartUTC.getTime() - 6 * 24 * 60 * 60 * 1000);

    // 살롱 고객 ID 목록 → 진단 쿼리 필터에 사용
    const salonCustomers = await prisma.customer.findMany({
      where: { salonId: salon.id },
      select: { id: true },
    });
    const customerIds = (salonCustomers as Array<{ id: string }>).map((c) => c.id);

    if (customerIds.length === 0) {
      return NextResponse.json({
        today: 0,
        thisMonth: 0,
        total: 0,
        dailyStats: buildEmptyDailyStats(),
      });
    }

    const baseWhere = { customerId: { in: customerIds } };

    const [todayCount, thisMonthCount, totalCount, last7DaysDiagnoses] =
      await Promise.all([
        // 오늘 진단 건수
        prisma.diagnosis.count({
          where: {
            ...baseWhere,
            createdAt: { gte: todayStartUTC, lt: tomorrowStartUTC },
          },
        }),
        // 이번 달 진단 건수
        prisma.diagnosis.count({
          where: {
            ...baseWhere,
            createdAt: { gte: thisMonthStartUTC },
          },
        }),
        // 누적 진단 건수
        prisma.diagnosis.count({ where: baseWhere }),
        // 최근 7일 진단 (날짜별 집계를 위해 createdAt만 select)
        prisma.diagnosis.findMany({
          where: {
            ...baseWhere,
            createdAt: { gte: sevenDaysAgoUTC },
          },
          select: { createdAt: true },
          orderBy: { createdAt: 'asc' },
        }),
      ]);

    // 최근 7일 일별 진단 건수 배열 생성
    const dailyStats = buildDailyStats(last7DaysDiagnoses, todayStartUTC, kstOffsetMs);

    return NextResponse.json({
      today: todayCount,
      thisMonth: thisMonthCount,
      total: totalCount,
      dailyStats,
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
  const now = new Date();
  const kstOffsetMs = 9 * 60 * 60 * 1000;
  const nowKST = new Date(now.getTime() + kstOffsetMs);
  const todayStartUTC = new Date(
    Date.UTC(nowKST.getUTCFullYear(), nowKST.getUTCMonth(), nowKST.getUTCDate()) - kstOffsetMs,
  );
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(todayStartUTC.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
    const kst = new Date(d.getTime() + kstOffsetMs);
    return {
      date: kst.toISOString().slice(0, 10),
      count: 0,
    };
  });
}

// ─── 헬퍼: 날짜별 집계 ───────────────────────────────────────────────────────
function buildDailyStats(
  diagnoses: Array<{ createdAt: Date }>,
  todayStartUTC: Date,
  kstOffsetMs: number,
): Array<{ date: string; count: number }> {
  // 날짜 문자열(YYYY-MM-DD KST) → count 맵
  const countMap = new Map<string, number>();

  for (const d of diagnoses) {
    const kst = new Date(d.createdAt.getTime() + kstOffsetMs);
    const dateStr = kst.toISOString().slice(0, 10);
    countMap.set(dateStr, (countMap.get(dateStr) ?? 0) + 1);
  }

  // 오늘 포함 최근 7일 순서대로 반환
  return Array.from({ length: 7 }, (_, i) => {
    const dayOffset = new Date(
      todayStartUTC.getTime() - (6 - i) * 24 * 60 * 60 * 1000,
    );
    const kst = new Date(dayOffset.getTime() + kstOffsetMs);
    const dateStr = kst.toISOString().slice(0, 10);
    return { date: dateStr, count: countMap.get(dateStr) ?? 0 };
  });
}
