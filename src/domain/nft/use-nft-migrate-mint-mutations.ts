import { useMutation, useQueryClient } from "@tanstack/react-query";

import { helperToast } from "lib/helperToast";
import useWallet from "lib/wallets/useWallet";

import { arbitrumPublicClient } from "./contracts/arbitrum-public-client";
import { switchToArbitrumAndGetClient } from "./contracts/arbitrum-wallet-client";
import {
  FOXIFY_V2_NFT_ADDRESS,
  FOXIFY_V2_NFT_ABI,
  FOXIFY_V3_NFT_ADDRESS,
  FOXIFY_V3_NFT_ABI,
} from "./contracts/nft-contracts";

function mapTxError(error: Error): string {
  if (error.message.includes("rejected")) return "Transaction rejected by user";
  if (error.message.includes("insufficient")) return "Insufficient gas for transaction";
  if (error.message.includes("proof")) return "Invalid whitelist proof";
  return "Transaction failed";
}

/**
 * Approve V2 NFT contract to be operated by the V3 contract.
 * Required before migrate can be called.
 */
export function useApproveV2Nfts({ onSuccess }: { onSuccess?: () => void } = {}) {
  const { account } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!account) throw new Error("Wallet not connected");

      const walletClient = await switchToArbitrumAndGetClient();

      const hash = await walletClient.writeContract({
        address: FOXIFY_V2_NFT_ADDRESS,
        abi: FOXIFY_V2_NFT_ABI,
        functionName: "setApprovalForAll",
        args: [FOXIFY_V3_NFT_ADDRESS, true],
        account: account as `0x${string}`,
      });

      const receipt = await arbitrumPublicClient.waitForTransactionReceipt({ hash });
      if (receipt.status !== "success") throw new Error("Approval transaction failed");
      return receipt;
    },
    onSuccess: () => {
      helperToast.success("NFTs approved for migration!");
      queryClient.invalidateQueries({ queryKey: ["nft"] });
      onSuccess?.();
    },
    onError: (error: Error) => {
      helperToast.error(mapTxError(error));
    },
  });
}

/**
 * Migrate all provided V2 tokenIds to V3 via the V3 contract's migrate function.
 * NOTE: "new V3 NFT detection" snapshot+effect logic stays in the calling component (Phase 3).
 */
export function useMigrateNfts({ onSuccess }: { onSuccess?: () => void } = {}) {
  const { account } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tokenIds: bigint[]) => {
      if (!account) throw new Error("Wallet not connected");
      if (tokenIds.length === 0) throw new Error("No V2 NFTs to migrate");

      const walletClient = await switchToArbitrumAndGetClient();

      // version 1 = V2 contract migration per reference
      const versions = tokenIds.map(() => BigInt(1));

      await arbitrumPublicClient.simulateContract({
        address: FOXIFY_V3_NFT_ADDRESS,
        abi: FOXIFY_V3_NFT_ABI,
        functionName: "migrate",
        args: [versions, tokenIds],
        account: account as `0x${string}`,
      });

      const hash = await walletClient.writeContract({
        address: FOXIFY_V3_NFT_ADDRESS,
        abi: FOXIFY_V3_NFT_ABI,
        functionName: "migrate",
        args: [versions, tokenIds],
        account: account as `0x${string}`,
      });

      const receipt = await arbitrumPublicClient.waitForTransactionReceipt({ hash });
      if (receipt.status !== "success") throw new Error("Migration transaction failed");
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

/**
 * Mint a new V3 NFT using a merkle proof from the current wave whitelist.
 * NOTE: "new NFT detection" snapshot+effect logic stays in the calling component (Phase 3).
 * NOTE: Upstream merkle-proof endpoint may require a CORS-enabled proxy in production.
 */
export function useMintNft({ onSuccess }: { onSuccess?: () => void } = {}) {
  const { account } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (proof: string[]) => {
      if (!account) throw new Error("Wallet not connected");
      if (!proof.length) throw new Error("Address not on whitelist for this wave");

      const walletClient = await switchToArbitrumAndGetClient();

      await arbitrumPublicClient.simulateContract({
        address: FOXIFY_V3_NFT_ADDRESS,
        abi: FOXIFY_V3_NFT_ABI,
        functionName: "mintRequest",
        args: [proof],
        account: account as `0x${string}`,
      });

      const hash = await walletClient.writeContract({
        address: FOXIFY_V3_NFT_ADDRESS,
        abi: FOXIFY_V3_NFT_ABI,
        functionName: "mintRequest",
        args: [proof],
        account: account as `0x${string}`,
      });

      const receipt = await arbitrumPublicClient.waitForTransactionReceipt({ hash });
      if (receipt.status !== "success") throw new Error("Mint transaction failed");
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
