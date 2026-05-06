import { useState } from 'react'
import MainScreen from './screens/MainScreen'
import HowToScreen from './screens/HowToScreen'
import GameScreen from './screens/GameScreen'
import GameOverScreen from './screens/GameOverScreen'
import ClearScreen from './screens/ClearScreen'

export type Screen = 'main' | 'howto' | 'game' | 'gameover' | 'clear'

interface ClearResult {
  score: number
  timeBonus: number
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('main')
  const [hiScore, setHiScore] = useState(0)
  const [clearResult, setClearResult] = useState<ClearResult>({ score: 0, timeBonus: 0 })

  function handleClear(result: ClearResult) {
    const total = result.score + result.timeBonus
    if (total > hiScore) setHiScore(total)
    setClearResult(result)
    setScreen('clear')
  }

  if (screen === 'howto') {
    return <HowToScreen onBack={() => setScreen('main')} />
  }

  if (screen === 'game') {
    return (
      <GameScreen
        onExit={() => setScreen('main')}
        onGameOver={() => setScreen('gameover')}
        onClear={handleClear}
      />
    )
  }

  if (screen === 'gameover') {
    return (
      <GameOverScreen
        onRestart={() => setScreen('game')}
        onMainMenu={() => setScreen('main')}
      />
    )
  }

  if (screen === 'clear') {
    return (
      <ClearScreen
        score={clearResult.score}
        timeBonus={clearResult.timeBonus}
        onRestart={() => setScreen('game')}
        onMainMenu={() => setScreen('main')}
      />
    )
  }

  return (
    <MainScreen
      hiScore={hiScore}
      onStart={() => setScreen('game')}
      onHowTo={() => setScreen('howto')}
      onQuit={() => window.close()}
    />
  )
}
