const STORAGE_PREFIX = import.meta.env.VITE_FUNDED_STORAGE_PREFIX ?? "gmx-funded";
const TAB_ID_KEY = "funded:tabId";

function getFundedTabId(): string {
  let id = sessionStorage.getItem(TAB_ID_KEY);
  if (!id) {
    id = Math.random().toString(36).slice(2);
    sessionStorage.setItem(TAB_ID_KEY, id);
  }
  return id;
}

export function getFundedStorageKey(name: string): string {
  return `${STORAGE_PREFIX}:${getFundedTabId()}:${name}`;
}

export function readFundedStorage<T>(name: string): T | null {
  try {
    const raw = localStorage.getItem(getFundedStorageKey(name));
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeFundedStorage<T>(name: string, value: T): void {
  localStorage.setItem(getFundedStorageKey(name), JSON.stringify(value));
}

export function clearFundedStorage(name: string): void {
  localStorage.removeItem(getFundedStorageKey(name));
}

export const FUNDED_STORAGE_KEYS = {
  accountInfo: "accountInfo",
  fundedAccount: "fundedAccount",
  controllerAddress: "controllerAddress",
  subaccountPk: "subaccountPk",
  isReadOnly: "isReadOnly",
} as const;
