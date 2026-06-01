import { Signer } from "ethers";
import { keccak256, type Hash } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import { SUBACCOUNT_MESSAGE } from "sdk/configs/express";
import { encryptPk } from "lib/funded/aes-encrypt-pk";

export async function generateSubaccount(signer: Signer) {
  const signature = await signer.signMessage(SUBACCOUNT_MESSAGE);

  const pk = keccak256(signature as Hash);
  const subaccount = privateKeyToAccount(pk);

  const encrypted = encryptPk(pk, await signer.getAddress());

  return {
    privateKey: encrypted,
    address: subaccount.address,
    isNew: true,
  };
}
