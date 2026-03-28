import { useReducer, useEffect, useCallback, useRef } from 'react';
import { saveGameState, loadGameState, saveBestScore, loadBestScore } from '../services/storage';
import { getStageForTile } from '../data/stages';
import { trackStageClear3, trackStageClear5 } from '../services/mmp';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TileData {
  id: number;
  value: number;
  row: number;
  col: number;
  isNew: boolean;
  isMerged: boolean;
}

export interface GameState {
  tiles: TileData[];
  score: number;
  bestScore: number;
  maxTile: number;
  isGameOver: boolean;
  /** Stage just cleared (non-null for one render cycle, then reset to null) */
  justClearedStageId: number | null;
  undoStack: Array<{ tiles: TileData[]; score: number; maxTile: number }>;
  hintsRemaining: number;
  undosRemaining: number;
  hintTileId: number | null;
}

export type Direction = 'left' | 'right' | 'up' | 'down';

type Action =
  | { type: 'MOVE'; direction: Direction }
  | { type: 'NEW_GAME' }
  | { type: 'LOAD'; board: number[][]; score: number; maxTile: number; bestScore: number }
  | { type: 'UNDO' }
  | { type: 'USE_HINT' }
  | { type: 'ADD_HINTS'; count: number }
  | { type: 'ADD_UNDOS'; count: number }
  | { type: 'CLEAR_STAGE_CLEARED' }
  | { type: 'CLEAR_HINT' }
  | { type: 'SET_BEST_SCORE'; score: number };

// ---------------------------------------------------------------------------
// Pure helpers — board manipulation
// ---------------------------------------------------------------------------

let nextId = 1;
function newId(): number {
  return nextId++;
}

function emptyBoard(): number[][] {
  return Array.from({ length: 4 }, () => [0, 0, 0, 0]);
}

function boardFromTiles(tiles: TileData[]): number[][] {
  const board = emptyBoard();
  for (const t of tiles) {
    board[t.row][t.col] = t.value;
  }
  return board;
}

function spawnTile(tiles: TileData[]): TileData {
  const board = boardFromTiles(tiles);
  const empty: { row: number; col: number }[] = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] === 0) empty.push({ row: r, col: c });
    }
  }
  const pos = empty[Math.floor(Math.random() * empty.length)];
  return {
    id: newId(),
    value: Math.random() < 0.9 ? 2 : 4,
    row: pos.row,
    col: pos.col,
    isNew: true,
    isMerged: false,
  };
}

function initialTiles(): TileData[] {
  const t1 = spawnTile([]);
  const t2 = spawnTile([t1]);
  return [t1, t2];
}

/**
 * Slide a single row/column array LEFT (non-zero tiles slide left, merge equals).
 * Returns { merged: number[], score: number }
 */
function slideLeft(row: number[]): { result: number[]; score: number } {
  const nonZero = row.filter((v) => v !== 0);
  const merged: number[] = [];
  let score = 0;
  let i = 0;
  while (i < nonZero.length) {
    if (i + 1 < nonZero.length && nonZero[i] === nonZero[i + 1]) {
      const val = nonZero[i] * 2;
      merged.push(val);
      score += val;
      i += 2;
    } else {
      merged.push(nonZero[i]);
      i++;
    }
  }
  while (merged.length < 4) merged.push(0);
  return { result: merged, score };
}

function hasValidMoves(tiles: TileData[]): boolean {
  const board = boardFromTiles(tiles);
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] === 0) return true;
      if (c + 1 < 4 && board[r][c] === board[r][c + 1]) return true;
      if (r + 1 < 4 && board[r][c] === board[r + 1][c]) return true;
    }
  }
  return false;
}

/**
 * Apply a move to the current list of tiles.
 * Returns null if the move doesn't change the board.
 */
