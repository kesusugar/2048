import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { STAGES } from '../data/stages';

interface StageCompleteModalProps {
  stageId: number | null;
  onClose: () => void;
  onOpenShop: () => void;
}

export default function StageCompleteModal({
  stageId,
  onClose,
  onOpenShop,
}: StageCompleteModalProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(60)).current;

  const stage = stageId != null ? STAGES.find((s) => s.id === stageId) : null;
  const visible = stage != null;

  useEffect(() => {
    if (visible) {
      opacity.setValue(0);
      slideY.setValue(60);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(slideY, { toValue: 0, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!stage) return null;

  const isFinalStage = stage.id === 6;

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.card, { opacity, transform: [{ translateY: slideY }] }]}>
          <Text style={styles.emoji}>{isFinalStage ? '🏆' : '🎉'}</Text>
          <Text style={styles.title}>
            {isFinalStage ? 'クリア！' : `ステージ ${stage.id} クリア！`}
          </Text>
          <Text style={styles.subtitle}>
            {stage.targetTile.toLocaleString()} タイル達成
          </Text>

          {stage.isPurchasePoint && stage.purchaseMessage && (
            <View style={styles.purchaseBanner}>
              <Text style={styles.purchaseText}>{stage.purchaseMessage}</Text>
            </View>
          )}

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.btnPrimary} onPress={onClose}>
              <Text style={styles.btnPrimaryText}>続ける</Text>
            </TouchableOpacity>
            {stage.isPurchasePoint && (
              <TouchableOpacity
                style={styles.btnSecondary}
                onPress={() => {
                  onClose();
                  onOpenShop();
                }}
              >
                <Text style={styles.btnSecondaryText}>アイテムを購入</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#FAF8EF',
    borderRadius: 16,
    padding: 28,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  emoji: {
    fontSize: 56,
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#776E65',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#9F8B7A',
    marginBottom: 16,
  },
  purchaseBanner: {
    backgroundColor: '#F67C5F',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 16,
  },
  purchaseText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  buttons: {
    width: '100%',
    gap: 10,
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
  btnSecondary: {
    backgroundColor: '#EDCF72',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnSecondaryText: {
    color: '#776E65',
    fontWeight: '700',
    fontSize: 16,
  },
});
