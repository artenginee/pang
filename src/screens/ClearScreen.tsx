import MenuButton from '../components/MenuButton'
import '../styles/ClearScreen.css'

interface ClearScreenProps {
  score: number
  timeBonus: number
  onRestart: () => void
  onMainMenu: () => void
}

export default function ClearScreen({ score, timeBonus, onRestart, onMainMenu }: ClearScreenProps) {
  const total = score + timeBonus

  return (
    <div className="clear-screen fade-in">
      <h1 className="clear-title">STAGE CLEAR!</h1>
      <div className="clear-score">
        <div className="score-row">
          <span className="score-label">SCORE</span>
          <span className="score-value">{score.toLocaleString()}</span>
        </div>
        <div className="score-row">
          <span className="score-label">TIME BONUS</span>
          <span className="score-value">+{timeBonus.toLocaleString()}</span>
        </div>
        <div className="score-divider" />
        <div className="score-row total">
          <span className="score-label">TOTAL</span>
          <span className="score-value">{total.toLocaleString()}</span>
        </div>
      </div>
      <div className="clear-menu">
        <MenuButton label="다시 시작" onClick={onRestart} />
        <MenuButton label="메인으로"  onClick={onMainMenu} />
      </div>
    </div>
  )
}
