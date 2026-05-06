# Phase 3 설계 — 게임 캔버스 + 기본 레이아웃

## 목표

메인 화면에서 "게임 시작" 클릭 시 게임 화면으로 전환한다.
고정 크기의 게임 캔버스 영역과 상단 HUD(점수 / 목숨 / 타이머) 자리를 레이아웃으로만 구성한다.
실제 게임 오브젝트(플레이어, 공 등)는 이후 Phase에서 추가한다.

---

## 화면 레이아웃

```
┌────────────────────────────────────┐  ← 전체 화면 (100vw × 100vh)
│                                    │
│  ┌──────────────────────────────┐  │
│  │  SCORE: 0   ♥♥♥   TIME: 60  │  │  ← HUD 영역 (상단 고정)
│  ├──────────────────────────────┤  │
│  │                              │  │
│  │                              │  │
│  │       게임 캔버스 영역         │  │  ← 게임 플레이 영역
│  │       (480 × 600)            │  │
│  │                              │  │
│  │                              │  │
│  └──────────────────────────────┘  │
│                                    │
└────────────────────────────────────┘
```

- 전체 배경: `#1a1a2e`
- 캔버스 크기: 너비 480px, 높이 600px (고정)
- HUD 높이: 48px
- 캔버스는 화면 중앙 정렬

---

## 파일 구조

```
src/
├── App.tsx                      ← Screen 타입에 'game' 추가
├── screens/
│   └── GameScreen.tsx           ← 신규
├── styles/
│   └── GameScreen.css           ← 신규
└── constants/
    └── game.ts                  ← 게임 상수 정의 (캔버스 크기 등)
```

---

## 컴포넌트 설계

### constants/game.ts

이후 Phase에서 공유되는 상수를 한 곳에 정의한다.

```ts
export const CANVAS_WIDTH = 480
export const CANVAS_HEIGHT = 600
export const HUD_HEIGHT = 48
```

### App.tsx 변경

```tsx
export type Screen = 'main' | 'howto' | 'game'

// onStart 연결
onStart={() => setScreen('game')}
```

### GameScreen.tsx

```tsx
interface GameScreenProps {
  onExit: () => void  // 이후 게임오버/클리어 시 메인 복귀용 (Phase 10, 12에서 사용)
}
```

**렌더링 구조:**
```tsx
<div className="game-wrapper">
  <div className="game-container">
    <div className="hud">
      <span>SCORE: 0</span>
      <span>♥ ♥ ♥</span>
      <span>TIME: 60</span>
    </div>
    <div className="game-canvas" />
  </div>
</div>
```

---

## 스타일 방향

| 항목 | 내용 |
|------|------|
| 전체 래퍼 | `100vw × 100vh`, 중앙 정렬, 배경 `#1a1a2e` |
| game-container | `width: 480px`, flex column |
| HUD | `height: 48px`, 좌중우 3분할, 배경 `#0d0d1a` |
| game-canvas | `width: 480px, height: 600px`, 배경 `#16213e` |

---

## 완료 기준

- [ ] 메인에서 "게임 시작" 클릭 시 게임 화면으로 전환된다
- [ ] 480 × 600 게임 영역이 화면 중앙에 표시된다
- [ ] 상단 HUD에 SCORE / 목숨 / TIME 텍스트가 보인다
