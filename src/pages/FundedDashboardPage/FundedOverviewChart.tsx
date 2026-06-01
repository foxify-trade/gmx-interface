import cx from "classnames";
import { useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { FundedDashboardData, FundedDashboardPoint } from "domain/funded/funded-types";
import { formatFundedCompactNumber, formatFundedUsd } from "domain/funded/funded-utils";

const CHART_MARGIN = { top: 8, right: 8, left: 0, bottom: 0 };
const AXIS_TICK = { fill: "var(--color-slate-500)", fontSize: 11 };
const TOOLTIP_CURSOR = { stroke: "var(--color-slate-600)", strokeDasharray: "2 2" };

function ChartTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: FundedDashboardPoint }> }) {
  if (!active || !payload?.length) return null;
  const pt = payload[0].payload;
  return (
    <div className="rounded-8 border border-slate-600 bg-slate-900 px-12 py-10">
      <div className="text-11 text-slate-400">{pt.label}</div>
      <div className="numbers mt-4 text-13 text-white">{formatFundedUsd(pt.value, 2)}</div>
    </div>
  );
}

export function FundedOverviewChart({ data }: { data: FundedDashboardData }) {
  const [mode, setMode] = useState<"pnl" | "volume">("pnl");
  const { summary, pnlSeries, volumeSeries, overviewExtras } = data;

  const chartData = mode === "pnl" ? pnlSeries : volumeSeries;
  const isPnl = mode === "pnl";
  const ddLimitValue = -(summary.drawdownLimitPct * summary.accountSizeUsd) / 100;

  const bottomStats = [
    { label: "Total Volume", value: formatFundedUsd(summary.totalVolumeUsd, 2) },
    { label: "Max Drawdown", value: `${summary.maxDrawdownPct.toFixed(2)}%` },
    { label: "Trades", value: String(data.recentTrades.length) },
    { label: "Trading Frequency", value: `${(overviewExtras?.tradingFrequencyPerDay ?? 0).toFixed(1)} / day` },
  ];

  return (
    <div className="flex flex-col">
      {/* Toggle + legend */}
      <div className="flex items-center justify-between">
        <div className="flex gap-0">
          {(["pnl", "volume"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setMode(t)}
              className={cx(
                "pb-10 pr-20 text-14 font-medium transition-colors",
                mode === t ? "text-white" : "text-slate-500 hover:text-slate-300"
              )}
            >
              {t === "pnl" ? "Profit / Loss" : "Total Volume"}
            </button>
          ))}
        </div>
        {isPnl && (
          <div className="flex items-center gap-16">
            {[
              { color: "#4ADE80", dashed: false, label: "PnL" },
              { color: "#4ADE80", dashed: true, label: "Target" },
              { color: "#ef4444", dashed: true, label: "DD Limit" },
            ].map((leg) => (
              <div key={leg.label} className="flex items-center gap-6">
                <svg width="16" height="8">
                  <line
                    x1="0"
                    y1="4"
                    x2="16"
                    y2="4"
                    stroke={leg.color}
                    strokeWidth="2"
                    strokeDasharray={leg.dashed ? "4 3" : undefined}
                  />
                </svg>
                <span className="text-11 text-slate-400">{leg.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%" debounce={300}>
          <ComposedChart data={chartData} margin={CHART_MARGIN}>
            <defs>
              <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4ADE80" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#4ADE80" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="1.5 8" stroke="var(--color-stroke-primary)" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={AXIS_TICK} />
            <YAxis tickLine={false} axisLine={false} tick={AXIS_TICK} tickFormatter={formatFundedCompactNumber} />
            <Tooltip cursor={TOOLTIP_CURSOR} content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={isPnl ? "#4ADE80" : "#60A5FA"}
              strokeWidth={2}
              fill={isPnl ? "url(#pnlGrad)" : "none"}
              dot={false}
              activeDot={{ r: 4, fill: "#0f172a", stroke: isPnl ? "#4ADE80" : "#60A5FA", strokeWidth: 2 }}
            />
            {isPnl && summary.minProfitTargetUsd > 0 && (
              <ReferenceLine y={summary.minProfitTargetUsd} stroke="#4ADE80" strokeDasharray="4 4" strokeWidth={1} />
            )}
            {isPnl && <ReferenceLine y={ddLimitValue} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1} />}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom stats */}
      <div className="mt-16 grid grid-cols-4 border-t border-slate-700 pt-16">
        {bottomStats.map((stat, i) => (
          <div key={stat.label} className={cx("px-16", i < 3 ? "border-r border-slate-700" : "")}>
            <div className="text-[9px] font-semibold uppercase tracking-widest text-slate-500">{stat.label}</div>
            <div className="mt-6 text-16 font-medium text-white">{stat.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
