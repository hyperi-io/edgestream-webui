import React, { useMemo, useState, useCallback } from 'react';
import {
  Button,
  Drawer,
  Grid,
  Group,
  Paper,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
  MultiSelect,
  Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconPlus, IconX, IconInfoCircle } from '@tabler/icons-react';
import {
  buildFieldDefsFromSection,
} from 'common/tlsCertificates';
import FieldItemMantine, { FieldDef } from 'common/fieldItemMantine';
import { useEffectOnce, useUnmount, useUpdateEffect } from 'react-use';
import {
  useCreateDestination,
  useGetDestinationItems,
  useGetDestinationTemplate,
  useGetEventsItems,
} from 'features/Destination/api';
import { useNotification } from 'common/useNotifications';
import { isFieldVisible } from 'common/utils/drawerUtils';
import { useGetCertificates } from 'features/CertificateStore/api';
import { usePub } from 'common/usePubSub';

interface Props {
  open: boolean;
  onClose: () => void;
}

const CreateDrawer: React.FC<Props> = ({ open, onClose }) => {
  const publish = usePub();
  const { showJobNotification } = useNotification();

  const { data: destinationTemplate, getDestinationTemplate } = useGetDestinationTemplate();
  const { getDestinationItems } = useGetDestinationItems();
  const { data: eventItems = [] } = useGetEventsItems();
  const { certificate, certificateAuthority, privateKey } = useGetCertificates();
  const { createDestination, loading: pendingCreate }: any = useCreateDestination();

  const [selectedType, setSelectedType] = useState<string>('');

  const form = useForm({
    initialValues: {
      enabled: true,
      name: '',
      type: '',
      events: [] as string[],
      fallback: false,
    } as Record<string, any>,
    validate: {
      name: (v) => (!v?.trim() ? 'Name is required' : /^[A-Za-z0-9_-]+$/.test(v) ? null : 'Invalid name'),
      type: (v) => (!v ? 'Type is required' : null),
    },
    onValuesChange: (values) => {
      publish('form-field-changed', values);
    },
  });

  const configObject = useMemo(() => {
    const list = Array.isArray(destinationTemplate) ? (destinationTemplate as any[]) : [];
    return list.reduce((acc, item) => {
      if (item?.type && item.settings) acc[item.type] = item;
      return acc;
    }, {} as Record<string, any>);
  }, [destinationTemplate]);

  const { baseFields, tlsFields, optionalFields } = useMemo(() => {
    if (!selectedType || !configObject[selectedType]) {
      return { baseFields: [], tlsFields: [], optionalFields: [] };
    }
    const { base = {}, optional = {}, tls = {} } = configObject[selectedType].settings;
    const buckets = { certificateAuthority, certificate, privateKey };

    return {
      baseFields: buildFieldDefsFromSection(base, buckets) || [],
      tlsFields: buildFieldDefsFromSection(tls, buckets) || [],
      optionalFields: buildFieldDefsFromSection(optional, buckets) || [],
    };
  }, [selectedType, configObject, certificate, certificateAuthority, privateKey]);

  useUpdateEffect(() => {
    if (!selectedType) return;
    const template = configObject[selectedType];
    if (!template?.settings) return;

    // Initialize with a FLAT object structure
    const initialValues: Record<string, any> = {
      name: form.values.name || '',
      enabled: form.values.enabled ?? true,
      events: form.values.events || [],
      fallback: form.values.fallback ?? false,
      type: selectedType,
    };

    const { base = {}, optional = {}, tls = {} } = template.settings;
    [base, tls, optional].forEach(section => {
      Object.entries(section).forEach(([k, v]: [string, any]) => {
        // Direct assignment to keep dots as literal keys
        initialValues[k] = v?.default !== undefined ? v.default : '';
      });
    });

    form.initialize(initialValues);
  }, [selectedType]);

  const handleOnClose = useCallback(() => {
    form.reset();
    setSelectedType('');
    onClose();
  }, [form, onClose]);

  const handleSubmit = form.onSubmit(async (values) => {
    const { name, enabled, type, events, fallback, ...rest } = values;

    // rest is flat, so we map directly to {key, value} pairs
    const settings = Object.entries(rest)
      .filter(([_, v]) => v !== undefined && v !== null && v !== '')
      .map(([key, value]) => ({ key, value }));

    const response = await createDestination({
      name, type, enabled, routes: events, fallback, system: false, settings
    });

    if (!response?.error) {
      showJobNotification({ job: response.payload });
      handleOnClose();
      getDestinationItems();
    }
  });

  useEffectOnce(() => { getDestinationTemplate(); });
  useUnmount(() => { handleOnClose(); });

  const renderFieldList = (fields: FieldDef[]) =>
    fields
      .filter((fld) => isFieldVisible(fld, form.values))
      .map((item) => {
        const value = form.values[item.fieldKey];
        const error = form.errors[item.fieldKey];

        return (
          <FieldItemMantine
            key={item.fieldKey}
            field={item}
            value={value}
            onChange={(v) => {
              if (value === v) return;

              const newValues = { ...form.values, [item.fieldKey]: v };

              const mapping = configObject[selectedType]?.clearOnChange?.[item.fieldKey];
              if (mapping?.[String(v)]) {
                mapping[String(v)].forEach((targetKey: string) => {
                  newValues[targetKey] = '';
                  form.clearFieldError(targetKey);
                });
              }

              form.setValues(newValues);
            }}
            error={error as string}
            requiredNow={item.required || false}
          />
        );
      });

  return (
    <Drawer opened={open} onClose={handleOnClose} position="right" size={600} title="Create Destination" padding="xl">
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Grid gap="sm" align="end">
            <Grid.Col span={3}>
              <Switch
                label="Enabled"
                checked={!!form.values.enabled}
                onChange={(event) => form.setFieldValue('enabled', event.currentTarget.checked)}
              />
            </Grid.Col>
            <Grid.Col span={9}>
              <TextInput label="Name" placeholder="my_destination" withAsterisk {...form.getInputProps('name')} />
            </Grid.Col>
            <Grid.Col span={12}>
              <Select
                label="Type"
                placeholder="Select destination type"
                data={Object.keys(configObject).map(k => ({ value: k, label: configObject[k].label || k }))}
                value={selectedType || null}
                onChange={(val) => setSelectedType(val || '')}
                searchable
                clearable
                withAsterisk
                error={form.errors.type}
              />
            </Grid.Col>
          </Grid>

          {selectedType && (
            <>
              {baseFields.length > 0 && (
                <Paper withBorder p="md" radius="md">
                  <Text fw={700} size="sm" mb="xs">{selectedType.toUpperCase()}</Text>
                  <Stack gap="sm">{renderFieldList(baseFields)}</Stack>
                </Paper>
              )}

              <Paper withBorder p="md" radius="md">
                <Text fw={700} size="sm" mb="xs">Events and Metrics</Text>
                <Stack gap="xs">
                  <MultiSelect
                    label="Events and Metrics"
                    placeholder="Select items..."
                    data={eventItems.map((e: any) => ({ value: String(e), label: String(e) }))}
                    value={form.values.events || []}
                    onChange={(val) => form.setFieldValue('events', val)}
                    error={form.errors.events}
                    searchable
                    clearable
                  />
                  <Switch
                    label={<Group gap={6}><span>Set as Fallback</span><Tooltip label="Route unmatched events here."><IconInfoCircle size={16} /></Tooltip></Group>}
                    checked={!!form.values.fallback}
                    onChange={(event) => form.setFieldValue('fallback', event.currentTarget.checked)}
                  />
                </Stack>
              </Paper>

              {tlsFields.length > 0 && (
                <Paper withBorder p="md" radius="md">
                  <Text fw={700} size="sm" mb="xs">TLS</Text>
                  <Stack gap="sm">{renderFieldList(tlsFields)}</Stack>
                </Paper>
              )}

              {optionalFields.length > 0 && (
                <Paper withBorder p="md" radius="md">
                  <Text fw={700} size="sm" mb="xs">Optional</Text>
                  <Stack gap="sm">{renderFieldList(optionalFields)}</Stack>
                </Paper>
              )}
            </>
          )}

          <Group justify="flex-end" mt="xl">
            <Button variant="default" leftSection={<IconX size={16} />} onClick={handleOnClose}>Cancel</Button>
            <Button type="submit" leftSection={<IconPlus size={16} />} loading={pendingCreate} disabled={!selectedType}>Create</Button>
          </Group>
        </Stack>
      </form>
    </Drawer>
  );
};

export default CreateDrawer;
