import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BirdSkinId, SkinConfig } from '../types/game';
import { DonBirdSvg } from './DonBirdSvg';

interface SkinsModalProps {
  visible: boolean;
  selectedSkin: BirdSkinId;
  highScore: number;
  onSelectSkin: (skinId: BirdSkinId) => void;
  onClose: () => void;
}

export const SKINS: SkinConfig[] = [
  {
    id: 'classic',
    name: 'Classic Don',
    subtitle: 'Navy Presidential Suit & Red Power Tie',
    unlockScore: 0,
    badge: 'DEFAULT',
    themeColor: '#3B82F6',
  },
  {
    id: 'maga',
    name: 'MAGA Patriot',
    subtitle: 'Red MAGA Cap & Stars and Stripes',
    unlockScore: 10,
    badge: '10+ RATINGS',
    themeColor: '#EF4444',
  },
  {
    id: 'golfer',
    name: 'Palm Beach Golfer',
    subtitle: 'White Sun Visor & Florida Club Polo',
    unlockScore: 25,
    badge: '25+ RATINGS',
    themeColor: '#EC4899',
  },
  {
    id: 'tuxedo',
    name: 'Gala Black-Tie',
    subtitle: 'Silk Tuxedo & VIP Gold Sunglasses',
    unlockScore: 50,
    badge: '50+ RATINGS',
    themeColor: '#F59E0B',
  },
];

export const SkinsModal: React.FC<SkinsModalProps> = ({
  visible,
  selectedSkin,
  highScore,
  onSelectSkin,
  onClose,
}) => {
  // Live flapping showcase state
  const [flapAngle, setFlapAngle] = useState(-5);

  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setFlapAngle((a) => (a === -8 ? 8 : -8));
    }, 280);
    return () => clearInterval(interval);
  }, [visible]);

  const currentSkinConfig = SKINS.find((s) => s.id === selectedSkin) || SKINS[0];

  const getSkinParticlesLabel = (skinId: BirdSkinId) => {
    if (skinId === 'tuxedo') return '💵 $100 CASH BILLS & GOLD SPARKS';
    if (skinId === 'golfer') return '⛳ FLYING GOLF BALLS & FLORIDA LAWN';
    if (skinId === 'maga') return '⭐ RED & BLUE PATRIOT CONFETTI';
    return '✨ WHITE HOUSE BLUE STARS';
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <LinearGradient colors={['#1E293B', '#0F172A']} style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>👔 DON BIRD WARDROBE</Text>
            <Text style={styles.subtitle}>UNLOCK PRESIDENTIAL ATTIRE</Text>
          </View>

          {/* Live Interactive Flapping Showcase */}
          <View style={styles.showcase}>
            <View style={styles.showcaseBird}>
              <DonBirdSvg
                size={86}
                rotation={flapAngle}
                shieldActive={false}
                magnetActive={false}
                skinId={selectedSkin}
              />
            </View>
            <View style={styles.showcaseInfo}>
              <Text style={styles.showcaseTag}>EQUIPPED LOOK</Text>
              <Text style={[styles.showcaseTitle, { color: currentSkinConfig.themeColor }]}>
                {currentSkinConfig.name}
              </Text>
              <Text style={styles.showcaseFX}>
                {getSkinParticlesLabel(selectedSkin)}
              </Text>
            </View>
          </View>

          <ScrollView style={styles.skinsList} showsVerticalScrollIndicator={false}>
            {SKINS.map((skin) => {
              const isUnlocked = highScore >= skin.unlockScore;
              const isSelected = selectedSkin === skin.id;

              return (
                <TouchableOpacity
                  key={skin.id}
                  style={[
                    styles.skinCard,
                    isSelected && styles.skinCardSelected,
                    !isUnlocked && styles.skinCardLocked,
                  ]}
                  onPress={() => {
                    if (isUnlocked) onSelectSkin(skin.id);
                  }}
                  activeOpacity={isUnlocked ? 0.7 : 1}
                >
                  {/* Skin Avatar Preview */}
                  <View style={styles.skinAvatar}>
                    <DonBirdSvg size={52} rotation={0} skinId={skin.id} />
                  </View>

                  {/* Skin Info */}
                  <View style={styles.skinDetails}>
                    <View style={styles.skinNameRow}>
                      <Text style={[styles.skinName, isSelected && { color: skin.themeColor }]}>
                        {skin.name}
                      </Text>
                      {isSelected ? (
                        <View style={[styles.statusBadge, { backgroundColor: '#10B98120', borderColor: '#10B981' }]}>
                          <Text style={[styles.statusBadgeText, { color: '#10B981' }]}>EQUIPPED</Text>
                        </View>
                      ) : isUnlocked ? (
                        <View style={[styles.statusBadge, { backgroundColor: '#38BDF820', borderColor: '#38BDF8' }]}>
                          <Text style={[styles.statusBadgeText, { color: '#38BDF8' }]}>READY</Text>
                        </View>
                      ) : (
                        <View style={[styles.statusBadge, { backgroundColor: '#EF444420', borderColor: '#EF4444' }]}>
                          <Text style={[styles.statusBadgeText, { color: '#EF4444' }]}>🔒 {skin.badge}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.skinSubtitle}>{skin.subtitle}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Close / Confirm */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.closeBtnText}>APPLY & BACK TO RALLY</Text>
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
    maxHeight: '90%',
    borderRadius: 24,
    padding: 18,
    borderWidth: 2,
    borderColor: '#334155',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 19,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 1.5,
    marginTop: 2,
  },
  showcase: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#38BDF8',
    padding: 12,
    marginBottom: 12,
  },
  showcaseBird: {
    width: 86,
    height: 86,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  showcaseInfo: {
    flex: 1,
  },
  showcaseTag: {
    fontSize: 8,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 1.0,
  },
  showcaseTitle: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 4,
  },
  showcaseFX: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FACC15',
  },
  skinsList: {
    marginBottom: 12,
  },
  skinCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: '#1E293B',
  },
  skinCardSelected: {
    borderColor: '#38BDF8',
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
  },
  skinCardLocked: {
    opacity: 0.55,
  },
  skinAvatar: {
    width: 52,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  skinDetails: {
    flex: 1,
  },
  skinNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  skinName: {
    fontSize: 14,
    fontWeight: '900',
    color: '#F8FAFC',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 8,
    fontWeight: '900',
  },
  skinSubtitle: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  closeBtn: {
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
});
