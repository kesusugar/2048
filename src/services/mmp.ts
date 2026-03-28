/**
 * MMP (Mobile Measurement Partner) — Tenjin implementation.
 *
 * SDK: react-native-tenjin (1.3.2)
 * Docs: https://github.com/tenjin/react-native-tenjin
 */

import Tenjin from 'react-native-tenjin';
import { TENJIN_API_KEY } from '../config';

// ---------------------------------------------------------------------------
// Initialisation — call once on app start (App.tsx)
// ---------------------------------------------------------------------------

export function initializeMMP(): void {
  Tenjin.initialize(TENJIN_API_KEY);
  Tenjin.connect();
}

// ---------------------------------------------------------------------------
// Internal helper
// ---------------------------------------------------------------------------

function sendEvent(eventName: string): void {
  if (__DEV__) {
    console.log(`[Tenjin] event=${eventName}`);
  }
  Tenjin.eventWithName(eventName);
}

// ---------------------------------------------------------------------------
// AEO Events
// ---------------------------------------------------------------------------

/** チュートリアル完了時 */
export function trackTutorialComplete(): void {
  sendEvent('tutorial_complete');
}

/** 256タイル達成時 (Stage 3) */
export function trackStageClear3(): void {
  sendEvent('stage_clear_3');
}

/** 1024タイル達成時 (Stage 5) */
export function trackStageClear5(): void {
  sendEvent('stage_clear_5');
}

/** 初回購入完了時 — most important AEO signal */
export function trackFirstPurchase(revenue: number, currency = 'JPY'): void {
  if (__DEV__) {
    console.log(`[Tenjin] first_purchase revenue=${revenue} ${currency}`);
  }
  Tenjin.eventWithNameAndValue('first_purchase', String(Math.round(revenue)));
}

/** 2回目購入完了時 */
export function trackSecondPurchase(revenue: number, currency = 'JPY'): void {
  if (__DEV__) {
    console.log(`[Tenjin] second_purchase revenue=${revenue} ${currency}`);
  }
  Tenjin.eventWithNameAndValue('second_purchase', String(Math.round(revenue)));
}

/** ヒント使用時 */
export function trackHintUsed(): void {
  sendEvent('hint_used');
}

/** アンドゥ使用時 */
export function trackUndoUsed(): void {
  sendEvent('undo_used');
}
