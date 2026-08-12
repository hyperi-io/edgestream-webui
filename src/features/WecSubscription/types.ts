export type QueryItem = { path: string; selector: string };

export type SubscriptionPayload = {
  name: string;
  version?: string;
  uri?: string | null;
  query: QueryItem[];
  heartbeat_interval: number;
  connection_retry_count: number;
  connection_retry_interval: number;
  max_time: number;
  max_envelope_size: number;
  enabled: boolean;
  read_existing_events: boolean;
  content_format: 'RenderedText' | 'Events' | 'Both';
  ignore_channel_error: boolean;
  locale?: string | null;
  data_locale?: string | null;
  permitted: string[];
  prohibited: string[];
};

export type SubscriptionRow = SubscriptionPayload & { id: number };
