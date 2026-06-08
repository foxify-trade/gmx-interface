import { Trans } from "@lingui/macro";

import { useNftEligibility } from "domain/nft/use-nft-eligibility";

import AppPageLayout from "components/AppPageLayout/AppPageLayout";
import { ChainContentHeader } from "components/ChainContentHeader/ChainContentHeader";
import { EligibilityWalletInput } from "components/Nft/eligibility/EligibilityWalletInput";
import { NftEligibilityHero } from "components/Nft/eligibility/NftEligibilityHero";
import { NftEligibilityPerks } from "components/Nft/eligibility/NftEligibilityPerks";
import { NftMintReminderButton } from "components/Nft/eligibility/NftMintReminderButton";
import { SnapshotCountdownBanner } from "components/Nft/eligibility/SnapshotCountdownBanner";
import { VolumeProgress } from "components/Nft/eligibility/VolumeProgress";
import { WaveCard } from "components/Nft/eligibility/WaveCard";

function formatUsd(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${n.toLocaleString()}`;
}

function EligibilityStatusBanner({
  qualifiedMints,
  volumeRemaining,
}: {
  qualifiedMints: 0 | 1 | 2;
  volumeRemaining: number;
}) {
  if (qualifiedMints === 2) {
    return (
      <div className="rounded-12 bg-green-500/15 px-16 py-16 text-center">
        <p className="text-[18px] font-bold text-green-300">
          <Trans>You qualify for 2 mints!</Trans>
        </p>
        <p className="mt-4 text-12 text-green-400/70">
          <Trans>Your wallet is eligible for both Wave 1 and Wave 2.</Trans>
        </p>
      </div>
    );
  }
  if (qualifiedMints === 1) {
    return (
      <div className="rounded-12 bg-green-500/15 px-16 py-16 text-center">
        <p className="text-16 font-bold text-green-300">
          <Trans>You qualify for 1 mint!</Trans>
        </p>
        {volumeRemaining > 0 && (
          <p className="mt-4 text-12 text-green-400/70">
            <Trans>Trade {formatUsd(volumeRemaining)} more to qualify for a 2nd mint</Trans>
          </p>
        )}
      </div>
    );
  }
  return (
    <div className="rounded-12 bg-red-500/15 px-16 py-16 text-center">
      <p className="text-16 font-bold text-red-400">
        <Trans>Not eligible yet</Trans>
      </p>
      <p className="mt-4 text-12 text-red-400/70">
        <Trans>Start trading to reach the 125k volume threshold.</Trans>
      </p>
    </div>
  );
}

export function NftEligibilityPage() {
  const { inputAddress, setInputAddress, result, check, useConnectedWallet, reset } =
    useNftEligibility();

  return (
    <AppPageLayout title="NFT Mint Eligibility" header={<ChainContentHeader />}>
      <div className="page-layout flex flex-col gap-24">
        <NftEligibilityHero />

        <div className="w-full">
          <section className="rounded-8 border border-[#3a3f50] bg-[#16182a] p-20 lg:p-24 flex flex-col gap-20">
            <div>
              <h2 className="text-16 font-semibold text-white">
                <Trans>Check Eligibility</Trans>
              </h2>
              <p className="mt-2 text-12 text-[#a8b0c0]">
                <Trans>
                  Enter your wallet address to check if you qualify for an upcoming mint.
                </Trans>
              </p>
            </div>

            <EligibilityWalletInput
              inputAddress={inputAddress}
              onInputChange={setInputAddress}
              onCheck={check}
              onUseConnectedWallet={useConnectedWallet}
              onClear={reset}
              isLoading={result.isLoading}
            />

            {result.error && !result.isLoading && (
              <div className="rounded-12 bg-red-500/15 px-16 py-12 text-center text-14 text-red-400">
                {result.error}
              </div>
            )}

            {result.isChecked && (
              <>
                <EligibilityStatusBanner
                  qualifiedMints={result.qualifiedMints}
                  volumeRemaining={result.volumeRemainingFor2Mints}
                />

                <div className="grid grid-cols-1 gap-16 md:grid-cols-2">
                  {result.waves.map((entry) => (
                    <WaveCard key={entry.wave.id} entry={entry} />
                  ))}
                </div>

                <SnapshotCountdownBanner />

                <VolumeProgress
                  volume={result.volume}
                  target={result.volumeTarget}
                  percent={result.volumePercent}
                />
              </>
            )}

            <div className="border-t border-[#3a3f50] pt-20">
              <NftMintReminderButton />
            </div>
          </section>
        </div>

        <NftEligibilityPerks />
      </div>
    </AppPageLayout>
  );
}
