export type ToneType = 'WARM' | 'COOL' | 'NEUTRAL';

export type SeasonType =
  | 'SPRING_WARM' // 봄 웜톤 (Spring Warm)
  | 'SUMMER_COOL' // 여름 쿨톤 (Summer Cool)
  | 'AUTUMN_WARM' // 가을 웜톤 (Autumn Warm)
  | 'WINTER_COOL'; // 겨울 쿨톤 (Winter Cool)

export type SkinBrightnessType =
  | 'VERY_LIGHT' // 매우 밝은 톤 (13~17호)
  | 'LIGHT' // 밝은 톤 (19~21호)
  | 'INTERMEDIATE' // 보통/자연스러운 톤 (22~23호)
  | 'TAN' // 건강한 톤 (24~25호)
  | 'DARK'; // 딥 톤 (25호 이상)

export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export interface HSVColor {
  h: number; // 0 ~ 360 (도)
  s: number; // 0 ~ 100 (%)
  v: number; // 0 ~ 100 (%)
}

export interface LabColor {
  L: number; // 0 ~ 100 (명도)
  a: number; // -128 ~ 127 (Green <-> Red)
  b: number; // -128 ~ 127 (Blue <-> Yellow)
}

export interface HairColorChip {
  name: string;
  nameEn: string;
  hex: string;
  level: string; // 예: "8-10 레벨"
  toneDesc: string; // 예: "노란기를 중화하는 쿨 애쉬"
}

export interface PersonalColorResult {
  season: SeasonType;
  seasonKorean: string;
  seasonSubtype: string; // 예: "Light / Clear", "Muted / Soft", "Deep / Dark"
  tone: ToneType;
  toneKorean: string; // "웜톤", "쿨톤", "뉴트럴톤"
  confidence: number;
  description: string;
  
  skinTone: {
    hex: string;
    rgb: RGBColor;
    hsv: HSVColor;
    lab: LabColor;
    ita: number; // Individual Typology Angle
    brightnessType: SkinBrightnessType;
    brightnessKorean: string; // "화사한 밝은 톤 (21호)"
    undertone: string; // "피치/옐로우 베이스" or "핑크/로즈 베이스"
  };

  bestHairColors: HairColorChip[];
  worstHairColors: HairColorChip[];
  
  makeupAdvice: {
    lipColor: string;
    blusher: string;
    eyeShadow: string;
    jewelry: 'GOLD' | 'SILVER' | 'ROSE_GOLD';
    jewelryKorean: string;
  };

  tags: string[];
}
