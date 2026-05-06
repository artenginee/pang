# Phase 13 설계 — 점수 시스템

## 목표

공 제거 시 크기별 점수를 부여하고 HUD에 실시간으로 표시한다.
스테이지 클리어 시 잔여 시간 보너스를 계산해 클리어 화면에 노출한다.
세션 내 최고 점수(HI-SCORE)를 메인 화면에 표시한다.

---

## 점수 테이블

| 공 크기 | 점수 |
|---------|------|
| Large   | 30점 |
| Medium  | 50점 |
| Small   | 100점 |

타임 보너스: `Math.floor(남은 시간) × 10점`

---

## 데이터 흐름

```
GameScreen
  scoreRef (게임 루프용)
  useState(score) → HUD 갱신

공 소멸 시
  scoreRef += SCORE_TABLE[hit.size]
  setScore(scoreRef.current)

클리어 시
  timeBonus = Math.floor(timerRef.current) × TIME_BONUS_PER_SEC
  onClear({ score, timeBonus })

App
  hiScore state → 클리어/게임오버 후 갱신
  MainScreen에 hiScore 전달
  ClearScreen에 score, timeBonus 전달
```

---

## 파일 구조

```
src/
├── App.tsx                  ← hiScore state, clearData state 관리
├── screens/
│   ├── GameScreen.tsx       ← scoreRef, 점수 계산, onClear 페이로드 변경
│   ├── ClearScreen.tsx      ← score, timeBonus props 추가 및 표시
│   └── MainScreen.tsx       ← hiScore props 추가 및 표시
└── constants/game.ts        ← SCORE_TABLE, TIME_BONUS_PER_SEC 추가
```

---

## 인터페이스 변경

### GameScreen
```ts
onClear: (result: { score: number; timeBonus: number }) => void
```

### ClearScreen
```ts
interface ClearScreenProps {
  score: number
  timeBonus: number
  onRestart: () => void
  onMainMenu: () => void
}
```

### MainScreen
```ts
interface MainScreenProps {
  hiScore: number
  onStart: () => void
  onHowTo: () => void
  onQuit: () => void
}
```

---

## 클리어 화면 레이아웃

```
STAGE CLEAR!

SCORE     :  1,200
TIME BONUS:  +  450
─────────────────
TOTAL     :  1,650

[ 다시 시작 ]
[ 메인으로  ]
```

---

## 완료 기준

- [ ] 공 제거 시 HUD 점수가 크기에 따라 증가한다
- [ ] 클리어 화면에 SCORE / TIME BONUS / TOTAL이 표시된다
- [ ] 메인 화면에 HI-SCORE가 표시된다
- [ ] 더 높은 점수 달성 시 HI-SCORE가 갱신된다
