import cx from "classnames";

import type { FundedDashboardData } from "domain/funded/funded-types";
import { formatFundedPercent, formatFundedUsd } from "domain/funded/funded-utils";

export function FundedLevelUpTab({ data }: { data: FundedDashboardData }) {
  const { summary, levelUpData } = data;

  if (!levelUpData) {
    return <div className="pt-16 text-13 text-slate-400">Level up data not available.</div>;
  }

  const hasEnded = !!levelUpData.levelEndedTitle;
  const totalAvailable =
    levelUpData.availableProfitUsd + levelUpData.availableCollateralUsd - levelUpData.totalWithdrawnUsd;

  const summaryStats = [
    {
      label: "Total Profit / Loss",
      value: formatFundedUsd(summary.currentPnlUsd, 2),
      helper: `${summary.currentPnlPct.toFixed(2)}% on ${formatFundedUsd(summary.accountSizeUsd)}`,
      negative: summary.currentPnlUsd < 0,
    },
    {
      label: "Total Volume",
      value: formatFundedUsd(summary.totalVolumeUsd, 2),
      helper: "lifetime this level",
    },
    {
      label: "Max Drawdown",
      value: formatFundedPercent(summary.maxDrawdownPct),
      helper: `limit was ${formatFundedPercent(summary.drawdownLimitPct)}`,
    },
    {
      label: "Challenge Duration",
      value: `${levelUpData.challengeDurationDays} days`,
      helper: "active period",
    },
  ];

  return (
    <div className="flex flex-col pt-16">
      {/* Level ended banner */}
      {hasEnded && (
        <div className="mb-16 rounded-8 border border-red-500/20 bg-red-950/30 px-20 py-16">
          <div className="text-[10px] font-bold uppercase tracking-wider text-red-400">▲ Challenge Level Ended</div>
          <div className="mt-4 text-16 font-semibold text-white">{levelUpData.levelEndedTitle}</div>
          <div className="mt-4 text-13 text-slate-400">{levelUpData.levelEndedSubtitle}</div>
        </div>
      )}

      {/* Summary stats row */}
      <div className="flex overflow-hidden rounded-8 border border-slate-700 bg-[#0d111a]">
        {summaryStats.map((stat, i) => (
          <div key={stat.label} className={cx("flex-1 px-20 py-16", i < 3 ? "border-r border-slate-700" : "")}>
            <div className="text-[9px] font-semibold uppercase tracking-widest text-slate-500">{stat.label}</div>
            <div className={cx("mt-8 text-[22px] font-semibold", "negative" in stat && stat.negative ? "text-red-400" : "text-white")}>
              {stat.value}
            </div>
            <div className="mt-4 text-11 text-slate-400">{stat.helper}</div>
          </div>
        ))}
      </div>

      {/* Available Funds + Next Level */}
      <div className="mt-16 grid gap-16 xl:grid-cols-2">
        {/* Available Funds */}
        <div className="rounded-8 border border-slate-700 bg-[#0d111a] px-20 py-18">
          <div className="text-14 font-semibold text-white">Available Funds</div>
          <div className="mt-2 text-[10px] uppercase tracking-wider text-slate-500">Withdraw Profit or Collateral</div>
          <div className="mt-16 flex flex-col gap-14">
            {[
              { label: "Available Profit", value: levelUpData.availableProfitUsd },
              { label: "Available Collateral", value: levelUpData.availableCollateralUsd },
              { label: "Total Withdrawn", value: levelUpData.totalWithdrawnUsd },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between border-b border-slate-800 pb-10 last:border-b-0">
                <span className="text-13 text-slate-400">{row.label}</span>
                <span className="text-13 font-medium text-white">{formatFundedUsd(row.value, 2)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-4">
              <span className="text-14 font-semibold text-white">Total Available</span>
              <span className="text-16 font-semibold text-white">{formatFundedUsd(totalAvailable, 2)}</span>
            </div>
          </div>
          <div className="mt-20 grid grid-cols-2 gap-12">
            <button type="button" className="rounded-8 border border-slate-600 bg-slate-800 px-16 py-12 text-13 font-medium text-slate-300 transition-colors hover:bg-slate-700">
              ↓ Withdraw Profit
            </button>
            <button type="button" className="rounded-8 border border-slate-600 bg-slate-800 px-16 py-12 text-13 font-medium text-slate-300 transition-colors hover:bg-slate-700">
              Withdraw Collateral
            </button>
          </div>
          <div className="mt-12 text-[11px] text-slate-500">
            ⓘ If you withdraw collateral now, you'll need to re-deposit it before starting the next level.
          </div>
        </div>

        {/* Next Level card */}
        {levelUpData.nextLevel && (
          <div className="rounded-8 border border-slate-700 bg-[#0d111a] px-20 py-18">
            <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
              Advance · {levelUpData.nextLevel.advanceLabel}
            </div>
            <div className="mt-12 flex items-start gap-12">
              <div className="flex size-36 shrink-0 items-center justify-center rounded-8 bg-slate-700 text-14 font-bold text-white">
                {levelUpData.nextLevel.levelName[0]}
              </div>
              <div>
                <div className="text-16 font-semibold text-white">Start {levelUpData.nextLevel.levelName} Level</div>
                <div className="mt-4 text-12 text-slate-400">{levelUpData.nextLevel.description}</div>
              </div>
            </div>
            <div className="mt-16 grid grid-cols-3 gap-0 border-t border-slate-700 pt-16">
              {[
                { label: "Account Size", value: formatFundedUsd(levelUpData.nextLevel.accountSizeUsd) },
                { label: "Collateral", value: formatFundedUsd(levelUpData.nextLevel.collateralUsd, 2) },
                { label: "Drawdown Limit", value: formatFundedPercent(levelUpData.nextLevel.drawdownLimitPct) },
              ].map((item) => (
                <div key={item.label}>
                  <div className="text-[9px] uppercase tracking-wider text-slate-500">{item.label}</div>
                  <div className="mt-4 text-14 font-medium text-white">{item.value}</div>
                </div>
              ))}
            </div>
            <div className="mt-16 flex flex-col gap-8 border-t border-slate-700 pt-16">
              {[
                { label: "Required Collateral", value: formatFundedUsd(levelUpData.nextLevel.requiredCollateralUsd, 2), highlight: false },
                { label: "Available Funds", value: formatFundedUsd(levelUpData.nextLevel.availableFundsUsd, 2), highlight: false },
                { label: "Net Deposit Required", value: formatFundedUsd(levelUpData.nextLevel.netDepositRequired, 2), highlight: true },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between">
                  <span className="text-12 text-slate-400">{row.label}</span>
                  <span className={cx("text-13 font-medium", row.highlight ? "text-blue-400" : "text-white")}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="mt-20 w-full rounded-8 bg-blue-400 px-16 py-14 text-14 font-semibold text-slate-900 transition-colors hover:bg-blue-300"
            >
              Deposit {formatFundedUsd(levelUpData.nextLevel.netDepositRequired, 2)} & Start {levelUpData.nextLevel.levelName} →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
