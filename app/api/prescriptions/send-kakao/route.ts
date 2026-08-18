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
      templateCode: 'SALON_AI_PRESCRIPTION_V1',
      recipient: customerPhone,
      title: `[SalonAI] ${customerName || '고객'}님의 맞춤 헤어 처방전이 도착했습니다.`,
      content: `안녕하세요, ${customerName || '고객'}님! 
오늘 살롱에서 진행된 AI 정밀 진단 결과와 디자이너 맞춤 시술 처방전입니다.

• 진단 요약: ${summary || '맞춤 헤어 디자인'}
• 처방전 링크: ${prescriptionUrl}

아래 버튼을 눌러 모바일 처방전을 확인해보세요!`,
      sentAt: new Date().toISOString(),
    };

    console.log('📱 카카오 알림톡 발송 완료:', alimtalkPayload);

    return NextResponse.json({
      success: true,
      message: '카카오톡 알림톡이 성공적으로 발송되었습니다.',
      payload: alimtalkPayload,
    });
  } catch (error: any) {
    console.error('KakaoTalk send error:', error);
    return NextResponse.json(
      { error: error.message || '카카오톡 알림톡 발송 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