function applyMove(
  tiles: TileData[],
  direction: Direction,
): { newTiles: TileData[]; scoreGained: number } | null {
  const board = boardFromTiles(tiles);
  const newBoard = emptyBoard();
  let totalScore = 0;

  // We'll track which old tile id goes where and which positions got merged
  // For animation: map (oldRow,oldCol) → (newRow,newCol)
  const positionMap: Map<string, { newRow: number; newCol: number; merged: boolean }> = new Map();

  // Process rows/columns depending on direction
  // Normalise: rotate board so we always "slideLeft", then rotate back
  let rows: number[][] = [];

  if (direction === 'left') {
    rows = board;
  } else if (direction === 'right') {
    rows = board.map((row) => [...row].reverse());
  } else if (direction === 'up') {
    rows = Array.from({ length: 4 }, (_, c) => board.map((row) => row[c]));
  } else {
    // down
    rows = Array.from({ length: 4 }, (_, c) => board.map((row) => row[c]).reverse());
  }

  const processedRows: number[][] = [];
  const rowScores: number[] = [];
  for (const row of rows) {
    const { result, score } = slideLeft(row);
    processedRows.push(result);
    rowScores.push(score);
    totalScore += score;
  }

  // Rotate back
  if (direction === 'left') {
    for (let r = 0; r < 4; r++) newBoard[r] = processedRows[r];
  } else if (direction === 'right') {
    for (let r = 0; r < 4; r++) newBoard[r] = [...processedRows[r]].reverse();
  } else if (direction === 'up') {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        newBoard[r][c] = processedRows[c][r];
      }
    }
  } else {
    // down
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        newBoard[r][c] = processedRows[c][3 - r];
      }
    }
  }

  // Check if board changed
  let changed = false;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] !== newBoard[r][c]) {
        changed = true;
        break;
      }
    }
  }
  if (!changed) return null;

  // Build new tile list from newBoard
  // We need to figure out which old tiles moved where for animation tracking.
  // Strategy: match old tiles to new positions by simulating the slide
  // with full source-tracking.
  const newTiles: TileData[] = [];

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (newBoard[r][c] !== 0) {
        // Find the old tile at this position if any (for ID preservation on non-merged tiles)
        const oldTile = tiles.find((t) => t.row === r && t.col === c && t.value === newBoard[r][c] && !positionMap.has(`${t.row},${t.col}`));
        if (oldTile) {
          positionMap.set(`${r},${c}`, { newRow: r, newCol: c, merged: false });
          newTiles.push({
            ...oldTile,
            isNew: false,
            isMerged: false,
          });
        } else {
          // New merged tile or moved tile — give it a fresh id
          const isMerged = tiles.some((t) => t.value === newBoard[r][c] / 2 && !positionMap.has(`${t.row},${t.col}`));
          positionMap.set(`${r},${c}`, { newRow: r, newCol: c, merged: isMerged });
          newTiles.push({
            id: newId(),
            value: newBoard[r][c],
            row: r,
            col: c,
            isNew: false,
            isMerged: isMerged,
          });
        }
      }
    }
  }

  return { newTiles, scoreGained: totalScore };
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function createInitialState(): GameState {
  return {
    tiles: initialTiles(),
    score: 0,
    bestScore: 0,
    maxTile: 2,
    isGameOver: false,
    justClearedStageId: null,
    undoStack: [],
    hintsRemaining: 0,
    undosRemaining: 0,
    hintTileId: null,
  };
}

