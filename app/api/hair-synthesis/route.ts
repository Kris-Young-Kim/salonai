import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

// Stability AI SD Inpainting — hair region only (mask required)
const REPLICATE_MODEL_PATH = 'stability-ai/stable-diffusion-inpainting';

export interface HairSynthesisRequest {
  imageDataUrl: string; // resized base64 data URL
  maskDataUrl: string;  // white = inpaint (hair), black = preserve
  tintName: string;     // e.g. "스모키 애쉬"
  tintHex: string;      // e.g. "#7D7571"
  colorIntensity?: number; // 0-100
}

export interface HairSynthesisResponse {
  success: boolean;
  predictionId?: string;
  outputImageUrl?: string;
  error?: string;
}

const koreanColorMap: Record<string, string> = {
  '스모키 애쉬': 'smoky ash gray',
  '밀크티 베이지': 'milk tea beige blonde',
  '올리브 카키': 'olive khaki brown',
  '블루 블랙': 'blue black deep dark',
  '로즈 플럼': 'rose plum violet',
  '다크 초콜릿': 'dark chocolate brown',
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
  const { imageDataUrl, maskDataUrl, tintName, tintHex, colorIntensity = 70 } = body;

  if (!imageDataUrl || !maskDataUrl || !tintName || !tintHex) {
    return NextResponse.json(
      { success: false, error: 'imageDataUrl, maskDataUrl, tintName, tintHex는 필수입니다.' },
      { status: 400 }
    );
  }

  const colorEnglish = koreanColorMap[tintName] ?? tintName;
  const intensityWord = colorIntensity > 70 ? 'vivid' : colorIntensity > 40 ? 'natural' : 'subtle';

  const prompt = `Change only the hair color to ${intensityWord} ${colorEnglish}. Keep the face, skin, and background exactly unchanged. Professional Korean salon result, high quality.`;
  const negativePrompt = 'low quality, blurry, distorted face, changed skin tone, altered background, watermark, extra limbs';

  const replicateRes = await fetch(
    `https://api.replicate.com/v1/models/${REPLICATE_MODEL_PATH}/predictions`,
    {
      method: 'POST',
      headers: {
        Authorization: `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: {
          prompt,
          negative_prompt: negativePrompt,
          image: imageDataUrl,
          mask: maskDataUrl,
          num_inference_steps: 25,
          guidance_scale: 7.5,
          num_outputs: 1,
        },
      }),
    }
  );

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
