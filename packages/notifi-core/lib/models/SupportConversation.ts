import { Participant } from './ConversationMessages';

/**
 * Represents a support conversation.
 * @readonly
 * @property {string} id - The ID of the conversation.
 * @property {string} conversationType - The type of conversation.
 * @property {ConversationGates | undefined} [conversationGates] - The conversation gates.
 * @property {string} name - The name of the conversation.
 * @property {string} createdDate - The date the conversation was created.
 * @property {Array<Participant>} participants - The participants in the conversation.
 * @property {string} backgroundImageUrl - The URL of the background image for the conversation.
 */
export type SupportConversation = Readonly<{
  __typename?: 'SupportConversation';
  id: string;
  conversationType: string;
  conversationGates?: ConversationGates | undefined;
  name: string;
  createdDate: string;
  participants: Array<Participant>;
  backgroundImageUrl: string;
}>;

export type ConversationGates = Readonly<{
  __typename?: 'ConversationGates';
  id: string;
}>;
