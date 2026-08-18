import { FaceAnalysisResult } from '@/types/diagnosis';
import { PersonalColorResult } from '@/types/personalColor';
import { CustomerQuickMeta } from '@/types/camera';
import { LookbookItem, MatchedLookbookItem } from '@/types/lookbook';
import { MASTER_LOOKBOOKS } from '@/lib/data/lookbookData';

export interface DiagnosisData {
  faceAnalysis: FaceAnalysisResult;
  personalColor: PersonalColorResult;
  customerMeta: CustomerQuickMeta;
}

export function matchLookbooks(
  diagnosis: DiagnosisData,
  lookbooks: LookbookItem[] = MASTER_LOOKBOOKS
): MatchedLookbookItem[] {
  const { faceAnalysis, personalColor, customerMeta } = diagnosis;

  const matchedList = lookbooks.map((item) => {
    let score = 50; // Base score
    const matchReasons: string[] = [];

    // 1. Gender Filter / Matching (+10 pts)
    const isGenderMatch =
      item.gender === customerMeta.gender || item.gender === 'unisex' || customerMeta.gender === 'unisex';
    if (isGenderMatch) {
      score += 10;
    } else {
      score -= 30; // Heavy penalty for opposite gender unless specifically requested
    }

    // 2. Face Shape Match (+25 pts)
    if (item.targetFaceShapes.includes(faceAnalysis.faceShape)) {
      score += 25;
      matchReasons.push(`${faceAnalysis.faceShapeKorean}에 최적화된 페이스라인 보정`);
    }

    // 3. Facial Thirds special synergy (+10 pts)
    if (faceAnalysis.facialThirds.middleRatio > 1.08 && item.tags.some((t) => t.includes('중안부') || t.includes('사이드뱅') || t.includes('허쉬'))) {
      score += 10;
      matchReasons.push('긴 중안부를 시각적으로 분할해주는 볼륨');
    }
    if (faceAnalysis.faceShape === 'ROUND' && item.tags.some((t) => t.includes('탑볼륨') || t.includes('레이어드'))) {
      score += 8;
      matchReasons.push('정수리 탑 볼륨으로 갸름한 세로 비율 연출');
    }
    if (faceAnalysis.faceShape === 'SQUARE' && item.tags.some((t) => t.includes('페이스라인') || t.includes('소프트') || t.includes('웨이브'))) {
      score += 8;
      matchReasons.push('턱선 각을 부드러운 곡선으로 커버');
    }

    // 4. Personal Color Match (+25 pts)
    if (item.targetPersonalColors.includes(personalColor.season)) {
      score += 25;
      matchReasons.push(`${personalColor.seasonKorean} 피부의 맑은 톤을 극대화`);
    }

    // 5. Hair Length Preference Match (+10 pts)
    if (customerMeta.hairLength && item.length === customerMeta.hairLength) {
      score += 10;
      matchReasons.push(`현재 ${customerMeta.hairLength === 'short' ? '숏' : customerMeta.hairLength === 'medium' ? '미디엄' : '롱'} 기장에 딱 맞는 디자인`);
    }

    // Cap between 60% and 99%
    const finalScore = Math.max(55, Math.min(99, Math.round(score)));

    // Fallback reason if empty
    if (matchReasons.length === 0) {
      matchReasons.push('트렌디하고 손질이 편안한 살롱 베스트 스타일');
    }

    return {
      ...item,
      matchScore: finalScore,
      matchReasons: matchReasons.slice(0, 2),
      isTopMatch: finalScore >= 90,
    };
  });

  // Sort by highest match score first
  return matchedList.sort((a, b) => b.matchScore - a.matchScore);
}
