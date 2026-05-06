# Phase 12 설계 — 스테이지 클리어 화면

## 목표

화면의 모든 공이 소멸되면 클리어 화면으로 전환한다.
다시 시작 / 메인으로 버튼을 제공한다.

---

## 클리어 전환 흐름

```
ballsRef.length === 0 (마지막 공 소멸 시점)
  → onClear() 호출
  → App: screen = 'clear'
  → ClearScreen 표시
```

---

## 화면 레이아웃

```
┌──────────────────────────────────────┐
│                                      │
│         STAGE CLEAR!                 │  ← 타이틀 (노란색)
│                                      │
│          [ 다시 시작 ]                │
│          [ 메인으로  ]                │
│                                      │
└──────────────────────────────────────┘
```

---

## 파일 구조

```
src/
├── App.tsx                  ← Screen에 'clear' 추가
├── screens/
│   ├── GameScreen.tsx       ← onClear 콜백, 마지막 공 소멸 시 호출
│   └── ClearScreen.tsx      ← 신규
└── styles/
    └── ClearScreen.css      ← 신규
```

---

## 컴포넌트 설계

### App.tsx 변경

```tsx
export type Screen = 'main' | 'howto' | 'game' | 'gameover' | 'clear'

<GameScreen onExit={...} onGameOver={...} onClear={() => setScreen('clear')} />

<ClearScreen
  onRestart={() => setScreen('game')}
  onMainMenu={() => setScreen('main')}
/>
```

### GameScreen.tsx 변경

```tsx
interface GameScreenProps {
  onExit: () => void
  onGameOver: () => void
  onClear: () => void
}
```

마지막 공 소멸 시점:
```ts
if (ballsRef.current.length === 0) {
  onClear()
}
```

### ClearScreen.tsx

```tsx
interface ClearScreenProps {
  onRestart: () => void
  onMainMenu: () => void
}
```

---

## 스타일 방향

| 항목 | 내용 |
|------|------|
| 배경 | `#1a1a2e` |
| 타이틀 | 노란색 (`#f5c518`), 메인 타이틀보다 약간 작게 |
| 버튼 | 기존 `MenuButton` 재사용 |

---

## 완료 기준

- [ ] 모든 공 제거 시 클리어 화면이 뜬다
- [ ] 다시 시작 클릭 시 Mission 1을 처음부터 재시작한다
- [ ] 메인으로 클릭 시 메인 화면으로 돌아간다
