import { FUNDED_API_URL, FUNDED_BROKER_ID, FUNDED_FRONTEND_ID } from "config/funded";

function getFundedBaseUrl(): string {
  if (!FUNDED_API_URL) {
    throw new Error("VITE_FUNDED_API_URL is not configured");
  }
  return FUNDED_API_URL.endsWith("/") ? FUNDED_API_URL.slice(0, -1) : FUNDED_API_URL;
}

function buildFundedHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    "x-foxify-frontend-id": FUNDED_FRONTEND_ID,
    "x-foxify-broker-id": FUNDED_BROKER_ID,
  };
}

export async function fundedGet<T>(path: string, params?: Record<string, string>): Promise<T> {
  const base = getFundedBaseUrl();
  const url = new URL(`${base}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: buildFundedHeaders(),
    credentials: "omit",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`FUNDED GET ${path} failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function fundedPost<T>(path: string, body: unknown): Promise<T> {
  const base = getFundedBaseUrl();
  const url = `${base}${path}`;

  const response = await fetch(url, {
    method: "POST",
    headers: buildFundedHeaders(),
    credentials: "omit",
    cache: "no-store",
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`FUNDED POST ${path} failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}
