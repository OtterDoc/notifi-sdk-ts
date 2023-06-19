import { Types } from '@notifi-network/notifi-graphql';

import {
  Alert,
  ClientConfiguration,
  ConnectedWallet,
  NotificationHistory,
  SourceGroup,
  TargetGroup,
  TenantConfig,
  User,
  UserTopic,
} from './models';
import {
  ConversationMessages,
  ConversationMessagesEntry,
} from './models/ConversationMessages';
import { SupportConversation } from './models/SupportConversation';
import {
  ConnectWalletInput,
  CreateSourceInput,
  CreateWebhookTargetInput,
  FindTenantConfigInput,
  GetConversationMessagesFullInput,
  GetNotificationHistoryInput,
  SendConversationMessageInput,
} from './operations';

/**
 * Represents the data of a client.
 * @typedef {Object} ClientData
 * @property {ReadonlyArray<Alert>} alerts - An array of alerts.
 * @property {ReadonlyArray<Types.ConnectedWalletFragmentFragment>} connectedWallets - An array of connected wallets.
 * @property {ReadonlyArray<Types.EmailTargetFragmentFragment>} emailTargets - An array of email targets.
 * @property {ReadonlyArray<Types.FilterFragmentFragment>} filters - An array of filters.
 * @property {ReadonlyArray<Types.SmsTargetFragmentFragment>} smsTargets - An array of SMS targets.
 * @property {ReadonlyArray<Types.SourceFragmentFragment>} sources - An array of sources.
 * @property {ReadonlyArray<Types.SourceGroupFragmentFragment>} sourceGroups - An array of source groups.
 * @property {ReadonlyArray<Types.TargetGroupFragmentFragment>} targetGroups - An array of target groups.
 * @property {ReadonlyArray<Types.TelegramTargetFragmentFragment>} telegramTargets - An array of Telegram targets.
 * @property {ReadonlyArray<Types.DiscordTargetFragmentFragment>} discordTargets - An array of Discord targets.
 */
export type ClientData = Readonly<{
  alerts: ReadonlyArray<Alert>;
  connectedWallets: ReadonlyArray<Types.ConnectedWalletFragmentFragment>;
  emailTargets: ReadonlyArray<Types.EmailTargetFragmentFragment>;
  filters: ReadonlyArray<Types.FilterFragmentFragment>;
  smsTargets: ReadonlyArray<Types.SmsTargetFragmentFragment>;
  sources: ReadonlyArray<Types.SourceFragmentFragment>;
  sourceGroups: ReadonlyArray<Types.SourceGroupFragmentFragment>;
  targetGroups: ReadonlyArray<Types.TargetGroupFragmentFragment>;
  telegramTargets: ReadonlyArray<Types.TelegramTargetFragmentFragment>;
  discordTargets: ReadonlyArray<Types.DiscordTargetFragmentFragment>;
}>;

export type AlertFrequency =
  | 'ALWAYS'
  | 'SINGLE'
  | 'QUARTER_HOUR'
  | 'HOURLY'
  | 'DAILY'
  | 'THREE_MINUTES';

export type ThresholdDirection = 'above' | 'below';

export type ValueItemConfig = Readonly<{
  key: string;
  op: 'lt' | 'lte' | 'eq' | 'gt' | 'gte';
  value: string;
}>;

/**
 * Defines the options for filtering alerts.
 * @typedef {Object} FilterOptions
 * @property {AlertFrequency} [alertFrequency] - The frequency of alerts.
 * @property {string} [directMessageType] - The type of direct message.
 * @property {number} [threshold] - The threshold value for the alert.
 * @property {string} [delayProcessingUntil] - The time to delay processing until.
 * @property {ThresholdDirection} [thresholdDirection] - The direction of the threshold.
 * @property {Object} [values] - The values to filter by.
 * @property {Array<ValueItemConfig>} [values.and] - The values to filter by using the AND operator.
 * @property {Array<ValueItemConfig>} [values.or] - The values to filter by using the OR operator.
 * @property {string} [tradingPair] - The trading pair to filter by.
 */
export type FilterOptions = Partial<{
  alertFrequency: AlertFrequency;
  directMessageType: string;
  threshold: number;
  delayProcessingUntil: string;
  thresholdDirection: ThresholdDirection;
  values: Readonly<
    | { and: ReadonlyArray<ValueItemConfig> }
    | { or: ReadonlyArray<ValueItemConfig> }
  >;
  tradingPair: string;
}>;

/**
 * Object containing information to continue the login process
 *
 * @property nonce - String value to place in transaction logs
 */
