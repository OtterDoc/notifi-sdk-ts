import { Types as Gql, NotifiService } from '@notifi-network/notifi-graphql';

import type {
  Authorization,
  GetTenantConnectedWalletResult,
  GetTenantUserResult,
  ManagedAlert,
  SimpleHealthThresholdMessagePayload,
  WalletBlockchain,
} from '../types';
import {
  newDirectTenantMessage,
  newSimpleHealthThresholdMessage,
} from '../types';

class NotifiClient {
  constructor(private service: NotifiService) {}

  /**
   * Logs in a user using the provided input and returns an Authorization object.
   * @param input - The input object containing user login information.
   * @returns A Promise that resolves to an Authorization object.
   */
  logIn: (
    input: Gql.LogInFromServiceMutationVariables['input'],
  ) => Promise<Authorization> = async (input) => {
    const results = await this.service.logInFromService({ input });
    const authorization = results.logInFromService;
    if (authorization === undefined) {
      throw new Error('Log in failed!');
    }
    return authorization;
  };

  /**
   * Sends a simple health threshold message payload to the service.
   * @param {string} jwt - The JSON Web Token for authentication.
   * @param {Object} params - An object containing the following properties:
   * @param {string} key - The message key.
   * @param {string} walletPublicKey - The public key of the wallet.
   * @param {WalletBlockchain} walletBlockchain - The blockchain of the wallet.
   * @returns {Promise<void>} - A Promise that resolves with no value.
   */
  sendSimpleHealthThreshold: (
    jwt: string,
    params: Readonly<{
      key: string;
      walletPublicKey: string;
      walletBlockchain: WalletBlockchain;
    }> &
      SimpleHealthThresholdMessagePayload,
  ) => Promise<void> = async (
    jwt,
    { key, walletPublicKey, walletBlockchain, ...payload },
  ) => {
    const message = newSimpleHealthThresholdMessage(payload);
    const input = {
      walletPublicKey,
      walletBlockchain,
      messageKey: key,
      messageType: message.type,
      message: JSON.stringify(message.payload),
    };

    this.service.setJwt(jwt);
    const result = await this.service.sendMessage({ input });
    if (!result.sendMessage) {
      throw new Error('Send message failed');
    }
  };

  /**
   * Sends a broadcast message using the provided JWT and parameters.
   * @param {string} jwt - The JWT token to use for authentication.
   * @param {Object} params - The parameters for the broadcast message, with the following properties:
   * - recipient: The recipient of the message.
   * - message: The message to broadcast.
   * @returns {Promise<void>} - A Promise that resolves when the message has been successfully broadcasted.
   */
  sendBroadcastMessage: (
    jwt: string,
    params: Omit<
      Gql.BroadcastMessageMutationVariables,
      'timestamp' | 'walletBlockchain' | 'signature'
    >,
  ) => Promise<void> = async (jwt, params) => {
    this.service.setJwt(jwt);
    const result = await this.service.broadcastMessage({
      ...params,
      timestamp: 0,
      walletBlockchain: 'OFF_CHAIN',
      signature: '',
    });

    if (result.broadcastMessage?.id === undefined) {
      throw new Error('broadcast message failed');
    }
  };

