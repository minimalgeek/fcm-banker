import { useState } from 'react';
import { useGame } from '../state/GameContext';
import { RESERVE_OPTIONS, RESERVE_CARD_SLOTS, PLAYER_COLOR_HEX, type ReserveChoice } from '../state/types';

export function ReserveScreen() {
  const { state, dispatch } = useGame();
  const currentIndex = state.reservePlayerIndex;
  const player = state.players[currentIndex];
  const [selected, setSelected] = useState<ReserveChoice | null>(null);
  const [revealed, setRevealed] = useState(false);

  if (!player) return null;

  // All players have chosen — should have auto-advanced to playing
  if (currentIndex >= state.players.length) return null;

  function handleConfirm() {
    if (!selected) return;
    dispatch({ type: 'SET_PLAYER_RESERVE', playerId: player.id, reserve: selected });
    dispatch({ type: 'ADVANCE_RESERVE_PLAYER' });
    setSelected(null);
    setRevealed(false);
  }

  function handleReveal() {
    setRevealed(true);
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 p-8">
      <h2 className="text-2xl font-bold text-white">Secret Reserve Selection</h2>
      <p className="text-slate-400">
        Player {currentIndex + 1} of {state.players.length}
      </p>

      {!revealed ? (
        <div className="flex flex-col items-center gap-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white"
            style={{ backgroundColor: PLAYER_COLOR_HEX[player.color] }}
          >
            {player.name.charAt(0).toUpperCase()}
          </div>
          <p className="text-lg text-white font-semibold">{player.name}</p>
          <p className="text-slate-400 text-center max-w-sm">
            Pass the device to this player. Only they should see the next screen.
          </p>
          <button
            onClick={handleReveal}
            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-lg font-bold rounded-xl transition-colors"
          >
            I'm {player.name} — Show My Choice
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6">
          <p className="text-lg text-white">
            <span className="font-bold" style={{ color: PLAYER_COLOR_HEX[player.color] }}>
              {player.name}
            </span>
            , choose your reserve card:
          </p>
          <div className="flex gap-4">
            {RESERVE_OPTIONS.map((val) => (
              <button
                key={val}
                onClick={() => setSelected(val)}
                className={`w-28 h-36 rounded-xl flex flex-col items-center justify-center gap-2 text-lg font-bold transition-all ${
                  selected === val
                    ? 'bg-emerald-600 text-white scale-105 ring-2 ring-emerald-400'
                    : 'bg-surface-raised text-slate-300 hover:bg-surface-overlay'
                }`}
              >
                <span className="text-3xl">${val}</span>
                <span className="text-xs opacity-70">{RESERVE_CARD_SLOTS[val]} slots</span>
              </button>
            ))}
          </div>
          <button
            onClick={handleConfirm}
            disabled={!selected}
            className={`px-8 py-4 text-lg font-bold rounded-xl transition-colors ${
              selected
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            Confirm & Pass Device
          </button>
        </div>
      )}
    </div>
  );
}
