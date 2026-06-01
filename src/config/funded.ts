const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);
const viteEnv = import.meta.env;

export function parseFundedFlag(value?: string | null) {
  return value ? TRUE_VALUES.has(value.trim().toLowerCase()) : false;
}

export function parseOptionalUrl(value?: string | null) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  try {
    return new URL(trimmed).toString();
  } catch {
    return null;
  }
}

export const FUNDED_ENABLED = parseFundedFlag(viteEnv.VITE_ENABLE_FUNDED);
export const FUNDED_API_URL = parseOptionalUrl(viteEnv.VITE_FUNDED_API_URL);
export const FUNDED_FRONTEND_ID = "gmx-funded";
export const FUNDED_PRODUCT_NAME = "GMX FUNDED";
export const FUNDED_DEMO_CONTROLLER_ADDRESS = "0x1111111111111111111111111111111111111111" as const;
export const FUNDED_ROUTES = {
  startJourney: "/funded/start-journey",
  myJourneys: "/funded/my-journeys",
  challengeDashboard: "/funded/challenge-dashboard",
} as const;

export const FUNDED_PREVIEW_NOTE = FUNDED_API_URL
  ? "Preview routes are enabled. Dashboard data will use the configured FUNDED API when a controller address is available."
  : "Preview routes are enabled. Dashboard data is currently served from typed demo adapters until a FUNDED API URL is configured.";

export const FUNDED_BROKER_ID = "gmx-funded";
export const FUNDED_ENDPOINTS = {
  authenticate: "/funded/authenticate",
  challenges: "/funded/challenges",
} as const;
