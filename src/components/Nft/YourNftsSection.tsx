import { Trans } from "@lingui/macro";
import { useState, useMemo } from "react";

import { useNftContext } from "domain/nft/nft-context";
import { NftData, NftSortOption } from "domain/nft/nft-types";
import useWallet from "lib/wallets/useWallet";

import { NftCard } from "components/Nft/NftCard";
import { NftDetailDialog } from "components/Nft/NftDetailDialog";

const OPENSEA_COLLECTION = "https://opensea.io/collection/foxify-funded-bonus-nft-1";

const SORT_OPTIONS: { label: string; value: NftSortOption }[] = [
  { label: "ID (Low to High)", value: "id-asc" },
  { label: "ID (High to Low)", value: "id-desc" },
  { label: "Rarity (Low to High)", value: "rarity-asc" },
  { label: "Rarity (High to Low)", value: "rarity-desc" },
];

export function YourNftsSection() {
  const { account } = useWallet();
  const isConnected = !!account;
  const { nfts, isLoading, sortOption, setSortOption, selectedNfts, selectionError, canMerge } =
    useNftContext();
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [selectedNft, setSelectedNft] = useState<NftData | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  const sortedNfts = useMemo(() => {
    const sorted = [...nfts];
    switch (sortOption) {
      case "id-asc":
        sorted.sort((a, b) => Number(a.tokenId - b.tokenId));
        break;
      case "id-desc":
        sorted.sort((a, b) => Number(b.tokenId - a.tokenId));
        break;
      case "rarity-asc":
        sorted.sort((a, b) => a.level - b.level);
        break;
      case "rarity-desc":
        sorted.sort((a, b) => b.level - a.level);
        break;
    }
    return sorted;
  }, [nfts, sortOption]);

  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sortOption)?.label ?? "Sort By";

  const handleNftClick = (nft: NftData) => {
    setSelectedNft(nft);
    setShowDetailDialog(true);
  };

  return (
    <div className="rounded-8 border border-white/10 bg-[rgba(20,20,30,0.8)] p-24">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center gap-16">
        <div className="flex items-center gap-12">
          {/* Grid icon inline */}
          <div className="flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-red-400">
            <svg className="h-20 w-20 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </div>
          <h2 className="text-24 font-bold text-white"><Trans>Your NFTs</Trans></h2>
        </div>

        {/* Sort dropdown */}
        <div className="relative">
          <button
            className="flex items-center gap-8 rounded-8 border border-white/20 bg-white/5 px-16 py-8 text-14 font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/10"
            onClick={() => setShowSortDropdown((v) => !v)}
          >
            <Trans>Sort By:</Trans> {currentSortLabel}
            <svg
              className={`h-16 w-16 transition-transform ${showSortDropdown ? "rotate-180" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showSortDropdown && (
            <div
              className="absolute left-0 top-full z-20 mt-8 min-w-[200px] overflow-hidden rounded-8 border border-white/10 p-8 shadow-2xl"
              style={{ background: "linear-gradient(180deg, rgba(40,40,60,0.98) 0%, rgba(25,25,40,0.98) 100%)" }}
            >
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  className={`w-full px-16 py-12 text-left text-14 transition-colors hover:bg-white/10 ${
                    sortOption === option.value ? "bg-white/5 text-blue-400" : "text-white"
                  }`}
                  onClick={() => { setSortOption(option.value); setShowSortDropdown(false); }}
                >
                  {option.label}
                  {sortOption === option.value && <span className="ml-8">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selection info */}
        {selectedNfts.size > 0 && (
          <div className="flex items-center gap-8 rounded-8 bg-yellow-500/20 px-16 py-8">
            <span className="text-14 font-medium text-yellow-500">
              <Trans>{selectedNfts.size} selected (max 5)</Trans>
            </span>
            {canMerge && (
              <span className="rounded-full bg-green-500/20 px-8 py-2 text-12 text-green-400">
                <Trans>Ready to merge</Trans>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Selection error */}
      {selectionError && selectedNfts.size > 0 && (
        <div className="mb-24 flex items-center gap-12 rounded-8 border border-yellow-500/30 bg-yellow-500/10 p-16">
          {/* AlertCircle inline */}
          <svg className="h-20 w-20 flex-shrink-0 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <p className="text-14 text-yellow-400">{selectionError}</p>
        </div>
      )}

      {/* Grid / empty / loading */}
      {isLoading ? (
        <div className="flex h-[256px] flex-col items-center justify-center">
          <div className="mb-16 h-40 w-40 animate-spin rounded-full border-4 border-gray-600 border-t-yellow-500" />
          <p className="text-gray-400"><Trans>Loading NFTs…</Trans></p>
        </div>
      ) : sortedNfts.length === 0 ? (
        <div className="flex h-[256px] flex-col items-center justify-center">
          <svg className="mb-16 h-64 w-64 text-gray-500 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-[18px] font-medium text-gray-400">
            {isConnected ? <Trans>No NFTs found in your wallet</Trans> : <Trans>Connect wallet to view your NFTs</Trans>}
          </p>
          {isConnected && (
            <>
              <p className="mt-8 text-14 text-gray-500"><Trans>Buy NFTs on OpenSea or wait for the next mint event</Trans></p>
              <button
                className="mt-16 flex items-center gap-8 rounded-8 bg-[#2081E2] px-24 py-10 text-14 font-semibold text-white transition-colors hover:bg-[#1868B7]"
                onClick={() => window.open(OPENSEA_COLLECTION, "_blank")}
              >
                <Trans>Browse on OpenSea</Trans>
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-16 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {sortedNfts.map((nft) => (
            <NftCard key={nft.tokenId.toString()} nft={nft} onClick={() => handleNftClick(nft)} />
          ))}
        </div>
      )}

      <NftDetailDialog nft={selectedNft} open={showDetailDialog} onOpenChange={setShowDetailDialog} />
    </div>
  );
}
