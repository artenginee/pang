# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 기술 스택

- **프레임워크**: React 19 + Vite 8
- **언어**: TypeScript 6 (strict 모드, `noUnusedLocals`, `noUnusedParameters` 활성화)
- **빌드 대상**: ES2023, 번들러 모드 (`moduleResolution: bundler`)
- **린터**: ESLint 10 (`eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `typescript-eslint`)
- **진입점**: `src/main.tsx` → `src/App.tsx`

## 주요 명령어

```bash
npm run dev       # 개발 서버 실행 (http://localhost:5173)
npm run build     # 타입 체크 후 프로덕션 빌드 (tsc -b && vite build)
npm run lint      # ESLint 실행
npm run preview   # 빌드 결과물 로컬 미리보기
```

## 테스트 방법

현재 테스트 프레임워크(Vitest, Jest 등)가 설정되어 있지 않습니다.

UI 동작 확인은 다음 순서로 진행합니다:
1. `npm run dev` 실행
2. 브라우저에서 `http://localhost:5173` 접속
3. 변경 사항은 HMR(Hot Module Replacement)로 즉시 반영

타입 오류 확인:
```bash
npm run build   # tsc -b 가 포함되어 있어 타입 체크 수행
```

## 아키텍처

- `src/main.tsx`: React 루트 마운트 (`StrictMode` 적용)
- `src/App.tsx`: 최상위 컴포넌트, 현재 Hello World 페이지
- `tsconfig.json`: 프로젝트 참조 구조 (`tsconfig.app.json`, `tsconfig.node.json` 분리)
- `vite.config.ts`: `@vitejs/plugin-react` 사용 (Babel 기반 Fast Refresh)

## 기획 문서

| 파일 | 내용 |
|------|------|
| `docs/PRD.md` | 게임 전체 개요, 핵심 메커니즘, Mission 1 구성 요약 |
| `docs/FEATURES/main.md` | 메인 화면 레이아웃 및 상태 전환 |
| `docs/FEATURES/game_rule.md` | 플레이어 조작, 공 동작, 무기, 아이템, 점수 상세 규칙 |
| `docs/FEATURES/mission1.md` | Mission 1 스테이지 구성, 난이도, 공 분열 흐름 |
