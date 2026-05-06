import { useEffect, useRef } from 'react'
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_SPEED,
  GRAVITY,
  BALL_PROPS,
  type BallSize,
} from '../constants/game'
import '../styles/GameScreen.css'

interface Ball {
  x: number
  y: number
  size: BallSize
  vx: number
  vy: number
}

function makeBall(x: number, size: BallSize, vx: number): Ball {
  const { bounceVy, radius } = BALL_PROPS[size]
  return { x, y: CANVAS_HEIGHT - radius, size, vx, vy: -bounceVy }
}

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

  const ballsRef = useRef<Ball[]>([
    makeBall(80,  'large',  120),
    makeBall(240, 'medium', 160),
    makeBall(400, 'small', -220),
  ])

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

      for (const ball of ballsRef.current) {
        const { radius, bounceVy } = BALL_PROPS[ball.size]

        ball.vy += GRAVITY * dt
        ball.x += ball.vx * dt
        ball.y += ball.vy * dt

        if (ball.y + radius >= CANVAS_HEIGHT) {
          ball.y = CANVAS_HEIGHT - radius
          ball.vy = -bounceVy
        }
        if (ball.x - radius <= 0) {
          ball.x = radius
          ball.vx = Math.abs(ball.vx)
        }
        if (ball.x + radius >= CANVAS_WIDTH) {
          ball.x = CANVAS_WIDTH - radius
          ball.vx = -Math.abs(ball.vx)
        }
      }
    }

    function render() {
      ctx!.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      for (const ball of ballsRef.current) {
        const { radius, color } = BALL_PROPS[ball.size]
        ctx!.beginPath()
        ctx!.arc(ball.x, ball.y, radius, 0, Math.PI * 2)
        ctx!.fillStyle = color
        ctx!.fill()
        ctx!.strokeStyle = '#ffffff44'
        ctx!.lineWidth = 2
        ctx!.stroke()
      }

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
