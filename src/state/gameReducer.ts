import type {
  GameState,
  Player,
  Transaction,
  PendingBatch,
  ReserveChoice,
  PlayerColor,
} from './types';
import { INITIAL_STATE, PLAYER_COLORS, RESERVE_CARD_SLOTS } from './types';

// --- Actions ---

type Action =
  | { type: 'SET_PLAYERS'; players: { name: string }[] }
  | { type: 'SET_PLAYER_RESERVE'; playerId: string; reserve: ReserveChoice }
  | { type: 'ADVANCE_RESERVE_PLAYER' }
  | { type: 'START_GAME' }
  | { type: 'ADD_PENDING'; playerId: string; amount: number }
  | { type: 'COMMIT_BATCH'; playerId: string }
  | { type: 'CLEAR_PENDING'; playerId: string }
  | { type: 'UNDO_LAST' }
  | { type: 'END_PHASE' }
  | { type: 'RESET_GAME' }
  | { type: 'LOAD_STATE'; state: GameState };

export type GameAction = Action;

// --- Helpers ---

let txCounter = 0;
function nextTxId(): string {
  return `tx-${Date.now()}-${txCounter++}`;
}

function createPlayers(names: { name: string }[]): Player[] {
  return names.map((p, i) => ({
    id: `player-${i}`,
    name: p.name || `Player ${i + 1}`,
    color: PLAYER_COLORS[i] as PlayerColor,
    cash: 0,
    reserve: null,
  }));
}

function commitBatch(
  state: GameState,
  playerId: string,
): GameState {
  const pending = state.pendingBatches[playerId];
  if (!pending || pending.amount === 0) {
    const { [playerId]: _, ...rest } = state.pendingBatches;
    return { ...state, pendingBatches: rest };
  }

  const player = state.players.find((p) => p.id === playerId);
  if (!player) return state;

  const amount = pending.amount;
  let newBankBalance = state.bankBalance;
  let bankBroken = state.bankBroken;
  let boxMoney = 0;

  if (amount > 0) {
    // Income: deduct from bank
    const bankDeduction = Math.min(amount, Math.max(0, newBankBalance));
    boxMoney = amount - bankDeduction;
    newBankBalance -= bankDeduction;

    if (newBankBalance <= 0 && !bankBroken) {
      bankBroken = true;
    }
  } else {
    // Expense: money goes back to bank (only if not broken)
    if (!bankBroken) {
      newBankBalance -= amount; // amount is negative, so this adds
    }
  }

  const newCash = player.cash + amount;

  const tx: Transaction = {
    id: nextTxId(),
    playerId,
    playerName: player.name,
    amount,
    timestamp: Date.now(),
    stage: state.stage,
    boxMoney,
  };

  const updatedPlayers = state.players.map((p) =>
    p.id === playerId ? { ...p, cash: newCash } : p,
  );

  const { [playerId]: _, ...restPending } = state.pendingBatches;

  return {
    ...state,
    bankBalance: newBankBalance,
    bankBroken,
    players: updatedPlayers,
    pendingBatches: restPending,
    transactions: [...state.transactions, tx],
    undoStack: [...state.undoStack, tx],
  };
}

function undoTransaction(state: GameState): GameState {
  if (state.undoStack.length === 0) return state;

  const lastTx = state.undoStack[state.undoStack.length - 1];
  const player = state.players.find((p) => p.id === lastTx.playerId);
  if (!player) return state;

  const reversedAmount = -lastTx.amount;
  let newBankBalance = state.bankBalance;

  if (lastTx.amount > 0) {
    // Was income: return money to bank (minus box money which came from infinite supply)
    const bankPortion = lastTx.amount - lastTx.boxMoney;
    newBankBalance += bankPortion;
  } else {
    // Was expense: take money back from bank
    if (newBankBalance + lastTx.amount >= 0) {
      newBankBalance += lastTx.amount; // amount is negative
    }
  }

  // Recalculate bankBroken based on current state
  // If we reversed an income that broke the bank and balance is now positive, unbreak
  let bankBroken = state.bankBroken;
  if (newBankBalance > 0) {
    bankBroken = false;
  }

  const updatedPlayers = state.players.map((p) =>
    p.id === lastTx.playerId ? { ...p, cash: p.cash + reversedAmount } : p,
  );

  return {
    ...state,
    bankBalance: newBankBalance,
    bankBroken,
    players: updatedPlayers,
    transactions: state.transactions.filter((t) => t.id !== lastTx.id),
    undoStack: state.undoStack.slice(0, -1),
  };
}

function determineCeoSlots(players: Player[]): number {
  const freq: Record<number, number> = {};
  for (const p of players) {
    if (p.reserve == null) continue;
    const slots = RESERVE_CARD_SLOTS[p.reserve];
    freq[slots] = (freq[slots] || 0) + 1;
  }

  let bestSlots = 3;
  let bestCount = 0;
  for (const [slotsStr, count] of Object.entries(freq)) {
    const slots = Number(slotsStr);
    if (count > bestCount || (count === bestCount && slots > bestSlots)) {
      bestCount = count;
      bestSlots = slots;
    }
  }
  return bestSlots;
}

function endPhase(state: GameState): GameState {
  if (state.stage === 1 && state.bankBroken) {
    const totalReserves = state.players.reduce(
      (sum, p) => sum + (p.reserve ?? 0),
      0,
    );
    return {
      ...state,
      stage: 2,
      bankBalance: totalReserves,
      bankBroken: false,
      ceoSlots: determineCeoSlots(state.players),
    };
  }
  if (state.stage === 2 && state.bankBroken) {
    return { ...state, phase: 'game-over' };
  }
  return state;
}

// --- Reducer ---

export function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'SET_PLAYERS': {
      const players = createPlayers(action.players);
      return {
        ...INITIAL_STATE,
        phase: 'reserve-selection',
        players,
        bankBalance: players.length * 50,
      };
    }

    case 'SET_PLAYER_RESERVE': {
      return {
        ...state,
        players: state.players.map((p) =>
          p.id === action.playerId ? { ...p, reserve: action.reserve } : p,
        ),
      };
    }

    case 'ADVANCE_RESERVE_PLAYER': {
      const nextIndex = state.reservePlayerIndex + 1;
      if (nextIndex >= state.players.length) {
        return { ...state, reservePlayerIndex: nextIndex, phase: 'playing' };
      }
      return { ...state, reservePlayerIndex: nextIndex };
    }

    case 'START_GAME':
      return { ...state, phase: 'playing' };

    case 'ADD_PENDING': {
      const player = state.players.find((p) => p.id === action.playerId);
      if (!player) return state;

      const existing = state.pendingBatches[action.playerId];
      const currentPending = existing?.amount ?? 0;
      const newPendingAmount = currentPending + action.amount;

      // Prevent negative cash
      if (player.cash + newPendingAmount < 0) {
        return state;
      }

      const batch: PendingBatch = {
        playerId: action.playerId,
        amount: newPendingAmount,
      };

      return {
        ...state,
        pendingBatches: { ...state.pendingBatches, [action.playerId]: batch },
      };
    }

    case 'COMMIT_BATCH':
      return commitBatch(state, action.playerId);

    case 'CLEAR_PENDING': {
      const { [action.playerId]: _, ...rest } = state.pendingBatches;
      return { ...state, pendingBatches: rest };
    }

    case 'UNDO_LAST':
      return undoTransaction(state);

    case 'END_PHASE':
      return endPhase(state);

    case 'RESET_GAME':
      return INITIAL_STATE;

    case 'LOAD_STATE':
      return action.state;

    default:
      return state;
  }
}
