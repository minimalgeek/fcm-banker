import type { GameState } from '../state/types';

interface Props {
  state: GameState;
}

export function BankStatus({ state }: Props) {
  const { stage, bankBalance, bankBroken } = state;

  return (
    <div className="flex flex-col items-center gap-1 p-3 shrink-0">
      <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">
        Stage {stage} Bank
      </div>
      <div
        className={`text-4xl font-mono font-bold ${
          bankBroken ? 'text-bank-broke animate-pulse' : 'text-bank-gold'
        }`}
      >
        ${Math.max(0, bankBalance)}
      </div>
      {bankBroken && (
        <div className="text-bank-broke font-bold text-sm uppercase tracking-wide mt-1">
          {stage === 2 ? 'Final Round! — Drawing from Box' : 'Bank Broke! — Drawing from Box'}
        </div>
      )}
    </div>
  );
}
