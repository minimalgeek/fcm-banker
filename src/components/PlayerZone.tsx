import { useRef, useCallback, useState } from 'react';
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
  const inputRef = useRef<HTMLInputElement | null>(null);
  const color = PLAYER_COLOR_HEX[player.color];

  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [customSign, setCustomSign] = useState<1 | -1>(1);

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

  function openCustomInput() {
    setCustomAmount('');
    setCustomSign(1);
    setShowCustomInput(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function submitCustomAmount() {
    const parsed = parseInt(customAmount, 10);
    if (!parsed || parsed <= 0) return;
    handleTap(customSign * parsed);
    setShowCustomInput(false);
    setCustomAmount('');
  }

  function cancelCustomInput() {
    setShowCustomInput(false);
    setCustomAmount('');
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
          <button
            onClick={openCustomInput}
            className="shrink-0 w-8 h-6 flex items-center justify-center rounded bg-slate-700/60 border border-slate-600/50 text-slate-300 text-xs font-bold hover:bg-slate-600/80 active:scale-90 transition-all"
            title="Enter custom amount"
          >
            #
          </button>
        </div>
        <span className={`font-mono font-bold text-white ${compact ? 'text-lg' : 'text-2xl'}`}>
          ${player.cash}
        </span>
      </div>

      {showCustomInput ? (
        <form
          onSubmit={(e) => { e.preventDefault(); submitCustomAmount(); }}
          className="flex items-center gap-1.5"
        >
          <button
            type="button"
            onClick={() => setCustomSign((s) => (s === 1 ? -1 : 1))}
            className={`shrink-0 w-10 h-10 rounded-lg font-bold text-lg border transition-all active:scale-95 ${
              customSign === 1
                ? 'text-emerald-400 bg-emerald-950/60 border-emerald-700/50'
                : 'text-red-400 bg-red-950/60 border-red-700/50'
            }`}
          >
            {customSign === 1 ? '+' : '−'}
          </button>
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value.replace(/\D/g, ''))}
            placeholder="0"
            className="flex-1 min-w-0 h-10 rounded-lg bg-slate-800 border border-slate-600 text-white text-center text-lg font-mono px-2 focus:outline-none focus:border-slate-400"
          />
          <button
            type="submit"
            className="shrink-0 h-10 px-3 rounded-lg font-bold text-sm bg-blue-600 text-white border border-blue-500 hover:bg-blue-500 active:scale-95 transition-all"
          >
            OK
          </button>
          <button
            type="button"
            onClick={cancelCustomInput}
            className="shrink-0 h-10 px-2 rounded-lg font-bold text-sm text-slate-400 bg-slate-800 border border-slate-600 hover:bg-slate-700 active:scale-95 transition-all"
          >
            ✕
          </button>
        </form>
      ) : (
        <div className={`grid grid-cols-4 ${compact ? 'gap-1' : 'gap-1.5'}`}>
          {DENOMINATIONS.map((d) => (
            <button
              key={`+${d}`}
              onClick={() => handleTap(d)}
              className={`rounded-lg font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-700/50 hover:bg-emerald-900/80 hover:border-emerald-500/70 active:scale-95 transition-all ${
                compact ? 'py-3 text-base' : 'py-4 text-lg'
              }`}
            >
              +{d}
            </button>
          ))}
          {DENOMINATIONS.map((d) => (
            <button
              key={`-${d}`}
              onClick={() => handleTap(-d)}
              className={`rounded-lg font-bold text-red-400 bg-red-950/60 border border-red-700/50 hover:bg-red-900/80 hover:border-red-500/70 active:scale-95 transition-all ${
                compact ? 'py-3 text-base' : 'py-4 text-lg'
              }`}
            >
              -{d}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
