/**
 * 실시간 가상 헤어 피팅(Try-On)을 위한 스타일 쉐입 및 메타데이터 정의
 */

export interface VirtualHairPiece {
  id: string;
  name: string;
  category: 'female' | 'male' | 'unisex';
  length: 'short' | 'medium' | 'long';
  tags: string[];
  description: string;
  // SVG 벡터 쉐입 패스 또는 렌더링 타입
  shapeType: 'layered-c-curl' | 'tassel-bob' | 'build-perm' | 'hershey' | 'hippie-wave' | 'guile-cut' | 'dandy-cut' | 'as-perm' | 'ivy-league';
  // 피팅 보정치 (0 기준 오프셋)
  offsetYPercent: number; // 상하 미세위치
  scaleMultiplier: number; // 크기 배율
}

export const VIRTUAL_HAIR_PIECES: VirtualHairPiece[] = [
  // ─── 여성 추천 스타일 ──────────────────────────────────────────
  {
    id: 'vh-f-layered-c',
    name: '레이어드 C컬 펌',
    category: 'female',
    length: 'medium',
    tags: ['#페이스라인컷', '#볼륨C컬', '#데일리스타일'],
    description: '턱선을 부드럽게 감싸고 어깨선에서 자연스럽게 떨어지는 유니헤어샵 시그니처 펌',
    shapeType: 'layered-c-curl',
    offsetYPercent: -2,
    scaleMultiplier: 1.05,
  },
  {
    id: 'vh-f-tassel-bob',
    name: '슬릭 태슬 단발',
    category: 'female',
    length: 'short',
    tags: ['#칼단발', '#슬릭태슬', '#세련된도시무드'],
    description: '끝선을 가볍게 털어낸 모던하고 깔끔한 스트레이트 태슬컷',
    shapeType: 'tassel-bob',
    offsetYPercent: 1,
    scaleMultiplier: 0.98,
  },
  {
    id: 'vh-f-build-perm',
    name: '사이드뱅 빌드펌',
    category: 'female',
    length: 'long',
    tags: ['#여신웨이브', '#사이드볼륨', '#우아한실루엣'],
    description: '광대라인을 커버하는 S컬 웨이브와 풍성한 뿌리 볼륨의 정석',
    shapeType: 'build-perm',
    offsetYPercent: -4,
    scaleMultiplier: 1.12,
  },
  {
    id: 'vh-f-hershey',
    name: '내추럴 허쉬컷',
    category: 'female',
    length: 'medium',
    tags: ['#트렌디', '#가벼운질감', '#유니크무드'],
    description: '질감을 극대화하여 깃털처럼 가볍고 시크한 레이어드 컷',
    shapeType: 'hershey',
    offsetYPercent: -1,
    scaleMultiplier: 1.02,
  },
  {
    id: 'vh-f-hippie',
    name: '젤리 히피펌',
    category: 'female',
    length: 'long',
    tags: ['#러블리웨이브', '#풍성한볼륨', '#자유로운무드'],
    description: '뿌리부터 촘촘하게 흐르는 감성적인 내추럴 컬링',
    shapeType: 'hippie-wave',
    offsetYPercent: -3,
    scaleMultiplier: 1.15,
  },

  // ─── 남성 추천 스타일 ──────────────────────────────────────────
  {
    id: 'vh-m-guile',
    name: '클래식 가일컷',
    category: 'male',
    length: 'short',
    tags: ['#반깐머리', '#젠틀시크', '#남성인기1위'],
    description: '한쪽은 넘기고 한쪽은 자연스럽게 내리는 트렌디 가일 스타일',
    shapeType: 'guile-cut',
    offsetYPercent: -2,
    scaleMultiplier: 0.95,
  },
  {
    id: 'vh-m-dandy',
    name: '시스루 댄디컷',
    category: 'male',
    length: 'short',
    tags: ['#꾸안꾸', '#남친룩', '#이마보정'],
    description: '이마가 살짝 비치는 가벼운 앞머리와 깔끔한 다운펌 라인',
    shapeType: 'dandy-cut',
    offsetYPercent: 0,
    scaleMultiplier: 0.96,
  },
  {
    id: 'vh-m-as-perm',
    name: '내추럴 애즈펌',
    category: 'male',
    length: 'medium',
    tags: ['#부드러운이미지', '#자연스러운가르마', '#인기스타일'],
    description: '이마 중앙을 살짝 드러내어 답답하지 않고 부드러운 분위기 연출',
    shapeType: 'as-perm',
    offsetYPercent: -1,
    scaleMultiplier: 0.98,
  },
  {
    id: 'vh-m-ivy',
    name: '아이비리그컷',
    category: 'male',
    length: 'short',
    tags: ['#샤프함', '#포마드스타일', '#남성다운라인'],
    description: '이마를 시원하게 오픈하여 또렷한 이목구비와 깔끔한 인상을 주는 숏컷',
    shapeType: 'ivy-league',
    offsetYPercent: 2,
    scaleMultiplier: 0.92,
  },
];
