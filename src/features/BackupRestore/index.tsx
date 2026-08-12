import React from 'react';
import {
  Box,
  Button,
  FileInput,
  Grid,
  Group,
  LoadingOverlay,
  NumberInput,
  SegmentedControl,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
  IconDownload,
  IconUpload,
  IconDeviceFloppy,
  IconCloud,
  IconFile,
} from '@tabler/icons-react';
import { useEffectOnce, useUpdateEffect } from 'react-use';
import { useNotification } from 'common/useNotifications';

import { useBackupSettings, useConfigManagement } from './api';

type Provider = 'gcs' | 's3' | 'file';

type FormValues = {
  enabled: boolean;
  path: string;
  bucket_name: string;
  region: string;
  access_key_id: string;
  secret_access_key: string;
  schedule_value: number;
  schedule_duration: 'h' | 'd';
  retention_value: number;
  retention_duration: 'h' | 'd';
};

type ProviderState = Record<Provider, FormValues>;

const defaultValues = (): FormValues => ({
  enabled: false,
  path: '',
  bucket_name: '',
  region: '',
  access_key_id: '',
  secret_access_key: '',
  schedule_value: 1,
  schedule_duration: 'd',
  retention_value: 30,
  retention_duration: 'd',
});

const parseUnitString = (
  s?: string,
  fallbackValue = 1,
  fallbackUnit: 'h' | 'd' = 'd',
): { value: number; unit: 'h' | 'd' } => {
  if (!s) return { value: fallbackValue, unit: fallbackUnit };
  const m = String(s).match(/^(\d+)\s*([hd])$/i);
  if (!m) return { value: fallbackValue, unit: fallbackUnit };
  const value = Number(m[1]);
  const unit = m[2].toLowerCase() as 'h' | 'd';
  return { value: Number.isFinite(value) ? value : fallbackValue, unit };
};

const ALL_PROVIDERS: Provider[] = ['gcs', 's3', 'file'];

