import { useEffect, useRef } from 'react'
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_SPEED,
} from '../constants/game'
import '../styles/GameScreen.css'

interface GameScreenProps {
  onExit: () => void
}

export default function GameScreen({ onExit: _onExit }: GameScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const keysRef = useRef<Set<string>>(new Set())
  const playerRef = useRef({
    x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2,
    y: CANVAS_HEIGHT - PLAYER_HEIGHT - 8,
  })

  // 키 입력 등록
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => keysRef.current.add(e.code)
    const onUp = (e: KeyboardEvent) => keysRef.current.delete(e.code)
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
    }
  }, [])

  // 게임 루프
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let rafId: number
    let last = performance.now()

    function update(dt: number) {
      const player = playerRef.current
      const keys = keysRef.current

      if (keys.has('ArrowLeft')) {
        player.x = Math.max(0, player.x - PLAYER_SPEED * dt)
      }
      if (keys.has('ArrowRight')) {
        player.x = Math.min(CANVAS_WIDTH - PLAYER_WIDTH, player.x + PLAYER_SPEED * dt)
      }
    }

    function render() {
      ctx!.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // 플레이어
      const player = playerRef.current
      ctx!.fillStyle = '#00e676'
      ctx!.fillRect(player.x, player.y, PLAYER_WIDTH, PLAYER_HEIGHT)
    }

    function loop(now: number) {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      update(dt)
      render()
      rafId = requestAnimationFrame(loop)
    }

    rafId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafId)
  }, [])

  return (
    <div className="game-wrapper">
      <div className="game-container">
        <div className="hud">
          <span>SCORE: 0</span>
          <span>♥ ♥ ♥</span>
          <span>TIME: 60</span>
        </div>
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="game-canvas"
        />
      </div>
    </div>
  )
}
