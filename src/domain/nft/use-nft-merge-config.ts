import { useQuery } from "@tanstack/react-query";

import useWallet from "lib/wallets/useWallet";

import { arbitrumPublicClient } from "./contracts/arbitrum-public-client";
import { FOXIFY_V3_NFT_ADDRESS, FOXIFY_V3_NFT_ABI } from "./contracts/nft-contracts";

export function useMergeLevelRates() {
  return useQuery({
    queryKey: ["nft", "mergeLevelRates"],
    queryFn: async () => {
      const rates = (await arbitrumPublicClient.readContract({
        address: FOXIFY_V3_NFT_ADDRESS,
        abi: FOXIFY_V3_NFT_ABI,
        functionName: "mergeLevelRates",
      })) as [bigint, bigint];

      return {
        bronzeToSilver: rates[0],
        silverToGold: rates[1],
      };
    },
  });
}

export function useMergeLevelPermissions() {
  return useQuery({
    queryKey: ["nft", "mergeLevelPermissions"],
    queryFn: async () => {
      const permissions = (await arbitrumPublicClient.readContract({
        address: FOXIFY_V3_NFT_ADDRESS,
        abi: FOXIFY_V3_NFT_ABI,
        functionName: "mergeLevelPermissions",
      })) as [boolean, boolean];

      return {
        bronzeToSilver: permissions[0],
        silverToGold: permissions[1],
      };
    },
  });
}

export function useCurrentMintWave() {
  return useQuery({
    queryKey: ["nft", "currentWave"],
    queryFn: async () => {
      const result = (await arbitrumPublicClient.readContract({
        address: FOXIFY_V3_NFT_ADDRESS,
        abi: FOXIFY_V3_NFT_ABI,
        functionName: "currentWave",
      })) as [
        bigint,
        {
          root: string;
          start: bigint;
          end: bigint;
          distribution: { bronze: bigint; silver: bigint; gold: bigint };
        },
      ];

      const now = BigInt(Math.floor(Date.now() / 1000));
      const isActive = result[1].start <= now && now <= result[1].end;

      return {
        id: result[0],
        root: result[1].root,
        start: result[1].start,
        end: result[1].end,
        distribution: result[1].distribution,
        isActive,
      };
    },
  });
}

export function useHasClaimed(waveId: bigint) {
  const { account } = useWallet();

  return useQuery({
    queryKey: ["nft", "claimed", waveId.toString(), account],
    queryFn: async () => {
      if (!account) return false;
      return (await arbitrumPublicClient.readContract({
        address: FOXIFY_V3_NFT_ADDRESS,
        abi: FOXIFY_V3_NFT_ABI,
        functionName: "claimed",
        args: [waveId, account],
      })) as boolean;
    },
    enabled: !!account && waveId > BigInt(0),
  });
}
