# Phase 10 설계 — 목숨 소진 + 게임 오버 화면

## 목표

목숨이 0이 되면 마지막 깜빡임이 끝난 뒤 게임 오버 화면으로 전환한다.
게임 오버 화면에서 다시 시작 / 메인으로 버튼을 제공한다.

---

## 게임 오버 전환 흐름

```
목숨 차감 → lives === 0
  → 마지막 무적 타이머(2초) 진행
  → 타이머 종료 시 onGameOver() 호출
  → App: screen = 'gameover'
  → GameOverScreen 표시
```

마지막 사망에도 동일한 깜빡임 후 전환한다.
lives가 0일 때 무적 타이머가 0에 도달하는 시점에 전환한다.

---

## 화면 레이아웃

```
┌──────────────────────────────────────┐
│                                      │
│           GAME OVER                  │  ← 타이틀
│                                      │
│          [ 다시 시작 ]                │  ← Mission 1 처음부터 재시작
│          [ 메인으로  ]                │  ← 메인 화면 복귀
│                                      │
└──────────────────────────────────────┘
```

---

## 파일 구조

```
src/
├── App.tsx                       ← Screen에 'gameover' 추가
├── screens/
│   ├── GameScreen.tsx            ← onGameOver 콜백, 타이머 종료 감지
│   └── GameOverScreen.tsx        ← 신규
└── styles/
    └── GameOverScreen.css        ← 신규
```

---

## 컴포넌트 설계

### App.tsx 변경

```tsx
export type Screen = 'main' | 'howto' | 'game' | 'gameover'

if (screen === 'gameover') {
  return (
    <GameOverScreen
      onRestart={() => setScreen('game')}
      onMainMenu={() => setScreen('main')}
    />
  )
}
// GameScreen에 onGameOver 추가
<GameScreen onExit={...} onGameOver={() => setScreen('gameover')} />
```

`onRestart`에서 `'game'`으로 전환하면 GameScreen이 언마운트 후 재마운트되어
모든 ref(공, 목숨, 타이머)가 자동으로 초기값으로 리셋된다.

### GameScreen.tsx 변경

```tsx
interface GameScreenProps {
  onExit: () => void
  onGameOver: () => void
}
```

update() 내:
```ts
// 무적 타이머 종료 + 목숨 0 → 게임 오버
if (was_invincible && invincibleTimerRef.current === 0 && livesRef.current === 0) {
  onGameOver()
}
```

### GameOverScreen.tsx

```tsx
interface GameOverScreenProps {
  onRestart: () => void
  onMainMenu: () => void
}
```

---

## 스타일 방향

| 항목 | 내용 |
|------|------|
| 배경 | `#1a1a2e` (메인 화면과 동일) |
| 타이틀 | 큰 빨간색 텍스트 (`#ff4444`) |
| 버튼 | 기존 `MenuButton` 재사용 |

---

## 완료 기준

- [ ] 목숨이 0이 된 뒤 마지막 깜빡임이 끝나면 게임 오버 화면이 뜬다
- [ ] 다시 시작 클릭 시 목숨 3개로 Mission 1이 처음부터 시작된다
- [ ] 메인으로 클릭 시 메인 화면으로 돌아간다
