import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Rect, Path, Circle, Defs, LinearGradient, Stop, G, Text as SvgText } from 'react-native-svg';
import { DayNightPhase } from '../types/game';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BackgroundSkylineProps {
  scrollOffset: number;
  score: number;
  highScore?: number;
}

export const BackgroundSkyline: React.FC<BackgroundSkylineProps> = ({
  scrollOffset,
  score,
  highScore = 0,
}) => {
  const bgOffset = (scrollOffset * 0.3) % SCREEN_WIDTH;
  const cloudOffset = (scrollOffset * 0.15) % SCREEN_WIDTH;

  // Determine Day/Night Phase based on Score
  const phase: DayNightPhase = score < 15 ? 'SUNSET' : score < 30 ? 'NIGHT' : 'DAWN';

  // Compute Ghost Milestone position (if player has a high score)
  const milestoneDistance = highScore > 0 ? highScore * 240 : -9999;
  const milestoneScreenX = milestoneDistance - scrollOffset + SCREEN_WIDTH * 0.25;
  const showMilestone = highScore > 0 && milestoneScreenX > -100 && milestoneScreenX < SCREEN_WIDTH + 100;

  return (
    <View style={StyleSheet.absoluteFill}>
      <Svg width={SCREEN_WIDTH} height={SCREEN_HEIGHT} style={StyleSheet.absoluteFill}>
        <Defs>
          {/* Sunset Gradient */}
          <LinearGradient id="skySunset" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#0F172A" />
            <Stop offset="40%" stopColor="#1E293B" />
            <Stop offset="75%" stopColor="#334155" />
            <Stop offset="100%" stopColor="#D97706" />
          </LinearGradient>

          {/* Midnight Neon Gradient */}
          <LinearGradient id="skyNight" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#020617" />
            <Stop offset="40%" stopColor="#0F172A" />
            <Stop offset="75%" stopColor="#1E1B4B" />
            <Stop offset="100%" stopColor="#312E81" />
          </LinearGradient>

          {/* Golden Dawn Gradient */}
          <LinearGradient id="skyDawn" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#1E293B" />
            <Stop offset="30%" stopColor="#475569" />
            <Stop offset="65%" stopColor="#F59E0B" />
            <Stop offset="100%" stopColor="#FEF08A" />
          </LinearGradient>

          <LinearGradient id="buildingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={phase === 'NIGHT' ? '#0F172A' : '#1E293B'} stopOpacity="0.85" />
            <Stop offset="100%" stopColor="#020617" stopOpacity="0.98" />
          </LinearGradient>
        </Defs>

        {/* 1. Dynamic Sky */}
        <Rect
          width={SCREEN_WIDTH}
          height={SCREEN_HEIGHT}
          fill={
            phase === 'NIGHT'
              ? 'url(#skyNight)'
              : phase === 'DAWN'
              ? 'url(#skyDawn)'
              : 'url(#skySunset)'
          }
        />

        {/* Night Stars */}
        {phase === 'NIGHT' && (
          <G>
            <Circle cx={40} cy={80} r={1.5} fill="#FFFFFF" opacity={0.8} />
            <Circle cx={120} cy={50} r={2} fill="#FDE047" opacity={0.9} />
            <Circle cx={210} cy={110} r={1.5} fill="#FFFFFF" opacity={0.7} />
            <Circle cx={290} cy={60} r={2.2} fill="#FFFFFF" opacity={0.9} />
            <Circle cx={340} cy={95} r={1.5} fill="#FDE047" opacity={0.8} />
          </G>
        )}

        {/* 2. Clouds */}
        <Path
          d={`M ${-cloudOffset + 30},120 Q ${-cloudOffset + 60},90 ${-cloudOffset + 90},120 Q ${-cloudOffset + 120},100 ${-cloudOffset + 150},120 Z
              M ${-cloudOffset + SCREEN_WIDTH + 30},120 Q ${-cloudOffset + SCREEN_WIDTH + 60},90 ${-cloudOffset + SCREEN_WIDTH + 90},120 Q ${-cloudOffset + SCREEN_WIDTH + 120},100 ${-cloudOffset + SCREEN_WIDTH + 150},120 Z
              M ${-cloudOffset + 240},180 Q ${-cloudOffset + 280},150 ${-cloudOffset + 320},180 Z
              M ${-cloudOffset + SCREEN_WIDTH + 240},180 Q ${-cloudOffset + SCREEN_WIDTH + 280},150 ${-cloudOffset + SCREEN_WIDTH + 320},180 Z`}
          fill={phase === 'NIGHT' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.18)'}
        />

        {/* 3. Washington Monument & Capitol Dome & Gold Towers Backdrop */}
        <Path
          d={`M ${-bgOffset},${SCREEN_HEIGHT - 60} 
              L ${-bgOffset + 40},${SCREEN_HEIGHT - 180} 
              L ${-bgOffset + 48},${SCREEN_HEIGHT - 260} 
              L ${-bgOffset + 56},${SCREEN_HEIGHT - 180} 
              L ${-bgOffset + 90},${SCREEN_HEIGHT - 60}
              L ${-bgOffset + 130},${SCREEN_HEIGHT - 190}
              L ${-bgOffset + 170},${SCREEN_HEIGHT - 190}
              L ${-bgOffset + 170},${SCREEN_HEIGHT - 60}
              L ${-bgOffset + 220},${SCREEN_HEIGHT - 140}
              L ${-bgOffset + 270},${SCREEN_HEIGHT - 140}
              L ${-bgOffset + 270},${SCREEN_HEIGHT - 60}
              L ${-bgOffset + 310},${SCREEN_HEIGHT - 220}
              L ${-bgOffset + 350},${SCREEN_HEIGHT - 220}
              L ${-bgOffset + 350},${SCREEN_HEIGHT - 60}
              
              L ${-bgOffset + SCREEN_WIDTH},${SCREEN_HEIGHT - 60} 
              L ${-bgOffset + SCREEN_WIDTH + 40},${SCREEN_HEIGHT - 180} 
              L ${-bgOffset + SCREEN_WIDTH + 48},${SCREEN_HEIGHT - 260} 
              L ${-bgOffset + SCREEN_WIDTH + 56},${SCREEN_HEIGHT - 180} 
              L ${-bgOffset + SCREEN_WIDTH + 90},${SCREEN_HEIGHT - 60}
              L ${-bgOffset + SCREEN_WIDTH + 130},${SCREEN_HEIGHT - 190}
              L ${-bgOffset + SCREEN_WIDTH + 170},${SCREEN_HEIGHT - 190}
              L ${-bgOffset + SCREEN_WIDTH + 170},${SCREEN_HEIGHT - 60}
              L ${-bgOffset + SCREEN_WIDTH + 220},${SCREEN_HEIGHT - 140}
              L ${-bgOffset + SCREEN_WIDTH + 270},${SCREEN_HEIGHT - 140}
              L ${-bgOffset + SCREEN_WIDTH + 270},${SCREEN_HEIGHT - 60}
              L ${-bgOffset + SCREEN_WIDTH + 310},${SCREEN_HEIGHT - 220}
              L ${-bgOffset + SCREEN_WIDTH + 350},${SCREEN_HEIGHT - 220}
              L ${-bgOffset + SCREEN_WIDTH + 350},${SCREEN_HEIGHT - 60}
              L ${-bgOffset + SCREEN_WIDTH * 2},${SCREEN_HEIGHT - 60}
              Z`}
          fill="url(#buildingGrad)"
        />

        {/* Glowing Windows on Towers during Night */}
        {phase === 'NIGHT' && (
          <G>
            <Rect x={-bgOffset + 320} y={SCREEN_HEIGHT - 200} width={6} height={6} fill="#FACC15" />
            <Rect x={-bgOffset + 335} y={SCREEN_HEIGHT - 180} width={6} height={6} fill="#38BDF8" />
            <Rect x={-bgOffset + 320} y={SCREEN_HEIGHT - 150} width={6} height={6} fill="#FACC15" />
            <Rect x={-bgOffset + SCREEN_WIDTH + 320} y={SCREEN_HEIGHT - 200} width={6} height={6} fill="#FACC15" />
            <Rect x={-bgOffset + SCREEN_WIDTH + 335} y={SCREEN_HEIGHT - 180} width={6} height={6} fill="#38BDF8" />
          </G>
        )}

        {/* 4. Ghost High Score Milestone Line */}
        {showMilestone && (
          <G>
            <Rect
              x={milestoneScreenX}
              y={0}
              width={3}
              height={SCREEN_HEIGHT - 60}
              fill="#EC4899"
              opacity={0.8}
            />
            <Rect
              x={milestoneScreenX - 45}
              y={80}
              width={90}
              height={22}
              rx={11}
              fill="#EC4899"
            />
            <SvgText
              x={milestoneScreenX}
              y={95}
              fill="#FFFFFF"
              fontSize="10"
              fontWeight="900"
              textAnchor="middle"
            >
              BEST: {highScore}
            </SvgText>
          </G>
        )}

        {/* Ground Baseboard */}
        <Rect
          x="0"
          y={SCREEN_HEIGHT - 60}
          width={SCREEN_WIDTH}
          height={60}
          fill={phase === 'NIGHT' ? '#0F172A' : '#1E293B'}
        />
        <Rect
          x="0"
          y={SCREEN_HEIGHT - 60}
          width={SCREEN_WIDTH}
          height={8}
          fill={phase === 'NIGHT' ? '#38BDF8' : '#F59E0B'}
        />
      </Svg>
    </View>
  );
};
