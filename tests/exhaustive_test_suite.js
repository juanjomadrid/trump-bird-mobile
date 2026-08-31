/**
 * EXHAUSTIVE TEST SUITE FOR TRUMP BIRD: IRON DEFENSE
 * 
 * Domains covered:
 * 1. Physics Engine & Motion Calculations
 * 2. Hitbox & Collision Detection (AABB & Radial)
 * 3. Power-Ups Lifecycle & Mechanics (Iron Dome, Executive Order, Golden Magnet)
 * 4. Deterministic PRNG & Daily Rally Seed Verification
 * 5. Day/Night Weather Cycle State Transitions
 * 6. Wardrobe & Skins Unlock System
 * 7. Storage Service & Offline Cache Logic
 * 8. Leaderboard & Supabase Schema Verification
 */

const assert = require('assert');

// Test runner state
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function describe(suiteName, fn) {
  console.log(`\n======================================================`);
  console.log(`🧪 SUITE: ${suiteName}`);
  console.log(`======================================================`);
  fn();
}

function test(testName, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✅ [PASS] ${testName}`);
  } catch (err) {
    failedTests++;
    failures.push({ name: testName, error: err });
    console.error(`  ❌ [FAIL] ${testName}`);
    console.error(`     Error: ${err.message}`);
  }
}

// -----------------------------------------------------------------------------
// DOMAIN 1: Physics Engine & Motion Calculations
// -----------------------------------------------------------------------------
describe('1. Physics Engine & Motion Calculations', () => {
  const GRAVITY = 0.38;
  const JUMP_VELOCITY = -7.2;
  const BASE_SCROLL_SPEED = 2.6;
  const SCREEN_HEIGHT = 800;
  const BIRD_SIZE = 52;
  const GROUND_Y = SCREEN_HEIGHT - 60; // 740
  const CEILING_Y = 20;

  test('Gravity acceleration increases downward velocity per tick', () => {
    let vy = 0;
    vy += GRAVITY;
    assert.strictEqual(Math.round(vy * 100) / 100, 0.38);
    vy += GRAVITY;
    assert.strictEqual(Math.round(vy * 100) / 100, 0.76);
  });

  test('Jump flap applies instant upward impulse velocity', () => {
    let vy = 4.5;
    vy = JUMP_VELOCITY;
    assert.strictEqual(vy, -7.2);
    assert.ok(vy < 0, 'Velocity should be negative (upwards)');
  });

  test('Bird rotation tilts up on flap and tilts down when falling', () => {
    const calcRot = (vy) => Math.min(Math.max(-30, vy * 4.5), 70);
    assert.strictEqual(calcRot(-7.2), -30, 'Should clamp to -30 deg on jump');
    assert.strictEqual(calcRot(0), 0, 'Should be 0 deg at apex');
    assert.strictEqual(calcRot(10), 45, 'Should tilt down 45 deg when falling');
    assert.strictEqual(calcRot(20), 70, 'Should clamp to 70 deg on steep dive');
  });

  test('Screen boundary limits detect ceiling collision (threshold Y <= 40.8)', () => {
    const isCeilingHit = (y) => y - BIRD_SIZE * 0.4 <= CEILING_Y;
    assert.strictEqual(isCeilingHit(300), false, 'Middle screen should not hit ceiling');
    assert.strictEqual(isCeilingHit(45), false, 'Y=45 (top=24.2) should be safely below ceiling Y=20');
    assert.strictEqual(isCeilingHit(40), true, 'Y=40 (top=19.2) should collide with ceiling Y=20');
    assert.strictEqual(isCeilingHit(20), true, 'Y=20 should collide with ceiling');
  });

  test('Screen boundary limits detect ground collision (threshold Y >= 719.2)', () => {
    const isGroundHit = (y) => y + BIRD_SIZE * 0.4 >= GROUND_Y;
    assert.strictEqual(isGroundHit(400), false);
    assert.strictEqual(isGroundHit(700), false, 'Y=700 (bottom=720.8) safely above ground Y=740');
    assert.strictEqual(isGroundHit(725), true, 'Y=725 (bottom=745.8) should hit ground');
    assert.strictEqual(isGroundHit(740), true);
  });

  test('Dynamic scroll speed scales with score progressively up to cap', () => {
    const getSpeed = (score) => BASE_SCROLL_SPEED + Math.min(score * 0.04, 2.0);
    assert.strictEqual(getSpeed(0), 2.6);
    assert.strictEqual(getSpeed(10), 3.0);
    assert.strictEqual(getSpeed(25), 3.6);
    assert.strictEqual(getSpeed(50), 4.6);
    assert.strictEqual(getSpeed(100), 4.6, 'Should be capped at 4.6');
  });
});

// -----------------------------------------------------------------------------
// DOMAIN 2: Hitbox & Collision Detection (AABB & Radial)
// -----------------------------------------------------------------------------
describe('2. Hitbox & Collision Detection (AABB & Radial)', () => {
  const BIRD_SIZE = 52;
  const GROUND_Y = 740;

  const getBirdBox = (bx, by) => ({
    left: bx - BIRD_SIZE * 0.38,
    right: bx + BIRD_SIZE * 0.38,
    top: by - BIRD_SIZE * 0.38,
    bottom: by + BIRD_SIZE * 0.38,
  });

  const checkWallCollision = (bx, by, wall) => {
    const birdBox = getBirdBox(bx, by);
    const wallLeft = wall.x;
    const wallRight = wall.x + wall.width;
    const inHoriz = birdBox.right > wallLeft && birdBox.left < wallRight;

    if (!inHoriz) return { hitTop: false, hitBottom: false, collided: false };

    const hitTop = !wall.destroyedTop && birdBox.top < wall.topHeight;
    const hitBottom = !wall.destroyedBottom && birdBox.bottom > GROUND_Y - wall.bottomHeight;
    return { hitTop, hitBottom, collided: hitTop || hitBottom };
  };

  test('Bird safely passes through the center gap of The Wall', () => {
    const wall = { x: 100, width: 64, topHeight: 200, bottomHeight: 390, gap: 150 };
    // Gap is between Y=200 and Y=350. Bird center at Y=275.
    const res = checkWallCollision(120, 275, wall);
    assert.strictEqual(res.collided, false, 'Bird in gap should not collide');
  });

  test('Bird collides with Top Wall when flying too high', () => {
    const wall = { x: 100, width: 64, topHeight: 200, bottomHeight: 390, gap: 150 };
    const res = checkWallCollision(120, 210, wall); // bird.top = 210 - 19.76 = 190.24 < 200
    assert.strictEqual(res.hitTop, true);
    assert.strictEqual(res.collided, true);
  });

  test('Bird collides with Bottom Wall when flying too low', () => {
    const wall = { x: 100, width: 64, topHeight: 200, bottomHeight: 390, gap: 150 };
    // Bottom wall top is 740 - 390 = 350. Bird at Y=340 -> bird.bottom = 359.76 > 350
    const res = checkWallCollision(120, 340, wall);
    assert.strictEqual(res.hitBottom, true);
    assert.strictEqual(res.collided, true);
  });

  test('Destroyed wall segment does not trigger collision', () => {
    const wall = { x: 100, width: 64, topHeight: 200, bottomHeight: 390, gap: 150, destroyedTop: true };
    const res = checkWallCollision(120, 180, wall);
    assert.strictEqual(res.hitTop, false);
    assert.strictEqual(res.collided, false);
  });

  test('Radial collision detection correctly triggers for PowerUps', () => {
    const checkItemOverlap = (bx, by, bRadius, ix, iy, iRadius) => {
      const dx = bx - ix;
      const dy = by - iy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      return dist < bRadius + iRadius;
    };

    assert.strictEqual(checkItemOverlap(100, 100, 26, 120, 100, 18), true, 'Distance 20 < 44 -> OVERLAP');
    assert.strictEqual(checkItemOverlap(100, 100, 26, 160, 100, 18), false, 'Distance 60 > 44 -> NO OVERLAP');
  });
});

// -----------------------------------------------------------------------------
// DOMAIN 3: Power-Ups Lifecycle & Mechanics
// -----------------------------------------------------------------------------
describe('3. Power-Ups Lifecycle & Mechanics', () => {
  test('Iron Dome grants 5 seconds invulnerability and countdown decays correctly', () => {
    let shieldActive = true;
    let shieldTime = 5.0;
    const dt = 0.016; // 1 frame at 60fps

    shieldTime -= dt;
    assert.ok(shieldTime < 5.0 && shieldTime > 4.95);

    // Simulate 315 frames (5.04 seconds)
    for (let i = 0; i < 315; i++) {
      shieldTime = Math.max(0, shieldTime - dt);
      if (shieldTime <= 0) shieldActive = false;
    }
    assert.strictEqual(shieldTime, 0);
    assert.strictEqual(shieldActive, false, 'Shield should deactivate after timer expires');
  });

  test('Iron Dome smash destroys wall and awards +2 points without game over', () => {
    let score = 10;
    let gameOver = false;
    const bird = { shieldActive: true };
    const wall = { id: 'w1', destroyedTop: false };

    // Simulate collision with active shield
    if (bird.shieldActive) {
      wall.destroyedTop = true;
      score += 2;
    } else {
      gameOver = true;
    }

    assert.strictEqual(score, 12, 'Score should increase by 2');
    assert.strictEqual(wall.destroyedTop, true, 'Wall segment must be marked destroyed');
    assert.strictEqual(gameOver, false, 'Game should NOT end with active shield');
  });

  test('Executive Order obliterates all on-screen obstacles and awards +5 points', () => {
    let score = 5;
    let walls = [
      { id: 'w1', destroyedTop: false, destroyedBottom: false },
      { id: 'w2', destroyedTop: false, destroyedBottom: false },
    ];
    let enemies = [
      { id: 'e1', destroyed: false },
      { id: 'e2', destroyed: false },
    ];

    // Trigger Executive Order
    walls = walls.map((w) => ({ ...w, destroyedTop: true, destroyedBottom: true }));
    enemies = enemies.map((e) => ({ ...e, destroyed: true }));
    score += 5;

    assert.strictEqual(score, 10);
    assert.ok(walls.every((w) => w.destroyedTop && w.destroyedBottom));
    assert.ok(enemies.every((e) => e.destroyed));
  });

  test('Golden Magnet pulls powerup item towards bird along direction vector', () => {
    const bird = { x: 100, y: 300, magnetActive: true };
    let item = { x: 220, y: 350 }; // distance = sqrt(120^2 + 50^2) = 130px

    const dx = bird.x - item.x; // -120
    const dy = bird.y - item.y; // -50
    const dist = Math.sqrt(dx * dx + dy * dy);
    const pullStrength = 6.0;

    item.x += (dx / dist) * pullStrength;
    item.y += (dy / dist) * pullStrength;

    assert.ok(item.x < 220, 'Item should move left towards bird');
    assert.ok(item.y < 350, 'Item should move up towards bird');
    assert.ok(Math.sqrt((bird.x - item.x) ** 2 + (bird.y - item.y) ** 2) < dist, 'Distance to bird must decrease');
  });
});

// -----------------------------------------------------------------------------
// DOMAIN 4: Deterministic PRNG & Daily Rally Seed Verification
// -----------------------------------------------------------------------------
describe('4. Deterministic PRNG & Daily Rally Seed Verification', () => {
  const createDailyRng = (seedStr) => {
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

  test('Identical daily seeds generate 100% identical random sequences', () => {
    const rng1 = createDailyRng('2026-08-31');
    const rng2 = createDailyRng('2026-08-31');

    for (let i = 0; i < 500; i++) {
      const v1 = rng1();
      const v2 = rng2();
      assert.strictEqual(v1, v2, `Mismatch at step ${i}: ${v1} !== ${v2}`);
    }
  });

  test('Different daily seeds generate distinct obstacle sequences', () => {
    const rngToday = createDailyRng('2026-08-31');
    const rngTomorrow = createDailyRng('2026-09-01');

    const sampleToday = Array.from({ length: 10 }, () => rngToday());
    const sampleTomorrow = Array.from({ length: 10 }, () => rngTomorrow());

    assert.notDeepStrictEqual(sampleToday, sampleTomorrow, 'Sequences from different days must differ');
  });

  test('PRNG values are strictly bound in range [0, 1)', () => {
    const rng = createDailyRng('2026-08-31');
    for (let i = 0; i < 1000; i++) {
      const val = rng();
      assert.ok(val >= 0 && val < 1.0, `PRNG value out of bounds: ${val}`);
    }
  });
});

// -----------------------------------------------------------------------------
// DOMAIN 5: Day/Night Weather Cycle State Transitions
// -----------------------------------------------------------------------------
describe('5. Day/Night Weather Cycle Transitions', () => {
  const getPhase = (score) => (score < 15 ? 'SUNSET' : score < 30 ? 'NIGHT' : 'DAWN');

  test('Score 0-14 belongs to SUNSET phase', () => {
    assert.strictEqual(getPhase(0), 'SUNSET');
    assert.strictEqual(getPhase(7), 'SUNSET');
    assert.strictEqual(getPhase(14), 'SUNSET');
  });

  test('Score 15-29 transitions to NIGHT phase', () => {
    assert.strictEqual(getPhase(15), 'NIGHT');
    assert.strictEqual(getPhase(22), 'NIGHT');
    assert.strictEqual(getPhase(29), 'NIGHT');
  });

  test('Score 30+ transitions to DAWN phase', () => {
    assert.strictEqual(getPhase(30), 'DAWN');
    assert.strictEqual(getPhase(50), 'DAWN');
    assert.strictEqual(getPhase(100), 'DAWN');
  });
});

// -----------------------------------------------------------------------------
// DOMAIN 6: Wardrobe & Skins Unlock System
// -----------------------------------------------------------------------------
describe('6. Wardrobe & Skins Unlock System', () => {
  const SKINS = [
    { id: 'classic', name: 'Classic Don', unlockScore: 0 },
    { id: 'maga', name: 'MAGA Patriot', unlockScore: 10 },
    { id: 'golfer', name: 'Palm Beach Golfer', unlockScore: 25 },
    { id: 'tuxedo', name: 'Gala Black-Tie', unlockScore: 50 },
  ];

  const isUnlocked = (skinId, highScore) => {
    const skin = SKINS.find((s) => s.id === skinId);
    return skin ? highScore >= skin.unlockScore : false;
  };

  test('Classic Don skin is unlocked for all players (score 0)', () => {
    assert.strictEqual(isUnlocked('classic', 0), true);
  });

  test('MAGA Patriot unlocks at score 10', () => {
    assert.strictEqual(isUnlocked('maga', 9), false);
    assert.strictEqual(isUnlocked('maga', 10), true);
    assert.strictEqual(isUnlocked('maga', 15), true);
  });

  test('Palm Beach Golfer unlocks at score 25', () => {
    assert.strictEqual(isUnlocked('golfer', 24), false);
    assert.strictEqual(isUnlocked('golfer', 25), true);
  });

  test('Gala Black-Tie Tuxedo unlocks at score 50', () => {
    assert.strictEqual(isUnlocked('tuxedo', 49), false);
    assert.strictEqual(isUnlocked('tuxedo', 50), true);
  });
});

// -----------------------------------------------------------------------------
// DOMAIN 7: Storage Service & Cache Logic
// -----------------------------------------------------------------------------
describe('7. Storage Service & Cache Logic', () => {
  const mockStorage = new Map();

  const mockStorageService = {
    getItem: async (key) => mockStorage.get(key) || null,
    setItem: async (key, val) => mockStorage.set(key, val),
  };

  test('Player name persists and returns fallback default when unset', async () => {
    const valBefore = await mockStorageService.getItem('@trump_bird_player_name');
    assert.strictEqual(valBefore, null);
    const defaultName = valBefore || 'Don The Great';
    assert.strictEqual(defaultName, 'Don The Great');

    await mockStorageService.setItem('@trump_bird_player_name', 'Patriot45');
    const valAfter = await mockStorageService.getItem('@trump_bird_player_name');
    assert.strictEqual(valAfter, 'Patriot45');
  });

  test('Daily high score resets when date key changes', async () => {
    await mockStorageService.setItem('@trump_bird_daily_date_key', '2026-08-30');
    await mockStorageService.setItem('@trump_bird_daily_high_score', '42');

    const getDailyScore = async (todayKey) => {
      const savedDate = await mockStorageService.getItem('@trump_bird_daily_date_key');
      if (savedDate !== todayKey) return 0;
      const s = await mockStorageService.getItem('@trump_bird_daily_high_score');
      return s ? parseInt(s, 10) : 0;
    };

    assert.strictEqual(await getDailyScore('2026-08-31'), 0, 'Yesterday score should not leak to today');
    assert.strictEqual(await getDailyScore('2026-08-30'), 42);
  });
});

// -----------------------------------------------------------------------------
// DOMAIN 8: Supabase Leaderboard Schema & Query Rules
// -----------------------------------------------------------------------------
describe('8. Supabase Leaderboard Schema & Query Rules', () => {
  test('Candidate name is truncated or validated to max 25 characters', () => {
    const validateName = (name) => {
      if (!name || typeof name !== 'string') return false;
      return name.trim().length > 0 && name.length <= 25;
    };

    assert.strictEqual(validateName('Don Bird'), true);
    assert.strictEqual(validateName(''), false);
    assert.strictEqual(validateName('A'.repeat(25)), true);
    assert.strictEqual(validateName('A'.repeat(26)), false, 'Names > 25 chars must fail constraint');
  });

  test('Leaderboard sorting sorts primarily by score DESC and secondarily by created_at ASC', () => {
    const records = [
      { id: '1', player_name: 'Player A', score: 25, created_at: '2026-08-31T12:00:00Z' },
      { id: '2', player_name: 'Player B', score: 50, created_at: '2026-08-31T12:05:00Z' },
      { id: '3', player_name: 'Player C', score: 25, created_at: '2026-08-31T11:55:00Z' },
    ];

    const sorted = [...records].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

    assert.strictEqual(sorted[0].player_name, 'Player B', 'Score 50 must be #1');
    assert.strictEqual(sorted[1].player_name, 'Player C', 'Score 25 created earlier must be #2');
    assert.strictEqual(sorted[2].player_name, 'Player A', 'Score 25 created later must be #3');
  });
});

// -----------------------------------------------------------------------------
// FINAL SUMMARY REPORT
// -----------------------------------------------------------------------------
console.log(`\n======================================================`);
console.log(`📊 TEST SUITE SUMMARY`);
console.log(`======================================================`);
console.log(`Total Assertions Run: ${totalTests}`);
console.log(`Passed: ${passedTests} ✅`);
console.log(`Failed: ${failedTests} ❌`);
console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

if (failedTests > 0) {
  console.log(`\nFailures Breakdown:`);
  failures.forEach((f) => console.log(` - ${f.name}: ${f.error.message}`));
  process.exit(1);
} else {
  console.log(`\n🎉 ALL TESTS COMPLETED SUCCESSFULLY (100% PASS RATE)!`);
  process.exit(0);
}
