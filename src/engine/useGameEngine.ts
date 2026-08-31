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

// Engine physics constants (normalized to 60 FPS tick)
const BASE_GRAVITY = 0.38;
const BASE_JUMP_VELOCITY = -7.4;
const BASE_SCROLL_SPEED = 2.7;
const WALL_WIDTH = 64;
const WALL_GAP = 185; // Expanded for accessible, fluid passage
const BIRD_SIZE = 52;
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

  // Entities state
  const [bird, setBird] = useState<BirdState>({
    x: SCREEN_WIDTH * 0.25,
    y: SCREEN_HEIGHT * 0.45,
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

  // Engine loop references
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const nextSpawnDistanceRef = useRef<number>(SCREEN_WIDTH + 80);
  const totalDistanceRef = useRef<number>(0);
  const dailyRngRef = useRef<(() => number) | null>(null);

  // Load stored data
  useEffect(() => {
    StorageService.getPlayerName().then(setPlayerName);
    StorageService.getHighScore().then(setHighScore);
    StorageService.getSelectedSkin().then(setSelectedSkin);
    StorageService.getUnlockedSkins().then(setUnlockedSkins);
    StorageService.getCoins().then(setCoins);
    StorageService.getDailyHighScore(getTodayKey()).then(setDailyHighScore);
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
          const newProgress = Math.min(q.target, q.progress + amount);
          return {
            ...q,
            progress: newProgress,
            completed: newProgress >= q.target,
          };
        }
        return q;
      });
      StorageService.setQuests(next);
      return next;
    });
  }, []);

  // Claim Quest Reward
  const claimQuest = useCallback((questId: string) => {
    setQuests((prev) => {
      const next = prev.map((q) => {
        if (q.id === questId && q.completed && !q.claimed) {
          setRallyStars((s) => {
            const nextStars = s + q.rewardStars;
            StorageService.setRallyStars(nextStars);
            return nextStars;
          });
          return { ...q, claimed: true };
        }
        return q;
      });
      StorageService.setQuests(next);
      return next;
    });
  }, []);

  // Buy skin with coins
  const buySkin = useCallback((skinId: BirdSkinId, price: number) => {
    if (coins >= price) {
      const newCoins = coins - price;
      setCoins(newCoins);
      StorageService.setCoins(newCoins);
      StorageService.unlockSkin(skinId).then(setUnlockedSkins);
      setSelectedSkin(skinId);
      StorageService.setSelectedSkin(skinId);
      SoundManager.speakSatiricalLine("Tremendous purchase! Looks incredible on me!", true);
    }
  }, [coins]);

  // Spawn Floating Popup
  const spawnPopup = useCallback((x: number, y: number, text: string, color: string = '#FACC15') => {
    setPopups((prev) => [
      ...prev,
      {
        id: `pop_${Date.now()}_${Math.random()}`,
        x,
        y: y - 10,
        text,
        color,
        scale: 1.25,
        alpha: 1.0,
        life: 0,
        maxLife: 42,
      },
    ]);
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
    setParticles((prev) => [...prev, ...newParticles]);
  }, []);

  // Flap / Jump with immediate responsive touch
  const handleFlap = useCallback(() => {
    if (gameMode !== 'PLAYING') return;

    SoundManager.playFlap();
    setBird((prev) => ({
      ...prev,
      vy: BASE_JUMP_VELOCITY,
      rotation: -28, // Instant responsive pitch up
    }));
  }, [gameMode]);

  // Tactical Pause
  const pauseGame = useCallback(() => {
    if (gameMode === 'PLAYING') {
      setGameMode('PAUSED');
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    }
  }, [gameMode]);

  // Resume with 3-2-1 countdown
  const resumeGame = useCallback(() => {
    if (gameMode === 'PAUSED') {
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
  }, [gameMode]);

  // Trigger Executive Order
  const triggerExecutiveOrder = useCallback(() => {
    SoundManager.playPowerUp('EXECUTIVE_ORDER');
    setScreenFlash('rgba(250, 204, 21, 0.45)');
    setTimeout(() => setScreenFlash(null), 380);

    spawnPopup(bird.x, bird.y - 30, '📜 EXECUTIVE BLAST! +5', '#FACC15');
    updateQuestProgress('q_powerups', 1);

    // Obliterate all on-screen obstacles, watermelon projectiles and enemies
    setObstacles((prev) =>
      prev.map((w) => {
        spawnExplosion(w.x + w.width / 2, w.topHeight, '#FACC15', 8);
        spawnExplosion(w.x + w.width / 2, GROUND_Y - w.bottomHeight, '#FACC15', 8);
        return {
          ...w,
          destroyedTop: true,
          destroyedBottom: true,
        };
      })
    );

    setWatermelonProjectiles((prev) =>
      prev.map((p) => {
        spawnExplosion(p.x, p.y, '#DC2626', 8);
        return { ...p, destroyed: true };
      })
    );

    setEnemies((prev) =>
      prev.map((e) => {
        spawnExplosion(e.x, e.y, '#EF4444', 10);
        updateQuestProgress('q_enemies', 1);
        return { ...e, destroyed: true };
      })
    );

    setScore((s) => s + 5);
  }, [bird.x, bird.y, spawnExplosion, spawnPopup, updateQuestProgress]);

  // Start game run
  const startGame = useCallback((mode: PlayMode = 'STANDARD') => {
    setPlayMode(mode);
    if (mode === 'DAILY') {
      dailyRngRef.current = createDailyRng(getTodayKey());
    } else {
      dailyRngRef.current = null;
    }

    setBird({
      x: SCREEN_WIDTH * 0.25,
      y: SCREEN_HEIGHT * 0.42,
      vy: BASE_JUMP_VELOCITY * 0.5,
      rotation: -10,
      width: BIRD_SIZE,
      height: BIRD_SIZE,
      shieldActive: false,
      shieldTimeRemaining: 0,
      magnetActive: false,
      magnetTimeRemaining: 0,
    });
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
    totalDistanceRef.current = 0;
    nextSpawnDistanceRef.current = SCREEN_WIDTH + 100;
    lastTimeRef.current = performance.now();
    setGameMode('PLAYING');
  }, []);

  // Main Butter-Smooth Game Loop (Normalized with Delta Time)
  useEffect(() => {
    if (gameMode !== 'PLAYING') {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    let isRunning = true;

    const loop = (time: number) => {
      if (!isRunning) return;

      // Delta time normalized to 60 FPS (16.67ms = 1.0 unit)
      const rawDtSec = Math.min((time - lastTimeRef.current) / 1000, 0.045);
      const dtFactor = Math.min(rawDtSec / 0.01667, 2.0); // 1.0 at 60 FPS, 0.5 at 120 FPS
      lastTimeRef.current = time;

      const getRandom = () => (dailyRngRef.current ? dailyRngRef.current() : Math.random());
      const currentSpeed = (BASE_SCROLL_SPEED + Math.min(score * 0.035, 1.8)) * dtFactor;

      // 1. Update Scroll & Obstacle / Entity Spawning
      setScrollOffset((prev) => prev + currentSpeed);
      totalDistanceRef.current += currentSpeed;

      if (totalDistanceRef.current >= nextSpawnDistanceRef.current) {
        nextSpawnDistanceRef.current = totalDistanceRef.current + 230 + getRandom() * 60;

        const availableHeight = GROUND_Y - CEILING_Y - WALL_GAP;
        const minTop = 50;
        const maxTop = availableHeight - 50;
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
          hasClimber: getRandom() < 0.40, // 40% chance of Mexican climber on bottom wall
        };

        setObstacles((prev) => [...prev, newWall]);

        // 30% chance to spawn a PowerUp
        const pRand = getRandom();
        if (pRand < 0.30) {
          const powerUpY = topH + WALL_GAP / 2 + (getRandom() * 40 - 20);
          const type: PowerUpType =
            pRand < 0.12 ? 'IRON_DOME' : pRand < 0.22 ? 'EXECUTIVE_ORDER' : 'GOLDEN_MAGNET';

          setPowerUps((prev) => [
            ...prev,
            {
              id: `pw_${Date.now()}_${getRandom()}`,
              x: SCREEN_WIDTH + 80,
              y: powerUpY,
              type,
              radius: 18,
              collected: false,
              pulseScale: 1.0,
            },
          ]);
        }

        // 60% chance to spawn Collectible Golden Coins in safe patterns
        if (getRandom() < 0.60) {
          const coinCount = 1 + Math.floor(getRandom() * 3);
          const newCoins: CoinItem[] = [];
          for (let cIdx = 0; cIdx < coinCount; cIdx++) {
            const coinY = topH + (WALL_GAP / (coinCount + 1)) * (cIdx + 1);
            newCoins.push({
              id: `coin_${Date.now()}_${cIdx}_${getRandom()}`,
              x: SCREEN_WIDTH + 50 + cIdx * 32,
              y: coinY,
              radius: 14,
              collected: false,
              pulseScale: 1.0,
              value: 1,
            });
          }
          setSpawnedCoins((prev) => [...prev, ...newCoins]);
        }

        // 30% chance to spawn a Turban Shooter Enemy on the left/mid screen
        if (getRandom() < 0.30) {
          const enemyY = Math.max(70, Math.min(GROUND_Y - 90, topH + WALL_GAP / 2 + (getRandom() * 80 - 40)));
          setEnemies((prev) => [
            ...prev,
            {
              id: `en_${Date.now()}_${getRandom()}`,
              x: Math.max(30, SCREEN_WIDTH * 0.08 + getRandom() * 40),
              y: enemyY,
              baseY: enemyY,
              vy: 0.6,
              floatOffset: getRandom() * Math.PI * 2,
              type: 'TURBAN_SHOOTER',
              width: 44,
              height: 44,
              shootCooldown: 90 + Math.floor(getRandom() * 80),
              destroyed: false,
            },
          ]);
        }
      }

      // 2. Update Bird Physics & Smooth Rotation Damping (Aerodynamic Lerping)
      setBird((prev) => {
        const nextVy = prev.vy + BASE_GRAVITY * dtFactor;
        const nextY = prev.y + nextVy * dtFactor;

        // Target rotation based on velocity
        const targetRot = Math.min(Math.max(-28, nextVy * 4.6), 65);
        // Exponential smoothing / angular damping
        const smoothRot = prev.rotation + (targetRot - prev.rotation) * Math.min(1.0, 0.24 * dtFactor);

        let nextShieldActive = prev.shieldActive;
        let nextShieldTime = prev.shieldTimeRemaining;
        if (nextShieldActive) {
          nextShieldTime = Math.max(0, nextShieldTime - rawDtSec);
          if (nextShieldTime <= 0) nextShieldActive = false;
        }

        let nextMagnetActive = prev.magnetActive;
        let nextMagnetTime = prev.magnetTimeRemaining;
        if (nextMagnetActive) {
          nextMagnetTime = Math.max(0, nextMagnetTime - rawDtSec);
          if (nextMagnetTime <= 0) nextMagnetActive = false;
        }

        return {
          ...prev,
          y: nextY,
          vy: nextVy,
          rotation: smoothRot,
          shieldActive: nextShieldActive,
          shieldTimeRemaining: nextShieldTime,
          magnetActive: nextMagnetActive,
          magnetTimeRemaining: nextMagnetTime,
        };
      });

      // 3. Update Obstacles position, pass detection & Combo escalation
      setObstacles((prev) =>
        prev
          .map((w) => {
            const nextX = w.x - currentSpeed;
            if (!w.passed && nextX + w.width < bird.x) {
              updateQuestProgress('q_walls', 1);

              // Calculate points with Approval Combo multiplier
              setCombo((c) => {
                const nextCur = c.current + 1;
                const isMax = nextCur >= c.max;
                if (isMax && !c.isMaxed) {
                  SoundManager.playComboMax();
                  spawnPopup(bird.x, bird.y - 35, '🔥 2X APPROVAL MULTIPLIER!', '#F59E0B');
                }
                return {
                  ...c,
                  current: Math.min(c.max, nextCur),
                  multiplier: isMax ? 2 : 1,
                  isMaxed: isMax,
                };
              });

              setScore((s) => {
                const addScore = combo.multiplier;
                const newScore = s + addScore;
                SoundManager.playScore(newScore);

                spawnPopup(
                  bird.x,
                  bird.y - 20,
                  combo.multiplier > 1 ? `+${addScore} (2X COMBO!)` : '+1 VOTE',
                  combo.multiplier > 1 ? '#FACC15' : '#38BDF8'
                );

                if (playMode === 'DAILY') {
                  if (newScore > dailyHighScore) {
                    setDailyHighScore(newScore);
                    StorageService.setDailyHighScore(newScore, getTodayKey());
                  }
                } else {
                  if (newScore > highScore) {
                    if (s <= highScore && newScore > highScore && highScore > 0) {
                      spawnPopup(bird.x, bird.y - 45, '🏆 NEW ALL-TIME RECORD!', '#EC4899');
                    }
                    setHighScore(newScore);
                    StorageService.setHighScore(newScore);
                  }
                }
                return newScore;
              });
              return { ...w, x: nextX, passed: true };
            }
            return { ...w, x: nextX };
          })
          .filter((w) => w.x + w.width > -50)
      );

      // 4. Update PowerUps with Smooth Golden Magnet Attraction
      setPowerUps((prev) =>
        prev
          .map((p) => {
            let nextX = p.x - currentSpeed;
            let nextY = p.y;

            if (bird.magnetActive && !p.collected) {
              const dx = bird.x - p.x;
              const dy = bird.y - p.y;
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
          .filter((p) => p.x > -50 && !p.collected)
      );

      // 5. Update Golden Coins with Magnet Attraction & Rotation Pulse
      setSpawnedCoins((prev) =>
        prev
          .map((c) => {
            let nextX = c.x - currentSpeed;
            let nextY = c.y;

            if (bird.magnetActive && !c.collected) {
              const dx = bird.x - c.x;
              const dy = bird.y - c.y;
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
          .filter((c) => c.x > -50 && !c.collected)
      );

      // 6. Update Turban Shooter Enemies and Watermelon Launch with Fair Safe-Gap Algorithm
      setEnemies((prev) =>
        prev
          .map((e) => {
            const nextY = e.baseY + Math.sin(time * 0.004 + e.floatOffset) * 15;
            let nextCooldown = e.shootCooldown - 1 * dtFactor;

            if (nextCooldown <= 0 && !e.destroyed) {
              nextCooldown = 130 + getRandom() * 80;

              // FAIR GAP CHECK: Calculate safe trajectory Y that NEVER blocks wall gap at passage time
              const activeWallNearBird = obstacles.find((w) => w.x > bird.x - 60 && w.x < bird.x + 200);

              let targetProjY = e.y;
              if (activeWallNearBird) {
                // Aim watermelon strictly at upper or lower solid wall areas away from the open gap
                const shootHigh = getRandom() > 0.5;
                targetProjY = shootHigh
                  ? Math.max(30, activeWallNearBird.topHeight - 35)
                  : Math.min(GROUND_Y - 30, GROUND_Y - activeWallNearBird.bottomHeight + 35);
              }

              const projSpeed = (4.8 + getRandom() * 1.5) * dtFactor;
              setWatermelonProjectiles((all) => [
                ...all,
                {
                  id: `melon_${Date.now()}_${getRandom()}`,
                  x: e.x + e.width / 2,
                  y: targetProjY,
                  vx: projSpeed,
                  vy: (getRandom() - 0.5) * 0.5,
                  radius: 14,
                  rotation: 0,
                  destroyed: false,
                },
              ]);
            }

            return {
              ...e,
              y: nextY,
              shootCooldown: nextCooldown,
            };
          })
          .filter((e) => !e.destroyed)
      );

      // 7. Update Watermelon Projectiles
      setWatermelonProjectiles((prev) =>
        prev
          .map((m) => ({
            ...m,
            x: m.x + m.vx,
            y: m.y + m.vy,
            rotation: m.rotation + 8 * dtFactor,
          }))
          .filter((m) => m.x < SCREEN_WIDTH + 60 && !m.destroyed)
      );

      // 8. Update Floating Popups
      setPopups((prev) =>
        prev
          .map((pop) => ({
            ...pop,
            y: pop.y - 1.2 * dtFactor,
            life: pop.life + 1 * dtFactor,
            alpha: Math.max(0, 1 - pop.life / pop.maxLife),
            scale: Math.max(0.9, pop.scale - 0.006 * dtFactor),
          }))
          .filter((pop) => pop.life < pop.maxLife)
      );

      // 9. Update Speech Balloon Expiration
      if (speechBalloon.visible && Date.now() > speechBalloon.expiresAt) {
        setSpeechBalloon((prev) => ({ ...prev, visible: false }));
      }

      // 10. Update Particles
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx * dtFactor,
            y: p.y + p.vy * dtFactor,
            life: p.life + 1 * dtFactor,
            alpha: Math.max(0, 1 - p.life / p.maxLife),
          }))
          .filter((p) => p.life < p.maxLife)
      );

      // 11. Hitbox Collision Checks
      const birdBox = {
        left: bird.x - BIRD_SIZE * 0.38,
        right: bird.x + BIRD_SIZE * 0.38,
        top: bird.y - BIRD_SIZE * 0.38,
        bottom: bird.y + BIRD_SIZE * 0.38,
      };

      // Ground / Ceiling Crash
      if (bird.y + BIRD_SIZE * 0.4 >= GROUND_Y || bird.y - BIRD_SIZE * 0.4 <= CEILING_Y) {
        SoundManager.playCrash();
        spawnExplosion(bird.x, bird.y, '#EF4444');
        setGameMode('GAMEOVER');
        return;
      }

      // Check Coin Collections
      setSpawnedCoins((prev) =>
        prev.map((c) => {
          if (c.collected) return c;
          const dx = bird.x - c.x;
          const dy = bird.y - c.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < BIRD_SIZE * 0.5 + c.radius) {
            SoundManager.playCoin();
            spawnExplosion(c.x, c.y, '#FACC15', 6);
            spawnPopup(c.x, c.y - 15, '+1 🪙', '#FACC15');
            setCoins((curr) => {
              const updated = curr + 1;
              StorageService.addCoins(1);
              return updated;
            });
            setCoinsEarnedThisRun((n) => n + 1);
            return { ...c, collected: true };
          }
          return c;
        })
      );

      // Check PowerUp Collection
      setPowerUps((prev) =>
        prev.map((p) => {
          if (p.collected) return p;
          const dx = bird.x - p.x;
          const dy = bird.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < BIRD_SIZE * 0.5 + p.radius) {
            spawnExplosion(p.x, p.y, p.type === 'IRON_DOME' ? '#38BDF8' : '#F59E0B');

            if (p.type === 'IRON_DOME') {
              SoundManager.playPowerUp('IRON_DOME');
              spawnPopup(bird.x, bird.y - 30, '🛡️ IRON DOME ACTIVE!', '#38BDF8');
              updateQuestProgress('q_powerups', 1);
              setBird((b) => ({
                ...b,
                shieldActive: true,
                shieldTimeRemaining: SHIELD_DURATION_SEC,
              }));
            } else if (p.type === 'EXECUTIVE_ORDER') {
              triggerExecutiveOrder();
            } else if (p.type === 'GOLDEN_MAGNET') {
              SoundManager.playPowerUp('GOLDEN_MAGNET');
              spawnPopup(bird.x, bird.y - 30, '🧲 GOLDEN MAGNET ON!', '#FEF08A');
              updateQuestProgress('q_powerups', 1);
              setBird((b) => ({
                ...b,
                magnetActive: true,
                magnetTimeRemaining: MAGNET_DURATION_SEC,
              }));
            }

            return { ...p, collected: true };
          }
          return p;
        })
      );

      // Check Watermelon Projectile Collisions
      watermelonProjectiles.forEach((m) => {
        if (m.destroyed) return;
        const dx = bird.x - m.x;
        const dy = bird.y - m.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < BIRD_SIZE * 0.42 + m.radius) {
          if (bird.shieldActive) {
            SoundManager.playShieldBreak();
            spawnExplosion(m.x, m.y, '#DC2626', 10);
            spawnPopup(m.x, m.y - 20, '🍉 SLICE SMASHED! +2', '#10B981');
            updateQuestProgress('q_enemies', 1);
            setWatermelonProjectiles((all) =>
              all.map((item) => (item.id === m.id ? { ...item, destroyed: true } : item))
            );
            setScore((s) => s + 2);
          } else {
            SoundManager.playCrash();
            spawnExplosion(bird.x, bird.y, '#EF4444');
            setGameMode('GAMEOVER');
          }
        }
      });

      // Check Wall Collisions (Climbers on the wall have NO collision)
      obstacles.forEach((w) => {
        const wallLeft = w.x;
        const wallRight = w.x + w.width;
        const inHorizontalRange = birdBox.right > wallLeft && birdBox.left < wallRight;

        if (inHorizontalRange) {
          const hitTop = !w.destroyedTop && birdBox.top < w.topHeight;
          const hitBottom = !w.destroyedBottom && birdBox.bottom > GROUND_Y - w.bottomHeight;

          if (hitTop || hitBottom) {
            if (bird.shieldActive) {
              SoundManager.playShieldBreak();
              spawnExplosion(
                w.x + w.width / 2,
                hitTop ? w.topHeight : GROUND_Y - w.bottomHeight,
                '#D97706'
              );
              setObstacles((all) =>
                all.map((item) =>
                  item.id === w.id
                    ? {
                        ...item,
                        destroyedTop: hitTop ? true : item.destroyedTop,
                        destroyedBottom: hitBottom ? true : item.destroyedBottom,
                      }
                    : item
                )
              );
              setScore((s) => s + 2);
            } else {
              SoundManager.playCrash();
              spawnExplosion(bird.x, bird.y, '#EF4444');
              setGameMode('GAMEOVER');
            }
          }
        }
      });

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [
    gameMode,
    playMode,
    bird.x,
    bird.y,
    bird.shieldActive,
    bird.magnetActive,
    score,
    highScore,
    dailyHighScore,
    combo.multiplier,
    speechBalloon.visible,
    speechBalloon.expiresAt,
    obstacles,
    enemies,
    watermelonProjectiles,
    spawnExplosion,
    spawnPopup,
    triggerExecutiveOrder,
    updateQuestProgress,
  ]);

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
