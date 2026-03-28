import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { TileData } from '../hooks/useGameState';
import { getTileColor } from '../data/stages';

interface TileProps {
  tile: TileData;
  tileSize: number;
  gap: number;
  isHinted: boolean;
}

export default function Tile({ tile, tileSize, gap, isHinted }: TileProps) {
  const { bg, text } = getTileColor(tile.value);

  // Position (absolute coords)
  const left = tile.col * (tileSize + gap) + gap;
  const top = tile.row * (tileSize + gap) + gap;

  // Animations
  const opacity = useRef(new Animated.Value(tile.isNew ? 0 : 1)).current;
  const scale = useRef(new Animated.Value(tile.isNew ? 0.5 : 1)).current;
  const hintAnim = useRef(new Animated.Value(0)).current;

  // New tile: fade + scale in
  useEffect(() => {
    if (tile.isNew) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 100, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
      ]).start();
    }
  }, [tile.isNew]); // eslint-disable-line react-hooks/exhaustive-deps

  // Merge animation: pulse scale
  useEffect(() => {
    if (tile.isMerged) {
      Animated.sequence([
        Animated.spring(scale, { toValue: 1.2, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1.0, useNativeDriver: true }),
      ]).start();
    }
  }, [tile.isMerged]); // eslint-disable-line react-hooks/exhaustive-deps

  // Hint: pulsing glow via scale
  useEffect(() => {
    if (isHinted) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(hintAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(hintAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    } else {
      hintAnim.setValue(0);
    }
  }, [isHinted]); // eslint-disable-line react-hooks/exhaustive-deps

  const hintScale = hintAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] });
  const combinedScale = Animated.multiply(scale, hintScale);

  const fontSize =
    tile.value >= 1024 ? tileSize * 0.28 : tile.value >= 128 ? tileSize * 0.33 : tileSize * 0.4;

  return (
    <Animated.View
      style={[
        styles.tile,
        {
          width: tileSize,
          height: tileSize,
          borderRadius: tileSize * 0.08,
          left,
          top,
          backgroundColor: bg,
          opacity,
          transform: [{ scale: combinedScale }],
          borderWidth: isHinted ? 3 : 0,
          borderColor: isHinted ? '#FFD700' : 'transparent',
        },
      ]}
    >
      <Text style={[styles.value, { color: text, fontSize }]}>{tile.value}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tile: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  value: {
    fontWeight: '700',
    textAlign: 'center',
  },
});
