import { GameProvider, useGame } from './state/GameContext';
import { SetupScreen } from './screens/SetupScreen';
import { ReserveScreen } from './screens/ReserveScreen';
import { GameScreen } from './screens/GameScreen';
import { GameOverScreen } from './screens/GameOverScreen';
import { useFullscreen } from './hooks/useFullscreen';
import { useWakeLock } from './hooks/useWakeLock';

function Router() {
  const { state, hasSavedGame, resumeGame, newGame } = useGame();

  if (state.phase === 'setup' && hasSavedGame) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
        <h1 className="text-3xl font-bold text-white">FCM Banker</h1>
        <p className="text-slate-400 text-lg">A saved game was found.</p>
        <div className="flex gap-4">
          <button
            onClick={resumeGame}
            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-lg font-semibold rounded-xl transition-colors"
          >
            Resume Game
          </button>
          <button
            onClick={newGame}
            className="px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white text-lg font-semibold rounded-xl transition-colors"
          >
            New Game
          </button>
        </div>
      </div>
    );
  }

  switch (state.phase) {
    case 'setup':
      return <SetupScreen />;
    case 'reserve-selection':
      return <ReserveScreen />;
    case 'playing':
      return <GameScreen />;
    case 'game-over':
      return <GameOverScreen />;
  }
}

export default function App() {
  useFullscreen();
  useWakeLock();

  return (
    <GameProvider>
      <div className="h-full">
        <Router />
      </div>
    </GameProvider>
  );
}
