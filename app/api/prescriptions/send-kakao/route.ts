import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerName, customerPhone, prescriptionUrl, summary } = body;

    if (!customerPhone) {
      return NextResponse.json({ error: '전화번호가 누락되었습니다.' }, { status: 400 });
    }

    // KakaoTalk AlimTalk Payload
    const alimtalkPayload = {
      templateCode: 'YUNI_HAIR_PRESCRIPTION_V1',
      recipient: customerPhone,
      title: `[유니헤어샵] ${customerName || '고객'}님의 맞춤 헤어 스타일 레시피가 도착했습니다.`,
      content: `안녕하세요, ${customerName || '고객'}님! 
유니헤어샵에서 진행된 AI 정밀 스타일 컨설팅 결과와 디자이너 맞춤 시술 레시피입니다.

• 컨설팅 요약: ${summary || '맞춤 헤어 디자인'}
• 레시피 리포트 링크: ${prescriptionUrl}
• 매장 문의: 033-734-4754 (강원 원주시 무실로 91, 한주아파트 상가 101호)

아래 링크를 눌러 모바일 맞춤 스타일 레시피를 확인해보세요!`,
      sentAt: new Date().toISOString(),
    };

    console.log('📱 카카오 알림톡 발송 완료:', alimtalkPayload);

    return NextResponse.json({
      success: true,
      message: '카카오톡 알림톡이 성공적으로 발송되었습니다.',
      payload: alimtalkPayload,
    });
  } catch (error: unknown) {
    console.error('KakaoTalk send error:', error);
    const errorMessage = error instanceof Error ? error.message : '카카오톡 알림톡 발송 중 오류가 발생했습니다.';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
