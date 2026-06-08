import { NFT_OPENSEA_API_KEY } from "config/nft";

import { arbitrumPublicClient } from "./contracts/arbitrum-public-client";
import { FOXIFY_V3_NFT_ADDRESS, FOXIFY_V3_NFT_ABI } from "./contracts/nft-contracts";
import { NftLevel } from "./nft-types";

const OPENSEA_NFT_API = "https://api.opensea.io/api/v2/chain/arbitrum/contract";
const NFT_METADATA_API = "https://api.foxify.trade/funded/nfts";

export interface NftMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{ trait_type: string; value: string }>;
}

async function fetchOpenSeaMetadata(
  tokenId: bigint,
  contractAddress: `0x${string}` = FOXIFY_V3_NFT_ADDRESS
): Promise<NftMetadata | null> {
  try {
    const headers: Record<string, string> = {};
    if (NFT_OPENSEA_API_KEY) headers["x-api-key"] = NFT_OPENSEA_API_KEY;

    const response = await fetch(
      `${OPENSEA_NFT_API}/${contractAddress}/nfts/${tokenId.toString()}`,
      { headers }
    );
    if (!response.ok) return null;

    const data = await response.json();
    const nft = data.nft;
    if (!nft) return null;

    return {
      name: nft.name || `NFT #${tokenId}`,
      description: nft.description || "",
      image: nft.image_url || nft.display_image_url || nft.original_image_url || "",
      attributes: (nft.traits || []).map((t: { trait_type: string; value: string }) => ({
        trait_type: t.trait_type,
        value: String(t.value),
      })),
    };
  } catch {
    return null;
  }
}

export async function triggerOpenSeaMetadataRefresh(
  tokenId: bigint,
  contractAddress: `0x${string}` = FOXIFY_V3_NFT_ADDRESS
): Promise<boolean> {
  try {
    const headers: Record<string, string> = {};
    if (NFT_OPENSEA_API_KEY) headers["x-api-key"] = NFT_OPENSEA_API_KEY;

    const response = await fetch(
      `${OPENSEA_NFT_API}/${contractAddress}/nfts/${tokenId.toString()}/refresh`,
      { method: "POST", headers }
    );
    return response.ok;
  } catch {
    return false;
  }
}

async function fetchOnchainMetadata(
  tokenId: bigint,
  contractAddress: `0x${string}` = FOXIFY_V3_NFT_ADDRESS,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abi: any = FOXIFY_V3_NFT_ABI
): Promise<NftMetadata | null> {
  try {
    const tokenUri = (await arbitrumPublicClient.readContract({
      address: contractAddress,
      abi,
      functionName: "tokenURI",
      args: [tokenId],
    })) as string;

    if (!tokenUri) return null;

    const response = await fetch(tokenUri, { mode: "cors" });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Fetch NFT metadata via fallback chain: onchain tokenURI → OpenSea → api.foxify.trade.
 * Returns null if all sources fail — callers should render the placeholder image.
 */
export async function fetchNftMetadata(
  tokenId: bigint,
  contractAddress: `0x${string}` = FOXIFY_V3_NFT_ADDRESS,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abi: any = FOXIFY_V3_NFT_ABI
): Promise<NftMetadata | null> {
  const onchain = await fetchOnchainMetadata(tokenId, contractAddress, abi);
  if (onchain) return onchain;

  const opensea = await fetchOpenSeaMetadata(tokenId, contractAddress);
  if (opensea) return opensea;

  try {
    const response = await fetch(`${NFT_METADATA_API}/${tokenId.toString()}`, { mode: "cors" });
    if (response.ok) return await response.json();
  } catch {
    // All sources exhausted
  }

  return null;
}

/**
 * Parse NFT level from metadata attributes (more accurate than on-chain enum).
 */
export function parseLevelFromAttributes(
  attributes: Array<{ trait_type: string; value: string }> | undefined
): NftLevel | null {
  if (!attributes) return null;

  const necklace = attributes.find((a) => a.trait_type === "Necklace");
  if (necklace) {
    const v = necklace.value.toLowerCase();
    if (v.includes("bronze")) return NftLevel.Bronze;
    if (v.includes("silver")) return NftLevel.Silver;
    if (v.includes("gold")) return NftLevel.Gold;
  }

  const levelAttr = attributes.find((a) => a.trait_type === "Level" || a.trait_type === "Rarity");
  if (levelAttr) {
    const v = levelAttr.value.toLowerCase();
    if (v.includes("bronze")) return NftLevel.Bronze;
    if (v.includes("silver")) return NftLevel.Silver;
    if (v.includes("gold")) return NftLevel.Gold;
  }

  return null;
}
