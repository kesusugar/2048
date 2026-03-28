import React from 'react';
import { StyleSheet, View } from 'react-native';
import { TileData } from '../hooks/useGameState';
import Tile from './Tile';

interface BoardProps {
  tiles: TileData[];
  boardSize: number;
  hintTileId: number | null;
}

const GRID = 4;
const GAP = 8;

export default function Board({ tiles, boardSize, hintTileId }: BoardProps) {
  const tileSize = (boardSize - GAP * (GRID + 1)) / GRID;

  // Background cells
  const cells = Array.from({ length: GRID * GRID });

  return (
    <View style={[styles.board, { width: boardSize, height: boardSize, borderRadius: 8 }]}>
      {/* Empty cell placeholders */}
      <View style={styles.cellsGrid}>
        {cells.map((_, i) => (
          <View
            key={i}
            style={[
              styles.cell,
              {
                width: tileSize,
                height: tileSize,
                borderRadius: tileSize * 0.08,
                margin: GAP / 2,
              },
            ]}
          />
        ))}
      </View>

      {/* Actual tiles */}
      {tiles.map((tile) => (
        <Tile
          key={tile.id}
          tile={tile}
          tileSize={tileSize}
          gap={GAP}
          isHinted={tile.id === hintTileId}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    backgroundColor: '#BBADA0',
    overflow: 'hidden',
  },
  cellsGrid: {
    position: 'absolute',
    top: GAP / 2,
    left: GAP / 2,
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  cell: {
    backgroundColor: 'rgba(238,228,218,0.35)',
  },
});
