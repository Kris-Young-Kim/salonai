import { RGBColor, HSVColor, LabColor, SkinBrightnessType } from '@/types/personalColor';

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(c))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

export function rgbToHsv(r: number, g: number, b: number): HSVColor {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;

  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;

  let h = 0;
  let s = max === 0 ? 0 : delta / max;
  let v = max;

  if (delta !== 0) {
    if (max === rn) {
      h = ((gn - bn) / delta) % 6;
    } else if (max === gn) {
      h = (bn - rn) / delta + 2;
    } else {
      h = (rn - gn) / delta + 4;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  };
}

export function rgbToLab(r: number, g: number, b: number): LabColor {
  // 1. sRGB to Linear RGB
  let rn = r / 255;
  let gn = g / 255;
  let bn = b / 255;

  rn = rn > 0.04045 ? Math.pow((rn + 0.055) / 1.055, 2.4) : rn / 12.92;
  gn = gn > 0.04045 ? Math.pow((gn + 0.055) / 1.055, 2.4) : gn / 12.92;
  bn = bn > 0.04045 ? Math.pow((bn + 0.055) / 1.055, 2.4) : bn / 12.92;

  // 2. Linear RGB to CIE-XYZ (D65 standard observer)
  const x = (rn * 0.4124 + gn * 0.3576 + bn * 0.1805) * 100;
  const y = (rn * 0.2126 + gn * 0.7152 + bn * 0.0722) * 100;
  const z = (rn * 0.0193 + gn * 0.1192 + bn * 0.9505) * 100;

  // D65 reference white point
  const refX = 95.047;
  const refY = 100.000;
  const refZ = 108.883;

  let xr = x / refX;
  let yr = y / refY;
  let zr = z / refZ;

  const f = (t: number) => (t > 0.008856 ? Math.pow(t, 1 / 3) : 7.787 * t + 16 / 116);

  xr = f(xr);
  yr = f(yr);
  zr = f(zr);

  const L = Number((116 * yr - 16).toFixed(1));
  const a = Number((500 * (xr - yr)).toFixed(1));
  const bVal = Number((200 * (yr - zr)).toFixed(1));

  return {
    L: Math.max(0, Math.min(100, L)),
    a: a,
    b: bVal,
  };
}

/**
 * Individual Typology Angle (ITA)
 * ITA = arctan((L* - 50) / b*) * (180 / π)
 */
export function calculateITA(L: number, b: number): number {
  if (b === 0) return 0;
  const rad = Math.atan2(L - 50, b);
  return Number(((rad * 180) / Math.PI).toFixed(1));
}

export function classifySkinBrightness(ita: number, L: number): {
  type: SkinBrightnessType;
  korean: string;
} {
  if (ita > 55 || L > 75) {
    return { type: 'VERY_LIGHT', korean: '매우 화사한 톤 (13~17호)' };
  } else if (ita > 41 || L > 68) {
    return { type: 'LIGHT', korean: '화사하고 밝은 톤 (19~21호)' };
  } else if (ita > 28 || L > 60) {
    return { type: 'INTERMEDIATE', korean: '자연스러운 뉴트럴 톤 (22~23호)' };
  } else if (ita > 10 || L > 52) {
    return { type: 'TAN', korean: '건강하고 그윽한 톤 (24~25호)' };
  } else {
    return { type: 'DARK', korean: '딥 / 다크 톤 (25호 이상)' };
  }
}
