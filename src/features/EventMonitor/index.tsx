import React, { useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Group,
  Switch,
  LoadingOverlay,
  Paper,
  ScrollArea,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import {
  IconRefresh, IconSearch, IconSortAscending, IconSortDescending,
} from '@tabler/icons-react';
import { useUpdateEffect } from 'react-use';
import { useEventMonitor } from './api';
import { EventMonitorMetrics } from './store/eventMonitorSlice';

type SortField = keyof Pick<EventMonitorMetrics, 'componentId' | 'componentType' | 'onType' | 'receivedEventsTotal' | 'sentEventsTotal' | 'errorsTotal'>;

const num = (v: any) => (typeof v === 'string' ? parseInt(v, 10) || 0 : v || 0);
const fmt = (v: any) => Number(v ?? 0).toLocaleString('en-US');

const Index: React.FC = () => {
  const { rows, loading, refetch, error } = useEventMonitor();

  const [search, setSearch] = useState<string>(localStorage.getItem('vector.eventmon.search') ?? '');
  const [sortField, setSortField] = useState<SortField>((localStorage.getItem('vector.eventmon.sortField') as SortField) ?? 'componentId');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>((localStorage.getItem('vector.eventmon.sortOrder') as any) ?? 'asc');
  const [showSystem, setShowSystem] = useState<boolean>(
    localStorage.getItem('vector.eventmon.showSystem') === 'true'
  );

  useUpdateEffect(() => { localStorage.setItem('vector.eventmon.search', search); }, [search]);
  useUpdateEffect(() => {
    localStorage.setItem('vector.eventmon.showSystem', String(showSystem));
  }, [showSystem]);
  
  const sorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    let filtered = q ? rows.filter(r => Object.values(r).some(v => String(v).toLowerCase().includes(q))) : rows;

    // Filter by System toggle (Hide 00_ if disabled)
    if (!showSystem) {
      filtered = filtered.filter(r => !r.componentId.startsWith('00_'));
    }

    if (!sortField || !sortOrder) return filtered;

    return [...filtered].sort((a, b) => {
      const isNumeric = sortField.endsWith('Total') || sortField === 'errorsTotal';
      const A = isNumeric ? num(a[sortField]) : String(a[sortField]).toLowerCase();
      const B = isNumeric ? num(b[sortField]) : String(b[sortField]).toLowerCase();

      const cmp = A > B ? 1 : -1;
      return sortOrder === 'asc' ? cmp : -cmp;
    });
  }, [rows, search, sortField, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField !== field) { setSortField(field); setSortOrder('asc'); return; }
    setSortOrder(prev => (prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'));
  };

  return (
    <Card withBorder radius="lg" p="md" m={20}>
      <LoadingOverlay visible={loading && rows.length === 0} />
      <Group justify="space-between" mb="md">
        <Group gap="sm">
          <Title order={4}>Event Stream Monitor</Title>
          <Badge variant="light" color={error ? "red" : "blue"}>
            {error ? "Stream Offline" : "Live Metrics"}
          </Badge>
        </Group>

        <Group gap="sm">
          <Switch
            label="Show system components"
            checked={showSystem}
            onChange={(e) => setShowSystem(e.currentTarget.checked)}
          />
          <TextInput
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            placeholder="Filter components..."
            leftSection={<IconSearch size={16} />}
            miw={280}
          />
          <Button variant="light" leftSection={<IconRefresh size={16} />} onClick={refetch}>
            Refresh
          </Button>
        </Group>
      </Group>

      <Paper withBorder radius="md" style={{ overflow: 'hidden' }}>
        <ScrollArea.Autosize mah="70vh" type="auto">
          <Table striped highlightOnHover stickyHeader horizontalSpacing="md" verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th onClick={() => toggleSort('componentId')} style={{ cursor: 'pointer' }}>Component ID</Table.Th>
                <Table.Th>Category</Table.Th>
                <Table.Th>Implementation</Table.Th>
                <Table.Th onClick={() => toggleSort('sentEventsTotal')} style={{ cursor: 'pointer' }}>Throughput (Events)</Table.Th>
                <Table.Th onClick={() => toggleSort('errorsTotal')} style={{ cursor: 'pointer' }}>Errors</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {sorted.map((r) => (
                <Table.Tr key={r.key}>
                  <Table.Td><Text size="sm" fw={500}>{r.componentId}</Text></Table.Td>
                  <Table.Td><Badge variant="light" size="sm">{r.componentType}</Badge></Table.Td>
                  <Table.Td><Text size="xs" c="dimmed">{r.onType}</Text></Table.Td>
                  <Table.Td><Text size="xs" ff="monospace" fw={700} c="blue.7">{fmt(r.sentEventsTotal)}</Text></Table.Td>
                  <Table.Td><Text size="xs" ff="monospace" c={r.errorsTotal > 0 ? 'red' : 'dimmed'}>{fmt(r.errorsTotal)}</Text></Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea.Autosize>
      </Paper>
    </Card>
  );
};

export default Index;
