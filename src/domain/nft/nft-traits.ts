import { NftLevel } from "./nft-types";

const TIER_NAMES: Record<NftLevel, string> = {
  [NftLevel.Unknown]: "Unknown",
  [NftLevel.Bronze]: "Bronze",
  [NftLevel.Silver]: "Silver",
  [NftLevel.Gold]: "Gold",
};

const TRAIT_OPTIONS: Record<string, string[]> = {
  Background: ["Blue", "Purple", "Orange", "Red", "Green", "Pink", "Yellow"],
  Eyes: ["Standard", "Laser", "Sparkle", "Sharp", "Glowing", "Classic"],
  Mouth: ["Smile", "Grin", "Serious", "Happy", "Determined", "Confident"],
};

/**
 * Generates deterministic traits from on-chain NFT data when metadata API is unavailable.
 * Uses randomValue (bytes32) as seed for reproducibility.
 */
export function generateTraitsFromOnchainData(
  level: NftLevel,
  randomValue: string,
  timestamp: bigint
): Array<{ trait_type: string; value: string }> {
  const tierName = TIER_NAMES[level];
  const seed = BigInt(randomValue);

  const traits: Array<{ trait_type: string; value: string }> = [
    { trait_type: "Necklace", value: `${tierName} Necklace` },
    { trait_type: "Level", value: tierName },
    { trait_type: "Rarity", value: tierName },
    {
      trait_type: "Mint Date",
      value: new Date(Number(timestamp) * 1000).toLocaleDateString(),
    },
  ];

  let currentSeed = seed;
  for (const [traitType, options] of Object.entries(TRAIT_OPTIONS)) {
    const index = Number(currentSeed % BigInt(options.length));
    traits.push({ trait_type: traitType, value: options[index] });
    // Advance seed deterministically for next trait
    currentSeed = BigInt(currentSeed.toString().slice(1) + "0");
  }

  return traits;
}
