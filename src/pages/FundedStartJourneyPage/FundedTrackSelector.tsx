import cx from "classnames";

import type { FundedTrackDefinition, FundedTrackId } from "domain/funded/funded-types";
import { formatFundedUsd } from "domain/funded/funded-utils";

import Button from "components/Button/Button";

const TRACK_ACCENTS: Record<FundedTrackId, string> = {
  entry: "text-blue-300",
  pro: "text-violet-300",
};

interface Props {
  tracks: FundedTrackDefinition[];
  selectedTrackId: FundedTrackId;
  onSelect: (trackId: FundedTrackId) => void;
  onPrimaryAction: () => void;
  primaryActionLabel: string;
}

export function FundedTrackSelector({
  tracks,
  selectedTrackId,
  onSelect,
  onPrimaryAction,
  primaryActionLabel,
}: Props) {
  return (
    <div className="rounded-8 border border-slate-600 bg-[#242529]">
      <div className="grid gap-0 md:grid-cols-2">
        {tracks.map((track) => {
          const isSelected = track.id === selectedTrackId;

          return (
            <button
              key={track.id}
              type="button"
              onClick={() => onSelect(track.id)}
              className={cx(
                "relative border-0 border-b border-slate-600 px-16 py-14 text-left transition-colors md:border-b-0 md:px-18 md:py-16",
                {
                  "bg-[#2b2d32] md:border-r md:border-slate-600": isSelected,
                  "bg-[#242529] hover:bg-[#292b2f]": !isSelected,
                }
              )}
            >
              {track.badgeLabel ? (
                <div className="absolute right-12 top-12 rounded-full bg-violet-300/15 px-8 py-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-violet-200">
                  {track.badgeLabel}
                </div>
              ) : null}

              <div className={cx("text-[10px] font-semibold uppercase tracking-[0.16em]", TRACK_ACCENTS[track.id])}>
                {track.eyebrow}
              </div>
              <div className="mt-8 text-[22px] font-extrabold uppercase leading-none text-white">{track.id}</div>

              <div className="mt-12 grid gap-10 text-[10px] uppercase tracking-[0.12em] text-slate-400 sm:grid-cols-3">
                <div>
                  <div>Deposit</div>
                  <div className="mt-6 numbers text-[14px] font-semibold normal-case text-blue-300">
                    {formatFundedUsd(track.depositUsd)}
                  </div>
                </div>
                <div>
                  <div>Starts at</div>
                  <div className="mt-6 numbers text-[14px] font-semibold normal-case text-white">
                    {formatFundedUsd(track.startsAtUsd)}
                  </div>
                </div>
                <div>
                  <div>Levels to top</div>
                  <div className="mt-6 text-[14px] font-semibold normal-case text-white">{track.levelsToTop} levels</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-12 border-t border-slate-600 px-16 py-12 md:flex-row md:items-center md:justify-between md:px-18">
        <div className="text-[11px] text-slate-400">
          Entry + Pro use GMX app shell interactions. Setup remains preview-only until funded mode integration is approved.
        </div>
        <Button variant="primary" onClick={onPrimaryAction} className="shrink-0 justify-center px-16">
          {primaryActionLabel}
        </Button>
      </div>
    </div>
  );
}
