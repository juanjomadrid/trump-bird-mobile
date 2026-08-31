import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Path,
  Circle,
  Rect,
  G,
  Defs,
  RadialGradient,
  Stop,
  LinearGradient,
  Polygon,
  Text as SvgText,
} from 'react-native-svg';
import { BirdSkinId } from '../types/game';

interface DonBirdSvgProps {
  size?: number;
  rotation?: number;
  shieldActive?: boolean;
  magnetActive?: boolean;
  skinId?: BirdSkinId;
}

export const DonBirdSvg: React.FC<DonBirdSvgProps> = ({
  size = 54,
  rotation = 0,
  shieldActive = false,
  magnetActive = false,
  skinId = 'classic',
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
      <Svg width={size} height={size} viewBox="0 0 64 64">
        <Defs>
          {/* Shield Energy Gradient */}
          <RadialGradient id="shieldGrad" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#38BDF8" stopOpacity="0.25" />
            <Stop offset="70%" stopColor="#0284C7" stopOpacity="0.6" />
            <Stop offset="100%" stopColor="#F59E0B" stopOpacity="0.9" />
          </RadialGradient>

          {/* Golden Toupee Gradient */}
          <LinearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FEF08A" />
            <Stop offset="50%" stopColor="#FACC15" />
            <Stop offset="100%" stopColor="#CA8A04" />
          </LinearGradient>

          {/* Suit Gradient (Classic) */}
          <LinearGradient id="suitGradClassic" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#1E3A8A" />
            <Stop offset="100%" stopColor="#0F172A" />
          </LinearGradient>

          {/* Tuxedo Gradient */}
          <LinearGradient id="suitGradTuxedo" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#1E293B" />
            <Stop offset="100%" stopColor="#000000" />
          </LinearGradient>

          {/* Golfer Polo Gradient */}
          <LinearGradient id="suitGradGolfer" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#F472B6" />
            <Stop offset="100%" stopColor="#DB2777" />
          </LinearGradient>

          {/* MAGA Suit Gradient */}
          <LinearGradient id="suitGradMAGA" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#1E40AF" />
            <Stop offset="100%" stopColor="#991B1B" />
          </LinearGradient>
        </Defs>

        {/* 1. Golden Magnet Attraction Waves */}
        {magnetActive && (
          <G>
            <Circle
              cx="32"
              cy="32"
              r="31"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="2"
              strokeDasharray="4, 4"
              strokeOpacity="0.85"
            />
            <Circle
              cx="32"
              cy="32"
              r="26"
              fill="none"
              stroke="#FBBF24"
              strokeWidth="1.5"
              strokeDasharray="3, 3"
              strokeOpacity="0.6"
            />
          </G>
        )}

        {/* 2. Shield Energy Aura (Iron Dome) */}
        {shieldActive && (
          <G>
            <Circle
              cx="32"
              cy="32"
              r="30"
              fill="url(#shieldGrad)"
              stroke="#38BDF8"
              strokeWidth="2.5"
              strokeDasharray="6, 3"
            />
            <Circle
              cx="32"
              cy="32"
              r="27"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="1.5"
              strokeOpacity="0.8"
            />
          </G>
        )}

        {/* 3. Bird Body (Plump Oval) */}
        <Circle
          cx="30"
          cy="34"
          r="16"
          fill={skinId === 'tuxedo' ? '#F1F5F9' : '#F8FAFC'}
          stroke="#0F172A"
          strokeWidth="2"
        />

        {/* 4. Suit Body by Skin */}
        <Path
          d="M 16,34 C 16,44 24,49 32,49 C 40,49 45,44 45,34 L 41,31 L 20,31 Z"
          fill={
            skinId === 'tuxedo'
              ? 'url(#suitGradTuxedo)'
              : skinId === 'golfer'
              ? 'url(#suitGradGolfer)'
              : skinId === 'maga'
              ? 'url(#suitGradMAGA)'
              : 'url(#suitGradClassic)'
          }
          stroke="#0F172A"
          strokeWidth="1.8"
        />

        {/* 5. Collar & Neckwear */}
        {skinId === 'tuxedo' ? (
          <>
            {/* White Pleated Shirt */}
            <Polygon points="26,31 34,31 30,37" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.8" />
            {/* Red Silk Bowtie */}
            <Path d="M 27,33 L 33,37 L 33,33 L 27,37 Z" fill="#EF4444" stroke="#991B1B" strokeWidth="0.8" />
            <Circle cx="30" cy="35" r="1.5" fill="#DC2626" />
          </>
        ) : skinId === 'golfer' ? (
          <>
            {/* White Golf Polo Collar */}
            <Polygon points="25,31 35,31 30,36" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.8" />
            <Rect x="29" y="36" width="2" height="6" fill="#FFFFFF" />
          </>
        ) : (
          <>
            {/* Standard White Shirt Collar & Power Red Tie */}
            <Polygon points="26,31 34,31 30,37" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.8" />
            <Path
              d="M 28,33 L 32,33 L 33,48 L 30,52 L 27,48 Z"
              fill="#EF4444"
              stroke="#991B1B"
              strokeWidth="1.2"
            />
          </>
        )}

        {/* 6. Wing */}
        <Path
          d="M 18,34 C 14,35 12,40 16,43 C 20,45 24,41 23,36 Z"
          fill={skinId === 'tuxedo' ? '#CBD5E1' : '#E2E8F0'}
          stroke="#0F172A"
          strokeWidth="1.5"
        />

        {/* 7. Expressive Eye / VIP Sunglasses */}
        {skinId === 'tuxedo' ? (
          /* VIP Black & Gold Sunglasses */
          <G>
            <Rect x="34" y="23" width="13" height="9" rx="3" fill="#0F172A" stroke="#F59E0B" strokeWidth="1.5" />
            <Path d="M 32,26 L 35,26" stroke="#F59E0B" strokeWidth="1.8" />
            <Path d="M 37,25 L 43,29" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.6" />
          </G>
        ) : (
          /* Standard Eagle Eye */
          <G>
            <Circle cx="38" cy="27" r="5" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
            <Circle cx="40" cy="27" r="2.2" fill="#1E293B" />
            <Circle cx="41" cy="26" r="0.8" fill="#FFFFFF" />
            {/* Golden determined eyebrow */}
            <Path
              d="M 33,21 Q 38,22 43,24"
              stroke="#CA8A04"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
          </G>
        )}

        {/* 8. Sharp Orange Beak */}
        <Path
          d="M 43,28 L 56,32 L 43,37 Z"
          fill="#F97316"
          stroke="#C2410C"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* 9. Hair & Hats by Skin */}
        {skinId === 'maga' ? (
          /* Red MAGA Baseball Cap */
          <G>
            {/* Peeking blonde hair bangs */}
            <Path d="M 42,20 C 47,20 52,22 54,24" stroke="#FACC15" strokeWidth="2.5" strokeLinecap="round" />
            {/* Cap Dome */}
            <Path
              d="M 17,24 C 16,13 28,9 41,11 C 48,12 51,16 52,22 Z"
              fill="#DC2626"
              stroke="#991B1B"
              strokeWidth="1.8"
            />
            {/* Cap Visor / Bill */}
            <Path
              d="M 40,17 L 57,19 L 55,23 L 38,21 Z"
              fill="#B91C1C"
              stroke="#7F1D1D"
              strokeWidth="1.2"
            />
            {/* White MAGA Text */}
            <SvgText
              x="32"
              y="18"
              fill="#FFFFFF"
              fontSize="6"
              fontWeight="900"
              textAnchor="middle"
            >
              MAGA
            </SvgText>
          </G>
        ) : skinId === 'golfer' ? (
          /* Palm Beach Golf Visor */
          <G>
            {/* Full Hair Volume on top */}
            <Path
              d="M 15,25 C 14,14 26,10 38,11 C 45,11.5 53,16 54,20 C 50,19 46,18 42,17 C 36,15.5 28,16 23,21 C 20,23.5 17,26 15,25 Z"
              fill="url(#hairGrad)"
              stroke="#0F172A"
              strokeWidth="1.8"
            />
            {/* White Visor Band */}
            <Path
              d="M 20,20 L 46,21 L 45,26 L 19,25 Z"
              fill="#FFFFFF"
              stroke="#CBD5E1"
              strokeWidth="1.2"
            />
            {/* Visor Long Peak / Bill */}
            <Path
              d="M 43,21 L 58,23 L 56,27 L 42,25 Z"
              fill="#F8FAFC"
              stroke="#94A3B8"
              strokeWidth="1.2"
            />
            <Circle cx="32" cy="23" r="1.5" fill="#F59E0B" />
          </G>
        ) : (
          /* Iconic Swooping Blonde Toupee (Classic & Tuxedo) */
          <G>
            <Path
              d="M 15,25 C 14,14 26,10 38,11 C 45,11.5 53,16 54,20 C 50,19 46,18 42,17 C 36,15.5 28,16 23,21 C 20,23.5 17,26 15,25 Z"
              fill="url(#hairGrad)"
              stroke="#0F172A"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <Path
              d="M 22,17 C 30,12 42,13 49,17"
              fill="none"
              stroke="#FEF08A"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <Path
              d="M 18,22 C 26,16 35,17 42,20"
              fill="none"
              stroke="#FEF08A"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </G>
        )}
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
