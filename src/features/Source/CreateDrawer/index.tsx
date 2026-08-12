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
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
  buildFieldDefsFromSection,
} from 'common/tlsCertificates';
import FieldItemMantine, { FieldDef } from 'common/fieldItemMantine';
import { useEffectOnce, useUnmount, useUpdateEffect } from 'react-use';
import { useNotification } from 'common/useNotifications';
import { isFieldVisible } from 'common/utils/drawerUtils';
import {
  useCreateSource,
  useGetSourceItems,
  useGetSourceTemplate,
} from 'features/Source/api';
import { useGetCertificates } from 'features/CertificateStore/api';
import { usePub } from 'common/usePubSub';

interface Props {
  open: boolean;
  onClose: () => void;
}

const CreateDrawer: React.FC<Props> = ({ open, onClose }) => {
  const publish = usePub();
  const { showJobNotification } = useNotification();

  const { data: sourceTemplate, getSourceTemplate } = useGetSourceTemplate();
  const { getSourceItems } = useGetSourceItems();

  const {
    certificate,
    certificateAuthority,
    privateKey,
    getCertificates
  } = useGetCertificates();

  const { createSource, loading: pendingCreate }: any = useCreateSource();

  const [selectedType, setSelectedType] = useState<string>('');

  const form = useForm({
    initialValues: {
      enabled: true,
      name: '',
      type: '',
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
    const list = Array.isArray(sourceTemplate) ? (sourceTemplate as any[]) : [];
    return list.reduce((acc, item) => {
      if (item?.type && item.settings) acc[item.type] = item;
      return acc;
    }, {} as Record<string, any>);
  }, [sourceTemplate]);

  const { baseFields, tlsFields, optionalFields } = useMemo(() => {
    if (!selectedType || !configObject[selectedType]) {
      return { baseFields: [], tlsFields: [], optionalFields: [] };
    }
    const { base = {}, optional = {}, tls = {} } = configObject[selectedType].settings;

    // Provide the buckets to the utility so Select enums are populated
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

    const initialValues: Record<string, any> = {
      name: form.values.name || '',
      enabled: form.values.enabled ?? true,
      type: selectedType,
    };

    const { base = {}, optional = {}, tls = {} } = template.settings;
    [base, tls, optional].forEach(section => {
      Object.entries(section).forEach(([k, v]: [string, any]) => {
        initialValues[k] = v.default !== undefined ? v.default : '';
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
    const { name, enabled, type, ...rest } = values;

    const settings = Object.entries(rest)
      .filter(([_, v]) => v !== undefined && v !== null && v !== '')
      .map(([key, value]) => ({ key, value }));

    const payload = { name, type, enabled, system: false, settings };
    const response = await createSource(payload);

    if (!response.error) {
      showJobNotification({ job: response.payload });
      handleOnClose();
      getSourceItems();
    }
  });

  // Load both templates and the certificates on mount
  useEffectOnce(() => {
    getSourceTemplate();
    getCertificates();
  });

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
    <Drawer opened={open} onClose={handleOnClose} position="right" size={600} title="Create Source" padding="xl">
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
              <TextInput label="Name" placeholder="my_source" withAsterisk {...form.getInputProps('name')} />
            </Grid.Col>
            <Grid.Col span={12}>
              <Select
                label="Type"
                placeholder="Select source type"
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
            <Button variant="default" onClick={handleOnClose}>Cancel</Button>
            <Button type="submit" loading={pendingCreate} disabled={!selectedType}>Create</Button>
          </Group>
        </Stack>
      </form>
    </Drawer>
  );
};

export default CreateDrawer;
