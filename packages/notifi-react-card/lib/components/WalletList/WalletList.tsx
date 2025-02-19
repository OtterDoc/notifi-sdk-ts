import { WalletWithSignParams } from '@notifi-network/notifi-core';
import { Types } from '@notifi-network/notifi-graphql';
import React from 'react';

import {
  useNotifiClientContext,
  useNotifiSubscriptionContext,
} from '../../context';
import { ConnectWalletRow } from './ConnectWalletRow';

export type WalletListInternalProps = Readonly<{
  connectedWallets: ReadonlyArray<Types.ConnectedWalletFragmentFragment>;
  ownedWallets: ReadonlyArray<WalletWithSignParams>;
  disabled: boolean;
}>;

export const WalletListInternal: React.FC<WalletListInternalProps> = ({
  connectedWallets,
  ownedWallets,
  disabled,
}: WalletListInternalProps) => {
  return (
    <ul>
      {ownedWallets.map((wallet) => {
        return (
          <ConnectWalletRow
            key={wallet.walletPublicKey}
            {...wallet}
            connectedWallets={connectedWallets}
            disabled={disabled}
          />
        );
      })}
    </ul>
  );
};
export const WalletList: React.FC = () => {
  const {
    params: { multiWallet },
  } = useNotifiClientContext();
  const { connectedWallets, loading } = useNotifiSubscriptionContext();
  const owned = multiWallet?.ownedWallets;
  if (owned === undefined || owned.length === 0) {
    return null;
  }

  return (
    <WalletListInternal
      ownedWallets={owned}
      connectedWallets={connectedWallets.filter(
        (wallet): wallet is Types.ConnectedWalletFragmentFragment => !!wallet,
      )}
      disabled={loading}
    />
  );
};
