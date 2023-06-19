import { Types } from '@notifi-network/notifi-graphql';
import { NotifiService } from '@notifi-network/notifi-graphql';

import type {
  NotifiConfigWithPublicKey,
  NotifiConfigWithPublicKeyAndAddress,
  NotifiFrontendConfiguration,
} from '../configuration';
import type {
  AlertFrequency,
  CardConfigItemV1,
  EventTypeItem,
  WalletBalanceEventTypeItem,
} from '../models';
import { IntercomCardConfigItemV1 } from '../models/IntercomCardConfig';
import type { Authorization, NotifiStorage, Roles } from '../storage';
import {
  NotifiFrontendStorage,
  createInMemoryStorageDriver,
  createLocalForageStorageDriver,
} from '../storage';
import { notNullOrEmpty, packFilterOptions } from '../utils';
import { areIdsEqual } from '../utils/areIdsEqual';
import { ensureSourceAndFilters, normalizeHexString } from './ensureSource';
import {
  ensureDiscord,
  ensureEmail,
  ensureSms,
  ensureTelegram,
  ensureWebhook,
} from './ensureTarget';

/**
 * Type alias for sign message parameters.
 *
 * @property {string} walletBlockchain - The blockchain name for the wallet.
 * @property {Uint8SignMessageFunction | AptosSignMessageFunction | AcalaSignMessageFunction} signMessage - The function to sign the message.
 *
 * @typedef {Readonly<{
 * walletBlockchain: 'SOLANA';
 * signMessage: Uint8SignMessageFunction;
 * }> | Readonly<{
 * walletBlockchain: 'ETHEREUM' | 'POLYGON' | 'ARBITRUM' | 'AVALANCHE' | 'BINANCE' | 'INJECTIVE' | 'OPTIMISM';
 * signMessage: Uint8SignMessageFunction;
 * }> | Readonly<{
 * walletBlockchain: 'APTOS';
 * signMessage: AptosSignMessageFunction;
 * }> | Readonly<{
 * walletBlockchain: 'ACALA';
 * signMessage: AcalaSignMessageFunction;
 * }> | Readonly<{
 * walletBlockchain: 'NEAR';
 * signMessage: Uint8SignMessageFunction;
 * }> | Readonly<{
 * walletBlockchain: 'SUI';
 * signMessage: Uint8SignMessageFunction;
 * }>] SignMessageParams
 */
export type SignMessageParams =
  | Readonly<{
      walletBlockchain: 'SOLANA';
      signMessage: Uint8SignMessageFunction;
    }>
  | Readonly<{
      walletBlockchain:
        | 'ETHEREUM'
        | 'POLYGON'
        | 'ARBITRUM'
        | 'AVALANCHE'
        | 'BINANCE'
        | 'INJECTIVE'
        | 'OPTIMISM';
      signMessage: Uint8SignMessageFunction;
    }>
  | Readonly<{
      walletBlockchain: 'APTOS';
      signMessage: AptosSignMessageFunction;
    }>
  | Readonly<{
      walletBlockchain: 'ACALA';
      signMessage: AcalaSignMessageFunction;
    }>
  | Readonly<{
      walletBlockchain: 'NEAR';
      signMessage: Uint8SignMessageFunction;
    }>
  | Readonly<{
      walletBlockchain: 'SUI';
      signMessage: Uint8SignMessageFunction;
    }>;

export type WalletWithSignParams = Readonly<{
  displayName?: string;
}> &
  WalletWithSignMessage;

