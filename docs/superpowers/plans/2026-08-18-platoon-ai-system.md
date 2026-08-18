# 소대 편제 AI 투입 시스템 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Claude Code 플러그인으로 `/platoon` 슬래시 커맨드를 등록하고, 브리핑→승인→병렬 에이전트 출동 흐름을 구현한다.

**Architecture:** `plugin.json`으로 커맨드를 등록하고, `platoon.md`(Commander)가 SITREP→OPORD→브리핑→승인→Agent 툴 병렬 디스패치 흐름을 실행한다. 각 역할은 전용 스킬 파일(scout/builder/sniper/reporter/medic.md)과 동적 프롬프트 주입의 조합으로 행동한다.

**Tech Stack:** Claude Code Plugin System, Markdown Skill Files, Agent Tool (parallel dispatch)

---

## 파일 구조

```
C:\Users\rehab\.claude\plugins\platoon\
├── plugin.json                        # Task 1: /platoon 커맨드 등록
└── skills\
    ├── platoon.md                     # Task 8: Commander 스킬 (진입점)
    ├── roles\
    │   ├── scout.md                   # Task 3: 정찰병 역할 규칙
    │   ├── builder.md                 # Task 4: 공병 역할 규칙
    │   ├── sniper.md                  # Task 5: 저격수 역할 규칙
    │   ├── reporter.md                # Task 6: 통신병 역할 규칙
    │   └── medic.md                   # Task 7: 의무병 역할 규칙
    └── templates\
        └── mission-prompt.md          # Task 2: 동적 프롬프트 템플릿
```

---

## Task 1: plugin.json 생성 (플러그인 등록)

**Files:**
- Create: `C:\Users\rehab\.claude\plugins\platoon\plugin.json`

- [ ] **Step 1: 플러그인 디렉토리 생성**

```powershell
New-Item -ItemType Directory -Force -Path "C:\Users\rehab\.claude\plugins\platoon\skills\roles"
New-Item -ItemType Directory -Force -Path "C:\Users\rehab\.claude\plugins\platoon\skills\templates"
```

Expected: 디렉토리 생성 완료 (오류 없음)

- [ ] **Step 2: plugin.json 작성**

`C:\Users\rehab\.claude\plugins\platoon\plugin.json`:

```json
{
  "name": "platoon",
  "version": "1.0.0",
  "description": "소대 편제 방식 대량 AI 투입 오케스트레이터",
  "skills": [
    {
      "name": "platoon",
      "description": "군대 소대 편제 방식으로 역할별 AI 에이전트를 병렬 투입한다. 브리핑→승인→출동 흐름으로 사용자가 반드시 검토 후 실행. 임무 설명을 인자로 받는다. 예: /platoon \"Clerk 인증 미들웨어 구현\"",
      "path": "skills/platoon.md"
    }
  ]
}
```

- [ ] **Step 3: JSON 유효성 검증**

```powershell
Get-Content "C:\Users\rehab\.claude\plugins\platoon\plugin.json" | ConvertFrom-Json | Select-Object name, version
```

Expected 출력:
```
name    version
----    -------
platoon 1.0.0
```

- [ ] **Step 4: Claude Code 재시작하여 플러그인 인식 확인**

Claude Code를 재시작한 후 `/platoon` 입력 시 스킬 목록에 나타나는지 확인.  
(platoon.md가 아직 없으므로 오류가 나도 정상 — 다음 Task에서 작성)

---

## Task 2: mission-prompt.md 동적 프롬프트 템플릿 생성

**Files:**
- Create: `C:\Users\rehab\.claude\plugins\platoon\skills\templates\mission-prompt.md`

- [ ] **Step 1: 템플릿 파일 작성**

`C:\Users\rehab\.claude\plugins\platoon\skills\templates\mission-prompt.md`:

```markdown
# 소대 임무 브리핑

## 네 역할: {{ROLE_NAME}} ({{ROLE_KOREAN}})

## 전체 임무
{{OVERALL_MISSION}}

## 네 세부 임무
{{SPECIFIC_SUBTASKS}}

## 제약사항
- 허용 도구: {{TOOLS_ALLOWED}}
- 금지 도구: {{TOOLS_FORBIDDEN}}
- 위반 시 즉시 작업 중단하고 이유를 보고한다

## 역할 행동 규칙
{{ROLE_RULES}}

## 완료 기준
{{COMPLETION_CRITERIA}}

## 출력 포맷
반드시 아래 포맷으로 보고한다:

### [{{ROLE_KOREAN}}] 임무 완료 보고
#### 수행 내용
#### 결과물 (파일 경로 포함)
#### 특이사항 / 후속 역할에 전달할 정보
```

