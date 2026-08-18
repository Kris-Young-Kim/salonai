import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

import { getHairPromptConfig, buildCompositePrompt } from '@/lib/data/hairPromptMap';

// Stability AI SD Inpainting — version-pinned (POST /v1/predictions)
const REPLICATE_MODEL_VERSION = 'stability-ai/stable-diffusion-inpainting:95b7223104132402a9ae91cc677285bc5eb997834bd2349fa486f53910fd68b3';

export interface HairSynthesisRequest {
  imageDataUrl: string; // resized base64 data URL
  maskDataUrl: string;  // white = inpaint (hair), black = preserve
  tintName?: string;     // e.g. "스모키 애쉬"
  tintHex?: string;      // e.g. "#7D7571"
  colorIntensity?: number; // 0-100
  styleId?: string;     // e.g. "lb-f-01", "lb-m-02"
  styleName?: string;   // e.g. "소프트 레이어드 컷 & C컬 펌"
}

export interface HairSynthesisResponse {
  success: boolean;
  predictionId?: string;
  outputImageUrl?: string;
  promptUsed?: string;
  error?: string;
}

const koreanColorMap: Record<string, string> = {
  '스모키 애쉬': 'smoky ash gray',
  '밀크티 베이지': 'milk tea beige blonde',
  '올리브 카키': 'olive khaki brown',
  '블루 블랙': 'midnight blue black deep tone',
  '로즈 플럼': 'rose plum pink brown',
  '다크 초콜릿': 'rich dark chocolate espresso brown',
};

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ success: false, error: '인증이 필요합니다.' }, { status: 401 });
  }

  if (!REPLICATE_API_TOKEN) {
    return NextResponse.json(
      { success: false, error: 'REPLICATE_API_TOKEN가 .env.local에 설정되지 않았습니다.' },
      { status: 503 }
    );
  }

  const body = (await req.json()) as HairSynthesisRequest;
  const { imageDataUrl, maskDataUrl, tintName, tintHex, colorIntensity = 70, styleId, styleName } = body;

  if (!imageDataUrl || !maskDataUrl) {
    return NextResponse.json(
      { success: false, error: 'imageDataUrl과 maskDataUrl은 필수입니다.' },
      { status: 400 }
    );
  }

  // 1. 스타일에 특화된 프롬프트 설정 조회
  const styleConfig = getHairPromptConfig(styleId || styleName);

  // 2. 컬러 영문 변환
  const colorEnglish = tintName ? (koreanColorMap[tintName] ?? tintName) : undefined;

  // 3. 정밀 복합 프롬프트 및 네거티브 프롬프트 생성
  const { prompt, negativePrompt } = buildCompositePrompt({
    styleConfig,
    tintName: colorEnglish,
    tintHex,
    colorIntensity,
  });

  const replicateRes = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      Authorization: `Token ${REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json',
      Prefer: 'wait',
    },
    body: JSON.stringify({
      version: REPLICATE_MODEL_VERSION,
      input: {
        prompt,
        negative_prompt: negativePrompt,
        image: imageDataUrl,
        mask: maskDataUrl,
        num_inference_steps: 30,
        guidance_scale: 8.0,
        num_outputs: 1,
      },
    }),
  });

  if (!replicateRes.ok) {
    const errText = await replicateRes.text();
    return NextResponse.json(
      { success: false, error: `Replicate API 오류: ${errText}` },
      { status: 500 }
    );
  }

  const prediction = await replicateRes.json();

  // Return predictionId immediately — client will poll GET /api/hair-synthesis?id=
  return NextResponse.json({
    success: true,
    predictionId: prediction.id,
    promptUsed: prompt,
  } satisfies HairSynthesisResponse);
}

// GET: Client-side polling — check prediction status by ID
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  if (!REPLICATE_API_TOKEN) {
    return NextResponse.json({ error: 'REPLICATE_API_TOKEN 미설정' }, { status: 503 });
  }

  const predictionId = req.nextUrl.searchParams.get('id');
  if (!predictionId) {
    return NextResponse.json({ error: 'id 파라미터가 필요합니다.' }, { status: 400 });
  }

  const res = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
    headers: { Authorization: `Token ${REPLICATE_API_TOKEN}` },
  });

  const data = await res.json();
  return NextResponse.json(data);
}
