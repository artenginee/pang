import { useEffect, useRef, useState } from 'react'
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_SPEED,
  PLAYER_LIVES,
  INVINCIBLE_DURATION,
  STAGE_TIME,
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

const PLAYER_INIT_X = CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2
const PLAYER_INIT_Y = CANVAS_HEIGHT - PLAYER_HEIGHT - 8

function makeBall(x: number, y: number, size: BallSize, vx: number): Ball {
  const { bounceVy } = BALL_PROPS[size]
  return { x, y, size, vx, vy: -bounceVy }
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
  return dx * dx + dy * dy <= radius * radius
}

function checkPlayerBallCollision(px: number, py: number, ball: Ball): boolean {
  const { radius } = BALL_PROPS[ball.size]
  const closestX = Math.max(px, Math.min(ball.x, px + PLAYER_WIDTH))
  const closestY = Math.max(py, Math.min(ball.y, py + PLAYER_HEIGHT))
  const dx = ball.x - closestX
  const dy = ball.y - closestY
  return dx * dx + dy * dy <= radius * radius
}

interface GameScreenProps {
  onExit: () => void
  onGameOver: () => void
  onClear: () => void
}

export default function GameScreen({ onExit: _onExit, onGameOver, onClear }: GameScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const keysRef = useRef<Set<string>>(new Set())

  const playerRef = useRef({ x: PLAYER_INIT_X, y: PLAYER_INIT_Y })
  const ballsRef = useRef<Ball[]>(initialBalls())
  const harpoonRef = useRef<Harpoon | null>(null)

  const livesRef = useRef(PLAYER_LIVES)
  const invincibleTimerRef = useRef(0)
  const timerRef = useRef(STAGE_TIME)
  const lastDisplaySecondRef = useRef(STAGE_TIME)

  const [lives, setLives] = useState(PLAYER_LIVES)
  const [displayTime, setDisplayTime] = useState(STAGE_TIME)

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
    let prevInvincible = false

    function triggerDeath(resetStage: boolean) {
      const player = playerRef.current
      livesRef.current -= 1
      setLives(livesRef.current)
      player.x = PLAYER_INIT_X
      player.y = PLAYER_INIT_Y
      harpoonRef.current = null
      invincibleTimerRef.current = INVINCIBLE_DURATION

      if (resetStage) {
        ballsRef.current = initialBalls()
        timerRef.current = STAGE_TIME
        lastDisplaySecondRef.current = STAGE_TIME
        setDisplayTime(STAGE_TIME)
      }
    }

    function update(dt: number) {
      const player = playerRef.current
      const keys = keysRef.current
      const isInvincible = invincibleTimerRef.current > 0

      // 무적 타이머 감소
      if (isInvincible) {
        invincibleTimerRef.current = Math.max(0, invincibleTimerRef.current - dt)
      }

      // 무적 종료 시점 + 목숨 0 → 게임 오버
      if (prevInvincible && invincibleTimerRef.current === 0 && livesRef.current === 0) {
        onGameOver()
        return
      }
      prevInvincible = invincibleTimerRef.current > 0

      // 제한 시간 카운트다운 (무적 중 정지)
      if (!isInvincible) {
        timerRef.current = Math.max(0, timerRef.current - dt)

        // HUD 갱신: 표시 초가 바뀔 때만 setState
        const currentSecond = Math.ceil(timerRef.current)
        if (currentSecond !== lastDisplaySecondRef.current) {
          lastDisplaySecondRef.current = currentSecond
          setDisplayTime(currentSecond)
        }

        // 타임오버: 스테이지 리셋
        if (timerRef.current === 0) {
          triggerDeath(true)
          return
        }
      }

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

      // 작살-공 충돌
      if (harpoonRef.current) {
        const h = harpoonRef.current
        const hitIndex = ballsRef.current.findIndex(b => checkHarpoonBallCollision(h, b))

        if (hitIndex !== -1) {
          const hit = ballsRef.current[hitIndex]
          const nextSize = NEXT_SIZE[hit.size]
          const newVx = nextSize ? BALL_PROPS[nextSize].vx : 0

          const remaining = ballsRef.current.filter((_, i) => i !== hitIndex)
          if (nextSize) {
            remaining.push(
              makeBall(hit.x, hit.y, nextSize, -newVx),
              makeBall(hit.x, hit.y, nextSize,  newVx),
            )
          }

          ballsRef.current = remaining
          harpoonRef.current = null

          if (ballsRef.current.length === 0) {
            onClear()
            return
          }
        }
      }

      // 플레이어-공 충돌 (무적 중 제외)
      if (!isInvincible) {
        const hit = ballsRef.current.some(b => checkPlayerBallCollision(player.x, player.y, b))
        if (hit) {
          triggerDeath(false)
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

      if (harpoonRef.current) {
        const h = harpoonRef.current
        ctx!.beginPath()
        ctx!.moveTo(h.x, h.baseY)
        ctx!.lineTo(h.x, h.tipY)
        ctx!.strokeStyle = '#ffffff'
        ctx!.lineWidth = 3
        ctx!.stroke()
      }

      const isInvincible = invincibleTimerRef.current > 0
      const blink = isInvincible && Math.floor(invincibleTimerRef.current / 0.1) % 2 === 0
      if (!blink) {
        const player = playerRef.current
        ctx!.fillStyle = isInvincible ? '#88ffbb' : '#00e676'
        ctx!.fillRect(player.x, player.y, PLAYER_WIDTH, PLAYER_HEIGHT)
      }
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

  const heartsDisplay = '♥ '.repeat(lives).trim() || '☆'

  return (
    <div className="game-wrapper">
      <div className="game-container">
        <div className="hud">
          <span>SCORE: 0</span>
          <span>{heartsDisplay}</span>
          <span>TIME: {displayTime}</span>
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