export type BeginLoginViaTransactionResult = Readonly<{
  logValue: string;
}>;

/**
 * Object containing information to complete the login process
 *
 * @property transactionSignature - Signature of the transaction that contains the log message
 */
export type CompleteLoginViaTransactionInput = Readonly<{
  transactionSignature: string;
}>;

/**
 * Completed authentication response
 *
 */
export type CompleteLoginViaTransactionResult = Readonly<User>;

/**
 * Input param for updating an Alert
 *
 * @remarks
 * This describes the Alert to be updated based on id, emailAddress, phoneNumber and/or telegramId
 *
 * @property alertId - The alert to modify
 * @property emailAddress - The emailAddress to be used
 * @property phoneNumber - The phone number to be used
 * @property telegramId - The Telegram account username to be used
 * <br>
 * <br>
 * See [Alert Creation Guide]{@link https://notifi-network.github.io/notifi-sdk-ts/} for more information on creating Alerts
 */
export type ClientUpdateAlertInput = Readonly<{
  alertId: string;
  emailAddress: string | undefined;
  phoneNumber: string | undefined;
  telegramId: string | undefined;
  webhook?: ClientCreateWebhookParams;
  discordId: string | undefined;
}>;

/**
 * Input param for creating an Alert
 *
 * @remarks
 * This describes the Alert to be created based on name, sourceId, filterId, filterOptions, emailAddress, phoneNumber, telegramId, groupName, targetGroupName, webhook, sourceIds, sourceGroupName and discordId.
 *
 * @property name - Friendly name (must be unique)
 * @property sourceId - The SourceGroup to associate
 * @property filterId - The Filter to associate
 * @property filterOptions - The filter options to be used
 * @property emailAddress - The emailAddress to be used
 * @property phoneNumber - The phone number to be used
 * @property telegramId - The Telegram account username to be used
 * @property groupName - The group name to be used
 * @property targetGroupName - The target group name to be used
 * @property webhook - The webhook params to be used
 * @property sourceIds - The source ids to be used
 * @property sourceGroupName - The source group name to be used
 * @property discordId - The discord id to be used
 *
 * @see [Alert Creation Guide]{@link https://notifi-network.github.io/notifi-sdk-ts/} for more information on creating Alerts
 */
export type ClientCreateAlertInput = Readonly<{
  name: string;
  sourceId: string;
  filterId: string;
  filterOptions?: Readonly<FilterOptions>;
  emailAddress: string | undefined;
  phoneNumber: string | undefined;
  telegramId: string | undefined;
  groupName?: string;
  targetGroupName?: string;
  webhook?: ClientCreateWebhookParams;
  sourceIds?: ReadonlyArray<string>;
  sourceGroupName?: string;
  discordId: string | undefined;
}>;

export type ClientCreateWebhookParams = Omit<CreateWebhookTargetInput, 'name'>;

/**
 * Input param for creating a new Metaplex Auction Source
 *
 * @property auctionAddressBase58 - Metaplex auction address in base58
 * @property auctionWebUrl - Web URL where auction can be found
 *
 *
 * See [Alert Creation Guide]{@link https://notifi-network.github.io/notifi-sdk-ts/} for more information on creating Alerts
 */
export type ClientCreateMetaplexAuctionSourceInput = Readonly<{
  auctionAddressBase58: string;
  auctionWebUrl: string;
}>;

/**
 * Input param for creating a new Bonfida Auction Source
 *
 * @property auctionAddressBase58 - Bonfida auction address in base58
 * @property auctionName - Name of the auction
 *
 *
 * See [Alert Creation Guide]{@link https://notifi-network.github.io/notifi-sdk-ts/} for more information on creating Alerts
 */
export type ClientCreateBonfidaAuctionSourceInput = Readonly<{
  auctionAddressBase58: string;
  auctionName: string;
}>;

/**
 * Input param for deleting an Alert
 *
 * @property alertId - The ID of the Alert to delete
 * @property keepTargetGroup - Whether to keep the target group on this Alert or to delete it
 * @property keepSourceGroup - Whether to keep the source group on this Alert or to delete it
 *
 * See [Alert Creation Guide]{@link https://notifi-network.github.io/notifi-sdk-ts/} for more information on creating Alerts
 */
export type ClientDeleteAlertInput = Readonly<{
  alertId: string;
  keepTargetGroup?: boolean;
  keepSourceGroup?: boolean;
}>;

/**
 * Input params for creating or updating a TargetGroup by name
 *
 * @property name - The name of the TargetGroup
 * @property emailAddress - The emailAddress to be used
 * @property phoneNumber - The phone number to be used
 * @property telegramId - The Telegram account username to be used
 * <br>
 * <br>
 */
