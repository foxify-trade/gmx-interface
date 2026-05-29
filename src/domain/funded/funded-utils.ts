import type { Address } from "viem";

import { FUNDED_API_URL } from "config/funded";

import type { FundedDataSource } from "./funded-types";

const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

export function sanitizeControllerAddress(value?: string | null): Address | undefined {
  const trimmed = value?.trim();

  if (!trimmed || !ADDRESS_REGEX.test(trimmed)) {
    return undefined;
  }

  return trimmed as Address;
}

export function getFundedDashboardSource(controllerAddress?: Address, apiUrl = FUNDED_API_URL): FundedDataSource {
  return controllerAddress && apiUrl ? "api" : "demo";
}

export function formatFundedPercent(value: number, maximumFractionDigits = 1) {
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits }).format(value)}%`;
}

export function formatFundedCompactNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: value >= 1_000_000 ? 2 : 1,
  }).format(value);
}

export function formatFundedUsd(value: number, displayDecimals = 0) {
  const absoluteValue = Math.abs(value);
  const prefix = value < 0 ? "-" : "";
  const formattedValue = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: displayDecimals,
    maximumFractionDigits: displayDecimals,
  }).format(absoluteValue);

  return `${prefix}$\u200a${formattedValue}`;
}

export function formatFundedDateLabel(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