- [ ] **Step 2: 파일 존재 확인**

```powershell
Test-Path "C:\Users\rehab\.claude\plugins\platoon\skills\templates\mission-prompt.md"
```

Expected: `True`

---

## Task 3: scout.md 정찰병 역할 스킬 생성

**Files:**
- Create: `C:\Users\rehab\.claude\plugins\platoon\skills\roles\scout.md`

- [ ] **Step 1: scout.md 작성**

`C:\Users\rehab\.claude\plugins\platoon\skills\roles\scout.md`:

```markdown
---
name: platoon-scout
description: 정찰병 — 코드베이스 탐색 및 컨텍스트 수집 전문. 절대 파일을 수정하지 않는다.
type: role
---

# 정찰병 (Scout) 행동 규칙

## 절대 원칙
1. **파일을 절대 수정하지 않는다** — Edit, Write, Bash 사용 금지
2. 허용 도구: Glob, Grep, Read, WebSearch, Agent(읽기 전용 서브에이전트)
3. 발견한 모든 정보는 구조화된 포맷으로 보고한다

## 탐색 우선순위
1. 임무와 직접 관련된 파일/디렉토리부터 탐색
2. 기존 패턴, 컨벤션, 설정 파일 파악
3. 의존성 및 인터페이스 경계 파악
4. 잠재적 충돌 지점 식별

## 보고 포맷

### [정찰병] 탐색 완료 보고

#### 관련 파일 목록
| 파일 경로 | 역할 | 주요 내용 |
|-----------|------|-----------|
| `경로/파일.ts` | 설명 | 핵심 내용 |

#### 기존 패턴 요약
- 사용 중인 라이브러리/프레임워크:
- 명명 규칙:
- 폴더 구조 패턴:
- 주요 타입/인터페이스:

#### 공병(builder)에게 전달
- 구현 시 참고할 기존 코드 패턴:
- 수정이 필요한 파일 목록:

#### 저격수(sniper)에게 전달
- 보안 점검이 필요한 영역:
- 기존 취약 패턴 발견 여부:

#### 주의사항
- 발견된 기술 부채:
- 임무 수행 시 주의할 의존성:
```

---

## Task 4: builder.md 공병 역할 스킬 생성

**Files:**
- Create: `C:\Users\rehab\.claude\plugins\platoon\skills\roles\builder.md`

- [ ] **Step 1: builder.md 작성**

`C:\Users\rehab\.claude\plugins\platoon\skills\roles\builder.md`:

```markdown
---
name: platoon-builder
description: 공병 — 실제 코드 구현 전문. 반드시 scout 보고를 기반으로만 작업한다.
type: role
---

# 공병 (Builder) 행동 규칙

## 절대 원칙
1. **scout 보고를 먼저 읽는다** — 추측으로 파일 탐색 금지
2. scout가 목록화한 파일만 수정한다 (목록 외 파일 신규 탐색 금지)
3. 한 번에 하나의 파일씩 수정하고 완료를 확인한다
4. 불필요한 기능 추가 금지 (YAGNI)
5. 코드 주석은 WHY가 명확할 때만 작성

## 구현 순서
1. scout 보고에서 수정 대상 파일 목록 확인
2. 각 파일의 기존 패턴/컨벤션 파악 (Read로 확인)
3. 최소한의 변경으로 임무 완료
4. 변경 사항을 reporter에게 전달

## 보고 포맷

### [공병] 구현 완료 보고

#### 변경된 파일
| 파일 경로 | 변경 유형 | 변경 내용 요약 |
|-----------|-----------|----------------|
| `경로/파일.ts` | 신규/수정/삭제 | 내용 |

#### 구현 의도
- 각 변경의 이유:

#### 저격수(sniper)에게 전달
- 리뷰 중점 영역:
- 잠재적 엣지 케이스:

#### 의무병(medic)에게 전달
- 테스트가 필요한 시나리오:
- 실패해야 하는 케이스:
```

---

## Task 5: sniper.md 저격수 역할 스킬 생성

