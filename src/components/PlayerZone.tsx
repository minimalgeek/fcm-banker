import { useRef, useCallback } from 'react';
import type { Player, PendingBatch } from '../state/types';
import { DENOMINATIONS, PLAYER_COLOR_HEX } from '../state/types';
import type { GameAction } from '../state/gameReducer';

const DEBOUNCE_MS = 3000;

interface Props {
  player: Player;
  pending: PendingBatch | undefined;
  dispatch: React.Dispatch<GameAction>;
  compact?: boolean;
}

export function PlayerZone({ player, pending, dispatch, compact }: Props) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const color = PLAYER_COLOR_HEX[player.color];

  const scheduleBatch = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      dispatch({ type: 'COMMIT_BATCH', playerId: player.id });
      timerRef.current = null;
    }, DEBOUNCE_MS);
  }, [dispatch, player.id]);

  function handleTap(amount: number) {
    dispatch({ type: 'ADD_PENDING', playerId: player.id, amount });
    scheduleBatch();
  }

  const pendingAmount = pending?.amount ?? 0;

  return (
    <div
      className={`flex flex-col rounded-xl border-2 overflow-hidden ${compact ? 'gap-1 p-2' : 'gap-2 p-3'}`}
      style={{ borderColor: color, backgroundColor: `${color}10` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-4 h-4 rounded-full shrink-0"
            style={{ backgroundColor: color }}
          />
          <span className={`font-bold text-white truncate ${compact ? 'text-sm' : 'text-base'}`}>
            {player.name}
          </span>
        </div>
        <span className={`font-mono font-bold text-white ${compact ? 'text-lg' : 'text-2xl'}`}>
          ${player.cash}
        </span>
      </div>

      {/* Pending indicator */}
      {pendingAmount !== 0 && (
        <div className="text-center text-sm font-mono text-slate-400 animate-pulse">
          {pendingAmount > 0 ? '+' : ''}${pendingAmount} pending
        </div>
      )}

      {/* Buttons */}
      <div className={`grid grid-cols-4 ${compact ? 'gap-1' : 'gap-1.5'}`}>
        {DENOMINATIONS.map((d) => (
          <button
            key={`+${d}`}
            onClick={() => handleTap(d)}
            className={`rounded-lg font-bold text-emerald-400 bg-emerald-950/60 hover:bg-emerald-900/80 active:scale-95 transition-all ${
              compact ? 'py-2 text-sm' : 'py-3 text-base'
            }`}
          >
            +{d}
          </button>
        ))}
        {DENOMINATIONS.map((d) => (
          <button
            key={`-${d}`}
            onClick={() => handleTap(-d)}
            className={`rounded-lg font-bold text-red-400 bg-red-950/60 hover:bg-red-900/80 active:scale-95 transition-all ${
              compact ? 'py-2 text-sm' : 'py-3 text-base'
            }`}
          >
            -{d}
          </button>
        ))}
      </div>
    </div>
  );
}
