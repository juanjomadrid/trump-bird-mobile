import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect, Circle, Path, G, Text as SvgText } from 'react-native-svg';

interface EnemySvgProps {
  type: 'FAKE_NEWS' | 'DEMOCRAT_DONKEY';
  width?: number;
  height?: number;
}

export const EnemySvg: React.FC<EnemySvgProps> = ({
  type,
  width = 44,
  height = 44,
}) => {
  if (type === 'FAKE_NEWS') {
    return (
      <View style={[styles.container, { width, height }]}>
        <Svg width={width} height={height} viewBox="0 0 48 48">
          {/* Microphone Head */}
          <Rect x="17" y="10" width="14" height="22" rx="7" fill="#64748B" stroke="#0F172A" strokeWidth="2" />
          <Path d="M 17,21 L 31,21 M 17,16 L 31,16 M 17,26 L 31,26" stroke="#94A3B8" strokeWidth="1.5" />

          {/* Microphone Stand */}
          <Path d="M 14,24 C 14,33 34,33 34,24" fill="none" stroke="#0F172A" strokeWidth="2.5" />
          <Path d="M 24,32 L 24,40 M 18,40 L 30,40" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />

          {/* Red "FAKE" News Badge Box */}
          <Rect x="6" y="2" width="36" height="12" rx="3" fill="#DC2626" stroke="#7F1D1D" strokeWidth="1.5" />
          <SvgText
            x="24"
            y="11"
            fill="#FFFFFF"
            fontSize="8"
            fontWeight="900"
            textAnchor="middle"
          >
            FAKE NEWS
          </SvgText>
        </Svg>
      </View>
    );
  }

  // DEMOCRAT DONKEY
  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height} viewBox="0 0 48 48">
        {/* Donkey Head/Body */}
        <Circle cx="24" cy="26" r="16" fill="#2563EB" stroke="#1E3A8A" strokeWidth="2" />

        {/* Long Ears */}
        <Path d="M 16,18 L 12,4 C 15,3 18,9 18,15 Z" fill="#1D4ED8" stroke="#1E3A8A" strokeWidth="1.5" />
        <Path d="M 26,16 L 28,3 C 31,3 32,8 30,15 Z" fill="#1D4ED8" stroke="#1E3A8A" strokeWidth="1.5" />

        {/* Snout */}
        <Rect x="14" y="26" width="20" height="12" rx="6" fill="#93C5FD" stroke="#1E3A8A" strokeWidth="1.5" />
        <Circle cx="19" cy="32" r="1.5" fill="#1E3A8A" />
        <Circle cx="29" cy="32" r="1.5" fill="#1E3A8A" />

        {/* Eye */}
        <Circle cx="24" cy="20" r="3.5" fill="#FFFFFF" stroke="#1E3A8A" strokeWidth="1" />
        <Circle cx="25" cy="20" r="1.5" fill="#0F172A" />

        {/* 4 Stars on side */}
        <SvgText x="8" y="28" fill="#FFFFFF" fontSize="10">★</SvgText>
        <SvgText x="34" y="28" fill="#FFFFFF" fontSize="10">★</SvgText>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
