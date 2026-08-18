/**
 * K-살롱 마스터 룩북 24종 및 가상 헤어스타일 특화 프롬프트 매핑 테이블
 * Stable Diffusion Inpainting 모델을 위한 영문 키워드, 조명, 질감 및 네거티브 프롬프트 사양
 */

export interface HairStylePromptConfig {
  styleId: string;
  styleName: string;
  category: 'CUT' | 'PERM' | 'COLOR';
  gender: 'female' | 'male' | 'unisex';
  length: 'short' | 'medium' | 'long';
  bangsType: 'none' | 'see-through' | 'curtain-side' | 'full' | 'asymmetric-parted';
  // Positive Prompt components
  positiveKeywords: string[];
  textureKeywords: string[];
  stylingKeywords: string[];
  // Negative Prompt specific to this style
  negativeKeywords: string[];
  // Mask configuration parameters
  maskConfig: {
    foreheadCoverage: number; // 0.0 (fully open forehead) ~ 1.0 (full bangs down to eyebrows)
    sideExtension: number;    // 1.0 (default) ~ 1.5 (wide side volume / waves)
    bottomExtension: number;  // 0.2 (short) ~ 0.8 (long chest-length hair)
  };
}

export const MASTER_HAIR_PROMPT_MAP: Record<string, HairStylePromptConfig> = {
  // ─── 여성 CUT & PERM ──────────────────────────────────────────
  'lb-f-01': {
    styleId: 'lb-f-01',
    styleName: '소프트 레이어드 컷 & C컬 펌',
    category: 'CUT',
    gender: 'female',
    length: 'medium',
    bangsType: 'curtain-side',
    positiveKeywords: [
      'masterpiece, 8k photo of Korean female hairstyle',
      'soft layered haircut with gentle inward C-curl ends',
      'face-framing delicate layers tapering softly along jawline',
      'smooth airy volume on crown and sides',
      'glossy healthy Korean salon hair texture',
      'natural movement and clean silhouette',
    ],
    textureKeywords: ['silky soft strands', 'subtle reflection highlight', 'natural salon blowout'],
    stylingKeywords: ['feathered tips', 'inward curved ends', 'volumetric roots'],
    negativeKeywords: [
      'stiff chunky curls', 'unblended harsh layers', 'frizzy dry ends',
      'distorted face', 'altered facial features', 'messy uneven hairline',
    ],
    maskConfig: {
      foreheadCoverage: 0.25,
      sideExtension: 1.25,
      bottomExtension: 0.55,
    },
  },
  'lb-f-02': {
    styleId: 'lb-f-02',
    styleName: '미디엄 허쉬 컷 & 텍스처 펌',
    category: 'CUT',
    gender: 'female',
    length: 'medium',
    bangsType: 'see-through',
    positiveKeywords: [
      'masterpiece, 8k photo of Korean trendy female hush haircut',
      'medium length textured hush cut with light piecey layers',
      'high crown volume with feathered lightweight ends',
      'delicate see-through bangs softly grazing eyebrows',
      'chic effortless K-pop idol aesthetic',
    ],
    textureKeywords: ['piecey texture', 'airy separation', 'matte-sheen finish'],
    stylingKeywords: ['feathered ends', 'wispy hair tips', 'sculpted top volume'],
    negativeKeywords: [
      'heavy blunt haircut', 'thick solid bangs', 'greasy strands',
      'deformed forehead', 'altered eye shape', 'low resolution',
    ],
    maskConfig: {
      foreheadCoverage: 0.45,
      sideExtension: 1.3,
      bottomExtension: 0.5,
    },
  },
  'lb-f-03': {
    styleId: 'lb-f-03',
    styleName: '엘리자벳 펌 & 롱 S컬',
    category: 'PERM',
    gender: 'female',
    length: 'long',
    bangsType: 'curtain-side',
    positiveKeywords: [
      'masterpiece, 8k photo of Korean luxury salon Elisabeth perm',
      'long flowing glamorous S-curl waves',
      'voluminous side-swept curtain bangs sweeping past cheekbones',
      'elegant bouncy feminine curls cascading down the shoulders',
      'luxurious glossy sheen and rich salon blow-dry finish',
    ],
    textureKeywords: ['bouncy defined curls', 'rich luster', 'deep dimensional waves'],
    stylingKeywords: ['sweeping curtain wave', 'romantic S-curves', 'ample root lift'],
    negativeKeywords: [
      'tight ringlets', 'frizzy afro texture', 'clumpy messy tangles',
      'obscured eyes', 'warped cheekbones', 'unnatural hair color bleeding',
    ],
    maskConfig: {
      foreheadCoverage: 0.2,
      sideExtension: 1.45,
      bottomExtension: 0.85,
    },
  },
  'lb-f-04': {
    styleId: 'lb-f-04',
    styleName: '단발 태슬 컷 & 슬릭 펌',
    category: 'CUT',
    gender: 'female',
    length: 'short',
    bangsType: 'none',
    positiveKeywords: [
      'masterpiece, 8k photo of Korean modern tassel bob haircut',
      'sharp sleek straight blunt bob reaching just below jawline',
      'lightly textured tassel ends with clean geometric lines',
      'glass hair finish, ultra shiny and smooth',
      'minimalist high-fashion Seoul salon aesthetic',
    ],
    textureKeywords: ['glass hair', 'pin-straight sheen', 'micro-textured blunt ends'],
    stylingKeywords: ['tassel finish', 'clean ear tuck', 'precise perimeter'],
    negativeKeywords: [
      'wavy or curly ends', 'puffy frizzy volume', 'uneven jagged chops',
      'blurry face', 'changed neck contours',
    ],
    maskConfig: {
      foreheadCoverage: 0.1,
      sideExtension: 1.05,
      bottomExtension: 0.25,
    },
  },
  'lb-f-05': {
    styleId: 'lb-f-05',
    styleName: '사이드뱅 페이스라인 빌드 컷',
    category: 'CUT',
    gender: 'female',
    length: 'medium',
    bangsType: 'curtain-side',
    positiveKeywords: [
      'masterpiece, 8k photo of Korean face-contouring build cut',
      'flattering side curtain bangs contouring cheekbones gently',
      'soft inward rolling layers around the neck and collarbone',
      'balanced root volume creating an oval facial proportion',
      'professional Korean hairstyling with silky hair flow',
    ],
    textureKeywords: ['soft flow', 'clean strands', 'natural salon styling'],
    stylingKeywords: ['face-slimming contour bangs', 'C-curve face frame'],
    negativeKeywords: [
      'heavy horizontal bangs', 'uneven face coverage', 'messy strays',
      'distorted eyes', 'blurry facial details',
    ],
    maskConfig: {
      foreheadCoverage: 0.3,
      sideExtension: 1.25,
      bottomExtension: 0.6,
    },
  },
  'lb-f-06': {
    styleId: 'lb-f-06',
    styleName: '젤리 펌 & 히피 볼륨 펌',
    category: 'PERM',
    gender: 'female',
    length: 'long',
    bangsType: 'see-through',
    positiveKeywords: [
      'masterpiece, 8k photo of Korean jelly perm hippie wave hairstyle',
      'uniform bouncy wavy ripples from root to tip',
      'playful voluminous texture with soft curly wispy baby hair bangs',
      'romantic lovely Korean salon wave styling with glossy definition',
    ],
    textureKeywords: ['defined bouncy ripples', 'springy waves', 'hydrated curl definition'],
    stylingKeywords: ['jelly waves', 'curly fringe', 'horizontal volumetric bounce'],
    negativeKeywords: [
      'dry frizzy birds nest', 'uncontrolled dreadlocks', 'dull brittle texture',
      'deformed forehead', 'altered facial geometry',
    ],
    maskConfig: {
      foreheadCoverage: 0.4,
      sideExtension: 1.5,
      bottomExtension: 0.8,
    },
  },
  'lb-f-07': {
    styleId: 'lb-f-07',
    styleName: '윈드 펌 & 숏레이어드',
    category: 'PERM',
    gender: 'female',
    length: 'short',
    bangsType: 'see-through',
    positiveKeywords: [
      'masterpiece, 8k photo of Korean airy wind perm short layered haircut',
      'lightweight feathered short hair with natural dynamic breeze movement',
      'soft see-through bangs and tapered neckline',
      'clean fresh boyish-chic feminine Seoul salon styling',
    ],
    textureKeywords: ['airy lightness', 'feathered tips', 'soft matte separation'],
    stylingKeywords: ['tucked behind ear', 'wind-swept crown', 'tapered nape'],
    negativeKeywords: [
      'heavy bowl cut', 'flat unstyled hair', 'overly dense helmet',
      'distorted jawline', 'blurry neck',
    ],
    maskConfig: {
      foreheadCoverage: 0.35,
      sideExtension: 1.15,
      bottomExtension: 0.2,
    },
  },

  // ─── 여성 COLOR (염색) ──────────────────────────────────────────
  'lb-f-col-01': {
    styleId: 'lb-f-col-01',
    styleName: '스모키 애쉬 브라운',
    category: 'COLOR',
    gender: 'female',
    length: 'medium',
    bangsType: 'curtain-side',
    positiveKeywords: [
      'masterpiece, 8k photo of Korean salon hair colored in smoky ash brown',
      'zero red or yellow undertones, muted cool smoky ash gray brown tint',
      'translucent airy hair depth with luminous salon gloss',
      'complements summer cool tone skin flawlessly, bright clear complexion',
    ],
    textureKeywords: ['ash reflection', 'silky gloss', 'even color saturation'],
    stylingKeywords: ['cool tone ash glaze', 'seamless dye gradient'],
    negativeKeywords: ['warm brassy orange', 'patchy uneven bleaching', 'greenish muddy spots', 'altered skin color'],
    maskConfig: { foreheadCoverage: 0.3, sideExtension: 1.3, bottomExtension: 0.65 },
  },
  'lb-f-col-02': {
    styleId: 'lb-f-col-02',
    styleName: '밀크티 베이지 & 피치 글레이즈',
    category: 'COLOR',
    gender: 'female',
    length: 'long',
    bangsType: 'see-through',
    positiveKeywords: [
      'masterpiece, 8k photo of Korean salon milk tea beige and peach glaze hair color',
      'soft creamy warm pastel beige with subtle peach undertones',
      'vibrant warm tone glow enhancing skin vitality',
      'luxurious silky salon shine with smooth gradient',
    ],
    textureKeywords: ['creamy pastel sheen', 'peach luminescence', 'mirror-like gloss'],
    stylingKeywords: ['milktea glaze', 'warm blonde beige undertone'],
    negativeKeywords: ['brassy yellow neon', 'patchy dye', 'dull gray', 'distorted facial tone'],
    maskConfig: { foreheadCoverage: 0.35, sideExtension: 1.35, bottomExtension: 0.8 },
  },
  'lb-f-col-03': {
    styleId: 'lb-f-col-03',
    styleName: '올리브 카키 브라운',
    category: 'COLOR',
    gender: 'female',
    length: 'medium',
    bangsType: 'none',
    positiveKeywords: [
      'masterpiece, 8k photo of Korean salon olive khaki matte brown hair color',
      'sophisticated matte khaki olive reflection, neutral earth tone richness',
      'refined autumn warm tone elegance with velvet hair texture',
    ],
    textureKeywords: ['matte velvet finish', 'subtle olive glint', 'rich depth'],
    stylingKeywords: ['olive khaki glaze', 'anti-red brown formula'],
    negativeKeywords: ['bright green moss', 'harsh orange', 'mottled coloration'],
    maskConfig: { foreheadCoverage: 0.2, sideExtension: 1.25, bottomExtension: 0.6 },
  },
  'lb-f-col-04': {
    styleId: 'lb-f-col-04',
    styleName: '미드나잇 블루 블랙',
    category: 'COLOR',
    gender: 'female',
    length: 'long',
    bangsType: 'none',
    positiveKeywords: [
      'masterpiece, 8k photo of Korean salon midnight blue black hair color',
      'deepest jet black with shimmering indigo midnight blue highlights in the light',
      'striking contrast enhancing bright porcelain skin tone',
      'high-gloss glass hair lacquer shine',
    ],
    textureKeywords: ['blue crystalline shine', 'deep indigo undertone', 'mirror finish'],
    stylingKeywords: ['midnight glaze', 'high contrast sheen'],
    negativeKeywords: ['faded murky black', 'bright electric blue wig', 'purple blotches'],
    maskConfig: { foreheadCoverage: 0.2, sideExtension: 1.35, bottomExtension: 0.8 },
  },
  'lb-f-col-05': {
    styleId: 'lb-f-col-05',
    styleName: '로즈 플럼 브라운',
    category: 'COLOR',
    gender: 'female',
    length: 'medium',
    bangsType: 'see-through',
    positiveKeywords: [
      'masterpiece, 8k photo of Korean salon rose plum brown hair color',
      'romantic muted rose pink and deep plum violet undertones on rich brown base',
      'gorgeous glowing pinkish reflections correcting yellow skin tones',
    ],
    textureKeywords: ['rose petal luster', 'plum shimmer', 'soft radiant sheen'],
    stylingKeywords: ['rose plum gloss', 'velvety berry brown'],
    negativeKeywords: ['neon magenta pink', 'clown hair', 'unblended streaks'],
    maskConfig: { foreheadCoverage: 0.35, sideExtension: 1.3, bottomExtension: 0.65 },
  },

  // ─── 남성 CUT & PERM & COLOR ────────────────────────────────────
  'lb-m-01': {
    styleId: 'lb-m-01',
    styleName: '시스루 댄디 컷 & 볼륨 펌',
    category: 'CUT',
    gender: 'male',
    length: 'short',
    bangsType: 'see-through',
    positiveKeywords: [
      'masterpiece, 8k photo of Korean male see-through dandy haircut with subtle volume perm',
      'clean textured front fringe lightly revealing forehead skin underneath',
      'neatly tapered sides with clean down perm silhouette',
      'natural soft top volume and youthful handsome Korean idol aesthetic',
    ],
    textureKeywords: ['airy separated fringe', 'matte wax texture', 'clean down-perm sides'],
    stylingKeywords: ['see-through fringe', 'neat taper', 'soft C-curl roots'],
    negativeKeywords: [
      'heavy bowl cut helmet', 'solid thick block bangs', 'receding hairline exposed',
      'greasy hair clump', 'altered eyes or brows',
    ],
    maskConfig: {
      foreheadCoverage: 0.5,
      sideExtension: 1.1,
      bottomExtension: 0.15,
    },
  },
  'lb-m-02': {
    styleId: 'lb-m-02',
    styleName: '가일 컷 & 가일 펌',
    category: 'CUT',
    gender: 'male',
    length: 'short',
    bangsType: 'asymmetric-parted',
    positiveKeywords: [
      'masterpiece, 8k photo of Korean male classic guile haircut',
      'sharp 7:3 asymmetric part, one side crisply swept back exposing temple',
      'other side gently curving down in a sleek comma shape',
      'masculine sharp jawline enhancement, modern K-drama business hairstyle',
    ],
    textureKeywords: ['pomade hold', 'clean part line', 'sharp directional texture'],
    stylingKeywords: ['half-open forehead', 'comma fringe', 'neatly pressed sides'],
    negativeKeywords: [
      'disheveled unkempt hair', 'shaved bald spots', 'curly afro',
      'distorted forehead', 'warped eyebrows',
    ],
    maskConfig: {
      foreheadCoverage: 0.35,
      sideExtension: 1.12,
      bottomExtension: 0.12,
    },
  },
  'lb-m-03': {
    styleId: 'lb-m-03',
    styleName: '리프 컷 & 섀도우 펌',
    category: 'PERM',
    gender: 'male',
    length: 'medium',
    bangsType: 'asymmetric-parted',
    positiveKeywords: [
      'masterpiece, 8k photo of Korean male leaf haircut with shadow perm waves',
      'flowing aesthetic layers tapering softly around ears and hugging the nape like a leaf',
      'natural curtain parting with gentle S-curves framing the face',
      'effortless trendy K-style medium hair with rich texture',
    ],
    textureKeywords: ['shadow perm waves', 'feathered nape tail', 'natural flow'],
    stylingKeywords: ['leaf-shaped contour', 'ear-tucked strands', 'curtain center part'],
    negativeKeywords: [
      'flat limp hair', 'frizzy afro', 'tight perm ringlets',
      'distorted ears', 'altered eye shape',
    ],
    maskConfig: {
      foreheadCoverage: 0.35,
      sideExtension: 1.3,
      bottomExtension: 0.35,
    },
  },
  'lb-m-04': {
    styleId: 'lb-m-04',
    styleName: '드롭 컷 & 아이롱 펌',
    category: 'CUT',
    gender: 'male',
    length: 'short',
    bangsType: 'asymmetric-parted',
    positiveKeywords: [
      'masterpiece, 8k photo of Korean male drop cut with iron perm styling',
      'center forehead confidently open while drop bangs conceal upper temple corners',
      'crisp high-fade or down-permed clean sides, confident sharp masculine look',
      'structured matte texture with refined salon finish',
    ],
    textureKeywords: ['structured hold', 'matte clay definition', 'sharp temple lines'],
    stylingKeywords: ['dropped temple corners', 'upward center fringe', 'clean square top'],
    negativeKeywords: [
      'long floppy bangs', 'shaggy unkempt hair', 'blurry hairline',
      'altered eyebrows', 'deformed skull',
    ],
    maskConfig: {
      foreheadCoverage: 0.25,
      sideExtension: 1.05,
      bottomExtension: 0.1,
    },
  },
  'lb-m-col-01': {
    styleId: 'lb-m-col-01',
    styleName: '애쉬 다크 브라운 (남성)',
    category: 'COLOR',
    gender: 'male',
    length: 'short',
    bangsType: 'see-through',
    positiveKeywords: [
      'masterpiece, 8k photo of Korean male salon ash dark brown hair color',
      'natural dark espresso base with matte cool ash gray reflex',
      'clean subtle tone-down enhancing clear sharp complexion without red tones',
    ],
    textureKeywords: ['matte ash reflection', 'clean natural depth', 'healthy sheen'],
    stylingKeywords: ['subtle ash glaze', 'anti-brass dark brown'],
    negativeKeywords: ['orange red tint', 'patchy bleached spots', 'gray old hair'],
    maskConfig: { foreheadCoverage: 0.4, sideExtension: 1.1, bottomExtension: 0.15 },
  },
};

