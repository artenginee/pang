import '../styles/GameScreen.css'

interface GameScreenProps {
  onExit: () => void
}

export default function GameScreen({ onExit: _onExit }: GameScreenProps) {
  return (
    <div className="game-wrapper">
      <div className="game-container">
        <div className="hud">
          <span>SCORE: 0</span>
          <span>♥ ♥ ♥</span>
          <span>TIME: 60</span>
        </div>
        <div className="game-canvas" />
      </div>
    </div>
  )
}
