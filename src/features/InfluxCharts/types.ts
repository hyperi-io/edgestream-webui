export interface DataPoint {
  x: Date;
  y: number;
}

export interface Series {
  id: string;
  data: DataPoint[];
}

export type TimeRange =
  | { type: 'preset'; value: string }
  | { type: 'custom'; start: string; end: string };
