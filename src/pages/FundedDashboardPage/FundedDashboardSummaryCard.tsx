import type { FundedDashboardSummary } from "domain/funded/funded-types";
import { formatFundedPercent, formatFundedUsd } from "domain/funded/funded-utils";

import { FundedMetricCard } from "components/Funded/FundedMetricCard";

export function FundedDashboardSummaryCard({ summary }: { summary: FundedDashboardSummary }) {
  return (
    <div className="rounded-8 border border-slate-600 bg-slate-900 px-20 py-18">
      <div className="flex flex-col gap-16 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="text-caption">{summary.trackLabel}</div>
          <div className="mt-8 text-h2 text-typography-primary">{summary.levelLabel}</div>
          <div className="mt-8 text-13 text-typography-secondary">
            Status: <span className="text-typography-primary">{summary.status}</span>
          </div>
        </div>
        <div className="grid gap-10 sm:grid-cols-2 xl:grid-cols-4">
          <FundedMetricCard label="Account size" value={formatFundedUsd(summary.accountSizeUsd)} />
          <FundedMetricCard label="Collateral" value={formatFundedUsd(summary.collateralUsd)} />
          <FundedMetricCard
            label="Current PnL"
            value={formatFundedUsd(summary.currentPnlUsd, 2)}
            helper={formatFundedPercent(summary.currentPnlPct)}
            tone={summary.currentPnlUsd >= 0 ? "positive" : "negative"}
          />
          <FundedMetricCard
            label="Drawdown"
            value={formatFundedPercent(summary.maxDrawdownPct)}
            helper={`Limit ${formatFundedPercent(summary.drawdownLimitPct)}`}
          />
        </div>
      </div>
    </div>
  );
}
