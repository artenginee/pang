import MenuButton from '../components/MenuButton'
import '../styles/ClearScreen.css'

interface ClearScreenProps {
  onRestart: () => void
  onMainMenu: () => void
}

export default function ClearScreen({ onRestart, onMainMenu }: ClearScreenProps) {
  return (
    <div className="clear-screen">
      <h1 className="clear-title">STAGE CLEAR!</h1>
      <div className="clear-menu">
        <MenuButton label="다시 시작" onClick={onRestart} />
        <MenuButton label="메인으로"  onClick={onMainMenu} />
      </div>
    </div>
  )
}
