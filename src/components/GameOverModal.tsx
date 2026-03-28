import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface GameOverModalProps {
  visible: boolean;
  score: number;
  bestScore: number;
  undosRemaining: number;
  onRetry: () => void;
  onUndo: () => void;
  onOpenShop: () => void;
}

export default function GameOverModal({
  visible,
  score,
  bestScore,
  undosRemaining,
  onRetry,
  onUndo,
  onOpenShop,
}: GameOverModalProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      opacity.setValue(0);
      Animated.timing(opacity, { toValue: 1, duration: 350, useNativeDriver: true }).start();
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const isNewBest = score >= bestScore && score > 0;

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={onRetry}>
      <Animated.View style={[styles.overlay, { opacity }]}>
        <View style={styles.card}>
          <Text style={styles.gameOverText}>ゲームオーバー</Text>

          <View style={styles.scoreRow}>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreLabel}>スコア</Text>
              <Text style={styles.scoreValue}>{score.toLocaleString()}</Text>
            </View>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreLabel}>ベスト</Text>
              <Text style={[styles.scoreValue, isNewBest && styles.newBest]}>
                {bestScore.toLocaleString()}
              </Text>
            </View>
          </View>

          {isNewBest && (
            <Text style={styles.newBestLabel}>🏅 新記録！</Text>
          )}

          <View style={styles.buttons}>
            {undosRemaining > 0 && (
              <TouchableOpacity style={styles.btnUndo} onPress={onUndo}>
                <Text style={styles.btnUndoText}>アンドゥ（残り {undosRemaining}回）</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.btnPrimary} onPress={onRetry}>
              <Text style={styles.btnPrimaryText}>もう一度</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnShop} onPress={onOpenShop}>
              <Text style={styles.btnShopText}>アイテムを購入</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(238,228,218,0.73)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#FAF8EF',
    borderRadius: 16,
    padding: 28,
    width: '82%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  gameOverText: {
    fontSize: 30,
    fontWeight: '800',
    color: '#776E65',
    marginBottom: 20,
  },
  scoreRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  scoreBox: {
    flex: 1,
    backgroundColor: '#BBADA0',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  scoreLabel: {
    color: '#EEE4DA',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scoreValue: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 2,
  },
  newBest: {
    color: '#EDCF72',
  },
  newBestLabel: {
    fontSize: 16,
    marginBottom: 12,
    color: '#F59563',
    fontWeight: '700',
  },
  buttons: {
    width: '100%',
    gap: 10,
    marginTop: 16,
  },
  btnUndo: {
    backgroundColor: '#EDCF72',
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: 'center',
  },
  btnUndoText: {
    color: '#776E65',
    fontWeight: '700',
    fontSize: 15,
  },
  btnPrimary: {
    backgroundColor: '#8F7A66',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
  btnShop: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnShopText: {
    color: '#8F7A66',
    fontWeight: '600',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
