/**
 * 인스타그램 스토리용 9:16 (1080 × 1920) 고화질 처방전 카드 Canvas 렌더러
 */

export interface StoryCardRenderOptions {
  customerName: string;
  originalImageUrl?: string;
  faceShape: string;
  personalColor: string;
  skinHexColor?: string;
  selectedStyles?: string[];
  dateStr?: string;
}

/**
 * 둥근 사각형 그리기 헬퍼
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

/**
 * 이미지 로드 비동기 헬퍼
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

/**
 * 1080 × 1920 Instagram Story 고화질 PNG Data URL 생성
 */
export async function renderInstagramStoryCard(
  options: StoryCardRenderOptions
): Promise<string> {
  const {
    customerName,
    originalImageUrl,
    faceShape,
    personalColor,
    skinHexColor = '#F4E2D3',
    selectedStyles = ['소프트 레이어드 C컬 펌'],
    dateStr = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }),
  } = options;

  const W = 1080;
  const H = 1920;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get 2D canvas context');

  // ─── 1. 다크 럭셔리 배경 ───────────────────────────────────────────
  ctx.fillStyle = '#09090b';
  ctx.fillRect(0, 0, W, H);

  // 앰버/골드 은은한 방사형 오라
  const bgGlow = ctx.createRadialGradient(W / 2, 400, 50, W / 2, 400, 700);
  bgGlow.addColorStop(0, 'rgba(245, 208, 97, 0.16)');
  bgGlow.addColorStop(0.5, 'rgba(217, 119, 6, 0.06)');
  bgGlow.addColorStop(1, 'rgba(9, 9, 11, 0)');
  ctx.fillStyle = bgGlow;
  ctx.fillRect(0, 0, W, H);

  // ─── 2. 외곽 럭셔리 프레임 ──────────────────────────────────────────
  ctx.strokeStyle = 'rgba(245, 208, 97, 0.25)';
  ctx.lineWidth = 2;
  roundRect(ctx, 40, 40, W - 80, H - 80, 48);
  ctx.stroke();

  // ─── 3. 상단 살롱 로고 & 헤더 ───────────────────────────────────────
  try {
    const logoImg = await loadImage('/logo.jpg');
    ctx.save();
    ctx.beginPath();
    ctx.arc(W / 2 - 170, 150, 45, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(logoImg, W / 2 - 215, 105, 90, 90);
    ctx.restore();

    // 로고 원형 골드 테두리
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(W / 2 - 170, 150, 46, 0, Math.PI * 2);
    ctx.stroke();
  } catch {
    // 로고 로드 실패 시 폴백
  }

  // 살롱 영문 / 국문 텍스트
  ctx.fillStyle = '#fde047';
  ctx.font = 'bold 22px Pretendard, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('UNI HAIR SALON & AI STUDIO', W / 2 - 105, 138);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 36px Pretendard, sans-serif';
  ctx.fillText('유니헤어샵 AI 퍼스널 처방전', W / 2 - 105, 180);

  // ─── 4. 고객 웰컴 배너 ─────────────────────────────────────────────
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.font = '500 24px Pretendard, sans-serif';
  ctx.fillText(`${dateStr} • AI 정밀 분석 리포트`, W / 2, 260);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 52px Pretendard, sans-serif';
  ctx.fillText(`[${customerName}] 님의 맞춤 스타일 가이드 ✨`, W / 2, 330);

  // ─── 5. 중앙 고객 사진 카드 ────────────────────────────────────────
  const photoW = 680;
  const photoH = 760;
  const photoX = (W - photoW) / 2;
  const photoY = 380;

  if (originalImageUrl) {
    try {
      const userImg = await loadImage(originalImageUrl);
      ctx.save();
      roundRect(ctx, photoX, photoY, photoW, photoH, 36);
      ctx.clip();
      ctx.drawImage(userImg, photoX, photoY, photoW, photoH);

      // 사진 하단 어두운 그라데이션
      const photoGrad = ctx.createLinearGradient(0, photoY + photoH - 240, 0, photoY + photoH);
      photoGrad.addColorStop(0, 'rgba(9, 9, 11, 0)');
      photoGrad.addColorStop(1, 'rgba(9, 9, 11, 0.9)');
      ctx.fillStyle = photoGrad;
      ctx.fillRect(photoX, photoY + photoH - 240, photoW, 240);

      ctx.restore();

      // 사진 카드 골드 테두리
      ctx.strokeStyle = 'rgba(245, 208, 97, 0.4)';
      ctx.lineWidth = 4;
      roundRect(ctx, photoX, photoY, photoW, photoH, 36);
      ctx.stroke();

      // 사진 위 진단 오버레이 뱃지
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      roundRect(ctx, photoX + 40, photoY + photoH - 100, photoW - 80, 68, 20);
      ctx.fill();
      ctx.strokeStyle = 'rgba(245, 208, 97, 0.3)';
      ctx.lineWidth = 1.5;
      roundRect(ctx, photoX + 40, photoY + photoH - 100, photoW - 80, 68, 20);
      ctx.stroke();

      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 28px Pretendard, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`#{faceShape} • #{personalColor}`, W / 2, photoY + photoH - 58);
    } catch {
      // 이미지 로드 실패 처리
    }
  }

  // ─── 6. 하단 진단 지표 카드 (얼굴형 & 퍼스널컬러) ────────────────────
  const cardY = 1190;
  const cardW = 900;
  const cardX = (W - cardW) / 2;

  // 카드 배경
  ctx.fillStyle = 'rgba(24, 24, 27, 0.85)';
  roundRect(ctx, cardX, cardY, cardW, 480, 36);
  ctx.fill();
  ctx.strokeStyle = 'rgba(245, 208, 97, 0.3)';
  ctx.lineWidth = 2;
  roundRect(ctx, cardX, cardY, cardW, 480, 36);
  ctx.stroke();

  // 지표 1: 얼굴형 솔루션
  ctx.textAlign = 'left';
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 26px Pretendard, sans-serif';
  ctx.fillText('👑 얼굴형 맞춤 분석', cardX + 45, cardY + 65);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px Pretendard, sans-serif';
  ctx.fillText(`${faceShape} 페이스라인`, cardX + 45, cardY + 115);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = '400 22px Pretendard, sans-serif';
  ctx.fillText('황금비율 안부 밸런스 및 턱선을 슬림하게 감싸는 맞춤 디자인', cardX + 45, cardY + 155);

  // 구분선
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cardX + 45, cardY + 190);
  ctx.lineTo(cardX + cardW - 45, cardY + 190);
  ctx.stroke();

  // 지표 2: 퍼스널 컬러 & 피부톤
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 26px Pretendard, sans-serif';
  ctx.fillText('🎨 퍼스널 컬러 매칭', cardX + 45, cardY + 245);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px Pretendard, sans-serif';
  ctx.fillText(`${personalColor}`, cardX + 45, cardY + 295);

  // 컬러 칩 스와치 원형 그리기
  const swatches = [skinHexColor, '#7D7571', '#D6B494', '#635B47', '#161B2E'];
  swatches.forEach((hex, idx) => {
    const cx = cardX + cardW - 240 + idx * 45;
    const cy = cardY + 285;
    ctx.fillStyle = hex;
    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, Math.PI * 2);
    ctx.stroke();
  });

  // 추천 스타일 뱃지
  ctx.fillStyle = '#fde047';
  ctx.font = 'bold 26px Pretendard, sans-serif';
  ctx.fillText('✂️ 원장님 추천 시그니처 룩', cardX + 45, cardY + 375);

  const styleText = selectedStyles.length > 0 ? selectedStyles.join(' · ') : '소프트 레이어드 C컬 펌';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px Pretendard, sans-serif';
  ctx.fillText(styleText, cardX + 45, cardY + 425);

  // ─── 7. 하단 푸터 & 워터마크 ─────────────────────────────────────────
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.font = '500 22px Pretendard, sans-serif';
  ctx.fillText('강원 원주시 무실로 91, 한주아파트 상가 101호 • 033-734-4754', W / 2, 1750);

  ctx.fillStyle = 'rgba(245, 208, 97, 0.8)';
  ctx.font = 'bold 24px Pretendard, sans-serif';
  ctx.fillText('@unihair_wonju • 유니헤어샵 AI 헤어 솔루션', W / 2, 1795);

  return canvas.toDataURL('image/png', 0.95);
}
