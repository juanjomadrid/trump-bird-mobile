import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableWithoutFeedback,
  Dimensions,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { useGameEngine } from './src/engine/useGameEngine';
import { BackgroundSkyline } from './src/components/BackgroundSkyline';
import { DonBirdSvg } from './src/components/DonBirdSvg';
import { WallObstacleSvg } from './src/components/WallObstacleSvg';
import { PowerUpSvg } from './src/components/PowerUpSvg';
import { EnemySvg } from './src/components/EnemySvg';
import { StartMenuModal } from './src/components/StartMenuModal';
import { GameOverModal } from './src/components/GameOverModal';
import { LeaderboardModal } from './src/components/LeaderboardModal';
import { SkinsModal } from './src/components/SkinsModal';
import { SoundManager } from './src/services/sound';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const GROUND_Y = SCREEN_HEIGHT - 60;

export default function App() {
  const {
    gameMode,
    playMode,
    score,
    highScore,
    dailyHighScore,
    playerName,
    setPlayerName,
    selectedSkin,
    setSelectedSkin,
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
  } = useGameEngine();

  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showSkins, setShowSkins] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(SoundManager.isSoundEnabled());

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    SoundManager.setSoundEnabled(next);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Main Game Screen */}
      <TouchableWithoutFeedback onPress={handleFlap}>
        <View style={styles.gameArea}>
          {/* 1. Dynamic Day/Night Washington Skyline */}
          <BackgroundSkyline scrollOffset={scrollOffset} score={score} />

          {/* 2. Screen Flash (e.g. Executive Order) */}
          {screenFlash && (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: screenFlash, zIndex: 8 }]} />
          )}

          {/* 3. Obstacles (The Wall) */}
          {obstacles.map((w) => {
            const bottomY = GROUND_Y - w.bottomHeight;
            return (
              <React.Fragment key={w.id}>
                {/* Top Wall */}
                <View
                  style={[
                    styles.entityAbsolute,
                    {
                      left: w.x,
                      top: 0,
                      width: w.width,
                      height: w.topHeight,
                    },
                  ]}
                >
                  <WallObstacleSvg
                    width={w.width}
                    height={w.topHeight}
                    isTop={true}
                    destroyed={w.destroyedTop}
                  />
                </View>

                {/* Bottom Wall */}
                <View
                  style={[
                    styles.entityAbsolute,
                    {
                      left: w.x,
                      top: bottomY,
                      width: w.width,
                      height: w.bottomHeight,
                    },
                  ]}
                >
                  <WallObstacleSvg
                    width={w.width}
                    height={w.bottomHeight}
                    isTop={false}
                    destroyed={w.destroyedBottom}
                  />
                </View>
              </React.Fragment>
            );
          })}

          {/* 4. Collectible PowerUps (Iron Dome, Executive Order, Golden Magnet) */}
          {powerUps.map((p) => (
            <View
              key={p.id}
              style={[
                styles.entityAbsolute,
                {
                  left: p.x - p.radius,
                  top: p.y - p.radius,
                },
              ]}
            >
              <PowerUpSvg type={p.type} size={p.radius * 2} pulseScale={p.pulseScale} />
            </View>
          ))}

          {/* 5. Floating Enemies (Fake News & Donkeys) */}
          {enemies.map((e) => (
            <View
              key={e.id}
              style={[
                styles.entityAbsolute,
                {
                  left: e.x - e.width / 2,
                  top: e.y - e.height / 2,
                },
              ]}
            >
              <EnemySvg type={e.type} width={e.width} height={e.height} />
            </View>
          ))}

          {/* 6. Don Bird Protagonist (with Selected Skin & Active Auras) */}
          <View
            style={[
              styles.entityAbsolute,
              {
                left: bird.x - bird.width / 2,
                top: bird.y - bird.height / 2,
              },
            ]}
          >
            <DonBirdSvg
              size={bird.width}
              rotation={bird.rotation}
              shieldActive={bird.shieldActive}
              magnetActive={bird.magnetActive}
              skinId={selectedSkin}
            />
          </View>

          {/* 7. Particle Explosions */}
          {particles.map((pt) => (
            <View
              key={pt.id}
              style={[
                styles.entityAbsolute,
                {
                  left: pt.x,
                  top: pt.y,
                  width: pt.size,
                  height: pt.size,
                  borderRadius: pt.size / 2,
                  backgroundColor: pt.color,
                  opacity: pt.alpha,
                },
              ]}
            />
          ))}

          {/* 8. In-Game HUD Header */}
          {gameMode === 'PLAYING' && (
            <View style={styles.hudOverlay}>
              {/* Ratings Score Pill */}
              <View style={styles.scorePill}>
                <Text style={styles.scoreLabel}>
                  {playMode === 'DAILY' ? '🗓️ DAILY RATINGS' : 'RATINGS'}
                </Text>
                <Text style={styles.scoreNumber}>{score}</Text>
              </View>

              {/* Active Power-Ups Timers */}
              <View style={styles.activePowerUpsRow}>
                {/* Iron Dome Shield */}
                {bird.shieldActive && (
                  <View style={styles.powerUpTimerPill}>
                    <Text style={styles.powerUpTimerIcon}>🛡️</Text>
                    <View style={styles.powerUpTimerBar}>
                      <Text style={styles.powerUpTimerText}>
                        DOME: {bird.shieldTimeRemaining.toFixed(1)}s
                      </Text>
                      <View style={styles.track}>
                        <View
                          style={[
                            styles.fill,
                            {
                              width: `${(bird.shieldTimeRemaining / 5.0) * 100}%`,
                              backgroundColor: '#FACC15',
                            },
                          ]}
                        />
                      </View>
                    </View>
                  </View>
                )}

                {/* Golden Magnet */}
                {bird.magnetActive && (
                  <View style={[styles.powerUpTimerPill, { backgroundColor: 'rgba(217, 119, 6, 0.85)', borderColor: '#F59E0B', marginLeft: 6 }]}>
                    <Text style={styles.powerUpTimerIcon}>🧲</Text>
                    <View style={styles.powerUpTimerBar}>
                      <Text style={styles.powerUpTimerText}>
                        MAGNET: {bird.magnetTimeRemaining.toFixed(1)}s
                      </Text>
                      <View style={styles.track}>
                        <View
                          style={[
                            styles.fill,
                            {
                              width: `${(bird.magnetTimeRemaining / 6.0) * 100}%`,
                              backgroundColor: '#FEF08A',
                            },
                          ]}
                        />
                      </View>
                    </View>
                  </View>
                )}
              </View>

              {/* Sound & Voice Toggle Button */}
              <TouchableOpacity
                style={styles.hudButton}
                onPress={toggleSound}
                activeOpacity={0.7}
              >
                <Text style={styles.hudButtonIcon}>{soundEnabled ? '🔊' : '🔇'}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>

      {/* Start Menu Modal */}
      <StartMenuModal
        visible={gameMode === 'MENU'}
        playerName={playerName}
        onPlayerNameChange={setPlayerName}
        highScore={highScore}
        dailyHighScore={dailyHighScore}
        selectedSkin={selectedSkin}
        onStartGame={startGame}
        onOpenSkins={() => setShowSkins(true)}
        onOpenLeaderboard={() => setShowLeaderboard(true)}
      />

      {/* Game Over Modal */}
      <GameOverModal
        visible={gameMode === 'GAMEOVER'}
        score={score}
        highScore={highScore}
        playMode={playMode}
        playerName={playerName}
        onRetry={() => startGame(playMode)}
        onOpenSkins={() => setShowSkins(true)}
        onOpenLeaderboard={() => setShowLeaderboard(true)}
      />

      {/* Skins Wardrobe Modal */}
      <SkinsModal
        visible={showSkins}
        selectedSkin={selectedSkin}
        highScore={highScore}
        onSelectSkin={setSelectedSkin}
        onClose={() => setShowSkins(false)}
      />

      {/* Supabase Global Leaderboard Modal */}
      <LeaderboardModal
        visible={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  gameArea: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  entityAbsolute: {
    position: 'absolute',
    zIndex: 2,
  },
  hudOverlay: {
    position: 'absolute',
    top: 20,
    left: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  scorePill: {
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
  scoreNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: '#F8FAFC',
  },
  activePowerUpsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  powerUpTimerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(2, 132, 199, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#38BDF8',
  },
  powerUpTimerIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  powerUpTimerBar: {
    width: 75,
  },
  powerUpTimerText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  track: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
  hudButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  hudButtonIcon: {
    fontSize: 17,
  },
});