function maxTileInList(tiles: TileData[]): number {
  return tiles.reduce((m, t) => Math.max(m, t.value), 0);
}

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'NEW_GAME': {
      const tiles = initialTiles();
      return {
        ...createInitialState(),
        bestScore: state.bestScore,
        hintsRemaining: state.hintsRemaining,
        undosRemaining: state.undosRemaining,
        tiles,
      };
    }

    case 'LOAD': {
      const tiles: TileData[] = [];
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          const v = action.board[r][c];
          if (v !== 0) {
            tiles.push({ id: newId(), value: v, row: r, col: c, isNew: false, isMerged: false });
          }
        }
      }
      return {
        ...state,
        tiles,
        score: action.score,
        bestScore: action.bestScore,
        maxTile: action.maxTile,
        isGameOver: !hasValidMoves(tiles),
        justClearedStageId: null,
        undoStack: [],
        hintTileId: null,
      };
    }

    case 'MOVE': {
      if (state.isGameOver) return state;

      const result = applyMove(state.tiles, action.direction);
      if (!result) return state;

      const { newTiles, scoreGained } = result;

      // Spawn new tile
      const spawned = spawnTile(newTiles);
      const allTiles = [...newTiles, spawned];

      const newScore = state.score + scoreGained;
      const newMaxTile = Math.max(state.maxTile, maxTileInList(allTiles));
      const isGameOver = !hasValidMoves(allTiles);
      const newBest = Math.max(state.bestScore, newScore);

      // Detect stage clear
      let justClearedStageId: number | null = null;
      if (newMaxTile > state.maxTile) {
        const stage = getStageForTile(newMaxTile);
        if (stage) {
          justClearedStageId = stage.id;
          // Fire AEO events
          if (stage.id === 3) trackStageClear3();
          if (stage.id === 5) trackStageClear5();
        }
      }

      // Push undo
      const undoEntry = {
        tiles: state.tiles,
        score: state.score,
        maxTile: state.maxTile,
      };
      const undoStack = [undoEntry, ...state.undoStack].slice(0, 3);

      return {
        ...state,
        tiles: allTiles,
        score: newScore,
        bestScore: newBest,
        maxTile: newMaxTile,
        isGameOver,
        justClearedStageId,
        undoStack,
        hintTileId: null,
      };
    }

    case 'UNDO': {
      if (state.undosRemaining <= 0 || state.undoStack.length === 0) return state;
      const [prev, ...rest] = state.undoStack;
      return {
        ...state,
        tiles: prev.tiles,
        score: prev.score,
        maxTile: prev.maxTile,
        isGameOver: false,
        justClearedStageId: null,
        undoStack: rest,
        undosRemaining: state.undosRemaining - 1,
        hintTileId: null,
      };
    }

    case 'USE_HINT': {
      if (state.hintsRemaining <= 0) return state;

      // Find the "best" tile to highlight: highest value tile that is not blocked
      // Simple heuristic: highest-value tile on board
      const best = [...state.tiles].sort((a, b) => b.value - a.value)[0];
      if (!best) return state;

      return {
        ...state,
        hintsRemaining: state.hintsRemaining - 1,
        hintTileId: best.id,
      };
    }

    case 'ADD_HINTS':
      return { ...state, hintsRemaining: state.hintsRemaining + action.count };

    case 'ADD_UNDOS':
      return { ...state, undosRemaining: state.undosRemaining + action.count };

    case 'CLEAR_STAGE_CLEARED':
      return { ...state, justClearedStageId: null };

    case 'CLEAR_HINT':
      return { ...state, hintTileId: null };

    case 'SET_BEST_SCORE':
      return { ...state, bestScore: action.score };

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load persisted state on mount
  useEffect(() => {
    (async () => {
      const [saved, best] = await Promise.all([loadGameState(), loadBestScore()]);
      if (saved) {
        dispatch({ type: 'LOAD', board: saved.board, score: saved.score, maxTile: saved.maxTile, bestScore: best });
      } else {
        dispatch({ type: 'SET_BEST_SCORE', score: best });
      }
    })();
  }, []);

  // Debounced auto-save whenever state changes
  useEffect(() => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      const board = Array.from({ length: 4 }, (_, r) =>
        Array.from({ length: 4 }, (_, c) => {
          const t = state.tiles.find((t) => t.row === r && t.col === c);
          return t?.value ?? 0;
        }),
      );
      await saveGameState({ board, score: state.score, maxTile: state.maxTile });
      if (state.score > 0) await saveBestScore(state.bestScore);
    }, 500);
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [state.tiles, state.score, state.maxTile, state.bestScore]);

  const move = useCallback((direction: Direction) => dispatch({ type: 'MOVE', direction }), []);
  const newGame = useCallback(() => dispatch({ type: 'NEW_GAME' }), []);
  const undo = useCallback(() => dispatch({ type: 'UNDO' }), []);
  const useHint = useCallback(() => dispatch({ type: 'USE_HINT' }), []);
  const addHints = useCallback((count: number) => dispatch({ type: 'ADD_HINTS', count }), []);
  const addUndos = useCallback((count: number) => dispatch({ type: 'ADD_UNDOS', count }), []);
  const clearStageClearedFlag = useCallback(() => dispatch({ type: 'CLEAR_STAGE_CLEARED' }), []);
  const clearHint = useCallback(() => dispatch({ type: 'CLEAR_HINT' }), []);

  return {
    ...state,
    move,
    newGame,
    undo,
    useHint,
    addHints,
    addUndos,
    clearStageClearedFlag,
    clearHint,
  };
}
