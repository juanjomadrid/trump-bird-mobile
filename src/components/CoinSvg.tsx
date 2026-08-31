import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Path, G, Defs, RadialGradient, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';

interface CoinSvgProps {
  size?: number;
  pulseScale?: number;
}

export const CoinSvg: React.FC<CoinSvgProps> = ({
  size = 28,
  pulseScale = 1.0,
}) => {
  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          transform: [{ scale: pulseScale }],
        },
      ]}
    >
      <Svg width={size} height={size} viewBox="0 0 32 32">
        <Defs>
          <RadialGradient id="goldCoinGrad" cx="35%" cy="35%" r="65%">
            <Stop offset="0%" stopColor="#FEF08A" />
            <Stop offset="60%" stopColor="#F59E0B" />
            <Stop offset="100%" stopColor="#B45309" />
          </RadialGradient>
          <LinearGradient id="innerRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FDE047" />
            <Stop offset="100%" stopColor="#CA8A04" />
          </LinearGradient>
        </Defs>

        {/* Outer Coin Edge with Gold Bevel */}
        <Circle cx="16" cy="16" r="14" fill="url(#goldCoinGrad)" stroke="#78350F" strokeWidth="1.2" />

        {/* Inner Milled Border */}
        <Circle cx="16" cy="16" r="11" fill="url(#innerRimGrad)" stroke="#FEF08A" strokeWidth="0.8" strokeDasharray="3,1.5" />

        {/* Center Presidential Dollar '$' Sign */}
        <SvgText
          x="16"
          y="20.5"
          fill="#451A03"
          fontSize="14"
          fontWeight="900"
          textAnchor="middle"
        >
          $
        </SvgText>

        {/* Sparkle Glint */}
        <Circle cx="11" cy="11" r="1.5" fill="#FFFFFF" opacity="0.85" />
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
