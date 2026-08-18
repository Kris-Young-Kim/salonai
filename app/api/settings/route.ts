import { NextRequest, NextResponse } from 'next/server';
import { getSalonContext } from '@/lib/auth/getSalonContext';
import { prisma } from '@/lib/db/prisma';

// ─── GET /api/settings ────────────────────────────────────────────────────────
export async function GET() {
  try {
    const ctx = await getSalonContext();
    if (!ctx) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }
    return NextResponse.json({ success: true, salon: ctx.salon, designer: ctx.designer });
  } catch (error: any) {
    console.error('[GET /api/settings]', error);
    return NextResponse.json(
      { error: error.message || '설정을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}

// ─── PATCH /api/settings ──────────────────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  try {
    const ctx = await getSalonContext();
    if (!ctx) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const body = await req.json();
    const { salonName, salonAddress, salonPhone, salonLogoUrl, designerName, designerEmail } = body as {
      salonName?: string;
      salonAddress?: string;
      salonPhone?: string;
      salonLogoUrl?: string;
      designerName?: string;
      designerEmail?: string;
    };

    // 이메일 변경 시 중복 체크
    if (designerEmail?.trim() && designerEmail.trim() !== ctx.designer?.email) {
      const duplicate = await prisma.designer.findUnique({
        where: { email: designerEmail.trim() },
      });
      if (duplicate && duplicate.id !== ctx.designer?.id) {
        return NextResponse.json(
          { error: '이미 사용 중인 이메일입니다.' },
          { status: 409 },
        );
      }
    }

    const [updatedSalon, updatedDesigner] = await Promise.all([
      prisma.salon.update({
        where: { id: ctx.salon.id },
        data: {
          ...(salonName?.trim() ? { name: salonName.trim() } : {}),
          ...(salonAddress !== undefined ? { address: salonAddress.trim() || null } : {}),
          ...(salonPhone !== undefined ? { phone: salonPhone.trim() || null } : {}),
          ...(salonLogoUrl !== undefined ? { logoUrl: salonLogoUrl.trim() || null } : {}),
        },
      }),
      ctx.designer
        ? prisma.designer.update({
            where: { id: ctx.designer.id },
            data: {
              ...(designerName?.trim() ? { name: designerName.trim() } : {}),
              ...(designerEmail?.trim() ? { email: designerEmail.trim() } : {}),
            },
          })
        : Promise.resolve(ctx.designer),
    ]);

    return NextResponse.json({ success: true, salon: updatedSalon, designer: updatedDesigner });
  } catch (error: any) {
    console.error('[PATCH /api/settings]', error);
    return NextResponse.json(
      { error: error.message || '설정 저장 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
