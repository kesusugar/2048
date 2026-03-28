export interface Stage {
  id: number;
  targetTile: number;
  label: string;
  isPurchasePoint: boolean;
  purchaseMessage?: string;
}

export const STAGES: Stage[] = [
  {
    id: 1,
    targetTile: 64,
    label: 'Stage 1',
    isPurchasePoint: false,
  },
  {
    id: 2,
    targetTile: 128,
    label: 'Stage 2',
    isPurchasePoint: false,
  },
  {
    id: 3,
    targetTile: 256,
    label: 'Stage 3',
    isPurchasePoint: true,
    purchaseMessage: 'ヒントやアンドゥで次のステージへ！',
  },
  {
    id: 4,
    targetTile: 512,
    label: 'Stage 4',
    isPurchasePoint: false,
  },
  {
    id: 5,
    targetTile: 1024,
    label: 'Stage 5',
    isPurchasePoint: true,
    purchaseMessage: '最終ステージまであと少し！',
  },
  {
    id: 6,
    targetTile: 2048,
    label: 'Stage 6',
    isPurchasePoint: false,
  },
];

export const MAX_TILE = 2048;

export function getStageForTile(tile: number): Stage | null {
  return STAGES.find((s) => s.targetTile === tile) ?? null;
}

export function getCurrentStage(maxTileReached: number): Stage {
  const cleared = STAGES.filter((s) => maxTileReached >= s.targetTile);
  if (cleared.length === 0) return STAGES[0];
  return cleared[cleared.length - 1];
}

export const TILE_COLORS: Record<number, { bg: string; text: string }> = {
  2:    { bg: '#EEE4DA', text: '#776E65' },
  4:    { bg: '#EDE0C8', text: '#776E65' },
  8:    { bg: '#F2B179', text: '#F9F6F2' },
  16:   { bg: '#F59563', text: '#F9F6F2' },
  32:   { bg: '#F67C5F', text: '#F9F6F2' },
  64:   { bg: '#F65E3B', text: '#F9F6F2' },
  128:  { bg: '#EDCF72', text: '#F9F6F2' },
  256:  { bg: '#EDCC61', text: '#F9F6F2' },
  512:  { bg: '#EDC850', text: '#F9F6F2' },
  1024: { bg: '#EDC53F', text: '#F9F6F2' },
  2048: { bg: '#EDC22E', text: '#F9F6F2' },
};

export function getTileColor(value: number): { bg: string; text: string } {
  return TILE_COLORS[value] ?? { bg: '#3C3A32', text: '#F9F6F2' };
}
