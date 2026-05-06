# Phase 7 설계 — 작살(Harpoon) 발사

## 목표

`Space` 키로 작살을 발사한다. 작살은 플레이어 중앙에서 위로 뻗어 올라가며
천장(y=0)에 닿으면 사라진다. 작살이 살아있는 동안 재발사는 불가능하다.
공과의 충돌은 Phase 8에서 처리한다.

---

## 작살 동작 스펙

| 항목 | 값 |
|------|----|
| 발사 키 | `Space` |
| 발사 위치 x | 플레이어 중앙 (player.x + PLAYER_WIDTH / 2) |
| 발사 위치 y (base) | 플레이어 상단 (player.y) |
| 끝단(tip) 이동 속도 | 800 px/s (위 방향) |
| 소멸 조건 | tip이 y ≤ 0 (천장) 도달 |
| 동시 발사 제한 | 1개. 활성 상태면 Space 무시 |

---

## 데이터 구조

```ts
interface Harpoon {
  x: number      // 수평 위치 (발사 시 고정)
  tipY: number   // 작살 끝단 y (위로 이동)
  baseY: number  // 작살 밑단 y (플레이어 상단, 고정)
}
```

`harpoonRef`를 `useRef<Harpoon | null>`로 관리한다.

---

## 파일 구조

```
src/
├── screens/GameScreen.tsx   ← 작살 발사/업데이트/렌더 추가
├── constants/game.ts        ← HARPOON_SPEED 추가
```

---

## 로직

### 발사
```
Space 키 감지 & harpoonRef.current === null
  → harpoon 생성:
    x      = player.x + PLAYER_WIDTH / 2
    tipY   = player.y
    baseY  = player.y
```

### 업데이트
```
tipY -= HARPOON_SPEED * dt

tipY <= 0
  → harpoonRef.current = null  (소멸)
```

### 렌더
```
ctx.strokeStyle = '#ffffff'
ctx.lineWidth = 3
ctx.beginPath()
ctx.moveTo(harpoon.x, harpoon.baseY)
ctx.lineTo(harpoon.x, harpoon.tipY)
ctx.stroke()
```

---

## 완료 기준

- [ ] `Space`를 누르면 플레이어 위로 흰색 선이 빠르게 뻗어 오른다
- [ ] 천장에 닿으면 작살이 사라진다
- [ ] 작살이 살아있는 동안 `Space`를 눌러도 추가 발사가 안 된다
