import { Menu } from "@headlessui/react";
import { Trans } from "@lingui/macro";
import cx from "classnames";

import { useFundedContext } from "context/FundedContext";
import { useFundedJourneys } from "domain/funded/funded-journeys";
import type { Challenge } from "domain/funded/funded-types";
import FundedLogo from "img/funded-logo.svg?react";
import Button from "components/Button/Button";
import useWallet from "lib/wallets/useWallet";
import type { Address } from "viem";

import "./funded-switcher-dropdown.scss";

export function FundedSwitcherButton() {
  const { active, account } = useWallet();
  const isFundedMode = useFundedContext((ctx) => ctx.isFundedMode);
  const isSwitchingMode = useFundedContext((ctx) => ctx.isSwitchingMode);
  const fundedAccount = useFundedContext((ctx) => ctx.fundedAccount);
  const isReadOnly = useFundedContext((ctx) => ctx.isReadOnly);
  const connectFunded = useFundedContext((ctx) => ctx.connectFunded);
  const disconnectFunded = useFundedContext((ctx) => ctx.disconnectFunded);

  const { data: journeys, isLoading } = useFundedJourneys(isFundedMode ? undefined : account);

  if (!active) return null;

  return (
    <Menu as="div" className="relative">
      {({ open }) => (
        <>
          <Menu.Button as="div">
            <Button
              variant="secondary"
              size="controlled"
              disabled={isSwitchingMode}
              className={cx("size-32 !p-0 md:size-40", { "opacity-50": isSwitchingMode })}
            >
              <FundedLogo className="size-20" />
            </Button>
          </Menu.Button>

          <Menu.Items as="div" className="funded-dropdown-items">
            {isFundedMode ? (
              <FundedModeItems
                fundedAccount={fundedAccount}
                isReadOnly={isReadOnly}
                isSwitchingMode={isSwitchingMode}
                onDisconnect={disconnectFunded}
              />
            ) : (
              <JourneyItems
                journeys={journeys}
                isLoading={isLoading}
                onConnect={(controllerAddress) => connectFunded(controllerAddress)}
              />
            )}
          </Menu.Items>
        </>
      )}
    </Menu>
  );
}

function FundedModeItems({
  fundedAccount,
  isReadOnly,
  isSwitchingMode,
  onDisconnect,
}: {
  fundedAccount: Address | null;
  isReadOnly: boolean;
  isSwitchingMode: boolean;
  onDisconnect: () => void;
}) {
  return (
    <>
      <div className="funded-dropdown-header">
        <FundedLogo className="size-16 shrink-0" />
        <span className="text-12 font-medium text-green-500">
          <Trans>Funded Mode</Trans>
        </span>
        {isReadOnly && (
          <span className="funded-readonly-badge">
            <Trans>Read-only</Trans>
          </span>
        )}
      </div>
      {fundedAccount && (
        <div className="funded-dropdown-address">
          {fundedAccount.slice(0, 6)}...{fundedAccount.slice(-4)}
        </div>
      )}
      <Menu.Item>
        <div className="menu-item text-red-400 hover:text-red-300" onClick={onDisconnect}>
          <Trans>Exit Funded</Trans>
        </div>
      </Menu.Item>
    </>
  );
}

function JourneyItems({
  journeys,
  isLoading,
  onConnect,
}: {
  journeys: Challenge[] | undefined;
  isLoading: boolean;
  onConnect: (controllerAddress: Address) => void;
}) {
  if (isLoading) {
    return (
      <div className="funded-dropdown-status">
        <Trans>Loading journeys...</Trans>
      </div>
    );
  }

  if (!journeys || journeys.length === 0) {
    return (
      <div className="funded-dropdown-status">
        <Trans>No funded journeys available</Trans>
      </div>
    );
  }

  return (
    <>
      <div className="funded-dropdown-header">
        <FundedLogo className="size-16 shrink-0" />
        <span className="text-12 font-medium text-slate-200">
          <Trans>Select Journey</Trans>
        </span>
      </div>
      {journeys.map((journey) => (
        <Menu.Item key={journey.journeyId}>
          <div
            className="menu-item flex-col !items-start gap-2"
            onClick={() => onConnect(journey.controllerAddress as Address)}
          >
            <span className="font-medium">{journey.challengeName}</span>
            <span className="text-11 text-slate-400">
              {journey.trackName} · Level {journey.level} · {journey.status}
            </span>
          </div>
        </Menu.Item>
      ))}
    </>
  );
}