export type ClientEnsureTargetGroupInput = Readonly<{
  name: string;
  emailAddress: string | undefined;
  phoneNumber: string | undefined;
  telegramId: string | undefined;
  webhook?: ClientCreateWebhookParams;
  discordId: string | undefined;
}>;

/**
 * Input params for creating or updating a SourceGroup by name
 *
 * @property name - The name of the SourceGroup
 * @property sources - The Sources to be set on the SourceGroup
 */
export type ClientEnsureSourceGroupInput = Readonly<{
  name: string;
  sources: ReadonlyArray<CreateSourceInput>;
}>;

/**
 * Input params for the send verification request
 *
 * @property targetId -- the id of the EmailTarget
 */
export type ClientSendVerificationEmailInput = Readonly<{
  targetId: string;
}>;

export type ClientBroadcastMessageInput = Readonly<{
  topic: UserTopic;
  subject: string;
  message: string;
  isHolderOnly: boolean;
  variables?: Readonly<Record<string, string>>;
}>;

export type ClientFetchSubscriptionCardInput = Omit<
  FindTenantConfigInput,
  'tenant'
>;

// TODO: Dedupe from FrontendClient
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

/**
 * Defines the parameters for a wallet, including the blockchain type and associated public key and/or account address.
 * @typedef {Object} WalletParams
 * @property {('SOLANA'|'ETHEREUM'|'POLYGON'|'ARBITRUM'|'AVALANCHE'|'BINANCE'|'OPTIMISM'|'APTOS'|'ACALA'|'NEAR'|'SUI'|'INJECTIVE')} walletBlockchain - The type of blockchain associated with the wallet.
 * @property {string} walletPublicKey - The public key associated with the wallet.
 * @property {string} accountAddress - The account address associated with the wallet.
 */
export type WalletParams =
  | Readonly<{
      walletBlockchain: 'SOLANA';
      walletPublicKey: string;
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
    }>
  | Readonly<{
      walletBlockchain: 'APTOS';
      accountAddress: string;
      walletPublicKey: string;
    }>
  | Readonly<{
      walletBlockchain: 'ACALA';
      accountAddress: string;
      walletPublicKey: string;
    }>
  | Readonly<{
      walletBlockchain: 'NEAR';
      accountAddress: string;
      walletPublicKey: string;
    }>
  | Readonly<{
      walletBlockchain: 'SUI';
      accountAddress: string;
      walletPublicKey: string;
    }>
  | Readonly<{
      walletBlockchain: 'INJECTIVE';
      accountAddress: string;
      walletPublicKey: string;
    }>;

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

export type WalletWithSignParams = Readonly<{
  displayName?: string;
}> &
  WalletWithSignMessage;

export type ConnectWalletParams = Readonly<{
  walletParams: WalletWithSignParams;
  connectWalletConflictResolutionTechnique: ConnectWalletInput['connectWalletConflictResolutionTechnique'];
}>;

