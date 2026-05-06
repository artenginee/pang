# Phase 2 설계 — 게임 방법 화면

## 목표

메인 화면에서 "게임 방법" 버튼 클릭 시 조작법 안내 화면으로 전환한다.
키 조작 안내를 표시하고, "돌아가기" 버튼으로 메인 화면에 복귀한다.

---

## 화면 레이아웃

```
┌──────────────────────────────────────┐
│                                      │
│            게임 방법                  │  ← 섹션 타이틀
│                                      │
│   ┌──────────────────────────────┐   │
│   │  키       동작               │   │
│   │  ←        왼쪽 이동          │   │
│   │  →        오른쪽 이동        │   │
│   │  Space    작살 발사          │   │
│   └──────────────────────────────┘   │
│                                      │
│           [ 돌아가기 ]                │  ← 메인 화면 복귀 버튼
│                                      │
└──────────────────────────────────────┘
```

---

## 파일 구조

```
src/
├── App.tsx                      ← Screen 타입에 'howto' 추가, 화면 전환 로직
├── screens/
│   ├── MainScreen.tsx           ← 변경 없음
│   └── HowToScreen.tsx          ← 신규
└── styles/
    └── HowToScreen.css          ← 신규
```

---

## 컴포넌트 설계

### App.tsx 변경

`Screen` 타입에 `'howto'` 추가, `useState`로 현재 화면 관리.

```tsx
export type Screen = 'main' | 'howto'

export default function App() {
  const [screen, setScreen] = useState<Screen>('main')

  if (screen === 'howto') {
    return <HowToScreen onBack={() => setScreen('main')} />
  }

  return (
    <MainScreen
      onStart={() => console.log('게임 시작')}
      onHowTo={() => setScreen('howto')}
      onQuit={() => window.close()}
    />
  )
}
```

### HowToScreen.tsx

```tsx
interface HowToScreenProps {
  onBack: () => void
}
```

**렌더링 구조:**
```tsx
<div className="howto-screen">
  <h2 className="howto-title">게임 방법</h2>
  <table className="controls-table">
    <tbody>
      <tr><td>←</td><td>왼쪽 이동</td></tr>
      <tr><td>→</td><td>오른쪽 이동</td></tr>
      <tr><td>Space</td><td>작살 발사</td></tr>
    </tbody>
  </table>
  <MenuButton label="돌아가기" onClick={onBack} />
</div>
```

---

## 스타일 방향

| 항목 | 내용 |
|------|------|
| 배경 | 메인 화면과 동일한 `#1a1a2e` |
| 타이틀 | 메인 화면 타이틀보다 작은 크기 |
| 조작 테이블 | 키와 설명을 두 열로 구분, 테두리 있는 셀 |
| 버튼 | Phase 1의 `MenuButton` 재사용 |

---

## 완료 기준

- [ ] 메인에서 "게임 방법" 클릭 시 안내 화면으로 전환된다
- [ ] ← / → / Space 키 설명이 표시된다
- [ ] "돌아가기" 클릭 시 메인 화면으로 돌아간다
