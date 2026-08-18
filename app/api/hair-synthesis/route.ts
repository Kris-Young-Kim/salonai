import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { fal } from '@fal-ai/client';
import { getHairPromptConfig, buildCompositePrompt } from '@/lib/data/hairPromptMap';

const FAL_KEY = process.env.FAL_API_KEY || process.env.FAL_KEY;
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

// fal.ai 클라이언트 초기화
if (FAL_KEY) {
  fal.config({
    credentials: FAL_KEY,
  });
}

export interface HairSynthesisRequest {
  imageDataUrl: string; // Base64 Data URL (Original Customer Image)
  maskDataUrl: string;  // Base64 Data URL (Hair Mask: White=Inpaint, Black=Preserve Face)
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
  engineUsed?: 'fal-flux' | 'replicate-sd';
  promptUsed?: string;
  error?: string;
}

const koreanColorMap: Record<string, string> = {
  '스모키 애쉬': 'luxury smoky ash cool gray brown',
  '밀크티 베이지': 'radiant milk tea beige salon highlight',
  '올리브 카키': 'elegant olive matte khaki brown',
  '블루 블랙': 'deep midnight blue black glossy velvet',
  '로즈 플럼': 'romantic rose wine plum ruby brown',
  '다크 초콜릿': 'rich deep espresso chocolate brown',
};

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ success: false, error: '인증이 필요합니다.' }, { status: 401 });
  }

  const body = (await req.json()) as HairSynthesisRequest;
  const { imageDataUrl, maskDataUrl, tintName, tintHex, colorIntensity = 75, styleId, styleName } = body;

  if (!imageDataUrl || !maskDataUrl) {
    return NextResponse.json(
      { success: false, error: 'imageDataUrl과 maskDataUrl은 필수입니다.' },
      { status: 400 }
    );
  }

  // 1. 살롱 스타일별 전문 프롬프트 빌드
  const styleConfig = getHairPromptConfig(styleId || styleName);
  const colorEnglish = tintName ? (koreanColorMap[tintName] ?? tintName) : undefined;

  const { prompt, negativePrompt } = buildCompositePrompt({
    styleConfig,
    tintName: colorEnglish,
    tintHex,
    colorIntensity,
  });

  // 극사실적 화보급 살롱 헤어스타일 강화 프롬프트
  const falEnhancedPrompt = `masterpiece, 8k uhd, photorealistic, professional salon hair transformation, ${prompt}, highly detailed real human hair strands, natural soft baby hairs on forehead hairline, beautiful salon blow-dry luster, studio portrait lighting, preserve exact facial features, eyes, nose and lips perfectly unchanged, cinematic depth of field`;

  // 2. fal.ai FLUX Inpainting 우선 호출 (가장 자연스럽고 화보급 퀄리티)
  if (FAL_KEY) {
    try {
      const result: any = await fal.subscribe('fal-ai/flux/dev/inpainting', {
        input: {
          prompt: falEnhancedPrompt,
          image_url: imageDataUrl,
          mask_url: maskDataUrl,
          num_inference_steps: 28,
          guidance_scale: 7.5,
          strength: 0.85,
        },
      });

      if (result && result.data && result.data.images && result.data.images.length > 0) {
        return NextResponse.json({
          success: true,
          outputImageUrl: result.data.images[0].url,
          engineUsed: 'fal-flux',
          promptUsed: falEnhancedPrompt,
        } satisfies HairSynthesisResponse);
      }
    } catch (falErr: any) {
      console.warn('fal.ai subscription failed, trying fallback:', falErr?.message || falErr);
      // Fallback to Replicate if fal fails
    }
  }

  // 3. Fallback: Replicate SD Inpainting
  if (REPLICATE_API_TOKEN) {
    try {
      const replicateRes = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          Authorization: `Token ${REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
          Prefer: 'wait',
        },
        body: JSON.stringify({
          version: 'stability-ai/stable-diffusion-inpainting:95b7223104132402a9ae91cc677285bc5eb997834bd2349fa486f53910fd68b3',
          input: {
            prompt: falEnhancedPrompt,
            negative_prompt: negativePrompt,
            image: imageDataUrl,
            mask: maskDataUrl,
            num_inference_steps: 30,
            guidance_scale: 8.0,
            num_outputs: 1,
          },
        }),
      });

      if (replicateRes.ok) {
        const prediction = await replicateRes.json();
        return NextResponse.json({
          success: true,
          predictionId: prediction.id,
          outputImageUrl: Array.isArray(prediction.output) ? prediction.output[0] : undefined,
          engineUsed: 'replicate-sd',
          promptUsed: falEnhancedPrompt,
        } satisfies HairSynthesisResponse);
      }
    } catch (repErr: any) {
      console.error('Replicate fallback error:', repErr);
    }
  }

  return NextResponse.json(
    { success: false, error: 'AI 생성 서버(fal.ai / Replicate) 연결에 실패했습니다. 키를 확인해주세요.' },
    { status: 500 }
  );
}

// GET: Polling fallback
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const predictionId = req.nextUrl.searchParams.get('id');
  if (!predictionId) {
    return NextResponse.json({ error: 'id 파라미터가 필요합니다.' }, { status: 400 });
  }

  if (REPLICATE_API_TOKEN) {
    const res = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: { Authorization: `Token ${REPLICATE_API_TOKEN}` },
    });
    const data = await res.json();
    return NextResponse.json(data);
  }

  return NextResponse.json({ error: '생성 작업을 찾을 수 없습니다.' }, { status: 404 });
}