const BackupRestore: React.FC = () => {
  const { showJobNotification } = useNotification();

  const { exportConfig, restoreConfig, loading: pendingRestoreAction } = useConfigManagement();
  const {
    getBackupSettings,
    saveBackupSettings,
    data: backupSettingsData,
    loading: pendingSaveBackupSettings
  } = useBackupSettings();

  const [cloudService, setCloudService] = React.useState<Provider>('gcs');
  const [restoreFile, setRestoreFile] = React.useState<File | null>(null);

  const [state, setState] = React.useState<ProviderState>({
    gcs: defaultValues(),
    s3: defaultValues(),
    file: defaultValues(),
  });

  const form = useForm<FormValues>({
    initialValues: defaultValues(),
    validate: {
      path: (v) => {
        if (ALL_PROVIDERS.includes(cloudService) && !v?.trim()) {
          return 'Please enter path';
        }
        return null;
      },
      bucket_name: (v) =>
        (cloudService === 'gcs' || cloudService === 's3') && !v?.trim()
          ? 'Please enter bucket name'
          : null,
      region: (v) =>
        cloudService === 's3' && !v?.trim() ? 'Please enter region' : null,
      access_key_id: (v) =>
        cloudService === 's3' && !v?.trim()
          ? 'Please enter access key id'
          : null,
      secret_access_key: (v) =>
        cloudService === 's3' && !v?.trim()
          ? 'Please enter secret access key'
          : null,
      schedule_value: (v) => (v && v >= 1 ? null : 'Must be ≥ 1'),
      retention_value: (v) => (v && v >= 1 ? null : 'Must be ≥ 1'),
    },
  });

  // Push current form values into state for the selected provider
  React.useEffect(() => {
    setState((prev) => ({
      ...prev,
      [cloudService]: { ...prev[cloudService], ...form.values },
    }));
  }, [form.values, cloudService]);

  const switchProvider = (prov: Provider) => {
    setCloudService(prov);
    form.setValues(state[prov]);
  };

  // Initial fetch
  useEffectOnce(() => {
    getBackupSettings();
  });

  // Load fetched settings into per-provider state
  useUpdateEffect(() => {
    if (!backupSettingsData) return;

    if (Array.isArray(backupSettingsData.targets)) {
      const normalized = backupSettingsData.targets
        .filter((t: any) =>
          ALL_PROVIDERS.includes((t?.provider || '').toLowerCase() as Provider),
        )
        .reduce(
          (acc: ProviderState, t: any) => {
            const prov = (t.provider || '').toLowerCase() as Provider;
            const sched = parseUnitString(t.schedule, 1, 'd');
            const rent = parseUnitString(t.retention, 30, 'd');

            acc[prov] = {
              enabled: Boolean(t.enabled),
              path: t.path ?? '',
              bucket_name: t.bucket_name ?? '',
              region: t.region ?? '',
              access_key_id: t.access_key_id ?? '',
              secret_access_key: t.secret_access_key ?? '',
              schedule_value: sched.value,
              schedule_duration: sched.unit,
              retention_value: rent.value,
              retention_duration: rent.unit,
            };
            return acc;
          },
          { gcs: defaultValues(), s3: defaultValues(), file: defaultValues() },
        );

      setState(normalized);
      form.setValues(normalized[cloudService]);
    }
  }, [backupSettingsData]);

  const handleExport = async () => {
    await exportConfig();
  };

  const handleImport = async () => {
    if (!restoreFile) return;
    try {
      const formData = new FormData();
      formData.append('config_yaml', restoreFile);
      const job = await restoreConfig(formData);
      showJobNotification({ job });
      setRestoreFile(null);
    } catch (e) {
      // Handled by run() helper
    }
  };

  const buildTargetPayload = (prov: Provider, v: FormValues) => ({
    provider: prov,
    enabled: v.enabled,
    path: v.path,
    bucket_name: v.bucket_name,
    region: v.region,
    access_key_id: v.access_key_id,
    secret_access_key: v.secret_access_key,
    retention: `${v.retention_value}${v.retention_duration}`,
    schedule: `${v.schedule_value}${v.schedule_duration}`,
  });

  const handleSave = async () => {
    form.validate();
    if (form.isValid() === false && state[cloudService].enabled) return;

    const merged: ProviderState = {
      ...state,
      [cloudService]: { ...state[cloudService], ...form.values },
    };

    const payload = {
      targets: ALL_PROVIDERS.map((p) => buildTargetPayload(p, merged[p])),
    };

    try {
      const job = await saveBackupSettings(payload);
      showJobNotification({ job });
    } catch (e) {
      // Handled by run() helper
    }
  };

  const isBusy = pendingSaveBackupSettings || pendingRestoreAction;

  return (
    <Box pos="relative">
      <LoadingOverlay
        visible={isBusy}
        overlayProps={{ blur: 2, radius: 'sm' }}
      />

      <Grid gap="lg">
        {/* Left column: Export / Restore */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Stack gap="md">
            <Title order={5}>Manual Export</Title>
            <Text size="sm">
              Manually export an EdgeStream Hub configuration backup file
              (.yaml) and save it to your computer.
            </Text>
            <Button
              leftSection={<IconDownload size={16} />}
              onClick={handleExport}
              style={{ width: 'fit-content' }}
            >
              Export
            </Button>

            <Title order={5} mt="md">
              Restore EdgeStream Hub Configuration
            </Title>
            <Text size="sm">
              Restore EdgeStream Hub configuration from your configuration
              backup file (.yaml).
            </Text>

            <FileInput
              label="Backup file"
              placeholder="Click to select .yaml/.yml"
              leftSection={<IconUpload size={16} />}
              value={restoreFile}
              onChange={setRestoreFile}
              accept=".yaml,.yml"
              clearable
              withAsterisk
            />
            <Button
              onClick={handleImport}
              disabled={!restoreFile}
              loading={pendingRestoreAction}
              style={{ width: 'fit-content' }}
            >
              Restore
            </Button>
          </Stack>
        </Grid.Col>

        {/* Right column: Configuration Backup */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Stack gap="md">
            <Title order={5}>Configuration Backup</Title>
            <Text size="sm">Configure backups of the EdgeStream Hub settings.</Text>

            <SegmentedControl
              fullWidth
              value={cloudService}
              onChange={(v) => switchProvider(v as Provider)}
              data={[
                {
                  value: 'gcs',
                  label: (
                    <Group gap="xs" wrap="nowrap">
                      <IconCloud size={16} />
                      <Text size="sm">GCS</Text>
                    </Group>
                  ),
                },
                {
                  value: 's3',
                  label: (
                    <Group gap="xs" wrap="nowrap">
                      <IconCloud size={16} />
                      <Text size="sm">S3</Text>
                    </Group>
                  ),
                },
                {
                  value: 'file',
                  label: (
                    <Group gap="xs" wrap="nowrap">
                      <IconFile size={16} />
                      <Text size="sm">Local</Text>
                    </Group>
                  ),
                },
              ]}
            />

            <Switch
              checked={form.values.enabled}
              onChange={(e) =>
                form.setFieldValue('enabled', e.currentTarget.checked)
              }
              label={<Text fw={500}>Enabled</Text>}
            />

            <Stack gap="sm">
              {cloudService === 'file' && (
                <TextInput
                  label="Path"
                  placeholder="/path/to/dir"
                  withAsterisk
                  {...form.getInputProps('path')}
                />
              )}

              {cloudService === 'gcs' && (
                <>
                  <TextInput
                    label="Bucket Name"
                    placeholder="my-bucket"
                    withAsterisk
                    {...form.getInputProps('bucket_name')}
                  />
                  <TextInput
                    label="Path"
                    placeholder="backups/"
                    withAsterisk
                    {...form.getInputProps('path')}
                  />
                </>
              )}

              {cloudService === 's3' && (
                <>
                  <TextInput
                    label="Bucket Name"
                    placeholder="my-bucket"
                    withAsterisk
                    {...form.getInputProps('bucket_name')}
                  />
                  <TextInput
                    label="Path"
                    placeholder="backups/"
                    withAsterisk
                    {...form.getInputProps('path')}
                  />
                  <TextInput
                    label="Region"
                    placeholder="ap-southeast-2"
                    withAsterisk
                    {...form.getInputProps('region')}
                  />
                  <TextInput
                    label="Access Key ID"
                    withAsterisk
                    {...form.getInputProps('access_key_id')}
                  />
                  <TextInput
                    label="Secret Access Key"
                    withAsterisk
                    {...form.getInputProps('secret_access_key')}
                  />
                </>
              )}

              <Stack gap={2} mt="md">
                <Text fw={600} size="sm">Schedule</Text>
                <Text size="xs" c="dimmed">
                  Perform backup of configuration files every scheduled period
                </Text>
              </Stack>
              <Group wrap="nowrap" gap="xs" align="flex-end">
                <NumberInput
                  label="Every"
                  min={1}
                  {...form.getInputProps('schedule_value')}
                  style={{ flex: 1 }}
                />
                <Select
                  label="Unit"
                  data={[
                    { value: 'h', label: `Hour${form.values.schedule_value > 1 ? 's' : ''}` },
                    { value: 'd', label: `Day${form.values.schedule_value > 1 ? 's' : ''}` },
                  ]}
                  {...form.getInputProps('schedule_duration')}
                  style={{ flex: 1 }}
                />
              </Group>

              <Stack gap={2} mt="md">
                <Text fw={600} size="sm">Retention</Text>
                <Text size="xs" c="dimmed">
                  Maximum retention period for backup configuration files
                </Text>
              </Stack>
              <Group wrap="nowrap" gap="xs" align="flex-end">
                <NumberInput
                  label="Keep for"
                  min={1}
                  {...form.getInputProps('retention_value')}
                  style={{ flex: 1 }}
                />
                <Select
                  label="Unit"
                  data={[
                    { value: 'h', label: `Hour${form.values.retention_value > 1 ? 's' : ''}` },
                    { value: 'd', label: `Day${form.values.retention_value > 1 ? 's' : ''}` },
                  ]}
                  {...form.getInputProps('retention_duration')}
                  style={{ flex: 1 }}
                />
              </Group>

              <Button
                leftSection={<IconDeviceFloppy size={16} />}
                loading={pendingSaveBackupSettings}
                onClick={handleSave}
                fullWidth
                mt="md"
              >
                Save Changes
              </Button>
            </Stack>
          </Stack>
        </Grid.Col>
      </Grid>
    </Box>
  );
};

export default BackupRestore;