/**
 * Represents a wallet object with sign message function for various blockchain networks.
 * @typedef {Object} WalletWithSignMessage
 * @property {'SOLANA'} walletBlockchain - The blockchain network for Solana.
 * @property {string} walletPublicKey - The public key of the wallet.
 * @property {Uint8SignMessageFunction} signMessage - The sign message function for Uint8Array.
 * @property {'ETHEREUM' | 'POLYGON' | 'ARBITRUM' | 'AVALANCHE' | 'BINANCE' | 'OPTIMISM'} walletBlockchain - The blockchain network for Ethereum, Polygon, Arbitrum, Avalanche, Binance, and Optimism.
 * @property {string} walletPublicKey - The public key of the wallet.
 * @property {Uint8SignMessageFunction} signMessage - The sign message function for Uint8Array.
 * @property {'APTOS'} walletBlockchain - The blockchain network for Aptos.
 * @property {string} accountAddress - The account address of the wallet.
 * @property {string} walletPublicKey - The public key of the wallet.
 * @property {AptosSignMessageFunction} signMessage - The sign message function for Aptos.
 * @property {'ACALA'} walletBlockchain - The blockchain network for Acala.
 * @property {string} accountAddress - The account address of the wallet.
 * @property {string} walletPublicKey - The public key of the wallet.
 * @property {AcalaSignMessageFunction} signMessage - The sign message function for Acala.
 * @property {'NEAR'} walletBlockchain - The blockchain network for Near.
 * @property {string} accountAddress - The account address of the wallet.
 * @property {string} walletPublicKey - The public key of the wallet.
 * @property {Uint8SignMessageFunction} signMessage - The sign message function for Uint8Array.
 * @property {'SUI'} walletBlockchain - The blockchain network for Sui.
 * @property {string} accountAddress - The account address of the wallet.
 * @property {string} walletPublicKey - The public key of the wallet.
 * @property {Uint8SignMessageFunction} signMessage - The sign message function for Uint8Array.
 */
export type WalletWithSignMessage =
  | Readonly<{
      walletBlockchain: 'SOLANA';
      walletPublicKey: string;
      signMessage: Uint8SignMessageFunction;
    }>
  | Readonly<{
      walletBlockchain:
        | 'ETHEREUM'
        | 'POLYGON'
        | 'ARBITRUM'
        | 'AVALANCHE'
        | 'BINANCE'
        | 'OPTIMISM';

      walletPublicKey: string;
      signMessage: Uint8SignMessageFunction;
    }>
  | Readonly<{
      walletBlockchain: 'APTOS';
      accountAddress: string;
      walletPublicKey: string;
      signMessage: AptosSignMessageFunction;
    }>
  | Readonly<{
      walletBlockchain: 'ACALA';
      accountAddress: string;
      walletPublicKey: string;
      signMessage: AcalaSignMessageFunction;
    }>
  | Readonly<{
      walletBlockchain: 'NEAR';
      accountAddress: string;
      walletPublicKey: string;
      signMessage: Uint8SignMessageFunction;
    }>
  | Readonly<{
      walletBlockchain: 'SUI';
      accountAddress: string;
      walletPublicKey: string;
      signMessage: Uint8SignMessageFunction;
    }>;

export type ConnectWalletParams = Readonly<{
  walletParams: WalletWithSignParams;
  connectWalletConflictResolutionTechnique: Types.ConnectWalletInput['connectWalletConflictResolutionTechnique'];
}>;

// TODO: Clean up blockchain-specific dependencies out of this package
export type Uint8SignMessageFunction = (
  message: Uint8Array,
) => Promise<Uint8Array>;
export type AptosSignMessageFunction = (
  message: string,
  nonce: number,
) => Promise<string>;
type hexString = `0x${string}`;
export type AcalaSignMessageFunction = (
  acalaAddress: string,
  message: string,
) => Promise<hexString>;

export type CardConfigType = CardConfigItemV1 | IntercomCardConfigItemV1;

type BeginLoginProps = Omit<Types.BeginLogInByTransactionInput, 'dappAddress'>;

type CompleteLoginProps = Omit<
  Types.CompleteLogInByTransactionInput,
  'dappAddress' | 'randomUuid'
>;

type EnsureWebhookParams = Omit<
  Types.CreateWebhookTargetMutationVariables,
  'name'
>;

type FindSubscriptionCardParams = Omit<Types.FindTenantConfigInput, 'tenant'>;

// Don't split this line into multiple lines due to some packagers or other build modules that
// modify the string literal, which then causes authentication to fail due to different strings
export const SIGNING_MESSAGE = `Sign in with Notifi \n\n    No password needed or gas is needed. \n\n    Clicking “Approve” only means you have proved this wallet is owned by you! \n\n    This request will not trigger any transaction or cost any gas fees. \n\n    Use of our website and service is subject to our terms of service and privacy policy. \n \n 'Nonce:' `;

export type SupportedCardConfigType = CardConfigItemV1;

/**
 * Represents the state of a user.
 * @typedef {Object} UserState
 * @property {'loggedOut'} status - The current status of the user.
 * @property {Authorization} [authorization] - The authorization object if the user is authenticated or expired.
 * @property {Roles} [roles] - The roles object if the user is authenticated.
 */
export type UserState = Readonly<
  | {
      status: 'loggedOut';
    }
  | {
      status: 'authenticated';
      authorization: Authorization;
      roles: Roles;
    }
  | {
      status: 'expired';
      authorization: Authorization;
    }