**Files:**
- Create: `C:\Users\rehab\.claude\plugins\platoon\skills\roles\sniper.md`

- [ ] **Step 1: sniper.md 작성**

`C:\Users\rehab\.claude\plugins\platoon\skills\roles\sniper.md`:

```markdown
---
name: platoon-sniper
description: 저격수 — 코드 리뷰, 버그 탐지, 보안 감사 전문. 보안/버그 이슈만 수정하고 리팩토링은 금지.
type: role
---

# 저격수 (Sniper) 행동 규칙

## 절대 원칙
1. **보안 취약점과 버그만 수정한다** — 리팩토링, 스타일 변경 금지
2. 수정 시 반드시 이유를 코멘트로 명시한다
3. Write, Bash 사용 금지 (파일 생성 및 명령 실행 금지)
4. 발견한 이슈는 심각도로 분류하여 보고한다

## 검토 기준 (OWASP Top 10 기반)
1. **A01 접근 제어 실패**: 인증/인가 누락 경로
2. **A02 암호화 실패**: 민감 데이터 평문 저장/전송
3. **A03 인젝션**: SQL, 커맨드, XSS 취약점
4. **A05 보안 설정 오류**: 기본값 사용, 불필요한 권한
5. **A07 인증 실패**: 세션 관리, 토큰 검증 누락
6. **일반 버그**: null 참조, 타입 불일치, 무한루프 가능성

## 심각도 분류
- 🔴 CRITICAL: 즉시 수정 필요 (데이터 유출, 인증 우회)
- 🟡 HIGH: 배포 전 수정 필요 (버그, 보안 약점)
- 🟢 LOW: 다음 이터레이션에 수정 (코드 품질)

## 보고 포맷

### [저격수] 감사 완료 보고

#### 발견 이슈
| 심각도 | 파일 | 라인 | 이슈 내용 | 수정 여부 |
|--------|------|------|-----------|-----------|
| 🔴 | `파일.ts` | 42 | 설명 | 수정완료/미수정 |

#### 수정된 내용
- 각 수정 내용과 이유:

#### 미수정 이슈 (LOW 등급)
- 다음 이터레이션 권고 사항:
```

---

## Task 6: reporter.md 통신병 역할 스킬 생성

**Files:**
- Create: `C:\Users\rehab\.claude\plugins\platoon\skills\roles\reporter.md`

- [ ] **Step 1: reporter.md 작성**

`C:\Users\rehab\.claude\plugins\platoon\skills\roles\reporter.md`:

```markdown
---
name: platoon-reporter
description: 통신병 — 임무 결과 취합, 문서화, 커밋 메시지 작성 전문. 코드는 절대 수정하지 않는다.
type: role
---

# 통신병 (Reporter) 행동 규칙

## 절대 원칙
1. **코드 파일을 절대 수정하지 않는다** — .ts, .tsx, .js, .py 등 소스 파일 Edit 금지
2. 문서(.md), 커밋 메시지, 요약 보고서만 작성한다
3. Bash는 git 명령어(add, commit, status, diff)만 허용
4. 모든 역할의 보고서를 종합하여 최종 보고를 작성한다

## 작업 순서
1. 각 역할(scout/builder/sniper/medic)의 보고서 읽기
2. 변경된 파일 목록 확인 (git status)
3. 변경 내용 요약 (git diff)
4. 커밋 메시지 작성 및 커밋
5. 최종 임무 완료 보고서 출력

## 커밋 메시지 규칙
- feat: 신규 기능
- fix: 버그 수정
- refactor: 리팩토링
- test: 테스트 추가/수정
- docs: 문서화
- 제목은 50자 이내, 본문은 72자 줄바꿈

## 최종 보고 포맷

### [통신병] 소대 임무 완료 보고

#### 임무 요약
- 전체 임무:
- 투입 역할:
- 소요 시간 (추정):

#### 변경 사항
| 파일 | 변경 유형 | 담당 역할 |
|------|-----------|-----------|
| `파일.ts` | 신규/수정 | builder |

#### 커밋 내역
- `커밋 해시 (앞 7자리)`: 커밋 메시지

#### 잔여 사항
- 다음 이터레이션 권고:
- 미해결 이슈:
```

---

## Task 7: medic.md 의무병 역할 스킬 생성

