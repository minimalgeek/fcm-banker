import { useState, useEffect } from 'react';
import { useGame } from '../state/GameContext';
import { PlayerZone, COOLDOWN_SEC } from '../components/PlayerZone';
import { BankStatus } from '../components/BankStatus';
import { TransactionLog } from '../components/TransactionLog';
import { EndPhaseButton } from '../components/EndPhaseButton';
import { UndoButton } from '../components/UndoButton';
import { PLAYER_COLOR_HEX } from '../state/types';
import type { Player, PendingBatch } from '../state/types';

function CountdownTimer() {
  const [countdown, setCountdown] = useState(COOLDOWN_SEC);
  useEffect(() => {
    const id = setInterval(() => {
      setCountdown((c) => (c > 1 ? c - 1 : c));
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return <>{countdown}</>;
}

function PendingCountdown({ player, batch }: { player: Player; batch: PendingBatch }) {
  const color = PLAYER_COLOR_HEX[player.color];
  const amt = batch.amount;
  return (
    <div className="text-xs text-center font-mono py-0.5" style={{ color }}>
      {player.name}: {amt > 0 ? '+' : ''}{amt}$ in{' '}
      <CountdownTimer key={amt} />..
    </div>
  );
}

export function GameScreen() {
  const { state, dispatch } = useGame();
  const { players, pendingBatches } = state;

  const leftPlayers: typeof players = [];
  const rightPlayers: typeof players = [];

  // Odd players (1st, 3rd, 5th) left, even players (2nd, 4th) right
  players.forEach((p, i) => {
    if (i % 2 === 0) leftPlayers.push(p);
    else rightPlayers.push(p);
  });

  const n = players.length;
  const compact = n >= 4;

  // Show reserve reveal after stage 2 is created
  const showReserveReveal = state.stage === 2 && state.transactions.length === 0;

  return (
    <div className="h-full grid grid-rows-[1fr] grid-cols-[minmax(160px,1fr)_minmax(200px,2fr)_minmax(160px,1fr)] overflow-hidden">

      {/* Left column */}
      <div className="flex flex-col gap-1 p-2 justify-center overflow-hidden">
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

        {Object.entries(pendingBatches).map(([playerId, batch]) => {
          if (!batch || batch.amount === 0) return null;
          const player = players.find((p) => p.id === playerId);
          if (!player) return null;
          return <PendingCountdown key={playerId} player={player} batch={batch} />;
        })}

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
      <div className="flex flex-col gap-1 p-2 justify-center overflow-hidden">
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

    </div>
  );
}