>;

export class NotifiFrontendClient {
  constructor(
    private _configuration: NotifiFrontendConfiguration,
    private _service: NotifiService,
    private _storage: NotifiStorage,
  ) {}

  private _clientRandomUuid: string | null = null;
  private _userState: UserState | null = null;

  get userState(): UserState | null {
    return this._userState;
  }

  /**
   * Initializes the UserState by retrieving stored authorization and roles from storage. If no authorization is found, sets the status to 'loggedOut' and returns the resulting UserState. If the stored authorization has expired, sets the status to 'expired' and returns the resulting UserState. If the stored authorization is valid but close to expiration, attempts to refresh the authorization and updates the stored authorization if successful. Finally, sets the status to 'authenticated' and returns the resulting UserState with the retrieved authorization and roles.
   * @returns {Promise<UserState>} The resulting UserState object.
   */
  async initialize(): Promise<UserState> {
    const [storedAuthorization, roles] = await Promise.all([
      this._storage.getAuthorization(),
      this._storage.getRoles(),
    ]);

    let authorization = storedAuthorization;
    if (authorization === null) {
      this._service.setJwt(undefined);
      const logOutStatus: UserState = {
        status: 'loggedOut',
      };
      this._userState = logOutStatus;
      return logOutStatus;
    }

    const expiryDate = new Date(authorization.expiry);
    const now = new Date();
    if (expiryDate <= now) {
      this._service.setJwt(undefined);
      const expiredStatus: UserState = {
        status: 'expired',
        authorization,
      };
      this._userState = expiredStatus;
      return expiredStatus;
    }

    const refreshTime = new Date();
    refreshTime.setDate(now.getDate() + 7);
    if (expiryDate < refreshTime) {
      try {
        const refreshMutation = await this._service.refreshAuthorization({});
        const newAuthorization = refreshMutation.refreshAuthorization;
        if (newAuthorization !== undefined) {
          this._storage.setAuthorization(newAuthorization);
          authorization = newAuthorization;
        }
      } catch (e: unknown) {
        console.log('Failed to refresh Notifi token', e);
      }
    }

    this._service.setJwt(authorization.token);
    const userState: UserState = {
      status: 'authenticated',
      authorization,
      roles: roles ?? [],
    };
    this._userState = userState;
    return userState;
  }

  /**
   * Logs out the user by setting authorization and roles to null and calling the logOut method of the service.
   * @returns Promise<UserState> - A promise that resolves to a UserState object with status 'loggedOut'.
   */
  async logOut(): Promise<UserState> {
    await Promise.all([
      this._storage.setAuthorization(null),
      this._storage.setRoles(null),
      this._service.logOut(),
    ]);

    return {
      status: 'loggedOut',
    };
  }

  /**
   * Logs in a user from a dapp using the provided signMessageParams.
   * @async
   * @param {SignMessageParams} signMessageParams - The parameters used to sign the message.
   * @returns {Promise<Types.UserFragmentFragment>} The logged in user's information.
   * @throws {string} If login fails.
   */
  async logIn(
    signMessageParams: SignMessageParams,
  ): Promise<Types.UserFragmentFragment> {
    const timestamp = Math.round(Date.now() / 1000);
    const signature = await this._signMessage({
      signMessageParams,
      timestamp,
    });

    const { tenantId, walletBlockchain } = this._configuration;

    let loginResult: Types.UserFragmentFragment | undefined = undefined;
    switch (walletBlockchain) {
      case 'ETHEREUM':
      case 'POLYGON':
      case 'ARBITRUM':
      case 'AVALANCHE':
      case 'BINANCE':
      case 'OPTIMISM':
      case 'SOLANA': {
        const result = await this._service.logInFromDapp({
          walletBlockchain,
          walletPublicKey: this._configuration.walletPublicKey,
          dappAddress: tenantId,
          timestamp,
          signature,
        });
        loginResult = result.logInFromDapp;
        break;
      }
      case 'SUI':
      case 'ACALA':
      case 'NEAR':
      case 'INJECTIVE':
      case 'APTOS': {
        const result = await this._service.logInFromDapp({
          walletBlockchain,
          walletPublicKey: this._configuration.authenticationKey,
          accountId: this._configuration.accountAddress,
          dappAddress: tenantId,
          timestamp,
          signature,
        });
        loginResult = result.logInFromDapp;
        break;
      }
    }

    if (loginResult === undefined) {
      return Promise.reject('Failed to login');
    }

    await this._handleLogInResult(loginResult);
    return loginResult;
  }