  /**
   * Sends a direct push notification to a wallet.
   * @async
   * @function
   * @param {string} jwt - The JWT token.
   * @param {Object} params - The parameters for the direct push notification.
   * @param {string} params.key - The message key.
   * @param {string} params.walletPublicKey - The public key of the wallet.
   * @param {WalletBlockchain} params.walletBlockchain - The blockchain of the wallet.
   * @param {string} [params.message] - The message to send.
   * @param {string} [params.type] - The type of message.
   * @param {Object} [params.template] - The message template.
   * @param {string} [params.template.emailTemplate] - The email template.
   * @param {string} [params.template.smsTemplate] - The SMS template.
   * @param {string} [params.template.telegramTemplate] - The Telegram template.
   * @param {Object.<string, string>} [params.template.variables] - The variables for the message template.
   * @returns {Promise<void>} - A Promise that resolves when the message is sent.
   */
  sendDirectPush: (
    jwt: string,
    params: Readonly<{
      key: string;
      walletPublicKey: string;
      walletBlockchain: WalletBlockchain;
      message?: string;
      type?: string;
      template?: {
        emailTemplate?: string;
        smsTemplate?: string;
        telegramTemplate?: string;
        variables: Record<string, string>;
      };
    }>,
  ) => Promise<void> = async (
    jwt,
    { key, walletPublicKey, walletBlockchain, message, template, type },
  ) => {
    let directMessage;
    if (message !== undefined) {
      directMessage = newDirectTenantMessage({ message, type });
    } else if (template !== undefined) {
      directMessage = newDirectTenantMessage({
        message: '',
        type,
        targetTemplates: {
          SMS: template.smsTemplate ?? undefined,
          Email: template.emailTemplate ?? undefined,
          Telegram: template.telegramTemplate ?? undefined,
        },
        templateVariables: template.variables,
      });
    } else {
      throw new Error('One of message or template must be set');
    }

    const input = {
      walletPublicKey,
      walletBlockchain,
      messageKey: key,
      messageType: directMessage.type,
      message: JSON.stringify(directMessage.payload),
    };

    this.service.setJwt(jwt);
    const result = await this.service.sendMessage({
      input,
    });

    if (!result.sendMessage) {
      throw new Error('Send message failed');
    }
  };

  /**
   * Deletes a user alert using the provided JWT and parameters.
   * @param {string} jwt - The JWT token for authentication.
   * @param {Gql.DeleteUserAlertMutationVariables} params - The parameters for the delete operation.
   * @returns {Promise<string>} - The ID of the deleted alert.
   */
  deleteUserAlert: (
    jwt: string,
    params: Gql.DeleteUserAlertMutationVariables,
  ) => Promise<string /* AlertID */> = async (jwt, params) => {
    this.service.setJwt(jwt);
    const result = await this.service.deleteUserAlert(params);
    const deletedId = result.deleteUserAlert?.id;
    if (deletedId === undefined) {
      throw new Error('Delete user alert failed');
    }
    return deletedId;
  };

  /**
   * Creates a new tenant user using the provided JWT and input parameters.
   * @param {string} jwt - The JWT token for authentication.
   * @param {Gql.CreateTenantUserMutationVariables['input']} input - The input parameters for creating the tenant user.
   * @returns {Promise<string>} The ID of the created tenant user.
   */
  createTenantUser: (
    jwt: string,
    params: Gql.CreateTenantUserMutationVariables['input'],
  ) => Promise<string /* UserID */> = async (jwt, input) => {
    this.service.setJwt(jwt);
    const result = await this.service.createTenantUser({
      input,
    });

    const userId = result.createTenantUser?.id;
    if (userId === undefined) {
      throw new Error('Create tenant user failed');
    }

    return userId;
  };

  // TODO: Deprecate ManagedAlert type
  /**
   * Creates a direct push alert.
   * @param {string} jwt - The JSON Web Token.
   * @param {Gql.CreateDirectPushAlertMutationVariables['input']} params - The input parameters for creating the alert.
   * @returns {Promise<ManagedAlert>} A promise that resolves to the created alert.
   */
  createDirectPushAlert: (
    jwt: string,
    params: Gql.CreateDirectPushAlertMutationVariables['input'],
  ) => Promise<ManagedAlert> = async (jwt, input) => {
    this.service.setJwt(jwt);
    const result = await this.service.createDirectPushAlert({
      input,
    });
    const alertId = result.createDirectPushAlert?.id;
    if (alertId === undefined) {
      throw new Error('Create direct push alert failed');
    }

    return {
      id: alertId,
    };
  };

  // TODO: Deprecate ManagedAlert type
  /**
   * Deletes a direct push alert and returns a ManagedAlert object.
   * @param {string} jwt - JSON Web Token for authentication.
   * @param {Gql.DeleteDirectPushAlertMutationVariables['input']} params - Input variables for the mutation.
   * @returns {Promise<ManagedAlert>} - Promise that resolves to a ManagedAlert object.
   */
  deleteDirectPushAlert: (
    jwt: string,
    params: Gql.DeleteDirectPushAlertMutationVariables['input'],
  ) => Promise<ManagedAlert> = async (jwt, input) => {
    this.service.setJwt(jwt);
    const result = await this.service.DeleteDirectPushAlert({ input });
    const alertId = result.deleteDirectPushAlert?.id;
    if (alertId === undefined) {
      throw new Error('Delete direct push alert failed');
    }

    return {
      id: alertId,
    };
  };

