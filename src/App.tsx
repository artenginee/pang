import MainScreen from './screens/MainScreen'

// Screen 타입은 이후 Phase에서 'game' | 'howto' 등으로 확장된다
export type Screen = 'main'

export default function App() {
  return (
    <MainScreen
      onStart={() => console.log('게임 시작')}
      onHowTo={() => console.log('게임 방법')}
      onQuit={() => window.close()}
    />
  )
}
