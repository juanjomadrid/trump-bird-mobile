import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect, Circle, Path, G, Defs, RadialGradient, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';

interface EnemySvgProps {
  type?: 'TURBAN_SHOOTER';
  width?: number;
  height?: number;
}

export const EnemySvg: React.FC<EnemySvgProps> = ({
  type = 'TURBAN_SHOOTER',
  width = 48,
  height = 48,
}) => {
  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height} viewBox="0 0 54 54">
        <Defs>
          {/* Robe Gradient */}
          <LinearGradient id="robeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#059669" />
            <Stop offset="100%" stopColor="#064E3B" />
          </LinearGradient>
          {/* Turban Gradient */}
          <RadialGradient id="turbanGrad" cx="50%" cy="35%" r="60%">
            <Stop offset="0%" stopColor="#FFFFFF" />
            <Stop offset="70%" stopColor="#E2E8F0" />
            <Stop offset="100%" stopColor="#94A3B8" />
          </RadialGradient>
        </Defs>

        {/* 1. Robe / Torso */}
        <Path
          d="M 16,35 L 38,35 L 44,52 L 10,52 Z"
          fill="url(#robeGrad)"
          stroke="#022C22"
          strokeWidth="1.5"
        />
        {/* Golden Sash Trim */}
        <Path d="M 18,37 L 36,37 L 37,42 L 17,42 Z" fill="#F59E0B" />

        {/* 2. Hands (Holding Watermelon Ready to Sling) */}
        <Circle cx="12" cy="38" r="4" fill="#D97706" stroke="#92400E" strokeWidth="1" />
        <Circle cx="42" cy="36" r="4" fill="#D97706" stroke="#92400E" strokeWidth="1" />

        {/* Mini Ready Watermelon in hand */}
        <Path d="M 40,32 A 6,6 0 0,0 48,32 L 44,25 Z" fill="#DC2626" stroke="#15803D" strokeWidth="1.2" />

        {/* 3. Face Head */}
        <Circle cx="27" cy="27" r="10" fill="#D97706" stroke="#92400E" strokeWidth="1.2" />

        {/* Expressive Beard & Mustache */}
        <Path
          d="M 19,27 C 19,37 35,37 35,27 C 33,32 21,32 19,27 Z"
          fill="#1E293B"
          stroke="#0F172A"
          strokeWidth="1"
        />
        {/* Big Mustache */}
        <Path
          d="M 21,27 Q 27,24 33,27 Q 27,31 21,27 Z"
          fill="#0F172A"
        />

        {/* Eyes & Eyebrows */}
        <Circle cx="23" cy="23" r="2.2" fill="#FFFFFF" />
        <Circle cx="23.5" cy="23" r="1.2" fill="#0F172A" />
        <Circle cx="31" cy="23" r="2.2" fill="#FFFFFF" />
        <Circle cx="31.5" cy="23" r="1.2" fill="#0F172A" />
        {/* Animated determined eyebrows */}
        <Path d="M 20,20 L 26,22" stroke="#0F172A" strokeWidth="1.8" strokeLinecap="round" />
        <Path d="M 34,20 L 28,22" stroke="#0F172A" strokeWidth="1.8" strokeLinecap="round" />

        {/* 4. White Silk Turban */}
        {/* Main Wrapped Dome */}
        <Path
          d="M 14,20 C 12,8 42,8 40,20 C 42,23 37,25 27,25 C 17,25 12,23 14,20 Z"
          fill="url(#turbanGrad)"
          stroke="#475569"
          strokeWidth="1.5"
        />
        {/* Turban Folds / Wrap Layers */}
        <Path d="M 16,16 Q 27,12 38,16" stroke="#CBD5E1" strokeWidth="2" fill="none" />
        <Path d="M 18,20 Q 27,16 36,20" stroke="#CBD5E1" strokeWidth="1.5" fill="none" />

        {/* Central Golden Jewel / Ruby Brooch on Turban */}
        <Circle cx="27" cy="14" r="3" fill="#DC2626" stroke="#F59E0B" strokeWidth="1.2" />
        <Circle cx="26" cy="13" r="0.8" fill="#FFFFFF" />
        <Path d="M 27,11 L 27,6" stroke="#FEF08A" strokeWidth="1.5" strokeLinecap="round" />
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
