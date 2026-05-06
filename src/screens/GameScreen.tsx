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
  SCORE_TABLE,
  TIME_BONUS_PER_SEC,
  ITEM_DROP_CHANCE,
  ITEM_FALL_SPEED,
  ITEM_SIZE,
  ITEM_LIFETIME,
  ITEM_FREEZE_DURATION,
  type BallSize,
  type ItemType,
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

interface Item {
  x: number
  y: number
  type: ItemType
  lifetime: number
}

const PLAYER_INIT_X = CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2
const PLAYER_INIT_Y = CANVAS_HEIGHT - PLAYER_HEIGHT - 8

const ITEM_STYLE: Record<ItemType, { color: string; label: string }> = {
  clock:  { color: '#00bcd4', label: '⏱' },
  shield: { color: '#ab47bc', label: '🛡' },
}

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

function checkPlayerItemCollision(px: number, py: number, item: Item): boolean {
  return (
    px < item.x + ITEM_SIZE &&
    px + PLAYER_WIDTH > item.x &&
    py < item.y + ITEM_SIZE &&
    py + PLAYER_HEIGHT > item.y
  )
}

interface ClearResult {
  score: number
  timeBonus: number
}

interface GameScreenProps {
  onExit: () => void
  onGameOver: () => void
  onClear: (result: ClearResult) => void
}

