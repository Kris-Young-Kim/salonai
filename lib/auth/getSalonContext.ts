import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';
import { randomUUID } from 'crypto';

export interface SalonContext {
  clerkUserId: string;
  salon: any;
  designer: any | null;
}

/**
 * 현재 로그인한 Clerk 유저의 살롱 컨텍스트를 반환한다.
 */
export async function getSalonContext(): Promise<SalonContext | null> {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  // 1. Designer 조회
  let designer = await prisma.designer.findUnique({
    where: { clerkUserId: userId },
  });

  let salon: any;

  if (designer) {
    // 2a. Designer가 있으면 연결된 Salon 조회
    const existingSalon = await prisma.salon.findUnique({
      where: { id: designer.salonId },
    });

    if (existingSalon) {
      salon = existingSalon;
    } else {
      salon = await prisma.salon.create({
        data: {
          clerkOrganizationId: `org_auto_${randomUUID().substring(0, 8)}`,
          name: 'SalonAI 기본 살롱',
        },
      });
      await prisma.designer.update({
        where: { id: designer.id },
        data: { salonId: salon.id },
      });
    }
  } else {
    // 2b. Designer가 없으면 — 첫 로그인 디자이너 온보딩
    const firstSalon = await prisma.salon.findFirst();

    if (firstSalon) {
      salon = firstSalon;
    } else {
      salon = await prisma.salon.create({
        data: {
          clerkOrganizationId: `org_auto_${randomUUID().substring(0, 8)}`,
          name: 'SalonAI 기본 살롱',
        },
      });
    }

    // Designer 자동 생성
    designer = await prisma.designer.create({
      data: {
        clerkUserId: userId,
        salonId: salon.id,
        name: '디자이너',
        email: `designer_${userId}@salonai.local`,
      },
    });
  }

  return {
    clerkUserId: userId,
    salon,
    designer,
  };
}
