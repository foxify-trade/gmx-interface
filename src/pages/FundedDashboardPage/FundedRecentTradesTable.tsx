import cx from "classnames";

import type { FundedRecentTrade } from "domain/funded/funded-types";
import { formatFundedUsd } from "domain/funded/funded-utils";

function SymbolBadge({ symbol }: { symbol: string }) {
  return (
    <div className="flex items-center gap-8">
      <div className="flex size-24 shrink-0 items-center justify-center rounded-full bg-slate-700 text-[10px] font-bold text-slate-300">
        {symbol.slice(0, 1)}
      </div>
      <span>{symbol}</span>
    </div>
  );
}

export function FundedRecentTradesTable({ trades }: { trades: FundedRecentTrade[] }) {
  return (
    <div className="rounded-8 border border-slate-700 bg-[#0d111a]">
      <div className="border-b border-slate-700 px-20 py-16">
        <div className="text-16 font-semibold text-white">Recent Trades</div>
        <div className="mt-4 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          {trades.length} Trade{trades.length !== 1 ? "s" : ""}
        </div>
      </div>

      {trades.length === 0 ? (
        <div className="px-20 py-16 text-13 text-slate-400">No trades recorded for this journey.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                {["Time", "Symbol", "Direction", "Size", "P / L", "Points"].map((col) => (
                  <th
                    key={col}
                    className="px-20 py-12 text-left text-[9px] font-semibold uppercase tracking-widest text-slate-500"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trades.map((trade) => (
                <tr key={trade.id} className="border-b border-slate-800 last:border-b-0 hover:bg-slate-800/40">
                  <td className="px-20 py-14 text-13 text-slate-400">{trade.timestampLabel}</td>
                  <td className="px-20 py-14 text-13 text-white">
                    <SymbolBadge symbol={trade.symbol} />
                  </td>
                  <td className="px-20 py-14">
                    <span
                      className={cx(
                        "text-13 font-semibold uppercase",
                        trade.direction === "Long" ? "text-green-400" : "text-red-400"
                      )}
                    >
                      {trade.direction === "Long" ? "Long" : "Short"}
                    </span>
                  </td>
                  <td className="numbers px-20 py-14 text-13 text-white">
                    {formatFundedUsd(trade.sizeUsd, 4)}
                  </td>
                  <td className={cx("numbers px-20 py-14 text-13", trade.pnlUsd >= 0 ? "text-green-400" : "text-red-400")}>
                    {formatFundedUsd(trade.pnlUsd, 2)}
                  </td>
                  <td className="numbers px-20 py-14 text-13 text-white">{trade.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
