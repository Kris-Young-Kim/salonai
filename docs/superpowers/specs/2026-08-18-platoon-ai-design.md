# 소대 편제 방식 대량 AI 투입 시스템 — 설계 문서

**작성일**: 2026-08-18  
**프로젝트**: Claude Code 실전 활용 방법론 #9  
**상태**: 승인 완료

---

## 1. 목표 및 배경

Claude Code의 Agent 툴을 활용하여 군대 소대 편제 방식으로 여러 AI 에이전트를 역할별로 분리하고 병렬 투입하는 오케스트레이션 시스템을 구현한다.

**핵심 가치**:
- 복잡한 임무를 전문 역할로 분해하여 병렬 처리
- 사람이 반드시 브리핑을 검토 후 승인 → 자동 출동 없음
- 스킬(.md) + 동적 프롬프트 주입으로 재사용성과 유연성 동시 확보

---

## 2. 아키텍처 개요

```
사용자: "/platoon 임무 설명 입력"
         │
         ▼
┌─────────────────────────────┐
│   COMMANDER 스킬            │
│   ① SITREP (임무 파악)      │
│   ② OPORD (역할별 분해)     │
│   ③ 브리핑 출력             │
│   ④ 승인 게이트 (Y/N)       │
└──────────────┬──────────────┘
               │ 승인
               ▼
    ┌──────────────────────┐
    │  병렬 Agent 디스패치  │
    └──┬──┬──┬──┬──┬───────┘
       │  │  │  │  │
    scout builder sniper reporter medic
    (정찰) (공병) (저격) (통신)  (의무)
       │  │  │  │  │
       └──┴──┴──┴──┘
              │
              ▼
    COMMANDER → 결과 취합 → 최종 보고
```

**핵심 원칙**:
1. **사람이 트리거**: 자동 실행 없음, 반드시 사용자 승인 후 출동
2. **병렬 실행**: 역할 간 의존성 없는 작업은 동시 디스패치
3. **역할 격리**: 각 에이전트는 자신의 역할 스킬만 보고 행동

---

## 3. 파일 구조

```
C:\Users\rehab\.claude\plugins\
└── platoon\
    ├── plugin.json                  # 플러그인 등록 (/platoon 커맨드)
    └── skills\
        ├── platoon.md               # commander 스킬 (진입점)
        ├── roles\
        │   ├── scout.md             # 정찰병 — 탐색 전용
        │   ├── builder.md           # 공병 — 구현 전용
        │   ├── sniper.md            # 저격수 — 리뷰/보안 전용
        │   ├── reporter.md          # 통신병 — 문서화 전용
        │   └── medic.md             # 의무병 — 테스트 전용
        └── templates\
            └── mission-prompt.md    # 동적 프롬프트 조립 템플릿
```

### 역할 스킬 파일 구조 (예: scout.md)

```markdown
---
name: platoon-scout
description: 정찰병 — 코드베이스 탐색 및 컨텍스트 수집 전문
type: role
tools_allowed: [Glob, Grep, Read, WebSearch]
tools_forbidden: [Edit, Write, Bash]
---

# 정찰병 행동 규칙
1. 절대 파일을 수정하지 않는다
2. 발견한 정보는 구조화된 포맷으로 보고한다
3. 관련 파일, 심볼, 패턴을 빠짐없이 목록화한다

# 보고 포맷
## 발견 사항
## 관련 파일 목록
## 기존 패턴 요약
## 주의 사항
```

---

## 4. Commander 실행 흐름

### 단계별 처리

```
① SITREP (Situation Report)
   - 임무 유형 분류: 구현 / 탐색 / 리뷰 / 문서화
   - 예상 복잡도: 낮음 / 중간 / 높음
   - 영향 범위: 관련 디렉토리/모듈

② OPORD (Operation Order)
   - 임무 유형에 따라 필요한 역할만 선택
   - 각 역할에 세부 임무 배정
   - 의존성 그래프 생성

③ 브리핑 출력 (사용자에게 표시)
   - 출동 역할 목록 + 각 세부 임무
   - 예상 실행 순서 (병렬/순차)
   - "승인하시겠습니까? (Y/N)"

④ 승인 게이트
   - Y → 출동
   - N → 임무 수정 또는 취소

⑤ 단계별 디스패치
   - 1단계: scout (단독 선발)
   - 2단계: builder + sniper + medic (병렬)
   - 3단계: reporter (취합 후 보고)
```

