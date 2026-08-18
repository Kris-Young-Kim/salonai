import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getSalonContext } from '@/lib/auth/getSalonContext';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    // 1. Auth — Clerk 멀티테넌트 살롱 컨텍스트 확인
    const salonContext = await getSalonContext();
    if (!salonContext) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const { salon, designer } = salonContext;

    const body = await req.json();
    const {
      customerName,
      customerPhone,
      originalImageUrl,
      faceShape,
      faceRatio,
      personalColor,
      skinHexColor,
      selectedStyleTags,
      designerNotes,
      synthesizedImageUrl,
    } = body;

    // 2. Create or Find Customer
    const phone = customerPhone || `010-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const name = customerName || '고객님';

    let customer = await prisma.customer.findFirst({
      where: {
        salonId: salon.id,
        phone: phone,
      },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          salonId: salon.id,
          name: name,
          phone: phone,
        },
      });
    }

    // 3. Create Diagnosis Record
    const prescriptionToken = randomUUID();

    const diagnosis = await prisma.diagnosis.create({
      data: {
        customerId: customer.id,
        designerId: designer?.id ?? null,
        originalImageUrl: originalImageUrl || '',
        faceShape: faceShape || '계란형 (Oval)',
        faceRatio: faceRatio || {},
        personalColor: personalColor || '봄 웜톤 (Spring Warm)',
        skinHexColor: skinHexColor || '#F5D061',
        selectedStyleTags: selectedStyleTags || [],
        designerNotes: designerNotes || '살롱 맞춤 디자인 처방이 완료되었습니다.',
        synthesizedImageUrl: synthesizedImageUrl ?? null,
        prescriptionToken: prescriptionToken,
      },
    });

    return NextResponse.json({
      success: true,
      diagnosisId: diagnosis.id,
      prescriptionToken: prescriptionToken,
      prescriptionUrl: `/prescription/${prescriptionToken}`,
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
      },
      createdAt: diagnosis.createdAt,
    });
  } catch (error: any) {
    console.error('Error saving diagnosis to Neon DB:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '진단 데이터를 저장하는 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
