import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params;

    if (!token) {
      return NextResponse.json({ error: '처방전 토큰이 유효하지 않습니다.' }, { status: 400 });
    }

    const diagnosis = await prisma.diagnosis.findUnique({
      where: { prescriptionToken: token },
      include: {
        customer: true,
        designer: true,
      },
    });

    if (!diagnosis) {
      return NextResponse.json({ error: '해당 처방전을 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      diagnosis,
    });
  } catch (error: any) {
    console.error('Error fetching prescription by token:', error);
    return NextResponse.json(
      { error: error.message || '처방전 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
