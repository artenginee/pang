import { useState } from 'react'
import MenuButton from '../components/MenuButton'
import '../styles/MainScreen.css'

interface MainScreenProps {
  onStart: () => void
  onHowTo: () => void
  onQuit: () => void
}

export default function MainScreen({ onStart, onHowTo, onQuit }: MainScreenProps) {
  const [quitFailed, setQuitFailed] = useState(false)

  function handleQuit() {
    onQuit()
    // window.close()가 브라우저 정책상 동작하지 않을 경우 안내 문구 표시
    setTimeout(() => setQuitFailed(true), 300)
  }

  return (
    <div className="main-screen">
      <h1 className="title">PANG</h1>
      <div className="menu">
        <MenuButton label="게임 시작" onClick={onStart} />
        <MenuButton label="게임 방법" onClick={onHowTo} />
        <MenuButton label="게임 종료" onClick={handleQuit} />
      </div>
      {quitFailed && (
        <p className="quit-message">브라우저 탭을 직접 닫아주세요.</p>
      )}
    </div>
  )
}
