import { t, Trans } from "@lingui/macro";
import cx from "classnames";

import useWallet from "lib/wallets/useWallet";

import Button from "components/Button/Button";

interface EligibilityWalletInputProps {
  inputAddress: string;
  onInputChange: (value: string) => void;
  onCheck: () => { ok: boolean; error?: string } | void;
  onUseConnectedWallet: () => void;
  onClear?: () => void;
  isLoading?: boolean;
  className?: string;
}

export function EligibilityWalletInput({
  inputAddress,
  onInputChange,
  onCheck,
  onUseConnectedWallet,
  onClear,
  isLoading = false,
  className,
}: EligibilityWalletInputProps) {
  const { account } = useWallet();
  const hasConnectedWallet = Boolean(account);

  const handleClear = () => {
    onInputChange("");
    onClear?.();
  };

  return (
    <div className={cx("flex w-full flex-col gap-8", className)}>
      <label htmlFor="eligibility-wallet-input" className="text-14 font-medium text-[#a8b0c0]">
        <Trans>Wallet address</Trans>
      </label>

      <div className="flex w-full items-center gap-8 rounded-8 border border-[#3a3f50] bg-[#1e2235] p-6 transition-colors focus-within:border-blue-400">
        <input
          id="eligibility-wallet-input"
          type="text"
          value={inputAddress}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={t`Enter wallet address (0x...)`}
          className="flex-1 bg-transparent px-12 py-8 text-14 text-white outline-none placeholder:text-[#5a6070]"
          onKeyDown={(e) => {
            if (e.key === "Enter") onCheck();
          }}
        />
        {inputAddress.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            aria-label={t`Clear wallet address`}
            className="flex h-28 w-28 items-center justify-center rounded-6 text-[#a8b0c0] transition-colors hover:bg-[#2a2f45] hover:text-white"
          >
            {/* X icon */}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M1 1l12 12M13 1L1 13"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
        <Button
          variant="primary"
          size="small"
          disabled={isLoading}
          onClick={() => onCheck()}
        >
          {isLoading ? <Trans>Checking…</Trans> : <Trans>Check</Trans>}
        </Button>
      </div>

      <button
        type="button"
        onClick={onUseConnectedWallet}
        disabled={!hasConnectedWallet}
        className="inline-flex w-fit items-center gap-4 text-12 font-medium text-blue-400 transition-colors hover:text-blue-300 hover:underline disabled:cursor-not-allowed disabled:text-[#5a6070] disabled:no-underline"
      >
        {/* Wallet icon */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <rect
            x="2"
            y="7"
            width="20"
            height="14"
            rx="2"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M16 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"
            fill="currentColor"
          />
          <path d="M6 7V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" />
        </svg>
        {hasConnectedWallet ? (
          <Trans>Use connected wallet</Trans>
        ) : (
          <Trans>Connect wallet to auto-fill</Trans>
        )}
      </button>
    </div>
  );
}
