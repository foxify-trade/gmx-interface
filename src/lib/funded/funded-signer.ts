import type { WalletClient } from "lib/wallets/useWallet";
import type { Address } from "viem";

export type SignatureResult = {
  signature: string;
  signatureType: "personal_sign" | "eth_signTypedData_v4";
};

const TYPED_DATA_FALLBACK_CODES = new Set([4200, -32601]);

function isUnsupportedPersonalSign(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as Record<string, unknown>;
  const code = typeof e.code === "number" ? e.code : undefined;
  const msg = typeof e.message === "string" ? e.message.toLowerCase() : "";
  if (code !== undefined && TYPED_DATA_FALLBACK_CODES.has(code)) return true;
  return msg.includes("personal_sign") || msg.includes("not supported");
}

export async function signFundedMessage(params: {
  walletClient: WalletClient;
  address: Address;
  message: string;
  chainId: number;
}): Promise<SignatureResult> {
  const { walletClient, address, message } = params;

  try {
    const signature = await walletClient.request({
      method: "personal_sign",
      params: [message as `0x${string}`, address],
    });
    return { signature: signature as string, signatureType: "personal_sign" };
  } catch (err) {
    if (!isUnsupportedPersonalSign(err)) throw err;
  }

  // Fallback to eth_signTypedData_v4 for wallets that don't support personal_sign
  const typedData = JSON.stringify({
    types: {
      EIP712Domain: [],
      Message: [{ name: "content", type: "string" }],
    },
    primaryType: "Message",
    domain: {},
    message: { content: message },
  });

  const signature = await walletClient.request({
    method: "eth_signTypedData_v4",
    params: [address, typedData],
  });

  return { signature: signature as string, signatureType: "eth_signTypedData_v4" };
}
