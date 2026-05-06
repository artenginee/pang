import MenuButton from '../components/MenuButton'
import '../styles/GameOverScreen.css'

interface GameOverScreenProps {
  onRestart: () => void
  onMainMenu: () => void
}

export default function GameOverScreen({ onRestart, onMainMenu }: GameOverScreenProps) {
  return (
    <div className="gameover-screen">
      <h1 className="gameover-title">GAME OVER</h1>
      <div className="gameover-menu">
        <MenuButton label="다시 시작" onClick={onRestart} />
        <MenuButton label="메인으로"  onClick={onMainMenu} />
      </div>
    </div>
  )
}
