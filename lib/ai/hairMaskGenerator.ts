/**
 * AI 가상 헤어 인페인팅을 위한 정밀 헤어 마스크 생성 엔진
 * 안면 윤곽(눈/코/입/이마 중앙)을 보존(Black)하고 헤어 영역만 정밀하게 인페인팅 대상(White)으로 마스킹
 */

import { HairStylePromptConfig, DEFAULT_HAIR_PROMPT_CONFIG } from '@/lib/data/hairPromptMap';

export interface GenerateMaskOptions {
  styleConfig?: HairStylePromptConfig;
  blurRadius?: number; // default: 16
  maxDim?: number;     // default: 768
}

/**
 * 주어진 이미지 데이터 URL로부터 스타일 맞춤형 헤어 인페인팅 마스크 생성 (Base64 PNG 반환)
 * - White (#FFFFFF): 인페인팅 대상 (헤어스타일/염색 적용)
 * - Black (#000000): 원본 유지 (눈, 코, 입, 턱, 옷, 배경 등)
 */
export function generateRefinedHairMask(
  imageDataUrl: string,
  options: GenerateMaskOptions = {}
): Promise<string> {
  const {
    styleConfig = DEFAULT_HAIR_PROMPT_CONFIG,
    blurRadius = 18,
  } = options;

  const { foreheadCoverage, sideExtension, bottomExtension } = styleConfig.maskConfig;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const w = img.width;
      const h = img.height;

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas 2D context 생성 실패'));
        return;
      }

      // 1. 전체를 검은색(원본 유지 영역)으로 채움
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, w, h);

      // 2. 부드러운 블러 필터 적용
      ctx.filter = `blur(${blurRadius}px)`;

      // ─── [헤어 영역 White 마스크 드로잉] ───────────────────────
      ctx.fillStyle = '#FFFFFF';

      // (1) 두상 및 크라운 상단 볼륨 (Top Crown)
      ctx.beginPath();
      ctx.ellipse(
        w * 0.5,
        h * 0.16,
        w * 0.42 * sideExtension,
        h * 0.22,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // (2) 측면 사이드 헤어 및 귀 주변 볼륨 (Side Temples)
      // 좌측 사이드
      ctx.beginPath();
      ctx.ellipse(
        w * (0.2 - (sideExtension - 1.0) * 0.1),
        h * 0.32,
        w * 0.18 * sideExtension,
        h * 0.24,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // 우측 사이드
      ctx.beginPath();
      ctx.ellipse(
        w * (0.8 + (sideExtension - 1.0) * 0.1),
        h * 0.32,
        w * 0.18 * sideExtension,
        h * 0.24,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // (3) 기장별 숄더 및 롱 헤어 확장 (Medium / Long Hair Extensions)
      if (bottomExtension > 0.3) {
        // 좌측 어깨 라인
        ctx.beginPath();
        ctx.ellipse(
          w * 0.18,
          h * (0.42 + bottomExtension * 0.25),
          w * 0.2 * sideExtension,
          h * (bottomExtension * 0.35),
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // 우측 어깨 라인
        ctx.beginPath();
        ctx.ellipse(
          w * 0.82,
          h * (0.42 + bottomExtension * 0.25),
          w * 0.2 * sideExtension,
          h * (bottomExtension * 0.35),
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      // (4) 앞머리 영역 (Bangs coverage based on style)
      if (foreheadCoverage > 0.2) {
        ctx.beginPath();
        ctx.ellipse(
          w * 0.5,
          h * (0.24 + (foreheadCoverage - 0.2) * 0.08),
          w * 0.28,
          h * (0.08 + foreheadCoverage * 0.08),
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      // ─── [안면 보호 쉴드 (Face Shield Black Cutout)] ─────────────
      // 눈썹, 눈, 코, 입, 턱선 등 얼굴 중심부가 덮이지 않도록 검은색으로 보호
      ctx.filter = `blur(${Math.max(10, blurRadius * 0.75)}px)`;
      ctx.fillStyle = '#000000';

      // 이목구비 중심 영역 (눈썹 하단 ~ 턱 끝)
      const faceShieldTopY = h * (0.28 + (1 - foreheadCoverage) * 0.08);
      ctx.beginPath();
      ctx.ellipse(
        w * 0.5,
        faceShieldTopY + h * 0.22,
        w * 0.24,
        h * 0.26,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // 이마 중앙 보호 (앞머리가 없는 스타일일수록 더 높이 보호)
      if (foreheadCoverage < 0.4) {
        ctx.beginPath();
        ctx.ellipse(
          w * 0.5,
          h * (0.26 + (0.4 - foreheadCoverage) * 0.06),
          w * 0.18,
          h * 0.09,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      // 3. 최종 PNG Data URL 생성
      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = () => {
      reject(new Error('원본 이미지 로딩 실패 (마스크 생성 불가)'));
    };

    img.src = imageDataUrl;
  });
}
