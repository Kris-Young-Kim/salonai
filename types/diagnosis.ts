export interface Point3D {
  x: number;
  y: number;
  z?: number;
}

export type FaceShapeType =
  | 'OVAL' // 계란형
  | 'ROUND' // 둥근형
  | 'SQUARE' // 각진형 / 사각형
  | 'OBLONG' // 긴형
  | 'HEART' // 하트형 / 역삼각형
  | 'DIAMOND'; // 다이아몬드형

export interface FacialThirds {
  upperRatio: number; // 상안부 비율 (예: 1.0)
  middleRatio: number; // 중안부 비율 (예: 1.1)
  lowerRatio: number; // 하안부 비율 (예: 0.9)
  upperPercent: number; // 상안부 백분율 (예: 33.3%)
  middlePercent: number; // 중안부 백분율 (예: 36.7%)
  lowerPercent: number; // 하안부 백분율 (예: 30.0%)
  upperDistance: number; // 픽셀 거리
  middleDistance: number; // 픽셀 거리
  lowerDistance: number; // 픽셀 거리
}

export interface FacialWidths {
  foreheadWidth: number;
  cheekboneWidth: number;
  jawWidth: number;
  totalLength: number;
  lengthToWidthRatio: number; // 세로 / 광대폭 비율
  jawToCheekRatio: number; // 턱폭 / 광대폭 비율
  foreheadToCheekRatio: number; // 이마폭 / 광대폭 비율
}

export interface FaceAnalysisResult {
  faceShape: FaceShapeType;
  faceShapeKorean: string;
  confidence: number;
  description: string;
  facialThirds: FacialThirds;
  facialWidths: FacialWidths;
  landmarks: Point3D[];
  tags: string[];
  stylingTips: {
    recommendedCut: string;
    recommendedBang: string;
    stylingAdvice: string;
    cautionNote: string;
  };
}
