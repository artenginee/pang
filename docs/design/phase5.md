# Phase 5 설계 — 공(버블) 등장 + 물리 동작

## 목표

게임 캔버스에 Large 공 2개를 등장시키고, 중력이 적용된 포물선 궤적으로 튀어 오르게 한다.
좌우 벽과 바닥에서 반사된다. 플레이어와의 충돌은 Phase 9에서 구현한다.

---

## 공 물리 스펙 (Large)

| 항목 | 값 |
|------|----|
| 반지름 | 40px |
| 수평 속도(vx) | ±120 px/s |
| 바닥 반사 속도(vy) | -600 px/s (위 방향) |
| 최대 도달 높이 | 약 360px (캔버스 60%) |
| 중력 가속도 | 500 px/s² |

---

## 초기 배치

| 공 | x | y | vx | vy |
|----|---|---|----|----|
| Ball 1 | 100 | CANVAS_HEIGHT - radius | +120 | -600 |
| Ball 2 | 380 | CANVAS_HEIGHT - radius | -120 | -600 |

---

## 파일 구조

```
src/
├── screens/GameScreen.tsx   ← 공 상태 추가, update/render 확장
├── constants/game.ts        ← 공 관련 상수 추가
```

---

## 데이터 구조

```ts
interface Ball {
  x: number
  y: number
  radius: number
  vx: number
  vy: number
}
```

`ballsRef`를 `useRef<Ball[]>`로 관리해 게임 루프 내 리렌더링을 방지한다.

---

## 물리 업데이트 로직

```
vy += GRAVITY * dt        // 중력 적용
x  += vx * dt
y  += vy * dt

// 바닥 반사
if (y + radius >= CANVAS_HEIGHT) {
  y  = CANVAS_HEIGHT - radius
  vy = -BALL_LARGE_BOUNCE_VY
}

// 좌벽 반사
if (x - radius <= 0) { x = radius; vx = -vx }

// 우벽 반사
if (x + radius >= CANVAS_WIDTH) { x = CANVAS_WIDTH - radius; vx = -vx }
```

---

## 완료 기준

- [ ] 게임 시작 시 Large 공 2개가 화면에 나타난다
- [ ] 공이 포물선을 그리며 위로 올라갔다 내려온다
- [ ] 바닥에 닿으면 위로 튀어 오른다
- [ ] 좌우 벽에 닿으면 수평 방향이 반전된다
