import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Group,
  LoadingOverlay,
  Stack,
  Table,
  Text,
  TextInput,
  ActionIcon,
} from '@mantine/core';
import {
  IconRefresh,
  IconSearch,
  IconX,
  IconArrowUpCircle,
} from '@tabler/icons-react';
import { useEffectOnce, useUpdateEffect } from 'react-use';
import { useNotification } from 'common/useNotifications';
import { useUpdates } from './api';

type DataType = {
  archive: string;
  available_version: string;
  current_version: string;
  description: string;
  origin: string;
  package: string;
  site: string;
};

const UpdatesPage: React.FC = () => {
  const { showJobNotification, showErrorNotification } = useNotification();

  const {
    fetchPackages,
    applyUpdates,
    data,
    isFetching,
    isUpdating
  } = useUpdates();

  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffectOnce(() => {
    fetchPackages().catch((e) => {
      showErrorNotification({
        title: 'Failed to load packages',
        error: e,
      });
    });
  });

  // Clear selection whenever the package list updates
  useUpdateEffect(() => {
    setSelected(new Set());
  }, [data]);

  const filtered = useMemo(() => {
    const packages = (data || []) as DataType[];
    if (!search.trim()) return packages;
    const q = search.trim().toLowerCase();
    return packages.filter((p) => p.package?.toLowerCase()?.includes(q));
  }, [data, search]);

  const disabledPkg = (pkg: string) => pkg === 'edgestream-api';

  const allSelectable = useMemo(
    () => filtered.filter((p) => !disabledPkg(p.package)).map((p) => p.package),
    [filtered],
  );

  const allSelected = allSelectable.length > 0 && allSelectable.every((name) => selected.has(name));
  const someSelected = selected.size > 0 && !allSelected;

  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        allSelectable.forEach((name) => next.delete(name));
      } else {
        allSelectable.forEach((name) => next.add(name));
      }
      return next;
    });
  };

  const toggleOne = (name: string) => {
    if (disabledPkg(name)) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const handleRefresh = async () => {
    try {
      await fetchPackages({ refresh: true });
    } catch (e: any) {
      showErrorNotification({
        title: 'Failed to refresh packages',
        error: e?.response?.data || e,
      });
    }
  };

  const handleUpgrade = async () => {
    const names = Array.from(selected);
    if (names.length === 0) return;

    try {
      const job = await applyUpdates(names);
      if (job) showJobNotification({ job });

      setSelected(new Set());
      fetchPackages({ refresh: true });
    } catch (e: any) {
      showErrorNotification({
        title: 'Upgrade failed',
        error: e?.response?.data || e,
      });
    }
  };

  return (
    <Box pos="relative">
      <LoadingOverlay
        visible={isFetching || isUpdating}
        overlayProps={{ blur: 2, radius: 'sm' }}
      />

      <Stack gap="md">
        <Group justify="space-between">
          <TextInput
            placeholder="Search packages..."
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            leftSection={<IconSearch size={16} />}
            style={{ width: 'min(480px, 100%)' }}
            rightSection={search && (
              <ActionIcon variant="subtle" color="gray" onClick={() => setSearch('')}>
                <IconX size={14} />
              </ActionIcon>
            )}
          />

          <Button
            variant="light"
            leftSection={<IconRefresh size={16} />}
            loading={isFetching}
            onClick={handleRefresh}
          >
            Check for Updates
          </Button>
        </Group>

        {/* Table */}
        <Table highlightOnHover verticalSpacing="xs" stickyHeader withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: 48 }}>
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={toggleAll}
                />
              </Table.Th>
              <Table.Th style={{ width: 220 }}>Package</Table.Th>
              <Table.Th style={{ width: 160 }}>Current Version</Table.Th>
              <Table.Th style={{ width: 160 }}>New Version</Table.Th>
              <Table.Th>Description</Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {filtered.map((row) => {
              const name = row.package;
              const isDisabled = disabledPkg(name);
              return (
                <Table.Tr key={name}>
                  <Table.Td>
                    <Checkbox
                      checked={selected.has(name)}
                      disabled={isDisabled}
                      onChange={() => toggleOne(name)}
                    />
                  </Table.Td>
                  <Table.Td><Text fw={500}>{name}</Text></Table.Td>
                  <Table.Td><Text size="sm">{row.current_version || '—'}</Text></Table.Td>
                  <Table.Td><Text size="sm" fw={600} c="blue">{row.available_version || '—'}</Text></Table.Td>
                  <Table.Td><Text size="sm" lineClamp={1}>{row.description || '—'}</Text></Table.Td>
                </Table.Tr>
              );
            })}
            {filtered.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={5}>
                  <Text c="dimmed" ta="center" py="xl">
                    {search ? 'No packages match your search.' : 'System is up to date.'}
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>

        <Group>
          <Button
            leftSection={<IconArrowUpCircle size={18} />}
            onClick={handleUpgrade}
            disabled={selected.size === 0}
            loading={isUpdating}
          >
            Upgrade {selected.size > 0 ? `(${selected.size} package${selected.size > 1 ? 's' : ''})` : ''}
          </Button>
        </Group>
      </Stack>
    </Box>
  );
};

export default UpdatesPage;
