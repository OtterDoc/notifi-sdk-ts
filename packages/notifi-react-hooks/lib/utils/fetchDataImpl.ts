import {
  Alert,
  ConnectedWallet,
  DiscordTarget,
  EmailTarget,
  GetAlertsService,
  GetConnectedWalletsService,
  GetDiscordTargetsService,
  GetEmailTargetsService,
  GetSmsTargetsService,
  GetSourceGroupsService,
  GetSourcesService,
  GetTargetGroupsService,
  GetTelegramTargetsService,
  GetTopicsService,
  GetWebhookTargetsService,
  SmsTarget,
  SourceGroup,
  TargetGroup,
  TelegramTarget,
  WebhookTarget,
} from '@notifi-network/notifi-core';
import { Types } from '@notifi-network/notifi-graphql';

/**
 * Represents the internal data structure of the application.
 * @typedef {Object} InternalData
 * @property {Alert[]} alerts - Array of Alert objects.
 * @property {ConnectedWallet[]} connectedWallets - Array of ConnectedWallet objects.
 * @property {Types.FilterFragmentFragment[]} filters - Array of FilterFragmentFragment objects.
 * @property {Types.SourceFragmentFragment[]} sources - Array of SourceFragmentFragment objects.
 * @property {SourceGroup[]} sourceGroups - Array of SourceGroup objects.
 * @property {TargetGroup[]} targetGroups - Array of TargetGroup objects.
 * @property {EmailTarget[]} emailTargets - Array of EmailTarget objects.
 * @property {SmsTarget[]} smsTargets - Array of SmsTarget objects.
 * @property {TelegramTarget[]} telegramTargets - Array of TelegramTarget objects.
 * @property {WebhookTarget[]} webhookTargets - Array of WebhookTarget objects.
 * @property {DiscordTarget[]} discordTargets - Array of DiscordTarget objects.
 */
export type InternalData = {
  alerts: Alert[];
  connectedWallets: ConnectedWallet[];
  filters: Types.FilterFragmentFragment[];
  sources: Types.SourceFragmentFragment[];
  sourceGroups: SourceGroup[];
  targetGroups: TargetGroup[];
  emailTargets: EmailTarget[];
  smsTargets: SmsTarget[];
  telegramTargets: TelegramTarget[];
  webhookTargets: WebhookTarget[];
  discordTargets: DiscordTarget[];
};

export type FetchDataState = {
  pendingPromise?: Promise<InternalData>;
  lastSuccessTime?: number;
  lastSuccessData?: InternalData;
};

export type TimeProvider = Readonly<{
  now(): number;
}>;

/**
 * Type alias for a service that combines multiple services for retrieving data related to alerts, wallets, sources, targets, and notifications.
 * @typedef {object} Service
 * @property {function} getAlerts - Retrieves alerts.
 * @property {function} getConnectedWallets - Retrieves connected wallets.
 * @property {function} getSources - Retrieves sources.
 * @property {function} getSourceGroups - Retrieves source groups.
 * @property {function} getTargetGroups - Retrieves target groups.
 * @property {function} getEmailTargets - Retrieves email targets.
 * @property {function} getDiscordTargets - Retrieves Discord targets.
 * @property {function} getSmsTargets - Retrieves SMS targets.
 * @property {function} getTelegramTargets - Retrieves Telegram targets.
 * @property {function} getTopics - Retrieves topics.
 * @property {function} getWebhookTargets - Retrieves webhook targets.
 */
type Service = GetAlertsService &
  GetConnectedWalletsService &
  GetSourcesService &
  GetSourceGroupsService &
  GetTargetGroupsService &
  GetEmailTargetsService &
  GetDiscordTargetsService &
  GetSmsTargetsService &
  GetTelegramTargetsService &
  GetTopicsService &
  GetWebhookTargetsService;

const doFetchData = async (service: Service): Promise<InternalData> => {
  const [
    alerts,
    connectedWallets,
    sources,
    sourceGroups,
    targetGroups,
    emailTargets,
    smsTargets,
    telegramTargets,
    webhookTargets,
    discordTargets,
  ] = await Promise.all([
    service.getAlerts(),
    service.getConnectedWallets(),
    service.getSources(),
    service.getSourceGroups(),
    service.getTargetGroups(),
    service.getEmailTargets(),
    service.getSmsTargets(),
    service.getTelegramTargets(),
    service.getWebhookTargets(),
    service.getDiscordTargets(),
  ]);

  const filterIds = new Set<string | null>();
  const filters: Types.FilterFragmentFragment[] = [];
  sources.forEach((source) => {
    source.applicableFilters?.forEach((filter) => {
      if (!filterIds.has(filter?.id ?? '')) {
        filters.push(filter!); // ensured by `has`
        filterIds.add(filter!.id); // ensured by `has`
      }
    });
  });

  return {
    alerts: [...alerts],
    connectedWallets: [...connectedWallets],
    filters,
    sources: [...sources],
    discordTargets: [...discordTargets],
    sourceGroups: [...sourceGroups],
    targetGroups: [...targetGroups],
    emailTargets: [...emailTargets],
    smsTargets: [...smsTargets],
    telegramTargets: [...telegramTargets],
    webhookTargets: [...webhookTargets],
  };
};

const DataTtlMs = 1000;

const fetchDataImpl = async (
  service: Service,
  timeProvider: TimeProvider,
  state: FetchDataState,
): Promise<InternalData> => {
  if (state.pendingPromise !== undefined) {
    return await state.pendingPromise;
  }

  if (
    state.lastSuccessTime !== undefined &&
    state.lastSuccessData !== undefined
  ) {
    const currentTime = timeProvider.now();
    if (currentTime <= state.lastSuccessTime + DataTtlMs) {
      return state.lastSuccessData;
    }
  }

  const promise = doFetchData(service);
  state.pendingPromise = promise;
  const results = await promise;
  state.pendingPromise = undefined;
  state.lastSuccessTime = timeProvider.now();
  state.lastSuccessData = results;
  return results;
};

export default fetchDataImpl;
