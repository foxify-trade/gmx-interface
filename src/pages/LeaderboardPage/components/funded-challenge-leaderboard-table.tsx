import { Trans } from "@lingui/macro";
import cx from "classnames";
import { useState } from "react";

import { useFundedChallengeRankings } from "domain/funded/use-funded-challenge-rankings";
import type { FundedChallengeRankingsItem } from "domain/funded/funded-types";
import { Table, TableTd, TableTh, TableTheadTr, TableTr } from "components/Table/Table";
import { TableScrollFadeContainer } from "components/TableScrollFade/TableScrollFade";

function truncateAddress(addr: string): string {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function formatUsdValue(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-xl">🥇</span>;
  if (rank === 2) return <span className="text-xl">🥈</span>;
  if (rank === 3) return <span className="text-xl">🥉</span>;
  return <span className="pl-2">{rank}</span>;
}

function formatRatio(value: number | null | undefined): string {
  return value != null ? value.toFixed(2) : "--";
}

function LeaderboardRow({ item }: { item: FundedChallengeRankingsItem }) {
  const pnl = item.journeyPnL ?? 0;
  return (
    <TableTr>
      <TableTd className="pl-20">
        <RankBadge rank={item.rank} />
      </TableTd>
      <TableTd>
        <span className="font-mono text-sm">{truncateAddress(item.traderAddress)}</span>
      </TableTd>
      <TableTd>{item.challengeName ?? "--"}</TableTd>
      <TableTd>{item.levelRank ?? "--"}</TableTd>
      <TableTd className="text-right">{item.points ?? "--"}</TableTd>
      <TableTd className={cx("text-right", pnl >= 0 ? "text-green-500" : "text-red-500")}>
        {item.journeyPnL != null ? formatUsdValue(item.journeyPnL) : "--"}
      </TableTd>
      <TableTd className="text-right">{formatRatio(item.sharpeRatio)}</TableTd>
      <TableTd className="text-right">{formatRatio(item.calmarRatio)}</TableTd>
      <TableTd className="text-right">{formatRatio(item.gainToPainRatio)}</TableTd>
      <TableTd className="pr-20 text-right">
        {item.consistencyScore != null ? `${(item.consistencyScore * 100).toFixed(2)}%` : "--"}
      </TableTd>
    </TableTr>
  );
}

export function FundedChallengeLeaderboardTable() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useFundedChallengeRankings({ page, pageSize: 20 });

  if (isLoading) {
    return (
      <div className="flex h-[200px] items-center justify-center text-typography-secondary">
        <Trans>Loading...</Trans>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex h-[200px] items-center justify-center text-red-400">
        <Trans>Failed to load leaderboard data.</Trans>
      </div>
    );
  }

  return (
    <div>
      <TableScrollFadeContainer>
        <Table>
          <thead>
            <TableTheadTr>
              <TableTh className="pl-20">
                <Trans>Rank</Trans>
              </TableTh>
              <TableTh>
                <Trans>Wallet</Trans>
              </TableTh>
              <TableTh>
                <Trans>Challenge</Trans>
              </TableTh>
              <TableTh>
                <Trans>Level</Trans>
              </TableTh>
              <TableTh className="text-right">
                <Trans>Points</Trans>
              </TableTh>
              <TableTh className="text-right">
                <Trans>Journey P&L</Trans>
              </TableTh>
              <TableTh className="text-right">
                <Trans>Sharpe</Trans>
              </TableTh>
              <TableTh className="text-right">
                <Trans>Calmar</Trans>
              </TableTh>
              <TableTh className="text-right">
                <Trans>Gain/Pain</Trans>
              </TableTh>
              <TableTh className="pr-20 text-right">
                <Trans>Consistency</Trans>
              </TableTh>
            </TableTheadTr>
          </thead>
          <tbody>
            {data.data.map((item) => (
              <LeaderboardRow key={`${item.rank}-${item.traderAddress}`} item={item} />
            ))}
          </tbody>
        </Table>
      </TableScrollFadeContainer>

      {data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-8 py-12">
          <button
            className="rounded px-12 py-6 text-body-medium text-typography-secondary hover:text-typography-primary disabled:opacity-40"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <Trans>Previous</Trans>
          </button>
          <span className="text-body-medium text-typography-secondary">
            {page} / {data.totalPages}
          </span>
          <button
            className="rounded px-12 py-6 text-body-medium text-typography-secondary hover:text-typography-primary disabled:opacity-40"
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
          >
            <Trans>Next</Trans>
          </button>
        </div>
      )}
    </div>
  );
}
