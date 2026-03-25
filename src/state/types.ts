export type GamePhase = 'setup' | 'reserve-selection' | 'playing' | 'game-over';
export type GameStage = 1 | 2;

export const PLAYER_COLORS = ['green', 'blue', 'red', 'yellow', 'purple'] as const;
export type PlayerColor = (typeof PLAYER_COLORS)[number];

export const PLAYER_COLOR_HEX: Record<PlayerColor, string> = {
  green: '#22c55e',
  blue: '#3b82f6',
  red: '#ef4444',
  yellow: '#eab308',
  purple: '#a855f7',
};

export const RESERVE_OPTIONS = [100, 200, 300] as const;
export type ReserveChoice = (typeof RESERVE_OPTIONS)[number];

export const RESERVE_CARD_SLOTS: Record<ReserveChoice, 2 | 3 | 4> = {
  100: 2,
  200: 3,
  300: 4,
};

export const DENOMINATIONS = [1, 5, 10, 50] as const;
export type Denomination = (typeof DENOMINATIONS)[number];

export interface Player {
  id: string;
  name: string;
  color: PlayerColor;
  cash: number;
  reserve: ReserveChoice | null;
}

export interface Transaction {
  id: string;
  playerId: string;
  playerName: string;
  amount: number;
  timestamp: number;
  stage: GameStage;
  boxMoney: number;
}

export interface PendingBatch {
  playerId: string;
  amount: number;
}

export interface GameState {
  phase: GamePhase;
  stage: GameStage;
  bankBalance: number;
  bankBroken: boolean;
  ceoSlots: number;
  players: Player[];
  reservePlayerIndex: number;
  transactions: Transaction[];
  pendingBatches: Record<string, PendingBatch>;
  undoStack: Transaction[];
}

export const INITIAL_STATE: GameState = {
  phase: 'setup',
  stage: 1,
  bankBalance: 0,
  bankBroken: false,
  ceoSlots: 3,
  players: [],
  reservePlayerIndex: 0,
  transactions: [],
  pendingBatches: {},
  undoStack: [],
};
