import * as Operations from './operations';

/**
 * Type alias for the NotifiService object, which is a combination of various Operations services and a readonly setJwt function.
 * @typedef {Object} NotifiService
 * @property {Operations.BroadcastMessageService} BroadcastMessageService - Service for broadcasting messages.
 * @property {Operations.BeginLogInByTransactionService} BeginLogInByTransactionService - Service for beginning login by transaction.
 * @property {Operations.CompleteLogInByTransactionService} CompleteLogInByTransactionService - Service for completing login by transaction.
 * @property {Operations.ConnectWalletService} ConnectWalletService - Service for connecting a wallet.
 * @property {Operations.CreateAlertService} CreateAlertService - Service for creating an alert.
 * @property {Operations.CreateEmailTargetService} CreateEmailTargetService - Service for creating an email target.
 * @property {Operations.CreateSmsTargetService} CreateSmsTargetService - Service for creating an SMS target.
 * @property {Operations.CreateSourceService} CreateSourceService - Service for creating a source.
 * @property {Operations.CreateSourceGroupService} CreateSourceGroupService - Service for creating a source group.
 * @property {Operations.CreateSupportConversationService} CreateSupportConversationService - Service for creating a support conversation.
 * @property {Operations.CreateTargetGroupService} CreateTargetGroupService - Service for creating a target group.
 * @property {Operations.CreateTelegramTargetService} CreateTelegramTargetService - Service for creating a Telegram target.
 * @property {Operations.CreateWebhookTargetService} CreateWebhookTargetService - Service for creating a webhook target.
 * @property {Operations.DeleteAlertService} DeleteAlertService - Service for deleting an alert.
 * @property {Operations.DeleteSourceGroupService} DeleteSourceGroupService - Service for deleting a source group.
 * @property {Operations.DeleteTargetGroupService} DeleteTargetGroupService - Service for deleting a target group.
 * @property {Operations.FindTenantConfigService} FindTenantConfigService - Service for finding tenant configuration.
 * @property {Operations.GetAlertsService} GetAlertsService - Service for getting alerts.
 * @property {Operations.GetConfigurationForDappService} GetConfigurationForDappService - Service for getting configuration for a Dapp.
 * @property {Operations.GetConnectedWalletsService} GetConnectedWalletsService - Service for getting connected wallets.
 * @property {Operations.GetConversationMessagesService} GetConversationMessagesService - Service for getting conversation messages.
 * @property {Operations.GetEmailTargetsService} GetEmailTargetsService - Service for getting email targets.
 * @property {Operations.GetFiltersService} GetFiltersService - Service for getting filters.
 * @property {Operations.GetNotificationHistoryService} GetNotificationHistoryService - Service for getting notification history.
 * @property {Operations.GetSmsTargetsService} GetSmsTargetsService - Service for getting SMS targets.
 * @property {Operations.GetSourcesService} GetSourcesService - Service for getting sources.
 * @property {Operations.GetSourceGroupsService} GetSourceGroupsService - Service for getting source groups.
 * @property {Operations.GetTargetGroupsService} GetTargetGroupsService - Service for getting target groups.
 * @property {Operations.GetTelegramTargetsService} GetTelegramTargetsService - Service for getting Telegram targets.
 * @property {Operations.GetTopicsService} GetTopicsService - Service for getting topics.
 * @property {Operations.GetWebhookTargetsService} GetWebhookTargetsService - Service for getting webhook targets.
 * @property {Operations.LogInFromDappService} LogInFromDappService - Service for logging in from a Dapp.
 * @property {Operations.RefreshAuthorizationService} RefreshAuthorizationService - Service for refreshing authorization.
 * @property {Operations.SendConversationMessagesService} SendConversationMessagesService - Service for sending conversation messages.
 * @property {Operations.SendEmailTargetVerificationRequestService} SendEmailTargetVerificationRequestService - Service for sending an email target verification request.
 * @property {Operations.UpdateSourceGroupService} UpdateSourceGroupService - Service for updating a source group.
 * @property {Operations.UpdateTargetGroupService} UpdateTargetGroupService - Service for updating a target group.
 * @property {Operations.CreateDiscordTargetService} CreateDiscordTargetService - Service for creating a Discord target.
 * @property {Operations.GetDiscordTargetsService} GetDiscordTargetsService - Service for getting Discord targets.
 * @property {Object} Readonly - Readonly object with a setJwt function that takes a string or null as a parameter.
 * @property {Function} setJwt - Function that sets the JWT token.
 */
export type NotifiService = Operations.BroadcastMessageService &
  Operations.BeginLogInByTransactionService &
  Operations.CompleteLogInByTransactionService &
  Operations.ConnectWalletService &
  Operations.CreateAlertService &
  Operations.CreateEmailTargetService &
  Operations.CreateSmsTargetService &
  Operations.CreateSourceService &
  Operations.CreateSourceGroupService &
  Operations.CreateSupportConversationService &
  Operations.CreateTargetGroupService &
  Operations.CreateTelegramTargetService &
  Operations.CreateWebhookTargetService &
  Operations.DeleteAlertService &
  Operations.DeleteSourceGroupService &
  Operations.DeleteTargetGroupService &
  Operations.FindTenantConfigService &
  Operations.GetAlertsService &
  Operations.GetConfigurationForDappService &
  Operations.GetConnectedWalletsService &
  Operations.GetConversationMessagesService &
  Operations.GetEmailTargetsService &
  Operations.GetFiltersService &
  Operations.GetNotificationHistoryService &
  Operations.GetSmsTargetsService &
  Operations.GetSourcesService &
  Operations.GetSourceGroupsService &
  Operations.GetTargetGroupsService &
  Operations.GetTelegramTargetsService &
  Operations.GetTopicsService &
  Operations.GetWebhookTargetsService &
  Operations.LogInFromDappService &
  Operations.RefreshAuthorizationService &
  Operations.SendConversationMessagesService &
  Operations.SendEmailTargetVerificationRequestService &
  Operations.UpdateSourceGroupService &
  Operations.UpdateTargetGroupService &
  Operations.CreateDiscordTargetService &
  Operations.GetDiscordTargetsService &
  Readonly<{
    setJwt: (jwt: string | null) => void;
  }>;
