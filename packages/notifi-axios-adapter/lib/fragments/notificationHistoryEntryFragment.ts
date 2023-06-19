/**
 * Enum representing the different types of notifications.
 * @enum {string}
 * @readonly
 * @property {string} ACCOUNT_BALANCE_CHANGED - Account balance changed event details.
 * @property {string} BROADCAST_MESSAGE - Broadcast message event details.
 * @property {string} DIRECT_TENANT_MESSAGE - Direct tenant message event details.
 * @property {string} NFT_COLLECTION_REPORT - NFT collections report event details.
 * @property {string} CHAT_MESSAGE_RECEIVED - Chat message received event details.
 * @property {string} DAO_PROPOSAL_CHANGED - DAO proposal changed event details.
 * @property {string} NFT_AUCTION_CHANGED - NFT auction changed event details.
 * @property {string} WALLETS_ACTIVITY_CHANGED - Wallets activity changed event details.
 * @property {string} HEALTH_VALUE_OVER_THRESHOLD - Health value over threshold event details.
 * @property {string} GENERIC_EVENT - Generic event details.
 */
export enum NotificationTypeName {
  ACCOUNT_BALANCE_CHANGED = 'AccountBalanceChangedEventDetails',
  BROADCAST_MESSAGE = 'BroadcastMessageEventDetails',
  DIRECT_TENANT_MESSAGE = 'DirectTenantMessageEventDetails',
  NFT_COLLECTION_REPORT = 'NftCollectionsReportEventDetails',
  CHAT_MESSAGE_RECEIVED = 'ChatMessageReceivedEventDetails',
  DAO_PROPOSAL_CHANGED = 'DaoProposalChangedEventDetails',
  NFT_AUCTION_CHANGED = 'NftAuctionChangedEventDetails',
  WALLETS_ACTIVITY_CHANGED = 'WalletsActivityChangedEventDetails',
  HEALTH_VALUE_OVER_THRESHOLD = 'HealthValueOverThresholdEventDetails',
  GENERIC_EVENT = 'GenericEventDetails',
}

export const notificationHistoryEntryFragment = `
fragment NotificationHistoryEntry on NotificationHistoryEntry {
  id
  createdDate
  eventId
  read
  sourceAddress
  category
  transactionSignature
  targets {
    type
    name
  }
  detail {
    __typename
    ... on AccountBalanceChangedEventDetails {
      walletBlockchain
      direction
      newValue
      previousValue
      tokenSymbol
      isWhaleWatch
    }
    ... on BroadcastMessageEventDetails {
      messageType: type
      subject
      message
    }
    ... on DirectTenantMessageEventDetails {
      tenantName
    }
    ... on NftCollectionsReportEventDetails {
      type
      providerName
      sourceLink
      collections {
        collectionId
        name
        imgUrl
        volume1Day
        volume1DayChange
      }
    }
    ... on ChatMessageReceivedEventDetails {
      senderName
      conversationId
      messageId
      senderId
      senderBlockchain
      senderName
      messageBody
    }
    ... on DAOProposalChangedEventDetails {
      tenantName
      proposalTitle: title
      description
      state
      daoUrl
      proposalUrl
    }
    ... on NftAuctionChangedEventDetails {
      auctionTitle: title
      auctionUrl
      walletBlockchain
      highBidAmount
      highBidSymbol
      imageUrl
    }
    ... on WalletsActivityReportEventDetails {
      providerName
      sourceLink
      walletActivityType: type
      wallets {
        address
        volume1Day
        maxPurchase1Day
        maxPurchaseName
        maxPurchaseImgUrl
        maxPurchaseTokenAddress
      }
    }
    ... on HealthValueOverThresholdEventDetails {
      name
      value
      threshold
      url
    }
    ... on GenericEventDetails {
      sourceName
      notificationTypeName
      genericMessage: message
      action {
        name
        url
      }
      icon
    }
  }
}`.trim();

export const notificationHistoryEntryFragmentDependencies = [];
