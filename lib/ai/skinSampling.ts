import { Point3D } from '@/types/diagnosis';
import { RGBColor } from '@/types/personalColor';

export interface SkinROISample {
  forehead: RGBColor;
  leftCheek: RGBColor;
  rightCheek: RGBColor;
  combinedAverage: RGBColor;
  roiPoints: {
    forehead: { x: number; y: number };
    leftCheek: { x: number; y: number };
    rightCheek: { x: number; y: number };
  };
}

export async function extractSkinColorFromImage(
  imageSource: HTMLImageElement | HTMLCanvasElement | string,
  landmarks: Point3D[]
): Promise<SkinROISample> {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null;

  if (imageSource instanceof HTMLCanvasElement) {
    canvas = imageSource;
    ctx = canvas.getContext('2d');
  } else {
    canvas = document.createElement('canvas');
    ctx = canvas.getContext('2d');

    let img: HTMLImageElement;
    if (typeof imageSource === 'string') {
      img = await new Promise((resolve, reject) => {
        const i = new Image();
        i.crossOrigin = 'anonymous';
        i.onload = () => resolve(i);
        i.onerror = reject;
        i.src = imageSource;
      });
    } else {
      img = imageSource;
    }

    canvas.width = img.naturalWidth || img.width || 1080;
    canvas.height = img.naturalHeight || img.height || 1440;
    if (ctx) {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
  }

  const w = canvas.width;
  const h = canvas.height;

  // Key Landmark Coordinates (fallback to safe ratios if missing)
  const pForehead = landmarks[151] || landmarks[9] || { x: 0.5, y: 0.32 };
  const pLeftCheek = landmarks[118] || landmarks[117] || { x: 0.36, y: 0.52 };
  const pRightCheek = landmarks[347] || landmarks[346] || { x: 0.64, y: 0.52 };

  const foreheadPt = { x: Math.round(pForehead.x * w), y: Math.round(pForehead.y * h) };
  const leftCheekPt = { x: Math.round(pLeftCheek.x * w), y: Math.round(pLeftCheek.y * h) };
  const rightCheekPt = { x: Math.round(pRightCheek.x * w), y: Math.round(pRightCheek.y * h) };

  if (!ctx) {
    // Return standard fair/warm natural skin tone
    return {
      forehead: { r: 242, g: 213, b: 194 },
      leftCheek: { r: 244, g: 209, b: 191 },
      rightCheek: { r: 243, g: 210, b: 192 },
      combinedAverage: { r: 243, g: 211, b: 192 },
      roiPoints: {
        forehead: foreheadPt,
        leftCheek: leftCheekPt,
        rightCheek: rightCheekPt,
      },
    };
  }

  const sampleSize = Math.max(10, Math.round(w * 0.02));

  const sampleRegion = (centerX: number, centerY: number): RGBColor => {
    try {
      const half = Math.floor(sampleSize / 2);
      const startX = Math.max(0, Math.min(w - sampleSize, centerX - half));
      const startY = Math.max(0, Math.min(h - sampleSize, centerY - half));
      const imgData = ctx.getImageData(startX, startY, sampleSize, sampleSize);
      const data = imgData.data;

      let rSum = 0;
      let gSum = 0;
      let bSum = 0;
      let count = 0;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const brightness = (r + g + b) / 3;

        // Discard excessive highlights (sweat/glare > 250) or deep shadows (< 35)
        if (brightness > 35 && brightness < 250) {
          rSum += r;
          gSum += g;
          bSum += b;
          count++;
        }
      }

      if (count === 0) return { r: 240, g: 210, b: 190 };

      return {
        r: Math.round(rSum / count),
        g: Math.round(gSum / count),
        b: Math.round(bSum / count),
      };
    } catch {
      return { r: 240, g: 210, b: 190 };
    }
  };

  const foreheadColor = sampleRegion(foreheadPt.x, foreheadPt.y);
  const leftCheekColor = sampleRegion(leftCheekPt.x, leftCheekPt.y);
  const rightCheekColor = sampleRegion(rightCheekPt.x, rightCheekPt.y);

  // Combined weighted average: cheeks have 70% weight, forehead has 30% weight
  const combinedR = Math.round(foreheadColor.r * 0.3 + leftCheekColor.r * 0.35 + rightCheekColor.r * 0.35);
  const combinedG = Math.round(foreheadColor.g * 0.3 + leftCheekColor.g * 0.35 + rightCheekColor.g * 0.35);
  const combinedB = Math.round(foreheadColor.b * 0.3 + leftCheekColor.b * 0.35 + rightCheekColor.b * 0.35);

  return {
    forehead: foreheadColor,
    leftCheek: leftCheekColor,
    rightCheek: rightCheekColor,
    combinedAverage: { r: combinedR, g: combinedG, b: combinedB },
    roiPoints: {
      forehead: foreheadPt,
      leftCheek: leftCheekPt,
      rightCheek: rightCheekPt,
    },
  };
}
