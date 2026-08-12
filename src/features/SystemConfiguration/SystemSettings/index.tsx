import React from 'react';
import {
  Box,
  Button,
  Grid,
  Group,
  LoadingOverlay,
  Select,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconDeviceFloppy } from '@tabler/icons-react';
import { useEffectOnce, useUpdateEffect } from 'react-use';
import { useNotification } from 'common/useNotifications';

import { useSystemSettings } from '../api';

const FALLBACK_TIMEZONES = [
  'UTC',
  'Etc/UTC',
  'Australia/Melbourne',
  'Australia/Sydney',
];

const SystemSettings: React.FC = () => {
  const { showJobNotification, showErrorNotification } = useNotification();

  const {
    fetchSystemSettings,
    updateSystemSettings,
    fetchTimezones,
    data: systemSettings,
    timezones: tzData,
    loading: systemLoading,
  } = useSystemSettings();

  const form = useForm({
    initialValues: {
      hostname: '',
      org_id: '',
      site_id: '',
      timezone: '',
    },
    validate: {
      hostname: (v) =>
        v && !/^[a-zA-Z0-9][a-zA-Z0-9-]{0,62}$/.test(v)
          ? 'Invalid hostname pattern'
          : null,
      org_id: (v) =>
        v && !/^[a-zA-Z0-9][a-zA-Z0-9-_]{0,62}$/.test(v)
          ? 'Invalid org id pattern'
          : null,
      site_id: (v) =>
        v && !/^[a-zA-Z0-9][a-zA-Z0-9-_]{0,62}$/.test(v)
          ? 'Invalid site id pattern'
          : null,
    },
  });

  const [ready, setReady] = React.useState(false);

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      const job = await updateSystemSettings(values);

      if (job) {
        showJobNotification({ job });
      }

      fetchSystemSettings(); // Refresh data after update
    } catch (e) {
      showErrorNotification({
        title: 'Failed to Apply Changes',
        description: 'The system settings could not be updated.',
        error: e,
      });
    }
  });

  useUpdateEffect(() => {
    if (systemSettings && Object.keys(systemSettings).length > 0) {
      form.setValues(systemSettings);
      setReady(true);
    }
  }, [systemSettings]);

  useEffectOnce(() => {
    fetchSystemSettings();
    fetchTimezones();
  });

  const timeZones = React.useMemo(() => {
    const cleaned =
      Array.isArray(tzData) && tzData.length > 0
        ? tzData
          .filter((z): z is string => typeof z === 'string')
          .map((z) => z.trim())
          .filter(Boolean)
        : [];

    return cleaned.length > 0 ? cleaned : FALLBACK_TIMEZONES;
  }, [tzData]);

  const tzOptions = React.useMemo(() => {
    const options = [
      { value: 'localtime', label: 'Local Timezone' },
      ...[...timeZones].sort().map((t) => ({ value: t, label: t })),
    ];

    const current = form.values.timezone;
    if (current && !options.some((o) => o.value === current)) {
      options.unshift({ value: current, label: `${current} (legacy)` });
    }

    return options;
  }, [timeZones, form.values.timezone]);

  if (!ready && systemLoading) {
    return (
      <Box
        h="calc(100vh - 200px)"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: 200,
        }}
      >
        <Text c="dimmed" fz={36}>
          Loading…
        </Text>
      </Box>
    );
  }

  return (
    <Box pos="relative">
      <LoadingOverlay
        visible={systemLoading}
        overlayProps={{ radius: 'sm', blur: 2 }}
      />

      <form onSubmit={handleSubmit}>
        <Stack gap="md" mih={500}>
          <Grid gap="sm">
            <Grid.Col span={8}>
              <Stack gap="xs">
                <Text fw={600}>Hostname</Text>
                <TextInput
                  placeholder="Hostname"
                  {...form.getInputProps('hostname')}
                />

                <Text fw={600} mt="sm">
                  Org ID
                </Text>
                <TextInput
                  placeholder="Org ID"
                  {...form.getInputProps('org_id')}
                />

                <Text fw={600} mt="sm">
                  Site ID
                </Text>
                <TextInput
                  placeholder="Site ID"
                  {...form.getInputProps('site_id')}
                />

                <Group justify="space-between" mt="sm">
                  <Text fw={600}>Timezone</Text>
                </Group>

                <Select
                  data={tzOptions}
                  searchable
                  allowDeselect={false}
                  {...form.getInputProps('timezone')}
                />
              </Stack>
            </Grid.Col>
          </Grid>

          <Group justify="flex-start" mt="sm">
            <Button
              type="submit"
              leftSection={<IconDeviceFloppy size={16} />}
              loading={systemLoading}
            >
              Apply Changes
            </Button>

            <Button
              type="button"
              variant="default"
              onClick={() => fetchTimezones()}
            >
              Refresh timezones
            </Button>
          </Group>
        </Stack>
      </form>
    </Box>
  );
};

export default SystemSettings;
