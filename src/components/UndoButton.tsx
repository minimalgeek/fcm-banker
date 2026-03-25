import type { GameAction } from '../state/gameReducer';
import type { Transaction } from '../state/types';

interface Props {
  undoStack: Transaction[];
  dispatch: React.Dispatch<GameAction>;
}

export function UndoButton({ undoStack, dispatch }: Props) {
  const last = undoStack[undoStack.length - 1];

  return (
    <button
      onClick={() => dispatch({ type: 'UNDO_LAST' })}
      disabled={!last}
      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
        last
          ? 'bg-slate-700 hover:bg-slate-600 text-white'
          : 'bg-slate-800 text-slate-600 cursor-not-allowed'
      }`}
    >
      Undo{last ? ` (${last.playerName} ${last.amount > 0 ? '+' : ''}$${last.amount})` : ''}
    </button>
  );
}
