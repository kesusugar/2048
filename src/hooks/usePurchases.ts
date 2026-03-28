import { useCallback, useEffect, useState } from 'react';
import Purchases, { LOG_LEVEL, PurchasesPackage } from 'react-native-purchases';
import { REVENUECAT_API_KEY } from '../config';
import { getPurchaseCount, incrementPurchaseCount } from '../services/storage';
import { trackFirstPurchase, trackSecondPurchase } from '../services/mmp';

// ---------------------------------------------------------------------------
// Product definitions
// ---------------------------------------------------------------------------

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
  hints: number;
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

export function usePurchases(): UsePurchasesReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }
    Purchases.configure({ apiKey: REVENUECAT_API_KEY });
  }, []);

  const purchase = useCallback(
    async (item: PurchaseItem): Promise<{ hints: number; undos: number } | null> => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch current offerings from RevenueCat
        const offerings = await Purchases.getOfferings();
        const pkg: PurchasesPackage | undefined =
          offerings.current?.availablePackages.find(
            (p) => p.product.identifier === item.id,
          );

        if (!pkg) {
          throw new Error('商品が見つかりませんでした');
        }

        await Purchases.purchasePackage(pkg);

        // AEO event tracking
        const count = await incrementPurchaseCount();
        const revenueYen = parseFloat(item.priceLabel.replace('¥', ''));
        if (count === 1) {
          trackFirstPurchase(revenueYen);
        } else if (count === 2) {
          trackSecondPurchase(revenueYen);
        }

        return { hints: item.hints, undos: item.undos };
      } catch (e: unknown) {
        // USER_CANCELLED is not an error — just dismiss silently
        if (
          e instanceof Error &&
          (e.message.includes('USER_CANCELLED') || e.message.includes('userCancelled'))
        ) {
          return null;
        }
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
    setError(null);
    try {
      await Purchases.restorePurchases();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '復元に失敗しました';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, error, purchase, restorePurchases };
}

// Eagerly warm up the purchase count cache
void getPurchaseCount();
