import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { PresidentialQuest } from '../types/game';

interface Props {
  visible: boolean;
  quests: PresidentialQuest[];
  rallyStars: number;
  onClaimQuest: (questId: string) => void;
  onClose: () => void;
}

export const PresidentialQuestsModal: React.FC<Props> = ({
  visible,
  quests,
  rallyStars,
  onClaimQuest,
  onClose,
}) => {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.backdrop}>
        <View style={styles.panel}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.badge}>🎖️ WHITE HOUSE ORDERS</Text>
              <Text style={styles.title}>PRESIDENTIAL QUESTS</Text>
            </View>
            <View style={styles.starsPill}>
              <Text style={styles.starsIcon}>⭐</Text>
              <Text style={styles.starsNumber}>{rallyStars}</Text>
            </View>
          </View>

          <Text style={styles.subtitle}>
            Complete executive tasks during rallies to earn Rally Stars and prove your dominance!
          </Text>

          {/* Quests List */}
          <ScrollView style={styles.questsList} showsVerticalScrollIndicator={false}>
            {quests.map((q) => {
              const progressPct = Math.min(100, Math.floor((q.progress / q.target) * 100));

              return (
                <View key={q.id} style={styles.questCard}>
                  <View style={styles.questTopRow}>
                    <Text style={styles.questIcon}>{q.icon}</Text>
                    <View style={styles.questInfo}>
                      <Text style={styles.questTitle}>{q.title}</Text>
                      <Text style={styles.questDesc}>{q.description}</Text>
                    </View>
                    <View style={styles.rewardBadge}>
                      <Text style={styles.rewardText}>+{q.rewardStars} ⭐</Text>
                    </View>
                  </View>

                  {/* Progress Bar & Status */}
                  <View style={styles.progressRow}>
                    <View style={styles.progressBarTrack}>
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            width: `${progressPct}%`,
                            backgroundColor: q.completed ? '#22C55E' : '#38BDF8',
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.progressLabel}>
                      {q.progress}/{q.target}
                    </Text>
                  </View>

                  {/* Claim Button */}
                  {q.completed ? (
                    q.claimed ? (
                      <View style={styles.claimedPill}>
                        <Text style={styles.claimedText}>✓ REWARD CLAIMED</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.claimBtn}
                        onPress={() => onClaimQuest(q.id)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.claimBtnText}>🎁 CLAIM REWARD (+{q.rewardStars} ⭐)</Text>
                      </TouchableOpacity>
                    )
                  ) : null}
                </View>
              );
            })}
          </ScrollView>

          {/* Close Button */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.closeBtnText}>BACK TO OVAL OFFICE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  panel: {
    width: '100%',
    maxWidth: 360,
    maxHeight: '85%',
    backgroundColor: '#1E293B',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#F59E0B',
    padding: 20,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  badge: {
    fontSize: 9,
    fontWeight: '900',
    color: '#F59E0B',
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#F8FAFC',
  },
  starsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
  },
  starsIcon: {
    fontSize: 13,
    marginRight: 4,
  },
  starsNumber: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FACC15',
  },
  subtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 16,
    lineHeight: 15,
  },
  questsList: {
    marginBottom: 16,
  },
  questCard: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 12,
    marginBottom: 10,
  },
  questTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  questIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  questInfo: {
    flex: 1,
  },
  questTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 2,
  },
  questDesc: {
    fontSize: 10,
    color: '#94A3B8',
  },
  rewardBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  rewardText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FACC15',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#334155',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
  },
  progressLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    minWidth: 32,
    textAlign: 'right',
  },
  claimBtn: {
    marginTop: 8,
    backgroundColor: '#22C55E',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  claimBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  claimedPill: {
    marginTop: 8,
    backgroundColor: '#1E293B',
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  claimedText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
  },
  closeBtn: {
    width: '100%',
    backgroundColor: '#334155',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '800',
  },
});
