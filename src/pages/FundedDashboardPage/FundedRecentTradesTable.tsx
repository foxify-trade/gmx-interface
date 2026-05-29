import type { FundedRecentTrade } from "domain/funded/funded-types";
import { formatFundedUsd } from "domain/funded/funded-utils";

import { Table, TableTd, TableTh, TableTheadTr, TableTr } from "components/Table/Table";

export function FundedRecentTradesTable({ trades }: { trades: FundedRecentTrade[] }) {
  return (
    <div className="rounded-8 border border-slate-600 bg-slate-900">
      <div className="border-b-1/2 border-slate-600 px-20 py-16">
        <div className="text-16 font-medium text-typography-primary">Recent trades</div>
        <div className="mt-6 text-13 text-typography-secondary">
          Read-only activity snapshot from the current funded dashboard source.
        </div>
      </div>
      <Table>
        <thead>
          <TableTheadTr>
            <TableTh>Time</TableTh>
            <TableTh>Market</TableTh>
            <TableTh>Side</TableTh>
            <TableTh>Size</TableTh>
            <TableTh>PnL</TableTh>
            <TableTh>Points</TableTh>
          </TableTheadTr>
        </thead>
        <tbody>
          {trades.map((trade) => (
            <TableTr key={trade.id}>
              <TableTd>{trade.timestampLabel}</TableTd>
              <TableTd>{trade.symbol}</TableTd>
              <TableTd>{trade.direction}</TableTd>
              <TableTd className="numbers">{formatFundedUsd(trade.sizeUsd)}</TableTd>
              <TableTd className={trade.pnlUsd >= 0 ? "numbers text-green-500" : "numbers text-red-500"}>
                {formatFundedUsd(trade.pnlUsd, 2)}
              </TableTd>
              <TableTd className="numbers">{trade.points}</TableTd>
            </TableTr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
