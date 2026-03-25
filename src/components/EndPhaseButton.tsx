import { useState, useRef } from 'react';
import type { GameState } from '../state/types';
import type { GameAction } from '../state/gameReducer';

interface Props {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

export function EndPhaseButton({ state, dispatch }: Props) {
  const [confirming, setConfirming] = useState(false);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [holdProgress, setHoldProgress] = useState(false);

  const canEndPhase = state.bankBroken;
  const isStage2End = state.stage === 2 && state.bankBroken;

  if (!canEndPhase) return null;

  function handleEndPhase() {
    dispatch({ type: 'END_PHASE' });
    setConfirming(false);
  }

  function handlePointerDown() {
    setHoldProgress(true);
    holdTimer.current = setTimeout(() => {
      handleEndPhase();
      setHoldProgress(false);
    }, 1500);
  }

  function handlePointerUp() {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    if (holdProgress) {
      setHoldProgress(false);
      setConfirming(true);
    }
  }

  return (
    <>
      <button
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${
          holdProgress
            ? 'bg-amber-600 text-white scale-95'
            : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
        }`}
      >
        {holdProgress ? 'Hold…' : isStage2End ? 'End Game' : 'End Phase'}
      </button>

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-surface-raised rounded-2xl p-8 max-w-sm w-full mx-4 flex flex-col gap-4 items-center">
            <h3 className="text-xl font-bold text-white">
              {isStage2End ? 'End Game?' : 'End Stage 1?'}
            </h3>
            <p className="text-slate-400 text-center text-sm">
              {isStage2End
                ? 'This will end the game and show final scores.'
                : 'This will reveal all players\' secret reserve cards and create the Stage 2 bank. This cannot be undone.'}
            </p>
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => setConfirming(false)}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEndPhase}
                className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
