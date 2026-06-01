import { useQueryClient } from "@tanstack/react-query";
import React, { useCallback, useEffect, useState } from "react";
import type { Address } from "viem";

import { authenticateFunded } from "domain/funded/funded-auth";
import type { FundedAuthResponse } from "domain/funded/funded-types";
import { encryptPk } from "lib/funded/aes-encrypt-pk";
import {
  FUNDED_STORAGE_KEYS,
  clearFundedStorage,
  readFundedStorage,
  writeFundedStorage,
} from "lib/funded/funded-storage";
import useWallet from "lib/wallets/useWallet";

import { FundedContext } from "./funded-context";

export function FundedContextProvider({ children }: { children: React.ReactNode }) {
  const { walletClient, account: mainAddress, chainId } = useWallet();
  const queryClient = useQueryClient();

  const [isFundedMode, setIsFundedMode] = useState<boolean>(
    () => readFundedStorage<FundedAuthResponse>(FUNDED_STORAGE_KEYS.accountInfo) !== null
  );
  const [isSwitchingMode, setIsSwitchingMode] = useState(false);
  const [fundedAccount, setFundedAccount] = useState<Address | null>(
    () => readFundedStorage<Address>(FUNDED_STORAGE_KEYS.fundedAccount)
  );
  const [fundedAccountInfo, setFundedAccountInfo] = useState<FundedAuthResponse | null>(
    () => readFundedStorage<FundedAuthResponse>(FUNDED_STORAGE_KEYS.accountInfo)
  );
  const [connectedControllerAddress, setConnectedControllerAddress] = useState<Address | null>(
    () => readFundedStorage<Address>(FUNDED_STORAGE_KEYS.controllerAddress)
  );
  const [isReadOnly, setIsReadOnly] = useState<boolean>(
    () => readFundedStorage<boolean>(FUNDED_STORAGE_KEYS.isReadOnly) ?? false
  );

  useEffect(() => {
    if (fundedAccountInfo) {
      writeFundedStorage(FUNDED_STORAGE_KEYS.accountInfo, fundedAccountInfo);
    } else {
      clearFundedStorage(FUNDED_STORAGE_KEYS.accountInfo);
    }
  }, [fundedAccountInfo]);

  useEffect(() => {
    if (fundedAccount) {
      writeFundedStorage(FUNDED_STORAGE_KEYS.fundedAccount, fundedAccount);
    } else {
      clearFundedStorage(FUNDED_STORAGE_KEYS.fundedAccount);
    }
  }, [fundedAccount]);

  useEffect(() => {
    if (connectedControllerAddress) {
      writeFundedStorage(FUNDED_STORAGE_KEYS.controllerAddress, connectedControllerAddress);
    } else {
      clearFundedStorage(FUNDED_STORAGE_KEYS.controllerAddress);
    }
  }, [connectedControllerAddress]);

  useEffect(() => {
    writeFundedStorage(FUNDED_STORAGE_KEYS.isReadOnly, isReadOnly);
  }, [isReadOnly]);

  const connectFunded = useCallback(
    async (controllerAddress: Address) => {
      if (!walletClient || !mainAddress || !chainId) {
        throw new Error("Wallet not connected");
      }

      setIsSwitchingMode(true);

      try {
        const auth = await authenticateFunded({
          walletClient,
          address: mainAddress,
          chainId,
          controllerAddress,
        });

        const encryptedPk = encryptPk(auth.operatorPrivateKey, mainAddress);
        writeFundedStorage(FUNDED_STORAGE_KEYS.subaccountPk, encryptedPk);

        setFundedAccount(auth.operatorWalletAddress);
        setFundedAccountInfo(auth);
        setConnectedControllerAddress(controllerAddress);
        setIsReadOnly(!!auth.readOnly);
        setIsFundedMode(true);

        setTimeout(() => queryClient.invalidateQueries(), 0);
      } catch (err) {
        clearFundedStorage(FUNDED_STORAGE_KEYS.accountInfo);
        clearFundedStorage(FUNDED_STORAGE_KEYS.fundedAccount);
        clearFundedStorage(FUNDED_STORAGE_KEYS.controllerAddress);
        clearFundedStorage(FUNDED_STORAGE_KEYS.subaccountPk);
        clearFundedStorage(FUNDED_STORAGE_KEYS.isReadOnly);
        setFundedAccount(null);
        setFundedAccountInfo(null);
        setConnectedControllerAddress(null);
        setIsReadOnly(false);
        setIsFundedMode(false);
        throw err;
      } finally {
        setIsSwitchingMode(false);
      }
    },
    [walletClient, mainAddress, chainId, queryClient]
  );

  const disconnectFunded = useCallback(() => {
    clearFundedStorage(FUNDED_STORAGE_KEYS.accountInfo);
    clearFundedStorage(FUNDED_STORAGE_KEYS.fundedAccount);
    clearFundedStorage(FUNDED_STORAGE_KEYS.controllerAddress);
    clearFundedStorage(FUNDED_STORAGE_KEYS.subaccountPk);
    clearFundedStorage(FUNDED_STORAGE_KEYS.isReadOnly);

    setFundedAccount(null);
    setFundedAccountInfo(null);
    setConnectedControllerAddress(null);
    setIsReadOnly(false);
    setIsFundedMode(false);

    setTimeout(() => queryClient.invalidateQueries(), 0);
  }, [queryClient]);

  return (
    <FundedContext.Provider
      value={{
        isFundedMode,
        isSwitchingMode,
        fundedAccount,
        fundedAccountInfo,
        connectedControllerAddress,
        isReadOnly,
        connectFunded,
        disconnectFunded,
      }}
    >
      {children}
    </FundedContext.Provider>
  );
}
