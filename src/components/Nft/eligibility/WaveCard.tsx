import { Trans } from "@lingui/macro";
import cx from "classnames";

import type { WaveEligibility } from "domain/nft/use-nft-eligibility";

interface WaveCardProps {
  entry: WaveEligibility;
}

const STATUS_CONFIG = {
  eligible: {
    border: "border-green-500/40",
    badge: "bg-green-500/15 text-green-400 border border-green-500/30",
    accent: "bg-green-500",
    label: <Trans>Eligible ✓</Trans>,
  },
  "not-eligible": {
    border: "border-red-500/30",
    badge: "bg-red-500/15 text-red-400 border border-red-500/30",
    accent: "bg-red-500",
    label: <Trans>Not eligible</Trans>,
  },
  pending: {
    border: "border-[#3a3f50]",
    badge: "bg-[#1e2235] text-[#a8b0c0] border border-transparent",
    accent: "bg-[#1e2235]",
    label: <Trans>Check wallet to see</Trans>,
  },
} as const;

export function WaveCard({ entry }: WaveCardProps) {
  const { wave, status } = entry;
  const config = STATUS_CONFIG[status];

  return (
    <div
      className={cx(
        "relative flex flex-col gap-16 overflow-hidden rounded-12 border bg-[#1e2235] p-20",
        config.border
      )}
    >
      {/* Left accent strip */}
      <div className={cx("absolute left-0 top-0 h-full w-4 rounded-l-12", config.accent)} />

      <div className="ml-8 flex flex-col gap-12">
        <div className="flex items-center justify-between gap-8">
          <span className="text-16 font-bold text-white">{wave.name}</span>
          <span className={cx("rounded-6 px-8 py-2 text-12 font-medium", config.badge)}>
            {config.label}
          </span>
        </div>

        <div className="flex flex-col gap-8 text-12">
          <div className="flex items-center justify-between">
            <span className="text-[#a8b0c0]">
              <Trans>Mint Date</Trans>
            </span>
            <span className="font-medium text-white">{wave.mintDate}</span>
          </div>
          <div className="border-t border-[#3a3f50] pt-8">
            <p className="mb-4 uppercase tracking-wide text-[#a8b0c0]">
              <Trans>Criteria</Trans>
            </p>
            <p className="text-[#c0c8d8]">{wave.criteria}</p>
          </div>
          <div>
            <p className="mb-4 uppercase tracking-wide text-[#a8b0c0]">
              <Trans>Rules</Trans>
            </p>
            <ul className="space-y-2 text-[#c0c8d8]">
              {wave.rules.map((rule) => (
                <li key={rule} className="flex items-start gap-4">
                  <span className="mt-2 text-blue-400">›</span>
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
