import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';

// ─── GET /api/customers ──────────────────────────────────────────────────────
// 현재 살롱의 고객 목록 조회 (최근 진단 1건 포함)
// Query params: search (이름/전화번호), page, limit
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim() ?? '';
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)));
    const skip = (page - 1) * limit;

    // 단순화된 살롱 조회 (멀티테넌트는 별도 Auth 작업에서 고도화)
    const salon = await prisma.salon.findFirst();
    if (!salon) {
      return NextResponse.json(
        { customers: [], total: 0, page, limit, totalPages: 0 },
      );
    }

    const whereClause = {
      salonId: salon.id,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { phone: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
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
      }),
      prisma.customer.count({ where: whereClause }),
    ]);

    // diagnoses 배열 → latestDiagnosis 단일 필드로 변환
    const result = customers.map((c: any) => ({
      ...c,
      latestDiagnosis: c.diagnoses?.[0] ?? null,
    }));

    return NextResponse.json({
      customers: result,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error('[GET /api/customers]', error);
    return NextResponse.json(
      { error: error.message || '고객 목록을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}

// ─── POST /api/customers ─────────────────────────────────────────────────────
// 새 고객 생성
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone } = body as { name?: string; phone?: string };

    if (!name?.trim()) {
      return NextResponse.json({ error: '고객 이름은 필수입니다.' }, { status: 400 });
    }
    if (!phone?.trim()) {
      return NextResponse.json({ error: '전화번호는 필수입니다.' }, { status: 400 });
    }

    const salon = await prisma.salon.findFirst();
    if (!salon) {
      return NextResponse.json({ error: '살롱 정보를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 동일 살롱 내 전화번호 중복 체크
    const existing = await prisma.customer.findFirst({
      where: { salonId: salon.id, phone: phone.trim() },
    });
    if (existing) {
      return NextResponse.json(
        { error: '이미 등록된 전화번호입니다.', customerId: existing.id },
        { status: 409 },
      );
    }

    const customer = await prisma.customer.create({
      data: {
        salonId: salon.id,
        name: name.trim(),
        phone: phone.trim(),
      },
    });

    return NextResponse.json({ success: true, customer }, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/customers]', error);
    return NextResponse.json(
      { error: error.message || '고객 생성 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
