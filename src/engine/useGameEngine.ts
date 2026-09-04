import { useState, useRef, useEffect, useCallback } from 'react';
import { Dimensions } from 'react-native';
import {
  GameMode,
  PlayMode,
  BirdState,
  BirdSkinId,
  WallObstacle,
  PowerUpItem,
  PowerUpType,
  CoinItem,
  WatermelonProjectile,
  FloatingEnemy,
  Particle,
  FloatingPopup,
  SpeechBalloonState,
  ApprovalComboState,
  PresidentialQuest,
  AudioSettings,
} from '../types/game';
import { SoundManager } from '../services/sound';
import { StorageService } from '../services/storage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Engine physics constants (smooth, accessible, responsive arcade tuning)
const BASE_GRAVITY = 0.32;
const BASE_JUMP_VELOCITY = -6.8;
const BASE_SCROLL_SPEED = 2.4;
const WALL_WIDTH = 64;
const WALL_GAP = 240; // Generous gap for comfortable clearance
const BIRD_SIZE = 58; // Proportional sprite size
const BIRD_HITBOX_RADIUS = 20; // Forgiving central circular hitbox
const GROUND_Y = SCREEN_HEIGHT - 60;
const CEILING_Y = 20;
const SHIELD_DURATION_SEC = 5.0;
const MAGNET_DURATION_SEC = 6.0;

const getTodayKey = () => new Date().toISOString().split('T')[0];

const createDailyRng = (seedStr: string) => {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
};

