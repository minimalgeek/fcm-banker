import { useRef, useCallback } from 'react';
import type { Player } from '../state/types';
import { DENOMINATIONS, PLAYER_COLOR_HEX } from '../state/types';
import type { GameAction } from '../state/gameReducer';

export const COOLDOWN_SEC = 5;
const DEBOUNCE_MS = COOLDOWN_SEC * 1000;

interface Props {
  player: Player;
  pending?: unknown;
  dispatch: React.Dispatch<GameAction>;
  compact?: boolean;
}

export function PlayerZone({ player, dispatch, compact }: Props) {
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

      {/* Buttons */}
      <div className={`grid grid-cols-4 ${compact ? 'gap-1' : 'gap-1.5'}`}>
        {DENOMINATIONS.map((d) => (
          <button
            key={`+${d}`}
            onClick={() => handleTap(d)}
            className={`rounded-lg font-bold text-emerald-400 bg-emerald-950/60 hover:bg-emerald-900/80 active:scale-95 transition-all ${
              compact ? 'py-2 text-base' : 'py-4 text-lg'
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
              compact ? 'py-2 text-base' : 'py-4 text-lg'
            }`}
          >
            -{d}
          </button>
        ))}
      </div>
    </div>
  );
}