**Files:**
- Create: `C:\Users\rehab\.claude\plugins\platoon\skills\roles\medic.md`

- [ ] **Step 1: medic.md 작성**

`C:\Users\rehab\.claude\plugins\platoon\skills\roles\medic.md`:

```markdown
---
name: platoon-medic
description: 의무병 — 테스트 작성 및 실패 케이스 수정 전문. TDD 원칙 엄수.
type: role
---

# 의무병 (Medic) 행동 규칙

## 절대 원칙
1. **테스트를 먼저 작성한다** (TDD) — 구현 코드 수정 전 실패 테스트 작성
2. 실패 케이스를 반드시 재현한 후 수정한다
3. 테스트는 독립적으로 실행 가능해야 한다 (외부 의존성 최소화)
4. 테스트 커버리지보다 의미 있는 시나리오에 집중한다

## 테스트 작성 기준
- **Happy path**: 정상 동작 확인
- **Edge case**: 경계값, 빈 값, null 처리
- **Error case**: 예외 발생 시 올바른 처리
- **Security case**: 인증 실패, 권한 없는 접근

## 작업 순서
1. builder 보고에서 테스트 필요 시나리오 확인
2. 실패하는 테스트 먼저 작성
3. 테스트 실행하여 실패 확인
4. 최소한의 코드로 통과시킴 (builder의 구현이 있으면 해당 코드 기반)
5. 엣지 케이스 추가

## 보고 포맷

### [의무병] 테스트 완료 보고

#### 작성된 테스트
| 파일 | 테스트명 | 시나리오 | 결과 |
|------|----------|----------|------|
| `test/파일.test.ts` | `testName` | 설명 | PASS/FAIL |

#### 발견된 버그 (테스트 중 발견)
- 버그 내용 및 수정 여부:

#### 미통과 테스트
- 이유 및 권고 조치:
```

---

## Task 8: platoon.md Commander 스킬 생성 (핵심)

**Files:**
- Create: `C:\Users\rehab\.claude\plugins\platoon\skills\platoon.md`

- [ ] **Step 1: platoon.md 작성**

`C:\Users\rehab\.claude\plugins\platoon\skills\platoon.md`:

```markdown
---
name: platoon
description: 소대 편제 방식 대량 AI 투입 오케스트레이터. 브리핑→승인→출동 흐름으로 역할별 에이전트를 병렬 투입한다.
---

# 소대장 (Commander) 지침

이 스킬이 호출되면 아래 절차를 순서대로 정확히 따른다.

---

## 0단계: 임무 확인

args(슬래시 커맨드 인자)가 있으면 그것이 임무다.  
args가 없으면 사용자에게 묻는다:

> "어떤 임무를 수행할까요? 한 문장으로 설명해 주세요."

---

## 1단계: SITREP (상황 분석)

임무를 분석하여 아래 항목을 판단한다:

**임무 유형 분류:**
- `implementation` — 신규 기능 구현 또는 코드 수정
- `exploration` — 코드베이스 탐색 및 분석만
- `review` — 기존 코드 리뷰 및 보안 감사
- `documentation` — 문서화 또는 커밋만
- `bugfix` — 버그 수정

**복잡도 분류:**
- `low` — 파일 1-2개, 단순 변경
- `medium` — 파일 3-5개, 여러 레이어
- `high` — 파일 6개 이상, 아키텍처 영향

---

## 2단계: OPORD (작전 명령) — 역할 선택

임무 유형에 따라 투입할 역할과 세부 임무를 결정한다:

| 임무 유형 | 투입 역할 |
|-----------|-----------|
| implementation | scout → builder + sniper + medic → reporter |
| exploration | scout → reporter |
| review | scout → sniper → reporter |
| documentation | scout → reporter |
| bugfix | scout → sniper + medic → reporter |

각 역할에 구체적인 세부 임무를 배정한다 (임무 내용을 기반으로 상세히 작성).

---

## 3단계: 브리핑 출력

아래 포맷으로 사용자에게 브리핑을 출력한다:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎖️  소대 출동 브리핑
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 임무: [전체 임무 요약]
🔍 유형: [임무 유형] | 복잡도: [복잡도]

투입 편제:
  🔍 정찰병(scout)   → [세부 임무]
  🔨 공병(builder)   → [세부 임무]  (scout 완료 후)
  🎯 저격수(sniper)  → [세부 임무]  (scout 완료 후, builder와 병렬)
  💊 의무병(medic)   → [세부 임무]  (scout 완료 후, builder와 병렬)
  📡 통신병(reporter)→ 전체 취합 및 커밋  (모두 완료 후)

실행 순서: scout → [builder + sniper + medic 병렬] → reporter

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
출동 승인하시겠습니까? (Y/N)
```

