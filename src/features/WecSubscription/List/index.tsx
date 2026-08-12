import React, { useCallback, useMemo, useState } from 'react';

import {
  ActionIcon,
  Anchor,
  Badge,
  Button,
  Group,
  Paper,
  ScrollArea,
  Switch,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import {
  IconCirclePlus,
  IconEdit,
  IconSearch,
  IconTrash,
} from '@tabler/icons-react';

import { SubscriptionRow } from '../types';

export default function WecSubscriptionList({
  rows,
  loading,
  onReload,
  onCreateClick,
  onEditClick,
  onDeleteClick,
  onToggleEnabled,
}: {
  rows: SubscriptionRow[];
  loading?: boolean;
  onReload?: () => void;
  onCreateClick: () => void;
  onEditClick: (row: SubscriptionRow) => void;
  onDeleteClick: (row: SubscriptionRow) => void;
  onToggleEnabled: (row: SubscriptionRow, next: boolean) => Promise<void>;
}) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.uri ?? '').toLowerCase().includes(q),
    );
  }, [rows, search]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setSearch(e.currentTarget.value),
    [],
  );

  const handleEdit = useCallback(
    (row: SubscriptionRow) => onEditClick(row),
    [onEditClick],
  );

  const handleDelete = useCallback(
    (row: SubscriptionRow) => onDeleteClick(row),
    [onDeleteClick],
  );

  const handleToggle = useCallback(
    async (row: SubscriptionRow, next: boolean) => {
      await onToggleEnabled(row, next);
    },
    [onToggleEnabled],
  );

  return (
    <>
      <Group justify="space-between" align="center" mb="sm">
        <Text fw={600}>WEC Subscriptions</Text>
        <Group>
          <TextInput
            placeholder="Search by name or URI"
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={handleSearchChange}
            w={280}
          />
          <Button
            leftSection={<IconCirclePlus size={18} />}
            onClick={onCreateClick}
          >
            New Subscription
          </Button>
        </Group>
      </Group>

      <Paper withBorder radius="lg" p="sm">
        <ScrollArea h="calc(100vh - 200px)">
          <Table
            striped
            highlightOnHover
            horizontalSpacing="md"
            verticalSpacing="sm"
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ width: 36 }} />
                <Table.Th>Name</Table.Th>
                <Table.Th>URI</Table.Th>
                <Table.Th>Heartbeat</Table.Th>
                <Table.Th>Max Envelope</Table.Th>
                <Table.Th>Format</Table.Th>
                <Table.Th>Enabled</Table.Th>
                <Table.Th style={{ width: 140 }} />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filtered.map((row) => (
                <Table.Tr key={row.id}>
                  <Table.Td>
                    <Badge variant="light">#{row.id}</Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap={6}>
                      <Text fw={600}>{row.name}</Text>
                      {row.version && (
                        <Badge size="xs" variant="outline">
                          v
                        </Badge>
                      )}
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    {row.uri ? (
                      <Anchor
                        size="sm"
                        c="dimmed"
                        underline="always"
                        href={row.uri.startsWith('http') ? row.uri : undefined}
                        target={
                          row.uri.startsWith('http') ? '_blank' : undefined
                        }
                        rel={
                          row.uri.startsWith('http')
                            ? 'noopener noreferrer'
                            : undefined
                        }
                      >
                        {row.uri}
                      </Anchor>
                    ) : (
                      <Text size="sm" c="dimmed">
                        (default)
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{row.heartbeat_interval}s</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">
                      {row.max_envelope_size.toLocaleString()} bytes
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="dot">{row.content_format}</Badge>
                  </Table.Td>
                  <Table.Td>
                    <Switch
                      checked={row.enabled}
                      onChange={(e) =>
                        handleToggle(row, e.currentTarget.checked)
                      }
                      size="sm"
                    />
                  </Table.Td>
                  To make these buttons consistent with your Edit and Delete buttons in the other components, replace the ActionIcon group at the end of the table row with the same Button pattern used previously.

                  The Fix
                  Replace your current Table.Td for actions with this version:

                  TypeScript
                  <Table.Td>
                    <Group gap="xs" justify="right" wrap="nowrap">
                      <Button
                        size="xs"
                        variant="light"
                        leftSection={<IconEdit size={14} />}
                        onClick={() => handleEdit(row)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="xs"
                        variant="light"
                        color="red"
                        leftSection={<IconTrash size={14} />}
                        onClick={() => handleDelete(row)}
                      >
                        Delete
                      </Button>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
              {filtered.length === 0 && !loading && (
                <Table.Tr>
                  <Table.Td colSpan={8}>
                    <Text c="dimmed" ta="center">
                      No subscriptions found.
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Paper>
    </>
  );
}
