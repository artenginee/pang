# Phase 9 설계 — 플레이어-공 충돌 + 사망 처리

## 목표

플레이어와 공이 겹치면 사망 판정을 내린다.
사망 시 목숨 1 차감, 플레이어가 2초간 깜빡이며(무적), 이후 정상 복귀한다.
HUD의 목숨 표시가 실시간으로 갱신된다.

---

## 사망 처리 흐름

```
플레이어-공 충돌 감지 (무적 상태가 아닐 때)
  → lives--
  → 플레이어 중앙 하단으로 위치 초기화
  → invincibleTimer = INVINCIBLE_DURATION (2초)
  → 타이머 동안 플레이어 깜빡임 (0.1초 주기)
  → 타이머 종료 → 정상 상태 복귀
```

---

## 상수

| 상수 | 값 | 설명 |
|------|----|------|
| `PLAYER_LIVES` | 3 | 초기 목숨 수 |
| `INVINCIBLE_DURATION` | 2.0 (초) | 사망 후 무적 시간 |

---

## 충돌 감지: AABB-원 충돌

플레이어는 사각형, 공은 원이므로 사각형과 원의 충돌로 판정한다.

```ts
// 사각형 위의 원 중심과 가장 가까운 점
closestX = clamp(ball.x, player.x, player.x + PLAYER_WIDTH)
closestY = clamp(ball.y, player.y, player.y + PLAYER_HEIGHT)

dx = ball.x - closestX
dy = ball.y - closestY

충돌 조건: dx² + dy² <= radius²
```

---

## 상태 관리

게임 루프용 ref와 HUD 렌더링용 useState를 분리한다.

```ts
const livesRef = useRef(PLAYER_LIVES)          // 게임 루프 내 즉시 접근
const [lives, setLives] = useState(PLAYER_LIVES) // HUD 리렌더링용
const invincibleTimerRef = useRef(0)
```

사망 발생 시:
```ts
livesRef.current--
setLives(livesRef.current)   // HUD 갱신
invincibleTimerRef.current = INVINCIBLE_DURATION
// 플레이어 위치 초기화
```

---

## 깜빡임 효과

```ts
// 무적 중 0.1초 주기로 렌더 토글
const blink = Math.floor(invincibleTimerRef.current / 0.1) % 2 === 0
if (blink 또는 무적 아님) { 플레이어 렌더 }
```

---

## 파일 구조

```
src/
├── screens/GameScreen.tsx   ← 충돌 감지, 사망 처리, 깜빡임, HUD 목숨 연동
├── constants/game.ts        ← PLAYER_LIVES, INVINCIBLE_DURATION 추가
```

---

## 완료 기준

- [ ] 공이 플레이어에 닿으면 깜빡임이 시작된다
- [ ] HUD의 목숨 수가 1 줄어든다
- [ ] 깜빡이는 동안 공에 닿아도 추가 사망이 발생하지 않는다
- [ ] 2초 후 정상 상태로 복귀한다
