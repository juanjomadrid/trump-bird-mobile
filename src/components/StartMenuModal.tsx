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
  selectedSkin: BirdSkinId;
  onStartGame: (mode: PlayMode) => void;
  onOpenSkins: () => void;
  onOpenLeaderboard: () => void;
}

export const StartMenuModal: React.FC<StartMenuModalProps> = ({
  visible,
  playerName,
  onPlayerNameChange,
  highScore,
  dailyHighScore,
  selectedSkin,
  onStartGame,
  onOpenSkins,
  onOpenLeaderboard,
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
          {/* Top Slogan */}
          <View style={styles.sloganBadge}>
            <Text style={styles.sloganText}>🦅 MAKE ARCADE GREAT AGAIN 🦅</Text>
          </View>

          {/* Game Title */}
          <Text style={styles.titleMain}>TRUMP BIRD</Text>
          <Text style={styles.titleSub}>IRON DEFENSE</Text>

          {/* Animated Don Bird Character Preview with Wardrobe Trigger */}
          <TouchableOpacity
            style={styles.birdPreviewContainer}
            onPress={onOpenSkins}
            activeOpacity={0.8}
          >
            <DonBirdSvg size={84} rotation={-8} shieldActive={true} skinId={selectedSkin} />
            <View style={styles.wardrobePill}>
              <Text style={styles.wardrobePillText}>👔 CHANGE SKIN</Text>
            </View>
          </TouchableOpacity>

          {/* Player Nickname Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>CANDIDATE ALIAS:</Text>
            <TextInput
              style={styles.input}
              value={playerName}
              onChangeText={onPlayerNameChange}
              maxLength={20}
              placeholder="Enter Campaign Name"
              placeholderTextColor="#64748B"
              autoCapitalize="words"
            />
          </View>

          {/* Score Badges Row */}
          <View style={styles.scoreRow}>
            <View style={styles.scoreBadge}>
              <Text style={styles.scoreBadgeLabel}>ALL-TIME BEST</Text>
              <Text style={styles.scoreBadgeVal}>⭐️ {highScore}</Text>
            </View>
            <View style={[styles.scoreBadge, { borderColor: '#38BDF850' }]}>
              <Text style={[styles.scoreBadgeLabel, { color: '#38BDF8' }]}>TODAY ({todayDateStr})</Text>
              <Text style={[styles.scoreBadgeVal, { color: '#38BDF8' }]}>🗓️ {dailyHighScore}</Text>
            </View>
          </View>

          {/* Main Action Buttons */}
          <View style={styles.buttonStack}>
            {/* Standard Campaign Start */}
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => onStartGame('STANDARD')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#EF4444', '#B91C1C']}
                style={styles.btnGradient}
              >
                <Text style={styles.startBtnText}>🚀 START CAMPAIGN RALLY</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Daily Challenge Start */}
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => onStartGame('DAILY')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#0284C7', '#0369A1']}
                style={styles.btnGradient}
              >
                <Text style={styles.dailyBtnText}>🗓️ DAILY RALLY (EQUAL SEED)</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Wardrobe & Leaderboard Row */}
            <View style={styles.bottomRow}>
              <TouchableOpacity
                style={[styles.smallBtn, { marginRight: 8 }]}
                onPress={onOpenSkins}
                activeOpacity={0.8}
              >
                <Text style={styles.smallBtnText}>👔 Wardrobe</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.smallBtn}
                onPress={onOpenLeaderboard}
                activeOpacity={0.8}
              >
                <Text style={[styles.smallBtnText, { color: '#F59E0B' }]}>🏆 Leaderboard</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#334155',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 16,
  },
  sloganBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F59E0B60',
    marginBottom: 6,
  },
  sloganText: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  titleMain: {
    fontSize: 30,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: 1.5,
  },
  titleSub: {
    fontSize: 16,
    fontWeight: '900',
    color: '#38BDF8',
    letterSpacing: 3,
    marginBottom: 8,
  },
  birdPreviewContainer: {
    alignItems: 'center',
    marginVertical: 4,
  },
  wardrobePill: {
    backgroundColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: -4,
    borderWidth: 1,
    borderColor: '#475569',
  },
  wardrobePillText: {
    color: '#F8FAFC',
    fontSize: 10,
    fontWeight: '800',
  },
  inputContainer: {
    width: '100%',
    marginVertical: 8,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    marginBottom: 3,
  },
  input: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#334155',
    paddingHorizontal: 14,
    paddingVertical: 8,
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  scoreRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  scoreBadge: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: '#1E293B',
    alignItems: 'center',
  },
  scoreBadgeLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
  },
  scoreBadgeVal: {
    fontSize: 14,
    fontWeight: '900',
    color: '#F59E0B',
    marginTop: 1,
  },
  buttonStack: {
    width: '100%',
  },
  actionBtn: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 8,
  },
  btnGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  dailyBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  bottomRow: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 2,
  },
  smallBtn: {
    flex: 1,
    backgroundColor: '#1E293B',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  smallBtnText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '800',
  },
});
