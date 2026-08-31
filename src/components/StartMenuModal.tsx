import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BirdSkinId, PlayMode } from '../types/game';
import { DonBirdSvg } from './DonBirdSvg';

interface StartMenuModalProps {
  visible: boolean;
  playerName: string;
  onPlayerNameChange: (name: string) => void;
  highScore: number;
  dailyHighScore: number;
  rallyStars: number;
  coins: number;
  selectedSkin: BirdSkinId;
  onStartGame: (mode: PlayMode) => void;
  onOpenSkins: () => void;
  onOpenLeaderboard: () => void;
  onOpenQuests: () => void;
  onOpenSettings: () => void;
}

export const StartMenuModal: React.FC<StartMenuModalProps> = ({
  visible,
  playerName,
  onPlayerNameChange,
  highScore,
  dailyHighScore,
  rallyStars,
  coins,
  selectedSkin,
  onStartGame,
  onOpenSkins,
  onOpenLeaderboard,
  onOpenQuests,
  onOpenSettings,
}) => {
  const todayDateStr = new Date().toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <LinearGradient
          colors={['#1E293B', '#0F172A']}
          style={styles.card}
        >
          {/* Top Bar with Slogan & Settings/Coins/Stars */}
          <View style={styles.topHeaderRow}>
            <View style={styles.currencyRow}>
              <View style={styles.coinsPill}>
                <Text style={styles.coinsText}>🪙 {coins}</Text>
              </View>
              <View style={styles.starsPill}>
                <Text style={styles.starsText}>⭐ {rallyStars}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.settingsIconBtn} onPress={onOpenSettings} activeOpacity={0.8}>
              <Text style={styles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>
          </View>

          {/* Game Title */}
          <View style={styles.titleContainer}>
            <View style={styles.sloganBadge}>
              <Text style={styles.sloganText}>🦅 MAKE ARCADE GREAT AGAIN 🦅</Text>
            </View>
            <Text style={styles.titleMain}>TRUMP BIRD</Text>
            <Text style={styles.titleSub}>IRON DEFENSE</Text>
          </View>

          {/* Bird Avatar Preview */}
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={onOpenSkins} activeOpacity={0.8} style={styles.avatarGlow}>
              <DonBirdSvg size={82} rotation={-5} shieldActive={true} skinId={selectedSkin} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onOpenSkins} style={styles.skinTagBtn} activeOpacity={0.8}>
              <Text style={styles.skinTagText}>👔 CHANGE ATTIRE</Text>
            </TouchableOpacity>
          </View>

          {/* Candidate Name Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>CANDIDATE ALIAS:</Text>
            <TextInput
              style={styles.textInput}
              value={playerName}
              onChangeText={onPlayerNameChange}
              placeholder="Enter Candidate Name"
              placeholderTextColor="#64748B"
              maxLength={20}
              autoCorrect={false}
            />
          </View>

          {/* Score Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>ALL-TIME BEST</Text>
              <Text style={styles.statValue}>★ {highScore}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>TODAY ({todayDateStr})</Text>
              <Text style={[styles.statValue, { color: '#38BDF8' }]}>🗓️ {dailyHighScore}</Text>
            </View>
          </View>

          {/* Main Play Buttons */}
          <View style={styles.actionsContainer}>
            {/* Standard Campaign Mode */}
            <TouchableOpacity
              style={styles.primaryPlayBtn}
              onPress={() => onStartGame('STANDARD')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#EF4444', '#B91C1C']}
                style={styles.btnGradient}
              >
                <Text style={styles.primaryPlayBtnText}>🚀 START CAMPAIGN RALLY</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Daily Seeded Challenge */}
            <TouchableOpacity
              style={styles.dailyPlayBtn}
              onPress={() => onStartGame('DAILY')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#0284C7', '#0369A1']}
                style={styles.btnGradient}
              >
                <Text style={styles.dailyPlayBtnText}>🗓️ DAILY RALLY (EQUAL SEED)</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Secondary Buttons Row */}
          <View style={styles.secondaryRow}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={onOpenSkins} activeOpacity={0.8}>
              <Text style={styles.secondaryBtnText}>👔 Wardrobe</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryBtn} onPress={onOpenQuests} activeOpacity={0.8}>
              <Text style={[styles.secondaryBtnText, { color: '#FACC15' }]}>🎖️ Quests</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryBtn} onPress={onOpenLeaderboard} activeOpacity={0.8}>
              <Text style={[styles.secondaryBtnText, { color: '#38BDF8' }]}>🏆 Top 20</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    padding: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#334155',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 16,
  },
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinsPill: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
    marginRight: 6,
  },
  coinsText: {
    color: '#FACC15',
    fontSize: 11,
    fontWeight: '900',
  },
  starsPill: {
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  starsText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '900',
  },
  sloganBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    marginBottom: 4,
  },
  sloganText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#F59E0B',
    letterSpacing: 0.6,
  },
  settingsIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  settingsIcon: {
    fontSize: 15,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  titleMain: {
    fontSize: 26,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: 1.5,
  },
  titleSub: {
    fontSize: 12,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 3,
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: 4,
  },
  avatarGlow: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  skinTagBtn: {
    marginTop: 4,
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  skinTagText: {
    color: '#E2E8F0',
    fontSize: 9,
    fontWeight: '800',
  },
  inputContainer: {
    width: '100%',
    marginVertical: 6,
  },
  inputLabel: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#94A3B8',
    marginBottom: 3,
    letterSpacing: 0.5,
  },
  textInput: {
    backgroundColor: '#0F172A',
    borderWidth: 1.5,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    marginVertical: 6,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingVertical: 7,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  statLabel: {
    fontSize: 7.5,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#F59E0B',
  },
  actionsContainer: {
    width: '100%',
    marginVertical: 4,
  },
  primaryPlayBtn: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 6,
  },
  dailyPlayBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  btnGradient: {
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryPlayBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  dailyPlayBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  secondaryRow: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 8,
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: '#334155',
  },
  secondaryBtnText: {
    color: '#F8FAFC',
    fontSize: 10.5,
    fontWeight: '800',
  },
});
