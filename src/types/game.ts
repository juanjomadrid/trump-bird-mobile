export type GameMode = 'MENU' | 'PLAYING' | 'PAUSED' | 'COUNTDOWN' | 'GAMEOVER';
export type PlayMode = 'STANDARD' | 'DAILY' | 'ELECTORAL_CAMPAIGN';
export type DayNightPhase = 'SUNSET' | 'NIGHT' | 'DAWN';

export type BirdSkinId = 'classic' | 'maga' | 'golfer' | 'tuxedo' | 'airforceone';

export interface SkinConfig {
  id: BirdSkinId;
  name: string;
  subtitle: string;
  unlockScore: number;
  coinPrice: number;
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
  hasClimber?: boolean;
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

export interface CoinItem {
  id: string;
  x: number;
  y: number;
  radius: number;
  collected: boolean;
  pulseScale: number;
  value: number;
}

export interface WatermelonProjectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  rotation: number;
  destroyed: boolean;
}

export interface FloatingEnemy {
  id: string;
  x: number;
  y: number;
  baseY: number;
  vy: number;
  floatOffset: number;
  type: 'TURBAN_SHOOTER';
  width: number;
  height: number;
  shootCooldown: number;
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

export interface FloatingPopup {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  scale: number;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface SpeechBalloonState {
  visible: boolean;
  text: string;
  expiresAt: number;
}

export interface ApprovalComboState {
  current: number;
  max: number;
  multiplier: number;
  isMaxed: boolean;
}

export interface PresidentialQuest {
  id: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  completed: boolean;
  claimed: boolean;
  rewardStars: number;
  icon: string;
}

export interface AudioSettings {
  soundEnabled: boolean;
  voiceVolume: number; // 0.0 to 1.0
  sfxVolume: number;   // 0.0 to 1.0
  hapticsEnabled: boolean;
  highContrastEnabled: boolean;
}

export interface LeaderboardRecord {
  id: string;
  player_name: string;
  score: number;
  created_at: string;
  mode?: 'STANDARD' | 'DAILY';
}
