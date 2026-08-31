import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

interface Props {
  text: string;
  visible: boolean;
  x: number;
  y: number;
}

export const SpeechBalloonSvg: React.FC<Props> = ({ text, visible, x, y }) => {
  if (!visible || !text) return null;

  return (
    <View
      pointerEvents="none"
      style={[
        styles.balloonContainer,
        {
          left: Math.max(16, x - 90),
          top: Math.max(70, y - 85),
        },
      ]}
    >
      <View style={styles.bubble}>
        <Text style={styles.bubbleText}>{text}</Text>
      </View>
      <View style={styles.tail} />
    </View>
  );
};

const styles = StyleSheet.create({
  balloonContainer: {
    position: 'absolute',
    width: 180,
    alignItems: 'center',
    zIndex: 12,
  },
  bubble: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#0F172A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 6,
  },
  bubbleText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: 14,
  },
  tail: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#0F172A',
    alignSelf: 'center',
    marginTop: -1,
  },
});
