# Phase 11 설계 — 제한 시간 + 타임오버

## 목표

60초 카운트다운 타이머를 구현한다.
타이머가 0이 되면 목숨 1 차감 후 스테이지(공 + 플레이어)를 처음부터 재시작한다.
목숨이 없으면 기존 게임 오버 흐름으로 연결된다.

---

## Phase 9 사망과의 차이

| 구분 | 공 상태 | 타이머 |
|------|---------|--------|
| 공 충돌 사망 (Phase 9) | 유지 (공 그대로) | 유지 |
| 타임오버 (Phase 11) | 초기화 (Large×2 재배치) | 60초로 리셋 |

---

## 타임오버 처리 흐름

```
timerRef가 0에 도달 (무적 중 아닐 때)
  → lives--
  → 공 초기화 (initialBalls())
  → 작살 제거
  → 플레이어 위치 초기화
  → timerRef = STAGE_TIME (60초 리셋)
  → invincibleTimer = INVINCIBLE_DURATION (깜빡임)
  → 무적 종료 + lives === 0 → 게임 오버 (기존 로직 재사용)
```

---

## HUD 타이머 갱신

게임 루프에서 매 프레임 setState를 호출하면 비용이 크다.
표시 초(ceil 값)가 바뀔 때만 `setDisplayTime`을 호출해 리렌더링을 최소화한다.

```ts
const currentSecond = Math.ceil(timerRef.current)
if (currentSecond !== lastDisplaySecondRef.current) {
  lastDisplaySecondRef.current = currentSecond
  setDisplayTime(currentSecond)
}
```

---

## 파일 구조

```
src/
├── screens/GameScreen.tsx   ← 타이머 ref, 타임오버 처리, HUD 연동
├── constants/game.ts        ← STAGE_TIME 추가
```

---

## 완료 기준

- [ ] HUD에 60부터 0까지 카운트다운이 표시된다
- [ ] 0초가 되면 목숨이 차감되고 공이 초기 배치로 리셋된다
- [ ] 타임오버로 목숨이 0이 되면 게임 오버 화면이 뜬다
- [ ] 무적 중에는 타이머가 멈춘다
