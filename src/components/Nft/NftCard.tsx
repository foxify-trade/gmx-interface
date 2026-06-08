import { t } from "@lingui/macro";
import cx from "classnames";

import { useNftContext } from "domain/nft/nft-context";
import {
  NftData,
  getLevelColor,
  getLevelGlow,
  getLevelGradient,
  getLevelName,
  getNftImage,
} from "domain/nft/nft-types";

interface NftCardProps {
  nft: NftData;
  onClick?: () => void;
}

export function NftCard({ nft, onClick }: NftCardProps) {
  const { selectedNfts } = useNftContext();
  const isSelected = selectedNfts.has(nft.tokenId);
  const levelColor = getLevelColor(nft.level);
  const levelGlow = getLevelGlow(nft.level);
  const levelGradient = getLevelGradient(nft.level);

  return (
    <div
      className={cx(
        "group relative cursor-pointer overflow-hidden rounded-12 border-2 p-12 transition-all duration-300",
        "hover:-translate-y-4 hover:scale-[1.02]",
        nft.isStaked && !isSelected && "border-green-500/50"
      )}
      style={{
        borderColor: isSelected ? levelColor : nft.isStaked ? undefined : "rgba(255,255,255,0.15)",
        boxShadow: isSelected ? levelGlow : undefined,
        background: "linear-gradient(180deg, rgba(30, 30, 40, 0.9) 0%, rgba(20, 20, 30, 0.95) 100%)",
      }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={t`NFT #${nft.tokenId.toString()}`}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
    >
      {nft.isStaked && (
        <span className="absolute left-12 top-12 z-10 rounded-full bg-gradient-to-r from-green-500 to-green-500 px-12 py-4 text-12 font-bold text-white shadow-lg">
          ✓ Staked
        </span>
      )}

      <span
        className="absolute bottom-64 left-12 z-10 rounded-full px-12 py-4 text-12 font-bold text-white shadow-lg"
        style={{ background: levelGradient }}
      >
        {getLevelName(nft.level)}
      </span>

      <div className="relative mb-12 overflow-hidden rounded-8">
        <div
          className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: `radial-gradient(circle at center, ${levelColor}20 0%, transparent 70%)` }}
        />
        <img
          src={getNftImage(nft)}
          alt={nft.name || `NFT #${nft.tokenId.toString()}`}
          className="aspect-square w-full rounded-8 object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="space-y-4 text-14">
        <p className="font-bold text-white">#{nft.tokenId.toString()}</p>
        <p className="text-gray-400">
          Version: <span className="text-gray-300">{nft.version}</span>
        </p>
      </div>

      {isSelected && (
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{ background: `radial-gradient(circle at center, ${levelColor} 0%, transparent 70%)` }}
        />
      )}
    </div>
  );
}
