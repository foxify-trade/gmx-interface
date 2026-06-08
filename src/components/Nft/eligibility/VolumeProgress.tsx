import { Trans } from "@lingui/macro";
import cx from "classnames";

interface VolumeProgressProps {
  volume: number;
  target: number;
  percent: number;
}

// Wave 1 threshold is 125k / 250k total = 50% of the progress bar
const WAVE1_PCT = 50;

function formatUsd(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${n}`;
}

export function VolumeProgress({ volume, target, percent }: VolumeProgressProps) {
  const clamped = Math.max(0, Math.min(100, percent));
  const reachedTarget = volume >= target;
  const reachedWave1 = percent >= WAVE1_PCT;

  const barColor = reachedTarget
    ? "bg-gradient-to-r from-green-600 to-green-400"
    : reachedWave1
      ? "bg-gradient-to-r from-blue-400 to-yellow-400"
      : "bg-gradient-to-r from-blue-400/70 to-blue-400";

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <p className="text-14 font-medium text-white">
          <Trans>Volume Progress</Trans>
        </p>
        <span className="text-12 text-[#a8b0c0]">
          {formatUsd(volume)} / {formatUsd(target)}
        </span>
      </div>

      <div className="relative">
        {/* Wave 1 milestone tick */}
        <div
          className="absolute top-0 z-10 h-full w-px bg-white/25"
          style={{ left: `${WAVE1_PCT}%` }}
        />
        <div className="relative h-20 w-full overflow-hidden rounded-full bg-[#1e2235]">
          <div
            className={cx("h-full rounded-full transition-all duration-700", barColor)}
            style={{ width: `${clamped}%` }}
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="text-[11px] font-semibold text-white drop-shadow">
              {formatUsd(volume)} / {formatUsd(target)}
            </span>
          </div>
        </div>
      </div>

      <div className="relative h-16 text-12 text-[#a8b0c0]">
        <span className="absolute left-0">$0</span>
        <span
          className={cx(
            "absolute -translate-x-1/2 font-medium",
            reachedWave1 ? "text-green-400" : "text-[#a8b0c0]"
          )}
          style={{ left: "50%" }}
        >
          <Trans>Wave 1 · 125k</Trans>
        </span>
        <span className="absolute right-0">
          <Trans>Wave 2 · 250k</Trans>
        </span>
      </div>
    </div>
  );
}
