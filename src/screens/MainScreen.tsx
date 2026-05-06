import { useState } from 'react'
import MenuButton from '../components/MenuButton'
import '../styles/MainScreen.css'

interface MainScreenProps {
  hiScore: number
  onStart: () => void
  onHowTo: () => void
  onQuit: () => void
}

export default function MainScreen({ hiScore, onStart, onHowTo, onQuit }: MainScreenProps) {
  const [quitFailed, setQuitFailed] = useState(false)

  function handleQuit() {
    onQuit()
    setTimeout(() => setQuitFailed(true), 300)
  }

  return (
    <div className="main-screen fade-in">
      <h1 className="title">PANG</h1>
      <p className="hi-score">HI-SCORE: {hiScore.toLocaleString()}</p>
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
