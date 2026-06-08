// Wave configuration for the NFT mint eligibility checker.

export interface WaveConfig {
  id: string;
  name: string;
  mintDate: string; // display string (avoid timezone shifts)
  criteria: string;
  rules: string[];
}

export const MINT_WAVES: WaveConfig[] = [
  {
    id: "wave-1",
    name: "Wave 1",
    mintDate: "Jul 2, 2026",
    criteria: "Reach 125k USD cumulative volume",
    rules: [
      "Minimum 125k cumulative trading volume",
      "Volume includes perps and all associated journeys",
      "Active account before snapshot",
    ],
  },
  {
    id: "wave-2",
    name: "Wave 2",
    mintDate: "July 3, 2026",
    criteria: "Reach 250k USD cumulative volume",
    rules: [
      "Minimum 250k cumulative trading volume",
      "Must also be eligible for Wave 1",
      "Volume counted all-time",
    ],
  },
];

export const ONE_MINT_VOLUME_TARGET = 125_000;
export const TWO_MINTS_VOLUME_TARGET = 250_000;
