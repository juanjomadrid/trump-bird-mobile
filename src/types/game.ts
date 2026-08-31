export type GameMode = 'MENU' | 'PLAYING' | 'GAMEOVER';
export type PlayMode = 'STANDARD' | 'DAILY';
export type DayNightPhase = 'SUNSET' | 'NIGHT' | 'DAWN';

export type BirdSkinId = 'classic' | 'maga' | 'golfer' | 'tuxedo';

export interface SkinConfig {
  id: BirdSkinId;
  name: string;
  subtitle: string;
  unlockScore: number;
  badge: string;
  themeColor: string;
}

export interface BirdState {
  x: number;
  y: number;
  vy: number;
  rotation: number;
  width: number;
  height: number;
  shieldActive: boolean;
  shieldTimeRemaining: number; // in seconds
  magnetActive: boolean;
  magnetTimeRemaining: number; // in seconds
}

export interface WallObstacle {
  id: string;
  x: number;
  topHeight: number;
  bottomHeight: number;
  gap: number;
  width: number;
  passed: boolean;
  destroyedTop?: boolean;
  destroyedBottom?: boolean;
}

export type PowerUpType = 'IRON_DOME' | 'EXECUTIVE_ORDER' | 'GOLDEN_MAGNET';

export interface PowerUpItem {
  id: string;
  x: number;
  y: number;
  type: PowerUpType;
  radius: number;
  collected: boolean;
  pulseScale: number;
}

export interface FloatingEnemy {
  id: string;
  x: number;
  y: number;
  baseY: number;
  vy: number;
  floatOffset: number;
  type: 'FAKE_NEWS' | 'DEMOCRAT_DONKEY';
  width: number;
  height: number;
  destroyed: boolean;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface LeaderboardRecord {
  id: string;
  player_name: string;
  score: number;
  created_at: string;
}
