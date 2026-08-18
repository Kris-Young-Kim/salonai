import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import { prisma } from '../lib/db/prisma';
import { MASTER_LOOKBOOKS } from '../lib/data/lookbookData';

async function main() {
  console.log('🌱 Neon DB 룩북 마스터 데이터 시딩 시작...');

  for (const item of MASTER_LOOKBOOKS) {
    await prisma.lookbook.upsert({
      where: { id: item.id },
      update: {
        styleName: item.styleName,
        category: item.category,
        targetFaceShapes: item.targetFaceShapes,
        targetPersonalColors: item.targetPersonalColors,
        imageUrl: item.imageUrl,
        description: item.description,
      },
      create: {
        id: item.id,
        styleName: item.styleName,
        category: item.category,
        targetFaceShapes: item.targetFaceShapes,
        targetPersonalColors: item.targetPersonalColors,
        imageUrl: item.imageUrl,
        description: item.description,
      },
    });
  }

  const count = await prisma.lookbook.count();
  console.log(`✅ 총 ${count}개의 룩북 마스터 데이터가 Neon DB에 등록되었습니다!`);
}

main()
  .catch((e) => {
    console.error('❌ 시딩 오류:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