  /**
   * Signs a message using the provided signMessageParams and returns the signature.
   * @async
   * @param {Object} params - The parameters for signing the message.
   * @param {SignMessageParams} params.signMessageParams - The parameters for signing the message.
   * @param {number} params.timestamp - The timestamp for the message.
   * @returns {Promise<string>} The signature of the signed message.
   */
  private async _signMessage({
    signMessageParams,
    timestamp,
  }: Readonly<{
    signMessageParams: SignMessageParams;
    timestamp: number;
  }>): Promise<string> {
    if (
      this._configuration.walletBlockchain !==
      signMessageParams.walletBlockchain
    ) {
      throw new Error(
        'Sign message params and configuration must have the same blockchain',
      );
    }
    switch (signMessageParams.walletBlockchain) {
      case 'ETHEREUM':
      case 'POLYGON':
      case 'ARBITRUM':
      case 'AVALANCHE':
      case 'BINANCE':
      case 'OPTIMISM': {
        const { walletPublicKey, tenantId } = this
          ._configuration as NotifiConfigWithPublicKey;
        const messageBuffer = new TextEncoder().encode(
          `${SIGNING_MESSAGE}${walletPublicKey}${tenantId}${timestamp.toString()}`,
        );

        const signedBuffer = await signMessageParams.signMessage(messageBuffer);
        const signature = normalizeHexString(
          Buffer.from(signedBuffer).toString('hex'),
        );
        return signature;
      }
      case 'INJECTIVE': {
        const { authenticationKey, tenantId } = this
          ._configuration as NotifiConfigWithPublicKeyAndAddress;
        const messageBuffer = new TextEncoder().encode(
          `${SIGNING_MESSAGE}${authenticationKey}${tenantId}${timestamp.toString()}`,
        );

        const signedBuffer = await signMessageParams.signMessage(messageBuffer);
        const signature = Buffer.from(signedBuffer).toString('base64');
        return signature;
      }
      case 'SOLANA': {
        const { walletPublicKey, tenantId } = this
          ._configuration as NotifiConfigWithPublicKey;
        const messageBuffer = new TextEncoder().encode(
          `${SIGNING_MESSAGE}${walletPublicKey}${tenantId}${timestamp.toString()}`,
        );

        const signedBuffer = await signMessageParams.signMessage(messageBuffer);
        const signature = Buffer.from(signedBuffer).toString('base64');
        return signature;
      }
      case 'ACALA': {
        const { accountAddress, tenantId } = this
          ._configuration as NotifiConfigWithPublicKeyAndAddress;

        const message = `${SIGNING_MESSAGE}${accountAddress}${tenantId}${timestamp.toString()}`;
        const signedBuffer = await signMessageParams.signMessage(
          accountAddress,
          message,
        );
        return signedBuffer;
      }
      case 'APTOS': {
        const signature = await signMessageParams.signMessage(
          SIGNING_MESSAGE,
          timestamp,
        );
        return signature;
      }
      case 'SUI': {
        const { accountAddress, tenantId } = this
          ._configuration as NotifiConfigWithPublicKeyAndAddress;
        const messageBuffer = new TextEncoder().encode(
          `${SIGNING_MESSAGE}${accountAddress}${tenantId}${timestamp.toString()}`,
        );
        const signedBuffer = await signMessageParams.signMessage(messageBuffer);
        const signature = signedBuffer.toString();
        return signature;
      }
      case 'NEAR': {
        const { authenticationKey, accountAddress, tenantId } = this
          ._configuration as NotifiConfigWithPublicKeyAndAddress;

        const message = `${
          `ed25519:` + authenticationKey
        }${tenantId}${accountAddress}${timestamp.toString()}`;
        const textAsBuffer = new TextEncoder().encode(message);
        const hashBuffer = await window.crypto.subtle.digest(
          'SHA-256',
          textAsBuffer,
        );
        const messageBuffer = new Uint8Array(hashBuffer);

        const signedBuffer = await signMessageParams.signMessage(messageBuffer);
        const signature = Buffer.from(signedBuffer).toString('base64');
        return signature;
      }
      default:
        // Need implementation for other blockchains
        return 'Chain not yet supported';
    }
  }

