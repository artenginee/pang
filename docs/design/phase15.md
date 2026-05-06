# Phase 15 설계 — 추가 무기 (Wire / Double Harpoon)

## 목표

아이템 드롭으로 무기를 교체한다.
Wire는 빠르게 뻗었다 사라지며 연사가 가능하고,
Double Harpoon은 좌우 두 줄을 동시에 발사한다.

---

## 무기 스펙

| 무기 | 발사 속도 | 자동 소멸 | 연사 |
|------|-----------|-----------|------|
| Harpoon (기본) | 800 px/s | 천장 도달 시 | 불가 (1발 제한) |
| Wire | 1200 px/s | 0.2초 후 또는 천장 | 가능 (Space-up 감지) |
| Double Harpoon | 800 px/s | 천장 도달 시 | 불가 (2발 동시, 모두 소멸 후) |

---

## 발사 위치

| 무기 | 발사 x |
|------|--------|
| Harpoon | 플레이어 중앙 |
| Wire | 플레이어 중앙 |
| Double | 플레이어 좌측 끝 + 우측 끝 |

---

## 구조 변경: Harpoon → Projectile 배열

단일 `harpoonRef` 대신 `projectilesRef: Projectile[]` 배열로 교체한다.
Wire는 여러 발이 동시에 활성화될 수 있고, Double은 2발이 동시에 존재한다.

```ts
interface Projectile {
  x: number
  tipY: number
  baseY: number
  speed: number
  lifetime: number | null  // null = 천장까지, number = 자동 소멸 타이머
}
```

### "발사 가능" 조건

| 무기 | 조건 |
|------|------|
| Harpoon / Double | `projectilesRef.current.length === 0` |
| Wire | 항상 가능 (Space-up 감지만 적용) |

---

## 아이템 확장

기존 `clock` / `shield`에 `wire` / `double` 추가.
드롭 시 4가지 중 균등 확률(25%)로 결정.

| 아이템 | 색상 | 레이블 |
|--------|------|--------|
| clock  | `#00bcd4` | ⏱ |
| shield | `#ab47bc` | 🛡 |
| wire   | `#ff9800` | ⚡ |
| double | `#4caf50` | ✦ |

---

## 무기 초기화

- 사망(`triggerDeath`) 시 무기를 `'harpoon'`으로 리셋한다.

---

## 파일 구조

```
src/
├── screens/GameScreen.tsx   ← Projectile 배열, 무기 상태, 발사 로직 전면 리팩토링
├── constants/game.ts        ← WeaponType, WIRE_SPEED, WIRE_LIFETIME 추가, ItemType 확장
```

---

## 완료 기준

- [ ] ⚡ 아이템 획득 → Wire로 교체, Space 연타 시 빠르게 여러 발 발사 가능
- [ ] ✦ 아이템 획득 → Double로 교체, Space 한 번에 좌우 두 줄 동시 발사
- [ ] 사망 시 무기가 Harpoon으로 초기화된다
- [ ] HUD 또는 방어막 아이콘 옆에 현재 무기가 표시된다
