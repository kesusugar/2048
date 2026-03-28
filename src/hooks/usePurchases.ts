/**
 * IAP hook using RevenueCat (react-native-purchases).
 *
 * Product IDs must be configured in App Store Connect and RevenueCat dashboard.
 * The REVENUECAT_API_KEY should be stored in a config / secrets file.
 *
 * Products:
 *   hint_single   ¥120 — 1 hint
 *   undo_3pack    ¥120 — 3 undos
 *   bundle_combo  ¥250 — 1 hint + 3 undos
 */

import { useCallback, useEffect, useState } from 'react';
import {
  getPurchaseCount,
  incrementPurchaseCount,
} from '../services/storage';
import {
  trackFirstPurchase,
  trackSecondPurchase,
} from '../services/mmp';

// ---------------------------------------------------------------------------
// RevenueCat types (stubbed when SDK is not available)
// ---------------------------------------------------------------------------
// Uncomment after installing react-native-purchases:
//
// import Purchases, {
//   PurchasesPackage,
//   CustomerInfo,
//   LOG_LEVEL,
// } from 'react-native-purchases';

export const PRODUCT_IDS = {
  HINT: 'hint_single',
  UNDO: 'undo_3pack',
  BUNDLE: 'bundle_combo',
} as const;

export type ProductId = (typeof PRODUCT_IDS)[keyof typeof PRODUCT_IDS];

export interface PurchaseItem {
  id: ProductId;
  title: string;
  description: string;
  priceLabel: string;
  /** Hints granted */
  hints: number;
  /** Undos granted */
  undos: number;
}

export const PURCHASE_ITEMS: PurchaseItem[] = [
  {
    id: PRODUCT_IDS.HINT,
    title: 'ヒント',
    description: '次の最適手をハイライト（1回分）',
    priceLabel: '¥120',
    hints: 1,
    undos: 0,
  },
  {
    id: PRODUCT_IDS.UNDO,
    title: 'アンドゥ',
    description: '1手戻る（3回分パック）',
    priceLabel: '¥120',
    hints: 0,
    undos: 3,
  },
  {
    id: PRODUCT_IDS.BUNDLE,
    title: 'お得セット',
    description: 'ヒント1回 ＋ アンドゥ3回',
    priceLabel: '¥250',
    hints: 1,
    undos: 3,
  },
];

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export interface UsePurchasesReturn {
  isLoading: boolean;
  error: string | null;
  purchase: (item: PurchaseItem) => Promise<{ hints: number; undos: number } | null>;
  restorePurchases: () => Promise<void>;
}

const REVENUECAT_API_KEY = 'YOUR_REVENUECAT_API_KEY';

export function usePurchases(): UsePurchasesReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize RevenueCat on mount
    // Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    // Purchases.configure({ apiKey: REVENUECAT_API_KEY });
    void REVENUECAT_API_KEY; // suppress unused warning until SDK integrated
  }, []);

  const purchase = useCallback(
    async (item: PurchaseItem): Promise<{ hints: number; undos: number } | null> => {
      setIsLoading(true);
      setError(null);

      try {
        // --- RevenueCat purchase flow (uncomment when SDK is ready) ---
        // const offerings = await Purchases.getOfferings();
        // const pkg = offerings.current?.availablePackages.find(
        //   (p: PurchasesPackage) => p.product.identifier === item.id,
        // );
        // if (!pkg) throw new Error('Product not found');
        // const { customerInfo } = await Purchases.purchasePackage(pkg);
        // void customerInfo;

        // ----- Stub: simulates successful purchase in dev -----
        if (__DEV__) {
          await new Promise((r) => setTimeout(r, 800)); // simulate network
        }

        // Track AEO events
        const count = await incrementPurchaseCount();
        const revenueYen = parseFloat(item.priceLabel.replace('¥', ''));

        if (count === 1) {
          trackFirstPurchase(revenueYen);
        } else if (count === 2) {
          trackSecondPurchase(revenueYen);
        }

        return { hints: item.hints, undos: item.undos };
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : '購入に失敗しました';
        setError(msg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const restorePurchases = useCallback(async () => {
    setIsLoading(true);
    try {
      // const customerInfo: CustomerInfo = await Purchases.restorePurchases();
      // void customerInfo;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '復元に失敗しました';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, error, purchase, restorePurchases };
}

// Eagerly load purchase count so it's warm when needed
void getPurchaseCount();
