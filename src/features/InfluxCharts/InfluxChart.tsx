import { InfluxDB } from '@influxdata/influxdb-client';
import { sub } from 'date-fns';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { resolveInfluxUrl } from 'features/Config/utils';

import ChartRenderer from './ChartRenderer';
import { LegendSelector } from './LegendSelector';
import { TimeRangeSelector } from './TimeRangeSelector';

import type { Series, TimeRange } from './types';
import type { InfluxConfig } from 'features/Config/types';
import { useInfluxConfig } from 'features/Config/api';

const colourScheme = [
  '#1b9e77', '#d95f02', '#7570b3', '#e7298a',
  '#66a61e', '#e6ab02', '#a6761d', '#666666'
];

export const getColorForId = (id: string, series: Series[]): string =>
  colourScheme[series.findIndex((d) => d.id === id) % colourScheme.length];

const loadVisibleMap = (key: string): Map<string, boolean> => {
  try {
    const raw = JSON.parse(localStorage.getItem(key) ?? '{}');
    return new Map(Object.entries(raw));
  } catch { return new Map(); }
};

const saveVisibleMap = (key: string, map: Map<string, boolean>) => {
  localStorage.setItem(key, JSON.stringify(Object.fromEntries(map)));
};

export interface InfluxChartProps {
  config: InfluxConfig;
  bucket?: string;
  measurement?: string;
  componentKind?: string;
  bufferType?: string;
  componentIdRegex?: string;
  legendLabel?: string;
  yAxisLabel?: string;
  valueUnitLabel?: string;
  valueUnitSuffix?: 'k' | 'K' | 'kb' | 'KB' | 'MB' | 'GB';
  dataOffset?: string;
  simpleLabel?: boolean;
}