  /**
   * Retrieves the connected wallet for a given tenant.
   * @param {string} jwt - The JSON Web Token for authentication.
   * @param {Gql.GetTenantConnectedWalletQueryVariables} params - The parameters for the query.
   * @returns {Promise<GetTenantConnectedWalletResult>} The connected wallet for the tenant.
   */
  getTenantConnectedWallet: (
    jwt: string,
    params: Gql.GetTenantConnectedWalletQueryVariables,
  ) => Promise<GetTenantConnectedWalletResult> = async (jwt, params) => {
    this.service.setJwt(jwt);
    const result = await this.service.getTenantConnectedWallets(params);
    const connection = result.tenantConnectedWallet;
    if (connection === undefined) {
      throw new Error('Get tenant connected wallet failed');
    }

    return connection;
  };

  /**
   * Retrieves a tenant user using a JWT and query parameters.
   * @param {string} jwt - The JSON Web Token used for authentication.
   * @param {Gql.GetTenantUserQueryVariables} params - The query parameters for retrieving the tenant user.
   * @returns {Promise<GetTenantUserResult>} - A Promise that resolves with the retrieved tenant user.
   */
  getTenantUser: (
    jwt: string,
    params: Gql.GetTenantUserQueryVariables,
  ) => Promise<GetTenantUserResult> = async (jwt, params) => {
    this.service.setJwt(jwt);
    const result = await this.service.getTenantUser(params);
    const connection = result.tenantUser;
    if (connection === undefined) {
      throw new Error('Get tenant user failed');
    }

    return connection;
  };

  /**
   * Creates a tenant balance change alert.
   * @async
   * @param {string} jwt - The JSON Web Token.
   * @param {Object} params - The parameters for the alert.
   * @param {string} params.name - The name of the alert.
   * @param {Object} params.webhook - The webhook target for the alert.
   * @returns {Promise<Object>} The created or updated alert.
   * @throws {Error} If unable to fetch existing alerts, unable to locate BALANCE filter, incompatible alert filterType, or failed to create alert.
   */
  createTenantBalanceChangeAlert: (
    jwt: string,
    params: Readonly<{
      name: string;
      webhook: Gql.CreateWebhookTargetMutationVariables;
    }>,
  ) => Promise<Gql.AlertFragmentFragment> = async (jwt, { name, webhook }) => {
    this.service.setJwt(jwt);

    const webhookTarget = await this.createOrUpdateWebhook(webhook);

    const alertsResult = await this.service.getAlerts({});
    const alerts = alertsResult.alert;
    if (alerts === undefined) {
      throw new Error('Failed to fetch existing alerts');
    }

    const existing = alerts.find((a) => a?.name === name);
    if (existing !== undefined) {
      if (existing.filter.filterType !== 'BALANCE') {
        throw new Error('Incompatible alert filterType.');
      }

      const updatedTargetGroup = await this.updateTargetGroup(
        existing.targetGroup,
        webhookTarget,
      );
      return {
        ...existing,
        targetGroup: updatedTargetGroup,
      };
    }

    const filtersResult = await this.service.getFilters({});
    const balanceFilter = filtersResult.filter?.find(
      (f) => f?.filterType === 'BALANCE',
    );
    if (balanceFilter === undefined) {
      throw new Error('Unable to locate BALANCE filter');
    }

    const sourceGroup = await this.getOrCreateSourceGroup(name);
    const targetGroup = await this.getOrCreateTargetGroup(name, webhookTarget);

    const createResult = await this.service.createAlert({
      name,
      groupName: 'Managed',
      sourceGroupId: sourceGroup.id,
      filterId: balanceFilter.id,
      targetGroupId: targetGroup.id,
      filterOptions: '{}',
    });
    const alert = createResult.createAlert;
    if (alert === undefined) {
      throw new Error('Failed to create alert');
    }

    return alert;
  };

