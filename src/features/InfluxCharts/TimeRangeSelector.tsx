import React from 'react';

import { Group, Select, SegmentedControl, Switch, Stack } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';

import type { TimeRange } from './types';

interface Props {
  namePrefix: string;
  timeRange: TimeRange;
  setTimeRange: (range: TimeRange) => void;
  scrolling: boolean;
  setScrolling: (scrolling: boolean) => void;
}

function toISO(v: unknown): string {
  if (v instanceof Date) return v.toISOString();
  if (typeof v === 'string') return new Date(v).toISOString();
  return new Date().toISOString();
}

const PRESETS = [
  { value: '-5m', label: 'Last 5 minutes' },
  { value: '-15m', label: 'Last 15 minutes' },
  { value: '-30m', label: 'Last 30 minutes' },
  { value: '-1h', label: 'Last 1 hour' },
  { value: '-4h', label: 'Last 4 hours' },
  { value: '-12h', label: 'Last 12 hours' },
  { value: '-24h', label: 'Last 24 hours' },
  { value: '-168h', label: 'Last 7 days' },
  { value: '-720h', label: 'Last 1 month' },
  { value: '-2160h', label: 'Last 3 months' },
];

export const TimeRangeSelector: React.FC<Props> = ({
  namePrefix,
  timeRange,
  setTimeRange,
  scrolling,
  setScrolling,
}) => {
  const handleModeChange = (value: 'preset' | 'custom') => {
    if (value === 'preset') {
      setTimeRange({ type: 'preset', value: '-5m' });
    } else {
      const nowIso = new Date().toISOString();
      setTimeRange({ type: 'custom', start: nowIso, end: nowIso });
    }
  };

  const handlePresetChange = (value: string | null) => {
    if (!value) return;
    setTimeRange({ type: 'preset', value });
  };

  const startDate: Date | null =
    timeRange.type === 'custom' && timeRange.start
      ? new Date(timeRange.start)
      : null;
  const endDate: Date | null =
    timeRange.type === 'custom' && timeRange.end
      ? new Date(timeRange.end)
      : null;

  type DTPOnChange = NonNullable<
    React.ComponentProps<typeof DateTimePicker>['onChange']
  >;

  const handleCustomStart: DTPOnChange = (value) => {
    if (timeRange.type !== 'custom') return;
    const startIso = toISO(value ?? new Date());
    setTimeRange({
      type: 'custom',
      start: startIso,
      end: timeRange.end ?? startIso,
    });
  };

  const handleCustomEnd: DTPOnChange = (value) => {
    if (timeRange.type !== 'custom') return;
    const endIso = toISO(value ?? new Date());
    setTimeRange({
      type: 'custom',
      start: timeRange.start ?? endIso,
      end: endIso,
    });
  };

  return (
    <Group gap="md" align="center" wrap="wrap">
      <SegmentedControl
        value={timeRange.type}
        onChange={(v) => handleModeChange(v as 'preset' | 'custom')}
        data={[
          { value: 'preset', label: 'Preset' },
          { value: 'custom', label: 'Custom' },
        ]}
        radius="md"
        size="sm"
      />

      {timeRange.type === 'preset' ? (
        <Select
          value={timeRange.value}
          onChange={handlePresetChange}
          data={PRESETS}
          w={200}
          size="sm"
          allowDeselect={false}
          searchable={false}
        />
      ) : (
        <Group gap="sm" wrap="wrap">
          <Stack gap={2}>
            <DateTimePicker
              label="Start"
              value={startDate}
              onChange={handleCustomStart}
              w={220}
              size="sm"
              clearable={false}
            />
          </Stack>
          <Stack gap={2}>
            <DateTimePicker
              label="End"
              value={endDate}
              onChange={handleCustomEnd}
              w={220}
              size="sm"
              clearable={false}
            />
          </Stack>
        </Group>
      )}

      <Switch
        checked={scrolling}
        onChange={(e) => setScrolling(e.currentTarget.checked)}
        label="Auto-Scroll"
        size="sm"
      />
    </Group>
  );
};
