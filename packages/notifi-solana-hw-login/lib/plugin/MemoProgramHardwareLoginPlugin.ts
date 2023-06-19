import { HardwareLoginPlugin } from '@notifi-network/notifi-react-card';
import type { WalletContextState } from '@solana/wallet-adapter-react';
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';

type MemoProgramHardwareLoginPluginParams = Readonly<{
  walletPublicKey: string;
  connection: Connection;
  sendTransaction: WalletContextState['sendTransaction'];
}>;

/**
 * Represents a Memo Program Hardware Login Plugin.
 * @class
 * @implements {HardwareLoginPlugin}
 * @param {MemoProgramHardwareLoginPluginParams} params - The parameters for the plugin.
 * @property {MemoProgramHardwareLoginPluginParams} params - The parameters for the plugin.
 * @property {(message: string) => Promise<string>} sendMessage - Sends a transaction message and returns the signature.
 */
export class MemoProgramHardwareLoginPlugin implements HardwareLoginPlugin {
  params: MemoProgramHardwareLoginPluginParams;

  constructor(params: MemoProgramHardwareLoginPluginParams) {
    this.params = params;
  }

  /**
   * Sends a message transaction to the blockchain.
   * @param {string} message - The message to be sent.
   * @returns {Promise<string>} - The signature of the transaction.
   */
  sendMessage: (message: string) => Promise<string> = async (message) => {
    const { walletPublicKey, connection, sendTransaction } = this.params;

    const publicKey = new PublicKey(walletPublicKey);
    const latestBlockHash = await connection.getLatestBlockhash();
    const txn = new Transaction();
    txn.recentBlockhash = latestBlockHash.blockhash;
    txn.feePayer = publicKey;
    txn.add(
      new TransactionInstruction({
        data: Buffer.from(message, 'utf-8'),
        keys: [
          {
            isSigner: true,
            isWritable: false,
            pubkey: publicKey,
          },
        ],
        programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
      }),
    );

    // Send transaction and wait for it to confirm
    const blockHashAgain = await connection.getLatestBlockhash();
    const signature = await sendTransaction(txn, connection);
    await connection.confirmTransaction({
      blockhash: blockHashAgain.blockhash,
      lastValidBlockHeight: blockHashAgain.lastValidBlockHeight,
      signature,
    });
    return signature;
  };
}