/** Default Fallback Prompt when style is not explicitly matched */
export const DEFAULT_HAIR_PROMPT_CONFIG: HairStylePromptConfig = {
  styleId: 'default',
  styleName: '자연스러운 살롱 헤어',
  category: 'CUT',
  gender: 'unisex',
  length: 'medium',
  bangsType: 'curtain-side',
  positiveKeywords: [
    'masterpiece, 8k photo of Korean salon hairstyle',
    'natural healthy hair texture with professional salon blowout',
    'clean hairline and volumetric flow, perfectly fitting the face',
  ],
  textureKeywords: ['silky gloss', 'natural volume', 'smooth salon finish'],
  stylingKeywords: ['balanced silhouette', 'healthy hair shine'],
  negativeKeywords: [
    'low quality, blurry, distorted face, changed skin tone, altered background, watermark, extra limbs',
    'deformed eyes, deformed eyebrows, mutated forehead, unnatural hairline',
  ],
  maskConfig: {
    foreheadCoverage: 0.3,
    sideExtension: 1.25,
    bottomExtension: 0.5,
  },
};

/**
 * 룩북 ID 또는 스타일명으로 프롬프트 사양 검색
 */
export function getHairPromptConfig(styleIdOrName?: string): HairStylePromptConfig {
  if (!styleIdOrName) return DEFAULT_HAIR_PROMPT_CONFIG;

  // 1. Direct ID match
  if (MASTER_HAIR_PROMPT_MAP[styleIdOrName]) {
    return MASTER_HAIR_PROMPT_MAP[styleIdOrName];
  }

  // 2. Name search
  const found = Object.values(MASTER_HAIR_PROMPT_MAP).find(
    (item) => item.styleName.includes(styleIdOrName) || styleIdOrName.includes(item.styleName)
  );

  return found ?? DEFAULT_HAIR_PROMPT_CONFIG;
}