  /**
   * Handles the result of a login attempt.
   *
   * @async
   * @private
   * @param {Types.UserFragmentFragment | undefined} user - The user object returned from the login attempt.
   * @returns {Promise<void>} - Resolves when authorization and roles have been saved to storage.
   */
  private async _handleLogInResult(
    user: Types.UserFragmentFragment | undefined,
  ): Promise<void> {
    const authorization = user?.authorization;
    const saveAuthorizationPromise =
      authorization !== undefined
        ? this._storage.setAuthorization(authorization)
        : Promise.resolve();

    const roles = user?.roles;
    const saveRolesPromise =
      roles !== undefined
        ? this._storage.setRoles(roles.filter(notNullOrEmpty))
        : Promise.resolve();

    await Promise.all([saveAuthorizationPromise, saveRolesPromise]);
  }

  async fetchData(): Promise<Types.FetchDataQuery> {
    return this._service.fetchData({});
  }

  /**
   * Begins the login process via a transaction.
   * @async
   * @param {Object} props - The properties object.
   * @param {string} props.walletBlockchain - The blockchain of the wallet.
   * @param {string} props.walletAddress - The address of the wallet.
   * @returns {Promise<Object>} - The result object containing the nonce.
   * @throws {Error} - If the login process fails.
   */
  async beginLoginViaTransaction({
    walletBlockchain,
    walletAddress,
  }: BeginLoginProps): Promise<Types.BeginLogInByTransactionResult> {
    const { tenantId } = this._configuration;

    const result = await this._service.beginLogInByTransaction({
      walletAddress: walletAddress,
      walletBlockchain: walletBlockchain,
      dappAddress: tenantId,
    });

    const nonce = result.beginLogInByTransaction.nonce;

    if (nonce === null) {
      throw new Error('Failed to begin login process');
    }

    const ruuid = crypto.randomUUID();
    this._clientRandomUuid = ruuid;
    const encoder = new TextEncoder();
    const data = encoder.encode(nonce + ruuid);

    const hashBuffer = await crypto.subtle.digest('SHA-256', data);

    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const logValue =
      'Notifi Auth: 0x' +
      hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    return { nonce: logValue };
  }

  /**
   * Completes login via transaction.
   * @async
   * @param {CompleteLoginProps} props - Object containing walletBlockchain, walletAddress, and transactionSignature.
   * @returns {Promise<Types.CompleteLogInByTransactionMutation>} - Promise that resolves to the result of the completeLogInByTransaction mutation.
   * @throws {Error} - If BeginLoginViaTransaction is not called first.
   */
  async completeLoginViaTransaction({
    walletBlockchain,
    walletAddress,
    transactionSignature,
  }: CompleteLoginProps): Promise<Types.CompleteLogInByTransactionMutation> {
    const { tenantId } = this._configuration;
    const clientRandomUuid = this._clientRandomUuid;

    this._clientRandomUuid = null;

    if (clientRandomUuid === null) {
      throw new Error(
        'BeginLoginViaTransaction is required to be called first',
      );
    }

    const result = await this._service.completeLogInByTransaction({
      walletAddress: walletAddress,
      walletBlockchain: walletBlockchain,
      dappAddress: tenantId,
      randomUuid: clientRandomUuid,
      transactionSignature,
    });

    await this._handleLogInResult(result.completeLogInByTransaction);

    return result;
  }

  async getTargetGroups(): Promise<
    ReadonlyArray<Types.TargetGroupFragmentFragment>
  > {
    const query = await this._service.getTargetGroups({});
    const results = query.targetGroup?.filter(notNullOrEmpty) ?? [];
    return results;
  }

