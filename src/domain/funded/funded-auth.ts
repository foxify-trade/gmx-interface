import type { Address } from "viem";

import { FUNDED_ENDPOINTS } from "config/funded";
import { fundedPost } from "lib/funded/funded-fetch";
import { signFundedMessage } from "lib/funded/funded-signer";
import type { WalletClient } from "lib/wallets/useWallet";

import type { FundedAuthResponse } from "./funded-types";

export async function authenticateFunded(params: {
  walletClient: WalletClient;
  address: Address;
  chainId: number;
  controllerAddress: Address;
}): Promise<FundedAuthResponse> {
  const { walletClient, address, chainId, controllerAddress } = params;

  const timestamp = Date.now();
  const nonce = Math.random().toString(36).slice(2);
  const messagePayload = JSON.stringify({
    method: "POST",
    path: FUNDED_ENDPOINTS.authenticate,
    timestamp,
    nonce,
    controllerAddress,
  });

  const { signature, signatureType } = await signFundedMessage({
    walletClient,
    address,
    message: messagePayload,
    chainId,
  });

  const data = await fundedPost<FundedAuthResponse>(FUNDED_ENDPOINTS.authenticate, {
    publicKey: address,
    signature,
    message: messagePayload,
    signatureType,
  });

  if (!data?.operatorPrivateKey || !data?.operatorWalletAddress) {
    throw new Error("Invalid FUNDED auth response: missing operatorPrivateKey or operatorWalletAddress");
  }

  return data;
}
