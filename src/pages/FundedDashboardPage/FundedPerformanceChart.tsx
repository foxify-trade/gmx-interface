import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { FundedDashboardPoint } from "domain/funded/funded-types";
import { formatFundedCompactNumber, formatFundedUsd } from "domain/funded/funded-utils";

const CHART_MARGIN = { top: 8, right: 8, left: 0, bottom: 0 };
const AXIS_TICK_PROPS = { fill: "var(--color-slate-500)", fontSize: 12 };
const TOOLTIP_CURSOR = { stroke: "var(--color-slate-500)", strokeDasharray: "2 2" };
const ACTIVE_DOT = { r: 4, fill: "var(--color-slate-900)", stroke: "var(--color-blue-300)", strokeWidth: 2 };

function FundedChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: FundedDashboardPoint }>;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0].payload;

  return (
    <div className="rounded-8 border border-slate-600 bg-slate-900 px-12 py-10">
      <div className="text-caption">{point.label}</div>
      <div className="numbers mt-6 text-13 text-typography-primary">{formatFundedUsd(point.value)}</div>
    </div>
  );
}

export function FundedPerformanceChart({
  title,
  description,
  data,
  kind,
}: {
  title: string;
  description: string;
  data: FundedDashboardPoint[];
  kind: "line" | "bar";
}) {
  return (
    <div className="rounded-8 border border-slate-600 bg-slate-900 px-20 py-18">
      <div className="text-16 font-medium text-typography-primary">{title}</div>
      <div className="mt-8 text-13 text-typography-secondary">{description}</div>
      <div className="mt-12 h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%" debounce={300}>
          <ComposedChart data={data} margin={CHART_MARGIN}>
            <CartesianGrid vertical={false} strokeDasharray="1.5 8" stroke="var(--color-stroke-primary)" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={AXIS_TICK_PROPS} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={AXIS_TICK_PROPS}
              tickFormatter={formatFundedCompactNumber}
            />
            <Tooltip cursor={TOOLTIP_CURSOR} content={<FundedChartTooltip />} />
            {kind === "line" ? (
              <Line
                type="monotone"
                dataKey="value"
                stroke="var(--color-blue-300)"
                strokeWidth={2}
                dot={false}
                activeDot={ACTIVE_DOT}
              />
            ) : (
              <Bar dataKey="value" fill="var(--color-blue-300)" radius={2} />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
