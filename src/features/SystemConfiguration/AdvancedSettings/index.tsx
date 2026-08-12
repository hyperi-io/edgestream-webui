import React, { useMemo, useState } from 'react';
import { ActionIcon, Box, Button, Group, LoadingOverlay, Text, TextInput, Tooltip } from '@mantine/core';
import { IconRefresh, IconSearch, IconX, IconDeviceFloppy, IconRestore, IconEraser } from '@tabler/icons-react';
import { DataTable } from 'mantine-datatable';
import { useEffectOnce, useUpdateEffect } from 'react-use';
import { useNotification } from 'common/useNotifications';

import { useAdvancedSettings } from '../api';

interface DataType {
  id: number;
  label: string;
  value: any;
  description: string;
  default_value: any;
}

const AdvancedSettings: React.FC = () => {
  const [search, setSearch] = useState('');
  const [settings, setSettings] = useState<DataType[]>([]);
  const { showJobNotification, showErrorNotification, showSuccessNotification } = useNotification();

  const { fetchAdvancedSettings, updateAdvancedSettings, data: rawData, loading, isUpdating } = useAdvancedSettings();

  const handleApplyChanges = async () => {
    try {
      const job = await updateAdvancedSettings(settings);

      if (job) {
        showJobNotification({ job });
      } else {
        showSuccessNotification({
          title: 'Success',
          description: 'Advanced settings updated.'
        });
      }

      fetchAdvancedSettings();
    } catch (e) {
      showErrorNotification({
        title: 'Apply Failed',
        description: 'Failed to save advanced settings.',
        error: e,
      });
    }
  };

  useEffectOnce(() => { fetchAdvancedSettings(); });

  useUpdateEffect(() => {
    if (rawData) setSettings(rawData);
  }, [rawData]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return settings;
    return settings.filter(it => it.label.toLowerCase().includes(q) || (it.description || '').toLowerCase().includes(q));
  }, [settings, search]);

  return (
    <Box pos="relative">
      <LoadingOverlay visible={loading || isUpdating} overlayProps={{ radius: 'sm', blur: 2 }} />

      <Group justify="space-between" mb="md">
        <TextInput
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          placeholder="Search Settings..."
          leftSection={<IconSearch size={16} />}
          style={{ width: 520 }}
        />
        <Group gap="xs">
          <Button variant="default" leftSection={<IconRefresh size={16} />} onClick={fetchAdvancedSettings}>Refresh</Button>
          <Button onClick={handleApplyChanges} leftSection={<IconDeviceFloppy size={16} />} loading={isUpdating}>Apply Changes</Button>
        </Group>
      </Group>

      <DataTable<DataType>
        withTableBorder withColumnBorders highlightOnHover
        records={filtered}
        columns={[
          { accessor: 'label', title: 'Key', width: 340 },
          { accessor: 'description', title: 'Name' },
          {
            accessor: 'default_value',
            title: 'Default',
            width: 150,
            render: (record) => (
              <Text size="sm" c="dimmed" style={{ fontStyle: 'italic' }}>
                {record.default_value ?? ''}
              </Text>
            ),
          },
          {
            accessor: 'value',
            title: 'Value',
            width: 360,
            render: (record) => (
              <Group wrap="nowrap" gap="xs">
                <TextInput
                  value={String(record.value ?? '')}
                  onChange={(e) => setSettings(prev => prev.map(it => it.id === record.id ? { ...it, value: e.currentTarget.value } : it))}
                  style={{ flex: 1 }}
                />
                <ActionIcon
                  variant="subtle"
                  onClick={() => setSettings(prev => prev.map(it => it.id === record.id ? { ...it, value: record.default_value } : it))}
                  tooltip="Reset to default"
                >
                  <IconRestore size={16} />
                </ActionIcon>
              </Group>
            ),
          },
        ]}
        minHeight={360}
      />
    </Box>
  );
};

export default AdvancedSettings;
