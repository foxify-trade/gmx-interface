import { Trans } from "@lingui/macro";
import { useState } from "react";

import Button from "components/Button/Button";

import { NftMintReminderDialog } from "./NftMintReminderDialog";

export function NftMintReminderButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col items-center justify-between gap-12 rounded-8 bg-blue-400/5 px-16 py-12 sm:flex-row">
        <p className="flex items-center gap-8 text-center text-14 text-[#a8b0c0] sm:text-left">
          {/* Bell icon */}
          <svg
            className="h-16 w-16 shrink-0 text-blue-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <Trans>Send me an email to remind me when it's my time to mint</Trans>
        </p>
        <Button variant="primary" size="small" onClick={() => setOpen(true)} className="shrink-0">
          <Trans>Remind me</Trans>
        </Button>
      </div>

      <NftMintReminderDialog isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
