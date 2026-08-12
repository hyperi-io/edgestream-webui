import { format as formatDate } from 'date-fns';
import React from 'react';

import { ResponsiveLine } from '@nivo/line';

import { getDynamicTimeFormat } from './utils';

import type { Series } from './types';

interface ChartRendererProps {
  data: Series[];
  visibleSeries: Set<string>;
  getColorForId: (id: string, data: Series[]) => string;
  timeRangeStart: Date;
  timeRangeEnd: Date;
  yAxisLabel: string;
  yMax: number;
  valueUnitSuffix?: string;
}

const estimateLeftMargin = (
  yAxisLabel: string,
  yMax: number,
  unitSuffix = '',
): number => {
  const maxValueLength = `${Math.round(yMax)}${unitSuffix}`.length;
  const labelLength = yAxisLabel?.length ?? 0;
  const base = 40;
  return base + Math.max(maxValueLength * 7, labelLength * 6); // adjust multipliers as needed
};

const ChartRenderer = ({
  data,
  visibleSeries,
  getColorForId,
  timeRangeStart,
  timeRangeEnd,
  yAxisLabel,
  yMax,
  valueUnitSuffix = '',
}: ChartRendererProps) => {
  const filteredData = data.filter((d) => visibleSeries.has(d.id));
  const timeFormat = getDynamicTimeFormat(filteredData);

  const timeZoneAbbrev = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const leftMargin = estimateLeftMargin(yAxisLabel, yMax, valueUnitSuffix);

  return (
    <div style={{ height: 400, width: '100%', paddingBottom: '16px' }}>
      <ResponsiveLine
        data={filteredData}
        colors={(serie) => getColorForId(String(serie.id), data)}
        margin={{ top: 40, right: 30, bottom: 70, left: leftMargin }}
        xScale={{
          type: 'time',
          format: 'native',
          useUTC: false, // ensure local time display
          min: timeRangeStart,
          max: timeRangeEnd,
        }}
        xFormat={`time:${timeFormat}`}
        yScale={{
          type: 'linear',
          min: 0,
          max: yMax < 1 ? 1 : yMax, // Clamp to 1
          stacked: false,
        }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -45,
          legend: '',
          legendOffset: 36,
          legendPosition: 'middle',
          format: (value) =>
            formatDate(
              value instanceof Date ? value : new Date(value),
              'd MMM h:mm a', // e.g., "12 Jun 5:15 PM"
            ),
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickValues: 6,
          legend: yAxisLabel,
          legendOffset: -60,
          legendPosition: 'middle',
          format: (v) => `${Number(v).toFixed(0)}${valueUnitSuffix}`,
        }}
        enablePoints={false}
        enableArea
        areaOpacity={0.25}
        tooltip={({ point }) => {
          const date =
            point.data.x instanceof Date
              ? point.data.x
              : new Date(String(point.data.x));

          return (
            <div
              style={{
                background: 'white',
                padding: '8px 12px',
                border: '1px solid #ccc',
                borderRadius: 4,
                fontSize: 13,
                color: '#333',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              }}
            >
              <div style={{ marginBottom: 6, fontWeight: 'bold' }}>
                {formatDate(date, 'd MMMM yyyy, h:mm:ss a')} ({timeZoneAbbrev})
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: point.seriesColor,
                  }}
                />
                <span>
                  {point.seriesId}: {Math.round(Number(point.data.y))}
                  {valueUnitSuffix ?? ''}
                </span>
              </div>
            </div>
          );
        }}
        useMesh
        motionConfig="gentle"
        legends={[]}
      />
    </div>
  );
};

export default ChartRenderer;

ChartRenderer.defaultProps = {
  valueUnitSuffix: '',
};
