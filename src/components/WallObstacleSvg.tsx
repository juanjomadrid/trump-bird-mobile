import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Rect,
  Path,
  G,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Line,
  Circle,
  Text as SvgText,
  Polygon,
} from 'react-native-svg';

interface WallObstacleSvgProps {
  width: number;
  height: number;
  isTop: boolean;
  destroyed?: boolean;
  hasClimber?: boolean;
}

export const WallObstacleSvg: React.FC<WallObstacleSvgProps> = ({
  width,
  height,
  isTop,
  destroyed = false,
  hasClimber = false,
}) => {
  if (destroyed) {
    // Render crumbled/broken wall rubble
    return (
      <View style={[styles.container, { width, height, opacity: 0.25 }]}>
        <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <Rect
            x="5"
            y="5"
            width={width - 10}
            height={height - 10}
            fill="#78350F"
            stroke="#451A03"
            strokeWidth="2"
            strokeDasharray="6,4"
          />
        </Svg>
      </View>
    );
  }

  const capHeight = 26;
  const bodyHeight = Math.max(0, height - capHeight);
  const capY = isTop ? height - capHeight : 0;
  const bodyY = isTop ? 0 : capHeight;

  // Brick rows generator
  const brickRowHeight = 16;
  const rowsCount = Math.ceil(bodyHeight / brickRowHeight);
  const brickRows = [];

  for (let i = 0; i < rowsCount; i++) {
    const yPos = bodyY + i * brickRowHeight;
    const isOdd = i % 2 === 1;
    brickRows.push(
      <G key={`row_${i}`}>
        {/* Horizontal mortar with 3D highlight */}
        <Line x1="0" y1={yPos} x2={width} y2={yPos} stroke="#270A02" strokeWidth="2.2" />
        <Line x1="0" y1={yPos + 1} x2={width} y2={yPos + 1} stroke="#B45309" strokeWidth="0.8" strokeOpacity="0.4" />

        {/* Vertical mortar lines */}
        {isOdd ? (
          <>
            <Line x1={width * 0.25} y1={yPos} x2={width * 0.25} y2={yPos + brickRowHeight} stroke="#270A02" strokeWidth="1.8" />
            <Line x1={width * 0.75} y1={yPos} x2={width * 0.75} y2={yPos + brickRowHeight} stroke="#270A02" strokeWidth="1.8" />
          </>
        ) : (
          <>
            <Line x1={width * 0.5} y1={yPos} x2={width * 0.5} y2={yPos + brickRowHeight} stroke="#270A02" strokeWidth="1.8" />
          </>
        )}
      </G>
    );
  }

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          {/* 3D Brick Gradient */}
          <LinearGradient id="brickGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#7C2D12" />
            <Stop offset="50%" stopColor="#9A3412" />
            <Stop offset="100%" stopColor="#C2410C" />
          </LinearGradient>
          {/* Concrete Cap Gradient */}
          <LinearGradient id="capGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#F59E0B" />
            <Stop offset="50%" stopColor="#D97706" />
            <Stop offset="100%" stopColor="#78350F" />
          </LinearGradient>
          {/* Sombrero Hat Gradient */}
          <LinearGradient id="sombreroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FEF08A" />
            <Stop offset="50%" stopColor="#FACC15" />
            <Stop offset="100%" stopColor="#CA8A04" />
          </LinearGradient>
          {/* Poncho Serape Gradient */}
          <LinearGradient id="ponchoGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#10B981" />
            <Stop offset="33%" stopColor="#F59E0B" />
            <Stop offset="66%" stopColor="#EF4444" />
            <Stop offset="100%" stopColor="#3B82F6" />
          </LinearGradient>
        </Defs>

        {/* 1. Main 3D Brick Wall Body */}
        <Rect
          x="2"
          y={bodyY}
          width={width - 4}
          height={bodyHeight}
          fill="url(#brickGrad)"
          stroke="#431407"
          strokeWidth="2.5"
        />

        {/* 2. Brick Patterns */}
        {brickRows}

        {/* 3. Reinforced Concrete Coping Cap */}
        <Rect
          x="0"
          y={capY}
          width={width}
          height={capHeight}
          fill="url(#capGrad)"
          stroke="#451A03"
          strokeWidth="2.5"
          rx="3"
        />

        {/* Highlight ridge & Warning Beacons */}
        <Line
          x1="3"
          y1={capY + (isTop ? 4 : capHeight - 4)}
          x2={width - 3}
          y2={capY + (isTop ? 4 : capHeight - 4)}
          stroke="#FEF08A"
          strokeWidth="2"
        />

        {/* Safety Warning Flasher Lights */}
        <Circle cx="8" cy={capY + 13} r="3" fill="#EF4444" stroke="#7F1D1D" strokeWidth="1" />
        <Circle cx="7.2" cy={capY + 12.2} r="1" fill="#FFFFFF" />
        <Circle cx={width - 8} cy={capY + 13} r="3" fill="#F59E0B" stroke="#78350F" strokeWidth="1" />
        <Circle cx={width - 8.8} cy={capY + 12.2} r="1" fill="#FFFFFF" />

        {/* 4. "THE WALL" / "PAID BY MEXICO" Satirical Emblem */}
        <SvgText
          x={width / 2}
          y={capY + 17}
          fill="#451A03"
          fontSize="8.5"
          fontWeight="900"
          textAnchor="middle"
          letterSpacing="0.4"
        >
          {isTop ? 'THE WALL' : 'PAID BY MX'}
        </SvgText>

        {/* 5. MEXICAN CLIMBER WITH SOMBRERO, PONCHO & MARACAS (Purely Visual / Non-Colliding) */}
        {!isTop && hasClimber && bodyHeight > 45 && (
          <G transform={`translate(${width * 0.12}, ${capHeight + 10})`}>
            {/* Climbing Arms holding bricks */}
            <Path d="M 6,18 L 1,12 L 4,9" stroke="#B45309" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <Path d="M 28,18 L 33,12 L 30,9" stroke="#B45309" strokeWidth="2.5" strokeLinecap="round" fill="none" />

            {/* Left Maraca */}
            <Circle cx="1" cy="9" r="3.2" fill="#EF4444" stroke="#7F1D1D" strokeWidth="0.8" />
            <Line x1="1" y1="9" x2="3" y2="15" stroke="#78350F" strokeWidth="1.2" />

            {/* Right Maraca */}
            <Circle cx="33" cy="9" r="3.2" fill="#10B981" stroke="#064E3B" strokeWidth="0.8" />
            <Line x1="33" y1="9" x2="31" y2="15" stroke="#78350F" strokeWidth="1.2" />

            {/* Colourful Mexican Serape Poncho */}
            <Polygon
              points="17,14 7,34 27,34"
              fill="url(#ponchoGrad)"
              stroke="#047857"
              strokeWidth="1.2"
            />
            {/* Poncho Fringe tassels */}
            <Line x1="7" y1="34" x2="27" y2="34" stroke="#FEF08A" strokeWidth="2" strokeDasharray="2,2" />

            {/* Climbing Legs */}
            <Path d="M 11,34 L 7,42 L 3,42" stroke="#1E3A8A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <Path d="M 23,34 L 27,40 L 31,40" stroke="#1E3A8A" strokeWidth="2.5" strokeLinecap="round" fill="none" />

            {/* Face & Head */}
            <Circle cx="17" cy="12" r="5.5" fill="#D97706" stroke="#92400E" strokeWidth="1" />

            {/* Big Mexican Mustache */}
            <Path
              d="M 12,14 Q 17,11 22,14 Q 17,17 12,14 Z"
              fill="#1E293B"
            />

            {/* Big Wide Brim Sombrero */}
            {/* Sombrero Brim (Curved Oval) */}
            <Path
              d="M 2,7 C 2,2 32,2 32,7 C 32,10 2,10 2,7 Z"
              fill="url(#sombreroGrad)"
              stroke="#78350F"
              strokeWidth="1.2"
            />
            {/* Sombrero Cone Crown */}
            <Path
              d="M 12,5 L 17,-3 L 22,5 Z"
              fill="url(#sombreroGrad)"
              stroke="#78350F"
              strokeWidth="1.2"
            />
            {/* Sombrero Red Ribbon Trim */}
            <Path d="M 12,4 L 22,4" stroke="#EF4444" strokeWidth="1.5" />
          </G>
        )}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});