/**
 * Type alias for the NotifiClient object, which represents a client for interacting with the Notifi API.
 * @readonly
 * @property {() => Promise<BeginLoginViaTransactionResult>} beginLoginViaTransaction - A function that begins the login process via transaction.
 * @property {(input: ClientBroadcastMessageInput, signer: SignMessageParams) => Promise<string | null>} broadcastMessage - A function that broadcasts a message using the provided input and signer.
 * @property {(input: CompleteLoginViaTransactionInput) => Promise<CompleteLoginViaTransactionResult>} completeLoginViaTransaction - A function that completes the login process via transaction.
 * @property {(forceFetch?: boolean) => Promise<ClientData>} fetchData - A function that fetches client data, optionally forcing a fetch.
 * @property {(signer: SignMessageParams) => Promise<User>} logIn - A function that logs in a user using the provided signer.
 * @property {() => Promise<void>} logOut - A function that logs out the current user.
 * @property {(input: ConnectWalletParams) => Promise<ConnectedWallet>} connectWallet - A function that connects a wallet using the provided input.
 * @property {(input: ClientCreateAlertInput) => Promise<Alert>} createAlert - A function that creates an alert using the provided input.
 * @property {(input: Types.CreateSourceInput) => Promise<Types.SourceFragmentFragment>} createSource - A function that creates a source using the provided input.
 * @property {() => Promise<SupportConversation>} createSupportConversation - A function that creates a support conversation.
 * @property {(input: ClientCreateMetaplexAuctionSourceInput) => Promise<Types.SourceFragmentFragment>} createMetaplexAuctionSource - A function that creates a Metaplex auction source using the provided input.
 * @property {(input: ClientCreateBonfidaAuctionSourceInput) => Promise<Types.SourceFragmentFragment>} createBonfidaAuctionSource - A function that creates a Bonfida auction source using the provided input.
 * @property {(input: ClientDeleteAlertInput) => Promise<string>} deleteAlert - A function that deletes an alert using the provided input.
 * @property {() => Promise<ClientConfiguration>} getConfiguration - A function that gets the client configuration.
 * @property {(input: GetNotificationHistoryInput) => Promise<NotificationHistory>} getNotificationHistory - A function that gets the notification history using the provided input.
 * @property {() => Promise<ReadonlyArray<UserTopic>>} getTopics - A function that gets the user topics.
 * @property {(input: ClientUpdateAlertInput) => Promise<Alert>} updateAlert - A function that updates an alert using the provided input.
 * @property {(input: ClientEnsureTargetGroupInput) => Promise<TargetGroup>} ensureTargetGroup - A function that ensures a target group using the provided input.
 * @property {(input: ClientEnsureSourceGroupInput) => Promise<SourceGroup>} ensureSourceGroup - A function that ensures a source group using the provided input.
 * @property {(input: SendConversationMessageInput) => Promise<ConversationMessagesEntry>} sendConversationMessages - A function that sends conversation messages using the provided input.
 * @property {(input: ClientSendVerificationEmailInput) => Promise<string>} sendEmailTargetVerification - A function that sends a verification email to a target using the provided input.
 * @property {(input: ClientFetchSubscriptionCardInput) => Promise<TenantConfig>} fetchSubscriptionCard - A function that fetches a subscription card using the provided input.
 * @property {(input: GetConversationMessagesFullInput) => Promise<ConversationMessages>} getConversationMessages - A function that gets the conversation messages using the provided input.
 * @property {(input: string) => Promise<string | undefined>} createDiscordTarget - A function that creates a Discord target using the provided input.
 */
export type NotifiClient = Readonly<{
  beginLoginViaTransaction: () => Promise<BeginLoginViaTransactionResult>;
  broadcastMessage: (
    input: ClientBroadcastMessageInput,
    signer: SignMessageParams,
  ) => Promise<string | null>;
  completeLoginViaTransaction: (
    input: CompleteLoginViaTransactionInput,
  ) => Promise<CompleteLoginViaTransactionResult>;
  fetchData: (forceFetch?: boolean) => Promise<ClientData>;
  logIn: (signer: SignMessageParams) => Promise<User>;
  logOut: () => Promise<void>;
  connectWallet: (input: ConnectWalletParams) => Promise<ConnectedWallet>;
  createAlert: (input: ClientCreateAlertInput) => Promise<Alert>;
  createSource: (
    input: Types.CreateSourceInput,
  ) => Promise<Types.SourceFragmentFragment>;
  createSupportConversation: () => Promise<SupportConversation>;
  createMetaplexAuctionSource: (
    input: ClientCreateMetaplexAuctionSourceInput,
  ) => Promise<Types.SourceFragmentFragment>;
  createBonfidaAuctionSource: (
    input: ClientCreateBonfidaAuctionSourceInput,
  ) => Promise<Types.SourceFragmentFragment>;
  deleteAlert: (input: ClientDeleteAlertInput) => Promise<string>;
  getConfiguration: () => Promise<ClientConfiguration>;
  getNotificationHistory: (
    input: GetNotificationHistoryInput,
  ) => Promise<NotificationHistory>;
  getTopics: () => Promise<ReadonlyArray<UserTopic>>;
  updateAlert: (input: ClientUpdateAlertInput) => Promise<Alert>;
  ensureTargetGroup: (
    input: ClientEnsureTargetGroupInput,
  ) => Promise<TargetGroup>;
  ensureSourceGroup: (
    input: ClientEnsureSourceGroupInput,
  ) => Promise<SourceGroup>;
  sendConversationMessages: (
    input: SendConversationMessageInput,
  ) => Promise<ConversationMessagesEntry>;
  sendEmailTargetVerification: (
    input: ClientSendVerificationEmailInput,
  ) => Promise<string>;
  fetchSubscriptionCard: (
    input: ClientFetchSubscriptionCardInput,
  ) => Promise<TenantConfig>;
  getConversationMessages: (
    input: GetConversationMessagesFullInput,
  ) => Promise<ConversationMessages>;
  createDiscordTarget: (input: string) => Promise<string | undefined>;
}>;
