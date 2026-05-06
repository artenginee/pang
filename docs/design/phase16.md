# Phase 16 설계 — 시각 효과 + 전체 완성도

## 목표

공 소멸 시 파티클 폭발 이펙트를 추가하고, 게임 배경을 후지산 분위기로 개선한다.
전체 화면 전환에 페이드 애니메이션을 적용해 완성도를 높인다.

---

## 1. 파티클 폭발 이펙트

공이 작살에 맞아 소멸/분열할 때 파티클이 사방으로 퍼진다.

```ts
interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  color: string
  life: number      // 남은 수명 (초)
  maxLife: number   // 총 수명
}
```

| 항목 | 값 |
|------|----|
| 파티클 수 | 공 크기별: Large 12개, Medium 8개, Small 5개 |
| 속도 | 60~200 px/s (랜덤 방향) |
| 수명 | 0.4초 |
| 색상 | 피격 공의 색상 |
| 렌더 | 수명에 비례해 alpha 감소, 반지름 축소 |

---

## 2. 게임 배경 개선

단색 `#16213e` → 하늘 그라데이션 + 땅 + 산 실루엣

```
┌────────────────────────┐  ← 하늘 (그라데이션: 진파랑 → 하늘파랑)
│                        │
│         △              │  ← 후지산 실루엣 (삼각형, 흰 정상)
│        △△△             │
│       △△△△△            │
├────────────────────────┤  ← 지평선
│  땅 (짙은 초록)        │  ← 높이 40px
└────────────────────────┘
```

---

## 3. 화면 전환 페이드

모든 screen 컨테이너에 CSS `fade-in` 애니메이션 적용.

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
.fade-in {
  animation: fadeIn 0.3s ease;
}
```

`MainScreen`, `HowToScreen`, `GameOverScreen`, `ClearScreen` 루트 div에 `fade-in` 클래스 추가.

---

## 파일 구조

```
src/
├── screens/GameScreen.tsx   ← 파티클 시스템, 배경 렌더
├── styles/global.css        ← fadeIn 키프레임 (신규)
├── styles/MainScreen.css    ← fade-in 클래스 추가
├── styles/HowToScreen.css   ← fade-in 클래스 추가
├── styles/GameOverScreen.css← fade-in 클래스 추가
├── styles/ClearScreen.css   ← fade-in 클래스 추가
└── main.tsx                 ← global.css import
```

---

## 완료 기준

- [ ] 공이 소멸할 때 색상 파티클이 사방으로 튀어나온다
- [ ] 게임 배경에 하늘 그라데이션과 산 실루엣이 표시된다
- [ ] 화면 전환 시 부드러운 페이드 인 효과가 적용된다