export default function GameScreen({ onExit: _onExit, onGameOver, onClear }: GameScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const keysRef = useRef<Set<string>>(new Set())

  const playerRef = useRef({ x: PLAYER_INIT_X, y: PLAYER_INIT_Y })
  const ballsRef = useRef<Ball[]>(initialBalls())
  const harpoonRef = useRef<Harpoon | null>(null)
  const itemsRef = useRef<Item[]>([])

  const livesRef = useRef(PLAYER_LIVES)
  const invincibleTimerRef = useRef(0)
  const timerRef = useRef(STAGE_TIME)
  const lastDisplaySecondRef = useRef(STAGE_TIME)
  const scoreRef = useRef(0)
  const freezeTimerRef = useRef(0)
  const shieldActiveRef = useRef(false)

  const [lives, setLives] = useState(PLAYER_LIVES)
  const [displayTime, setDisplayTime] = useState(STAGE_TIME)
  const [score, setScore] = useState(0)
  const [shieldActive, setShieldActive] = useState(false)

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
      // 사망 시 방어막 해제
      shieldActiveRef.current = false
      setShieldActive(false)

      if (resetStage) {
        ballsRef.current = initialBalls()
        itemsRef.current = []
        timerRef.current = STAGE_TIME
        lastDisplaySecondRef.current = STAGE_TIME
        setDisplayTime(STAGE_TIME)
        freezeTimerRef.current = 0
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

      // 무적 종료 + 목숨 0 → 게임 오버
      if (prevInvincible && invincibleTimerRef.current === 0 && livesRef.current === 0) {
        onGameOver()
        return
      }
      prevInvincible = invincibleTimerRef.current > 0

      // 시계 동결 타이머 감소
      if (freezeTimerRef.current > 0) {
        freezeTimerRef.current = Math.max(0, freezeTimerRef.current - dt)
      }

      // 제한 시간 카운트다운 (무적 중 정지)
      if (!isInvincible) {
        timerRef.current = Math.max(0, timerRef.current - dt)
        const currentSecond = Math.ceil(timerRef.current)
        if (currentSecond !== lastDisplaySecondRef.current) {
          lastDisplaySecondRef.current = currentSecond
          setDisplayTime(currentSecond)
        }
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

          // 아이템 드롭 (확률)
          if (Math.random() < ITEM_DROP_CHANCE) {
            const type: ItemType = Math.random() < 0.5 ? 'clock' : 'shield'
            itemsRef.current.push({ x: hit.x - ITEM_SIZE / 2, y: hit.y, type, lifetime: ITEM_LIFETIME })
          }

          scoreRef.current += SCORE_TABLE[hit.size]
          setScore(scoreRef.current)
          ballsRef.current = remaining
          harpoonRef.current = null

          if (ballsRef.current.length === 0) {
            const timeBonus = Math.floor(timerRef.current) * TIME_BONUS_PER_SEC
            onClear({ score: scoreRef.current, timeBonus })
            return
          }
        }
      }

      // 아이템 낙하 + 소멸 + 플레이어 충돌
      const remainingItems: Item[] = []
      for (const item of itemsRef.current) {
        item.lifetime -= dt

        // 낙하 (바닥에서 정지)
        if (item.y + ITEM_SIZE < CANVAS_HEIGHT) {
          item.y += ITEM_FALL_SPEED * dt
          if (item.y + ITEM_SIZE > CANVAS_HEIGHT) item.y = CANVAS_HEIGHT - ITEM_SIZE
        }

        // 플레이어 충돌
        if (checkPlayerItemCollision(player.x, player.y, item)) {
          if (item.type === 'clock') {
            freezeTimerRef.current = ITEM_FREEZE_DURATION
          } else {
            shieldActiveRef.current = true
            setShieldActive(true)
          }
          continue  // 아이템 제거 (remainingItems에 추가 안 함)
        }

        if (item.lifetime > 0) remainingItems.push(item)
      }
      itemsRef.current = remainingItems

      // 플레이어-공 충돌 (무적 중 제외)
      if (!isInvincible) {
        const hit = ballsRef.current.some(b => checkPlayerBallCollision(player.x, player.y, b))
        if (hit) {
          if (shieldActiveRef.current) {
            shieldActiveRef.current = false
            setShieldActive(false)
            invincibleTimerRef.current = INVINCIBLE_DURATION  // 방어막 소멸 후 잠시 무적
          } else {
            triggerDeath(false)
          }
        }
      }

      // 공 물리 (시계 동결 중 skip)
      if (freezeTimerRef.current === 0) {
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
    }

    function render() {
      ctx!.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // 공 (동결 중 반투명)
      const isFrozen = freezeTimerRef.current > 0
      for (const ball of ballsRef.current) {
        const { radius, color } = BALL_PROPS[ball.size]
        ctx!.globalAlpha = isFrozen ? 0.5 : 1
        ctx!.beginPath()
        ctx!.arc(ball.x, ball.y, radius, 0, Math.PI * 2)
        ctx!.fillStyle = color
        ctx!.fill()
        ctx!.strokeStyle = '#ffffff44'
        ctx!.lineWidth = 2
        ctx!.stroke()
      }
      ctx!.globalAlpha = 1

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

      // 아이템
      for (const item of itemsRef.current) {
        const { color, label } = ITEM_STYLE[item.type]
        const blink = item.lifetime < 3 && Math.floor(item.lifetime / 0.3) % 2 === 0
        if (!blink) {
          ctx!.fillStyle = color
          ctx!.fillRect(item.x, item.y, ITEM_SIZE, ITEM_SIZE)
          ctx!.font = `${ITEM_SIZE - 4}px serif`
          ctx!.textAlign = 'center'
          ctx!.textBaseline = 'middle'
          ctx!.fillText(label, item.x + ITEM_SIZE / 2, item.y + ITEM_SIZE / 2)
        }
      }

      // 플레이어
      const isInvincible = invincibleTimerRef.current > 0
      const blink = isInvincible && Math.floor(invincibleTimerRef.current / 0.1) % 2 === 0
      if (!blink) {
        const player = playerRef.current
        ctx!.fillStyle = isInvincible ? '#88ffbb' : '#00e676'
        ctx!.fillRect(player.x, player.y, PLAYER_WIDTH, PLAYER_HEIGHT)

        // 방어막 테두리
        if (shieldActiveRef.current) {
          ctx!.beginPath()
          ctx!.arc(
            player.x + PLAYER_WIDTH / 2,
            player.y + PLAYER_HEIGHT / 2,
            PLAYER_WIDTH,
            0, Math.PI * 2
          )
          ctx!.strokeStyle = '#ab47bc'
          ctx!.lineWidth = 3
          ctx!.stroke()
        }
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
          <span>SCORE: {score}</span>
          <span>{heartsDisplay}{shieldActive ? ' 🛡' : ''}</span>
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
