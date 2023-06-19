import { Types } from '@notifi-network/notifi-graphql';

export type ConversationMessages = Readonly<{
  nodes?: Array<ConversationMessagesEntry> | undefined;
  pageInfo: {
    hasNextPage: boolean;
    endCursor?: string | undefined;
  };
}>;

export type ConversationMessagesEntry =
  NonNullable<Types.ConversationMessageFragment>;

/**
 * Represents a participant in a conversation.
 * @typedef {Object} Participant
 * @property {Object} profile - The participant's profile information.
 * @property {string} profile.avatarDataType - The type of data for the participant's avatar.
 * @property {string} profile.id - The ID of the participant's profile.
 * @property {string} [profile.avatarData] - The participant's avatar data, if available.
 * @property {string} [profile.preferredAddress] - The participant's preferred address.
 * @property {string} [profile.preferredBlockchain] - The participant's preferred blockchain.
 * @property {string} [profile.preferredName] - The participant's preferred name.
 * @property {string} conversationId - The ID of the conversation the participant is in.
 * @property {string} conversationParticipantType - The type of participant in the conversation.
 * @property {string} [resolvedName] - The resolved name of the participant, if available.
 * @property {string} userId - The ID of the user associated with the participant.
 * @property {string} walletAddress - The wallet address associated with the participant.
 * @property {string} walletBlockchain - The blockchain associated with the participant's wallet.
 */
export type Participant = Readonly<{
  __typename?: 'Participant';
  profile: {
    __typename?: 'Profile';
    avatarData?: string | undefined;
    avatarDataType: string;
    id: string;
    preferredAddress?: string | undefined;
    preferredBlockchain?: string | undefined;
    preferredName?: string | undefined;
  };
  conversationId: string;
  conversationParticipantType: string;
  resolvedName?: string | undefined;
  userId: string;
  walletAddress: string;
  walletBlockchain: string;
}>;