export function InfluxChart({
                              config,
                              bucket = 'vector_metric',
                              measurement = '',
                              componentKind = '',
                              bufferType = '',
                              componentIdRegex = '',
                              legendLabel = '',
                              yAxisLabel = 'Events',
                              valueUnitLabel = '',
                              valueUnitSuffix = undefined,
                              dataOffset = '0',
                              simpleLabel = false,
                            }: InfluxChartProps) {
  const token = config.influxToken;
  const org = config.influxOrg;
  const url = config.influxUrl;
  const LOCAL_STORAGE_KEY = config.localStorageKey || 'influx_visible_series';
  const UPDATE_INTERVAL = config.updateInterval || 5000;

  const [data, setData] = useState<Series[]>([]);
  const [visibleMap, setVisibleMap] = useState<Map<string, boolean>>(new Map());
  const [timeRange, setTimeRange] = useState<TimeRange>({ type: 'preset', value: '-5m' });
  const [scrolling, setScrolling] = useState(true);
  const [timeBounds, setTimeBounds] = useState<[Date, Date]>([new Date(), new Date()]);
  const [maxY, setMaxY] = useState(1);
  const queryApiRef = useRef(new InfluxDB({ url, token }).getQueryApi(org));
  const [autoSuffix, setAutoSuffix] = useState('');

  const computeWindow = useCallback((): [Date, Date] => {
    const now = new Date();
    let start: Date = now;
    if (timeRange.type === 'custom') {
      start = new Date(timeRange.start);
      return [start, new Date(timeRange.end)];
    }
    const match = /-(\d+)([smhd])/.exec(timeRange.value);
    if (match) {
      const [, val, unit] = match;
      const amount = Number(val);
      const units = { s: 'seconds', m: 'minutes', h: 'hours', d: 'days' } as const;
      start = sub(now, { [units[unit as keyof typeof units]]: amount });
    } else { start = sub(now, { minutes: 5 }); }

    const offsetMatch = /^(\d+)([smhd])$/.exec(dataOffset);
    if (offsetMatch) {
      const [, val, unit] = offsetMatch;
      const amt = parseInt(val, 10);
      const offsetMap = { s: 'seconds', m: 'minutes', h: 'hours', d: 'days' } as const;
      start = sub(start, { [offsetMap[unit as keyof typeof offsetMap]]: amt });
      return [start, sub(now, { [offsetMap[unit as keyof typeof offsetMap]]: amt })];
    }
    return [start, now];
  }, [timeRange, dataOffset]);

  const fetchData = useCallback(async (isMounted: () => boolean) => {
    const [start, end] = computeWindow();
    const windowMs = end.getTime() - start.getTime();
    const approxWidthMs = windowMs / 100;

    const filters: string[] = [
      `|> filter(fn: (r) => r["_measurement"] =~ /${measurement}/)`
    ];

    if (componentKind) filters.push(`|> filter(fn: (r) => r["component_kind"] == "${componentKind}")`);
    if (bufferType) filters.push(`|> filter(fn: (r) => r["buffer_type"] == "${bufferType}")`);
    if (componentIdRegex) filters.push(`|> filter(fn: (r) => r["component_id"] =~ /${componentIdRegex}/)`);

    const flux = `
      from(bucket: "${bucket}")
      |> range(start: ${start.toISOString()}, stop: ${end.toISOString()})
      ${filters.join('\n')}
      |> group(columns: ["_measurement", "component_id", "host"], mode: "by")
      |> aggregateWindow(every: ${Math.round(approxWidthMs / 1000) || 1}s, fn: mean, createEmpty: true)
      |> yield(name: "mean")
    `;

    const outMap: Record<string, Series> = {};
    const res: any[] = [];

    try {
      // @ts-ignore
      await queryApiRef.current.queryRows(flux, {
        next: (row, meta) => {
          res.push(meta.toObject(row));
        },
        complete: () => {
          if (!isMounted()) return;

          res.forEach((row) => {
            const { _measurement, component_id, host, _time, _value } = row;

            /// Fallback to 'host' tag if 'component_id' is missing (e.g. host_metrics)
            const rawId = component_id || host || 'system';
            const cleanId = String(rawId).replace(new RegExp(componentIdRegex ?? ''), '');

            // Use simpleLabel to conditionally append the measurement
            const id = (!simpleLabel && _measurement) ? `${cleanId} [${_measurement}]` : cleanId;

            if (!outMap[id]) outMap[id] = { id, data: [] };
            outMap[id].data.push({ x: new Date(_time), y: Number(_value || 0) });
          });

          const series = Object.values(outMap);
          if (series.length === 0) {
            setData([]);
            return;
          }

          const allValues = series.flatMap(s => s.data.map(p => p.y));
          const maxVal = Math.max(...allValues, 1);

          let scale = 1; let suffix = '';
          if (!valueUnitSuffix && valueUnitLabel?.toLowerCase() === 'bytes') {
            if (maxVal >= 1e9) { scale = 1/1e9; suffix = ' GB'; }
            else if (maxVal >= 1e6) { scale = 1/1e6; suffix = ' MB'; }
            else if (maxVal >= 1e3) { scale = 1/1e3; suffix = ' KB'; }
            else suffix = ' B';
          } else if (valueUnitSuffix) {
            const s = valueUnitSuffix.toLowerCase();
            if (s === 'kb') { scale = 1/1024; suffix = ' KB'; }
            else if (s === 'mb') { scale = 1/1024**2; suffix = ' MB'; }
            else if (s === 'gb') { scale = 1/1024**3; suffix = ' GB'; }
            else if (s === 'k') { scale = 1e-3; suffix = 'k'; }
          }

          series.forEach(s => {
            s.data = s.data.map(p => ({ ...p, y: Math.round(p.y * scale) }));
          });

          setData(series);
          setMaxY(Math.ceil(Math.max(...series.flatMap(s => s.data.map(p => p.y)), 1) * 1.2));
          setTimeBounds([start, end]);
          setAutoSuffix(suffix);
        },
        error: (err) => console.error("Flux Error:", err)
      });
    } catch (e) { console.error("Query Execution Error:", e); }
  }, [bucket, measurement, componentKind, bufferType, componentIdRegex, valueUnitLabel, valueUnitSuffix, computeWindow]);

  useEffect(() => {
    let mounted = true;
    fetchData(() => mounted);
    if (scrolling && timeRange.type === 'preset') {
      const id = setInterval(() => fetchData(() => mounted), UPDATE_INTERVAL);
      return () => { mounted = false; clearInterval(id); };
    }
    return () => { mounted = false; };
  }, [fetchData, scrolling, timeRange, UPDATE_INTERVAL]);

  useEffect(() => {
    const saved = loadVisibleMap(LOCAL_STORAGE_KEY);
    const next = new Map<string, boolean>();
    data.forEach(d => next.set(d.id, saved.get(d.id) ?? true));
    setVisibleMap(next);
  }, [data, LOCAL_STORAGE_KEY]);

  const visibleData = useMemo(() => data.filter(d => visibleMap.get(d.id)), [data, visibleMap]);
  const legendItems = useMemo(() => data.map(d => ({
    key: d.id, label: d.id, color: getColorForId(d.id, data), visible: visibleMap.get(d.id) ?? true,
  })), [data, visibleMap]);

  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
          <TimeRangeSelector timeRange={timeRange} setTimeRange={setTimeRange} scrolling={scrolling} setScrolling={setScrolling} namePrefix={""} />
        </div>
        <ChartRenderer data={visibleData} visibleSeries={new Set(visibleData.map(d => d.id))} getColorForId={(id) => getColorForId(id, data)} timeRangeStart={timeBounds[0]} timeRangeEnd={timeBounds[1]} yAxisLabel={`${yAxisLabel}${autoSuffix}`} yMax={maxY} valueUnitSuffix={autoSuffix} />
      </div>
      <div style={{ minWidth: 220 }}>
        <LegendSelector legendItems={legendItems} setVisibility={(id, vis) => {
          const next = new Map(visibleMap); next.set(id, vis); setVisibleMap(next); saveVisibleMap(LOCAL_STORAGE_KEY, next);
        }} legendLabel={legendLabel} />
      </div>
    </div>
  );
}

export function InfluxChartWrapper(props: Omit<InfluxChartProps, 'config'>) {
  const { config } = useInfluxConfig();
  if (!config) return null;
  return <InfluxChart {...props} config={{ ...config, influxUrl: resolveInfluxUrl(config.influxUrl) }} />;
}
