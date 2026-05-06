# Phase 4 설계 — 플레이어 렌더링 + 이동

## 목표

게임 캔버스에 플레이어 캐릭터를 렌더링하고, `←` `→` 키로 좌우 이동을 구현한다.
캔버스 경계에서 이동이 멈춰야 한다.

---

## 설계 결정: Canvas 기반 렌더링

Phase 3의 `<div className="game-canvas">`를 `<canvas>` 요소로 교체한다.
이후 모든 게임 오브젝트(공, 작살, 이펙트)가 canvas에 그려지므로 지금 전환하는 것이 적합하다.

게임 루프는 `requestAnimationFrame`으로 구동한다.

---

## 플레이어 스펙

| 항목 | 값 |
|------|----|
| 크기 | 32 × 40px |
| 초기 위치 | 캔버스 하단 중앙 |
| 이동 속도 | 250px/s |
| 색상 | `#00e676` (임시 사각형) |

초기 x: `CANVAS_WIDTH / 2 - 16`
초기 y: `CANVAS_HEIGHT - 40 - 8` (바닥에서 8px 위)

---

## 파일 구조

```
src/
├── screens/GameScreen.tsx      ← canvas 렌더링 + 게임 루프
├── constants/game.ts           ← PLAYER_WIDTH, PLAYER_HEIGHT, PLAYER_SPEED 추가
```

---

## 구현 방식

### 키 입력
`keydown` / `keyup` 이벤트로 현재 눌린 키를 `useRef<Set<string>>`으로 추적한다.
`useState` 대신 `useRef`를 사용해 게임 루프 내 리렌더링을 방지한다.

### 게임 루프
```
requestAnimationFrame
  → delta 계산 (이전 프레임과의 시간 차)
  → 키 입력에 따라 player.x 갱신
  → 경계 클램핑 (0 ~ CANVAS_WIDTH - PLAYER_WIDTH)
  → canvas clearRect → 플레이어 사각형 fillRect
```

### GameScreen.tsx 구조
```tsx
const canvasRef = useRef<HTMLCanvasElement>(null)
const keysRef = useRef<Set<string>>(new Set())
const playerRef = useRef({ x: 초기X, y: 초기Y })

// 키 이벤트 등록
useEffect(() => {
  const onDown = (e) => keysRef.current.add(e.code)
  const onUp = (e) => keysRef.current.delete(e.code)
  window.addEventListener('keydown', onDown)
  window.addEventListener('keyup', onUp)
  return () => { ... 정리 }
}, [])

// 게임 루프
useEffect(() => {
  let rafId: number
  let last = performance.now()

  function loop(now: number) {
    const dt = (now - last) / 1000  // 초 단위
    last = now
    update(dt)
    render()
    rafId = requestAnimationFrame(loop)
  }
  rafId = requestAnimationFrame(loop)
  return () => cancelAnimationFrame(rafId)
}, [])
```

---

## 완료 기준

- [ ] 게임 캔버스에 플레이어(사각형)가 하단 중앙에 표시된다
- [ ] `←` 키를 누르는 동안 왼쪽으로 이동한다
- [ ] `→` 키를 누르는 동안 오른쪽으로 이동한다
- [ ] 캔버스 왼쪽/오른쪽 끝에서 더 이상 나가지 않는다
