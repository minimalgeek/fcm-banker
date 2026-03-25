import { useGame } from '../state/GameContext';
import { PlayerZone } from '../components/PlayerZone';
import { BankStatus } from '../components/BankStatus';
import { TransactionLog } from '../components/TransactionLog';
import { EndPhaseButton } from '../components/EndPhaseButton';
import { UndoButton } from '../components/UndoButton';
import { PLAYER_COLOR_HEX } from '../state/types';

export function GameScreen() {
  const { state, dispatch } = useGame();
  const { players, pendingBatches } = state;

  const leftPlayers: typeof players = [];
  const rightPlayers: typeof players = [];
  const bottomPlayers: typeof players = [];

  // Distribute players around edges
  const n = players.length;
  if (n === 1) {
    leftPlayers.push(players[0]);
  } else if (n === 2) {
    leftPlayers.push(players[0]);
    rightPlayers.push(players[1]);
  } else if (n === 3) {
    leftPlayers.push(players[0]);
    rightPlayers.push(players[1]);
    bottomPlayers.push(players[2]);
  } else if (n === 4) {
    leftPlayers.push(players[0], players[1]);
    rightPlayers.push(players[2], players[3]);
  } else if (n === 5) {
    leftPlayers.push(players[0], players[1]);
    rightPlayers.push(players[2], players[3]);
    bottomPlayers.push(players[4]);
  }

  const compact = n >= 4;

  // Show reserve reveal after stage 2 is created
  const showReserveReveal = state.stage === 2 && state.transactions.length === 0;

  const hasBottom = bottomPlayers.length > 0;

  return (
    <div
      className={`h-full grid ${
        hasBottom
          ? 'grid-rows-[1fr_auto] grid-cols-[minmax(160px,1fr)_minmax(200px,2fr)_minmax(160px,1fr)]'
          : 'grid-rows-[1fr] grid-cols-[minmax(160px,1fr)_minmax(200px,2fr)_minmax(160px,1fr)]'
      } overflow-hidden`}
    >
      {/* Left column */}
      <div className="flex flex-col gap-2 p-2 justify-center overflow-hidden">
        {leftPlayers.map((p) => (
          <PlayerZone
            key={p.id}
            player={p}
            pending={pendingBatches[p.id]}
            dispatch={dispatch}
            compact={compact}
          />
        ))}
      </div>

      {/* Center column */}
      <div className="flex flex-col min-h-0 overflow-hidden">
        <BankStatus state={state} />

        <div className="flex items-center justify-center gap-3 px-4 py-1 shrink-0">
          <UndoButton undoStack={state.undoStack} dispatch={dispatch} />
          <EndPhaseButton state={state} dispatch={dispatch} />
        </div>

        {showReserveReveal && (
          <div className="mx-4 mb-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg shrink-0">
            <div className="text-center text-sm font-bold text-amber-400 mb-2">
              Reserves Revealed — Stage 2 Bank Created
            </div>
            <div className="flex justify-center gap-4">
              {state.players.map((p) => (
                <div key={p.id} className="flex items-center gap-1.5 text-sm">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: PLAYER_COLOR_HEX[p.color] }}
                  />
                  <span className="text-white font-semibold">${p.reserve}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transaction log — only scrollable element */}
        <div className="flex-1 min-h-0 mx-4 mb-2 bg-surface-raised rounded-lg border border-slate-800 overflow-hidden">
          <TransactionLog transactions={state.transactions} players={state.players} />
        </div>
      </div>

      {/* Right column */}
      <div className="flex flex-col gap-2 p-2 justify-center overflow-hidden">
        {rightPlayers.map((p) => (
          <PlayerZone
            key={p.id}
            player={p}
            pending={pendingBatches[p.id]}
            dispatch={dispatch}
            compact={compact}
          />
        ))}
      </div>

      {/* Bottom row — spans all 3 columns */}
      {hasBottom && (
        <div className="col-span-3 flex justify-center p-2 pt-0">
          <div className="w-full max-w-sm">
            {bottomPlayers.map((p) => (
              <PlayerZone
                key={p.id}
                player={p}
                pending={pendingBatches[p.id]}
                dispatch={dispatch}
                compact={compact}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
