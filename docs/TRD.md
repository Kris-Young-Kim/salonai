[TRD] Technical Requirements Document
# 프로젝트명: SalonAI (Technical Architecture & Specifications)
# 최종 수정일: 2026. 08

---

## 1. 시스템 아키텍처 개요 (System Architecture)

[Tablet Browser (Next.js PWA / Web)]
│ (HTTPS / Clerk Token)
▼
[Vercel Serverless Hosting / Next.js App Router]
├── [Clerk Middleware & SDK] (디자이너/관리자 계정 인증 & 세션)
├── [MediaPipe Face Mesh] (클라이언트/서버 얼굴 랜드마크 분석)
├── [Prisma ORM]
│      │ (Serverless PostgreSQL Pooler)
│      ▼
│   [Neon DB] (Serverless Postgres)
├── [AWS S3 or Cloudflare R2] (촬영 원본/처방전 이미지 스토리지)
└── [External Messaging API] (카카오 알림톡 발송)


---

## 2. 확정 기술 스택 (Tech Stack)

| 계층 (Layer) | 기술 / 서비스 | 선정 사유 및 역할 |
| :--- | :--- | :--- |
| **Frontend** | **Next.js (App Router), Tailwind CSS, Lucide Icons** | 태블릿 터치 UI 최적화, 반응형 화면 구성 및 고성능 SSR/CSR 지원 |
| **Authentication** | **Clerk** | 미용실/디자이너 로그인 및 조직(Organization/멀티테넌트) 관리, 미들웨어 기반 라우트 보호 |
| **Database** | **Neon (Serverless PostgreSQL)** | Vercel과 완벽히 연동되는 서버리스 Postgres. 트래픽에 따른 자동 스케일링 및 브랜칭(Branching) 지원 |
| **ORM** | **Prisma (or Drizzle)** | 타입 안전성(Type-safety) 보장, Neon DB 마이그레이션 및 쿼리 관리 간소화 |
| **Version Control** | **GitHub** | 코드 버전 관리, 이슈 트래킹 및 Vercel CI/CD 자동 배포 파이프라인 연동 |
| **Deployment** | **Vercel** | Next.js 최적화 호스팅, 깃허브 푸시 시 자동 빌드/프리뷰 배포 |
| **Vision / AI** | **Google MediaPipe Face Mesh** | 468개 3D 랜드마크 추출 기반 얼굴형/두상 비율 계산 |
| **Color Analysis** | **Canvas API / CIE-Lab 알고리즘** | 피부 관심 영역(ROI) 색상 추출 및 웜/쿨/사계절 퍼스널 컬러 진단 |
| **Image Storage** | **Cloudflare R2 or AWS S3** | 원본 촬영 사진 및 처방전 이미지 저장용 오브젝트 스토리지 |

---

## 3. 데이터베이스 스키마 설계 (Prisma Schema for Neon DB)

Neon DB에 적용할 `schema.prisma` 구조입니다. Clerk의 `userId` 및 `organizationId`와 연동되도록 설계되었습니다.

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// 1. 미용실 매장 (Clerk Organization과 매핑)
model Salon {
  id                  String       @id @default(uuid())
  clerkOrganizationId String       @unique // Clerk Org ID
  name                String       @db.VarChar(100)
  address             String?
  createdAt           DateTime     @default(now()) @map("created_at")
  
  designers           Designer[]
  customers           Customer[]

  @@map("salons")
}

// 2. 디자이너 계정 (Clerk User와 매핑)
model Designer {
  id            String      @id @default(uuid())
  clerkUserId   String      @unique // Clerk User ID
  salonId       String      @map("salon_id")
  name          String      @db.VarChar(50)
  email         String      @unique @db.VarChar(100)
  createdAt     DateTime    @default(now()) @map("created_at")

  salon         Salon       @relation(fields: [salonId], references: [id], onDelete: Cascade)
  diagnoses     Diagnosis[]

  @@map("designers")
}

// 3. 고객 정보
model Customer {
  id          String      @id @default(uuid())
  salonId     String      @map("salon_id")
  name        String      @db.VarChar(50)
  phone       String      @db.VarChar(20)
  createdAt   DateTime    @default(now()) @map("created_at")

  salon       Salon       @relation(fields: [salonId], references: [id], onDelete: Cascade)
  diagnoses   Diagnosis[]

  @@index([salonId, phone])
  @@map("customers")
}

// 4. AI 진단 및 시술 처방 이력
model Diagnosis {
  id                 String    @id @default(uuid())
  customerId         String    @map("customer_id")
  designerId         String?   @map("designer_id")
  originalImageUrl   String    @map("original_image_url")
  
  // AI 진단 수치
  faceShape          String    @map("face_shape") // 계란형, 둥근형, 각진형, 긴형 등
  faceRatio          Json      @map("face_ratio") // {"upper": 1.0, "middle": 1.2, "lower": 0.9}
  personalColor      String    @map("personal_color") // Spring_Warm, Summer_Cool 등
  skinHexColor       String?   @map("skin_hex_color")
  
  // 추천 및 시술 내용
  selectedStyleTags  String[]  @map("selected_style_tags") // ["#레이어드컷", "#애쉬브라운"]
  designerNotes      String?   @map("designer_notes")
  
  // 고객 전달용 처방전 고유 토큰
  prescriptionToken  String    @unique @default(uuid()) @map("prescription_token")
  createdAt          DateTime  @default(now()) @map("created_at")

  customer           Customer  @relation(fields: [customerId], references: [id], onDelete: Cascade)
  designer           Designer? @relation(fields: [designerId], references: [id], onDelete: SetNull)

  @@map("diagnoses")
}

// 5. 헤어스타일 룩북 마스터 데이터
model Lookbook {
  id                   String    @id @default(uuid())
  styleName            String    @map("style_name") @db.VarChar(100)
  category             String    @db.VarChar(20) // CUT, PERM, COLOR
  targetFaceShapes     String[]  @map("target_face_shapes")
  targetPersonalColors String[]  @map("target_personal_colors")
  imageUrl             String    @map("image_url")
  description          String?

  @@map("lookbooks")
}
4. 환경 변수 구성 (.env.example)
Anti-gravity IDE 및 Vercel 배포 시 필요한 환경 변수 목록입니다.

Bash
# 1. Database (Neon Serverless Postgres)
DATABASE_URL="postgresql://user:password@ep-sample-pooler.neon.tech/neondb?sslmode=require"

# 2. Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# 3. Storage (Cloudflare R2 or AWS S3)
STORAGE_ACCESS_KEY_ID=...
STORAGE_SECRET_ACCESS_KEY=...
STORAGE_BUCKET_NAME=salon-ai-storage
STORAGE_ENDPOINT=...

# 4. Kakao Notification (Solapi / CoolSMS)
ALIMTALK_API_KEY=...
ALIMTALK_API_SECRET=...
ALIMTALK_SENDER_NUMBER=02-0000-0000
5. 프로젝트 초기 세팅 명령어 (Quick Start Guide)
Bash
# 1. Next.js 프로젝트 생성
npx create-next-app@latest salon-ai --typescript --tailwind --eslint --app --src-dir

# 2. 필수 의존성 패키지 설치
cd salon-ai
npm install @clerk/nextjs @prisma/client lucide-react clsx tailwind-merge
npm install -D prisma

# 3. Prisma 초기화 및 Neon 연동
npx prisma init
# (.env 파일에 Neon DATABASE_URL 입력 후)
npx prisma db push

# 4. GitHub 레포지토리 연동 및 커밋
git init
git add .
git commit -m "feat: initial project setup with Next.js, Clerk, Prisma, and Neon"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
