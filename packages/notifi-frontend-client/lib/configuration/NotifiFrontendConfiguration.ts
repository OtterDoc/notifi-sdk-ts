export type NotifiEnvironment =
  | 'Production'
  | 'Staging'
  | 'Development'
  | 'Local';

export type NotifiEnvironmentConfiguration = Readonly<{
  env: NotifiEnvironment;
  tenantId: string;
  storageOption?: Readonly<{
    driverType?: 'LocalForage' | 'InMemory';
  }>;
}>;

/**
 * Represents a configuration object for a wallet with a public key, combined with environment configuration for notifications.
 * @typedef {Object} NotifiConfigWithPublicKey
 * @property {('ETHEREUM'|'POLYGON'|'ARBITRUM'|'AVALANCHE'|'BINANCE'|'OPTIMISM'|'SOLANA')} walletBlockchain - The blockchain associated with the wallet.
 * @property {string} walletPublicKey - The public key of the wallet.
 * @extends NotifiEnvironmentConfiguration
 */
export type NotifiConfigWithPublicKey = Readonly<{
  walletBlockchain:
    | 'ETHEREUM'
    | 'POLYGON'
    | 'ARBITRUM'
    | 'AVALANCHE'
    | 'BINANCE'
    | 'OPTIMISM'
    | 'SOLANA';
  walletPublicKey: string;
}> &
  NotifiEnvironmentConfiguration;

export type NotifiConfigWithPublicKeyAndAddress = Readonly<{
  walletBlockchain: 'SUI' | 'NEAR' | 'INJECTIVE' | 'APTOS' | 'ACALA';
  authenticationKey: string;
  accountAddress: string;
}> &
  NotifiEnvironmentConfiguration;

export type NotifiFrontendConfiguration =
  | NotifiConfigWithPublicKey
  | NotifiConfigWithPublicKeyAndAddress;

export type ConfigFactoryInput =
  | ConfigFactoryInputPublicKeyAndAddress
  | ConfigFactoryInputPublicKey;

export const checkIsConfigWithPublicKeyAndAddress = (
  config: NotifiFrontendConfiguration,
): config is NotifiConfigWithPublicKeyAndAddress => {
  return 'accountAddress' in config;
};

/**
 * Type alias for the input object used in the ConfigFactory to generate a configuration object with public key and address.
 * @typedef {Object} ConfigFactoryInputPublicKeyAndAddress
 * @property {Object} account - An object containing the address and public key of the account.
 * @property {string} account.address - The address of the account.
 * @property {string} account.publicKey - The public key of the account.
 * @property {string} tenantId - The ID of the tenant.
 * @property {NotifiEnvironment} env - The environment for the configuration.
 * @property {NotifiConfigWithPublicKeyAndAddress['walletBlockchain']} walletBlockchain - The blockchain used for the wallet.
 * @property {NotifiEnvironmentConfiguration['storageOption']} [storageOption] - Optional storage option for the configuration.
 */
export type ConfigFactoryInputPublicKeyAndAddress = {
  account: Readonly<{
    address: string;
    publicKey: string;
  }>;
  tenantId: string;
  env: NotifiEnvironment;
  walletBlockchain: NotifiConfigWithPublicKeyAndAddress['walletBlockchain'];
  storageOption?: NotifiEnvironmentConfiguration['storageOption'];
};

export type ConfigFactoryInputPublicKey = {
  account: Readonly<{
    publicKey: string;
  }>;
  tenantId: string;
  env: NotifiEnvironment;
  walletBlockchain: NotifiConfigWithPublicKey['walletBlockchain'];
  storageOption?: NotifiEnvironmentConfiguration['storageOption'];
};

export type FrontendClientConfigFactory<T extends NotifiFrontendConfiguration> =
  (
    args: T extends NotifiConfigWithPublicKeyAndAddress
      ? ConfigFactoryInputPublicKeyAndAddress
      : ConfigFactoryInputPublicKey,
  ) => NotifiFrontendConfiguration;

const configFactoryPublicKey: FrontendClientConfigFactory<
  NotifiConfigWithPublicKey
> = (args) => {
  return {
    tenantId: args.tenantId,
    env: args.env,
    walletBlockchain: args.walletBlockchain,
    walletPublicKey: args.account.publicKey,
    storageOption: args.storageOption,
  };
};

const configFactoryPublicKeyAndAddress: FrontendClientConfigFactory<
  NotifiConfigWithPublicKeyAndAddress
> = (args) => {
  return {
    tenantId: args.tenantId,
    env: args.env,
    walletBlockchain: args.walletBlockchain,
    authenticationKey: args.account.publicKey,
    accountAddress: args.account.address,
    storageOption: args.storageOption,
  };
};

const validateConfigInput = (
  config: ConfigFactoryInput,
): config is ConfigFactoryInputPublicKeyAndAddress => {
  return 'address' in config.account;
};

export const newFrontendConfig = (
  config: ConfigFactoryInput,
): NotifiFrontendConfiguration => {
  return validateConfigInput(config)
    ? configFactoryPublicKeyAndAddress(config)
    : configFactoryPublicKey(config);
};

export const envUrl = (env: NotifiEnvironment): string => {
  switch (env) {
    case 'Development':
      return 'https://api.dev.notifi.network/gql';
    case 'Local':
      return 'https://localhost:5001/gql';
    case 'Production':
      return 'https://api.notifi.network/gql';
    case 'Staging':
      return 'https://api.stg.notifi.network/gql';
  }
};