  /**
   * Ensures the existence of a target group with the given parameters. If a target group with the same name already exists, it will be updated with the new parameters. Otherwise, a new target group will be created.
   * @async
   * @param {Object} params - The parameters for the target group. Required parameter: name. Optional parameters: emailAddress, phoneNumber, telegramId, webhook, discordId.
   * @param {string} params.name - The name of the target group.
   * @param {string} [params.emailAddress] - The email address associated with the target group.
   * @param {string} [params.phoneNumber] - The phone number associated with the target group.
   * @param {string} [params.telegramId] - The Telegram ID associated with the target group.
   * @param {Object} [params.webhook] - The webhook associated with the target group. See EnsureWebhookParams type for details.
   * @param {string} [params.discordId] - The Discord ID associated with the target group.
   * @returns {Promise<Types.TargetGroupFragmentFragment>} The target group object.
   */
  async ensureTargetGroup({
    name,
    emailAddress,
    phoneNumber,
    telegramId,
    webhook,
    discordId,
  }: Readonly<{
    name: string;
    emailAddress?: string;
    phoneNumber?: string;
    telegramId?: string;
    webhook?: EnsureWebhookParams;
    discordId?: string;
  }>): Promise<Types.TargetGroupFragmentFragment> {
    const [
      targetGroupsQuery,
      emailTargetId,
      smsTargetId,
      telegramTargetId,
      webhookTargetId,
      discordTargetId,
    ] = await Promise.all([
      this._service.getTargetGroups({}),
      ensureEmail(this._service, emailAddress),
      ensureSms(this._service, phoneNumber),
      ensureTelegram(this._service, telegramId),
      ensureWebhook(this._service, webhook),
      ensureDiscord(this._service, discordId),
    ]);

    const emailTargetIds = emailTargetId === undefined ? [] : [emailTargetId];
    const smsTargetIds = smsTargetId === undefined ? [] : [smsTargetId];
    const telegramTargetIds =
      telegramTargetId === undefined ? [] : [telegramTargetId];
    const webhookTargetIds =
      webhookTargetId === undefined ? [] : [webhookTargetId];
    const discordTargetIds =
      discordTargetId === undefined ? [] : [discordTargetId];

    const existing = targetGroupsQuery.targetGroup?.find(
      (it) => it?.name === name,
    );
    if (existing !== undefined) {
      return this._updateTargetGroup({
        existing,
        emailTargetIds,
        smsTargetIds,
        telegramTargetIds,
        webhookTargetIds,
        discordTargetIds,
      });
    }

    const createMutation = await this._service.createTargetGroup({
      name,
      emailTargetIds,
      smsTargetIds,
      telegramTargetIds,
      webhookTargetIds,
      discordTargetIds,
    });

    if (createMutation.createTargetGroup === undefined) {
      throw new Error('Failed to create target group');
    }

    return createMutation.createTargetGroup;
  }

  /**
   * Updates a target group with new email, SMS, Telegram, webhook, and Discord targets.
   * @async
   * @private
   * @param {Object} options - The options object.
   * @param {Types.TargetGroupFragmentFragment} options.existing - The existing target group to update.
   * @param {Array<string>} options.emailTargetIds - The new email target IDs to add to the target group.
   * @param {Array<string>} options.smsTargetIds - The new SMS target IDs to add to the target group.
   * @param {Array<string>} options.telegramTargetIds - The new Telegram target IDs to add to the target group.
   * @param {Array<string>} options.webhookTargetIds - The new webhook target IDs to add to the target group.
   * @param {Array<string>} options.discordTargetIds - The new Discord target IDs to add to the target group.
   * @returns {Promise<Types.TargetGroupFragmentFragment>} The updated target group.
   */
  private async _updateTargetGroup({
    existing,
    emailTargetIds,
    smsTargetIds,
    telegramTargetIds,
    webhookTargetIds,
    discordTargetIds,
  }: Readonly<{
    existing: Types.TargetGroupFragmentFragment;
    emailTargetIds: Array<string>;
    smsTargetIds: Array<string>;
    telegramTargetIds: Array<string>;
    webhookTargetIds: Array<string>;
    discordTargetIds: Array<string>;
  }>): Promise<Types.TargetGroupFragmentFragment> {
    if (
      areIdsEqual(emailTargetIds, existing.emailTargets ?? []) &&
      areIdsEqual(smsTargetIds, existing.smsTargets ?? []) &&
      areIdsEqual(telegramTargetIds, existing.telegramTargets ?? []) &&
      areIdsEqual(webhookTargetIds, existing.webhookTargets ?? []) &&
      areIdsEqual(discordTargetIds, existing.discordTargets ?? [])
    ) {
      return existing;
    }

    const updateMutation = await this._service.updateTargetGroup({
      id: existing.id,
      name: existing.name ?? existing.id,
      emailTargetIds,
      smsTargetIds,
      telegramTargetIds,
      webhookTargetIds,
      discordTargetIds,
    });

    const updated = updateMutation.updateTargetGroup;
    if (updated === undefined) {
      throw new Error('Failed to update target group');
    }

    return updated;
  }

  async getSourceGroups(): Promise<
    ReadonlyArray<Types.SourceGroupFragmentFragment>
  > {
    const query = await this._service.getSourceGroups({});
    const results = query.sourceGroup?.filter(notNullOrEmpty) ?? [];
    return results;
  }

