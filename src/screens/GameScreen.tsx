import { useEffect, useRef } from 'react'
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_SPEED,
  GRAVITY,
  HARPOON_SPEED,
  BALL_PROPS,
  NEXT_SIZE,
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

interface Harpoon {
  x: number
  tipY: number
  baseY: number
}

function makeBall(x: number, y: number, size: BallSize, vx: number): Ball {
  const { bounceVy, radius } = BALL_PROPS[size]
  return { x, y: y ?? CANVAS_HEIGHT - radius, size, vx, vy: -bounceVy }
}

function initialBalls(): Ball[] {
  return [
    makeBall(100, CANVAS_HEIGHT - BALL_PROPS.large.radius, 'large',  120),
    makeBall(380, CANVAS_HEIGHT - BALL_PROPS.large.radius, 'large', -120),
  ]
}

function checkHarpoonBallCollision(h: Harpoon, ball: Ball): boolean {
  const { radius } = BALL_PROPS[ball.size]
  const clampedY = Math.max(h.tipY, Math.min(h.baseY, ball.y))
  const dx = ball.x - h.x
  const dy = ball.y - clampedY
  return Math.sqrt(dx * dx + dy * dy) <= radius
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

  const ballsRef = useRef<Ball[]>(initialBalls())
  const harpoonRef = useRef<Harpoon | null>(null)

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
    let spaceWasUp = true

    function update(dt: number) {
      const player = playerRef.current
      const keys = keysRef.current

      // 플레이어 이동
      if (keys.has('ArrowLeft')) {
        player.x = Math.max(0, player.x - PLAYER_SPEED * dt)
      }
      if (keys.has('ArrowRight')) {
        player.x = Math.min(CANVAS_WIDTH - PLAYER_WIDTH, player.x + PLAYER_SPEED * dt)
      }

      // 작살 발사
      if (keys.has('Space') && spaceWasUp && harpoonRef.current === null) {
        const cx = player.x + PLAYER_WIDTH / 2
        harpoonRef.current = { x: cx, tipY: player.y, baseY: player.y }
      }
      spaceWasUp = !keys.has('Space')

      // 작살 이동
      if (harpoonRef.current) {
        harpoonRef.current.tipY -= HARPOON_SPEED * dt
        if (harpoonRef.current.tipY <= 0) {
          harpoonRef.current = null
        }
      }

      // 작살-공 충돌 처리
      if (harpoonRef.current) {
        const h = harpoonRef.current
        const hitIndex = ballsRef.current.findIndex(b => checkHarpoonBallCollision(h, b))

        if (hitIndex !== -1) {
          const hit = ballsRef.current[hitIndex]
          const nextSize = NEXT_SIZE[hit.size]
          const { vx: newVx } = nextSize
            ? BALL_PROPS[nextSize]
            : { vx: 0 }

          // 피격 공 제거
          const remaining = ballsRef.current.filter((_, i) => i !== hitIndex)

          // 분열 공 추가
          if (nextSize) {
            remaining.push(
              makeBall(hit.x, hit.y, nextSize, -newVx),
              makeBall(hit.x, hit.y, nextSize,  newVx),
            )
          }

          ballsRef.current = remaining
          harpoonRef.current = null

          if (ballsRef.current.length === 0) {
            console.log('스테이지 클리어')
          }
        }
      }

      // 공 물리
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

      // 공
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

      // 작살
      if (harpoonRef.current) {
        const h = harpoonRef.current
        ctx!.beginPath()
        ctx!.moveTo(h.x, h.baseY)
        ctx!.lineTo(h.x, h.tipY)
        ctx!.strokeStyle = '#ffffff'
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
