import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Path, G, Defs, RadialGradient, Stop, Rect, Text as SvgText } from 'react-native-svg';
import { PowerUpType } from '../types/game';

interface PowerUpSvgProps {
  type?: PowerUpType;
  size?: number;
  pulseScale?: number;
}

export const PowerUpSvg: React.FC<PowerUpSvgProps> = ({
  type = 'IRON_DOME',
  size = 38,
  pulseScale = 1.0,
}) => {
  return (
    <View style={[styles.container, { width: size, height: size, transform: [{ scale: pulseScale }] }]}>
      {type === 'EXECUTIVE_ORDER' ? (
        /* Executive Order Presidential Scroll */
        <Svg width={size} height={size} viewBox="0 0 40 40">
          <Defs>
            <RadialGradient id="scrollGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#FEF08A" stopOpacity="0.9" />
              <Stop offset="60%" stopColor="#EAB308" stopOpacity="0.7" />
              <Stop offset="100%" stopColor="#854D0E" stopOpacity="0.2" />
            </RadialGradient>
          </Defs>

          {/* Golden Glow */}
          <Circle cx="20" cy="20" r="18" fill="url(#scrollGlow)" stroke="#FACC15" strokeWidth="1.5" />

          {/* Parchment Scroll */}
          <Rect x="10" y="8" width="20" height="24" rx="2" fill="#FEF3C7" stroke="#92400E" strokeWidth="1.5" />
          <Path d="M 14,13 L 26,13 M 14,18 L 26,18 M 14,23 L 22,23" stroke="#78350F" strokeWidth="1.5" strokeLinecap="round" />

          {/* Red Presidential Wax Seal */}
          <Circle cx="24" cy="24" r="4" fill="#DC2626" stroke="#991B1B" strokeWidth="1" />
          <SvgText x="24" y="26" fill="#FFFFFF" fontSize="4" fontWeight="900" textAnchor="middle">★</SvgText>
        </Svg>
      ) : type === 'GOLDEN_MAGNET' ? (
        /* Golden Magnet */
        <Svg width={size} height={size} viewBox="0 0 40 40">
          <Defs>
            <RadialGradient id="magGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#FDE047" stopOpacity="0.9" />
              <Stop offset="60%" stopColor="#F59E0B" stopOpacity="0.7" />
              <Stop offset="100%" stopColor="#B45309" stopOpacity="0.2" />
            </RadialGradient>
          </Defs>

          {/* Energy Halo */}
          <Circle cx="20" cy="20" r="18" fill="url(#magGlow)" stroke="#FBBF24" strokeWidth="1.5" />

          {/* U-Shaped Magnet Body */}
          <Path
            d="M 11,10 L 11,22 C 11,28 29,28 29,22 L 29,10 L 23,10 L 23,20 C 23,23 17,23 17,20 L 17,10 Z"
            fill="#D97706"
            stroke="#78350F"
            strokeWidth="1.5"
          />
          {/* Silver Magnetic Poles */}
          <Rect x="10" y="8" width="7" height="6" rx="1" fill="#E2E8F0" stroke="#475569" strokeWidth="1" />
          <Rect x="23" y="8" width="7" height="6" rx="1" fill="#E2E8F0" stroke="#475569" strokeWidth="1" />
        </Svg>
      ) : (
        /* Standard Iron Dome Shield */
        <Svg width={size} height={size} viewBox="0 0 40 40">
          <Defs>
            <RadialGradient id="domeGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#38BDF8" stopOpacity="0.9" />
              <Stop offset="60%" stopColor="#0284C7" stopOpacity="0.7" />
              <Stop offset="100%" stopColor="#0369A1" stopOpacity="0.2" />
            </RadialGradient>
          </Defs>

          {/* Outer Pulsating Energy Halo */}
          <Circle cx="20" cy="20" r="18" fill="url(#domeGlow)" stroke="#7DD3FC" strokeWidth="1.5" />

          {/* Golden Defensive Shield Badge */}
          <Path
            d="M 20,7 L 31,11 C 31,21 26,29 20,33 C 14,29 9,21 9,11 Z"
            fill="#F59E0B"
            stroke="#B45309"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Inner Star / Dome Crest */}
          <Path
            d="M 20,13 L 22,18 L 27,18 L 23,21 L 24.5,26 L 20,23 L 15.5,26 L 17,21 L 13,18 L 18,18 Z"
            fill="#FFFFFF"
            stroke="#F59E0B"
            strokeWidth="0.8"
          />
        </Svg>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
