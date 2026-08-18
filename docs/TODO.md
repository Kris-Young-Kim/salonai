# SalonAI 프로젝트 TODO & 작업 맥락

**최종 업데이트**: 2026-08-18  
**협업 체계**: Antigravity IDE (UI/UX & Vision) ⚔️ Claude Code CLI (Backend & Infra) 듀얼 AI 협업  
**GitHub 저장소**: https://github.com/Kris-Young-Kim/salonai.git

---

## 🤖 듀얼 AI 협업 분담 체계 (Dual-AI Collaboration Matrix)

| 구분 | 🌟 Antigravity IDE Agent | ⚡ Claude Code CLI (`/platoon`) |
|---|---|---|
| **핵심 강점** | • 고품질 프론트엔드 UI/UX & 반응형 태블릿 뷰<br>• MediaPipe 비전 & Canvas 그래픽스<br>• CIE-Lab 색공간 & 인터랙티브 시각화 | • 대규모 백엔드 API & DB 트랜잭션<br>• Clerk 멀티테넌트 조직 & 미들웨어<br>• 카카오 알림톡 연동<br>• `/platoon` 소대 편제 대량 작업 및 품질 관리 |
| **주요 역할** | **[Frontend & Client AI]**<br>UI 컴포넌트, 캔버스 렌더러, 클라이언트 뷰어 | **[Backend & Cloud Infra & CRM]**<br>DB 스키마/마이그레이션, 서버 API, 외부 연동 |

---

## 2. 확정 기술 스택

| 계층 | 기술 | 담당 AI | 상태 |
|------|------|------|------|
| Frontend | Next.js 16 (App Router) + Tailwind CSS | **Antigravity IDE** | **연동 완료** |
| Vision / Color | Google MediaPipe Face Mesh + Canvas CIE-Lab | **Antigravity IDE** | **연동 완료** |
| Design & Typography | Pretendard CDN + 살롱 다크/골드 테마 | **Antigravity IDE** | **적용 완료** |
| Auth & Multi-tenant | Clerk (조직/디자이너 관리 & HeaderAuth) | **Claude Code** | **연동 완료** |
| DB & ORM | Neon (Serverless PostgreSQL 18.4) + Prisma 7 | **Claude Code & Antigravity** | **연동 & 시딩 완료** |
| Messaging | 카카오 알림톡 (Solapi/비즈톡 API 연동) | **Claude Code** | 모의 발송 완료 |
| Hosting & CI/CD | Vercel + GitHub Actions | **Claude Code** | GitHub 푸시 완료 |

---

## 3. 개발 단계별 역할 및 진행 현황 (PRD Phase별)

### 🟢 Phase 1 — MVP (P0) 핵심 진단 & 룩북 (100% 완료)

- [x] `[Antigravity]` **[FR-101]** 태블릿 카메라 촬영 UI (계란형 오버레이 가이드, 타이머, 좌우반전, 파일업로드 폴백, 프리뷰)
- [x] `[Antigravity]` **[FR-102]** 얼굴형 & 두상 랜드마크 분석 (MediaPipe 468 포인트 3D 메쉬, 상/중/하안부 3단 비율, 6대 얼굴형 분류)
- [x] `[Antigravity]` **[FR-103]** 피부톤 & 퍼스널컬러 진단 (뺨/이마 ROI 픽셀 샘플링, CIE-Lab/HSV/ITA 4계절 분류, 살롱 염색약 매칭)
- [x] `[Antigravity]` **[FR-104]** 맞춤 룩북 매칭 (24종 K-살롱 마스터 룩북, 다차원 매칭 스코어링, 인터랙티브 갤러리 및 선택 드로어)
- [x] `[Antigravity]` **[FR-105]** 전문가용 종합 상담 리포트 뷰 (얼굴형·두상·퍼스널컬러·선택스타일 원스톱 확인)

---

### 🟢 Phase 2 — 살롱 워크플로우 & CRM (P1) (핵심 완료)

- [x] `[Antigravity]` **[FR-202-UI]** 고객 전용 모바일 웹 처방전 뷰 (`/prescription/[token]`)
- [x] `[Antigravity]` **[FR-203]** 디자이너 시술 메모 & 홈케어 레시피 에디터 (스마트 템플릿 작성기)
- [x] `[Claude Code & Antigravity]` **[FR-201] 고객 및 디자이너 CRM 시스템**:
  - [x] 고객 목록 및 연락처 검색/필터링 API (`/api/customers`, `/api/customers/[id]`, `/api/stats`)
  - [x] 고객별 과거 진단 및 처방 이력 누적 조회 UI (`/dashboard/records`)
  - [x] 살롱 매장별 진단 통계 대시보드 연동 (`/dashboard`)
