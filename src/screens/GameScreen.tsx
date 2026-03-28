import React, { useCallback, useRef, useState } from 'react';
import {
  Dimensions,
  GestureResponderEvent,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../App';
import Board from '../components/Board';
import StageCompleteModal from '../components/StageCompleteModal';
import ShopModal from '../components/ShopModal';
import GameOverModal from '../components/GameOverModal';
import { useGameState, Direction } from '../hooks/useGameState';
import { usePurchases } from '../hooks/usePurchases';
import { STAGES } from '../data/stages';
import { trackHintUsed, trackUndoUsed } from '../services/mmp';

type Props = NativeStackScreenProps<RootStackParamList, 'Game'>;

const SWIPE_MIN = 30;
const { width: SCREEN_W } = Dimensions.get('window');
const BOARD_SIZE = Math.min(SCREEN_W - 32, 380);

export default function GameScreen({ navigation }: Props) {
  const game = useGameState();
  const purchases = usePurchases();
  const [shopVisible, setShopVisible] = useState(false);

  // ------- Swipe detection -------
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = useCallback((e: GestureResponderEvent) => {
    touchStart.current = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY };
  }, []);

  const onTouchEnd = useCallback(
    (e: GestureResponderEvent) => {
      if (!touchStart.current) return;
      const dx = e.nativeEvent.pageX - touchStart.current.x;
      const dy = e.nativeEvent.pageY - touchStart.current.y;
      touchStart.current = null;

      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (Math.max(absDx, absDy) < SWIPE_MIN) return;

      let direction: Direction;
      if (absDx > absDy) {
        direction = dx > 0 ? 'right' : 'left';
      } else {
        direction = dy > 0 ? 'down' : 'up';
      }
      game.move(direction);
    },
    [game],
  );

  // ------- Stage clear handler -------
  const handleCloseStageModal = useCallback(() => {
    game.clearStageClearedFlag();
  }, [game]);

  // ------- Undo -------
  const handleUndo = useCallback(() => {
    game.undo();
    trackUndoUsed();
  }, [game]);

  // ------- Hint -------
  const handleHint = useCallback(() => {
    game.useHint();
    trackHintUsed();
  }, [game]);

  // ------- Shop grant -------
  const handleGrantItems = useCallback(
    (hints: number, undos: number) => {
      if (hints > 0) game.addHints(hints);
      if (undos > 0) game.addUndos(undos);
    },
    [game],
  );

  // ------- Current stage label -------
  const currentStageLabel = STAGES.filter((s) => game.maxTile >= s.targetTile).length;
  const nextStage = STAGES.find((s) => game.maxTile < s.targetTile);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* ===== Header ===== */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← ホーム</Text>
          </TouchableOpacity>
          <Text style={styles.titleText}>2048</Text>
          <View style={styles.scoreArea}>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreLbl}>SCORE</Text>
              <Text style={styles.scoreVal}>{game.score.toLocaleString()}</Text>
            </View>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreLbl}>BEST</Text>
              <Text style={styles.scoreVal}>{game.bestScore.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* ===== Stage progress ===== */}
        <View style={styles.progressRow}>
          <Text style={styles.progressText}>
            Stage {currentStageLabel} クリア済み
            {nextStage ? ` — 次: ${nextStage.targetTile.toLocaleString()}タイル` : ' — 全クリア！'}
          </Text>
        </View>

        {/* ===== Board ===== */}
        <View
          style={styles.boardWrapper}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <Board tiles={game.tiles} boardSize={BOARD_SIZE} hintTileId={game.hintTileId} />
        </View>

        {/* ===== Action bar ===== */}
        <View style={styles.actionBar}>
          <ActionBtn
            label={`ヒント (${game.hintsRemaining})`}
            onPress={handleHint}
            disabled={game.hintsRemaining === 0}
            color="#EDCF72"
            textColor="#776E65"
          />
          <ActionBtn
            label={`アンドゥ (${game.undosRemaining})`}
            onPress={handleUndo}
            disabled={game.undosRemaining === 0 || game.undoStack.length === 0}
            color="#F2B179"
            textColor="#FFF"
          />
          <ActionBtn
            label="ショップ"
            onPress={() => setShopVisible(true)}
            color="#8F7A66"
            textColor="#FFF"
          />
          <ActionBtn
            label="新規"
            onPress={game.newGame}
            color="#BBADA0"
            textColor="#FFF"
          />
        </View>
      </View>

      {/* ===== Modals ===== */}
      <StageCompleteModal
        stageId={game.justClearedStageId}
        onClose={handleCloseStageModal}
        onOpenShop={() => setShopVisible(true)}
      />

      <GameOverModal
        visible={game.isGameOver}
        score={game.score}
        bestScore={game.bestScore}
        undosRemaining={game.undosRemaining}
        onRetry={game.newGame}
        onUndo={handleUndo}
        onOpenShop={() => setShopVisible(true)}
      />

      <ShopModal
        visible={shopVisible}
        onClose={() => setShopVisible(false)}
        purchases={purchases}
        onGrantItems={handleGrantItems}
        hintsRemaining={game.hintsRemaining}
        undosRemaining={game.undosRemaining}
      />
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Action button helper
// ---------------------------------------------------------------------------
interface ActionBtnProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  color: string;
  textColor: string;
}

function ActionBtn({ label, onPress, disabled, color, textColor }: ActionBtnProps) {
  return (
    <TouchableOpacity
      style={[styles.actionBtn, { backgroundColor: color }, disabled && styles.actionBtnDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={[styles.actionBtnText, { color: textColor }]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FAF8EF',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  // Header
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backBtn: {
    paddingRight: 8,
  },
  backText: {
    color: '#8F7A66',
    fontSize: 14,
    fontWeight: '600',
  },
  titleText: {
    flex: 1,
    fontSize: 36,
    fontWeight: '800',
    color: '#776E65',
    textAlign: 'center',
  },
  scoreArea: {
    flexDirection: 'row',
    gap: 8,
  },
  scoreBox: {
    backgroundColor: '#BBADA0',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: 'center',
    minWidth: 56,
  },
  scoreLbl: {
    color: '#EEE4DA',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  scoreVal: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  // Progress
  progressRow: {
    marginBottom: 10,
  },
  progressText: {
    fontSize: 13,
    color: '#9F8B7A',
    fontWeight: '500',
  },
  // Board
  boardWrapper: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  // Action bar
  actionBar: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  actionBtn: {
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    minWidth: 72,
  },
  actionBtnDisabled: {
    opacity: 0.4,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
