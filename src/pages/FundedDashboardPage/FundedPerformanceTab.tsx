import cx from "classnames";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { FundedDashboardData, FundedDashboardPoint } from "domain/funded/funded-types";
import { formatFundedCompactNumber, formatFundedUsd } from "domain/funded/funded-utils";

const AXIS_TICK = { fill: "var(--color-slate-500)", fontSize: 11 };
const TOOLTIP_CURSOR = { stroke: "var(--color-slate-600)", strokeDasharray: "2 2" };

function DailyPnlTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: FundedDashboardPoint }> }) {
  if (!active || !payload?.length) return null;
  const pt = payload[0].payload;
  return (
    <div className="rounded-8 border border-slate-600 bg-slate-900 px-12 py-10">
      <div className="text-11 text-slate-400">{pt.label}</div>
      <div className={cx("numbers mt-4 text-13", pt.value >= 0 ? "text-green-400" : "text-red-400")}>
        {formatFundedUsd(pt.value, 2)}
      </div>
    </div>
  );
}

const TONE_CLASSES = {
  positive: "text-green-400",
  negative: "text-red-400",
  neutral: "text-slate-400",
};

function MetricCard({ label, value, progress, badge, accent }: {
  label: string; value: string; progress?: number; badge?: string; accent?: boolean;
}) {
  return (
    <div className="flex flex-1 flex-col border-r border-slate-700 px-16 py-14 last:border-r-0">
      <div className="text-[9px] font-semibold uppercase tracking-widest text-slate-500">{label}</div>
      <div className={cx("mt-10 text-[22px] font-medium", accent ? "text-green-400" : "text-white")}>{value}</div>
      {progress !== undefined && (
        <div className="mt-8 h-1 w-full rounded-full bg-slate-700">
          <div
            className={cx("h-full rounded-full", accent ? "bg-green-400" : "bg-slate-500")}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
      <div className="mt-6 text-11 text-slate-400">{badge}</div>
    </div>
  );
}

export function FundedPerformanceTab({ data }: { data: FundedDashboardData }) {
  const ps = data.performanceStats;
  const extras = data.overviewExtras;

  if (!ps) {
    return <div className="pt-16 text-13 text-slate-400">Performance data not available.</div>;
  }

  const bottomStats = [
    { label: "Total Volume", value: formatFundedUsd(data.summary.totalVolumeUsd) },
    { label: "# of Trades", value: String(data.recentTrades.length) },
    { label: "Avg Trade Size", value: formatFundedUsd(ps.avgTradeSizeUsd, 2) },
    { label: "Trading Frequency", value: `${(extras?.tradingFrequencyPerDay ?? 0).toFixed(1)} / day` },
    { label: "Win/Loss Ratio", value: ps.winLossRatio.toFixed(2) },
    { label: "Commission Paid", value: formatFundedUsd(ps.commissionPaid, 2) },
    { label: "Activity Penalty", value: formatFundedUsd(ps.activityPenalty, 2) },
    { label: "Funds Tx Fee", value: formatFundedUsd(ps.fundsTxFee, 2) },
    { label: "Available Profit", value: formatFundedUsd(ps.availableProfit, 2) },
    { label: "Available Collateral", value: formatFundedUsd(ps.availableCollateral, 2) },
  ];

  return (
    <div className="flex flex-col gap-16 pt-16">
      {/* Top 5 metric cards */}
      <div className="flex overflow-hidden rounded-8 border border-slate-700 bg-[#0d111a]">
        <MetricCard label="Sharpe Ratio" value={ps.sharpeRatio.toFixed(2)} progress={ps.sharpeRatio * 50} badge={ps.sharpeLabel} />
        <MetricCard label="Calmar Ratio" value={ps.calmarRatio.toFixed(2)} progress={ps.calmarRatio * 50} badge={ps.calmarLabel} />
        <MetricCard label="Gain-to-Pain" value={ps.gainToPain.toFixed(2)} progress={ps.gainToPain * 50} badge={ps.gainToPainLabel} />
        <MetricCard label="Consistency" value={ps.consistency.toFixed(2)} progress={ps.consistency * 100} badge={ps.consistencyLabel} />
        <MetricCard label="Combined Modifier" value={`×${ps.combinedModifier.toFixed(2)}`} progress={(ps.combinedModifier / 2) * 100} badge="Performance multiplier" accent />
      </div>

      {/* Chart + right panel */}
      <div className="grid gap-16 xl:grid-cols-[minmax(0,1fr)_300px]">
        {/* Left: Daily P&L + bottom stats grid */}
        <div className="flex flex-col gap-16">
          <div className="rounded-8 border border-slate-700 bg-[#0d111a] px-20 py-18">
            <div className="flex items-center justify-between">
              <div className="text-14 font-medium text-white">Daily P&L</div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500">{ps.sessions} Sessions</div>
            </div>
            <div className="mt-12 h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%" debounce={300}>
                <ComposedChart data={ps.dailyPnlSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="1.5 8" stroke="var(--color-stroke-primary)" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={AXIS_TICK} />
                  <YAxis tickLine={false} axisLine={false} tick={AXIS_TICK} tickFormatter={formatFundedCompactNumber} />
                  <Tooltip cursor={TOOLTIP_CURSOR} content={<DailyPnlTooltip />} />
                  <Bar dataKey="value" fill="#f43f5e" radius={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Bottom stats 5×2 grid */}
          <div className="overflow-hidden rounded-8 border border-slate-700 bg-[#0d111a]">
            <div className="grid grid-cols-5">
              {bottomStats.map((stat, i) => (
                <div
                  key={stat.label}
                  className={cx(
                    "px-14 py-12",
                    i < 5 ? "border-b border-slate-700" : "",
                    (i + 1) % 5 !== 0 ? "border-r border-slate-700" : ""
                  )}
                >
                  <div className="text-[9px] font-semibold uppercase tracking-widest text-slate-500">{stat.label}</div>
                  <div className="mt-6 text-13 font-medium text-white">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex flex-col gap-16">
          {/* Trading Patterns */}
          <div className="rounded-8 border border-slate-700 bg-[#0d111a] px-16 py-14">
            <div className="flex items-center justify-between">
              <div className="text-13 font-semibold text-white">Trading Patterns</div>
              <div className="text-[9px] uppercase tracking-wider text-slate-500">Last 30D</div>
            </div>
            <div className="mt-12 flex flex-col gap-10">
              {[
                { label: "Win / Loss Ratio", value: ps.winLossRatio.toFixed(2) },
                { label: "Avg Trade Size", value: formatFundedUsd(ps.avgTradeSizeUsd, 2) },
                { label: "Trading Frequency", value: `${(extras?.tradingFrequencyPerDay ?? 0).toFixed(1)} trades / day` },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between">
                  <span className="text-12 text-slate-400">{row.label}</span>
                  <span className="text-12 font-medium text-white">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Asset Distribution */}
          <div className="rounded-8 border border-slate-700 bg-[#0d111a] px-16 py-14">
            <div className="flex items-center justify-between">
              <div className="text-13 font-semibold text-white">Asset Distribution</div>
              <div className="text-[9px] uppercase tracking-wider text-slate-500">By Volume</div>
            </div>
            <div className="mt-12 flex flex-col gap-8">
              {ps.assetDistribution.map((asset) => (
                <div key={asset.symbol} className="flex flex-col gap-4">
                  <div className="flex items-center justify-between text-11">
                    <span className="text-slate-400">{asset.symbol}</span>
                    <span className="text-white">{asset.pct.toFixed(1)}%</span>
                  </div>
                  <div className="h-4 w-full overflow-hidden rounded-full bg-slate-700">
                    <div className="h-full rounded-full bg-blue-400" style={{ width: `${asset.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance vs Average */}
          <div className="rounded-8 border border-slate-700 bg-[#0d111a] px-16 py-14">
            <div className="flex items-center justify-between">
              <div className="text-13 font-semibold text-white">Performance vs Average</div>
              <div className="text-[9px] uppercase tracking-wider text-slate-500">Peer Benchmark</div>
            </div>
            <div className="mt-12 flex flex-col gap-10">
              {[
                { label: "Performance", value: ps.peerPerformance, tone: ps.peerPerformanceTone },
                { label: "Volume", value: ps.peerVolume, tone: ps.peerVolumeTone },
                { label: "Duration", value: ps.peerDuration, tone: ps.peerDurationTone },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between">
                  <span className="text-12 text-slate-400">{row.label}</span>
                  <span className={cx("text-12 font-medium", TONE_CLASSES[row.tone])}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
