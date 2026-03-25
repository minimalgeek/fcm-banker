import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  type ReactNode,
  type Dispatch,
} from 'react';
import type { GameState } from './types';
import { INITIAL_STATE } from './types';
import { gameReducer, type GameAction } from './gameReducer';
import { loadState, debouncedSave, clearState } from './persistence';

interface GameContextValue {
  state: GameState;
  dispatch: Dispatch<GameAction>;
  hasSavedGame: boolean;
  resumeGame: () => void;
  newGame: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [resolved, setResolved] = useState(false);
  const [savedState, setSavedState] = useState<GameState | null>(null);
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);

  useEffect(() => {
    const loaded = loadState();
    if (loaded && loaded.phase !== 'setup') {
      setSavedState(loaded);
    }
    setResolved(true);
  }, []);

  useEffect(() => {
    if (resolved && state.phase !== 'setup') {
      debouncedSave(state);
    }
  }, [state, resolved]);

  function resumeGame() {
    if (savedState) {
      dispatch({ type: 'LOAD_STATE', state: savedState });
      setSavedState(null);
    }
  }

  function newGame() {
    clearState();
    setSavedState(null);
    dispatch({ type: 'RESET_GAME' });
  }

  if (!resolved) return null;

  return (
    <GameContext.Provider
      value={{
        state,
        dispatch,
        hasSavedGame: savedState !== null,
        resumeGame,
        newGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
