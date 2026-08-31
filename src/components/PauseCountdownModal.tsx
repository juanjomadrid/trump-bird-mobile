import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal } from 'react-native';

interface Props {
  isPaused: boolean;
  countdown: number | null;
  onResume: () => void;
  onRestart: () => void;
  onQuitToMenu: () => void;
}

export const PauseCountdownModal: React.FC<Props> = ({
  isPaused,
  countdown,
  onResume,
  onRestart,
  onQuitToMenu,
}) => {
  // 1. Render Active Countdown Overlay
  if (countdown !== null) {
    return (
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.countdownOverlay]}>
        <View style={styles.countdownPill}>
          <Text style={styles.countdownLabel}>GET READY!</Text>
          <Text style={styles.countdownNumber}>{countdown}</Text>
        </View>
      </View>
    );
  }

  // 2. Render Tactical Pause Modal
  if (!isPaused) return null;

  return (
    <Modal visible={isPaused} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.panel}>
          <Text style={styles.badge}>⏸️ CAMPAIGN SUSPENDED</Text>
          <Text style={styles.title}>EXECUTIVE TIMEOUT</Text>
          <Text style={styles.subtitle}>
            Take a breath, Mr. President. The Fake News is waiting for your return!
          </Text>

          <TouchableOpacity style={styles.resumeBtn} onPress={onResume} activeOpacity={0.8}>
            <Text style={styles.resumeBtnText}>▶️ RESUME RALLY</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.restartBtn} onPress={onRestart} activeOpacity={0.8}>
            <Text style={styles.restartBtnText}>🔁 RESTART CAMPAIGN</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuBtn} onPress={onQuitToMenu} activeOpacity={0.8}>
            <Text style={styles.menuBtnText}>🏛️ RETURN TO WHITE HOUSE MENU</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  panel: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#1E293B',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#38BDF8',
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  badge: {
    fontSize: 10,
    fontWeight: '900',
    color: '#38BDF8',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 16,
  },
  resumeBtn: {
    width: '100%',
    backgroundColor: '#0284C7',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  resumeBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  restartBtn: {
    width: '100%',
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  restartBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  menuBtn: {
    width: '100%',
    backgroundColor: '#334155',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  menuBtnText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '700',
  },
  countdownOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    zIndex: 15,
  },
  countdownPill: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#F59E0B',
    alignItems: 'center',
    shadowColor: '#F59E0B',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  countdownLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#F59E0B',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  countdownNumber: {
    fontSize: 54,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
