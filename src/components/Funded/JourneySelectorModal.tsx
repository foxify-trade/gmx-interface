import { Trans } from "@lingui/macro";
import { useState } from "react";
import type { Address } from "viem";

import Modal from "components/Modal/Modal";
import { useFundedContext } from "context/FundedContext";
import type { Challenge } from "domain/funded/funded-types";
import { useFundedJourneys } from "domain/funded/funded-journeys";
import useWallet from "lib/wallets/useWallet";

type Props = { open: boolean; onClose: () => void };

export function JourneySelectorModal({ open, onClose }: Props) {
  const { account } = useWallet();
  const connectFunded = useFundedContext((ctx) => ctx.connectFunded);
  const { data: journeys, isLoading, error } = useFundedJourneys(account);

  const [selected, setSelected] = useState<Challenge | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  async function handleConnect() {
    if (!selected) return;
    setIsConnecting(true);
    setConnectError(null);
    try {
      await connectFunded(selected.controllerAddress as Address);
      onClose();
    } catch (err) {
      setConnectError(err instanceof Error ? err.message : "Connection failed");
    } finally {
      setIsConnecting(false);
    }
  }

  return (
    <Modal isVisible={open} setIsVisible={() => onClose()} label={<Trans>Select Funded Journey</Trans>}>
      <div className="flex flex-col gap-12 min-w-300">
        {isLoading && (
          <p className="text-slate-400 text-13">
            <Trans>Loading journeys...</Trans>
          </p>
        )}
        {error && (
          <p className="text-red-400 text-13">
            <Trans>Failed to load journeys</Trans>
          </p>
        )}
        {!isLoading && !error && journeys?.length === 0 && (
          <p className="text-slate-400 text-13">
            <Trans>No funded journeys available</Trans>
          </p>
        )}
        {journeys && journeys.length > 0 && (
          <div className="flex flex-col gap-8">
            {journeys.map((journey) => (
              <button
                key={journey.journeyId}
                className={`flex flex-col gap-4 p-12 rounded border text-left transition-colors ${
                  selected?.journeyId === journey.journeyId
                    ? "border-blue-500 bg-blue-900/20"
                    : "border-slate-700 hover:border-slate-500"
                }`}
                onClick={() => setSelected(journey)}
              >
                <span className="text-13 font-medium text-slate-200">{journey.challengeName}</span>
                <div className="flex items-center gap-8 text-12 text-slate-400">
                  <span>{journey.trackName}</span>
                  <span>·</span>
                  <span>
                    <Trans>Level {journey.level}</Trans>
                  </span>
                  <span>·</span>
                  <span>{journey.status}</span>
                </div>
              </button>
            ))}
          </div>
        )}
        {connectError && <p className="text-red-400 text-12">{connectError}</p>}
        <button
          className="btn-primary py-10 px-16 rounded disabled:opacity-50"
          disabled={!selected || isConnecting}
          onClick={handleConnect}
        >
          {isConnecting ? <Trans>Connecting...</Trans> : <Trans>Connect</Trans>}
        </button>
      </div>
    </Modal>
  );
}
