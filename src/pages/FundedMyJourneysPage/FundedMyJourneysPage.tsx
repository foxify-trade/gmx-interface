import { Link } from "react-router-dom";
import type { Address } from "viem";

import { FUNDED_ROUTES } from "config/funded";
import type { Challenge } from "domain/funded/funded-types";
import { useFundedJourneys } from "domain/funded/funded-journeys";
import useWallet from "lib/wallets/useWallet";
import { useConnectModal } from "lib/wallets/useConnectModal";

import AppPageLayout from "components/AppPageLayout/AppPageLayout";
import { ChainContentHeader } from "components/ChainContentHeader/ChainContentHeader";
import { FundedPageTabs } from "components/Funded/FundedPageTabs";

function JourneyCard({ challenge }: { challenge: Challenge }) {
  const dashboardUrl = `${FUNDED_ROUTES.challengeDashboard}?controllerAddress=${challenge.controllerAddress}`;

  const statusColor =
    challenge.status === "Active"
      ? "text-green-400"
      : challenge.status === "On Deck"
        ? "text-yellow-400"
        : "text-typography-secondary";

  return (
    <Link to={dashboardUrl} className="block no-underline">
      <div className="flex items-center justify-between rounded-8 border border-slate-600 bg-slate-900 px-20 py-16 transition-colors hover:border-slate-500 hover:bg-slate-800">
        <div className="flex flex-col gap-4">
          <div className="text-14 font-semibold text-typography-primary">{challenge.challengeName}</div>
          <div className="text-12 text-typography-secondary">
            {challenge.trackName} · Level {challenge.level}
          </div>
        </div>
        <div className={`text-13 font-medium ${statusColor}`}>{challenge.status}</div>
      </div>
    </Link>
  );
}

export function FundedMyJourneysPage() {
  const { account, active } = useWallet();
  const { openConnectModal } = useConnectModal();
  const { data: journeys, isLoading } = useFundedJourneys(account as Address | undefined);

  return (
    <AppPageLayout title="My Journeys" header={<ChainContentHeader />}>
      <div className="page-layout flex flex-col gap-16">
        <FundedPageTabs activePath={FUNDED_ROUTES.myJourneys} />

        {!active && (
          <div className="rounded-8 border border-slate-600 bg-slate-900 px-20 py-24 text-center">
            <div className="text-14 text-typography-secondary">Connect your wallet to view your journeys.</div>
            <button
              type="button"
              onClick={() => openConnectModal?.()}
              className="mt-12 rounded-8 bg-blue-400/20 px-16 py-10 text-13 font-medium text-blue-400 hover:bg-blue-400/30"
            >
              Connect Wallet
            </button>
          </div>
        )}

        {active && isLoading && (
          <div className="rounded-8 border border-slate-600 bg-slate-900 px-20 py-18 text-typography-secondary">
            Loading journeys...
          </div>
        )}

        {active && !isLoading && (!journeys || journeys.length === 0) && (
          <div className="rounded-8 border border-slate-600 bg-slate-900 px-20 py-18 text-typography-secondary">
            No journeys found.{" "}
            <Link to={FUNDED_ROUTES.startJourney} className="text-blue-400 hover:text-blue-300">
              Start a journey
            </Link>{" "}
            to begin.
          </div>
        )}

        {active && !isLoading && journeys && journeys.length > 0 && (
          <div className="flex flex-col gap-8">
            {journeys.map((challenge) => (
              <JourneyCard key={challenge.journeyId} challenge={challenge} />
            ))}
          </div>
        )}
      </div>
    </AppPageLayout>
  );
}
