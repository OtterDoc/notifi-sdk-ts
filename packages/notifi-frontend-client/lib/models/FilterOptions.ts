export type AlertFrequency =
  | 'ALWAYS'
  | 'SINGLE'
  | 'QUARTER_HOUR'
  | 'HOURLY'
  | 'DAILY'
  | 'THREE_MINUTES';

export type ValueItemConfig = Readonly<{
  key: string;
  op: 'lt' | 'lte' | 'eq' | 'gt' | 'gte';
  value: string;
}>;

export type ThresholdDirection = 'above' | 'below';

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
