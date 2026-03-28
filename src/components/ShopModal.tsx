import React from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { PurchaseItem, PURCHASE_ITEMS, UsePurchasesReturn } from '../hooks/usePurchases';
import { trackHintUsed } from '../services/mmp';

interface ShopModalProps {
  visible: boolean;
  onClose: () => void;
  purchases: UsePurchasesReturn;
  onGrantItems: (hints: number, undos: number) => void;
  hintsRemaining: number;
  undosRemaining: number;
}

export default function ShopModal({
  visible,
  onClose,
  purchases,
  onGrantItems,
  hintsRemaining,
  undosRemaining,
}: ShopModalProps) {
  const { isLoading, error, purchase, restorePurchases } = purchases;

  async function handleBuy(item: PurchaseItem) {
    const result = await purchase(item);
    if (result) {
      onGrantItems(result.hints, result.undos);
      if (result.hints > 0) trackHintUsed();
    }
  }

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>アイテムショップ</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Inventory */}
          <View style={styles.inventory}>
            <Text style={styles.invLabel}>所持: ヒント {hintsRemaining}回 / アンドゥ {undosRemaining}回</Text>
          </View>

          {/* Products */}
          {PURCHASE_ITEMS.map((item) => (
            <View key={item.id} style={styles.productRow}>
              <View style={styles.productInfo}>
                <Text style={styles.productTitle}>{item.title}</Text>
                <Text style={styles.productDesc}>{item.description}</Text>
              </View>
              <TouchableOpacity
                style={[styles.buyBtn, isLoading && styles.buyBtnDisabled]}
                onPress={() => handleBuy(item)}
                disabled={isLoading}
              >
                <Text style={styles.buyBtnText}>{item.priceLabel}</Text>
              </TouchableOpacity>
            </View>
          ))}

          {isLoading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="#8F7A66" />
              <Text style={styles.loadingText}>処理中…</Text>
            </View>
          )}

          {error && <Text style={styles.errorText}>{error}</Text>}

          {/* Restore */}
          <TouchableOpacity style={styles.restoreBtn} onPress={restorePurchases} disabled={isLoading}>
            <Text style={styles.restoreText}>購入を復元する</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: '#FAF8EF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#776E65',
  },
  closeBtn: {
    padding: 4,
  },
  closeText: {
    fontSize: 18,
    color: '#9F8B7A',
  },
  inventory: {
    backgroundColor: '#EEE4DA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  invLabel: {
    fontSize: 13,
    color: '#776E65',
    fontWeight: '600',
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#D8CCC4',
  },
  productInfo: {
    flex: 1,
    marginRight: 12,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#776E65',
  },
  productDesc: {
    fontSize: 13,
    color: '#9F8B7A',
    marginTop: 2,
  },
  buyBtn: {
    backgroundColor: '#8F7A66',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 72,
    alignItems: 'center',
  },
  buyBtnDisabled: {
    opacity: 0.5,
  },
  buyBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
  },
  loadingText: {
    color: '#8F7A66',
    fontSize: 14,
  },
  errorText: {
    color: '#F65E3B',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },
  restoreBtn: {
    marginTop: 20,
    alignItems: 'center',
  },
  restoreText: {
    color: '#9F8B7A',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
});
