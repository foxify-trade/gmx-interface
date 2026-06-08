import { Trans } from "@lingui/macro";

import { useNftContext } from "domain/nft/nft-context";
import {
  NftLevel,
  getLevelColor,
  getLevelGlow,
  getLevelGradient,
  getLevelName,
  getNftImage,
} from "domain/nft/nft-types";

import Button from "components/Button/Button";
import { NftDialog } from "components/Nft/NftDialog";

interface NftSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (tokenId: bigint) => void;
  isLoading?: boolean;
  title: string;
  /** When true (default), filters out already-staked NFTs. */
  excludeStaked?: boolean;
}

export function NftSelectDialog({
  open,
  onOpenChange,
  onSelect,
  isLoading,
  title,
  excludeStaked = true,
}: NftSelectDialogProps) {
  const { nfts } = useNftContext();

  // Bronze NFTs cannot be staked — only Silver and Gold are eligible
  const availableNfts = (excludeStaked ? nfts.filter((nft) => !nft.isStaked) : nfts).filter(
    (nft) => nft.level !== NftLevel.Bronze
  );

  return (
    <NftDialog open={open} onOpenChange={onOpenChange} title={title}>
      <div className="p-8">
        {availableNfts.length === 0 ? (
          <div className="flex flex-col items-center py-48">
            <svg
              className="mb-16 h-64 w-64 text-gray-500 opacity-50"
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
            <p className="text-gray-400">
              <Trans>No NFTs available to select</Trans>
            </p>
          </div>
        ) : (
          <div className="grid max-h-[400px] grid-cols-2 gap-16 overflow-y-auto p-4 sm:grid-cols-3">
            {availableNfts.map((nft) => {
              const levelColor = getLevelColor(nft.level);
              const levelGradient = getLevelGradient(nft.level);

              return (
                <button
                  key={nft.tokenId.toString()}
                  className="group relative flex flex-col items-center overflow-hidden rounded-12 border-2 p-12 transition-all duration-200 hover:scale-[1.02]"
                  style={{
                    borderColor: levelColor,
                    background:
                      "linear-gradient(180deg, rgba(30,30,40,0.9) 0%, rgba(20,20,30,0.95) 100%)",
                  }}
                  onClick={() => onSelect(nft.tokenId)}
                  disabled={isLoading}
                >
                  <div
                    className="absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                    style={{ boxShadow: getLevelGlow(nft.level) }}
                  />
                  <div className="relative mb-8 h-96 w-96 overflow-hidden rounded-8">
                    <img
                      src={getNftImage(nft)}
                      alt={`NFT #${nft.tokenId.toString()}`}
                      className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-110"
                    />
                    <span
                      className="absolute bottom-4 left-4 rounded-full px-8 py-2 text-[10px] font-bold text-white"
                      style={{ background: levelGradient }}
                    >
                      {getLevelName(nft.level)}
                    </span>
                  </div>
                  <p className="text-14 font-semibold text-white">
                    #{nft.tokenId.toString()}
                  </p>
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-16">
          <Button variant="secondary" className="w-full" onClick={() => onOpenChange(false)}>
            <Trans>Cancel</Trans>
          </Button>
        </div>
      </div>
    </NftDialog>
  );
}
