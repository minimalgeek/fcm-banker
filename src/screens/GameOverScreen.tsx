import { useGame } from '../state/GameContext';
import { PLAYER_COLOR_HEX, RESERVE_CARD_SLOTS, type ReserveChoice } from '../state/types';

export function GameOverScreen() {
  const { state, newGame } = useGame();

  const sorted = [...state.players]
    .map((p, i) => ({ ...p, turnOrder: i }))
    .sort((a, b) => b.cash - a.cash || a.turnOrder - b.turnOrder);

  return (
    <div className="flex flex-col items-center gap-8 p-8 overflow-y-auto h-full">
      <div className="my-auto flex flex-col items-center gap-8 w-full">
      <h1 className="text-4xl font-bold text-white">Game Over</h1>
      <p className="text-slate-400 text-lg">Stage 2 Bank has broken — Final Scores</p>

      <div className="w-full max-w-md flex flex-col gap-3">
        {sorted.map((player, i) => (
          <div
            key={player.id}
            className="flex items-center gap-4 bg-surface-raised rounded-xl p-4"
            style={{ borderLeft: `4px solid ${PLAYER_COLOR_HEX[player.color]}` }}
          >
            <div className="text-2xl font-bold text-slate-500 w-8 text-center">
              {i === 0 ? '🏆' : `#${i + 1}`}
            </div>
            <div className="flex-1">
              <div className="font-bold text-white text-lg">{player.name}</div>
              <div className="text-sm text-slate-400">
                Reserve: ${player.reserve} · {RESERVE_CARD_SLOTS[player.reserve as ReserveChoice]} slots
              </div>
            </div>
            <div className="text-3xl font-mono font-bold text-bank-gold">
              ${player.cash}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={newGame}
        className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-lg font-bold rounded-xl transition-colors mt-4"
      >
        New Game
      </button>
      </div>
    </div>
  );
}