  /**
   * Adds a source to a source group using the provided JWT and input variables.
   * @param {string} jwt - The JWT token for authentication.
   * @param {Gql.AddSourceToSourceGroupMutationVariables['input']} input - The input variables for the mutation.
   * @returns {Promise<Gql.SourceGroupFragmentFragment>} - A promise that resolves to the updated source group.
   */
  addSourceToSourceGroup: (
    jwt: string,
    input: Gql.AddSourceToSourceGroupMutationVariables['input'],
  ) => Promise<Gql.SourceGroupFragmentFragment> = async (jwt, input) => {
    this.service.setJwt(jwt);
    const result = await this.service.addSourceToSourceGroup({ input });
    if (result.addSourceToSourceGroup === undefined) {
      throw new Error('Failed to add Source to SourceGroup');
    }

    return result.addSourceToSourceGroup;
  };

  /**
   * Removes a source from a source group.
   * @param {string} jwt - The JSON Web Token for authentication.
   * @param {Gql.RemoveSourceFromSourceGroupMutationVariables['input']} input - The input variables for the mutation.
   * @returns {Promise<Gql.SourceGroupFragmentFragment>} - A promise that resolves with the updated source group.
   */
  removeSourceFromSourceGroup: (
    jwt: string,
    input: Gql.RemoveSourceFromSourceGroupMutationVariables['input'],
  ) => Promise<Gql.SourceGroupFragmentFragment> = async (jwt, input) => {
    this.service.setJwt(jwt);
    const result = await this.service.removeSourceFromSourceGroup({ input });
    if (result.removeSourceFromSourceGroup === undefined) {
      throw new Error('Failed to remove Source from SourceGroup');
    }

    return result.removeSourceFromSourceGroup;
  };

  /**
   * Returns a Promise that resolves to a Gql.SourceGroupFragmentFragment object.
   * @param {string} name - The name of the source group to get or create.
   * @returns {Promise<Gql.SourceGroupFragmentFragment>} - The existing or newly created source group.
   * @throws {Error} - If the operation to get or create the source group fails.
   */
  getOrCreateSourceGroup: (
    name: string,
  ) => Promise<Gql.SourceGroupFragmentFragment> = async (name) => {
    const getResult = await this.service.getSourceGroups({});
    if (getResult.sourceGroup === undefined) {
      throw new Error('Failed to get SourceGroups');
    }
    const existing = getResult.sourceGroup.find((sg) => sg?.name === name);
    if (existing !== undefined) {
      return existing;
    }

    const createResult = await this.service.createSourceGroup({
      name,
      sourceIds: [],
    });
    if (createResult.createSourceGroup === undefined) {
      throw new Error('Failed to create SourceGroup');
    }

    return createResult.createSourceGroup;
  };

  /**
   * Creates a new target group or updates an existing one with the provided name and webhook target.
   * @async
   * @function
   * @param {string} name - The name of the target group.
   * @param {Gql.WebhookTargetFragmentFragment} webhookTarget - The webhook target to add to the target group.
   * @returns {Promise<Gql.TargetGroupFragmentFragment>} The created or updated target group.
   */
  getOrCreateTargetGroup: (
    name: string,
    webhookTarget: Gql.WebhookTargetFragmentFragment,
  ) => Promise<Gql.TargetGroupFragmentFragment> = async (
    name,
    webhookTarget,
  ) => {
    const getResult = await this.service.getTargetGroups({});
    if (getResult.targetGroup === undefined) {
      throw new Error('Failed to get TargetGroups');
    }

    const existing = getResult.targetGroup.find((tg) => tg?.name === name);
    if (existing !== undefined) {
      return this.updateTargetGroup(existing, webhookTarget);
    }

    const createResult = await this.service.createTargetGroup({
      name,
      emailTargetIds: [],
      smsTargetIds: [],
      telegramTargetIds: [],
      webhookTargetIds: [webhookTarget.id],
      discordTargetIds: [],
    });
    if (createResult.createTargetGroup === undefined) {
      throw new Error('Failed to create TargetGroup');
    }

    return createResult.createTargetGroup;
  };

