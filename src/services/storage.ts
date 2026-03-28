import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  BEST_SCORE: 'best_score',
  CURRENT_SCORE: 'current_score',
  BOARD: 'board',
  MAX_TILE: 'max_tile',
  PURCHASE_COUNT: 'purchase_count',
  TUTORIAL_DONE: 'tutorial_done',
};

export interface SavedGameState {
  board: number[][];
  score: number;
  maxTile: number;
}

export async function saveBestScore(score: number): Promise<void> {
  await AsyncStorage.setItem(KEYS.BEST_SCORE, String(score));
}

export async function loadBestScore(): Promise<number> {
  const val = await AsyncStorage.getItem(KEYS.BEST_SCORE);
  return val ? parseInt(val, 10) : 0;
}

export async function saveGameState(state: SavedGameState): Promise<void> {
  await AsyncStorage.setItem(KEYS.BOARD, JSON.stringify(state.board));
  await AsyncStorage.setItem(KEYS.CURRENT_SCORE, String(state.score));
  await AsyncStorage.setItem(KEYS.MAX_TILE, String(state.maxTile));
}

export async function loadGameState(): Promise<SavedGameState | null> {
  try {
    const [boardRaw, scoreRaw, maxTileRaw] = await Promise.all([
      AsyncStorage.getItem(KEYS.BOARD),
      AsyncStorage.getItem(KEYS.CURRENT_SCORE),
      AsyncStorage.getItem(KEYS.MAX_TILE),
    ]);
    if (!boardRaw || !scoreRaw || !maxTileRaw) return null;
    return {
      board: JSON.parse(boardRaw) as number[][],
      score: parseInt(scoreRaw, 10),
      maxTile: parseInt(maxTileRaw, 10),
    };
  } catch {
    return null;
  }
}

export async function clearGameState(): Promise<void> {
  await AsyncStorage.multiRemove([KEYS.BOARD, KEYS.CURRENT_SCORE, KEYS.MAX_TILE]);
}

export async function getPurchaseCount(): Promise<number> {
  const val = await AsyncStorage.getItem(KEYS.PURCHASE_COUNT);
  return val ? parseInt(val, 10) : 0;
}

export async function incrementPurchaseCount(): Promise<number> {
  const count = await getPurchaseCount();
  const next = count + 1;
  await AsyncStorage.setItem(KEYS.PURCHASE_COUNT, String(next));
  return next;
}

export async function setTutorialDone(): Promise<void> {
  await AsyncStorage.setItem(KEYS.TUTORIAL_DONE, '1');
}

export async function isTutorialDone(): Promise<boolean> {
  const val = await AsyncStorage.getItem(KEYS.TUTORIAL_DONE);
  return val === '1';
}
