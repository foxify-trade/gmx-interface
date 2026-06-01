import { Cell, Pie, PieChart } from "recharts";

const EMPTY_COLOR = "#1e293b";

interface FundedGaugeRingProps {
  valuePct: number; // 0–100
  size?: number;
  variant?: "ring" | "semi";
  color?: string;
  label?: string;
}

/** Recharts-based circular gauge. variant="ring" = full donut; variant="semi" = half-circle speedometer. */
export function FundedGaugeRing({
  valuePct,
  size = 80,
  variant = "semi",
  color = "#4ADE80",
  label,
}: FundedGaugeRingProps) {
  const clamped = Math.max(0, Math.min(100, valuePct));
  const data = [{ v: clamped }, { v: 100 - clamped }];
  const outerRadius = size / 2 - 2;
  const innerRadius = outerRadius - size * 0.12;

  if (variant === "semi") {
    const h = Math.ceil(size / 2) + 4;
    return (
      <PieChart width={size} height={h}>
        <Pie
          data={data}
          dataKey="v"
          cx={size / 2}
          cy={h}
          startAngle={180}
          endAngle={0}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          stroke="none"
          isAnimationActive={false}
        >
          <Cell fill={color} />
          <Cell fill={EMPTY_COLOR} />
        </Pie>
      </PieChart>
    );
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <PieChart width={size} height={size}>
        <Pie
          data={data}
          dataKey="v"
          cx={size / 2}
          cy={size / 2}
          startAngle={90}
          endAngle={-270}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          stroke="none"
          isAnimationActive={false}
        >
          <Cell fill={color} />
          <Cell fill={EMPTY_COLOR} />
        </Pie>
      </PieChart>
      {label !== undefined && (
        <div className="absolute inset-0 flex items-center justify-center text-11 text-slate-400">{label}</div>
      )}
    </div>
  );
}