  async getAlerts(): Promise<ReadonlyArray<Types.AlertFragmentFragment>> {
    const query = await this._service.getAlerts({});
    return query.alert?.filter(notNullOrEmpty) ?? [];
  }

  async ensureAlert({
    eventType,
    inputs,
  }: Readonly<{
    eventType: EventTypeItem;
    inputs: Record<string, unknown>;
  }>): Promise<Types.AlertFragmentFragment> {
    const [alertsQuery, targetGroupsQuery, sourceAndFilters] =
      await Promise.all([
        this._service.getAlerts({}),
        this._service.getTargetGroups({}),
        ensureSourceAndFilters(this._service, eventType, inputs),
      ]);

    const targetGroup = targetGroupsQuery.targetGroup?.find(
      (it) => it?.name === 'Default',
    );
    if (targetGroup === undefined) {
      throw new Error('Default target group does not exist');
    }

    const { sourceGroup, filter, filterOptions } = sourceAndFilters;
    const packedOptions = packFilterOptions(filterOptions);

    const existing = alertsQuery.alert?.find(
      (it) => it !== undefined && it.name === eventType.name,
    );

    if (existing !== undefined) {
      if (
        existing.sourceGroup.id === sourceGroup.id &&
        existing.targetGroup.id === targetGroup.id &&
        existing.filter.id === filter.id &&
        existing.filterOptions === packedOptions
      ) {
        return existing;
      }

      // Alerts are immutable, delete the existing instead
      await this.deleteAlert({
        id: existing.id,
      });
    }

    const mutation = await this._service.createAlert({
      name: eventType.name,
      sourceGroupId: sourceGroup.id,
      filterId: filter.id,
      targetGroupId: targetGroup.id,
      filterOptions: packedOptions,
      groupName: 'managed',
    });

    const created = mutation.createAlert;
    if (created === undefined) {
      throw new Error('Failed to create alert');
    }

    return created;
  }

  /**
   * Deletes an alert with the given ID.
   * @async
   * @param {Object} options - The options object.
   * @param {string} options.id - The ID of the alert to delete.
   * @throws {Error} If the alert deletion fails.
   * @returns {Promise<void>}
   */
  async deleteAlert({
    id,
  }: Readonly<{
    id: string;
  }>): Promise<void> {
    const mutation = await this._service.deleteAlert({ id });
    const result = mutation.deleteAlert?.id;
    if (result === undefined) {
      throw new Error('Failed to delete alert');
    }
  }

  /**
   * Updates user wallets and returns the result of ensuring source and filters for the wallet balance event type item.
   * @async
   * @returns {Promise<any>} The result of ensuring source and filters for the wallet balance event type item.
   */
  async updateWallets() {
    const walletEventTypeItem: WalletBalanceEventTypeItem = {
      name: 'User Wallets',
      type: 'walletBalance',
    };
    const result = await ensureSourceAndFilters(
      this._service,
      walletEventTypeItem,
      {},
    );
    return result;
  }

  /**
   * Retrieves the notification history based on the provided query variables.
   * @async
   * @param {Types.GetNotificationHistoryQueryVariables} variables - The query variables for retrieving the notification history.
   * @returns {Promise<{
   * pageInfo: Types.PageInfoFragmentFragment;
   * nodes: ReadonlyArray<Types.NotificationHistoryEntryFragmentFragment>;
   * }>} - A Promise that resolves to an object containing the pageInfo and nodes of the notification history.
   * @throws {Error} - If the notification history retrieval fails.
   */
  async getNotificationHistory(
    variables: Types.GetNotificationHistoryQueryVariables,
  ): Promise<
    Readonly<{
      pageInfo: Types.PageInfoFragmentFragment;
      nodes: ReadonlyArray<Types.NotificationHistoryEntryFragmentFragment>;
    }>
  > {
    const query = await this._service.getNotificationHistory(variables);
    const nodes = query.notificationHistory?.nodes;
    const pageInfo = query.notificationHistory?.pageInfo;
    if (nodes === undefined || pageInfo === undefined) {
      throw new Error('Failed to fetch notification history');
    }

    return { pageInfo, nodes };
  }

