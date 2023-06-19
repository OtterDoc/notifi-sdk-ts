import { ConnectedWallet, Operation, WalletBlockchain } from '../models';

/**
 * Represents the input parameters for connecting a wallet.
 * @property {string} walletPublicKey - The public key of the wallet to connect.
 * @property {number} timestamp - The timestamp of the connection request.
 * @property {string} signature - The signature of the connection request.
 * @property {WalletBlockchain} walletBlockchain - The blockchain of the wallet to connect.
 * @property {string} [accountId] - The account ID to connect the wallet to.
 * @property {string} [connectWalletConflictResolutionTechnique=FAIL] - The conflict resolution technique to use if the wallet is already connected to another account.
 */
export type ConnectWalletInput = Readonly<{
  walletPublicKey: string;
  timestamp: number;
  signature: string;
  walletBlockchain: WalletBlockchain;
  accountId?: string;
  connectWalletConflictResolutionTechnique?:
    | 'FAIL'
    | 'DISCONNECT'
    | 'DISCONNECT_AND_CLOSE_OLD_ACCOUNT';
}>;

export type ConnectWalletResult = ConnectedWallet;

export type ConnectWalletService = Readonly<{
  connectWallet: Operation<ConnectWalletInput, ConnectWalletResult>;
}>;