- [x] `[Claude Code & Antigravity]` **[FR-202-API] 카카오 알림톡 발송 백엔드 API & 모달**:
  - [x] 알림톡 발송 모의 API (`/api/prescriptions/send-kakao`) 및 발행 완료 모달
  - [ ] 카카오 비즈메시지 / Solapi 실제 유료 API 키 바인딩 (배포 시 연동)
- [x] `[Claude Code]` **[Auth] Clerk 멀티테넌트 살롱 조직 연동**:
  - Next.js 16 `proxy.ts` 및 `HeaderAuth` 클라이언트 연동 완료

---

### 🟡 Phase 3 — 고도화 & 생성형 AI (P2) (진행 중)

- [x] `[Antigravity]` **[FR-301-UI] 가상 헤어 시뮬레이션 인터랙티브 뷰어**:
  - [x] `VirtualHairSimulator.tsx`: Before / After 좌우 스플릿 슬라이더
  - [x] 실시간 염색약 컬러 틴트(애쉬, 밀크티, 카키, 블루블랙 등) 블렌드 필터 및 농도 조절
  - [x] `/diagnose` Step 3 진단 워크플로우 연동 완료
- [x] `[Claude Code]` **[FR-301-API] 생성형 AI 가상 헤어 합성 파이프라인 (Inpainting)**:
  - Stable Diffusion Inpainting (stability-ai/stable-diffusion-inpainting) via Replicate API
  - 클라이언트 Canvas 헤어 마스크 자동 생성 (타원형, blur 처리)
  - 클라이언트 사이드 폴링 (2초 간격, 최대 2분) — Vercel 타임아웃 회피
  - 이미지 768px 자동 리사이징 전처리
  - 합성 결과 URL DB 저장 (Diagnosis.synthesizedImageUrl)
- [x] `[Claude Code]` **[FR-302] 브랜드별 염색약 실물 차트 매칭 (밀본/로레알 1:1 레시피 매핑)**
  - `lib/data/hairDyeChart.ts`: 6개 컬러 틴트 × 3개 브랜드(밀본/로레알/웰라) 실물 레시피 데이터베이스
  - `app/api/hair-dye/route.ts`: `?season=` 및 `?tintName=` 쿼리 기반 레시피 조회 API
  - `components/prescription/HairDyeRecommendation.tsx`: 아코디언형 브랜드 레시피 UI (Step 4 & 처방전 공개 뷰에 통합)

---

## 4. Claude Code AI 방법론 (소대 편제 및 스킬)

| # | 주제 | 상태 | 담당 |
|---|------|------|------|
| 1 | Dual Mode 실행 | ⬜ 미시작 | Claude Code |
| 2 | 스무고개 브레인스토밍 | ⬜ 미시작 | Claude Code |
| 3 | 아젠다별 승인 방식 | ⬜ 미시작 | Claude Code |
| 4 | LLM_Wiki 지식베이스 관리 | ⬜ 미시작 | Claude Code |
| 5 | 크롬 원격 데스크탑 모바일 접속 | ⬜ 미시작 | Claude Code |
| 6 | 4종 품질관리 스킬 | ⬜ 미시작 | Claude Code |
| 7 | 특허출원서 자동 작성 | ⬜ 미시작 | Claude Code |
| 8 | NeMoTron 합성 데이터셋 활용 | ⬜ 미시작 | Claude Code |
| **9** | **소대 편제 방식 대량 AI 투입** | **✅ 완료** (`/platoon`) | **Claude Code** |
| 10 | MBO 방식 작업 관리 | ⬜ 미시작 | Claude Code |
| 11 | 유튜브 영상 한방에 제작 | ⬜ 미시작 | Claude Code |
| 12 | 3개 이상 대안 + 권고안 | ⬜ 미시작 | Claude Code |
| 13 | 3개 AI 토론 방식 | ⬜ 미시작 | Claude Code |
| 14 | SAL 3차원 좌표 작업 분해 | ⬜ 미시작 | Claude Code |
| 15 | SVG 아키텍처 → 스킬 변환 | ⬜ 미시작 | Claude Code |

---

## 5. 업무 인수인계 및 동기화 가이드

1. **Antigravity 작업 시**:
   - `components/`, `app/diagnose/`, `app/prescription/`, `lib/ai/` 등 UI 및 비전 알고리즘 영역 집중
2. **Claude Code 작업 시**:
   - `app/api/customers/`, `app/dashboard/records/`, 알림톡 API 등 백엔드/인프라 영역 집중
