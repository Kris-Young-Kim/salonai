import { SeasonType } from '@/types/personalColor';

export interface DyeFormula {
  brand: 'MILBON' | 'LOREAL' | 'WELLA' | 'SCHWARZKOPF';
  brandName: string;
  series: string;
  formula: string; // e.g. "8A + 8SA (1:1)"
  codes: string[]; // individual product codes
  ratio?: string; // e.g. "1:1", "2:1"
  developer: string; // 산화제 번호 e.g. "3% (10vol)" or "6% (20vol)"
  processTime: string; // e.g. "35분"
  notes?: string;
}

export interface ColorTintEntry {
  tintName: string; // matches VirtualHairSimulator swatch names
  tintNameEn: string;
  hex: string;
  level: string; // "7~9 레벨"
  undertone: 'WARM' | 'COOL' | 'NEUTRAL';
  bestForSeasons: SeasonType[];
  formulas: DyeFormula[];
  salonTip: string;
}

export const HAIR_DYE_CHART: ColorTintEntry[] = [
  {
    tintName: '스모키 애쉬',
    tintNameEn: 'Smoky Ash',
    hex: '#7D7571',
    level: '8~9 레벨',
    undertone: 'COOL',
    bestForSeasons: ['SUMMER_COOL', 'WINTER_COOL'],
    salonTip: '노란기를 완전 중화하는 쿨 애쉬. 탈색 후 바로 적용 시 실버 무드 연출 가능.',
    formulas: [
      {
        brand: 'MILBON',
        brandName: '밀본',
        series: 'Ordeve (오데브)',
        formula: '8A + 8SA',
        codes: ['8A', '8SA'],
        ratio: '1:1',
        developer: '6% (20vol)',
        processTime: '35분',
        notes: '잔여 노란기 억제용 SA(Super Ash) 블렌딩',
      },
      {
        brand: 'LOREAL',
        brandName: '로레알',
        series: 'INOA (이노아)',
        formula: '8.1 + 8.12',
        codes: ['8.1', '8.12'],
        ratio: '1:1',
        developer: '6% (20vol)',
        processTime: '35분',
        notes: '암모니아-프리. 두피 자극 최소화',
      },
      {
        brand: 'WELLA',
        brandName: '웰라',
        series: 'Koleston Perfect (콜레스톤)',
        formula: '9/1 + 9/16',
        codes: ['9/1', '9/16'],
        ratio: '2:1',
        developer: '6% (20vol)',
        processTime: '30분',
        notes: 'Pure Naturals 라인 사용 권장',
      },
    ],
  },
  {
    tintName: '밀크티 베이지',
    tintNameEn: 'Milk Tea Beige',
    hex: '#D6B494',
    level: '9~10 레벨',
    undertone: 'WARM',
    bestForSeasons: ['SPRING_WARM', 'AUTUMN_WARM'],
    salonTip: '황금빛 베이지무드. 피부가 화사해 보이는 웜 베이지 계열. 탈색 2회 후 최적.',
    formulas: [
      {
        brand: 'MILBON',
        brandName: '밀본',
        series: 'Ordeve (오데브)',
        formula: '8NB + 9Y',
        codes: ['8NB', '9Y'],
        ratio: '2:1',
        developer: '6% (20vol)',
        processTime: '35분',
        notes: 'NB(Natural Beige) + Y(Yellow) 혼합으로 자연스러운 베이지',
      },
      {
        brand: 'LOREAL',
        brandName: '로레알',
        series: 'INOA (이노아)',
        formula: '9.31 + 9.13',
        codes: ['9.31', '9.13'],
        ratio: '1:1',
        developer: '6% (20vol)',
        processTime: '30분',
        notes: '.3(골드) + .1(애쉬) 중화로 밀크티 표현',
      },
      {
        brand: 'WELLA',
        brandName: '웰라',
        series: 'Koleston Perfect (콜레스톤)',
        formula: '9/73 + 9/3',
        codes: ['9/73', '9/3'],
        ratio: '1:1',
        developer: '6% (20vol)',
        processTime: '30분',
        notes: '브라운-골드 계열 혼합',
      },
    ],
  },
  {
    tintName: '올리브 카키',
    tintNameEn: 'Olive Khaki',
    hex: '#635B47',
    level: '6~8 레벨',
    undertone: 'NEUTRAL',
    bestForSeasons: ['AUTUMN_WARM', 'SPRING_WARM'],
    salonTip: '웜+쿨 중간 어스무드. 카키 컬러는 피부색 고르게 보정. 어두운 피부에도 잘 어울림.',
    formulas: [
      {
        brand: 'MILBON',
        brandName: '밀본',
        series: 'Ordeve (오데브)',
        formula: '6MB + 7A',
        codes: ['6MB', '7A'],
        ratio: '2:1',
        developer: '3% (10vol)',
        processTime: '40분',
        notes: 'MB(Matte Brown) 기반 애쉬 블렌딩으로 카키 구현',
      },
      {
        brand: 'LOREAL',
        brandName: '로레알',
        series: 'INOA (이노아)',
        formula: '7.3 + 6.1',
        codes: ['7.3', '6.1'],
        ratio: '1:1',
        developer: '3% (10vol)',
        processTime: '40분',
        notes: '골드-애쉬 중화로 올리브 표현',
      },
      {
        brand: 'WELLA',
        brandName: '웰라',
        series: 'Koleston Perfect (콜레스톤)',
        formula: '7/73 + 7/3',
        codes: ['7/73', '7/3'],
        ratio: '1:1',
        developer: '3% (10vol)',
        processTime: '35분',
      },
    ],
  },
  {
    tintName: '블루 블랙',
    tintNameEn: 'Blue Black',
    hex: '#161B2E',
    level: '1~3 레벨',
    undertone: 'COOL',
    bestForSeasons: ['WINTER_COOL', 'SUMMER_COOL'],
    salonTip: '블루 계열 잔광으로 쿨한 블랙 표현. 선명한 피부 대비 효과. 탈색 없이도 적용 가능.',
    formulas: [
      {
        brand: 'MILBON',
        brandName: '밀본',
        series: 'Ordeve (오데브)',
        formula: '3A',
        codes: ['3A'],
        ratio: 'straight',
        developer: '3% (10vol)',
        processTime: '40분',
        notes: '단독 사용 가능. 블루블랙 전용 색조',
      },
      {
        brand: 'LOREAL',
        brandName: '로레알',
        series: 'INOA (이노아)',
        formula: '2.10',
        codes: ['2.10'],
        ratio: 'straight',
        developer: '3% (10vol)',
        processTime: '45분',
        notes: '.10(블루 애쉬) 트리플 쿨 효과',
      },
      {
        brand: 'WELLA',
        brandName: '웰라',
        series: 'Koleston Perfect (콜레스톤)',
        formula: '2/8 + 1/0',
        codes: ['2/8', '1/0'],
        ratio: '2:1',
        developer: '3% (10vol)',
        processTime: '40분',
        notes: '/8 블루 계열 혼합으로 깊이감 추가',
      },
    ],
  },
  {
    tintName: '로즈 플럼',
    tintNameEn: 'Rose Plum',
    hex: '#9E6D76',
    level: '6~8 레벨',
    undertone: 'COOL',
    bestForSeasons: ['SUMMER_COOL', 'WINTER_COOL'],
    salonTip: '핑크-바이올렛 계열 쿨 무드. 피부 핑크 언더톤 살려주는 컬러. 탈색 1~2회 필요.',
    formulas: [
      {
        brand: 'MILBON',
        brandName: '밀본',
        series: 'Ordeve (오데브)',
        formula: '6PA + 7A',
        codes: ['6PA', '7A'],
        ratio: '1:1',
        developer: '6% (20vol)',
        processTime: '35분',
        notes: 'PA(Pink Ash) 계열로 로즈 파스텔 표현',
      },
      {
        brand: 'LOREAL',
        brandName: '로레알',
        series: 'INOA (이노아)',
        formula: '6.26 + 6.1',
        codes: ['6.26', '6.1'],
        ratio: '1:1',
        developer: '6% (20vol)',
        processTime: '35분',
        notes: '.26(핑크-바이올렛) + .1(애쉬) 쿨 로즈 구현',
      },
      {
        brand: 'WELLA',
        brandName: '웰라',
        series: 'Koleston Perfect (콜레스톤)',
        formula: '7/6 + 7/1',
        codes: ['7/6', '7/1'],
        ratio: '1:1',
        developer: '6% (20vol)',
        processTime: '30분',
        notes: '/6 바이올렛 계열 사용',
      },
    ],
  },
  {
    tintName: '다크 초콜릿',
    tintNameEn: 'Dark Chocolate',
    hex: '#4A3B32',
    level: '5~6 레벨',
    undertone: 'WARM',
    bestForSeasons: ['AUTUMN_WARM', 'WINTER_COOL'],
    salonTip: '깊은 웜 브라운. 피부 혈색을 살려주고 건강한 이미지. 탈색 없이도 자연스럽게 표현.',
    formulas: [
      {
        brand: 'MILBON',
        brandName: '밀본',
        series: 'Ordeve (오데브)',
        formula: '5NB + 6CB',
        codes: ['5NB', '6CB'],
        ratio: '1:1',
        developer: '3% (10vol)',
        processTime: '40분',
        notes: 'NB(Natural Brown) + CB(Chocolate Brown) 혼합',
      },
      {
        brand: 'LOREAL',
        brandName: '로레알',
        series: 'INOA (이노아)',
        formula: '5.35 + 6.35',
        codes: ['5.35', '6.35'],
        ratio: '1:1',
        developer: '3% (10vol)',
        processTime: '40분',
        notes: '.35(골드-마호가니) 웜 초콜릿 표현',
      },
      {
        brand: 'WELLA',
        brandName: '웰라',
        series: 'Koleston Perfect (콜레스톤)',
        formula: '5/73 + 5/3',
        codes: ['5/73', '5/3'],
        ratio: '1:1',
        developer: '3% (10vol)',
        processTime: '35분',
        notes: '/73 브라운-골드 계열',
      },
    ],
  },
];

export function getRecommendedDyes(
  season: SeasonType,
  selectedTintHex?: string
): ColorTintEntry[] {
  if (selectedTintHex) {
    const exact = HAIR_DYE_CHART.find(
      (c) => c.hex.toLowerCase() === selectedTintHex.toLowerCase()
    );
    if (exact) return [exact];
  }
  return HAIR_DYE_CHART.filter((c) => c.bestForSeasons.includes(season));
}

export function getDyeByTintName(tintName: string): ColorTintEntry | undefined {
  return HAIR_DYE_CHART.find(
    (c) => c.tintName === tintName || c.tintNameEn === tintName
  );
}
