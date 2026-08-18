/**
 * 살롱 고객 시술별 권장 재방문 주기(Days) 및 D-Day 계산 엔진
 */

export interface TreatmentCycleRule {
  keyword: string;
  category: 'COLOR' | 'PERM' | 'CUT' | 'CARE';
  recommendedCycleDays: number;
  description: string;
  careAdvice: string;
}

export const TREATMENT_CYCLE_RULES: TreatmentCycleRule[] = [
  // COLOR
  {
    keyword: '뿌리염색',
    category: 'COLOR',
    recommendedCycleDays: 30, // 4~5주
    description: '뿌리 염색 및 톤 밸런스 정돈',
    careAdvice: '신생모 1~1.5cm 자라는 시기로 얼룩 없는 깔끔한 톤 유지를 위해 추천합니다.',
  },
  {
    keyword: '탈색',
    category: 'COLOR',
    recommendedCycleDays: 28, // 4주
    description: '뿌리 탈색 및 토닝 보색 케어',
    careAdvice: '탈색 경계선 단차를 줄이고 노란기를 중화하는 보색 토닝 주기에 해당합니다.',
  },
  {
    keyword: '애쉬',
    category: 'COLOR',
    recommendedCycleDays: 35, // 5주
    description: '애쉬 컬러 반사빛 리프레시',
    careAdvice: '애쉬 반사빛이 서서히 퇴색되는 시기로 은은한 글레이즈 토닝을 추천합니다.',
  },
  {
    keyword: '염색',
    category: 'COLOR',
    recommendedCycleDays: 42, // 6주
    description: '전체 염색 및 엔젤링 클리닉',
    careAdvice: '퇴색된 모발 끝에 수분과 영양을 공급하고 색감을 선명하게 되살릴 주기입니다.',
  },

  // CUT
  {
    keyword: '가일컷',
    category: 'CUT',
    recommendedCycleDays: 21, // 3주
    description: '가일컷 라인 정돈 및 사이드 다운펌',
    careAdvice: '옆머리가 뜨기 시작하고 가르마 엣지가 흐려지는 시기로 라인 재정돈을 권장합니다.',
  },
  {
    keyword: '드롭컷',
    category: 'CUT',
    recommendedCycleDays: 21, // 3주
    description: '드롭컷 페이드 라인 정돈',
    careAdvice: 'M자 및 템플 라인을 깔끔하게 유지하기 위한 3주 컷 주기입니다.',
  },
  {
    keyword: '태슬',
    category: 'CUT',
    recommendedCycleDays: 28, // 4주
    description: '태슬컷 일자 라인 질감 정돈',
    careAdvice: '단발 끝선이 무거워지고 뻗치기 쉬운 시기로 가벼운 질감 처리가 필요합니다.',
  },
  {
    keyword: '허쉬',
    category: 'CUT',
    recommendedCycleDays: 35, // 5주
    description: '허쉬컷 층 재정돈 및 볼륨 밸런스',
    careAdvice: '레이어드 무게감이 아래로 처지는 시기로 상단 볼륨 포인트를 재조정합니다.',
  },
  {
    keyword: '커트',
    category: 'CUT',
    recommendedCycleDays: 28, // 4주
    description: '기본 커트 라인 정돈',
    careAdvice: '헤어 핏을 가장 아름답게 유지할 수 있는 정기 커트 시기입니다.',
  },

  // PERM
  {
    keyword: '다운펌',
    category: 'PERM',
    recommendedCycleDays: 24, // 3~4주
    description: '사이드 다운펌 리터치',
    careAdvice: '신생모가 자라나 옆머리 부피감이 커지는 시기로 슬림한 두상 보정을 권장합니다.',
  },
  {
    keyword: '빌드펌',
    category: 'PERM',
    recommendedCycleDays: 60, // 8~9주
    description: '빌드펌 뿌리 볼륨 및 사이드 C컬 정돈',
    careAdvice: '뿌리 볼륨이 내려앉고 S컬 끝선이 길어지는 시기로 커트와 뿌리펌을 추천합니다.',
  },
  {
    keyword: 'C컬',
    category: 'PERM',
    recommendedCycleDays: 56, // 8주
    description: '레이어드 C컬 펌 클리닉 & 다듬기',
    careAdvice: '컬의 탄력을 살려주고 모발 끝 손상을 예방하는 다듬기 시기입니다.',
  },
  {
    keyword: '펌',
    category: 'PERM',
    recommendedCycleDays: 60, // 8~9주
    description: '펌 컬 리셋 & 탄력 케어',
    careAdvice: '컬 유지력을 연장하고 자연스러운 볼륨을 복원할 수 있는 주기입니다.',
  },
  {
    keyword: '매직',
    category: 'PERM',
    recommendedCycleDays: 90, // 12~13주
    description: '뿌리 매직 스트레이트',
    careAdvice: '자라난 곱슬모를 매끄럽게 펴고 윤기를 부여할 주기입니다.',
  },
];