  /**
   * Retrieves a list of sources based on the provided JWT and query variables.
   * @param {string} jwt - The JWT token for authentication.
   * @param {object} variables - The query variables for the GraphQL query, including 'input', 'after', and 'first'.
   * @returns {Promise<Array>} - A promise that resolves to an array of sources.
   */
  getSourceConnection: (
    jwt: string,
    variables: Gql.GetSourceConnectionQueryVariables['input'] &
      Pick<Gql.GetSourceConnectionQueryVariables, 'after' | 'first'>,
  ) => Promise<Exclude<Gql.GetSourceConnectionQuery['sources'], undefined>> =
    async (jwt, variables) => {
      const { after, first, ...input } = variables;

      const result = await this.service.getSourceConnection({
        after,
        first,
        input,
      });

      if (result.sources === undefined) {
        throw new Error('Failed to fetch SourceConnection');
      }

      return result.sources;
    };

  /**
   * Updates a target group with a webhook and returns the updated target group.
   * @param {object} targetGroup - The target group to be updated.
   * @param {object} webhook - The webhook to be added to the target group.
   * @returns {Promise<object>} - The updated target group.
   */
  updateTargetGroup: (
    targetGroup: Gql.TargetGroupFragmentFragment,
    webhook: Gql.WebhookTargetFragmentFragment,
  ) => Promise<Gql.TargetGroupFragmentFragment> = async (
    targetGroup,
    webhook,
  ) => {
    const updateResult = await this.service.updateTargetGroup({
      id: targetGroup.id,
      name: targetGroup.name ?? targetGroup.id,
      emailTargetIds: [],
      smsTargetIds: [],
      telegramTargetIds: [],
      webhookTargetIds: [webhook.id],
      discordTargetIds: [],
    });

    const updated = updateResult.updateTargetGroup;
    if (updated === undefined) {
      throw new Error('Failed to update targetGroup');
    }

    return updated;
  };

  /**
   * Creates or updates a webhook target with the given parameters.
   *
   * @param {Gql.CreateWebhookTargetMutationVariables} params - The parameters for creating or updating the webhook target.
   * @returns {Promise<Gql.WebhookTargetFragmentFragment>} The created or updated webhook target.
   */
  createOrUpdateWebhook: (
    params: Gql.CreateWebhookTargetMutationVariables,
  ) => Promise<Gql.WebhookTargetFragmentFragment> = async (params) => {
    const getResult = await this.service.getWebhookTargets({});
    const existing = getResult.webhookTarget?.find((w) => {
      return w.url === params.url && w.format === params.format;
    });

    if (existing === undefined) {
      const createResult = await this.service.createWebhookTarget(params);
      const result = createResult.createWebhookTarget;
      if (result === undefined) {
        throw new Error('Failed to create webhook target');
      }
      return result;
    }

    const existingHeaders = keyValuePairsToRecord(existing.headers);
    const desiredHeaders = keyValuePairsToRecord(params.headers);
    if (areRecordsEqual(existingHeaders, desiredHeaders)) {
      return existing;
    }

    const deleteResult = await this.service.deleteWebhookTarget({
      id: existing.id,
    });
    if (deleteResult.deleteWebhookTarget?.id === undefined) {
      throw new Error('Failed to delete webhook target');
    }

    const recreateResult = await this.service.createWebhookTarget(params);
    const recreated = recreateResult.createWebhookTarget;
    if (recreated === undefined) {
      throw new Error('Failed to recreate webhook target');
    }
    return recreated;
  };
}

// Utils
type Pair = { key: string; value: string };
const keyValuePairsToRecord = (
  pairs: undefined | Pair | Pair[],
): Record<string, string> => {
  const results: Record<string, string> = {};
  if (pairs === undefined) {
    // Nothing to do
  } else if (Array.isArray(pairs)) {
    // Set all values
    pairs.forEach(({ key, value }) => (results[key] = value));
  } else {
    // Singular value
    results[pairs.key] = pairs.value;
  }

  return results;
};

const areRecordsEqual = (
  a: Record<string, string>,
  b: Record<string, string>,
): boolean => {
  const aKeys = Object.keys(a);
  return (
    aKeys.length === Object.keys(b).length &&
    aKeys.every((key) => {
      return b[key] !== undefined && a[key] === b[key];
    })
  );
};

export default NotifiClient;