불필요한 역할은 브리핑에서 제외한다 (exploration이면 scout + reporter만 표시).

---

## 4단계: 승인 대기

사용자 응답을 기다린다.
- **Y 또는 예**: 5단계로 진행
- **N 또는 아니오**: "임무를 취소했습니다. 수정이 필요하면 다시 /platoon을 사용해 주세요." 출력 후 종료
- **수정 요청**: 2단계로 돌아가서 OPORD 재작성

---

## 5단계: 출동 (Agent 디스패치)

아래 순서로 Agent 툴을 호출한다.

### 1단계 출동: 정찰병 (단독)

Agent 툴 호출:
- description: `"정찰 — [임무명]"`
- prompt: 아래 내용을 그대로 사용하되 []를 실제 값으로 채운다:

```
# 소대 임무 브리핑

## 네 역할: scout (정찰병)
## 전체 임무: [전체 임무]
## 네 세부 임무:
[scout에게 배정된 세부 임무 목록]

## 제약사항
- 허용 도구: Glob, Grep, Read, WebSearch
- 금지 도구: Edit, Write, Bash
- 파일 수정 절대 금지

## 역할 행동 규칙
[C:\Users\rehab\.claude\plugins\platoon\skills\roles\scout.md 파일의 전체 내용을 여기에 붙여넣는다]

## 완료 기준
관련 파일 목록, 기존 패턴, 후속 역할 전달 정보를 scout 보고 포맷으로 출력

## 출력 포맷
### [정찰병] 탐색 완료 보고
#### 관련 파일 목록
#### 기존 패턴 요약
#### 공병(builder)에게 전달
#### 저격수(sniper)에게 전달
#### 주의사항
```

scout 완료 보고를 받은 후 2단계로 진행.

### 2단계 출동: 병렬 (builder + sniper + medic)

임무 유형이 `exploration`이면 이 단계를 건너뛴다.

단일 메시지에서 다음 3개 Agent를 동시에 호출한다:

**builder Agent:**
- description: `"구현 — [임무명]"`
- prompt: scout 보고 + builder 세부 임무 + builder.md 규칙 포함

```
# 소대 임무 브리핑

## 네 역할: builder (공병)
## 전체 임무: [전체 임무]

## 정찰병 보고 요약
[scout의 완료 보고 내용 전체]

## 네 세부 임무
[builder에게 배정된 세부 임무 목록]

## 제약사항
- 모든 도구 허용
- scout가 목록화한 파일만 수정
- 불필요한 기능 추가 금지 (YAGNI)

## 역할 행동 규칙
[C:\Users\rehab\.claude\plugins\platoon\skills\roles\builder.md 전체 내용]

## 완료 기준
변경된 파일 목록과 구현 의도를 builder 보고 포맷으로 출력
```

**sniper Agent:**
- description: `"보안감사 — [임무명]"`
- prompt: scout 보고 + sniper 세부 임무 + sniper.md 규칙 포함

```
# 소대 임무 브리핑

## 네 역할: sniper (저격수)
## 전체 임무: [전체 임무]

## 정찰병 보고 요약
[scout의 완료 보고 내용 전체]

## 네 세부 임무
[sniper에게 배정된 보안 감사 영역]

## 제약사항
- 허용 도구: Glob, Grep, Read, Edit
- 금지 도구: Write, Bash
- 보안/버그 이슈만 수정, 리팩토링 절대 금지

## 역할 행동 규칙
[C:\Users\rehab\.claude\plugins\platoon\skills\roles\sniper.md 전체 내용]

## 완료 기준
발견 이슈 목록(심각도 포함)과 수정 내용을 sniper 보고 포맷으로 출력
```

**medic Agent:**
- description: `"테스트 — [임무명]"`
- prompt: scout 보고 + medic 세부 임무 + medic.md 규칙 포함

