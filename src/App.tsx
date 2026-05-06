import { useState } from 'react'
import MainScreen from './screens/MainScreen'
import HowToScreen from './screens/HowToScreen'
import GameScreen from './screens/GameScreen'

// 이후 Phase에서 'gameover' | 'clear' 등이 추가된다
export type Screen = 'main' | 'howto' | 'game'

export default function App() {
  const [screen, setScreen] = useState<Screen>('main')

  if (screen === 'howto') {
    return <HowToScreen onBack={() => setScreen('main')} />
  }

  if (screen === 'game') {
    return <GameScreen onExit={() => setScreen('main')} />
  }

  return (
    <MainScreen
      onStart={() => setScreen('game')}
      onHowTo={() => setScreen('howto')}
      onQuit={() => window.close()}
    />
  )
}
