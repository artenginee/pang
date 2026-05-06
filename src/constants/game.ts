export const CANVAS_WIDTH = 480
export const CANVAS_HEIGHT = 600
export const HUD_HEIGHT = 48

export const PLAYER_WIDTH = 32
export const PLAYER_HEIGHT = 40
export const PLAYER_SPEED = 250

export const GRAVITY = 500

export const HARPOON_SPEED = 800

export type BallSize = 'large' | 'medium' | 'small'

export const BALL_PROPS: Record<BallSize, {
  radius: number
  vx: number
  bounceVy: number
  color: string
}> = {
  large:  { radius: 40, vx: 120, bounceVy: 600, color: '#ff6b35' },
  medium: { radius: 26, vx: 160, bounceVy: 480, color: '#ff4081' },
  small:  { radius: 16, vx: 220, bounceVy: 350, color: '#ffeb3b' },
}

export const NEXT_SIZE: Record<BallSize, BallSize | null> = {
  large:  'medium',
  medium: 'small',
  small:  null,
}

export const PLAYER_LIVES = 3
export const INVINCIBLE_DURATION = 2.0
export const STAGE_TIME = 60

export const SCORE_TABLE: Record<BallSize, number> = {
  large:  30,
  medium: 50,
  small:  100,
}
export const TIME_BONUS_PER_SEC = 10
