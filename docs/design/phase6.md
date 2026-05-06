# Phase 6 설계 — 공 크기별 속도 / 높이 차이

## 목표

Large / Medium / Small 3가지 크기의 공을 동시에 화면에 띄워 크기별 차이를 확인한다.
분열 로직은 Phase 8에서 구현한다.

---

## 크기별 공 스펙

| 크기 | 반지름 | 수평 속도(vx) | 바닥 반사 속도(vy) | 최대 높이 | 색상 |
|------|--------|--------------|-------------------|-----------|------|
| Large  | 40px | ±120 px/s | 600 px/s | ~360px (60%) | `#ff6b35` 주황 |
| Medium | 26px | ±160 px/s | 480 px/s | ~230px (38%) | `#ff4081` 분홍 |
| Small  | 16px | ±220 px/s | 350 px/s | ~122px (20%) | `#ffeb3b` 노랑 |

최대 높이 = bounceVy² / (2 × GRAVITY)

---

## 파일 구조

```
src/
├── screens/GameScreen.tsx   ← Ball 타입 확장, 크기별 초기 배치
├── constants/game.ts        ← BALL_PROPS 룩업 테이블 추가
```

---

## 데이터 구조

### BallSize 타입 및 BALL_PROPS

```ts
export type BallSize = 'large' | 'medium' | 'small'

export const BALL_PROPS: Record<BallSize, {
  radius: number
  vx: number
  bounceVy: number
  color: string
}> = {
  large:  { radius: 40, vx: 120, bounceVy: 600, color: '#ff6b35' },
  medium: { radius: 26, vx: 160, bounceVy: 480, color: '#ff4081' },
  small:  { radius: 16, vx: 220, bounceVy: 350, color: '#ffeb3b' },
}
```

### Ball 인터페이스 확장

```ts
interface Ball {
  x: number
  y: number
  size: BallSize
  vx: number
  vy: number
}
// radius, bounceVy, color 는 BALL_PROPS[ball.size] 에서 조회
```

---

## Phase 6 초기 배치 (테스트용)

| 공 | 크기 | x | vx |
|----|------|---|----|
| Ball 1 | large  | 80  | +120 |
| Ball 2 | medium | 240 | +160 |
| Ball 3 | small  | 400 | -220 |

---

## 완료 기준

- [ ] Large / Medium / Small 공이 크기와 색상으로 구분되어 보인다
- [ ] Large가 가장 높이 튀고 Small이 가장 낮게 튄다
- [ ] Small이 가장 빠르게 움직이고 Large가 가장 느리다
