import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchTopLeaderboard } from '../services/supabase';
import { LeaderboardRecord } from '../types/game';

interface LeaderboardModalProps {
  visible: boolean;
  onClose: () => void;
}

const MEDAL_EMOJIS = ['🥇', '🥈', '🥉'];

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  visible,
  onClose,
}) => {
  const [records, setRecords] = useState<LeaderboardRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = async () => {
    setErrorMessage(null);
    const { data, error } = await fetchTopLeaderboard();
    if (error) {
      setErrorMessage(error);
    } else {
      setRecords(data || []);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    if (visible) {
      setLoading(true);
      loadData();
    }
  }, [visible]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <LinearGradient
          colors={['#1E293B', '#0F172A']}
          style={styles.card}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>🏆 OFFICIAL GLOBAL TOP 20</Text>
            <Text style={styles.subtitle}>CERTIFIED RATINGS & VOTES</Text>
          </View>

          {/* List or Loading */}
          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator color="#F59E0B" size="large" />
              <Text style={styles.loadingText}>Counting certified votes...</Text>
            </View>
          ) : errorMessage ? (
            <View style={styles.centerContainer}>
              <Text style={styles.errorIcon}>📡</Text>
              <Text style={styles.errorText}>Could not connect to Supabase: {errorMessage}</Text>
              <TouchableOpacity style={styles.retryFetchBtn} onPress={loadData}>
                <Text style={styles.retryFetchText}>Retry Connection</Text>
              </TouchableOpacity>
            </View>
          ) : records.length === 0 ? (
            <View style={styles.centerContainer}>
              <Text style={styles.emptyIcon}>🦅</Text>
              <Text style={styles.emptyText}>No records yet! Be the first candidate on the board!</Text>
            </View>
          ) : (
            <ScrollView
              style={styles.scrollList}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F59E0B" />
              }
            >
              {records.map((item, idx) => {
                const isTop3 = idx < 3;
                return (
                  <View
                    key={item.id || `rec_${idx}`}
                    style={[
                      styles.row,
                      isTop3 && styles.rowTop3,
                      idx === 0 && styles.rowFirst,
                    ]}
                  >
                    <View style={styles.rankContainer}>
                      {isTop3 ? (
                        <Text style={styles.medalEmoji}>{MEDAL_EMOJIS[idx]}</Text>
                      ) : (
                        <Text style={styles.rankNumber}>#{idx + 1}</Text>
                      )}
                    </View>

                    <View style={styles.playerInfo}>
                      <Text style={[styles.playerName, isTop3 && styles.playerNameTop3]} numberOfLines={1}>
                        {item.player_name}
                      </Text>
                      <Text style={styles.playerDate}>
                        {new Date(item.created_at).toLocaleDateString()}
                      </Text>
                    </View>

                    <View style={styles.scoreContainer}>
                      <Text style={[styles.scoreValue, isTop3 && styles.scoreValueTop3]}>
                        {item.score}
                      </Text>
                      <Text style={styles.scoreUnit}>RATINGS</Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}

          {/* Close Button */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.closeBtnText}>BACK TO RALLY</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
    borderRadius: 24,
    padding: 20,
    borderWidth: 2,
    borderColor: '#334155',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F59E0B',
    letterSpacing: 1.5,
    marginTop: 2,
  },
  scrollList: {
    maxHeight: 380,
    marginBottom: 14,
  },
  centerContainer: {
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 12,
  },
  errorIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  errorText: {
    color: '#F87171',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  retryFetchBtn: {
    marginTop: 12,
    backgroundColor: '#334155',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryFetchText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  rowTop3: {
    borderColor: 'rgba(245, 158, 11, 0.4)',
    backgroundColor: 'rgba(30, 58, 138, 0.25)',
  },
  rowFirst: {
    borderColor: '#F59E0B',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  rankContainer: {
    width: 32,
    alignItems: 'center',
    marginRight: 6,
  },
  medalEmoji: {
    fontSize: 20,
  },
  rankNumber: {
    fontSize: 13,
    fontWeight: '900',
    color: '#94A3B8',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  playerNameTop3: {
    color: '#FFFFFF',
  },
  playerDate: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#38BDF8',
  },
  scoreValueTop3: {
    color: '#F59E0B',
  },
  scoreUnit: {
    fontSize: 8,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  closeBtn: {
    backgroundColor: '#334155',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
