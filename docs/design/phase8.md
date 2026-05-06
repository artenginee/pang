# Phase 8 설계 — 작살-공 충돌 + 분열

## 목표

작살이 공에 닿으면 공을 제거하고 분열시킨다.
분열된 공은 좌우로 퍼지며 독립적으로 물리 동작한다.
모든 공이 사라지면 콘솔 로그로 확인 (클리어 화면은 Phase 12에서 구현).

---

## 분열 규칙

| 피격 크기 | 결과 |
|-----------|------|
| Large | Medium × 2 (좌/우) |
| Medium | Small × 2 (좌/우) |
| Small | 완전 소멸 |

분열된 공의 초기 상태:
- x: 부모 공의 x
- y: 부모 공의 y
- vx: ±BALL_PROPS[newSize].vx (왼쪽 자식 음수, 오른쪽 자식 양수)
- vy: -BALL_PROPS[newSize].bounceVy (위 방향으로 시작)

---

## 초기 공 배치 변경

Phase 6 테스트용 배치(Large/Medium/Small 혼합) → Mission 1 정식 배치로 교체
- Large 공 2개 (x=100, x=380)

---

## 충돌 감지

작살은 수직 선분 (x=h.x, y: h.tipY ~ h.baseY), 공은 원(circle).

```
수직 선분과 원의 충돌:
  clampedY = clamp(ball.y, h.tipY, h.baseY)
  dx = ball.x - h.x
  dy = ball.y - clampedY
  dist = sqrt(dx² + dy²)
  충돌 조건: dist <= ball.radius
```

---

## 파일 구조

```
src/
├── screens/GameScreen.tsx   ← 충돌 감지, 분열 로직 추가
├── constants/game.ts        ← NEXT_SIZE 룩업 테이블 추가
```

---

## 로직

```ts
// constants/game.ts
export const NEXT_SIZE: Record<BallSize, BallSize | null> = {
  large: 'medium',
  medium: 'small',
  small: null,
}
```

```
update() 내 충돌 처리:
  harpoon이 없으면 skip

  충돌한 ball 인덱스 탐색
    → 충돌 ball 제거, harpoon 제거
    → nextSize가 있으면 분열 공 2개 추가
```

배열 순회 중 변경을 피하기 위해 루프 후 일괄 적용한다.

---

## 완료 기준

- [ ] 작살이 Large에 닿으면 Medium 2개로 분열된다
- [ ] 작살이 Medium에 닿으면 Small 2개로 분열된다
- [ ] 작살이 Small에 닿으면 완전히 사라진다
- [ ] 분열된 공이 각각 독립적으로 좌우로 튀어다닌다
- [ ] 모든 공이 소멸되면 콘솔에 "스테이지 클리어" 가 출력된다
