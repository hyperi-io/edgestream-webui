import React, { useCallback } from 'react';

import { ActionIcon, Button, Group, Stack, TextInput } from '@mantine/core';
import { IconCirclePlus, IconX } from '@tabler/icons-react';

import { QueryItem } from '../types';

export default function QueryEditor({
  rows,
  onChange,
  error,
}: {
  rows: QueryItem[];
  onChange: (val: QueryItem[]) => void;
  error?: string | null;
}) {
  const handlePathChange = useCallback(
    (idx: number, value: string) => {
      const q = [...rows];
      q[idx] = { ...q[idx], path: value };
      onChange(q);
    },
    [rows, onChange],
  );

  const handleSelectorChange = useCallback(
    (idx: number, value: string) => {
      const q = [...rows];
      q[idx] = { ...q[idx], selector: value };
      onChange(q);
    },
    [rows, onChange],
  );

  const handleRemove = useCallback(
    (idx: number) => {
      const q = rows.filter((_, i) => i !== idx);
      onChange(q);
    },
    [rows, onChange],
  );

  const handleAdd = useCallback(() => {
    onChange([...rows, { path: '', selector: '' }]);
  }, [rows, onChange]);

  return (
    <Stack gap="xs">
      {rows.map((row, idx) => {
        // build a deterministic key (if both empty, fallback)
        const key = `${row.path || 'path'}:${
          row.selector || 'selector'
        }:${idx}`;
        return (
          <Group key={key} align="end" wrap="nowrap">
            <TextInput
              w="45%"
              label="Path"
              placeholder="Application / Security / Setup / System"
              value={row.path}
              onChange={(e) => handlePathChange(idx, e.currentTarget.value)}
            />
            <TextInput
              w="45%"
              label="Selector"
              placeholder='e.g. "*"'
              value={row.selector}
              onChange={(e) => handleSelectorChange(idx, e.currentTarget.value)}
            />
            <ActionIcon
              variant="light"
              color="red"
              aria-label="Remove row"
              onClick={() => handleRemove(idx)}
            >
              <IconX size={16} />
            </ActionIcon>
          </Group>
        );
      })}

      <Button
        leftSection={<IconCirclePlus size={16} />}
        variant="light"
        onClick={handleAdd}
      >
        Add row
      </Button>

      {error && (
        <div
          style={{
            color: 'var(--mantine-color-red-6)',
            fontSize: 12,
            marginTop: 4,
          }}
        >
          {String(error)}
        </div>
      )}
    </Stack>
  );
}
