import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PlayMode } from '../types/game';
import { submitScore } from '../services/supabase';

interface GameOverModalProps {
  visible: boolean;
  score: number;
  highScore: number;
  playMode: PlayMode;
  playerName: string;
  onRetry: () => void;
  onOpenSkins: () => void;
  onOpenLeaderboard: () => void;
}

const SATIRICAL_PUNCHLINES = [
  'ELECTION RIGGED! FAKE NEWS OBSTACLE!',
  'STOP THE COUNT! RECOUNT REQUIRED!',
  'THE RATINGS WERE YUGE UNTIL THE WALL!',
  'TOTAL WITCH HUNT! DEMAND A REMATCH!',
  'UNCONSTITUTIONAL COLLISION!',
  'DISLOYAL GRAVITY INTERFERENCE!',
];

export const GameOverModal: React.FC<GameOverModalProps> = ({
  visible,
  score,
  highScore,
  playMode,
  playerName,
  onRetry,
  onOpenSkins,
  onOpenLeaderboard,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRank, setSubmittedRank] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const punchline = SATIRICAL_PUNCHLINES[score % SATIRICAL_PUNCHLINES.length];
  const isNewRecord = score > 0 && score >= highScore;

  const handleSubmitScore = async () => {
    if (isSubmitting || submittedRank !== null) return;
    setIsSubmitting(true);
    setSubmitError(null);

    const displayName = playMode === 'DAILY' ? `${playerName} [DAILY]` : playerName;
    const res = await submitScore(displayName, score);
    setIsSubmitting(false);

    if (res.success) {
      setSubmittedRank(res.rank || 1);
    } else {
      setSubmitError(res.error || 'Could not reach Supabase servers');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <LinearGradient
          colors={['#1E293B', '#0F172A']}
          style={styles.card}
        >
          {/* Mode Tag */}
          <View style={styles.modeTag}>
            <Text style={styles.modeTagText}>
              {playMode === 'DAILY' ? '🗓️ DAILY RALLY COMPLETED' : '🚀 CAMPAIGN RALLY COMPLETED'}
            </Text>
          </View>

          {/* Headline Punchline */}
          <Text style={styles.headline}>🚨 {punchline} 🚨</Text>

          {isNewRecord && (
            <View style={styles.recordBadge}>
              <Text style={styles.recordBadgeText}>🏆 NEW ALL-TIME RATINGS RECORD!</Text>
            </View>
          )}

          {/* Scores Panel */}
          <View style={styles.scoreContainer}>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreBoxLabel}>RATINGS</Text>
              <Text style={styles.scoreBoxValue}>{score}</Text>
            </View>
            <View style={[styles.scoreBox, { borderLeftWidth: 1, borderLeftColor: '#334155' }]}>
              <Text style={styles.scoreBoxLabel}>BEST RECORD</Text>
              <Text style={[styles.scoreBoxValue, { color: '#F59E0B' }]}>{Math.max(score, highScore)}</Text>
            </View>
          </View>

          {/* Supabase Submit Status / Button */}
          {submittedRank !== null ? (
            <View style={styles.submittedSuccessBox}>
              <Text style={styles.submittedSuccessText}>
                ✅ Certified! Global Rank #{submittedRank} in Records!
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmitScore}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#0284C7', '#0369A1']}
                style={styles.btnGradient}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>📡 SUBMIT TO GLOBAL LEADERBOARD</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          )}

          {submitError && (
            <Text style={styles.errorText}>⚠️ {submitError}</Text>
          )}

          {/* Retry Button */}
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => {
              setSubmittedRank(null);
              setSubmitError(null);
              onRetry();
            }}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#EF4444', '#B91C1C']}
              style={styles.btnGradient}
            >
              <Text style={styles.retryBtnText}>🔁 RUN CAMPAIGN AGAIN</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Bottom Actions Row */}
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
              <Text style={[styles.smallBtnText, { color: '#38BDF8' }]}>🏆 Top 20</Text>
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
    padding: 22,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#334155',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 16,
  },
  modeTag: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 8,
  },
  modeTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
  },
  headline: {
    fontSize: 14,
    fontWeight: '900',
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 18,
  },
  recordBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
    marginBottom: 10,
  },
  recordBadgeText: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '900',
  },
  scoreContainer: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#0F172A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 14,
    overflow: 'hidden',
  },
  scoreBox: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  scoreBoxLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    marginBottom: 2,
  },
  scoreBoxValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#F8FAFC',
  },
  submitBtn: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  btnGradient: {
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  submittedSuccessBox: {
    width: '100%',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10B981',
    marginBottom: 8,
    alignItems: 'center',
  },
  submittedSuccessText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
  errorText: {
    color: '#F87171',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  retryBtn: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 8,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
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
    paddingVertical: 9,
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
