import { Trans } from "@lingui/macro";

import { NftData, NftLevel, getLevelGradient, getLevelName, getNftImage } from "domain/nft/nft-types";

interface NftMergeSelectionGridProps {
  bronzeNfts: NftData[];
  selectedNftIds: Set<bigint>;
  requiredCount: number;
  onToggle: (tokenId: bigint) => void;
}

/**
 * Presentational grid of Bronze NFTs with selection checkboxes.
 * Split from NftMergeSelectionDialog to keep each file under 200 lines.
 */
export function NftMergeSelectionGrid({
  bronzeNfts,
  selectedNftIds,
  requiredCount,
  onToggle,
}: NftMergeSelectionGridProps) {
  if (bronzeNfts.length === 0) {
    return (
      <div className="flex h-[192px] flex-col items-center justify-center">
        <svg
          className="mb-12 h-48 w-48 text-gray-500 opacity-50"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p className="text-center text-14 text-gray-400">
          <Trans>No Bronze NFTs available for merging</Trans>
        </p>
      </div>
    );
  }

  return (
    <div className="max-h-[384px] overflow-y-auto">
      <div className="grid grid-cols-3 gap-12 sm:grid-cols-4">
        {bronzeNfts.map((nft) => {
          const isSelected = selectedNftIds.has(nft.tokenId);
          const isDisabled = !isSelected && selectedNftIds.size >= requiredCount;

          return (
            <button
              key={nft.tokenId.toString()}
              className={`relative overflow-hidden rounded-8 border-2 transition-all ${
                isSelected
                  ? "border-yellow-500 ring-2 ring-yellow-500/50"
                  : isDisabled
                  ? "cursor-not-allowed border-gray-700 opacity-40"
                  : "border-gray-700 hover:border-yellow-500"
              }`}
              style={{
                background:
                  "linear-gradient(180deg, rgba(30,30,40,0.9) 0%, rgba(20,20,30,0.95) 100%)",
              }}
              onClick={() => onToggle(nft.tokenId)}
              disabled={isDisabled}
            >
              {/* Selection checkbox */}
              <div
                className={`absolute right-8 top-8 z-10 flex h-20 w-20 items-center justify-center rounded-4 border-2 shadow-md transition-all ${
                  isSelected
                    ? "border-blue-500 bg-blue-500 text-white"
                    : "border-white/60 bg-white/90"
                }`}
              >
                {isSelected && (
                  <svg className="h-12 w-12" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>

              {/* Level badge */}
              <span
                className="absolute left-8 top-8 z-10 rounded-full px-8 py-2 text-[10px] font-bold text-white"
                style={{ background: getLevelGradient(NftLevel.Bronze) }}
              >
                {getLevelName(NftLevel.Bronze)}
              </span>

              <img
                src={getNftImage(nft)}
                alt={`NFT #${nft.tokenId.toString()}`}
                className="aspect-square w-full object-cover"
              />

              <div className="bg-gradient-to-t from-black/80 to-transparent p-8">
                <p className="text-center text-12 font-bold text-white">
                  #{nft.tokenId.toString()}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