export const useGameEngine = () => {
  const [gameMode, setGameMode] = useState<GameMode>('MENU');
  const [playMode, setPlayMode] = useState<PlayMode>('STANDARD');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [dailyHighScore, setDailyHighScore] = useState(0);
  const [playerName, setPlayerName] = useState('Don The Great');
  const [selectedSkin, setSelectedSkin] = useState<BirdSkinId>('classic');
  const [unlockedSkins, setUnlockedSkins] = useState<BirdSkinId[]>(['classic']);
  const [coins, setCoins] = useState(50);
  const [coinsEarnedThisRun, setCoinsEarnedThisRun] = useState(0);
  const [screenFlash, setScreenFlash] = useState<string | null>(null);
  const [rallyStars, setRallyStars] = useState(100);
  const [quests, setQuests] = useState<PresidentialQuest[]>([]);
  const [audioSettings, setAudioSettings] = useState<AudioSettings>(SoundManager.getSettings());

  // Tactical Pause & Resume Countdown
  const [resumeCountdown, setResumeCountdown] = useState<number | null>(null);

  // UX: Approval Rating Combo & Multiplier State
  const [combo, setCombo] = useState<ApprovalComboState>({
    current: 0,
    max: 5,
    multiplier: 1,
    isMaxed: false,
  });

  // UX: Speech Balloon Visual Subtitle
  const [speechBalloon, setSpeechBalloon] = useState<SpeechBalloonState>({
    visible: false,
    text: '',
    expiresAt: 0,
  });

  // UX: Floating Score & Status Popups
  const [popups, setPopups] = useState<FloatingPopup[]>([]);

  // Entities state for UI rendering
  const [bird, setBird] = useState<BirdState>({
    x: SCREEN_WIDTH * 0.25,
    y: SCREEN_HEIGHT * 0.42,
    vy: 0,
    rotation: 0,
    width: BIRD_SIZE,
    height: BIRD_SIZE,
    shieldActive: false,
    shieldTimeRemaining: 0,
    magnetActive: false,
    magnetTimeRemaining: 0,
  });

  const [obstacles, setObstacles] = useState<WallObstacle[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUpItem[]>([]);
  const [spawnedCoins, setSpawnedCoins] = useState<CoinItem[]>([]);
  const [watermelonProjectiles, setWatermelonProjectiles] = useState<WatermelonProjectile[]>([]);
  const [enemies, setEnemies] = useState<FloatingEnemy[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [scrollOffset, setScrollOffset] = useState(0);

  // Engine loop mutable refs (eliminates stale closures and effect churn)
  const gameModeRef = useRef<GameMode>('MENU');
  gameModeRef.current = gameMode;

  const playModeRef = useRef<PlayMode>('STANDARD');
  playModeRef.current = playMode;

  const birdRef = useRef<BirdState>({
    x: SCREEN_WIDTH * 0.25,
    y: SCREEN_HEIGHT * 0.42,
    vy: 0,
    rotation: 0,
    width: BIRD_SIZE,
    height: BIRD_SIZE,
    shieldActive: false,
    shieldTimeRemaining: 0,
    magnetActive: false,
    magnetTimeRemaining: 0,
  });

  const obstaclesRef = useRef<WallObstacle[]>([]);
  const powerUpsRef = useRef<PowerUpItem[]>([]);
  const coinsRef = useRef<CoinItem[]>([]);
  const enemiesRef = useRef<FloatingEnemy[]>([]);
  const projectilesRef = useRef<WatermelonProjectile[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const popupsRef = useRef<FloatingPopup[]>([]);
  const comboRef = useRef<ApprovalComboState>({ current: 0, max: 5, multiplier: 1, isMaxed: false });
  const scoreRef = useRef<number>(0);
  const highScoreRef = useRef<number>(0);
  const dailyHighScoreRef = useRef<number>(0);
  const coinsCountRef = useRef<number>(50);
  const coinsEarnedRef = useRef<number>(0);
  const scrollOffsetRef = useRef<number>(0);
  const totalDistanceRef = useRef<number>(0);
  const nextSpawnDistanceRef = useRef<number>(SCREEN_WIDTH + 260);
  const nextEnemySpawnTimeRef = useRef<number>(0);
  const dailyRngRef = useRef<(() => number) | null>(null);
  const lastTimeRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  // Keep high scores ref in sync
  useEffect(() => {
    highScoreRef.current = highScore;
  }, [highScore]);

  useEffect(() => {
    dailyHighScoreRef.current = dailyHighScore;
  }, [dailyHighScore]);

  useEffect(() => {
    coinsCountRef.current = coins;
  }, [coins]);

  // Load stored data
  useEffect(() => {
    StorageService.getPlayerName().then(setPlayerName);
    StorageService.getHighScore().then((hs) => {
      setHighScore(hs);
      highScoreRef.current = hs;
    });
    StorageService.getSelectedSkin().then(setSelectedSkin);
    StorageService.getUnlockedSkins().then(setUnlockedSkins);
    StorageService.getCoins().then((c) => {
      setCoins(c);
      coinsCountRef.current = c;
    });
    StorageService.getDailyHighScore(getTodayKey()).then((dhs) => {
      setDailyHighScore(dhs);
      dailyHighScoreRef.current = dhs;
    });
    StorageService.getQuests().then(setQuests);
    StorageService.getRallyStars().then(setRallyStars);
    StorageService.getAudioSettings().then((s) => {
      setAudioSettings(s);
      SoundManager.updateSettings(s);
    });

    // Register visual comic speech balloon listener
    const unregister = SoundManager.registerSpeechListener((text, durationMs = 2800) => {
      setSpeechBalloon({
        visible: true,
        text,
        expiresAt: Date.now() + durationMs,
      });
    });

    return () => unregister();
  }, []);

  // Update Quest Progress helper
  const updateQuestProgress = useCallback((questId: string, amount: number = 1) => {
    setQuests((prev) => {
      const next = prev.map((q) => {
        if (q.id === questId && !q.completed) {
          const current = Math.min(q.target, q.current + amount);
          const completed = current >= q.target;
          return { ...q, current, completed };
        }
        return q;
      });
      StorageService.setQuests(next);
      return next;
    });
  }, []);

  // Claim Quest Reward helper
  const claimQuest = useCallback((questId: string) => {
    setQuests((prev) => {
      const targetQuest = prev.find((q) => q.id === questId);
      if (!targetQuest || !targetQuest.completed || targetQuest.claimed) return prev;

      SoundManager.playScore(10);
      setRallyStars((s) => {
        const nextStars = s + targetQuest.rewardStars;
        StorageService.setRallyStars(nextStars);
        return nextStars;
      });

      setCoins((c) => {
        const nextCoins = c + targetQuest.rewardCoins;
        StorageService.setCoins(nextCoins);
        coinsCountRef.current = nextCoins;
        return nextCoins;
      });

      const next = prev.map((q) => (q.id === questId ? { ...q, claimed: true } : q));
      StorageService.setQuests(next);
      return next;
    });
  }, []);

  // Buy Skin helper
  const buySkin = useCallback((skinId: BirdSkinId) => {
    const prices: Record<BirdSkinId, number> = {
      classic: 0,
      tuxedo: 80,
      golfer: 150,
      maga_cap: 250,
      airforce1: 500,
    };
    const cost = prices[skinId] || 0;
    if (coinsCountRef.current >= cost) {
      const nextCoins = coinsCountRef.current - cost;
      setCoins(nextCoins);
      coinsCountRef.current = nextCoins;
      StorageService.setCoins(nextCoins);

      setUnlockedSkins((prev) => {
        const next = [...prev, skinId];
        StorageService.setUnlockedSkins(next);
        return next;
      });
      setSelectedSkin(skinId);
      StorageService.setSelectedSkin(skinId);
      SoundManager.playScore(50);
      return true;
    }
    return false;
  }, []);

  // Spawn Floating Popup
  const spawnPopup = useCallback((x: number, y: number, text: string, color: string = '#FACC15') => {
    const newPopup: FloatingPopup = {
      id: `pop_${Date.now()}_${Math.random()}`,
      x,
      y: y - 10,
      text,
      color,
      scale: 1.25,
      alpha: 1.0,
      life: 0,
      maxLife: 42,
    };
    popupsRef.current.push(newPopup);
  }, []);

  // Spawn Particle Explosion
  const spawnExplosion = useCallback((x: number, y: number, color: string = '#F59E0B', count: number = 14) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 2 + Math.random() * 5;
      newParticles.push({
        id: `p_${Date.now()}_${i}_${Math.random()}`,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 4 + Math.random() * 5,
        alpha: 1,
        life: 0,
        maxLife: 25 + Math.random() * 15,
      });
    }
    particlesRef.current.push(...newParticles);
  }, []);

  // Flap / Jump with immediate responsive physics & sound
  const handleFlap = useCallback(() => {
    if (gameModeRef.current !== 'PLAYING') return;

    SoundManager.playFlap();
    birdRef.current.vy = BASE_JUMP_VELOCITY;
    birdRef.current.rotation = -26; // Instant responsive pitch up
  }, []);

  // Tactical Pause
  const pauseGame = useCallback(() => {
    if (gameModeRef.current === 'PLAYING') {
      setGameMode('PAUSED');
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    }
  }, []);

  // Resume with 3-2-1 countdown
  const resumeGame = useCallback(() => {
    if (gameModeRef.current === 'PAUSED') {
      setGameMode('COUNTDOWN');
      setResumeCountdown(3);

      const interval = setInterval(() => {
        setResumeCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            setResumeCountdown(null);
            lastTimeRef.current = performance.now();
            setGameMode('PLAYING');
            return null;
          }
          return prev - 1;
        });
      }, 750);
    }
  }, []);

  // Trigger Executive Order
  const triggerExecutiveOrder = useCallback(() => {
    SoundManager.playPowerUp('EXECUTIVE_ORDER');
    setScreenFlash('rgba(250, 204, 21, 0.45)');
    setTimeout(() => setScreenFlash(null), 380);

    spawnPopup(birdRef.current.x, birdRef.current.y - 30, '📜 EXECUTIVE BLAST! +5', '#FACC15');
    updateQuestProgress('q_powerups', 1);

    // Obliterate all on-screen obstacles, watermelon projectiles and enemies
    obstaclesRef.current = obstaclesRef.current.map((w) => {
      spawnExplosion(w.x + w.width / 2, w.topHeight, '#FACC15', 8);
      spawnExplosion(w.x + w.width / 2, GROUND_Y - w.bottomHeight, '#FACC15', 8);
      return {
        ...w,
        destroyedTop: true,
        destroyedBottom: true,
      };
    });

    projectilesRef.current = projectilesRef.current.map((p) => {
      spawnExplosion(p.x, p.y, '#DC2626', 8);
      return { ...p, destroyed: true };
    });

    enemiesRef.current = enemiesRef.current.map((e) => {
      spawnExplosion(e.x, e.y, '#EF4444', 10);
      updateQuestProgress('q_enemies', 1);
      return { ...e, destroyed: true };
    });

    scoreRef.current += 5;
    setScore(scoreRef.current);
  }, [spawnExplosion, spawnPopup, updateQuestProgress]);

  // Start game run
  const startGame = useCallback((mode: PlayMode = 'STANDARD') => {
    setPlayMode(mode);
    playModeRef.current = mode;

    if (mode === 'DAILY') {
      dailyRngRef.current = createDailyRng(getTodayKey());
    } else {
      dailyRngRef.current = null;
    }

    const initialBird: BirdState = {
      x: SCREEN_WIDTH * 0.25,
      y: SCREEN_HEIGHT * 0.42,
      vy: BASE_JUMP_VELOCITY * 0.4,
      rotation: -10,
      width: BIRD_SIZE,
      height: BIRD_SIZE,
      shieldActive: false,
      shieldTimeRemaining: 0,
      magnetActive: false,
      magnetTimeRemaining: 0,
    };

    birdRef.current = initialBird;
    obstaclesRef.current = [];
    powerUpsRef.current = [];
    coinsRef.current = [];
    projectilesRef.current = [];
    enemiesRef.current = [];
    particlesRef.current = [];
    popupsRef.current = [];
    comboRef.current = { current: 0, max: 5, multiplier: 1, isMaxed: false };
    scoreRef.current = 0;
    coinsEarnedRef.current = 0;
    scrollOffsetRef.current = 0;
    totalDistanceRef.current = 0;
    nextSpawnDistanceRef.current = SCREEN_WIDTH + 260; // Generous runway before wall 1
    nextEnemySpawnTimeRef.current = performance.now() + 18000; // Enemies only appear later
    lastTimeRef.current = performance.now();

    setBird(initialBird);
    setObstacles([]);
    setPowerUps([]);
    setSpawnedCoins([]);
    setWatermelonProjectiles([]);
    setEnemies([]);
    setParticles([]);
    setPopups([]);
    setCombo({ current: 0, max: 5, multiplier: 1, isMaxed: false });
    setScore(0);
    setCoinsEarnedThisRun(0);
    setScrollOffset(0);
    setScreenFlash(null);
    setResumeCountdown(null);

    setGameMode('PLAYING');
  }, []);

  // Main Butter-Smooth Game Loop (Single persistent requestAnimationFrame with zero re-subscription churn)
  useEffect(() => {
    if (gameMode !== 'PLAYING') {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    let isRunning = true;
    lastTimeRef.current = performance.now();

    const loop = (time: number) => {
      if (!isRunning || gameModeRef.current !== 'PLAYING') return;

      // Delta time normalized to 60 FPS (16.67ms = 1.0 unit)
      const rawDtSec = Math.min((time - lastTimeRef.current) / 1000, 0.045);
      const dtFactor = Math.min(Math.max(rawDtSec / 0.01667, 0.5), 1.8);
      lastTimeRef.current = time;

      const getRandom = () => (dailyRngRef.current ? dailyRngRef.current() : Math.random());
      const currentSpeed = (BASE_SCROLL_SPEED + Math.min(scoreRef.current * 0.02, 1.4)) * dtFactor;

      // 1. Update Scroll & Obstacle Spawning
      scrollOffsetRef.current += currentSpeed;
      totalDistanceRef.current += currentSpeed;

      // Breathable, generous wall spacing (360 - 440px between obstacles)
      if (totalDistanceRef.current >= nextSpawnDistanceRef.current) {
        nextSpawnDistanceRef.current = totalDistanceRef.current + 360 + getRandom() * 80;

        const availableHeight = GROUND_Y - CEILING_Y - WALL_GAP;
        const minTop = 60;
        const maxTop = Math.max(minTop + 20, availableHeight - 60);
        const topH = Math.floor(minTop + getRandom() * (maxTop - minTop));
        const bottomH = Math.max(0, availableHeight - topH);

        const newWall: WallObstacle = {
          id: `wall_${Date.now()}_${getRandom()}`,
          x: SCREEN_WIDTH + 20,
          topHeight: topH,
          bottomHeight: bottomH,
          gap: WALL_GAP,
          width: WALL_WIDTH,
          passed: false,
          hasClimber: getRandom() < 0.40, // Visual Mexican climber on bottom wall
        };

        obstaclesRef.current.push(newWall);

        // 35% chance to spawn a PowerUp in safe centered positions
        const pRand = getRandom();
        if (pRand < 0.35) {
          const powerUpY = topH + WALL_GAP / 2 + (getRandom() * 30 - 15);
          const type: PowerUpType =
            pRand < 0.12 ? 'IRON_DOME' : pRand < 0.24 ? 'EXECUTIVE_ORDER' : 'GOLDEN_MAGNET';

          powerUpsRef.current.push({
            id: `pw_${Date.now()}_${getRandom()}`,
            x: SCREEN_WIDTH + 80,
            y: powerUpY,
            type,
            radius: 20,
            collected: false,
            pulseScale: 1.0,
          });
        }

        // 60% chance to spawn Collectible Golden Coins along the open path
        if (getRandom() < 0.60) {
          const coinCount = 1 + Math.floor(getRandom() * 3);
          for (let cIdx = 0; cIdx < coinCount; cIdx++) {
            const coinY = topH + (WALL_GAP / (coinCount + 1)) * (cIdx + 1);
            coinsRef.current.push({
              id: `coin_${Date.now()}_${cIdx}_${getRandom()}`,
              x: SCREEN_WIDTH + 60 + cIdx * 34,
              y: coinY,
              radius: 16,
              collected: false,
              pulseScale: 1.0,
              value: 1,
            });
          }
        }
      }

      // 2. Enemies: Only spawn when score >= 6 to ensure fair initial learning curve
      if (scoreRef.current >= 6 && time >= nextEnemySpawnTimeRef.current) {
        nextEnemySpawnTimeRef.current = time + 10000 + getRandom() * 6000;
        const enemyY = Math.max(120, Math.min(GROUND_Y - 140, 140 + getRandom() * (GROUND_Y - 280)));

        enemiesRef.current.push({
          id: `en_${Date.now()}_${getRandom()}`,
          x: SCREEN_WIDTH - 64,
          y: enemyY,
          baseY: enemyY,
          vy: 0,
          floatOffset: 0,
          type: 'TURBAN_SHOOTER',
          width: 60,
          height: 60,
          shootCooldown: 45, // Generous 0.75s wind-up warning
          destroyed: false,
        });
      }

      // 3. Update Bird Physics
      const curBird = birdRef.current;
      const nextVy = curBird.vy + BASE_GRAVITY * dtFactor;
      const nextY = curBird.y + nextVy * dtFactor;
      const targetRot = Math.min(Math.max(-26, nextVy * 4.2), 65);
      const smoothRot = curBird.rotation + (targetRot - curBird.rotation) * Math.min(1.0, 0.22 * dtFactor);

      let nextShieldActive = curBird.shieldActive;
      let nextShieldTime = curBird.shieldTimeRemaining;
      if (nextShieldActive) {
        nextShieldTime = Math.max(0, nextShieldTime - rawDtSec);
        if (nextShieldTime <= 0) nextShieldActive = false;
      }

      let nextMagnetActive = curBird.magnetActive;
      let nextMagnetTime = curBird.magnetTimeRemaining;
      if (nextMagnetActive) {
        nextMagnetTime = Math.max(0, nextMagnetTime - rawDtSec);
        if (nextMagnetTime <= 0) nextMagnetActive = false;
      }

      birdRef.current = {
        ...curBird,
        y: nextY,
        vy: nextVy,
        rotation: smoothRot,
        shieldActive: nextShieldActive,
        shieldTimeRemaining: nextShieldTime,
        magnetActive: nextMagnetActive,
        magnetTimeRemaining: nextMagnetTime,
      };

      // 4. Update Obstacles & Pass Detection
      obstaclesRef.current = obstaclesRef.current
        .map((w) => {
          const nextX = w.x - currentSpeed;
          if (!w.passed && nextX + w.width < birdRef.current.x) {
            updateQuestProgress('q_walls', 1);

            // Approval Combo multiplier
            const nextCur = comboRef.current.current + 1;
            const isMax = nextCur >= comboRef.current.max;
            if (isMax && !comboRef.current.isMaxed) {
              SoundManager.playComboMax();
              spawnPopup(birdRef.current.x, birdRef.current.y - 35, '🔥 2X APPROVAL MULTIPLIER!', '#F59E0B');
            }
            comboRef.current = {
              current: Math.min(comboRef.current.max, nextCur),
              max: comboRef.current.max,
              multiplier: isMax ? 2 : 1,
              isMaxed: isMax,
            };
            setCombo({ ...comboRef.current });

            const addScore = comboRef.current.multiplier;
            scoreRef.current += addScore;
            const newScore = scoreRef.current;
            setScore(newScore);
            SoundManager.playScore(newScore);

            spawnPopup(
              birdRef.current.x,
              birdRef.current.y - 20,
              comboRef.current.multiplier > 1 ? `+${addScore} (2X COMBO!)` : '+1 VOTE',
              comboRef.current.multiplier > 1 ? '#FACC15' : '#38BDF8'
            );

            if (playModeRef.current === 'DAILY') {
              if (newScore > dailyHighScoreRef.current) {
                dailyHighScoreRef.current = newScore;
                setDailyHighScore(newScore);
                StorageService.setDailyHighScore(newScore, getTodayKey());
              }
            } else {
              if (newScore > highScoreRef.current) {
                if (highScoreRef.current > 0 && newScore === highScoreRef.current + 1) {
                  spawnPopup(birdRef.current.x, birdRef.current.y - 45, '🏆 NEW ALL-TIME RECORD!', '#EC4899');
                }
                highScoreRef.current = newScore;
                setHighScore(newScore);
                StorageService.setHighScore(newScore);
              }
            }

            return { ...w, x: nextX, passed: true };
          }
          return { ...w, x: nextX };
        })
        .filter((w) => w.x + w.width > -50);

      // 5. Update PowerUps with Golden Magnet Attraction
      powerUpsRef.current = powerUpsRef.current
        .map((p) => {
          let nextX = p.x - currentSpeed;
          let nextY = p.y;

          if (birdRef.current.magnetActive && !p.collected) {
            const dx = birdRef.current.x - p.x;
            const dy = birdRef.current.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 320 && dist > 1) {
              const pullStrength = 7.0 * dtFactor;
              nextX += (dx / dist) * pullStrength;
              nextY += (dy / dist) * pullStrength;
            }
          }

          return {
            ...p,
            x: nextX,
            y: nextY,
            pulseScale: 1.0 + Math.sin(time * 0.008) * 0.15,
          };
        })
        .filter((p) => p.x > -50 && !p.collected);

      // 6. Update Golden Coins
      coinsRef.current = coinsRef.current
        .map((c) => {
          let nextX = c.x - currentSpeed;
          let nextY = c.y;

          if (birdRef.current.magnetActive && !c.collected) {
            const dx = birdRef.current.x - c.x;
            const dy = birdRef.current.y - c.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 320 && dist > 1) {
              const pullStrength = 8.5 * dtFactor;
              nextX += (dx / dist) * pullStrength;
              nextY += (dy / dist) * pullStrength;
            }
          }

          return {
            ...c,
            x: nextX,
            y: nextY,
            pulseScale: 1.0 + Math.sin(time * 0.01 + c.y) * 0.1,
          };
        })
        .filter((c) => c.x > -50 && !c.collected);

      // 7. Update Turban Shooter Enemies
      enemiesRef.current = enemiesRef.current
        .map((e) => {
          let nextCooldown = e.shootCooldown - 1 * dtFactor;

          if (nextCooldown <= 0 && !e.destroyed) {
            const targetProjY = e.y + 10;
            const projSpeed = (4.5 + getRandom() * 1.0) * dtFactor;

            projectilesRef.current.push({
              id: `melon_${Date.now()}_${getRandom()}`,
              x: e.x - 20,
              y: targetProjY,
              vx: -projSpeed,
              vy: (getRandom() - 0.5) * 0.3,
              radius: 18,
              rotation: 0,
              destroyed: false,
            });

            SoundManager.play('WHOOSH');
            return { ...e, destroyed: true };
          }

          return { ...e, shootCooldown: nextCooldown };
        })
        .filter((e) => !e.destroyed);

      // 8. Update Watermelon Projectiles
      projectilesRef.current = projectilesRef.current
        .map((m) => ({
          ...m,
          x: m.x + m.vx,
          y: m.y + m.vy,
          rotation: m.rotation - 7 * dtFactor,
        }))
        .filter((m) => m.x > -60 && !m.destroyed);

      // 9. Update Floating Popups
      popupsRef.current = popupsRef.current
        .map((pop) => ({
          ...pop,
          y: pop.y - 1.2 * dtFactor,
          life: pop.life + 1 * dtFactor,
          alpha: Math.max(0, 1 - pop.life / pop.maxLife),
          scale: Math.max(0.9, pop.scale - 0.006 * dtFactor),
        }))
        .filter((pop) => pop.life < pop.maxLife);

      // 10. Update Particles
      particlesRef.current = particlesRef.current
        .map((p) => ({
          ...p,
          x: p.x + p.vx * dtFactor,
          y: p.y + p.vy * dtFactor,
          life: p.life + 1 * dtFactor,
          alpha: Math.max(0, 1 - p.life / pop.maxLife),
        }))
        .filter((p) => p.life < p.maxLife);

      // 11. Precise & Forgiving Circular Hitbox Collisions
      const birdCenterX = birdRef.current.x;
      const birdCenterY = birdRef.current.y;
      const bHitRadius = BIRD_HITBOX_RADIUS;

      // Ground & Ceiling collision check
      if (birdCenterY + bHitRadius >= GROUND_Y || birdCenterY - bHitRadius <= CEILING_Y) {
        SoundManager.playCrash();
        spawnExplosion(birdCenterX, birdCenterY, '#EF4444');
        setGameMode('GAMEOVER');
        return;
      }

      // Check Coin Collections
      coinsRef.current.forEach((c) => {
        if (c.collected) return;
        const dx = birdCenterX - c.x;
        const dy = birdCenterY - c.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < bHitRadius + c.radius + 6) {
          c.collected = true;
          SoundManager.playCoin();
          spawnExplosion(c.x, c.y, '#FACC15', 6);
          spawnPopup(c.x, c.y - 15, '+1 🪙', '#FACC15');
          coinsCountRef.current += 1;
          coinsEarnedRef.current += 1;
          setCoins(coinsCountRef.current);
          setCoinsEarnedThisRun(coinsEarnedRef.current);
          StorageService.addCoins(1);
        }
      });

      // Check PowerUp Collection
      powerUpsRef.current.forEach((p) => {
        if (p.collected) return;
        const dx = birdCenterX - p.x;
        const dy = birdCenterY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < bHitRadius + p.radius + 6) {
          p.collected = true;
          spawnExplosion(p.x, p.y, p.type === 'IRON_DOME' ? '#38BDF8' : '#F59E0B');

          if (p.type === 'IRON_DOME') {
            SoundManager.playPowerUp('IRON_DOME');
            spawnPopup(birdCenterX, birdCenterY - 30, '🛡️ IRON DOME ACTIVE!', '#38BDF8');
            updateQuestProgress('q_powerups', 1);
            birdRef.current.shieldActive = true;
            birdRef.current.shieldTimeRemaining = SHIELD_DURATION_SEC;
          } else if (p.type === 'EXECUTIVE_ORDER') {
            triggerExecutiveOrder();
          } else if (p.type === 'GOLDEN_MAGNET') {
            SoundManager.playPowerUp('GOLDEN_MAGNET');
            spawnPopup(birdCenterX, birdCenterY - 30, '🧲 GOLDEN MAGNET ON!', '#FEF08A');
            updateQuestProgress('q_powerups', 1);
            birdRef.current.magnetActive = true;
            birdRef.current.magnetTimeRemaining = MAGNET_DURATION_SEC;
          }
        }
      });

      // Check Watermelon Projectile Collisions
      projectilesRef.current.forEach((m) => {
        if (m.destroyed) return;
        const dx = birdCenterX - m.x;
        const dy = birdCenterY - m.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < bHitRadius + m.radius) {
          if (birdRef.current.shieldActive) {
            SoundManager.playShieldBreak();
            spawnExplosion(m.x, m.y, '#DC2626', 10);
            spawnPopup(m.x, m.y - 20, '🍉 SLICE SMASHED! +2', '#10B981');
            updateQuestProgress('q_enemies', 1);
            m.destroyed = true;
            scoreRef.current += 2;
            setScore(scoreRef.current);
          } else {
            SoundManager.playCrash();
            spawnExplosion(birdCenterX, birdCenterY, '#EF4444');
            setGameMode('GAMEOVER');
            return;
          }
        }
      });

      // Check Wall Collisions (Forgiving Hitbox)
      const birdBox = {
        left: birdCenterX - bHitRadius,
        right: birdCenterX + bHitRadius,
        top: birdCenterY - bHitRadius,
        bottom: birdCenterY + bHitRadius,
      };

      for (const w of obstaclesRef.current) {
        const wallLeft = w.x;
        const wallRight = w.x + w.width;
        const inHorizontalRange = birdBox.right > wallLeft && birdBox.left < wallRight;

        if (inHorizontalRange) {
          const hitTop = !w.destroyedTop && birdBox.top < w.topHeight;
          const hitBottom = !w.destroyedBottom && birdBox.bottom > GROUND_Y - w.bottomHeight;

          if (hitTop || hitBottom) {
            if (birdRef.current.shieldActive) {
              SoundManager.playShieldBreak();
              spawnExplosion(
                w.x + w.width / 2,
                hitTop ? w.topHeight : GROUND_Y - w.bottomHeight,
                '#D97706'
              );
              if (hitTop) w.destroyedTop = true;
              if (hitBottom) w.destroyedBottom = true;
              scoreRef.current += 2;
              setScore(scoreRef.current);
            } else {
              SoundManager.playCrash();
              spawnExplosion(birdCenterX, birdCenterY, '#EF4444');
              setGameMode('GAMEOVER');
              return;
            }
          }
        }
      }

      // 12. Batch React State Synchronization (Flawless 60 FPS Render)
      setBird({ ...birdRef.current });
      setObstacles([...obstaclesRef.current]);
      setPowerUps([...powerUpsRef.current]);
      setSpawnedCoins([...coinsRef.current]);
      setEnemies([...enemiesRef.current]);
      setWatermelonProjectiles([...projectilesRef.current]);
      setParticles([...particlesRef.current]);
      setPopups([...popupsRef.current]);
      setScrollOffset(scrollOffsetRef.current);

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [gameMode, triggerExecutiveOrder, updateQuestProgress, spawnExplosion, spawnPopup]);

  return {
    gameMode,
    playMode,
    score,
    highScore,
    dailyHighScore,
    playerName,
    setPlayerName: (name: string) => {
      setPlayerName(name);
      StorageService.setPlayerName(name);
    },
    selectedSkin,
    setSelectedSkin: (skin: BirdSkinId) => {
      setSelectedSkin(skin);
      StorageService.setSelectedSkin(skin);
    },
    unlockedSkins,
    buySkin,
    coins,
    coinsEarnedThisRun,
    bird,
    obstacles,
    powerUps,
    spawnedCoins,
    watermelonProjectiles,
    enemies,
    particles,
    popups,
    combo,
    speechBalloon,
    resumeCountdown,
    quests,
    claimQuest,
    rallyStars,
    audioSettings,
    updateAudioSettings: (s: Partial<AudioSettings>) => {
      SoundManager.updateSettings(s);
      setAudioSettings(SoundManager.getSettings());
    },
    scrollOffset,
    screenFlash,
    handleFlap,
    pauseGame,
    resumeGame,
    startGame,
    setGameMode,
  };
};
