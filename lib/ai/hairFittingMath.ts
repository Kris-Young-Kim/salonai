/**
 * MediaPipe 랜드마크 기반 실시간 가상 헤어 앵커링 & 변환 계산 유틸리티
 */

export interface NormalizedLandmark {
  x: number;
  y: number;
  z?: number;
}

export interface HairTransform {
  centerX: number;      // 캔버스 가로 대비 % (0~100)
  centerY: number;      // 캔버스 세로 대비 % (0~100)
  scaleWidth: number;   // 헤어피스 너비 (픽셀 또는 % 단위 기준 배율)
  scaleHeight: number;  // 헤어피스 높이 배율
  rotationDeg: number;  // 고개 기울기 회전 각도 (Degrees)
  aspectRatio: number;  // 얼굴 가로/세로 비율
}

// MediaPipe 핵심 안면 인덱스
const LM_FOREHEAD_TOP = 10;
const LM_CHIN_BOTTOM = 152;
const LM_LEFT_EAR = 234;
const LM_RIGHT_EAR = 454;
const LM_LEFT_EYE = 33;
const LM_RIGHT_EYE = 263;

/**
 * 랜드마크 배열로부터 가상 헤어피스의 최적 앵커 위치, 스케일, 회전각 계산
 */
export function calculateHairFittingTransform(
  landmarks: NormalizedLandmark[] | null | undefined,
  canvasWidth: number,
  canvasHeight: number
): HairTransform {
  // 랜드마크가 없을 때 기본 표준 위치 (성인 얼굴 정면 기준)
  if (!landmarks || landmarks.length < 468) {
    return {
      centerX: 50,
      centerY: 38,
      scaleWidth: canvasWidth * 0.72,
      scaleHeight: canvasHeight * 0.65,
      rotationDeg: 0,
      aspectRatio: 1.0,
    };
  }

  const forehead = landmarks[LM_FOREHEAD_TOP];
  const chin = landmarks[LM_CHIN_BOTTOM];
  const leftEar = landmarks[LM_LEFT_EAR];
  const rightEar = landmarks[LM_RIGHT_EAR];
  const leftEye = landmarks[LM_LEFT_EYE];
  const rightEye = landmarks[LM_RIGHT_EYE];

  // 1. 얼굴 가로 폭 (좌우 귀 랜드마크 거리)
  const faceWidthNorm = Math.hypot(rightEar.x - leftEar.x, rightEar.y - leftEar.y);
  // 2. 얼굴 세로 길이 (이마~턱)
  const faceHeightNorm = Math.hypot(chin.x - forehead.x, chin.y - forehead.y);

  // 3. 고개 기울기 각도 (Eye Roll 또는 Ear Roll)
  const eyeDx = rightEye.x - leftEye.x;
  const eyeDy = rightEye.y - leftEye.y;
  const rotationRad = Math.atan2(eyeDy, eyeDx);
  const rotationDeg = (rotationRad * 180) / Math.PI;

  // 4. 헤어피스 중심점 (이마 상단보다 약간 위 정수리 기준점)
  // 이마 최상단(10번)에서 얼굴 세로 길이의 약 15% 위쪽으로 오프셋
  const offsetNormY = -faceHeightNorm * 0.14;
  const anchorNormX = forehead.x + offsetNormY * Math.sin(rotationRad);
  const anchorNormY = forehead.y + offsetNormY * Math.cos(rotationRad);

  // 5. 헤어피스 스케일 (실제 머리숱과 두상을 감싸도록 얼굴 폭의 약 1.45~1.6배)
  const hairWidthPx = faceWidthNorm * canvasWidth * 1.55;
  const hairHeightPx = faceHeightNorm * canvasHeight * 1.65;

  return {
    centerX: anchorNormX * 100,
    centerY: anchorNormY * 100,
    scaleWidth: hairWidthPx,
    scaleHeight: hairHeightPx,
    rotationDeg,
    aspectRatio: faceWidthNorm / (faceHeightNorm || 1),
  };
}
