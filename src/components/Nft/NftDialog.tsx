import { ReactNode } from "react";

import Modal from "components/Modal/Modal";

interface NftDialogProps {
  /** Controlled open state (reference Orderly Dialog `open` prop). */
  open: boolean;
  /** Called with the next open state (reference `onOpenChange`). */
  onOpenChange: (open: boolean) => void;
  title?: ReactNode;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
}

/**
 * Thin adapter that maps the reference Orderly `SafeDialog` API
 * (`open` / `onOpenChange` / `title`) onto the project's `Modal`
 * (`isVisible` / `setIsVisible` / `label`). Keeps the ported NFT dialogs
 * portable with minimal edits.
 */
export function NftDialog({ open, onOpenChange, title, className, contentClassName, children }: NftDialogProps) {
  return (
    <Modal
      isVisible={open}
      setIsVisible={onOpenChange}
      label={title}
      className={className}
      contentClassName={contentClassName}
    >
      {children}
    </Modal>
  );
}

export default NftDialog;
