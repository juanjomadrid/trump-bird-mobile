import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, Switch } from 'react-native';
import { AudioSettings } from '../types/game';

interface Props {
  visible: boolean;
  settings: AudioSettings;
  onUpdateSettings: (s: Partial<AudioSettings>) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<Props> = ({
  visible,
  settings,
  onUpdateSettings,
  onClose,
}) => {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.backdrop}>
        <View style={styles.panel}>
          <Text style={styles.badge}>⚙️ WHITE HOUSE PREFERENCES</Text>
          <Text style={styles.title}>AUDIO & ACCESSIBILITY</Text>

          <View style={styles.section}>
            {/* Master Audio */}
            <View style={styles.settingRow}>
              <View style={styles.settingLabelGroup}>
                <Text style={styles.settingTitle}>🔊 Master Game Sound</Text>
                <Text style={styles.settingDesc}>Enable or disable all audio</Text>
              </View>
              <Switch
                value={settings.soundEnabled}
                onValueChange={(val) => onUpdateSettings({ soundEnabled: val })}
                trackColor={{ false: '#334155', true: '#0284C7' }}
                thumbColor={settings.soundEnabled ? '#38BDF8' : '#94A3B8'}
              />
            </View>

            {/* Voice Volume */}
            <View style={styles.settingRow}>
              <View style={styles.settingLabelGroup}>
                <Text style={styles.settingTitle}>🎙️ Satirical Spoken Voices</Text>
                <Text style={styles.settingDesc}>Trump signature commentary & milestone voices</Text>
              </View>
              <Switch
                value={settings.voiceVolume > 0}
                onValueChange={(val) => onUpdateSettings({ voiceVolume: val ? 1.0 : 0.0 })}
                trackColor={{ false: '#334155', true: '#0284C7' }}
                thumbColor={settings.voiceVolume > 0 ? '#38BDF8' : '#94A3B8'}
              />
            </View>

            {/* Haptics */}
            <View style={styles.settingRow}>
              <View style={styles.settingLabelGroup}>
                <Text style={styles.settingTitle}>📳 Haptic Vibrations</Text>
                <Text style={styles.settingDesc}>Tactile flap, collect, and crash feedback</Text>
              </View>
              <Switch
                value={settings.hapticsEnabled}
                onValueChange={(val) => onUpdateSettings({ hapticsEnabled: val })}
                trackColor={{ false: '#334155', true: '#0284C7' }}
                thumbColor={settings.hapticsEnabled ? '#38BDF8' : '#94A3B8'}
              />
            </View>

            {/* High Contrast Mode */}
            <View style={styles.settingRow}>
              <View style={styles.settingLabelGroup}>
                <Text style={styles.settingTitle}>☀️ High Contrast Borders</Text>
                <Text style={styles.settingDesc}>Glowing neon outlines on obstacles for sunlight play</Text>
              </View>
              <Switch
                value={settings.highContrastEnabled}
                onValueChange={(val) => onUpdateSettings({ highContrastEnabled: val })}
                trackColor={{ false: '#334155', true: '#F59E0B' }}
                thumbColor={settings.highContrastEnabled ? '#FACC15' : '#94A3B8'}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.closeBtnText}>SAVE & RETURN</Text>
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
    backgroundColor: '#1E293B',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#38BDF8',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 10,
  },
  badge: {
    fontSize: 9,
    fontWeight: '900',
    color: '#38BDF8',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#F8FAFC',
    marginBottom: 16,
  },
  section: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 14,
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  settingLabelGroup: {
    flex: 1,
    paddingRight: 10,
  },
  settingTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 2,
  },
  settingDesc: {
    fontSize: 10,
    color: '#94A3B8',
  },
  closeBtn: {
    width: '100%',
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
});
