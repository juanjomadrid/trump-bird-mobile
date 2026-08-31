import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, Share, Alert } from 'react-native';
import { DonBirdSvg } from './DonBirdSvg';
import { BirdSkinId } from '../types/game';

interface Props {
  visible: boolean;
  score: number;
  highScore: number;
  playerName: string;
  selectedSkin: BirdSkinId;
  onClose: () => void;
}

export const BreakingNewsShareModal: React.FC<Props> = ({
  visible,
  score,
  highScore,
  playerName,
  selectedSkin,
  onClose,
}) => {
  if (!visible) return null;

  const getHeadline = () => {
    if (score >= 50) return 'TOTAL LANDSLIDE! HISTORIC 50+ RATINGS RECORD!';
    if (score >= 25) return 'ELECTION NIGHT MIRACLE! MASSIVE CROWD RECORD!';
    if (score >= 10) return 'FAKE NEWS MEDIA IN TOTAL SHAMBLES!';
    return 'BREAKING: SENSATIONAL DEBATE COLLISION REPORTED!';
  };

  const getVerdict = () => {
    if (score >= 50) return 'UNPRECEDENTED VICTORY: Don Bird flies unchallenged through Washington DC skies.';
    if (score >= 25) return 'LANDSLIDE SURGE: Millions of certified votes collected before encountering rogue microphone.';
    if (score >= 10) return 'TREMENDOUS RATINGS: Outperformed all mainstream news networks combined.';
    return 'RECOUNT REQUESTED: A suspicious obstacle has halted the motorcade temporarily.';
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `🚨 BREAKING NEWS 🚨\n"${playerName}" just scored ${score} Certified Ratings in Trump Bird: Iron Defense!\nCan you beat the greatest candidate in history? 🦅🇺🇸 #TrumpBird #IronDefense`,
      });
    } catch {
      Alert.alert('Share', 'Score copied to clipboard!');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* TV / News Header Banner */}
          <View style={styles.tvHeader}>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
            <Text style={styles.networkName}>WHTV • PATRIOT NEWS NETWORK</Text>
            <Text style={styles.dateStamp}>{new Date().toLocaleDateString()}</Text>
          </View>

          {/* Broadcast Headline */}
          <View style={styles.tickerHeader}>
            <Text style={styles.tickerText}>🚨 BREAKING NEWS SPECIAL REPORT 🚨</Text>
          </View>

          {/* Visual Showcase Box */}
          <View style={styles.showcaseBox}>
            <View style={styles.birdAvatar}>
              <DonBirdSvg
                size={84}
                rotation={-8}
                shieldActive={score >= 25}
                magnetActive={score >= 50}
                skinId={selectedSkin}
              />
            </View>

            <View style={styles.statsColumn}>
              <Text style={styles.candidateLabel}>OFFICIAL CANDIDATE</Text>
              <Text style={styles.candidateName}>{playerName}</Text>

              <View style={styles.scoreRow}>
                <View style={styles.scoreBox}>
                  <Text style={styles.scoreTitle}>RATINGS</Text>
                  <Text style={styles.scoreBig}>{score}</Text>
                </View>
                <View style={styles.scoreBox}>
                  <Text style={styles.scoreTitle}>BEST RECORD</Text>
                  <Text style={styles.scoreRecord}>{Math.max(score, highScore)}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Main Headline & Analysis */}
          <View style={styles.headlineBox}>
            <Text style={styles.mainHeadline}>{getHeadline()}</Text>
            <Text style={styles.verdictText}>{getVerdict()}</Text>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.8}>
            <Text style={styles.shareBtnText}>📣 BROADCAST TO SOCIAL MEDIA</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.closeBtnText}>CLOSE REPORT</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#0F172A',
    borderRadius: 20,
    borderWidth: 2.5,
    borderColor: '#DC2626',
    overflow: 'hidden',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  tvHeader: {
    backgroundColor: '#1E293B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginRight: 4,
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  networkName: {
    color: '#F8FAFC',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dateStamp: {
    color: '#94A3B8',
    fontSize: 9,
  },
  tickerHeader: {
    backgroundColor: '#DC2626',
    paddingVertical: 4,
    alignItems: 'center',
  },
  tickerText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  showcaseBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1E293B',
  },
  birdAvatar: {
    width: 90,
    height: 90,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  statsColumn: {
    flex: 1,
  },
  candidateLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
  candidateName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  scoreRow: {
    flexDirection: 'row',
    gap: 8,
  },
  scoreBox: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  scoreTitle: {
    fontSize: 7,
    fontWeight: '900',
    color: '#94A3B8',
  },
  scoreBig: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FACC15',
  },
  scoreRecord: {
    fontSize: 18,
    fontWeight: '900',
    color: '#38BDF8',
  },
  headlineBox: {
    padding: 14,
    backgroundColor: '#0F172A',
  },
  mainHeadline: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FACC15',
    marginBottom: 6,
    lineHeight: 17,
  },
  verdictText: {
    fontSize: 11,
    color: '#CBD5E1',
    lineHeight: 15,
  },
  shareBtn: {
    marginHorizontal: 14,
    marginBottom: 8,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  shareBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  closeBtn: {
    marginHorizontal: 14,
    marginBottom: 14,
    backgroundColor: '#334155',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
  },
});
