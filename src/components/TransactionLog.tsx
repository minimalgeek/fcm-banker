import { useEffect, useRef } from 'react';
import type { Transaction } from '../state/types';
import { PLAYER_COLOR_HEX, PLAYER_COLORS } from '../state/types';
import type { Player } from '../state/types';

interface Props {
  transactions: Transaction[];
  players: Player[];
}

export function TransactionLog({ transactions, players }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transactions.length]);

  const playerColorMap = Object.fromEntries(
    players.map((p) => [p.id, PLAYER_COLOR_HEX[p.color ?? PLAYER_COLORS[0]]]),
  );

  if (transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-600 text-sm">
        No transactions yet
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="overflow-y-auto h-full px-3 py-2 space-y-1">
      {transactions.map((tx) => {
        const isIncome = tx.amount > 0;
        return (
          <div
            key={tx.id}
            className="flex items-center justify-between text-sm py-1 border-b border-slate-800 last:border-0"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: playerColorMap[tx.playerId] }}
              />
              <span className="text-slate-400 truncate">
                S{tx.stage} — {tx.playerName}
              </span>
            </div>
            <span
              className={`font-mono font-bold shrink-0 ${
                isIncome ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {isIncome ? '+' : ''}${tx.amount}
              {tx.boxMoney > 0 && (
                <span className="text-xs text-amber-400 ml-1">(box ${tx.boxMoney})</span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}