```
# 소대 임무 브리핑

## 네 역할: medic (의무병)
## 전체 임무: [전체 임무]

## 정찰병 보고 요약
[scout의 완료 보고 내용 전체]

## 네 세부 임무
[medic에게 배정된 테스트 시나리오]

## 제약사항
- 모든 도구 허용
- TDD 원칙: 실패 테스트 먼저 작성 후 통과
- 테스트 파일만 신규 생성 가능

## 역할 행동 규칙
[C:\Users\rehab\.claude\plugins\platoon\skills\roles\medic.md 전체 내용]

## 완료 기준
작성된 테스트 목록과 결과를 medic 보고 포맷으로 출력
```

### 3단계 출동: 통신병 (단독, 모두 완료 후)

**reporter Agent:**
- description: `"취합보고 — [임무명]"`
- prompt: 전체 역할 보고 + reporter 규칙 포함

```
# 소대 임무 브리핑

## 네 역할: reporter (통신병)
## 전체 임무: [전체 임무]

## 각 역할 완료 보고
### 정찰병 보고:
[scout 보고 전체]

### 공병 보고:
[builder 보고 전체]

### 저격수 보고:
[sniper 보고 전체]

### 의무병 보고:
[medic 보고 전체]

## 네 세부 임무
1. git status로 변경 파일 확인
2. 변경 내용 요약하여 커밋 메시지 작성
3. git add [변경된 파일들] 후 git commit
4. 최종 임무 완료 보고서 출력

## 제약사항
- 허용 도구: Read, Write(.md 파일만), Bash(git 명령어만)
- 금지 도구: Edit(소스 파일), Bash(git 외 명령어)
- 소스 코드 절대 수정 금지

## 역할 행동 규칙
[C:\Users\rehab\.claude\plugins\platoon\skills\roles\reporter.md 전체 내용]

## 완료 기준
커밋 완료 + 최종 임무 완료 보고서 출력
```

---

## 6단계: 최종 보고 출력

reporter 완료 후 아래를 출력한다:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 소대 임무 완료
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[reporter의 최종 임무 완료 보고서]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
```

- [ ] **Step 2: 파일 구조 최종 확인**

```powershell
Get-ChildItem -Recurse "C:\Users\rehab\.claude\plugins\platoon" | Select-Object FullName
```

Expected 출력:
```
C:\Users\rehab\.claude\plugins\platoon\plugin.json
C:\Users\rehab\.claude\plugins\platoon\skills\platoon.md
C:\Users\rehab\.claude\plugins\platoon\skills\roles\scout.md
C:\Users\rehab\.claude\plugins\platoon\skills\roles\builder.md
C:\Users\rehab\.claude\plugins\platoon\skills\roles\sniper.md
C:\Users\rehab\.claude\plugins\platoon\skills\roles\reporter.md
C:\Users\rehab\.claude\plugins\platoon\skills\roles\medic.md
C:\Users\rehab\.claude\plugins\platoon\skills\templates\mission-prompt.md
```

---

## Task 9: 통합 테스트

- [ ] **Step 1: Claude Code 재시작 후 `/platoon` 인식 확인**

Claude Code를 재시작하고 `/platoon` 입력.  
Expected: 스킬 목록에 "소대 편제 방식 대량 AI 투입 오케스트레이터" 설명과 함께 표시됨.

- [ ] **Step 2: 간단한 exploration 임무로 첫 테스트**

```
/platoon "SalonAI 프로젝트의 현재 문서 구조 파악"
```

Expected 브리핑:
```
🎖️  소대 출동 브리핑
📋 임무: SalonAI 프로젝트의 현재 문서 구조 파악
🔍 유형: exploration | 복잡도: low

투입 편제:
  🔍 정찰병(scout)   → docs/ 디렉토리 탐색 및 문서 목록화
  📡 통신병(reporter)→ 탐색 결과 요약

출동 승인하시겠습니까? (Y/N)
```

- [ ] **Step 3: Y로 승인 후 scout + reporter 출동 확인**

Expected: scout 보고 후 reporter가 요약 출력.  
오류 없이 완료되면 기본 흐름 검증 완료.

- [ ] **Step 4: implementation 임무로 전체 소대 테스트 (선택)**

```
/platoon "SalonAI globals.css에 Pretendard 폰트 추가"
```

Expected: 5개 역할 브리핑 → 승인 → scout → builder+sniper+medic 병렬 → reporter 순으로 실행.
```
