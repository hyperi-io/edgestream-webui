import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Button,
  Drawer,
  Grid,
  Group,
  LoadingOverlay,
  Paper,
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
import { useNotification } from 'common/useNotifications';
import { isFieldVisible, isFieldRequired, isRequiredByRequirementSets, valueIsEmpty } from 'common/utils/drawerUtils';
import {
  useGetSourceItems,
  useGetSourceTemplateItem,
  useUpdateSource,
} from 'features/Source/api';
import { useGetCertificates } from 'features/CertificateStore/api';
import { usePub } from 'common/usePubSub';

type Rule = { key: string; operator?: 'eq' | 'ne' | 'in' | 'nin' | 'truthy' | 'falsy'; value?: any };
type RequirementSet = { when?: Rule[]; require: string[] };
type TemplateType = {
  type: string;
  settings: { base: Record<string, any>; tls: Record<string, any>; optional: Record<string, any> };
  requirements?: RequirementSet[];
  clearOnChange?: Record<string, Record<string, string[]>>;
};

interface Props {
  source: any | null | undefined;
  open: boolean;
  onClose: () => void;
}

const DetailsDrawer: React.FC<Props> = ({ source, open, onClose }) => {
  const publish = usePub();
  const { showJobNotification } = useNotification();
  const { getSourceItems } = useGetSourceItems();

  const { data: sourceTemplate, getSourceTemplateItem, loading: loadingTemplate } = useGetSourceTemplateItem();
  const { certificate, certificateAuthority, privateKey, getCertificates } = useGetCertificates();
  const { updateSource, loading: pendingUpdate }: any = useUpdateSource();

  const lastRequestedTypeRef = useRef<string | null>(null);
  const lastLoadedNameRef = useRef<string | null>(null);

  const form = useForm({
    initialValues: { enabled: false } as Record<string, any>,
  });

  const activeTemplate = useMemo<TemplateType | null>(() => {
    if (!sourceTemplate) return null;
    const tpl = Array.isArray(sourceTemplate)
      ? sourceTemplate.find((t: any) => t.type === source?.type)
      : sourceTemplate;
    return tpl?.settings ? (tpl as TemplateType) : null;
  }, [sourceTemplate, source?.type]);

  const fieldSections = useMemo(() => {
    if (!activeTemplate?.settings) return { base: [], tls: [], optional: [] };

    const { base = {}, optional = {}, tls = {} } = activeTemplate.settings;
    const buckets = { certificateAuthority, certificate, privateKey };

    return {
      base: buildFieldDefsFromSection(base, buckets) || [],
      tls: buildFieldDefsFromSection(tls, buckets) || [],
      optional: buildFieldDefsFromSection(optional, buckets) || [],
    };
  }, [activeTemplate, certificate, certificateAuthority, privateKey]);

  const loadValuesFromSource = useCallback(() => {
    if (!source) return;
    const initialValues: Record<string, any> = { enabled: !!source.enabled };

    if (source.settings && !Array.isArray(source.settings)) {
      const sections = ['base', 'tls', 'optional'];

      sections.forEach((section) => {
        const sectionData = source.settings[section];
        if (sectionData) {
          Object.entries(sectionData).forEach(([key, field]: [string, any]) => {
            initialValues[key] = field.value ?? field.default ?? '';
          });
        }
      });
    }
    else if (Array.isArray(source.settings)) {
      source.settings.forEach((item: any) => {
        if (item.key) initialValues[item.key] = item.value;
      });
    }

    form.initialize(initialValues);
  }, [source, form]);

  useEffect(() => {
    if (open) {
      getCertificates();
    }
  }, [open, getCertificates]);

  useEffect(() => {
    if (open && source?.type && lastRequestedTypeRef.current !== source.type) {
      lastRequestedTypeRef.current = source.type;
      getSourceTemplateItem(source.type);
    }
  }, [open, source?.type, getSourceTemplateItem]);

  useEffect(() => {
    if (open && source?.name && lastLoadedNameRef.current !== source.name) {
      lastLoadedNameRef.current = source.name;
      loadValuesFromSource();
    }
  }, [open, source, loadValuesFromSource]);

  const handleOnClose = useCallback(() => {
    lastRequestedTypeRef.current = null;
    lastLoadedNameRef.current = null;
    form.reset();
    onClose();
  }, [form, onClose]);

  const handleSubmit = form.onSubmit(async (values) => {
    if (!source) return;
    const { enabled, ...rest } = values;

    const settings = Object.entries(rest)
      .filter(([_, v]) => v !== undefined && v !== null && v !== '')
      .map(([key, value]) => ({ key, value }));

    const response = await updateSource({
      name: source.name,
      type: source.type,
      enabled: !!enabled,
      settings,
    });

    if (!response?.error) {
      showJobNotification({ job: response.payload });
      getSourceItems();
      handleOnClose();
    }
  });

  const renderFields = (fields: FieldDef[]) =>
    fields
      .filter((f) => isFieldVisible(f, form.values))
      .map((item) => {
        const value = form.values[item.fieldKey];
        const error = form.errors[item.fieldKey];
        const requiredNow = isFieldRequired(item, form.values) ||
          isRequiredByRequirementSets(item.fieldKey, form.values, activeTemplate?.requirements);

        return (
          <FieldItemMantine
            key={item.fieldKey}
            field={item}
            value={value ?? (item.type === 'multiselect' ? [] : '')}
            onChange={(v) => {
              if (value === v) return;

              // Force update via setValues to treat dot-notation as a flat literal key
              const newValues = { ...form.values, [item.fieldKey]: v };

              const mapping = activeTemplate?.clearOnChange?.[item.fieldKey];
              if (mapping?.[String(v)]) {
                mapping[String(v)].forEach((k) => {
                  newValues[k] = '';
                  form.clearFieldError(k);
                });
              }

              form.setValues(newValues);
              if (!valueIsEmpty(v, item.type)) form.clearFieldError(item.fieldKey);
              publish('form-field-changed', newValues);
            }}
            error={error as string}
            requiredNow={requiredNow}
          />
        );
      });

  const fetching = !!loadingTemplate || !!pendingUpdate;

  return (
    <Drawer
      opened={open}
      onClose={handleOnClose}
      position="right"
      size={600}
      title={source ? `Edit Source: ${source.name}` : 'Edit Source'}
      padding="xl"
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md" pos="relative">
          <LoadingOverlay visible={fetching} overlayProps={{ blur: 2 }} />

          <Grid gap="sm" align="end">
            <Grid.Col span={3}>
              <Switch
                label="Enabled"
                checked={!!form.values.enabled}
                onChange={(e) => {
                  const v = e.currentTarget.checked;
                  const newValues = { ...form.values, enabled: v };
                  form.setValues(newValues);
                  publish('form-field-changed', newValues);
                }}
              />
            </Grid.Col>
            <Grid.Col span={9}>
              <TextInput label="Name" value={source?.name ?? ''} readOnly description="Name cannot be changed" />
            </Grid.Col>
          </Grid>

          {fieldSections.base.length > 0 && (
            <Paper withBorder p="md" radius="md">
              <Text fw={700} size="sm" mb="xs">{String(source?.type ?? '').toUpperCase().replace(/_/g, ' ')}</Text>
              <Stack gap="sm">{renderFields(fieldSections.base)}</Stack>
            </Paper>
          )}

          {fieldSections.tls.length > 0 && (
            <Paper withBorder p="md" radius="md">
              <Text fw={700} size="sm" mb="xs">TLS</Text>
              <Stack gap="sm">{renderFields(fieldSections.tls)}</Stack>
            </Paper>
          )}

          {fieldSections.optional.length > 0 && (
            <Paper withBorder p="md" radius="md">
              <Text fw={700} size="sm" mb="xs">Optional</Text>
              <Stack gap="sm">{renderFields(fieldSections.optional)}</Stack>
            </Paper>
          )}

          <Group justify="flex-end" mt="xl">
            <Button variant="default" onClick={handleOnClose}>Cancel</Button>
            <Button type="submit" loading={pendingUpdate}>Update</Button>
          </Group>
        </Stack>
      </form>
    </Drawer>
  );
};

export default DetailsDrawer;
