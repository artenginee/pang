import { useState } from 'react'
import MainScreen from './screens/MainScreen'
import HowToScreen from './screens/HowToScreen'

// 이후 Phase에서 'game' 등이 추가된다
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
