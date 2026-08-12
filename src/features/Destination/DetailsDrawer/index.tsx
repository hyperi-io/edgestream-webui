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
  MultiSelect,
  Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconDeviceFloppy, IconX, IconInfoCircle } from '@tabler/icons-react';
import {
  isFieldVisible,
  isFieldRequired,
  isRequiredByRequirementSets,
  valueIsEmpty,
} from 'common/utils/drawerUtils';
import { buildFieldDefsFromSection } from 'common/tlsCertificates';
import FieldItemMantine, { FieldDef } from 'common/fieldItemMantine';
import {
  useGetDestinationItems,
  useGetDestinationTemplateItem,
  useGetEventsItems,
  useUpdateDestination,
} from 'features/Destination/api';
import { useNotification } from 'common/useNotifications';
import { usePub } from 'common/usePubSub';
import { useGetCertificates } from 'features/CertificateStore/api';

type Rule = { key: string; operator?: 'eq' | 'ne' | 'in' | 'nin' | 'truthy' | 'falsy'; value?: any };
type RequirementSet = { when?: Rule[]; require: string[] };
type TemplateType = {
  type: string;
  settings: { base: Record<string, any>; tls: Record<string, any>; optional: Record<string, any> };
  requirements?: RequirementSet[];
  clearOnChange?: Record<string, Record<string, string[]>>;
};

interface Props {
  destination: any;
  open: boolean;
  onClose: () => void;
}

