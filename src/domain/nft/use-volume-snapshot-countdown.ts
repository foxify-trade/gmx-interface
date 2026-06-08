import { useEffect, useMemo, useState } from "react";

export const SNAPSHOT_AT_LABEL = "Jul 1, 2026 20:00:00 UTC";

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function useVolumeSnapshotCountdown(): {
  isSnapshotTaken: boolean;
  remainingLabel: string;
} {
  // Jul 1, 2026 20:00:00 UTC
  const snapshotMs = useMemo(() => Date.UTC(2026, 6, 1, 20, 0, 0), []);
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const isSnapshotTaken = nowMs >= snapshotMs;
  const remainingMs = Math.max(0, snapshotMs - nowMs);

  const remainingLabel = useMemo(() => {
    if (isSnapshotTaken) return "0 (snapshot taken)";

    const totalSeconds = Math.floor(remainingMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${days}d ${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
  }, [isSnapshotTaken, remainingMs]);

  return { isSnapshotTaken, remainingLabel };
}
