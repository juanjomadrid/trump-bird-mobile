import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, G, Defs, RadialGradient, Stop } from 'react-native-svg';

interface WatermelonProjectileSvgProps {
  size?: number;
  rotation?: number;
}

export const WatermelonProjectileSvg: React.FC<WatermelonProjectileSvgProps> = ({
  size = 32,
  rotation = 0,
}) => {
  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          transform: [{ rotate: `${rotation}deg` }],
        },
      ]}
    >
      <Svg width={size} height={size} viewBox="0 0 40 40">
        <Defs>
          <RadialGradient id="melonGrad" cx="40%" cy="40%" r="60%">
            <Stop offset="0%" stopColor="#FF4D4D" />
            <Stop offset="80%" stopColor="#DC2626" />
            <Stop offset="100%" stopColor="#991B1B" />
          </RadialGradient>
        </Defs>

        <G>
          {/* Green Outer Rind (Curved arc) */}
          <Path
            d="M 6,30 A 24,24 0 0,0 34,30 L 20,8 Z"
            fill="#15803D"
            stroke="#052E16"
            strokeWidth="1.5"
          />

          {/* White/Light Green Inner Rind */}
          <Path
            d="M 8,28 A 21,21 0 0,0 32,28 L 20,11 Z"
            fill="#86EFAC"
          />

          {/* Juicy Red Flesh */}
          <Path
            d="M 10,26 A 18,18 0 0,0 30,26 L 20,13 Z"
            fill="url(#melonGrad)"
          />

          {/* Black Watermelon Seeds */}
          <Circle cx="17" cy="22" r="1.4" fill="#0F172A" />
          <Circle cx="23" cy="22" r="1.4" fill="#0F172A" />
          <Circle cx="20" cy="18" r="1.4" fill="#0F172A" />
          <Circle cx="15" cy="25" r="1.2" fill="#0F172A" />
          <Circle cx="25" cy="25" r="1.2" fill="#0F172A" />
        </G>
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