/**
 * 복합 헤어스타일 + 컬러 틴트 결합 완성형 프롬프트 생성기
 */
export function buildCompositePrompt(params: {
  styleConfig: HairStylePromptConfig;
  tintName?: string;
  tintHex?: string;
  colorIntensity?: number;
}): { prompt: string; negativePrompt: string } {
  const { styleConfig, tintName, colorIntensity = 70 } = params;

  const intensityWord = colorIntensity > 70 ? 'vivid rich' : colorIntensity > 40 ? 'natural subtle' : 'sheer soft';
  const colorPart = tintName ? `colored in ${intensityWord} ${tintName} reflections` : '';

  const promptParts = [
    ...styleConfig.positiveKeywords,
    colorPart,
    ...styleConfig.textureKeywords,
    ...styleConfig.stylingKeywords,
    'Keep facial features, eyes, eyebrows, nose, mouth and skin tone completely identical to original.',
    'Photorealistic 8k Korean hair salon result.',
  ].filter(Boolean);

  const negativeParts = [
    ...styleConfig.negativeKeywords,
    'low quality, blurry, distorted face, deformed eyes, changed facial features, altered skin tone, mutant, watermark, CGI, 3d render',
    'damaged hair, unnatural hairline edge, bald spots',
  ];

  return {
    prompt: promptParts.join(', '),
    negativePrompt: negativeParts.join(', '),
  };
}
