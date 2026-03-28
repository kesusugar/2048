/**
 * MMP (Mobile Measurement Partner) event wrapper.
 *
 * Supports Tenjin and Adjust. Set PROVIDER in your environment/config.
 * Both SDKs are stubbed here — swap the import and initialise calls
 * inside initialize() once you add the native SDK to the project.
 *
 * Tenjin:  npm install react-native-tenjin
 * Adjust:  npm install react-native-adjust
 */

export type MMPProvider = 'tenjin' | 'adjust' | 'none';

// Change this to 'tenjin' or 'adjust' once the SDK is installed.
const PROVIDER: MMPProvider = 'none';

// ---------------------------------------------------------------------------
// Initialisation
// ---------------------------------------------------------------------------

export function initializeMMP(apiKey: string): void {
  if (PROVIDER === 'tenjin') {
    // import Tenjin from 'react-native-tenjin';
    // Tenjin.initialize(apiKey);
    // Tenjin.connect();
    console.log('[MMP] Tenjin initialized');
  } else if (PROVIDER === 'adjust') {
    // import { Adjust, AdjustConfig } from 'react-native-adjust';
    // const config = new AdjustConfig(apiKey, AdjustConfig.EnvironmentProduction);
    // Adjust.create(config);
    console.log('[MMP] Adjust initialized');
  }
}

// ---------------------------------------------------------------------------
// Internal helper
// ---------------------------------------------------------------------------

function sendEvent(eventName: string, revenue?: number, currency?: string): void {
  if (__DEV__) {
    console.log(`[MMP:${PROVIDER}] event=${eventName}`, revenue != null ? { revenue, currency } : '');
  }

  if (PROVIDER === 'tenjin') {
    if (revenue != null) {
      // Tenjin.eventWithNameAndValue(eventName, String(revenue));
    } else {
      // Tenjin.eventWithName(eventName);
    }
  } else if (PROVIDER === 'adjust') {
    // const event = new AdjustEvent('<token>');
    // if (revenue != null) event.setRevenue(revenue, currency ?? 'JPY');
    // Adjust.trackEvent(event);
  }
}

// ---------------------------------------------------------------------------
// AEO Events  (see requirements §AEOイベント設計)
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
  sendEvent('first_purchase', revenue, currency);
}

/** 2回目購入完了時 */
export function trackSecondPurchase(revenue: number, currency = 'JPY'): void {
  sendEvent('second_purchase', revenue, currency);
}

/** ヒント使用時 */
export function trackHintUsed(): void {
  sendEvent('hint_used');
}

/** アンドゥ使用時 */
export function trackUndoUsed(): void {
  sendEvent('undo_used');
}
