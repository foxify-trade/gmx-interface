import { useMutation, useQueryClient } from "@tanstack/react-query";

import { helperToast } from "lib/helperToast";
import useWallet from "lib/wallets/useWallet";

import { arbitrumPublicClient } from "./contracts/arbitrum-public-client";
import { switchToArbitrumAndGetClient } from "./contracts/arbitrum-wallet-client";
import { FOXIFY_V3_NFT_ADDRESS, FOXIFY_V3_NFT_ABI } from "./contracts/nft-contracts";
import { NftLevel } from "./nft-types";

function mapTxError(error: Error): string {
  if (error.message.includes("rejected")) return "Transaction rejected by user";
  if (error.message.includes("insufficient")) return "Insufficient gas for transaction";
  return "Transaction failed";
}

/** Stake a V3 NFT by tokenId — calls updateUserActiveID(tokenId). */
export function useStakeNft({ onSuccess }: { onSuccess?: () => void } = {}) {
  const { account } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tokenId: bigint) => {
      if (!account) throw new Error("Wallet not connected");

      const walletClient = await switchToArbitrumAndGetClient();

      await arbitrumPublicClient.simulateContract({
        address: FOXIFY_V3_NFT_ADDRESS,
        abi: FOXIFY_V3_NFT_ABI,
        functionName: "updateUserActiveID",
        args: [tokenId],
        account: account as `0x${string}`,
      });

      const hash = await walletClient.writeContract({
        address: FOXIFY_V3_NFT_ADDRESS,
        abi: FOXIFY_V3_NFT_ABI,
        functionName: "updateUserActiveID",
        args: [tokenId],
        account: account as `0x${string}`,
      });

      const receipt = await arbitrumPublicClient.waitForTransactionReceipt({ hash });
      if (receipt.status !== "success") throw new Error("Stake transaction failed");
      return receipt;
    },
    onSuccess: () => {
      helperToast.success("NFT staked successfully");
      queryClient.invalidateQueries({ queryKey: ["nft"] });
      onSuccess?.();
    },
    onError: (error: Error) => {
      helperToast.error(mapTxError(error));
    },
  });
}

/** Unstake the currently active V3 NFT — calls updateUserActiveID(0). */
export function useUnstakeNft({ onSuccess }: { onSuccess?: () => void } = {}) {
  const { account } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!account) throw new Error("Wallet not connected");

      const walletClient = await switchToArbitrumAndGetClient();

      await arbitrumPublicClient.simulateContract({
        address: FOXIFY_V3_NFT_ADDRESS,
        abi: FOXIFY_V3_NFT_ABI,
        functionName: "updateUserActiveID",
        args: [BigInt(0)],
        account: account as `0x${string}`,
      });

      const hash = await walletClient.writeContract({
        address: FOXIFY_V3_NFT_ADDRESS,
        abi: FOXIFY_V3_NFT_ABI,
        functionName: "updateUserActiveID",
        args: [BigInt(0)],
        account: account as `0x${string}`,
      });

      const receipt = await arbitrumPublicClient.waitForTransactionReceipt({ hash });
      if (receipt.status !== "success") throw new Error("Unstake transaction failed");
      return receipt;
    },
    onSuccess: () => {
      helperToast.success("NFT unstaked successfully");
      queryClient.invalidateQueries({ queryKey: ["nft"] });
      onSuccess?.();
    },
    onError: (error: Error) => {
      helperToast.error(mapTxError(error));
    },
  });
}

/**
 * Merge selected NFTs into a higher-tier NFT.
 * Accepts tokenIds + the source mergeLevel (Bronze → Silver only for 5-NFT merge).
 * NOTE: "new NFT detection" snapshot+effect logic stays in the calling component (Phase 3).
 */
export function useMergeNfts({ onSuccess }: { onSuccess?: () => void } = {}) {
  const { account } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tokenIds,
      mergeLevel,
    }: {
      tokenIds: bigint[];
      mergeLevel: NftLevel;
    }) => {
      if (!account) throw new Error("Wallet not connected");

      const walletClient = await switchToArbitrumAndGetClient();

      await arbitrumPublicClient.simulateContract({
        address: FOXIFY_V3_NFT_ADDRESS,
        abi: FOXIFY_V3_NFT_ABI,
        functionName: "merge",
        args: [tokenIds, mergeLevel],
        account: account as `0x${string}`,
      });

      const hash = await walletClient.writeContract({
        address: FOXIFY_V3_NFT_ADDRESS,
        abi: FOXIFY_V3_NFT_ABI,
        functionName: "merge",
        args: [tokenIds, mergeLevel],
        account: account as `0x${string}`,
      });

      const receipt = await arbitrumPublicClient.waitForTransactionReceipt({ hash });
      if (receipt.status !== "success") throw new Error("Merge transaction failed");
      return receipt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nft"] });
      onSuccess?.();
    },
    onError: (error: Error) => {
      helperToast.error(mapTxError(error));
    },
  });
}