### 의존성 규칙

| 역할 | 선행 조건 | 병렬 가능 대상 |
|------|-----------|----------------|
| scout | 없음 (항상 먼저) | — |
| builder | scout 완료 | — |
| sniper | scout 완료 | builder, medic |
| medic | scout 완료 | builder, sniper |
| reporter | 전체 완료 | — |

### 임무 유형별 자동 역할 선택

| 임무 유형 | 투입 역할 |
|-----------|-----------|
| 신규 기능 구현 | scout → builder + sniper + medic → reporter |
| 버그 수정 | scout → sniper + medic → reporter |
| 코드 탐색/분석 | scout → reporter |
| 문서화 | scout → reporter |
| 보안 감사 | scout → sniper → reporter |

---

## 5. 역할별 행동 규칙

| 역할 | 허용 도구 | 금지 도구 | 핵심 규칙 |
|------|-----------|-----------|-----------|
| **정찰병 scout** | Glob, Grep, Read, WebSearch | Edit, Write, Bash | 수정 절대 금지. 발견 사항 구조화 보고 |
| **공병 builder** | 전체 | — | scout 보고 기반으로만 구현. 추측 탐색 금지 |
| **저격수 sniper** | Glob, Grep, Read, Edit | Write, Bash | OWASP Top 10 기준. 버그/보안만 수정, 리팩토링 금지 |
| **통신병 reporter** | Read, Write, Bash(git only) | Edit(코드) | 코드 수정 금지. 문서·커밋메시지·요약 전담 |
| **의무병 medic** | 전체 | — | TDD 원칙. 실패 케이스 재현 후 수정 |

---

## 6. 동적 프롬프트 스키마

Commander가 각 에이전트 디스패치 시 주입하는 프롬프트:

```markdown
# 소대 임무 브리핑

## 네 역할: {role_name} ({role_korean})
## 전체 임무: {overall_mission}
## 네 세부 임무:
  {specific_subtasks}

## 제약사항:
  - 허용 도구: {tools_allowed}
  - 금지 도구: {tools_forbidden}

## 역할 행동 규칙:
  {role_skill_content}

## 완료 기준:
  {completion_criteria}

## 출력 포맷:
  {output_format}
```

---

## 7. 역할 간 정보 전달

```
scout     → builder:  발견 파일 목록 + 기존 패턴 요약
scout     → sniper:   취약점 가능성 있는 영역 표시
builder   → sniper:   변경 파일 목록 + 구현 의도
builder   → medic:    변경 파일 목록 + 테스트 필요 시나리오
sniper    → reporter: 발견 이슈 목록
medic     → reporter: 테스트 결과 요약
전체      → reporter: 각 역할 보고서 → 최종 문서 취합
```

---

## 8. 사용 예시

```
/platoon "SalonAI Clerk 인증 미들웨어 구현"

[SITREP] 임무 유형: 신규 기능 구현 | 복잡도: 중간
         영향 범위: middleware.ts, auth/, clerk/

[OPORD]
  🔍 정찰병 → middleware.ts, src/auth/ 탐색, Clerk 패턴 파악
  🔨 공병   → Clerk 미들웨어 구현 (scout 보고 기반)
  🎯 저격수 → 인증 우회 취약점, 미들웨어 누락 경로 점검
  💊 의무병 → 인증 성공/실패 테스트 케이스 작성
  📡 통신병 → 변경사항 문서화 및 커밋 메시지 작성

5개 역할 출동 예정. 승인하시겠습니까? (Y/N): Y

→ [1단계] scout 출동...
→ [2단계] builder + sniper + medic 병렬 출동...
→ [3단계] reporter 취합 보고...
→ 완료
```

---

## 9. 구현 순서 (다음 단계)

1. `plugin.json` 작성 — `/platoon` 커맨드 등록
2. `platoon.md` 작성 — Commander 스킬 (SITREP→OPORD→브리핑→승인→디스패치)
3. `roles/scout.md` — 정찰병 역할 스킬
4. `roles/builder.md` — 공병 역할 스킬
5. `roles/sniper.md` — 저격수 역할 스킬
6. `roles/reporter.md` — 통신병 역할 스킬
7. `roles/medic.md` — 의무병 역할 스킬
8. `templates/mission-prompt.md` — 동적 프롬프트 템플릿
9. 실제 임무로 테스트 (SalonAI 인증 구현 등)
