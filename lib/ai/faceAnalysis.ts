import { Point3D, FaceShapeType, FaceAnalysisResult, FacialThirds, FacialWidths } from '@/types/diagnosis';

function getDistance(p1: Point3D, p2: Point3D): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function analyzeFacialLandmarks(
  landmarks: Point3D[],
  imageWidth: number,
  imageHeight: number
): FaceAnalysisResult {
  // Convert normalized coords to pixel coords
  const points = landmarks.map((p) => ({
    x: p.x * imageWidth,
    y: p.y * imageHeight,
    z: p.z,
  }));

  // Key Landmark Indices
  const pForehead = points[10] || { x: imageWidth * 0.5, y: imageHeight * 0.25 };
  const pGlabella = points[9] || points[168] || { x: imageWidth * 0.5, y: imageHeight * 0.4 };
  const pSubnasale = points[2] || { x: imageWidth * 0.5, y: imageHeight * 0.58 };
  const pMenton = points[152] || { x: imageWidth * 0.5, y: imageHeight * 0.78 };

  const pForeheadLeft = points[54] || { x: imageWidth * 0.3, y: imageHeight * 0.3 };
  const pForeheadRight = points[284] || { x: imageWidth * 0.7, y: imageHeight * 0.3 };

  const pCheekLeft = points[234] || { x: imageWidth * 0.25, y: imageHeight * 0.5 };
  const pCheekRight = points[454] || { x: imageWidth * 0.75, y: imageHeight * 0.5 };

  const pJawLeft = points[58] || points[132] || { x: imageWidth * 0.32, y: imageHeight * 0.7 };
  const pJawRight = points[288] || points[361] || { x: imageWidth * 0.68, y: imageHeight * 0.7 };

  // Calculate Distances
  const upperDist = getDistance(pForehead, pGlabella);
  const middleDist = getDistance(pGlabella, pSubnasale);
  const lowerDist = getDistance(pSubnasale, pMenton);
  const totalDist = upperDist + middleDist + lowerDist;

  // Facial Thirds Normalized
  const baseAvg = totalDist / 3;
  const upperRatio = Number((upperDist / baseAvg).toFixed(2));
  const middleRatio = Number((middleDist / baseAvg).toFixed(2));
  const lowerRatio = Number((lowerDist / baseAvg).toFixed(2));

  const upperPercent = Math.round((upperDist / totalDist) * 100);
  const middlePercent = Math.round((middleDist / totalDist) * 100);
  const lowerPercent = Math.round((lowerDist / totalDist) * 100);

  const facialThirds: FacialThirds = {
    upperRatio,
    middleRatio,
    lowerRatio,
    upperPercent,
    middlePercent,
    lowerPercent,
    upperDistance: Math.round(upperDist),
    middleDistance: Math.round(middleDist),
    lowerDistance: Math.round(lowerDist),
  };

  // Facial Widths
  const foreheadWidth = getDistance(pForeheadLeft, pForeheadRight);
  const cheekboneWidth = getDistance(pCheekLeft, pCheekRight);
  const jawWidth = getDistance(pJawLeft, pJawRight);
  const totalLength = getDistance(pForehead, pMenton);

  const lengthToWidthRatio = Number((totalLength / cheekboneWidth).toFixed(2));
  const jawToCheekRatio = Number((jawWidth / cheekboneWidth).toFixed(2));
  const foreheadToCheekRatio = Number((foreheadWidth / cheekboneWidth).toFixed(2));

  const facialWidths: FacialWidths = {
    foreheadWidth: Math.round(foreheadWidth),
    cheekboneWidth: Math.round(cheekboneWidth),
    jawWidth: Math.round(jawWidth),
    totalLength: Math.round(totalLength),
    lengthToWidthRatio,
    jawToCheekRatio,
    foreheadToCheekRatio,
  };

  // Face Shape Classification
  let faceShape: FaceShapeType = 'OVAL';
  let faceShapeKorean = '계란형 (Oval)';
  let confidence = 94;
  let description = '이목구비와 안면 밸런스가 조화로운 가장 이상적인 황금비율 페이스라인';

  const tags: string[] = [];

  // Proportions tags
  if (middleRatio >= 1.12) {
    tags.push('#긴중안부');
  } else if (middleRatio <= 0.9) {
    tags.push('#짧은중안부');
  }

  if (upperRatio >= 1.12) {
    tags.push('#이마볼륨강조');
  }
  if (lowerRatio <= 0.88) {
    tags.push('#짧은턱선');
  }

  // Classification Logic
  if (lengthToWidthRatio >= 1.48 || (middleRatio >= 1.2 && lengthToWidthRatio >= 1.38)) {
    faceShape = 'OBLONG';
    faceShapeKorean = '긴 얼굴형 (Oblong)';
    description = '세로 비율이 강조되어 지적이고 세련된 인상을 주는 페이스라인';
    tags.push('#긴얼굴형', '#가로볼륨필수', '#사이드뱅');
    confidence = 92;
  } else if (lengthToWidthRatio <= 1.25 && jawToCheekRatio >= 0.78) {
    faceShape = 'ROUND';
    faceShapeKorean = '둥근형 (Round)';
    description = '볼선이 부드럽고 가로세로 비율이 균일하여 어려보이고 생기 있는 인상';
    tags.push('#둥근얼굴', '#동안페이스', '#탑볼륨포인트');
    confidence = 91;
  } else if (jawToCheekRatio >= 0.86 && foreheadToCheekRatio >= 0.82) {
    faceShape = 'SQUARE';
    faceShapeKorean = '각진형 / 스퀘어 (Square)';
    description = '하악각과 광대선이 뚜렷하여 도시적이고 당당한 매력의 페이스라인';
    tags.push('#각진얼굴', '#소프트레이어드', '#페이스라인커버');
    confidence = 89;
  } else if (foreheadToCheekRatio >= 0.88 && jawToCheekRatio <= 0.72) {
    faceShape = 'HEART';
    faceShapeKorean = '하트형 / 역삼각 (Heart)';
    description = '이마와 볼 라인이 시원하고 턱선이 슬림하게 떨어지는 V라인 페이스';
    tags.push('#하트형', '#V라인', '#턱선볼륨');
    confidence = 93;
  } else if (foreheadToCheekRatio <= 0.82 && jawToCheekRatio <= 0.74) {
    faceShape = 'DIAMOND';
    faceShapeKorean = '다이아몬드형 (Diamond)';
    description = '광대뼈 라인이 입체적이며 이마와 턱선이 갸름한 매력적인 페이스';
    tags.push('#다이아몬드형', '#광대커버뱅', '#웨이브펌');
    confidence = 90;
  } else {
    faceShape = 'OVAL';
    faceShapeKorean = '계란형 (Oval)';
    description = '어떤 헤어스타일도 완벽하게 소화할 수 있는 균형 잡힌 페이스라인';
    tags.push('#황금비율', '#계란형', '#올라운더');
    confidence = 96;
  }

  // Styling Tips Dictionary
  const stylingTipsMap: Record<
    FaceShapeType,
    { recommendedCut: string; recommendedBang: string; stylingAdvice: string; cautionNote: string }
  > = {
    OVAL: {
      recommendedCut: '소프트 레이어드 컷, 슬릭 컷, 윈드 펌',
      recommendedBang: '시스루 뱅, 사이드 뱅, 풀 뱅 모두 추천',
      stylingAdvice: '얼굴선이 완벽한 균형을 이루므로 원하시는 기장과 트렌드 펌을 자유롭게 시도해보세요.',
      cautionNote: '특별한 단점 커버가 필요 없으므로 모질과 모량에 맞춘 디자인을 권장합니다.',
    },
    ROUND: {
      recommendedCut: '허쉬 컷, 미디엄 레이어드 C컬 펌, 긴머리 빌드 펌',
      recommendedBang: '사이드 뱅, 센터 가르마 롱 뱅 (이마가 살짝 드러나는 스타일)',
      stylingAdvice: '정수리 탑 볼륨을 살리고 얼굴 양옆을 가볍게 떨어뜨려 갸름한 세로 라인을 연출하세요.',
      cautionNote: '풀 뱅이나 턱선 길이의 무거운 일자 보브컷은 얼굴을 더 둥글어 보이게 할 수 있습니다.',
    },
    SQUARE: {
      recommendedCut: '중단발 허그 컷, 소프트 젤리 펌, 페이스라인 테일러드 컷',
      recommendedBang: '턱선까지 완만하게 떨어지는 페이스라인 사이드 뱅',
      stylingAdvice: '턱선을 부드럽게 감싸는 곡선형 S컬이나 레이어드 질감으로 각진 음영을 부드럽게 보완하세요.',
      cautionNote: '무거운 뱅이나 일자 블런트 컷은 턱선을 부각시킬 수 있으니 피하는 것이 좋습니다.',
    },
    OBLONG: {
      recommendedCut: '미디엄 허쉬 펌, 볼륨 엘리자벳 펌, 단발 태슬 컷',
      recommendedBang: '와이드 시스루 뱅, 풀 뱅, 브로우 뱅 (이마 면적 분할)',
      stylingAdvice: '앞머리로 상안부를 분할하고 양옆 사이드에 풍성한 볼륨을 넣어 시선을 가로로 분산시키세요.',
      cautionNote: '정수리에 과도한 볼륨을 주거나 긴 생머리 5:5 가르마는 얼굴을 더 길어보이게 합니다.',
    },
    HEART: {
      recommendedCut: '중단발 빌드 컷, 턱선 레이어드 컷, 플라워 펌',
      recommendedBang: '내추럴 사이드 뱅, 커튼 뱅',
      stylingAdvice: '턱선과 목덜미 주변에 풍성한 컬감을 주어 뾰족한 턱끝에 시각적 안정감을 더해주세요.',
      cautionNote: '정수리나 광대 양옆이 너무 튀어나오는 무거운 볼륨은 피하는 것이 좋습니다.',
    },
    DIAMOND: {
      recommendedCut: '사이드 레이어드 컷, 그레이스 펌, 롱 웨이브 펌',
      recommendedBang: '광대를 살포시 감싸주는 커튼 뱅, 와이드 사이드 뱅',
      stylingAdvice: '광대뼈를 부드러운 곡선으로 가려주고 턱선과 이마 라인에 입체감을 살려주세요.',
      cautionNote: '옆머리를 귀 뒤로 완전히 넘기는 올백 스타일은 광대를 강조할 수 있습니다.',
    },
  };

  return {
    faceShape,
    faceShapeKorean,
    confidence,
    description,
    facialThirds,
    facialWidths,
    landmarks: points,
    tags,
    stylingTips: stylingTipsMap[faceShape],
  };
}
