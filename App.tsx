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
import { CoinSvg } from './src/components/CoinSvg';
import { WatermelonProjectileSvg } from './src/components/WatermelonProjectileSvg';
import { EnemySvg } from './src/components/EnemySvg';
import { StartMenuModal } from './src/components/StartMenuModal';
import { GameOverModal } from './src/components/GameOverModal';
import { LeaderboardModal } from './src/components/LeaderboardModal';
import { SkinsModal } from './src/components/SkinsModal';
import { PresidentialQuestsModal } from './src/components/PresidentialQuestsModal';
import { SettingsModal } from './src/components/SettingsModal';
import { PauseCountdownModal } from './src/components/PauseCountdownModal';
import { BreakingNewsShareModal } from './src/components/BreakingNewsShareModal';
import { FloatingPopupsOverlay } from './src/components/FloatingPopupsOverlay';
import { SpeechBalloonSvg } from './src/components/SpeechBalloonSvg';

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
    updateAudioSettings,
    scrollOffset,
    screenFlash,
    handleFlap,
    pauseGame,
    resumeGame,
    startGame,
    setGameMode,
  } = useGameEngine();

  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showSkins, setShowSkins] = useState(false);
  const [showQuests, setShowQuests] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);

  const handleQuitToMenu = () => {
    setShowSkins(false);
    setShowLeaderboard(false);
    setShowQuests(false);
    setShowSettings(false);
    setShowShareCard(false);
    setGameMode('MENU');
  };

  const toggleSound = () => {
    updateAudioSettings({ soundEnabled: !audioSettings.soundEnabled });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      <View style={styles.gameArea}>
        {/* Main Touch Flap Layer */}
        <TouchableWithoutFeedback onPress={handleFlap}>
          <View style={StyleSheet.absoluteFill}>
            {/* 1. Dynamic Day/Night Washington Skyline & Ghost Milestone */}
            <BackgroundSkyline
              scrollOffset={scrollOffset}
              score={score}
              highScore={highScore}
            />

            {/* 2. Screen Flash (e.g. Executive Order Blast) */}
            {screenFlash && (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: screenFlash, zIndex: 8 }]} />
            )}

            {/* 3. Obstacles (The Wall with 3D brick relief, Safety lights & Mexican Climbers) */}
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
                      audioSettings.highContrastEnabled && styles.highContrastGlow,
                    ]}
                  >
                    <WallObstacleSvg
                      width={w.width}
                      height={w.topHeight}
                      isTop={true}
                      destroyed={w.destroyedTop}
                    />
                  </View>

                  {/* Bottom Wall with optional Mexican Climber */}
                  <View
                    style={[
                      styles.entityAbsolute,
                      {
                        left: w.x,
                        top: bottomY,
                        width: w.width,
                        height: w.bottomHeight,
                      },
                      audioSettings.highContrastEnabled && styles.highContrastGlow,
                    ]}
                  >
                    <WallObstacleSvg
                      width={w.width}
                      height={w.bottomHeight}
                      isTop={false}
                      destroyed={w.destroyedBottom}
                      hasClimber={w.hasClimber}
                    />
                  </View>
                </React.Fragment>
              );
            })}

            {/* 4. Collectible PowerUps */}
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

            {/* 5. Collectible Golden Presidential Coins */}
            {spawnedCoins.map((c) => (
              <View
                key={c.id}
                style={[
                  styles.entityAbsolute,
                  {
                    left: c.x - c.radius,
                    top: c.y - c.radius,
                  },
                ]}
              >
                <CoinSvg size={c.radius * 2} pulseScale={c.pulseScale} />
              </View>
            ))}

            {/* 6. Flying Watermelon Projectiles */}
            {watermelonProjectiles.map((m) => (
              <View
                key={m.id}
                style={[
                  styles.entityAbsolute,
                  {
                    left: m.x - m.radius,
                    top: m.y - m.radius,
                  },
                ]}
              >
                <WatermelonProjectileSvg size={m.radius * 2} rotation={m.rotation} />
              </View>
            ))}

            {/* 7. Floating Turban Enemies */}
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

            {/* 8. Don Bird Protagonist */}
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

            {/* 9. Comic Visual Speech Balloon Subtitles */}
            <SpeechBalloonSvg
              text={speechBalloon.text}
              visible={speechBalloon.visible}
              x={bird.x}
              y={bird.y}
            />

            {/* 10. Particle Explosions */}
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

            {/* 11. Floating Score & Status Popups */}
            <FloatingPopupsOverlay popups={popups} />
          </View>
        </TouchableWithoutFeedback>

        {/* 12. In-Game HUD Header */}
        {(gameMode === 'PLAYING' || gameMode === 'PAUSED' || gameMode === 'COUNTDOWN') && (
          <View style={styles.hudOverlay}>
            {/* Ratings Score & Combo Multiplier Pill */}
            <View style={[styles.scorePill, combo.isMaxed && styles.scorePillMaxed]}>
              <Text style={styles.scoreLabel}>
                {playMode === 'DAILY' ? '🗓️ DAILY' : 'RATINGS'} {combo.multiplier > 1 ? '• 2X RATINGS' : ''}
              </Text>
              <Text style={[styles.scoreNumber, combo.isMaxed && { color: '#FACC15' }]}>{score}</Text>

              {/* Approval Rating Combo Meter */}
              <View style={styles.comboMeter}>
                <View
                  style={[
                    styles.comboFill,
                    {
                      width: `${(combo.current / combo.max) * 100}%`,
                      backgroundColor: combo.isMaxed ? '#FACC15' : '#38BDF8',
                    },
                  ]}
                />
              </View>
            </View>

            {/* In-Game Coins Badge */}
            <View style={styles.inGameCoinsBadge}>
              <Text style={styles.inGameCoinsText}>🪙 {coins}</Text>
            </View>

            {/* Active Power-Ups Timers */}
            <View style={styles.activePowerUpsRow}>
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

            {/* HUD Actions: Pause & Sound */}
            <View style={styles.hudActionsGroup}>
              <TouchableOpacity
                style={[styles.hudButton, { marginRight: 6 }]}
                onPress={pauseGame}
                activeOpacity={0.7}
              >
                <Text style={styles.hudButtonIcon}>⏸️</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.hudButton}
                onPress={toggleSound}
                activeOpacity={0.7}
              >
                <Text style={styles.hudButtonIcon}>{audioSettings.soundEnabled ? '🔊' : '🔇'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Start Menu Modal */}
      <StartMenuModal
        visible={gameMode === 'MENU' && !showSkins && !showLeaderboard && !showQuests && !showSettings}
        playerName={playerName}
        onPlayerNameChange={setPlayerName}
        highScore={highScore}
        dailyHighScore={dailyHighScore}
        rallyStars={rallyStars}
        coins={coins}
        selectedSkin={selectedSkin}
        onStartGame={startGame}
        onOpenSkins={() => setShowSkins(true)}
        onOpenLeaderboard={() => setShowLeaderboard(true)}
        onOpenQuests={() => setShowQuests(true)}
        onOpenSettings={() => setShowSettings(true)}
      />

      {/* Tactical Pause & Countdown Modal */}
      <PauseCountdownModal
        isPaused={gameMode === 'PAUSED'}
        countdown={resumeCountdown}
        onResume={resumeGame}
        onRestart={() => startGame(playMode)}
        onQuitToMenu={handleQuitToMenu}
      />

      {/* Game Over Modal with Return to Menu */}
      <GameOverModal
        visible={gameMode === 'GAMEOVER' && !showSkins && !showLeaderboard && !showShareCard && !showQuests}
        score={score}
        highScore={highScore}
        coinsEarned={coinsEarnedThisRun}
        playMode={playMode}
        playerName={playerName}
        onRetry={() => startGame(playMode)}
        onQuitToMenu={handleQuitToMenu}
        onOpenSkins={() => setShowSkins(true)}
        onOpenLeaderboard={() => setShowLeaderboard(true)}
        onOpenShareCard={() => setShowShareCard(true)}
        onOpenQuests={() => setShowQuests(true)}
      />

      {/* Breaking News Share Card Modal */}
      <BreakingNewsShareModal
        visible={showShareCard}
        score={score}
        highScore={highScore}
        playerName={playerName}
        selectedSkin={selectedSkin}
        onClose={() => setShowShareCard(false)}
      />

      {/* Skins Wardrobe Modal with Coins Economy */}
      <SkinsModal
        visible={showSkins}
        selectedSkin={selectedSkin}
        highScore={highScore}
        coins={coins}
        unlockedSkins={unlockedSkins}
        onSelectSkin={setSelectedSkin}
        onBuySkin={buySkin}
        onClose={() => setShowSkins(false)}
      />

      {/* Presidential Quests Modal */}
      <PresidentialQuestsModal
        visible={showQuests}
        quests={quests}
        rallyStars={rallyStars}
        onClaimQuest={claimQuest}
        onClose={() => setShowQuests(false)}
      />

      {/* Settings & Accessibility Modal */}
      <SettingsModal
        visible={showSettings}
        settings={audioSettings}
        onUpdateSettings={updateAudioSettings}
        onClose={() => setShowSettings(false)}
      />

      {/* Supabase Global Leaderboard Modal with Dual Tabs */}
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
  highContrastGlow: {
    borderWidth: 2,
    borderColor: '#FACC15',
    shadowColor: '#FACC15',
    shadowOpacity: 0.8,
    shadowRadius: 8,
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
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    alignItems: 'center',
    minWidth: 70,
  },
  scorePillMaxed: {
    borderColor: '#FACC15',
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
    shadowColor: '#FACC15',
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },
  scoreLabel: {
    fontSize: 7.5,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 0.6,
  },
  scoreNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: '#F8FAFC',
  },
  comboMeter: {
    width: 50,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 2,
  },
  comboFill: {
    height: '100%',
  },
  inGameCoinsBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  inGameCoinsText: {
    color: '#FACC15',
    fontSize: 12,
    fontWeight: '900',
  },
  activePowerUpsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  powerUpTimerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(2, 132, 199, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#38BDF8',
  },
  powerUpTimerIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  powerUpTimerBar: {
    width: 65,
  },
  powerUpTimerText: {
    fontSize: 7.5,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  track: {
    height: 3.5,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
  hudActionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hudButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  hudButtonIcon: {
    fontSize: 16,
  },
});
