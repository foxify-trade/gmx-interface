import { Trans } from "@lingui/macro";
import cx from "classnames";

const STATS = [
  { label: <Trans>Mint Waves</Trans>, value: "2" },
  { label: <Trans>Snapshot Date</Trans>, value: "Jul 1" },
  { label: <Trans>Wave 1 Volume</Trans>, value: "125k" },
  { label: <Trans>Wave 2 Volume</Trans>, value: "250k" },
] as const;

export function NftEligibilityHero() {
  return (
    <section className="rounded-8 border border-[#3a3f50] bg-[#16182a] p-24 lg:p-32">
      <div className="grid grid-cols-1 items-center gap-32 lg:grid-cols-5">
        {/* Left: content */}
        <div className="flex flex-col gap-20 lg:col-span-3">
          <div className="inline-flex w-fit items-center gap-8 rounded-full border border-blue-400/30 bg-blue-400/10 px-12 py-4">
            <span className="h-6 w-6 animate-pulse rounded-full bg-blue-400" />
            <span className="text-12 font-semibold uppercase tracking-wide text-blue-400">
              <Trans>Live Collection</Trans>
            </span>
          </div>

          <div>
            <h1 className="text-[30px] font-bold text-white lg:text-[36px]">
              <Trans>Foxify NFT Mint</Trans>
            </h1>
            <p className="mt-8 text-14 leading-base text-[#a8b0c0] lg:text-16">
              <Trans>
                Trade your way to eligibility. Qualifying wallets earn the right to mint exclusive
                Mune NFTs — and stake them for real protocol rewards on FUNDED challenges.
              </Trans>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {STATS.map(({ label, value }, i) => (
              <div
                key={i}
                className={cx(
                  "flex flex-col items-center rounded-8 border border-[#3a3f50] bg-[#1e2235] px-12 py-12 text-center"
                )}
              >
                <span className="text-20 font-bold text-blue-400">{value}</span>
                <span className="mt-2 text-12 text-[#a8b0c0]">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: NFT placeholder */}
        <div className="flex justify-center lg:col-span-2 lg:justify-end">
          <div
            className="rounded-12 ring-2 ring-blue-400/40"
            style={{ boxShadow: "0 0 50px 8px rgba(96,165,250,0.2)" }}
          >
            <div className="flex h-[220px] w-[220px] items-center justify-center rounded-12 bg-[#1e2235] text-[60px]">
              🦊
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
