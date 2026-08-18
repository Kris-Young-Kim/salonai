# SalonAI 프로젝트 TODO & 작업 맥락

**최종 업데이트**: 2026-08-18  
**협업 체계**: Antigravity IDE (UI/UX & Vision) ⚔️ Claude Code CLI (Backend & Infra) 듀얼 AI 협업

---

## 🤖 듀얼 AI 협업 분담 체계 (Dual-AI Collaboration Matrix)

| 구분 | 🌟 Antigravity IDE Agent | ⚡ Claude Code CLI (`/platoon`) |
|---|---|---|
| **핵심 강점** | • 고품질 프론트엔드 UI/UX & 반응형 태블릿 뷰<br>• MediaPipe 비전 & Canvas 그래픽스<br>• CIE-Lab 색공간 & 인터랙티브 시각화 | • 대규모 백엔드 API & DB 트랜잭션<br>• Clerk 멀티테넌트 조직 & 미들웨어<br>• Cloudflare R2 스토리지 & 카카오 알림톡 연동<br>• `/platoon` 소대 편제 대량 작업 및 품질 관리 |
| **주요 역할** | **[Frontend & Client AI]**<br>UI 컴포넌트, 캔버스 렌더러, 클라이언트 뷰어 | **[Backend & Cloud Infra & CRM]**<br>DB 스키마/마이그레이션, 서버 API, 외부 연동 |

---

## 2. 확정 기술 스택

| 계층 | 기술 | 담당 AI |
|------|------|------|
| Frontend | Next.js (App Router) + Tailwind CSS | **Antigravity IDE** |
| Vision / Color | Google MediaPipe Face Mesh + Canvas CIE-Lab | **Antigravity IDE** |
| Design & Typography | Pretendard + 살롱 다크/골드 테마 | **Antigravity IDE** |
| Auth & Multi-tenant | Clerk (조직/디자이너 관리) | **Claude Code** |
| DB & ORM | Neon (Serverless PostgreSQL) + Prisma | **Claude Code** (DB) & **공통** |
| Storage | Cloudflare R2 (이미지 오브젝트 스토리지) | **Claude Code** |
| Messaging | 카카오 알림톡 (Solapi/비즈톡 API 연동) | **Claude Code** |
| Hosting & CI/CD | Vercel + GitHub Actions | **Claude Code** |

---

## 3. 개발 단계별 역할 및 진행 현황 (PRD Phase별)

### 🟢 Phase 1 — MVP (P0) 핵심 진단 & 룩북 (완료)

- [x] `[Antigravity]` **[FR-101]** 태블릿 카메라 촬영 UI (계란형 오버레이 가이드, 타이머, 좌우반전, 파일업로드 폴백, 프리뷰)
- [x] `[Antigravity]` **[FR-102]** 얼굴형 & 두상 랜드마크 분석 (MediaPipe 468 포인트 3D 메쉬, 상/중/하안부 3단 비율, 6대 얼굴형 분류)
- [x] `[Antigravity]` **[FR-103]** 피부톤 & 퍼스널컬러 진단 (뺨/이마 ROI 픽셀 샘플링, CIE-Lab/HSV/ITA 4계절 분류, 살롱 염색약 매칭)
- [x] `[Antigravity]` **[FR-104]** 맞춤 룩북 매칭 (24종 K-살롱 마스터 룩북, 다차원 매칭 스코어링, 인터랙티브 갤러리 및 선택 드로어)
- [x] `[Antigravity]` **[FR-105]** 전문가용 종합 상담 리포트 뷰 (얼굴형·두상·퍼스널컬러·선택스타일 원스톱 확인)

---

### 🟡 Phase 2 — 살롱 워크플로우 & CRM (P1) (진행 중)

- [x] `[Antigravity]` **[FR-202-UI]** 고객 전용 모바일 웹 처방전 뷰 (`/prescription/[token]`)
- [x] `[Antigravity]` **[FR-203]** 디자이너 시술 메모 & 홈케어 레시피 에디터 (스마트 템플릿 작성기)
- [ ] `[Claude Code]` **[FR-201] 고객 및 디자이너 CRM 시스템**:
  - 고객 목록 및 연락처 검색/필터링 API (`/api/customers`)
  - 고객별 과거 진단 및 처방 이력 누적 조회 (`/dashboard/records`)
  - 살롱 매장별 진단 통계 대시보드 데이터 연동
- [ ] `[Claude Code]` **[FR-202-API] 실 카카오 알림톡 발송 백엔드 연동**:
  - 카카오 비즈메시지 / Solapi API 키 연동 및 실제 템플릿 등록/발송
- [ ] `[Claude Code]` **[Infra] Cloudflare R2 이미지 스토리지 연동** *(우선순위 낮음 — Phase 3 또는 파일럿 직전)*:
  - 고객 촬영 원본 사진의 Cloudflare R2 Presigned URL 업로드 API 구축
  - 현재는 base64를 Neon DB에 직접 저장 중 (MVP 단계 허용)
- [ ] `[Claude Code]` **[Auth] Clerk 멀티테넌트 살롱 조직 연동 고도화**:
  - 매장(Salon) ↔ 디자이너(Designer) 계정 권한 바인딩 및 라우트 보호

---

### 🟣 Phase 3 — 고도화 & 생성형 AI (P2) (대기)

- [ ] `[Claude Code]` **[FR-301-API] 생성형 AI 가상 헤어 합성 파이프라인 (Inpainting)**:
  - Stable Diffusion / Replicate API 기반 고객 사진 헤어 합성 백엔드 워크플로우
- [ ] `[Antigravity]` **[FR-301-UI] 가상 헤어 시뮬레이션 인터랙티브 뷰어**:
  - Before / After 슬라이더 및 시뮬레이션 비교 UI
- [ ] `[Claude Code]` **[FR-302] 브랜드별 염색약 실물 차트 매칭 (밀본/로레알 1:1 레시피 매핑)**

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
   - `app/api/customers/`, `app/dashboard/records/`, `lib/storage/`, Cloudflare R2 및 알림톡 API 등 백엔드/인프라 영역 집중
