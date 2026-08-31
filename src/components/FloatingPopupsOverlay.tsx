import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { FloatingPopup } from '../types/game';

interface Props {
  popups: FloatingPopup[];
}

export const FloatingPopupsOverlay: React.FC<Props> = ({ popups }) => {
  if (!popups || popups.length === 0) return null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {popups.map((p) => (
        <View
          key={p.id}
          style={[
            styles.popupContainer,
            {
              left: p.x - 60,
              top: p.y,
              opacity: p.alpha,
              transform: [{ scale: p.scale }],
            },
          ]}
        >
          <Text style={[styles.popupText, { color: p.color }]}>{p.text}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  popupContainer: {
    position: 'absolute',
    width: 120,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9,
  },
  popupText: {
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowOffset: { width: 1, height: 1.5 },
    textShadowRadius: 3,
    letterSpacing: 0.5,
  },
});
