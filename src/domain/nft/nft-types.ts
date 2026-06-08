/**
 * NFT Level enum matching the smart contract
 * UNKNOWN = 0, BRONZE = 1, SILVER = 2, GOLD = 3
 */
export enum NftLevel {
  Unknown = 0,
  Bronze = 1,
  Silver = 2,
  Gold = 3,
}

/**
 * NFT Version for V2/V3 distinction
 */
export enum NftVersion {
  V2 = "V2",
  V3 = "V3",
}

/**
 * NFT data structure from the contract
 */
export interface NftData {
  tokenId: bigint;
  level: NftLevel;
  randomValue: string;
  timestamp: bigint;
  version: NftVersion;
  isStaked: boolean;
  imageUrl?: string;
  name?: string;
  attributes?: Array<{ trait_type: string; value: string }>;
}

/**
 * Merge level rates from contract
 */
export interface MergeLevelRates {
  bronzeToSilver: bigint;
  silverToGold: bigint;
}

/**
 * Merge level permissions from contract
 */
export interface MergeLevelPermissions {
  bronzeToSilver: boolean;
  silverToGold: boolean;
}

/**
 * Sort options for NFT grid
 */
export type NftSortOption = "id-asc" | "id-desc" | "rarity-asc" | "rarity-desc";

// Bundled placeholder asset — imported so Vite fingerprints + includes in the bundle.
import nftPlaceholderPng from "img/nft-placeholder.png";

const NFT_PLACEHOLDER_IMAGE: string = nftPlaceholderPng;

export function getNftPlaceholderImage(): string {
  return NFT_PLACEHOLDER_IMAGE;
}

export function getNftImage(nft: NftData): string {
  return nft.imageUrl || NFT_PLACEHOLDER_IMAGE;
}

export function getLevelName(level: NftLevel): string {
  switch (level) {
    case NftLevel.Bronze:
      return "Bronze";
    case NftLevel.Silver:
      return "Silver";
    case NftLevel.Gold:
      return "Gold";
    default:
      return "Unknown";
  }
}

export function getLevelColor(level: NftLevel): string {
  switch (level) {
    case NftLevel.Bronze:
      return "#CD7F32";
    case NftLevel.Silver:
      return "#C0C0C0";
    case NftLevel.Gold:
      return "#FFD700";
    default:
      return "#808080";
  }
}

export function getLevelGlow(level: NftLevel): string {
  switch (level) {
    case NftLevel.Bronze:
      return "0 0 30px rgba(205, 127, 50, 0.6), 0 0 60px rgba(205, 127, 50, 0.3)";
    case NftLevel.Silver:
      return "0 0 30px rgba(192, 192, 192, 0.6), 0 0 60px rgba(192, 192, 192, 0.3)";
    case NftLevel.Gold:
      return "0 0 30px rgba(255, 215, 0, 0.6), 0 0 60px rgba(255, 215, 0, 0.3)";
    default:
      return "0 0 20px rgba(128, 128, 128, 0.5)";
  }
}

export function getLevelGradient(level: NftLevel): string {
  switch (level) {
    case NftLevel.Bronze:
      return "linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)";
    case NftLevel.Silver:
      return "linear-gradient(135deg, #E8E8E8 0%, #A8A8A8 100%)";
    case NftLevel.Gold:
      return "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)";
    default:
      return "linear-gradient(135deg, #808080 0%, #505050 100%)";
  }
}

export function getFundingBonus(level: NftLevel): number {
  switch (level) {
    case NftLevel.Bronze:
      return 0;
    case NftLevel.Silver:
      return 10;
    case NftLevel.Gold:
      return 25;
    default:
      return 0;
  }
}
