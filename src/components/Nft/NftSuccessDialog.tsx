import { Trans } from "@lingui/macro";

import {
  NftData,
  getLevelColor,
  getLevelGradient,
  getLevelName,
  getNftImage,
} from "domain/nft/nft-types";

import Button from "components/Button/Button";
import { NftDialog } from "components/Nft/NftDialog";

interface NftSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  oldNfts: NftData[];
  newNft: NftData | null;
  title?: string;
  description?: string;
  /** Override label for the old-NFTs section (e.g. migration vs merge wording). */
  oldNftsLabel?: string;
  /** Show metadata processing delay warning — for mint flows. */
  showMintWarning?: boolean;
}

export function NftSuccessDialog({
  open,
  onOpenChange,
  oldNfts,
  newNft,
  title = "🎉 Congratulations!",
  description = "Your NFT upgrade was successful!",
  oldNftsLabel,
  showMintWarning = false,
}: NftSuccessDialogProps) {
  if (!newNft) return null;

  const defaultOldLabel =
    oldNfts.length === 1 ? "Previous NFT" : `${oldNfts.length} NFTs Combined`;

  return (
    <NftDialog open={open} onOpenChange={onOpenChange} title={title}>
      <div className="p-16">
        {/* Description */}
        <p className="mb-24 text-center text-14 text-gray-400">{description}</p>

        {/* New NFT — main focus */}
        <div className="mb-16 flex flex-col items-center">
          <p className="mb-12 text-center text-14 font-semibold uppercase tracking-wider text-green-400">
            <Trans>✨ New NFT Received! ✨</Trans>
          </p>
          <div
            className="relative overflow-hidden rounded-12 border-4 shadow-2xl transition-all duration-300 hover:scale-105"
            style={{
              borderColor: getLevelColor(newNft.level),
              background: "linear-gradient(180deg, rgba(30,30,40,0.9) 0%, rgba(20,20,30,0.95) 100%)",
              maxWidth: 200,
              width: "100%",
              boxShadow: `0 0 60px ${getLevelColor(newNft.level)}60, 0 0 100px ${getLevelColor(newNft.level)}30`,
            }}
          >
            <div
              className="absolute inset-0 animate-pulse opacity-40"
              style={{
                background: `radial-gradient(circle at center, ${getLevelColor(newNft.level)} 0%, transparent 70%)`,
              }}
            />
            <img
              src={getNftImage(newNft)}
              alt={`NFT #${newNft.tokenId.toString()}`}
              className="relative aspect-square w-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-12">
              <p className="text-center font-bold text-white">#{newNft.tokenId.toString()}</p>
            </div>
            <span
              className="absolute left-8 top-8 rounded-full px-8 py-2 text-14 font-bold text-white shadow-xl"
              style={{ background: getLevelGradient(newNft.level) }}
            >
              {getLevelName(newNft.level)}
            </span>
            <div className="absolute right-12 top-12 animate-pulse text-[30px]">✨</div>
          </div>
        </div>

        {/* Old NFTs — only shown when source NFTs exist (merge/migrate; not mint) */}
        {oldNfts.length > 0 && (
          <div className="mb-16 flex flex-col items-center">
            <p className="mb-4 text-12 font-semibold uppercase tracking-wider text-gray-500">
              <Trans>Upgraded From</Trans>
            </p>
            <div className="mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-gray-600 to-gray-700">
              {/* ArrowDown inline SVG */}
              <svg className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m-7-7l7 7 7-7" />
              </svg>
            </div>
            <p className="mb-8 text-center text-14 font-medium text-gray-500">
              {oldNftsLabel ?? defaultOldLabel}
            </p>
            <div
              className={`grid gap-8 ${
                oldNfts.length === 1 ? "grid-cols-1 justify-items-center" :
                oldNfts.length === 2 ? "grid-cols-2" : "grid-cols-3"
              }`}
            >
              {oldNfts.map((nft) => (
                <div
                  key={nft.tokenId.toString()}
                  className="relative mx-auto overflow-hidden rounded-8 border opacity-50 grayscale"
                  style={{
                    borderColor: getLevelColor(nft.level),
                    background: "linear-gradient(180deg, rgba(30,30,40,0.9) 0%, rgba(20,20,30,0.95) 100%)",
                    maxWidth: oldNfts.length === 1 ? 120 : "100%",
                  }}
                >
                  <img
                    src={getNftImage(nft)}
                    alt={`NFT #${nft.tokenId.toString()}`}
                    className="aspect-square w-full max-w-[128px] object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6">
                    <p className="text-center text-[10px] font-bold text-white">#{nft.tokenId.toString()}</p>
                  </div>
                  <span
                    className="absolute left-4 top-4 rounded-full px-6 py-2 text-[9px] font-bold text-white"
                    style={{ background: getLevelGradient(nft.level) }}
                  >
                    {getLevelName(nft.level)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mint metadata delay warning */}
        {showMintWarning && (
          <div className="mb-16 rounded-8 border border-yellow-500/30 bg-yellow-500/10 px-16 py-12">
            <p className="text-12 text-yellow-400">
              <Trans>
                ⚠️ NFT traits and metadata may not appear immediately after mint due to processing
                delays — please check back later and refresh metadata.
              </Trans>
            </p>
          </div>
        )}

        <Button variant="primary" className="w-full" onClick={() => onOpenChange(false)}>
          <Trans>🎉 Awesome!</Trans>
        </Button>
      </div>
    </NftDialog>
  );
}