  /**
   * Fetches a subscription card based on the provided parameters.
   * @async
   * @function
   * @param {FindSubscriptionCardParams} variables - The parameters used to find the subscription card.
   * @returns {Promise<CardConfigType>} - The fetched subscription card.
   * @throws {Error} - If the tenant config is not found, the config data is invalid, or the config format is unsupported.
   */
  async fetchSubscriptionCard(
    variables: FindSubscriptionCardParams,
  ): Promise<CardConfigType> {
    const query = await this._service.findTenantConfig({
      input: {
        ...variables,
        tenant: this._configuration.tenantId,
      },
    });
    const result = query.findTenantConfig;
    if (result === undefined) {
      throw new Error('Failed to find tenant config');
    }

    const value = result.dataJson;
    if (value === undefined) {
      throw new Error('Invalid config data');
    }

    const obj = JSON.parse(value);
    let card: CardConfigType | undefined = undefined;
    switch (obj.version) {
      case 'v1': {
        card = obj as CardConfigItemV1;
        break;
      }
      case 'IntercomV1': {
        card = obj as IntercomCardConfigItemV1;
      }
    }

    if (card === undefined) {
      throw new Error('Unsupported config format');
    }

    return card;
  }

  /**
   * Copies the authorization and roles from the current storage to another storage instance based on the provided configuration.
   *
   * @async
   * @param {NotifiFrontendConfiguration} config - The configuration object for the storage driver.
   * @returns {Promise<void>} - A Promise that resolves when the authorization and roles have been successfully copied to the other storage instance.
   */
  async copyAuthorization(config: NotifiFrontendConfiguration) {
    const auth = await this._storage.getAuthorization();
    const roles = await this._storage.getRoles();

    const driver =
      config.storageOption?.driverType === 'InMemory'
        ? createInMemoryStorageDriver(config)
        : createLocalForageStorageDriver(config);
    const otherStorage = new NotifiFrontendStorage(driver);

    await Promise.all([
      otherStorage.setAuthorization(auth),
      otherStorage.setRoles(roles),
    ]);
  }
  /**
   * Sends an email verification request for a given target ID.
   * @async
   * @param {Object} options - The options object.
   * @param {string} options.targetId - The ID of the target to send the verification request to.
   * @returns {Promise<string>} - The ID of the verification request.
   */
  async sendEmailTargetVerification({
    targetId,
  }: Readonly<{ targetId: string }>): Promise<string> {
    const emailTarget = await this._service.sendEmailTargetVerificationRequest({
      targetId,
    });

    const id = emailTarget.sendEmailTargetVerificationRequest?.id;
    if (id === undefined) {
      throw new Error(`Unknown error requesting verification`);
    }
    return id;
  }

  /**
   * Subscribes to a wallet using the provided ConnectWalletParams object.
   * @async
   * @param {ConnectWalletParams} params - The parameters needed to connect to the wallet.
   * @returns {Promise<Types.ConnectWalletMutation>} - A Promise that resolves with the connected wallet.
   */
  async subscribeWallet(
    params: ConnectWalletParams,
  ): Promise<Types.ConnectWalletMutation> {
    const { walletBlockchain, signMessage, walletPublicKey } =
      params.walletParams;
    const signMessageParams = {
      walletBlockchain,
      signMessage,
    } as SignMessageParams;

    if (this._userState && this._userState.status === 'authenticated') {
      await this.logIn(signMessageParams);
    }
    const timestamp = Math.round(Date.now() / 1000);
    const signature = await this._signMessage({
      signMessageParams,
      timestamp,
    });
    const connectedWallet = await this._service.connectWallet({
      walletBlockchain,
      walletPublicKey,
      accountId:
        walletBlockchain === 'APTOS' ||
        walletBlockchain === 'ACALA' ||
        walletBlockchain === 'NEAR' ||
        walletBlockchain === 'SUI'
          ? params.walletParams.accountAddress
          : undefined,
      signature,
      timestamp,
      connectWalletConflictResolutionTechnique:
        params.connectWalletConflictResolutionTechnique,
    });
    return connectedWallet;
  }

  async getConversationMessages(
    input: Types.GetConversationMessagesQueryVariables,
  ): Promise<Types.GetConversationMessagesQuery> {
    const query = await this._service.getConversationMessages(input);
    return query;
  }

  async sendConversationMessages(
    input: Types.SendConversationMessageMutationVariables,
  ): Promise<Types.SendConversationMessageMutation> {
    const mutation = await this._service.sendConversationMessages(input);
    return mutation;
  }

  async createSupportConversation(
    input: Types.CreateSupportConversationMutationVariables,
  ): Promise<Types.CreateSupportConversationMutation> {
    const mutation = await this._service.createSupportConversation(input);
    return mutation;
  }
}
