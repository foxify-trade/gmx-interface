import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import { FUNDED_FEATURES, FUNDED_GUIDE_STEPS, FUNDED_MARKET_GROUPS, FUNDED_TRACKS } from "domain/funded/funded-demo-data";
import type { FundedGuideStep, FundedTrackId } from "domain/funded/funded-types";
import { useConnectModal } from "lib/wallets/useConnectModal";
import useWallet from "lib/wallets/useWallet";

import AppPageLayout from "components/AppPageLayout/AppPageLayout";
import { ChainContentHeader } from "components/ChainContentHeader/ChainContentHeader";

import { FundedFeaturesGrid } from "./FundedFeaturesGrid";
import { FundedJourneyGuideModal } from "./FundedJourneyGuideModal";
import { FundedTrackLevelsSection } from "./FundedTrackLevelsSection";
import { FundedTrackSelector } from "./FundedTrackSelector";

export function FundedStartJourneyPage() {
  const { active } = useWallet();
  const { openConnectModal } = useConnectModal();
  const [selectedTrackId, setSelectedTrackId] = useState<FundedTrackId>("entry");
  const [isGuideVisible, setIsGuideVisible] = useState(false);
  const [isSetupVisible, setIsSetupVisible] = useState(false);
  const { search } = useLocation();

  const selectedTrack = useMemo(
    () => FUNDED_TRACKS.find((track) => track.id === selectedTrackId) ?? FUNDED_TRACKS[0],
    [selectedTrackId]
  );

  const setupSteps = useMemo<FundedGuideStep[]>(
    () => [
      {
        title: `${selectedTrack.label} setup is intentionally disabled`,
        description:
          "This route is wired for UI review only. The real controller creation flow depends on the deferred funded wallet and backend integration phase.",
      },
      {
        title: "What is ready now",
        description:
          "Track selection, copy, route wiring, and dashboard read boundaries are now in the GMX app. You can review the funded surface without touching trading flows.",
      },
    ],
    [selectedTrack.label]
  );

  const primaryActionLabel = active
    ? `Start ${selectedTrack.id === "entry" ? "Entry" : "Pro"} Journey`
    : `Connect wallet to start ${selectedTrack.id === "entry" ? "Entry" : "Pro"}`;

  return (
    <AppPageLayout title="GMX FUNDED" header={<ChainContentHeader />}>
      <div className="page-layout flex flex-col gap-18">
        <section className="max-w-[920px]">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-200">GMX x FUNDED</div>
          <h1 className="mt-10 text-[38px] font-extrabold uppercase leading-[0.95] text-white sm:text-[52px]">
            Start your
            <br />
            <span className="text-violet-300">FUNDED</span> journey.
          </h1>
          <p className="mt-12 max-w-[760px] text-[12px] leading-6 text-slate-400">
            Deposit withdrawn + get funded instantly + all targets unlocked. This GMX preview keeps the funded surface
            visible while setup and account switching remain non-destructive.
          </p>
          <button
            type="button"
            onClick={() => setIsGuideVisible(true)}
            className="mt-12 text-[11px] font-medium text-violet-200 transition-colors hover:text-violet-100"
          >
            Review journey guide
          </button>
        </section>

        <FundedTrackSelector
          tracks={FUNDED_TRACKS}
          selectedTrackId={selectedTrackId}
          onSelect={setSelectedTrackId}
          onPrimaryAction={() => {
            if (active) {
              setIsSetupVisible(true);
              return;
            }

            openConnectModal?.();
          }}
          primaryActionLabel={primaryActionLabel}
        />

        <FundedTrackLevelsSection track={selectedTrack} />

        <FundedFeaturesGrid features={FUNDED_FEATURES} marketGroups={FUNDED_MARKET_GROUPS} />

        <div className="rounded-8 border border-slate-600 bg-[#242529] px-16 py-14 text-[11px] leading-6 text-slate-400">
          Query state stays preserved on this route{search ? ", including controller-address context" : ""}. Controller
          setup continues to open a preview-only explanation modal until the funded mode integration phase is approved.
        </div>
      </div>

      <FundedJourneyGuideModal
        isVisible={isGuideVisible}
        setIsVisible={setIsGuideVisible}
        steps={FUNDED_GUIDE_STEPS}
      />
      <FundedJourneyGuideModal
        isVisible={isSetupVisible}
        setIsVisible={setIsSetupVisible}
        steps={setupSteps}
        label="Setup preview"
      />
    </AppPageLayout>
  );
}
