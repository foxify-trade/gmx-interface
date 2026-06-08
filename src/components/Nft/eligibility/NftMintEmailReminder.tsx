import { t, Trans } from "@lingui/macro";
import { useState } from "react";

import { getNftMintNewsletterContext } from "domain/nft/nft-mint-newsletter-context";

import Button from "components/Button/Button";

const SUBSCRIBE_URL = "https://api.foxify.trade/newsletter/subscribe";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface NftMintEmailReminderProps {
  /** Called after a successful submit to auto-close the parent dialog. */
  onSuccess?: () => void;
}

export function NftMintEmailReminder({ onSuccess }: NftMintEmailReminderProps) {
  const newsletterContext = getNftMintNewsletterContext();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();

    if (!trimmed) {
      setError(t`Please enter your email address`);
      return;
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      setError(t`Please enter a valid email address`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(SUBSCRIBE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, context: newsletterContext }),
      });

      const data = (await response.json().catch(() => ({}))) as { message?: string };

      if (!response.ok) {
        throw new Error(data.message ?? t`Failed to subscribe`);
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t`Something went wrong`);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="py-24 text-center">
        <p className="text-24 text-blue-400">
          <Trans>You're on the list!</Trans>
        </p>
        <p className="mt-8 text-14 text-white">
          <Trans>We'll email you before the mint goes live.</Trans>
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-16 py-16">
      <div className="text-center">
        <p className="text-16 font-semibold text-white">
          <Trans>Get a mint reminder</Trans>
        </p>
        <p className="mt-4 text-14 text-[#a8b0c0]">
          <Trans>Drop your email and we'll ping you when your NFT mint window opens.</Trans>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-12">
        <div>
          <label htmlFor="nft-mint-reminder-email" className="mb-4 block text-14 font-medium text-[#a8b0c0]">
            <Trans>Email</Trans>
          </label>
          <input
            id="nft-mint-reminder-email"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t`you@example.com`}
            className="w-full rounded-8 border border-[#3a3f50] bg-[#1e2235] px-12 py-8 text-14 text-white outline-none placeholder:text-[#5a6070] focus:border-blue-400"
          />
          {error && <p className="mt-4 text-12 text-red-400">{error}</p>}
        </div>

        <div className="flex justify-center">
          <Button variant="primary" type="submit" disabled={isLoading}>
            {isLoading ? <Trans>Saving…</Trans> : <Trans>Remind me</Trans>}
          </Button>
        </div>
      </form>
    </div>
  );
}