const DetailsDrawer: React.FC<Props> = ({ destination, open, onClose }) => {
  const publish = usePub();
  const { showJobNotification } = useNotification();
  const { getDestinationItems } = useGetDestinationItems();

  const {
    data: destinationTemplate,
    getDestinationTemplateItem,
    loading: loadingTemplate,
  } = useGetDestinationTemplateItem();

  const { certificate, certificateAuthority, privateKey, getCertificates } = useGetCertificates();
  const { data: eventItems = [] } = useGetEventsItems();
  const { updateDestination, loading: pendingUpdate }: any = useUpdateDestination();

  const lastRequestedTypeRef = useRef<string | null>(null);
  const lastLoadedIdRef = useRef<string | null>(null);

  const form = useForm({
    initialValues: {
      enabled: false,
      routes: [] as string[],
      fallback: false,
    } as Record<string, any>,
  });

  const activeTemplate = useMemo<TemplateType | null>(() => {
    if (!destinationTemplate) return null;
    if (Array.isArray(destinationTemplate)) {
      const found = destinationTemplate.find((t: any) => t.type === destination?.type);
      return found?.settings ? found : null;
    }
    // @ts-ignore
    return (destinationTemplate as TemplateType).settings ? (destinationTemplate as TemplateType) : null;
  }, [destinationTemplate, destination?.type]);

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

  const eventOptions = useMemo(() =>
      (eventItems || []).map((e: any) => ({ value: String(e), label: String(e) })),
    [eventItems]
  );

  const loadData = useCallback(() => {
    if (!destination) return;

    const initialValues: Record<string, any> = {
      enabled: !!destination.enabled,
      routes: (destination.routes as string[]) ?? [],
      fallback: !!destination.fallback,
    };

    if (Array.isArray(destination.settings)) {
      destination.settings.forEach((item: any) => {
        if (item.key) initialValues[item.key] = item.value;
      });
    } else if (typeof destination.settings === 'object' && destination.settings !== null) {
      Object.entries(destination.settings).forEach(([categoryOrKey, val]: [string, any]) => {
        if (['base', 'tls', 'optional'].includes(categoryOrKey) && typeof val === 'object') {
          Object.entries(val).forEach(([fieldKey, fieldDef]: [string, any]) => {
            if (fieldDef && fieldDef.value !== undefined) {
              initialValues[fieldKey] = fieldDef.value;
            }
          });
        } else {
          initialValues[categoryOrKey] = val;
        }
      });
    }

    form.initialize(initialValues);
  }, [destination, form]);

  useEffect(() => {
    if (open) getCertificates();
  }, [open, getCertificates]);

  useEffect(() => {
    if (open && destination?.type && lastRequestedTypeRef.current !== destination.type) {
      lastRequestedTypeRef.current = destination.type;
      getDestinationTemplateItem(destination.type);
    }
  }, [open, destination?.type, getDestinationTemplateItem]);

  useEffect(() => {
    if (open && destination?.name && lastLoadedIdRef.current !== destination.name) {
      lastLoadedIdRef.current = destination.name;
      loadData();
    }
  }, [open, destination, loadData]);

  const handleOnClose = useCallback(() => {
    lastRequestedTypeRef.current = null;
    lastLoadedIdRef.current = null;
    form.reset();
    onClose();
  }, [form, onClose]);

  const handleSubmit = form.onSubmit(async (values) => {
    if (!destination) return;
    const { enabled, routes, fallback, ...rest } = values;

    // Since state is flat, map entries directly
    const settings = Object.entries(rest)
      .filter(([_, v]) => v !== undefined && v !== null && v !== '')
      .map(([key, value]) => ({ key, value }));

    const response = await updateDestination({
      name: destination.name,
      type: destination.type,
      system: !!destination.system,
      routes: routes ?? [],
      fallback: !!fallback,
      enabled: !!enabled,
      settings,
    });

    if (!response?.error) {
      showJobNotification({ job: response.payload });
      getDestinationItems();
      handleOnClose();
    }
  });

  const renderFields = (fields: FieldDef[]) =>
    fields
      .filter((f) => isFieldVisible(f, form.values))
      .map((item) => {
        // Direct property access for flat keys
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

  const fetching = loadingTemplate || pendingUpdate;

  return (
    <Drawer
      opened={open}
      onClose={handleOnClose}
      position="right"
      size={600}
      title={destination ? `Edit Destination: ${destination.name}` : 'Edit Destination'}
      padding="xl"
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md" pos="relative">
          <LoadingOverlay visible={!!fetching} overlayProps={{ blur: 2 }} />

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
              <TextInput label="Name" value={destination?.name ?? ''} readOnly description="Name cannot be changed" />
            </Grid.Col>
          </Grid>

          {activeTemplate && (
            <>
              {fieldSections.base.length > 0 && (
                <Paper withBorder p="md" radius="md">
                  <Text fw={700} size="sm" mb="xs">{String(destination?.type ?? '').toUpperCase().replace(/_/g, ' ')}</Text>
                  <Stack gap="sm">{renderFields(fieldSections.base)}</Stack>
                </Paper>
              )}

              <Paper withBorder p="md" radius="md">
                <Text fw={700} size="sm" mb="xs">Events and Metrics</Text>
                <Stack gap="sm">
                  <MultiSelect
                    label="Events and Metrics"
                    placeholder="Select routes"
                    data={eventOptions}
                    value={form.values.routes || []}
                    onChange={(v) => {
                      const newValues = { ...form.values, routes: v };
                      form.setValues(newValues);
                      publish('form-field-changed', newValues);
                    }}
                    searchable
                    clearable
                  />
                  <Switch
                    label={
                      <Group gap={6}>
                        <span>Set as Fallback</span>
                        <Tooltip label="Route unmatched events here.">
                          <IconInfoCircle size={16} />
                        </Tooltip>
                      </Group>
                    }
                    checked={!!form.values.fallback}
                    onChange={(e) => {
                      const v = e.currentTarget.checked;
                      const newValues = { ...form.values, fallback: v };
                      form.setValues(newValues);
                      publish('form-field-changed', newValues);
                    }}
                  />
                </Stack>
              </Paper>

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
            </>
          )}

          <Group justify="flex-end" mt="xl">
            <Button variant="default" leftSection={<IconX size={16} />} onClick={handleOnClose}>Cancel</Button>
            <Button type="submit" leftSection={<IconDeviceFloppy size={16} />} loading={pendingUpdate}>Update</Button>
          </Group>
        </Stack>
      </form>
    </Drawer>
  );
};

export default DetailsDrawer;
