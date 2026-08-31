import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect, Path, G, Defs, Pattern, Line, Text as SvgText } from 'react-native-svg';

interface WallObstacleSvgProps {
  width: number;
  height: number;
  isTop: boolean;
  destroyed?: boolean;
}

export const WallObstacleSvg: React.FC<WallObstacleSvgProps> = ({
  width,
  height,
  isTop,
  destroyed = false,
}) => {
  if (destroyed) {
    // Render crumbled/broken wall rubble
    return (
      <View style={[styles.container, { width, height, opacity: 0.25 }]}>
        <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <Rect x="5" y="5" width={width - 10} height={height - 10} fill="#78350F" stroke="#451A03" strokeWidth="2" strokeDasharray="6,4" />
        </Svg>
      </View>
    );
  }

  const capHeight = 24;
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
        {/* Horizontal mortar line */}
        <Line x1="0" y1={yPos} x2={width} y2={yPos} stroke="#451A03" strokeWidth="2" />
        {/* Vertical mortar lines */}
        {isOdd ? (
          <>
            <Line x1={width * 0.25} y1={yPos} x2={width * 0.25} y2={yPos + brickRowHeight} stroke="#451A03" strokeWidth="1.5" />
            <Line x1={width * 0.75} y1={yPos} x2={width * 0.75} y2={yPos + brickRowHeight} stroke="#451A03" strokeWidth="1.5" />
          </>
        ) : (
          <>
            <Line x1={width * 0.5} y1={yPos} x2={width * 0.5} y2={yPos + brickRowHeight} stroke="#451A03" strokeWidth="1.5" />
          </>
        )}
      </G>
    );
  }

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* 1. Main Brick Wall Body */}
        <Rect
          x="2"
          y={bodyY}
          width={width - 4}
          height={bodyHeight}
          fill="#9A3412"
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
          fill="#D97706"
          stroke="#78350F"
          strokeWidth="3"
          rx="3"
        />
        {/* Highlight ridge on cap */}
        <Line
          x1="3"
          y1={capY + (isTop ? 4 : capHeight - 4)}
          x2={width - 3}
          y2={capY + (isTop ? 4 : capHeight - 4)}
          stroke="#FDE68A"
          strokeWidth="2"
        />

        {/* 4. "THE WALL" Gold Emblem */}
        <SvgText
          x={width / 2}
          y={capY + 16}
          fill="#451A03"
          fontSize="11"
          fontWeight="900"
          textAnchor="middle"
        >
          THE WALL
        </SvgText>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});
