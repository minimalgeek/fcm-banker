import { useState } from 'react';
import { useGame } from '../state/GameContext';
import { PLAYER_COLORS, PLAYER_COLOR_HEX } from '../state/types';

const DEFAULT_NAMES = ['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5'];

export function SetupScreen() {
  const { dispatch } = useGame();
  const [playerCount, setPlayerCount] = useState(2);
  const [names, setNames] = useState<string[]>(DEFAULT_NAMES.slice());

  function handleNameChange(index: number, value: string) {
    const next = [...names];
    next[index] = value;
    setNames(next);
  }

  function handleStart() {
    const players = Array.from({ length: playerCount }, (_, i) => ({
      name: names[i]?.trim() || `Player ${i + 1}`,
    }));
    dispatch({ type: 'SET_PLAYERS', players });
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 p-8">
      <h1 className="text-4xl font-bold text-white tracking-tight">
        Food Chain Magnate
      </h1>
      <p className="text-slate-400 text-lg">Digital Bank Tracker</p>

      <div className="flex flex-col gap-6 w-full max-w-md">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-3">
            Number of Players
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setPlayerCount(n)}
                className={`flex-1 py-3 rounded-lg text-lg font-bold transition-colors ${
                  playerCount === n
                    ? 'bg-emerald-600 text-white'
                    : 'bg-surface-raised text-slate-400 hover:bg-surface-overlay'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="text-sm text-slate-400">
          Starting bank: <span className="text-bank-gold font-bold">${playerCount * 50}</span>
        </div>

        <div className="flex flex-col gap-3">
          {Array.from({ length: playerCount }, (_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className="w-5 h-5 rounded-full shrink-0"
                style={{ backgroundColor: PLAYER_COLOR_HEX[PLAYER_COLORS[i]] }}
              />
              <input
                type="text"
                value={names[i]}
                onChange={(e) => handleNameChange(i, e.target.value)}
                placeholder={`Player ${i + 1}`}
                className="flex-1 bg-surface-raised border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          ))}
        </div>

        <button
          onClick={handleStart}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-lg font-bold rounded-xl transition-colors mt-2"
        >
          Continue to Reserve Selection
        </button>
      </div>
    </div>
  );
}
