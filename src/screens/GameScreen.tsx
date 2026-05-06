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
  WIRE_SPEED,
  WIRE_LIFETIME,
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
  type WeaponType,
} from '../constants/game'
import '../styles/GameScreen.css'

interface Ball {
  x: number
  y: number
  size: BallSize
  vx: number
  vy: number
}

interface Projectile {
  x: number
  tipY: number
  baseY: number
  speed: number
  lifetime: number | null  // null = 천장까지, number = 자동 소멸 타이머
}

interface Item {
  x: number
  y: number
  type: ItemType
  lifetime: number
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  color: string
  life: number
  maxLife: number
}

const PARTICLE_COUNT: Record<BallSize, number> = { large: 12, medium: 8, small: 5 }

function spawnParticles(x: number, y: number, size: BallSize, color: string): Particle[] {
  const count = PARTICLE_COUNT[size]
  const particles: Particle[] = []
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5
    const speed = 60 + Math.random() * 140
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 3 + Math.random() * 4,
      color,
      life: 0.4,
      maxLife: 0.4,
    })
  }
  return particles
}

const PLAYER_INIT_X = CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2
const PLAYER_INIT_Y = CANVAS_HEIGHT - PLAYER_HEIGHT - 8

const ITEM_STYLE: Record<ItemType, { color: string; label: string }> = {
  clock:  { color: '#00bcd4', label: '⏱' },
  shield: { color: '#ab47bc', label: '🛡' },
  wire:   { color: '#ff9800', label: '⚡' },
  double: { color: '#4caf50', label: '✦' },
}

const WEAPON_LABEL: Record<WeaponType, string> = {
  harpoon: '',
  wire:    '⚡',
  double:  '✦',
}

const ALL_ITEM_TYPES: ItemType[] = ['clock', 'shield', 'wire', 'double']

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

