import { Trans } from "@lingui/macro";

import { NftDialog } from "components/Nft/NftDialog";

import { NftMintEmailReminder } from "./NftMintEmailReminder";

interface NftMintReminderDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NftMintReminderDialog({ isOpen, onClose }: NftMintReminderDialogProps) {
  return (
    <NftDialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title={<Trans>Mint Reminder</Trans>}
      contentClassName="max-w-md"
    >
      <NftMintEmailReminder onSuccess={onClose} />
    </NftDialog>
  );
}
