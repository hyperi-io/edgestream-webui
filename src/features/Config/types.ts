export interface InfluxConfig {
  influxToken: string;
  influxOrg: string;
  influxUrl: string;
  localStorageKey?: string;
  updateInterval?: number;
}
