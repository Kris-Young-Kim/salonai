import { RGBColor, PersonalColorResult, SeasonType, ToneType, HairColorChip } from '@/types/personalColor';
import { rgbToHex, rgbToHsv, rgbToLab, calculateITA, classifySkinBrightness } from './colorMath';

export function analyzePersonalColor(rgb: RGBColor): PersonalColorResult {
  const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
  const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
  const lab = rgbToLab(rgb.r, rgb.g, rgb.b);
  const ita = calculateITA(lab.L, lab.b);
  const brightness = classifySkinBrightness(ita, lab.L);

  // 1. Tone Determination (Warm vs Cool)
  // In Asian skin tones, b* represents yellowness and a* represents redness.
  // When b* / a* is high (> 1.15) or Hue is in the yellow/peach range (28~45 deg) -> Warm
  // When a* is prominent or b* is lower (< 13.5) -> Cool
  const yellowToRedRatio = lab.a !== 0 ? lab.b / lab.a : 1;
  const isWarm = lab.b >= 14.2 || (hsv.h >= 28 && hsv.h <= 48 && yellowToRedRatio >= 1.08);

  const tone: ToneType = isWarm ? 'WARM' : 'COOL';
  const toneKorean = isWarm ? '웜톤 (Warm Tone)' : '쿨톤 (Cool Tone)';

  // 2. 4-Season Classification
  let season: SeasonType = 'SPRING_WARM';
  let seasonKorean = '봄 웜톤 (Spring Warm)';
  let seasonSubtype = 'Clear & Bright (라이트/클리어)';
  let confidence = 94;
  let description = '생기 있고 화사한 비타민 같은 에너지의 밝고 따뜻한 톤';
  let undertone = '피치 & 골드 옐로우 베이스';

  const tags: string[] = ['#퍼스널컬러', isWarm ? '#웜톤' : '#쿨톤'];

  if (isWarm) {
    // Warm: Spring vs Autumn based on Lightness (L*) and Chroma (Saturation)
    if (lab.L >= 67 || ita >= 38) {
      season = 'SPRING_WARM';
      seasonKorean = '봄 웜톤 (Spring Warm)';
      seasonSubtype = 'Light / Clear Spring';
      description = '투명하고 화사한 피치빛 피부톤으로 밝고 생기 있는 색상이 가장 잘 어울리는 톤';
      undertone = '피치 & 화사한 골드 베이스';
      tags.push('#봄웜톤', '#밀크티베이지', '#코랄브라운', '#생기발랄');
      confidence = 95;
    } else {
      season = 'AUTUMN_WARM';
      seasonKorean = '가을 웜톤 (Autumn Warm)';
      seasonSubtype = 'Muted / Deep Autumn';
      description = '차분하고 그윽한 우아함이 돋보이는 톤으로 깊이감 있는 어텀 브라운이 베스트인 톤';
      undertone = '골드 & 딥 올리브 베이스';
      tags.push('#가을웜톤', '#올리브카키', '#모카브라운', '#클래식무드');
      confidence = 93;
    }
  } else {
    // Cool: Summer vs Winter based on Lightness and Softness/Contrast
    if (lab.L >= 65 || ita >= 35) {
      season = 'SUMMER_COOL';
      seasonKorean = '여름 쿨톤 (Summer Cool)';
      seasonSubtype = 'Light / Muted Summer';
      description = '맑고 뽀얀 핑크빛 피부톤으로 부드러운 애쉬와 파스텔 로즈 계열이 완벽하게 매칭되는 톤';
      undertone = '맑은 핑크 & 로즈 쿨 베이스';
      tags.push('#여름쿨톤', '#애쉬브라운', '#플럼애쉬', '#청순무드');
      confidence = 96;
    } else {
      season = 'WINTER_COOL';
      seasonKorean = '겨울 쿨톤 (Winter Cool)';
      seasonSubtype = 'Clear / Deep Winter';
      description = '이목구비의 대비감이 뚜렷하며 도회적이고 세련된 다크 & 비비드 컬러가 매력적인 톤';
      undertone = '차가운 블루 & 다크 쿨 베이스';
      tags.push('#겨울쿨톤', '#블루블랙', '#다크체리', '#도시적인세련미');
      confidence = 92;
    }
  }

  // 3. Curated Salon Hair Dye Color Palettes
  const hairColorDatabase: Record<
    SeasonType,
    { best: HairColorChip[]; worst: HairColorChip[]; makeup: PersonalColorResult['makeupAdvice'] }
  > = {
    SPRING_WARM: {
      best: [
        { name: '밀크티 베이지', nameEn: 'Milktea Beige', hex: '#D6B494', level: '9-11 레벨', toneDesc: '부드러운 피치빛 화사함' },
        { name: '코랄 브라운', nameEn: 'Coral Brown', hex: '#B87258', level: '8-9 레벨', toneDesc: '생기 있는 웜 코랄' },
        { name: '피치 골드 브라운', nameEn: 'Peach Gold', hex: '#C48A58', level: '8-10 레벨', toneDesc: '빛을 머금은 골드 반사빛' },
        { name: '밤비 브라운', nameEn: 'Bambi Brown', hex: '#8B5B3E', level: '7-8 레벨', toneDesc: '자연스럽고 부드러운 베이직' },
      ],
      worst: [
        { name: '블루 블랙', nameEn: 'Blue Black', hex: '#1C2331', level: '1-3 레벨', toneDesc: '피부 혈색을 창백하게 만듦' },
        { name: '다크 애쉬 그레이', nameEn: 'Dark Ash Grey', hex: '#4A4E57', level: '5-6 레벨', toneDesc: '노란기를 칙칙하게 부각' },
      ],
      makeup: {
        lipColor: '코랄 핑크, 피치 베이지, 살구 워터 틴트',
        blusher: '살구 피치, 라이트 코랄',
        eyeShadow: '샴페인 골드, 웜 베이지 글리터',
        jewelry: 'GOLD',
        jewelryKorean: '옐로우 골드 / 로즈 골드',
      },
    },

    SUMMER_COOL: {
      best: [
        { name: '스모키 애쉬 브라운', nameEn: 'Smoky Ash Brown', hex: '#7D7571', level: '7-9 레벨', toneDesc: '노란기 0% 맑은 애쉬' },
        { name: '로즈 브라운', nameEn: 'Rose Brown', hex: '#9E6D76', level: '7-8 레벨', toneDesc: '은은한 핑크빛 로맨틱 컬러' },
        { name: '라벤더 애쉬', nameEn: 'Lavender Ash', hex: '#8C8294', level: '8-10 레벨', toneDesc: '투명하고 신비로운 쿨톤 대표' },
        { name: '플래티넘 매트 브라운', nameEn: 'Matte Cool Brown', hex: '#6E665E', level: '6-7 레벨', toneDesc: '차분하고 세련된 뮤트 컬러' },
      ],
      worst: [
        { name: '오렌지 브라운', nameEn: 'Orange Brown', hex: '#BA531B', level: '8-9 레벨', toneDesc: '붉은기와 노란기를 과도하게 부각' },
        { name: '골드 옐로우 브론드', nameEn: 'Gold Blonde', hex: '#D4A017', level: '11-13 레벨', toneDesc: '피부를 누렇게 보이게 함' },
      ],
      makeup: {
        lipColor: '모브 핑크, 쿨 로즈, 푸시아 핑크 그라데이션',
        blusher: '라벤더 핑크, 소프트 로즈',
        eyeShadow: '애쉬 브라운, 로즈 쿼츠 펄',
        jewelry: 'SILVER',
        jewelryKorean: '화이트 골드 / 실버',
      },
    },

    AUTUMN_WARM: {
      best: [
        { name: '올리브 카키 브라운', nameEn: 'Olive Khaki Brown', hex: '#635B47', level: '6-8 레벨', toneDesc: '붉은기 없는 고급스러운 무드' },
        { name: '딥 모카 브라운', nameEn: 'Deep Mocha', hex: '#4A3525', level: '5-6 레벨', toneDesc: '그윽하고 묵직한 럭셔리 톤' },
        { name: '시나몬 브라운', nameEn: 'Cinnamon Brown', hex: '#8C5638', level: '7-8 레벨', toneDesc: '따스한 가을 햇살빛 브라운' },
        { name: '다크 초콜릿', nameEn: 'Dark Chocolate', hex: '#3B2820', level: '4-5 레벨', toneDesc: '차분하고 단정한 인상' },
      ],
      worst: [
        { name: '형광 핑크 / 플래티넘 백발', nameEn: 'Neon / Platinum', hex: '#E0B0FF', level: '13-14 레벨', toneDesc: '피부와 겉돌아 이목구비 흐려짐' },
        { name: '푸른빛 애쉬 그레이', nameEn: 'Cool Blue Ash', hex: '#4B5563', level: '7-8 레벨', toneDesc: '얼굴에 잿빛 그늘 형성' },
      ],
      makeup: {
        lipColor: '브릭 레드, 칠리 오렌지, 마른 장미(MLBB)',
        blusher: '웜 테라코타, 베이지 브라운',
        eyeShadow: '음영 브라운, 카키 골드 펄',
        jewelry: 'GOLD',
        jewelryKorean: '앤틱 골드 / 옐로우 골드',
      },
    },

    WINTER_COOL: {
      best: [
        { name: '미드나잇 블루 블랙', nameEn: 'Midnight Blue Black', hex: '#161B2E', level: '1-3 레벨', toneDesc: '피부를 백옥처럼 돋보이게 함' },
        { name: '버건디 와인', nameEn: 'Burgundy Wine', hex: '#581825', level: '4-6 레벨', toneDesc: '선명하고 매혹적인 딥 레드' },
        { name: '다크 체리 브라운', nameEn: 'Dark Cherry Brown', hex: '#421C24', level: '4-5 레벨', toneDesc: '고급스러운 플럼 체리 반사빛' },
        { name: '다크 에스프레소', nameEn: 'Dark Espresso', hex: '#231F20', level: '3-4 레벨', toneDesc: '선명한 흑발 대비감' },
      ],
      worst: [
        { name: '골드 오렌지 브라운', nameEn: 'Orange Gold', hex: '#B87333', level: '8-10 레벨', toneDesc: '도시적인 이미지를 반감시킴' },
        { name: '애쉬 카키 브라운', nameEn: 'Khaki Ash', hex: '#706E58', level: '6-7 레벨', toneDesc: '피부의 맑은 쿨톤감을 탁하게 만듦' },
      ],
      makeup: {
        lipColor: '체리 레드, 플럼 버건디, 딥 마젠타',
        blusher: '생략 또는 투명한 쿨 핑크',
        eyeShadow: '실버 글리터, 차콜 블랙 음영',
        jewelry: 'SILVER',
        jewelryKorean: '백금(Platinum) / 유광 실버',
      },
    },
  };

  const palette = hairColorDatabase[season];

  return {
    season,
    seasonKorean,
    seasonSubtype,
    tone,
    toneKorean,
    confidence,
    description,
    skinTone: {
      hex,
      rgb,
      hsv,
      lab,
      ita,
      brightnessType: brightness.type,
      brightnessKorean: brightness.korean,
      undertone,
    },
    bestHairColors: palette.best,
    worstHairColors: palette.worst,
    makeupAdvice: palette.makeup,
    tags,
  };
}
