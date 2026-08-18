import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';

// ─── GET /api/customers/[id] ─────────────────────────────────────────────────
// 고객 상세 + 전체 진단 이력 조회
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { id } = await context.params;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        diagnoses: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            faceShape: true,
            faceRatio: true,
            personalColor: true,
            skinHexColor: true,
            selectedStyleTags: true,
            designerNotes: true,
            prescriptionToken: true,
            originalImageUrl: true,
            createdAt: true,
            designer: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: '고객을 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, customer });
  } catch (error: any) {
    console.error('[GET /api/customers/[id]]', error);
    return NextResponse.json(
      { error: error.message || '고객 정보를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}

// ─── PATCH /api/customers/[id] ───────────────────────────────────────────────
// 고객 정보 수정 (이름, 전화번호)
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json();
    const { name, phone } = body as { name?: string; phone?: string };

    if (!name?.trim() && !phone?.trim()) {
      return NextResponse.json(
        { error: '수정할 이름 또는 전화번호를 입력하세요.' },
        { status: 400 },
      );
    }

    // 고객 존재 여부 확인
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: '고객을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 전화번호 변경 시 동일 살롱 내 중복 체크
    if (phone?.trim() && phone.trim() !== existing.phone) {
      const duplicate = await prisma.customer.findFirst({
        where: {
          salonId: existing.salonId,
          phone: phone.trim(),
          NOT: { id },
        },
      });
      if (duplicate) {
        return NextResponse.json(
          { error: '이미 사용 중인 전화번호입니다.' },
          { status: 409 },
        );
      }
    }

    const updated = await prisma.customer.update({
      where: { id },
      data: {
        ...(name?.trim() ? { name: name.trim() } : {}),
        ...(phone?.trim() ? { phone: phone.trim() } : {}),
      },
    });

    return NextResponse.json({ success: true, customer: updated });
  } catch (error: any) {
    console.error('[PATCH /api/customers/[id]]', error);
    return NextResponse.json(
      { error: error.message || '고객 정보 수정 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
