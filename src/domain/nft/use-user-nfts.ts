import { useQuery } from "@tanstack/react-query";

import useWallet from "lib/wallets/useWallet";

import { arbitrumPublicClient } from "./contracts/arbitrum-public-client";
import {
  FOXIFY_V2_NFT_ADDRESS,
  FOXIFY_V2_NFT_ABI,
  FOXIFY_V3_NFT_ADDRESS,
  FOXIFY_V3_NFT_ABI,
} from "./contracts/nft-contracts";
import { fetchNftMetadata, parseLevelFromAttributes } from "./nft-metadata";
import { generateTraitsFromOnchainData } from "./nft-traits";
import { NftData, NftLevel, NftVersion } from "./nft-types";

export function useUserV2Nfts() {
  const { account } = useWallet();

  return useQuery({
    queryKey: ["nft", "v2Nfts", account],
    queryFn: async (): Promise<NftData[]> => {
      if (!account) return [];

      const balance = (await arbitrumPublicClient.readContract({
        address: FOXIFY_V2_NFT_ADDRESS,
        abi: FOXIFY_V2_NFT_ABI,
        functionName: "balanceOf",
        args: [account],
      })) as bigint;

      if (balance === BigInt(0)) return [];

      const tokenIds = (await arbitrumPublicClient.readContract({
        address: FOXIFY_V2_NFT_ADDRESS,
        abi: FOXIFY_V2_NFT_ABI,
        functionName: "usersIDsList",
        args: [account, BigInt(0), balance],
      })) as bigint[];

      return Promise.all(
        tokenIds.map(async (tokenId) => {
          const [data, metadata] = await Promise.all([
            arbitrumPublicClient.readContract({
              address: FOXIFY_V2_NFT_ADDRESS,
              abi: FOXIFY_V2_NFT_ABI,
              functionName: "data",
              args: [tokenId],
            }) as Promise<[number, string, bigint]>,
            fetchNftMetadata(tokenId, FOXIFY_V2_NFT_ADDRESS, FOXIFY_V2_NFT_ABI),
          ]);

          const metadataLevel = parseLevelFromAttributes(metadata?.attributes);
          const level = metadataLevel ?? (data[0] as NftLevel);
          const attributes =
            metadata?.attributes?.length
              ? metadata.attributes
              : generateTraitsFromOnchainData(level, data[1], data[2]);

          return {
            tokenId,
            level,
            randomValue: data[1],
            timestamp: data[2],
            version: NftVersion.V2,
            isStaked: false,
            imageUrl: metadata?.image,
            name: metadata?.name ?? `Foxify Affiliation NFT #${tokenId}`,
            attributes,
          };
        })
      );
    },
    enabled: !!account,
  });
}

export function useUserV3Nfts() {
  const { account } = useWallet();

  return useQuery({
    queryKey: ["nft", "v3Nfts", account],
    queryFn: async (): Promise<NftData[]> => {
      if (!account) return [];

      const balance = (await arbitrumPublicClient.readContract({
        address: FOXIFY_V3_NFT_ADDRESS,
        abi: FOXIFY_V3_NFT_ABI,
        functionName: "usersIDsLength",
        args: [account],
      })) as bigint;

      if (balance === BigInt(0)) return [];

      const tokenIds = (await arbitrumPublicClient.readContract({
        address: FOXIFY_V3_NFT_ADDRESS,
        abi: FOXIFY_V3_NFT_ABI,
        functionName: "usersIDsList",
        args: [account, BigInt(0), balance],
      })) as bigint[];

      const stakedId = (await arbitrumPublicClient.readContract({
        address: FOXIFY_V3_NFT_ADDRESS,
        abi: FOXIFY_V3_NFT_ABI,
        functionName: "usersActiveID",
        args: [account],
      })) as bigint;

      return Promise.all(
        tokenIds.map(async (tokenId) => {
          const [data, metadata] = await Promise.all([
            arbitrumPublicClient.readContract({
              address: FOXIFY_V3_NFT_ADDRESS,
              abi: FOXIFY_V3_NFT_ABI,
              functionName: "data",
              args: [tokenId],
            }) as Promise<[number, string, bigint]>,
            fetchNftMetadata(tokenId),
          ]);

          const metadataLevel = parseLevelFromAttributes(metadata?.attributes);
          const level = metadataLevel ?? (data[0] as NftLevel);
          const attributes =
            metadata?.attributes?.length
              ? metadata.attributes
              : generateTraitsFromOnchainData(level, data[1], data[2]);

          return {
            tokenId,
            level,
            randomValue: data[1],
            timestamp: data[2],
            version: NftVersion.V3,
            isStaked: stakedId !== BigInt(0) && stakedId === tokenId,
            imageUrl: metadata?.image,
            name: metadata?.name ?? `Foxify Trading NFT #${tokenId}`,
            attributes,
          };
        })
      );
    },
    enabled: !!account,
  });
}

export function useUserStakedNft() {
  const { account } = useWallet();

  return useQuery({
    queryKey: ["nft", "stakedId", account],
    queryFn: async () => {
      if (!account) return BigInt(0);
      return (await arbitrumPublicClient.readContract({
        address: FOXIFY_V3_NFT_ADDRESS,
        abi: FOXIFY_V3_NFT_ABI,
        functionName: "usersActiveID",
        args: [account],
      })) as bigint;
    },
    enabled: !!account,
  });
}

/** Combined hook returning all V2 + V3 NFTs for the connected wallet. */
export function useUserNfts() {
  const { account } = useWallet();
  const { data: v2Nfts = [], isLoading: v2Loading } = useUserV2Nfts();
  const { data: v3Nfts = [], isLoading: v3Loading } = useUserV3Nfts();

  return useQuery({
    queryKey: ["nft", "allNfts", account, v2Nfts.length, v3Nfts.length],
    queryFn: async (): Promise<NftData[]> => [...v2Nfts, ...v3Nfts],
    enabled: !!account && !v2Loading && !v3Loading,
  });
}