function checkProjectileBallCollision(p: Projectile, ball: Ball): boolean {
  const { radius } = BALL_PROPS[ball.size]
  const clampedY = Math.max(p.tipY, Math.min(p.baseY, ball.y))
  const dx = ball.x - p.x
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

function makeProjectile(x: number, baseY: number, speed: number, lifetime: number | null): Projectile {
  return { x, tipY: baseY, baseY, speed, lifetime }
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
  const projectilesRef = useRef<Projectile[]>([])
  const itemsRef = useRef<Item[]>([])
  const particlesRef = useRef<Particle[]>([])

  const livesRef = useRef(PLAYER_LIVES)
  const invincibleTimerRef = useRef(0)
  const timerRef = useRef(STAGE_TIME)
  const lastDisplaySecondRef = useRef(STAGE_TIME)
  const scoreRef = useRef(0)
  const freezeTimerRef = useRef(0)
  const shieldActiveRef = useRef(false)
  const weaponRef = useRef<WeaponType>('harpoon')

  const [lives, setLives] = useState(PLAYER_LIVES)
  const [displayTime, setDisplayTime] = useState(STAGE_TIME)
  const [score, setScore] = useState(0)
  const [shieldActive, setShieldActive] = useState(false)
  const [weapon, setWeapon] = useState<WeaponType>('harpoon')

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
      projectilesRef.current = []
      invincibleTimerRef.current = INVINCIBLE_DURATION
      shieldActiveRef.current = false
      setShieldActive(false)
      weaponRef.current = 'harpoon'
      setWeapon('harpoon')

      if (resetStage) {
        ballsRef.current = initialBalls()
        itemsRef.current = []
        timerRef.current = STAGE_TIME
        lastDisplaySecondRef.current = STAGE_TIME
        setDisplayTime(STAGE_TIME)
        freezeTimerRef.current = 0
      }
    }

    function fireWeapon(player: { x: number; y: number }) {
      const w = weaponRef.current
      const cx = player.x + PLAYER_WIDTH / 2

      if (w === 'wire') {
        // 연사 가능: 항상 발사
        projectilesRef.current.push(makeProjectile(cx, player.y, WIRE_SPEED, WIRE_LIFETIME))
      } else if (w === 'double') {
        // 2발 동시, 모두 소멸 후 재발사
        if (projectilesRef.current.length === 0) {
          projectilesRef.current.push(
            makeProjectile(player.x,                player.y, HARPOON_SPEED, null),
            makeProjectile(player.x + PLAYER_WIDTH, player.y, HARPOON_SPEED, null),
          )
        }
      } else {
        // harpoon: 1발 제한
        if (projectilesRef.current.length === 0) {
          projectilesRef.current.push(makeProjectile(cx, player.y, HARPOON_SPEED, null))
        }
      }
    }

    function update(dt: number) {
      const player = playerRef.current
      const keys = keysRef.current
      const isInvincible = invincibleTimerRef.current > 0

      if (isInvincible) {
        invincibleTimerRef.current = Math.max(0, invincibleTimerRef.current - dt)
      }

      if (prevInvincible && invincibleTimerRef.current === 0 && livesRef.current === 0) {
        onGameOver()
        return
      }
      prevInvincible = invincibleTimerRef.current > 0

      if (freezeTimerRef.current > 0) {
        freezeTimerRef.current = Math.max(0, freezeTimerRef.current - dt)
      }

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

      // 발사
      if (keys.has('Space') && spaceWasUp) {
        fireWeapon(player)
      }
      spaceWasUp = !keys.has('Space')

      // 발사체 이동 + 소멸
      const activeProjectiles: Projectile[] = []
      for (const p of projectilesRef.current) {
        p.tipY -= p.speed * dt
        if (p.lifetime !== null) {
          p.lifetime -= dt
          if (p.lifetime <= 0) continue
        }
        if (p.tipY <= 0) continue
        activeProjectiles.push(p)
      }
      projectilesRef.current = activeProjectiles

      // 발사체-공 충돌
      let ballsChanged = false
      const hitProjectileIndices = new Set<number>()

      for (let bi = ballsRef.current.length - 1; bi >= 0; bi--) {
        const ball = ballsRef.current[bi]
        for (let pi = 0; pi < projectilesRef.current.length; pi++) {
          if (hitProjectileIndices.has(pi)) continue
          if (checkProjectileBallCollision(projectilesRef.current[pi], ball)) {
            const nextSize = NEXT_SIZE[ball.size]
            const newVx = nextSize ? BALL_PROPS[nextSize].vx : 0

            ballsRef.current.splice(bi, 1)
            if (nextSize) {
              ballsRef.current.push(
                makeBall(ball.x, ball.y, nextSize, -newVx),
                makeBall(ball.x, ball.y, nextSize,  newVx),
              )
            }

            // 파티클 생성
            const { color } = BALL_PROPS[ball.size]
            particlesRef.current.push(...spawnParticles(ball.x, ball.y, ball.size, color))

            if (Math.random() < ITEM_DROP_CHANCE) {
              const type = ALL_ITEM_TYPES[Math.floor(Math.random() * ALL_ITEM_TYPES.length)]
              itemsRef.current.push({ x: ball.x - ITEM_SIZE / 2, y: ball.y, type, lifetime: ITEM_LIFETIME })
            }

            scoreRef.current += SCORE_TABLE[ball.size]
            setScore(scoreRef.current)
            hitProjectileIndices.add(pi)
            ballsChanged = true
            break
          }
        }
      }

      // 충돌한 발사체 제거 (Wire는 유지 - 관통 불가이므로 제거)
      projectilesRef.current = projectilesRef.current.filter((_, i) => !hitProjectileIndices.has(i))

      if (ballsChanged && ballsRef.current.length === 0) {
        const timeBonus = Math.floor(timerRef.current) * TIME_BONUS_PER_SEC
        onClear({ score: scoreRef.current, timeBonus })
        return
      }

      // 아이템 낙하 + 충돌
      const remainingItems: Item[] = []
      for (const item of itemsRef.current) {
        item.lifetime -= dt
        if (item.y + ITEM_SIZE < CANVAS_HEIGHT) {
          item.y = Math.min(item.y + ITEM_FALL_SPEED * dt, CANVAS_HEIGHT - ITEM_SIZE)
        }

        if (checkPlayerItemCollision(player.x, player.y, item)) {
          if (item.type === 'clock') {
            freezeTimerRef.current = ITEM_FREEZE_DURATION
          } else if (item.type === 'shield') {
            shieldActiveRef.current = true
            setShieldActive(true)
          } else {
            weaponRef.current = item.type as WeaponType
            setWeapon(item.type as WeaponType)
            projectilesRef.current = []
          }
          continue
        }

        if (item.lifetime > 0) remainingItems.push(item)
      }
      itemsRef.current = remainingItems

      // 플레이어-공 충돌
      if (!isInvincible) {
        const hit = ballsRef.current.some(b => checkPlayerBallCollision(player.x, player.y, b))
        if (hit) {
          if (shieldActiveRef.current) {
            shieldActiveRef.current = false
            setShieldActive(false)
            invincibleTimerRef.current = INVINCIBLE_DURATION
          } else {
            triggerDeath(false)
          }
        }
      }

      // 파티클 업데이트
      particlesRef.current = particlesRef.current.filter(p => {
        p.life -= dt
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.vy += 200 * dt  // 중력
        return p.life > 0
      })

      // 공 물리
      if (freezeTimerRef.current === 0) {
        for (const ball of ballsRef.current) {
          const { radius, bounceVy } = BALL_PROPS[ball.size]
          ball.vy += GRAVITY * dt
          ball.x += ball.vx * dt
          ball.y += ball.vy * dt
          if (ball.y + radius >= CANVAS_HEIGHT) { ball.y = CANVAS_HEIGHT - radius; ball.vy = -bounceVy }
          if (ball.x - radius <= 0)             { ball.x = radius;                 ball.vx = Math.abs(ball.vx) }
          if (ball.x + radius >= CANVAS_WIDTH)  { ball.x = CANVAS_WIDTH - radius;  ball.vx = -Math.abs(ball.vx) }
        }
      }
    }

    function renderBackground() {
      const sky = ctx!.createLinearGradient(0, 0, 0, CANVAS_HEIGHT - 40)
      sky.addColorStop(0, '#0d2137')
      sky.addColorStop(1, '#1a5276')
      ctx!.fillStyle = sky
      ctx!.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT - 40)

      // 후지산 실루엣
      const mX = CANVAS_WIDTH / 2
      const mBase = CANVAS_HEIGHT - 40
      ctx!.beginPath()
      ctx!.moveTo(mX - 160, mBase)
      ctx!.lineTo(mX, mBase - 220)
      ctx!.lineTo(mX + 160, mBase)
      ctx!.closePath()
      ctx!.fillStyle = '#1c2e3f'
      ctx!.fill()

      // 정상 눈
      ctx!.beginPath()
      ctx!.moveTo(mX, mBase - 220)
      ctx!.lineTo(mX - 30, mBase - 170)
      ctx!.lineTo(mX + 30, mBase - 170)
      ctx!.closePath()
      ctx!.fillStyle = '#ddeeff'
      ctx!.fill()

      // 지면
      ctx!.fillStyle = '#1a3d1a'
      ctx!.fillRect(0, CANVAS_HEIGHT - 40, CANVAS_WIDTH, 40)
    }

    function render() {
      ctx!.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
      renderBackground()

      // 공
      const isFrozen = freezeTimerRef.current > 0
      ctx!.globalAlpha = isFrozen ? 0.5 : 1
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
      ctx!.globalAlpha = 1

      // 발사체
      for (const p of projectilesRef.current) {
        ctx!.beginPath()
        ctx!.moveTo(p.x, p.baseY)
        ctx!.lineTo(p.x, p.tipY)
        ctx!.strokeStyle = '#ffffff'
        ctx!.lineWidth = p.lifetime !== null ? 2 : 3  // wire는 가늘게
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

      // 파티클
      for (const p of particlesRef.current) {
        const t = p.life / p.maxLife
        ctx!.globalAlpha = t
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.radius * t, 0, Math.PI * 2)
        ctx!.fillStyle = p.color
        ctx!.fill()
      }
      ctx!.globalAlpha = 1

      // 플레이어
      const isInvincible = invincibleTimerRef.current > 0
      const blink = isInvincible && Math.floor(invincibleTimerRef.current / 0.1) % 2 === 0
      if (!blink) {
        const player = playerRef.current
        ctx!.fillStyle = isInvincible ? '#88ffbb' : '#00e676'
        ctx!.fillRect(player.x, player.y, PLAYER_WIDTH, PLAYER_HEIGHT)

        if (shieldActiveRef.current) {
          ctx!.beginPath()
          ctx!.arc(player.x + PLAYER_WIDTH / 2, player.y + PLAYER_HEIGHT / 2, PLAYER_WIDTH, 0, Math.PI * 2)
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
  const weaponDisplay = WEAPON_LABEL[weapon]

  return (
    <div className="game-wrapper">
      <div className="game-container">
        <div className="hud">
          <span>SCORE: {score}</span>
          <span>{heartsDisplay}{shieldActive ? ' 🛡' : ''}{weaponDisplay ? ` ${weaponDisplay}` : ''}</span>
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
