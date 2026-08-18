import { NextRequest, NextResponse } from 'next/server';
import { getSalonContext } from '@/lib/auth/getSalonContext';
import { prisma } from '@/lib/db/prisma';
import { getCustomerRetentionStatus, CustomerRetentionStatus } from '@/lib/crm/retentionCalculator';

export interface RetentionCustomerItem {
  customerId: string;
  customerName: string;
  customerPhone: string;
  diagnosisId: string;
  prescriptionToken: string;
  originalImageUrl: string;
  faceShape: string;
  personalColor: string;
  selectedStyleTags: string[];
  designerNotes: string | null;
  retention: CustomerRetentionStatus;
  suggestedMessage: string;
}

export async function GET(_req: NextRequest) {
  try {
    const ctx = await getSalonContext();
    if (!ctx) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const salon = ctx.salon;
    if (!salon) {
      return NextResponse.json({
        dueThisWeek: [],
        overdue: [],
        upcoming: [],
        totalCustomers: 0,
        dueCount: 0,
      });
    }

    // 살롱 소속 고객 및 최신 진단 조회
    const customers = await prisma.customer.findMany({
      where: { salonId: salon.id },
      include: {
        diagnoses: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const retentionItems: RetentionCustomerItem[] = [];

    for (const c of customers) {
      if (!c.diagnoses || c.diagnoses.length === 0) continue;
      const latestDiagnosis = c.diagnoses[0];

      const retention = getCustomerRetentionStatus(
        latestDiagnosis.createdAt,
        latestDiagnosis.selectedStyleTags,
        latestDiagnosis.designerNotes ?? ''
      );

      const mainStyle = latestDiagnosis.selectedStyleTags[2] || latestDiagnosis.selectedStyleTags[0] || '헤어스타일';
      const contactInfo = salon.phone ? `• 예약/상담 문의: ${salon.phone}` : '• 예약/상담 문의: 033-734-4754';
      const naverPlaceUrl = 'https://m.place.naver.com/hairshop/1724847178/home';
      const suggestedMessage = `[${salon.name}] 안녕하세요, ${c.name} 고객님! 지난번 시술받으신 ${mainStyle} 관리는 만족스러우셨나요? ✨\n\n현재 모발 핏과 예쁜 볼륨을 가장 이상적으로 유지할 수 있는 ${retention.rule.description} 권장 시기입니다.\n\n• 맞춤 케어 팁: ${retention.rule.careAdvice}\n${contactInfo}\n• 네이버 지도/예약: ${naverPlaceUrl}\n고객님의 방문을 따뜻하게 기다리겠습니다.`.trimEnd();

      retentionItems.push({
        customerId: c.id,
        customerName: c.name,
        customerPhone: c.phone,
        diagnosisId: latestDiagnosis.id,
        prescriptionToken: latestDiagnosis.prescriptionToken,
        originalImageUrl: latestDiagnosis.originalImageUrl,
        faceShape: latestDiagnosis.faceShape,
        personalColor: latestDiagnosis.personalColor,
        selectedStyleTags: latestDiagnosis.selectedStyleTags,
        designerNotes: latestDiagnosis.designerNotes,
        retention,
        suggestedMessage,
      });
    }

    // 정렬: 남은 일수 오름차순 (임박한 순)
    retentionItems.sort((a, b) => a.retention.daysRemaining - b.retention.daysRemaining);

    const dueThisWeek = retentionItems.filter((i) => i.retention.status === 'DUE_THIS_WEEK');
    const overdue = retentionItems.filter((i) => i.retention.status === 'OVERDUE');
    const upcoming = retentionItems.filter((i) => i.retention.status === 'UPCOMING');

    return NextResponse.json({
      dueThisWeek,
      overdue,
      upcoming,
      totalCustomers: customers.length,
      dueCount: dueThisWeek.length,
      overdueCount: overdue.length,
    });
  } catch (error: any) {
    console.error('[GET /api/crm/retention]', error);
    return NextResponse.json(
      { error: error.message || 'CRM 재방문 리마인더 데이터를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
