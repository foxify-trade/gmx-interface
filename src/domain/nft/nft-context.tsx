import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from "react";

import { NftData, NftLevel, NftSortOption } from "./nft-types";

const MAX_SELECTION = 5;

interface NftContextState {
  nfts: NftData[];
  isLoading: boolean;
  stakedNft: NftData | null;
  selectedNfts: Set<bigint>;
  sortOption: NftSortOption;
  selectNft: (tokenId: bigint) => void;
  deselectNft: (tokenId: bigint) => void;
  toggleNftSelection: (tokenId: bigint) => void;
  clearSelection: () => void;
  setSortOption: (option: NftSortOption) => void;
  canMerge: boolean;
  mergeLevel: NftLevel | null;
  selectionError: string | null;
  refetch: () => void;
}

const NftContext = createContext<NftContextState | null>(null);

interface NftProviderProps {
  children: ReactNode;
  nfts: NftData[];
  stakedNft: NftData | null;
  isLoading: boolean;
  refetch: () => void;
}

export function NftProvider({ children, nfts, stakedNft, isLoading, refetch }: NftProviderProps) {
  const [selectedNfts, setSelectedNfts] = useState<Set<bigint>>(new Set());
  const [sortOption, setSortOption] = useState<NftSortOption>("id-asc");

  const selectNft = useCallback((tokenId: bigint) => {
    setSelectedNfts((prev) => {
      if (prev.size >= MAX_SELECTION) return prev;
      const next = new Set(prev);
      next.add(tokenId);
      return next;
    });
  }, []);

  const deselectNft = useCallback((tokenId: bigint) => {
    setSelectedNfts((prev) => {
      const next = new Set(prev);
      next.delete(tokenId);
      return next;
    });
  }, []);

  const toggleNftSelection = useCallback((tokenId: bigint) => {
    setSelectedNfts((prev) => {
      const next = new Set(prev);
      if (next.has(tokenId)) {
        next.delete(tokenId);
      } else if (next.size < MAX_SELECTION) {
        next.add(tokenId);
      }
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedNfts(new Set());
  }, []);

  const { canMerge, mergeLevel, selectionError } = useMemo(() => {
    if (selectedNfts.size === 0) {
      return { canMerge: false, mergeLevel: null, selectionError: null };
    }

    const selected = nfts.filter((nft) => selectedNfts.has(nft.tokenId));
    if (selected.length === 0) {
      return { canMerge: false, mergeLevel: null, selectionError: "No NFTs selected" };
    }

    const levels = new Set(selected.map((nft) => nft.level));
    if (levels.size > 1) {
      return {
        canMerge: false,
        mergeLevel: null,
        selectionError: "All selected NFTs must be the same rarity",
      };
    }

    const level = selected[0].level;

    if (level === NftLevel.Gold) {
      return { canMerge: false, mergeLevel: null, selectionError: "Gold NFTs cannot be merged" };
    }

    if (selected.length < 2) {
      return {
        canMerge: false,
        mergeLevel: level,
        selectionError: "Select at least 2 NFTs to merge",
      };
    }

    return { canMerge: true, mergeLevel: level, selectionError: null };
  }, [selectedNfts, nfts]);

  const value: NftContextState = {
    nfts,
    isLoading,
    stakedNft,
    selectedNfts,
    sortOption,
    selectNft,
    deselectNft,
    toggleNftSelection,
    clearSelection,
    setSortOption,
    canMerge,
    mergeLevel,
    selectionError,
    refetch,
  };

  return <NftContext.Provider value={value}>{children}</NftContext.Provider>;
}

export function useNftContext() {
  const context = useContext(NftContext);
  if (!context) {
    throw new Error("useNftContext must be used within NftProvider");
  }
  return context;
}
