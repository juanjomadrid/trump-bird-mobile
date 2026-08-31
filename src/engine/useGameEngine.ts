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
  FloatingEnemy,
  Particle,
} from '../types/game';
import { SoundManager } from '../services/sound';
import { StorageService } from '../services/storage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Engine constants
const GRAVITY = 0.38;
const JUMP_VELOCITY = -7.2;
const BASE_SCROLL_SPEED = 2.6;
const WALL_WIDTH = 64;
const WALL_GAP = 150;
const BIRD_SIZE = 52;
const GROUND_Y = SCREEN_HEIGHT - 60;
const CEILING_Y = 20;
const SHIELD_DURATION_SEC = 5.0;
const MAGNET_DURATION_SEC = 6.0;

// Deterministic PRNG for Daily Challenge
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
  const [screenFlash, setScreenFlash] = useState<string | null>(null);

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
  const [enemies, setEnemies] = useState<FloatingEnemy[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [scrollOffset, setScrollOffset] = useState(0);

  // Engine loop references
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const nextSpawnDistanceRef = useRef<number>(SCREEN_WIDTH + 80);
  const totalDistanceRef = useRef<number>(0);
  const dailyRngRef = useRef<(() => number) | null>(null);

  // Load stored player data
  useEffect(() => {
    StorageService.getPlayerName().then(setPlayerName);
    StorageService.getHighScore().then(setHighScore);
    StorageService.getSelectedSkin().then(setSelectedSkin);
    StorageService.getDailyHighScore(getTodayKey()).then(setDailyHighScore);
  }, []);

  // Spawn particle explosion
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

  // Flap / Jump Action
  const handleFlap = useCallback(() => {
    if (gameMode !== 'PLAYING') return;

    SoundManager.playFlap();
    setBird((prev) => ({
      ...prev,
      vy: JUMP_VELOCITY,
      rotation: -25,
    }));
  }, [gameMode]);

  // Trigger Executive Order
  const triggerExecutiveOrder = useCallback(() => {
    SoundManager.playPowerUp('EXECUTIVE_ORDER');
    setScreenFlash('rgba(250, 204, 21, 0.45)');
    setTimeout(() => setScreenFlash(null), 400);

    // Obliterate all on-screen obstacles and enemies
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

    setEnemies((prev) =>
      prev.map((e) => {
        spawnExplosion(e.x, e.y, '#EF4444', 10);
        return { ...e, destroyed: true };
      })
    );

    setScore((s) => s + 5);
  }, [spawnExplosion]);

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
      vy: JUMP_VELOCITY * 0.5,
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
    setEnemies([]);
    setParticles([]);
    setScore(0);
    setScrollOffset(0);
    setScreenFlash(null);
    totalDistanceRef.current = 0;
    nextSpawnDistanceRef.current = SCREEN_WIDTH + 100;
    lastTimeRef.current = performance.now();
    setGameMode('PLAYING');
  }, []);

  // Main 60 FPS Game Loop
  useEffect(() => {
    if (gameMode !== 'PLAYING') {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    let isRunning = true;

    const loop = (time: number) => {
      if (!isRunning) return;

      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = time;

      const getRandom = () => (dailyRngRef.current ? dailyRngRef.current() : Math.random());

      const currentSpeed = BASE_SCROLL_SPEED + Math.min(score * 0.04, 2.0);

      // 1. Update Scroll & Spawning
      setScrollOffset((prev) => prev + currentSpeed);
      totalDistanceRef.current += currentSpeed;

      if (totalDistanceRef.current >= nextSpawnDistanceRef.current) {
        nextSpawnDistanceRef.current = totalDistanceRef.current + 220 + getRandom() * 60;

        const availableHeight = GROUND_Y - CEILING_Y - WALL_GAP;
        const minTop = 60;
        const maxTop = availableHeight - 60;
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
        };

        setObstacles((prev) => [...prev, newWall]);

        // 35% chance to spawn a PowerUp (Iron Dome, Executive Order, or Golden Magnet)
        const pRand = getRandom();
        if (pRand < 0.35) {
          const powerUpY = topH + WALL_GAP / 2 + (getRandom() * 40 - 20);
          const type: PowerUpType =
            pRand < 0.15 ? 'IRON_DOME' : pRand < 0.25 ? 'EXECUTIVE_ORDER' : 'GOLDEN_MAGNET';

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

        // 35% chance to spawn a Floating Enemy
        if (getRandom() < 0.35) {
          const enemyY = topH + WALL_GAP / 2 + (getRandom() * 50 - 25);
          setEnemies((prev) => [
            ...prev,
            {
              id: `en_${Date.now()}_${getRandom()}`,
              x: SCREEN_WIDTH + 140,
              y: enemyY,
              baseY: enemyY,
              vy: 0.8,
              floatOffset: getRandom() * Math.PI * 2,
              type: getRandom() > 0.5 ? 'FAKE_NEWS' : 'DEMOCRAT_DONKEY',
              width: 36,
              height: 36,
              destroyed: false,
            },
          ]);
        }
      }

      // 2. Update Bird Physics & Timers
      setBird((prev) => {
        const nextVy = prev.vy + GRAVITY;
        const nextY = prev.y + nextVy;
        const nextRot = Math.min(Math.max(-30, nextVy * 4.5), 70);

        let nextShieldActive = prev.shieldActive;
        let nextShieldTime = prev.shieldTimeRemaining;
        if (nextShieldActive) {
          nextShieldTime = Math.max(0, nextShieldTime - dt);
          if (nextShieldTime <= 0) nextShieldActive = false;
        }

        let nextMagnetActive = prev.magnetActive;
        let nextMagnetTime = prev.magnetTimeRemaining;
        if (nextMagnetActive) {
          nextMagnetTime = Math.max(0, nextMagnetTime - dt);
          if (nextMagnetTime <= 0) nextMagnetActive = false;
        }

        return {
          ...prev,
          y: nextY,
          vy: nextVy,
          rotation: nextRot,
          shieldActive: nextShieldActive,
          shieldTimeRemaining: nextShieldTime,
          magnetActive: nextMagnetActive,
          magnetTimeRemaining: nextMagnetTime,
        };
      });

      // 3. Update Obstacles position & pass detection
      setObstacles((prev) =>
        prev
          .map((w) => {
            const nextX = w.x - currentSpeed;
            if (!w.passed && nextX + w.width < bird.x) {
              setScore((s) => {
                const newScore = s + 1;
                SoundManager.playScore(newScore);

                if (playMode === 'DAILY') {
                  if (newScore > dailyHighScore) {
                    setDailyHighScore(newScore);
                    StorageService.setDailyHighScore(newScore, getTodayKey());
                  }
                } else {
                  if (newScore > highScore) {
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

      // 4. Update PowerUps (with Golden Magnet Attraction)
      setPowerUps((prev) =>
        prev
          .map((p) => {
            let nextX = p.x - currentSpeed;
            let nextY = p.y;

            // If Golden Magnet is active, pull items towards Don Bird!
            if (bird.magnetActive && !p.collected) {
              const dx = bird.x - p.x;
              const dy = bird.y - p.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 260 && dist > 1) {
                const pullStrength = 6.0;
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

      // 5. Update Floating Enemies
      setEnemies((prev) =>
        prev
          .map((e) => {
            const nextX = e.x - currentSpeed * 1.15;
            const nextY = e.baseY + Math.sin(time * 0.004 + e.floatOffset) * 20;
            return {
              ...e,
              x: nextX,
              y: nextY,
            };
          })
          .filter((e) => e.x > -50 && !e.destroyed)
      );

      // 6. Update Particles
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            life: p.life + 1,
            alpha: Math.max(0, 1 - p.life / p.maxLife),
          }))
          .filter((p) => p.life < p.maxLife)
      );

      // 7. Hitbox Collision Checks
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
              setBird((b) => ({
                ...b,
                shieldActive: true,
                shieldTimeRemaining: SHIELD_DURATION_SEC,
              }));
            } else if (p.type === 'EXECUTIVE_ORDER') {
              triggerExecutiveOrder();
            } else if (p.type === 'GOLDEN_MAGNET') {
              SoundManager.playPowerUp('GOLDEN_MAGNET');
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

      // Check Wall Collisions
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

      // Check Enemy Collisions
      enemies.forEach((e) => {
        if (e.destroyed) return;
        const dx = bird.x - e.x;
        const dy = bird.y - e.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < BIRD_SIZE * 0.45 + e.width * 0.45) {
          if (bird.shieldActive) {
            SoundManager.playShieldBreak();
            spawnExplosion(e.x, e.y, e.type === 'FAKE_NEWS' ? '#EF4444' : '#2563EB');
            setEnemies((all) =>
              all.map((item) => (item.id === e.id ? { ...item, destroyed: true } : item))
            );
            setScore((s) => s + 3);
          } else {
            SoundManager.playCrash();
            spawnExplosion(bird.x, bird.y, '#EF4444');
            setGameMode('GAMEOVER');
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
    obstacles,
    enemies,
    spawnExplosion,
    triggerExecutiveOrder,
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
    bird,
    obstacles,
    powerUps,
    enemies,
    particles,
    scrollOffset,
    screenFlash,
    handleFlap,
    startGame,
    setGameMode,
  };
};
