import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { FUNDED_FRONTEND_ID, FUNDED_PUBLIC_API_URL } from "config/funded";
import useWallet from "lib/wallets/useWallet";

import {
  MINT_WAVES,
  ONE_MINT_VOLUME_TARGET,
  TWO_MINTS_VOLUME_TARGET,
  type WaveConfig,
} from "./nft-waves";

export type EligibilityStatus = "eligible" | "not-eligible" | "pending";

export interface WaveEligibility {
  wave: WaveConfig;
  status: EligibilityStatus;
}

export interface EligibilityResult {
  address: string | null;
  isChecked: boolean;
  isLoading: boolean;
  error: string | null;
  qualifiedMints: 0 | 1 | 2;
  overallEligible: boolean;
  waves: WaveEligibility[];
  volume: number;
  volumeTarget: number;
  volumePercent: number;
  volumeRemainingFor2Mints: number;
}

interface AccountVolumeResponse {
  walletAddress: string;
  frontendId: string;
  volume: number;
}

function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address.trim());
}

async function fetchAccountVolume(walletAddress: string): Promise<AccountVolumeResponse> {
  const url = new URL(`${FUNDED_PUBLIC_API_URL}/funded/account-volume`);
  url.searchParams.set("walletAddress", walletAddress);
  url.searchParams.set("frontendId", FUNDED_FRONTEND_ID);

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Volume API error: ${res.status}`);
  }
  return res.json();
}

function buildResult(
  address: string | null,
  volume: number,
  isLoading: boolean,
  error: string | null
): EligibilityResult {
  const isChecked = Boolean(address) && !isLoading && !error;
  const qualifiedMints: 0 | 1 | 2 = !isChecked
    ? 0
    : volume >= TWO_MINTS_VOLUME_TARGET
      ? 2
      : volume >= ONE_MINT_VOLUME_TARGET
        ? 1
        : 0;

  const waves: WaveEligibility[] = MINT_WAVES.map((wave, idx) => {
    if (!isChecked) return { wave, status: "pending" };
    const threshold = idx === 0 ? ONE_MINT_VOLUME_TARGET : TWO_MINTS_VOLUME_TARGET;
    return { wave, status: volume >= threshold ? "eligible" : "not-eligible" };
  });

  const volumePercent = Math.min(100, (volume / TWO_MINTS_VOLUME_TARGET) * 100);
  const volumeRemainingFor2Mints = Math.max(0, TWO_MINTS_VOLUME_TARGET - volume);

  return {
    address,
    isChecked,
    isLoading,
    error,
    qualifiedMints,
    overallEligible: qualifiedMints > 0,
    waves,
    volume,
    volumeTarget: TWO_MINTS_VOLUME_TARGET,
    volumePercent,
    volumeRemainingFor2Mints,
  };
}

export function useNftEligibility() {
  const { account: connectedAccount } = useWallet();
  const connectedAddress = connectedAccount ?? "";

  const [inputAddress, setInputAddress] = useState("");
  const [checkedAddress, setCheckedAddress] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["nft-eligibility-volume", checkedAddress, FUNDED_FRONTEND_ID],
    queryFn: () => fetchAccountVolume(checkedAddress as string),
    enabled: Boolean(checkedAddress) && isValidAddress(checkedAddress ?? ""),
    staleTime: 60_000,
    retry: 1,
  });

  const errorMessage = query.error
    ? query.error instanceof Error
      ? query.error.message
      : "Failed to fetch volume data"
    : null;

  const result = useMemo(
    () =>
      buildResult(
        checkedAddress,
        query.data?.volume ?? 0,
        query.isLoading || query.isFetching,
        errorMessage
      ),
    [checkedAddress, query.data?.volume, query.isLoading, query.isFetching, errorMessage]
  );

  const useConnectedWallet = () => {
    if (!connectedAddress) return;
    setInputAddress(connectedAddress);
    setCheckedAddress(connectedAddress);
  };

  const check = (): { ok: boolean; error?: string } => {
    const trimmed = inputAddress.trim();
    if (!isValidAddress(trimmed)) {
      setCheckedAddress(null);
      return { ok: false, error: "Enter a valid wallet address (0x...)" };
    }
    setCheckedAddress(trimmed);
    return { ok: true };
  };

  const reset = () => {
    setInputAddress("");
    setCheckedAddress(null);
  };

  return {
    inputAddress,
    setInputAddress,
    connectedAddress,
    result,
    check,
    useConnectedWallet,
    reset,
  };
}
