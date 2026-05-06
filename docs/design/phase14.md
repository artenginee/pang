# Phase 14 설계 — 아이템 드롭 + 획득

## 목표

공 제거 시 확률적으로 아이템이 바닥으로 떨어진다.
플레이어가 아이템에 닿으면 효과가 적용된다.

---

## 아이템 종류

| 아이템 | 효과 | 지속 시간 |
|--------|------|-----------|
| `clock` (시계) | 모든 공 일시 정지 | 5초 |
| `shield` (방어막) | 공 충돌 1회 무효 | 획득 즉시, 피격 시 소멸 |

---

## 아이템 동작 스펙

| 항목 | 값 |
|------|----|
| 드롭 확률 | 공 제거 시 40% |
| 낙하 속도 | 150 px/s |
| 화면 표시 크기 | 20 × 20px |
| 미획득 소멸 시간 | 8초 |

---

## 데이터 구조

```ts
type ItemType = 'clock' | 'shield'

interface Item {
  x: number
  y: number
  type: ItemType
  lifetime: number   // 남은 표시 시간 (8초부터 감소)
}
```

`itemsRef: useRef<Item[]>([])`

---

## 드롭 로직

공 소멸 시 (Small 포함):
```ts
if (Math.random() < ITEM_DROP_CHANCE) {
  const type = Math.random() < 0.5 ? 'clock' : 'shield'
  items.push({ x: hit.x, y: hit.y, type, lifetime: ITEM_LIFETIME })
}
```

---

## 업데이트 로직

```
// 낙하
item.y += ITEM_FALL_SPEED * dt
item.lifetime -= dt

// 바닥에 닿으면 정지
if (item.y + ITEM_SIZE >= CANVAS_HEIGHT) item.y = CANVAS_HEIGHT - ITEM_SIZE

// 소멸 시간 초과 제거
items = items.filter(i => i.lifetime > 0)

// 플레이어 충돌
아이템 박스와 플레이어 AABB 충돌
  → clock: freezeTimer = 5초
  → shield: shieldActive = true
  → 아이템 제거
```

---

## 효과 적용

### 시계 (clock)
```ts
const freezeTimerRef = useRef(0)

// 공 물리 업데이트를 freezeTimer > 0 일 때 skip
// freezeTimer 감소는 항상 진행
```

### 방어막 (shield)
```ts
const shieldActiveRef = useRef(false)

// 공 충돌 판정에서:
if (hit && shieldActiveRef.current) {
  shieldActiveRef.current = false  // 방어막 소멸
} else if (hit) {
  triggerDeath(false)
}

// 플레이어 렌더 시 방어막 시각화: 플레이어 주변 원형 테두리
```

---

## 렌더링

| 아이템 | 색상 | 텍스트 |
|--------|------|--------|
| clock  | `#00bcd4` 청록 | `⏱` |
| shield | `#ab47bc` 보라 | `🛡` |

소멸 3초 전부터 깜빡임 (lifetime < 3 && Math.floor(lifetime / 0.3) % 2 === 0)

---

## 파일 구조

```
src/
├── screens/GameScreen.tsx   ← 아이템 전체 로직 추가
├── constants/game.ts        ← 아이템 상수 추가
```

---

## 완료 기준

- [ ] 공 제거 시 약 40% 확률로 아이템이 떨어진다
- [ ] 시계 획득 시 공이 5초간 멈춘다
- [ ] 방어막 획득 시 플레이어 주변에 테두리가 생기고, 공에 닿아도 죽지 않는다
- [ ] 방어막은 1회 피격 후 사라진다
- [ ] 아이템은 8초 후 사라지며, 3초 전부터 깜빡인다
