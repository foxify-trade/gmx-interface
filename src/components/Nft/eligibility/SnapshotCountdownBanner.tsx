import { Trans } from "@lingui/macro";
import cx from "classnames";

import {
  SNAPSHOT_AT_LABEL,
  useVolumeSnapshotCountdown,
} from "domain/nft/use-volume-snapshot-countdown";

export function SnapshotCountdownBanner() {
  const { isSnapshotTaken, remainingLabel } = useVolumeSnapshotCountdown();

  return (
    <div
      className={cx(
        "flex flex-col items-center justify-between gap-4 rounded-12 px-16 py-12 text-14 sm:flex-row",
        isSnapshotTaken
          ? "bg-red-500/10 text-red-400"
          : "bg-green-500/10 text-green-400"
      )}
    >
      <span className="font-medium">
        <Trans>Volume snapshot:</Trans> {SNAPSHOT_AT_LABEL}
      </span>
      <span className="shrink-0 font-mono font-semibold tabular-nums">{remainingLabel}</span>
    </div>
  );
}
