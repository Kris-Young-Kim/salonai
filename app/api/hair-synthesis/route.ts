import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

// Replicate model for hair recoloring/inpainting
// Using instruct-pix2pix for style transfer - no mask needed, works via text prompt
const REPLICATE_MODEL =
  'timothybrooks/instruct-pix2pix:30c1d0b916a6f8efce20493f5d61ee27491ab2a60437c13c588468b9810ec23d';

export interface HairSynthesisRequest {
  imageDataUrl: string; // base64 data URL
  tintName: string; // e.g. "스모키 애쉬"
  tintHex: string; // e.g. "#7D7571"
  colorIntensity?: number; // 0-100
  additionalPrompt?: string; // extra style descriptor
}

export interface HairSynthesisResponse {
  success: boolean;
  outputImageUrl?: string; // Replicate CDN URL
  error?: string;
  modelUsed?: string;
  predictionId?: string;
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  if (!REPLICATE_API_TOKEN) {
    return NextResponse.json(
      {
        success: false,
        error: 'REPLICATE_API_TOKEN이 설정되지 않았습니다. .env.local에 추가하세요.',
        modelUsed: REPLICATE_MODEL,
      },
      { status: 503 }
    );
  }

  const body = (await req.json()) as HairSynthesisRequest;
  const { imageDataUrl, tintName, tintHex, colorIntensity = 70, additionalPrompt } = body;

  if (!imageDataUrl || !tintName || !tintHex) {
    return NextResponse.json(
      { success: false, error: 'imageDataUrl, tintName, tintHex는 필수입니다.' },
      { status: 400 }
    );
  }

  // Build a natural language instruction prompt for instruct-pix2pix
  const koreanColorMap: Record<string, string> = {
    '스모키 애쉬': 'smoky ash gray',
    '밀크티 베이지': 'milk tea beige blonde',
    '올리브 카키': 'olive khaki brown',
    '블루 블랙': 'blue black deep dark',
    '로즈 플럼': 'rose plum violet',
    '다크 초콜릿': 'dark chocolate brown',
  };
  const colorEnglish = koreanColorMap[tintName] ?? tintName;
  const intensityWord = colorIntensity > 70 ? 'vivid' : colorIntensity > 40 ? 'natural' : 'subtle';

  const prompt = `Change the hair color to ${intensityWord} ${colorEnglish}${additionalPrompt ? `, ${additionalPrompt}` : ''}. Keep the face, skin tone, and background unchanged. Professional Korean salon hair coloring result.`;
  const negativePrompt = 'low quality, blurry, distorted face, changed skin tone, altered background, watermark';

  // Upload image and run prediction on Replicate
  const replicateRes = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      Authorization: `Token ${REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: REPLICATE_MODEL.split(':')[1],
      input: {
        prompt,
        negative_prompt: negativePrompt,
        image: imageDataUrl,
        num_inference_steps: 100,
        image_guidance_scale: 1.5,
        guidance_scale: 7.5,
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
  const predictionId: string = prediction.id;

  // Poll for completion (max 60 seconds)
  const MAX_POLLS = 30;
  const POLL_INTERVAL_MS = 2000;

  for (let i = 0; i < MAX_POLLS; i++) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));

    const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: { Authorization: `Token ${REPLICATE_API_TOKEN}` },
    });

    const pollData = await pollRes.json();

    if (pollData.status === 'succeeded' && pollData.output?.length > 0) {
      return NextResponse.json({
        success: true,
        outputImageUrl: pollData.output[0],
        modelUsed: REPLICATE_MODEL,
        predictionId,
      } satisfies HairSynthesisResponse);
    }

    if (pollData.status === 'failed' || pollData.status === 'canceled') {
      return NextResponse.json(
        {
          success: false,
          error: `생성 실패: ${pollData.error ?? pollData.status}`,
          predictionId,
        },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    {
      success: false,
      error: '생성 타임아웃 (60초 초과). predictionId로 직접 확인하세요.',
      predictionId,
    },
    { status: 408 }
  );
}

// GET: Check status of a prediction by ID
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
