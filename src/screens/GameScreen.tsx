import { useEffect, useRef } from 'react'
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_SPEED,
  GRAVITY,
  BALL_LARGE_RADIUS,
  BALL_LARGE_VX,
  BALL_LARGE_BOUNCE_VY,
} from '../constants/game'
import '../styles/GameScreen.css'

interface Ball {
  x: number
  y: number
  radius: number
  vx: number
  vy: number
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
    {
      x: 100,
      y: CANVAS_HEIGHT - BALL_LARGE_RADIUS,
      radius: BALL_LARGE_RADIUS,
      vx: BALL_LARGE_VX,
      vy: -BALL_LARGE_BOUNCE_VY,
    },
    {
      x: 380,
      y: CANVAS_HEIGHT - BALL_LARGE_RADIUS,
      radius: BALL_LARGE_RADIUS,
      vx: -BALL_LARGE_VX,
      vy: -BALL_LARGE_BOUNCE_VY,
    },
  ])

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
      // 플레이어 이동
      const player = playerRef.current
      const keys = keysRef.current
      if (keys.has('ArrowLeft')) {
        player.x = Math.max(0, player.x - PLAYER_SPEED * dt)
      }
      if (keys.has('ArrowRight')) {
        player.x = Math.min(CANVAS_WIDTH - PLAYER_WIDTH, player.x + PLAYER_SPEED * dt)
      }

      // 공 물리
      for (const ball of ballsRef.current) {
        ball.vy += GRAVITY * dt
        ball.x += ball.vx * dt
        ball.y += ball.vy * dt

        // 바닥 반사
        if (ball.y + ball.radius >= CANVAS_HEIGHT) {
          ball.y = CANVAS_HEIGHT - ball.radius
          ball.vy = -BALL_LARGE_BOUNCE_VY
        }
        // 좌벽 반사
        if (ball.x - ball.radius <= 0) {
          ball.x = ball.radius
          ball.vx = Math.abs(ball.vx)
        }
        // 우벽 반사
        if (ball.x + ball.radius >= CANVAS_WIDTH) {
          ball.x = CANVAS_WIDTH - ball.radius
          ball.vx = -Math.abs(ball.vx)
        }
      }
    }

    function render() {
      ctx!.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // 공
      for (const ball of ballsRef.current) {
        ctx!.beginPath()
        ctx!.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2)
        ctx!.fillStyle = '#ff6b35'
        ctx!.fill()
        ctx!.strokeStyle = '#ff9a6c'
        ctx!.lineWidth = 3
        ctx!.stroke()
      }

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
