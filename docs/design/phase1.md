# Phase 1 설계 — 메인 화면

## 목표

브라우저에서 게임을 처음 열었을 때 보이는 메인 화면을 구현한다.
타이틀과 3개의 메뉴 버튼(게임 시작 / 게임 방법 / 게임 종료)이 표시되며, 각 버튼은 클릭 시 정해진 동작을 수행한다.

---

## 화면 레이아웃

```
┌──────────────────────────────────────┐
│                                      │
│                                      │
│               PANG                   │  ← 타이틀 (대형 텍스트)
│                                      │
│                                      │
│           [ 게임 시작 ]               │  ← 버튼 1
│           [ 게임 방법 ]               │  ← 버튼 2
│           [ 게임 종료 ]               │  ← 버튼 3
│                                      │
│                                      │
└──────────────────────────────────────┘
```

- 전체 화면을 꽉 채우는 단일 페이지
- 콘텐츠는 수직/수평 중앙 정렬
- 타이틀과 버튼 그룹 사이에 충분한 간격

---

## 파일 구조

```
src/
├── App.tsx                  ← 화면 전환 상태 관리 (현재는 'main'만 존재)
├── screens/
│   └── MainScreen.tsx       ← 메인 화면 컴포넌트
├── components/
│   └── MenuButton.tsx       ← 공통 메뉴 버튼 컴포넌트
└── styles/
    ├── MainScreen.css
    └── MenuButton.css
```

---

## 컴포넌트 설계

### App.tsx

화면 전환의 진입점. 현재 어떤 화면을 보여줄지 상태로 관리한다.
Phase 1에서는 `'main'` 상태만 존재하며, 이후 Phase에서 `'game'` | `'howto'` 등이 추가된다.

```tsx
type Screen = 'main'  // 이후 Phase에서 확장

export default function App() {
  const [screen, setScreen] = useState<Screen>('main')

  return (
    <MainScreen
      onStart={() => {/* Phase 3에서 연결 */}}
      onHowTo={() => {/* Phase 2에서 연결 */}}
      onQuit={() => window.close()}
    />
  )
}
```

---

### MainScreen.tsx

메인 화면 전체를 담당하는 컴포넌트.

```tsx
interface MainScreenProps {
  onStart: () => void
  onHowTo: () => void
  onQuit: () => void
}
```

**렌더링 구조:**
```tsx
<div className="main-screen">
  <h1 className="title">PANG</h1>
  <div className="menu">
    <MenuButton label="게임 시작" onClick={onStart} />
    <MenuButton label="게임 방법" onClick={onHowTo} />
    <MenuButton label="게임 종료" onClick={onQuit} />
  </div>
</div>
```

---

### MenuButton.tsx

메뉴에서 반복 사용되는 버튼 컴포넌트.

```tsx
interface MenuButtonProps {
  label: string
  onClick: () => void
}
```

- `<button>` 태그 사용
- hover 시 색상/크기 변화로 강조
- 키보드 접근성 유지 (기본 button 동작)

---

## 버튼 동작 정의

| 버튼 | Phase 1 동작 | 이후 연결 |
|------|-------------|-----------|
| 게임 시작 | 클릭 시 콘솔 로그 출력 (`"게임 시작"`) | Phase 3에서 게임 화면으로 전환 |
| 게임 방법 | 클릭 시 콘솔 로그 출력 (`"게임 방법"`) | Phase 2에서 안내 화면으로 전환 |
| 게임 종료 | `window.close()` 호출. 브라우저 정책상 닫히지 않으면 안내 문구 표시 | 변경 없음 |

> **게임 종료 처리 방침**: `window.close()`는 브라우저 보안 정책에 따라 동작하지 않을 수 있다.
> 동작하지 않을 경우 화면에 "브라우저 탭을 직접 닫아주세요." 텍스트를 잠시 표시한다.

---

## 스타일 방향

| 항목 | 내용 |
|------|------|
| 배경 | 어두운 단색 (`#1a1a2e` 계열) |
| 타이틀 폰트 | 크고 굵은 sans-serif, 밝은 색상 (흰색 또는 노란색) |
| 버튼 기본 | 테두리만 있는 outline 스타일, 배경 투명 |
| 버튼 hover | 배경색 채워지며 텍스트 색상 반전 |
| 버튼 간격 | 버튼 사이 `16px` 간격, 세로 나열 |
| 전체 정렬 | `flexbox`, `justify-content: center`, `align-items: center` |

---

## 구현 순서

1. `src/screens/`, `src/components/`, `src/styles/` 디렉토리 생성
2. `MenuButton.tsx` + `MenuButton.css` 구현
3. `MainScreen.tsx` + `MainScreen.css` 구현
4. `App.tsx`에서 `MainScreen` 렌더링으로 교체
5. 브라우저에서 레이아웃 및 버튼 hover 확인
6. 게임 종료 버튼 동작 확인

---

## 완료 기준

- [ ] 브라우저 실행 시 PANG 타이틀과 버튼 3개가 보인다
- [ ] 버튼에 마우스를 올리면 시각적 강조가 된다
- [ ] 게임 시작 / 게임 방법 버튼 클릭 시 브라우저 콘솔에 로그가 출력된다
- [ ] 게임 종료 버튼이 동작하거나 안내 문구가 표시된다
