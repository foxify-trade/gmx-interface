import cx from "classnames";
import type { ReactNode } from "react";

import type { FundedDashboardData } from "domain/funded/funded-types";
import { formatFundedPercent, formatFundedUsd } from "domain/funded/funded-utils";

import { FundedGaugeRing } from "components/Funded/FundedGaugeRing";

import { FundedOverviewChart } from "./FundedOverviewChart";

function StatCard({ index, label, main, helper }: { index: string; label: string; main: ReactNode; helper?: string }) {
  return (
    <div className="min-w-[140px] flex-1 border-r border-slate-700 px-16 py-14 last:border-r-0">
      <div className="text-[9px] font-semibold uppercase tracking-widest text-slate-500">
        {index}&nbsp;&nbsp;{label}
      </div>
      <div className="mt-10">{main}</div>
      {helper && <div className="mt-6 text-11 text-slate-400">{helper}</div>}
    </div>
  );
}

function AccountGaugeRow({
  label,
  value,
  helper,
  valuePct,
  color = "#4ADE80",
}: {
  label: string;
  value: string;
  helper: string;
  valuePct: number;
  color?: string;
}) {
  return (
    <div className="border-b border-slate-700 px-16 py-14 last:border-b-0">
      <div className="text-11 text-slate-500">{label}</div>
      <div className="mt-4 flex items-end justify-between gap-8">
        <div>
          <div className="text-16 font-medium text-white">{value}</div>
          <div className="mt-2 text-[9px] uppercase tracking-wider text-slate-500">{helper}</div>
        </div>
        <FundedGaugeRing valuePct={valuePct} size={64} variant="semi" color={color} />
      </div>
    </div>
  );
}

export function FundedOverviewTab({ data }: { data: FundedDashboardData }) {
  const { summary, overviewExtras, performanceStats } = data;
  const pointsPct = summary.pointsRequired > 0 ? (summary.currentPoints / summary.pointsRequired) * 100 : 0;
  const drawdownPct = summary.drawdownLimitPct > 0 ? (summary.maxDrawdownPct / summary.drawdownLimitPct) * 100 : 0;
  const ddRemaining = Math.max(0, summary.drawdownLimitPct - summary.maxDrawdownPct);
  const combinedMod = performanceStats?.combinedModifier ?? 1;

  return (
    <div className="flex flex-col pt-16">
      {/* 5 stats cards */}
      <div className="flex overflow-x-auto rounded-8 border border-slate-700 bg-[#0d111a] scrollbar-hide">
        <StatCard
          index="001"
          label="Points"
          main={
            <div className="flex items-center gap-12">
              <div>
                <span className="text-[22px] font-medium text-white">{summary.currentPoints.toFixed(2)}</span>
                <span className="text-14 text-slate-400"> / {summary.pointsRequired}</span>
              </div>
              <FundedGaugeRing
                valuePct={pointsPct}
                size={54}
                variant="ring"
                color="#4ADE80"
                label={`${Math.round(pointsPct)}%`}
              />
            </div>
          }
          helper={overviewExtras?.pointsTrend}
        />
        <StatCard
          index="002"
          label="Account Size"
          main={<div className="text-[22px] font-medium text-white">{formatFundedUsd(summary.accountSizeUsd)}</div>}
          helper={`Collateral ${formatFundedUsd(summary.collateralUsd)}`}
        />
        <StatCard
          index="003"
          label="Drawdown Limit"
          main={<div className="text-[22px] font-medium text-white">{formatFundedPercent(summary.drawdownLimitPct)}</div>}
          helper={`Max reached ${formatFundedPercent(summary.maxDrawdownPct)}`}
        />
        <StatCard
          index="004"
          label="Current Profit / Loss"
          main={
            <div className={cx("text-[22px] font-medium", summary.currentPnlUsd >= 0 ? "text-green-400" : "text-red-400")}>
              {formatFundedUsd(summary.currentPnlUsd, 2)}
            </div>
          }
          helper={`PnL target ${formatFundedUsd(summary.minProfitTargetUsd, 2)} · ${summary.currentPnlPct.toFixed(0)}% reached`}
        />
        <StatCard
          index="005"
          label="Activity Timer"
          main={<div className="text-[22px] font-medium text-white">{overviewExtras?.activityTimerStatus ?? "—"}</div>}
          helper={overviewExtras?.activityTimerHelper}
        />
      </div>

      {/* Chart + Account Status sidebar */}
      <div className="mt-16 grid gap-16 xl:grid-cols-[minmax(0,1fr)_272px]">
        <div className="rounded-8 border border-slate-700 bg-[#0d111a] px-20 py-18">
          <FundedOverviewChart data={data} />
        </div>

        <div className="rounded-8 border border-slate-700 bg-[#0d111a]">
          <div className="border-b border-slate-700 px-16 py-14">
            <div className="text-13 font-semibold text-white">Account Status</div>
            <div className="mt-2 text-[10px] uppercase tracking-widest text-slate-500">
              Level {summary.levelLabel} · {summary.status === "On Deck" ? "On-Deck" : summary.status}
            </div>
          </div>
          <AccountGaugeRow
            label="Points Progress"
            value={`${summary.currentPoints.toFixed(2)} / ${summary.pointsRequired}`}
            helper={`${pointsPct.toFixed(1)}% · ${overviewExtras?.pointsTrend ?? "Stable"}`}
            valuePct={pointsPct}
            color="#4ADE80"
          />
          <AccountGaugeRow
            label="Drawdown"
            value={`${formatFundedPercent(summary.maxDrawdownPct)} / ${formatFundedPercent(summary.drawdownLimitPct)}`}
            helper={`${ddRemaining.toFixed(2)}% Remaining`}
            valuePct={drawdownPct}
            color={drawdownPct > 80 ? "#ef4444" : "#4ADE80"}
          />
          <AccountGaugeRow
            label="Combined Modifier"
            value={`×${combinedMod.toFixed(2)}`}
            helper={`Performance Multiplier · Cap ×2.00`}
            valuePct={(combinedMod / 2) * 100}
            color="#4ADE80"
          />
          {overviewExtras && (
            <div className="px-16 py-14">
              <div className="text-[9px] uppercase tracking-widest text-slate-500">
                Snapshot · {overviewExtras.snapshotDateLabel}
              </div>
              <div className="mt-4 text-[22px] font-medium text-white">
                {formatFundedUsd(overviewExtras.snapshotAmountUsd, 2)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