/**
 * 고객의 선택 스타일 태그 및 디자이너 메모로부터 최적의 재방문 주기 산출
 */
export function calculateRetentionDays(styleTags: string[] = [], notes: string = ''): TreatmentCycleRule {
  const combinedText = `${styleTags.join(' ')} ${notes}`.toLowerCase();

  for (const rule of TREATMENT_CYCLE_RULES) {
    if (combinedText.includes(rule.keyword.toLowerCase())) {
      return rule;
    }
  }

  // 기본값 (일반 스타일 6주)
  return {
    keyword: '스타일 케어',
    category: 'CARE',
    recommendedCycleDays: 42,
    description: '정기 스타일 밸런스 정돈 & 헤어 클리닉',
    careAdvice: '모발 유수분 밸런스를 채우고 예쁜 헤어 실루엣을 유지하기 위한 주기입니다.',
  };
}

export interface CustomerRetentionStatus {
  lastVisitDate: Date;
  recommendedVisitDate: Date;
  daysRemaining: number; // 음수면 경과(D+N), 양수면 남음(D-N), 0이면 오늘(D-Day)
  dDayLabel: string;
  status: 'DUE_THIS_WEEK' | 'OVERDUE' | 'UPCOMING';
  rule: TreatmentCycleRule;
}

/**
 * 진단일 기준 D-Day 및 리마인더 상태 계산
 */
export function getCustomerRetentionStatus(
  diagnosisDate: Date | string,
  styleTags: string[] = [],
  notes: string = ''
): CustomerRetentionStatus {
  const lastVisit = new Date(diagnosisDate);
  const rule = calculateRetentionDays(styleTags, notes);

  const recommendedVisit = new Date(lastVisit.getTime() + rule.recommendedCycleDays * 24 * 60 * 60 * 1000);
  const now = new Date();

  // 자정 기준 날짜 차이 계산
  const msPerDay = 24 * 60 * 60 * 1000;
  const startOfNow = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfTarget = new Date(recommendedVisit.getFullYear(), recommendedVisit.getMonth(), recommendedVisit.getDate()).getTime();

  const daysRemaining = Math.round((startOfTarget - startOfNow) / msPerDay);

  let dDayLabel = '';
  if (daysRemaining === 0) {
    dDayLabel = 'D-Day';
  } else if (daysRemaining > 0) {
    dDayLabel = `D-${daysRemaining}`;
  } else {
    dDayLabel = `D+${Math.abs(daysRemaining)}`;
  }

  let status: 'DUE_THIS_WEEK' | 'OVERDUE' | 'UPCOMING';
  if (daysRemaining >= -7 && daysRemaining <= 7) {
    status = 'DUE_THIS_WEEK'; // 이번 주 권장 (D-7 ~ D+7)
  } else if (daysRemaining < -7) {
    status = 'OVERDUE'; // 주기 초과
  } else {
    status = 'UPCOMING'; // 아직 여유 있음
  }

  return {
    lastVisitDate: lastVisit,
    recommendedVisitDate: recommendedVisit,
    daysRemaining,
    dDayLabel,
    status,
    rule,
  };
}
