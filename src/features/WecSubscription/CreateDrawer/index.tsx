import React, { useEffect } from 'react';
import YAML from 'yaml';

import {
  Button,
  Divider,
  Drawer,
  Flex,
  Group,
  NumberInput,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconCheck, IconChevronDown, IconDownload } from '@tabler/icons-react';

import CidrEditor from '../shared/CidrEditor';
import QueryEditor from '../shared/QueryEditor';
import { SubscriptionPayload } from '../types';

function downloadText(
  filename: string,
  text: string,
  mime = 'application/octet-stream',
) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function defaultPayload(): SubscriptionPayload {
  return {
    name: '',
    version: crypto.randomUUID(),
    uri: null,
    query: [
      { path: 'Application', selector: '*' },
      { path: 'Security', selector: '*' },
      { path: 'Setup', selector: '*' },
      { path: 'System', selector: '*' },
    ],
    heartbeat_interval: 3600,
    connection_retry_count: 5,
    connection_retry_interval: 60,
    max_time: 30,
    max_envelope_size: 512000,
    enabled: true,
    read_existing_events: true,
    content_format: 'RenderedText',
    ignore_channel_error: true,
    locale: null,
    data_locale: null,
    permitted: ['0.0.0.0/0'],
    prohibited: [],
  };
}

export default function CreateWecSubscriptionDrawer({
  opened,
  onClose,
  onSubmit,
}: {
  opened: boolean;
  onClose: () => void;
  onSubmit: (v: SubscriptionPayload) => Promise<void> | void;
}) {
  const form = useForm<SubscriptionPayload>({
    mode: 'uncontrolled',
    initialValues: defaultPayload(),
    validateInputOnChange: true,
    validate: {
      name: (v) =>
        v.trim().length < 3 ? 'Name must be at least 3 characters' : null,
      query: (rows) =>
        rows.length === 0 || rows.some((r) => !r.path || !r.selector)
          ? 'Each query row needs a path and selector'
          : null,
      heartbeat_interval: (v) => (v <= 0 ? 'Must be > 0' : null),
      connection_retry_count: (v) => (v < 0 ? 'Must be >= 0' : null),
      connection_retry_interval: (v) => (v <= 0 ? 'Must be > 0' : null),
      max_time: (v) => (v <= 0 ? 'Must be > 0' : null),
      max_envelope_size: (v) => (v < 4096 ? 'Minimum 4096' : null),
      permitted: (arr) =>
        arr.some((x) => !x) ? 'Permitted has empty values' : null,
      prohibited: (arr) =>
        arr.some((x) => !x) ? 'Prohibited has empty values' : null,
    },
  });

  useEffect(() => {
    if (opened) {
      form.setValues(defaultPayload());
      form.resetDirty();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="lg"
      title={<Text fw={600}>Create Subscription</Text>}
      radius="lg"
    >
      <form
        onSubmit={form.onSubmit((vals) => onSubmit(vals))}
        style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
      >
        <Stack gap="md" pr="sm" style={{ flex: 1, overflow: 'auto' }}>
          <Group grow align="start">
            <TextInput
              label="Name"
              placeholder="e.g. Workstations-all"
              key={form.key('name')}
              {...form.getInputProps('name')}
            />
            <TextInput
              label="Version"
              placeholder="UUID or tag"
              key={form.key('version')}
              {...form.getInputProps('version')}
            />
          </Group>

          <TextInput
            label="URI (optional)"
            placeholder="Override default collector URI"
            key={form.key('uri')}
            {...form.getInputProps('uri')}
          />

          <Divider label="Query" labelPosition="left" />
          <QueryEditor
            rows={form.getValues().query}
            onChange={(q) => form.setFieldValue('query', q)}
            error={form.errors.query as any}
          />

          <Divider label="Behaviour" labelPosition="left" />
          <Group grow>
            <NumberInput
              label="Heartbeat interval (s)"
              min={1}
              key={form.key('heartbeat_interval')}
              {...form.getInputProps('heartbeat_interval')}
            />
            <NumberInput
              label="Retry count"
              min={0}
              key={form.key('connection_retry_count')}
              {...form.getInputProps('connection_retry_count')}
            />
            <NumberInput
              label="Retry interval (s)"
              min={1}
              key={form.key('connection_retry_interval')}
              {...form.getInputProps('connection_retry_interval')}
            />
          </Group>
          <Group grow>
            <NumberInput
              label="Max time (s)"
              min={1}
              key={form.key('max_time')}
              {...form.getInputProps('max_time')}
            />
            <NumberInput
              label="Max envelope size (bytes)"
              min={4096}
              step={1024}
              key={form.key('max_envelope_size')}
              {...form.getInputProps('max_envelope_size')}
            />
          </Group>

          <Group grow>
            <Select
              label="Content format"
              data={['RenderedText', 'Events', 'Both']}
              allowDeselect={false}
              key={form.key('content_format')}
              {...form.getInputProps('content_format')}
            />
            <TextInput
              label="Locale (optional)"
              placeholder="e.g. en-US"
              key={form.key('locale')}
              {...form.getInputProps('locale')}
            />
            <TextInput
              label="Data locale (optional)"
              placeholder="e.g. en-US"
              key={form.key('data_locale')}
              {...form.getInputProps('data_locale')}
            />
          </Group>

          <Group>
            <Switch
              label="Enabled"
              key={form.key('enabled')}
              {...form.getInputProps('enabled', { type: 'checkbox' })}
            />
            <Switch
              label="Read existing events"
              key={form.key('read_existing_events')}
              {...form.getInputProps('read_existing_events', {
                type: 'checkbox',
              })}
            />
            <Switch
              label="Ignore channel error"
              key={form.key('ignore_channel_error')}
              {...form.getInputProps('ignore_channel_error', {
                type: 'checkbox',
              })}
            />
          </Group>

          <Divider label="Access control" labelPosition="left" />
          <CidrEditor
            label="Permitted CIDRs"
            value={form.getValues().permitted}
            onChange={(v) => form.setFieldValue('permitted', v)}
            placeholder="e.g. 10.0.0.0/8"
            error={form.errors.permitted as any}
          />
          <CidrEditor
            label="Prohibited CIDRs"
            value={form.getValues().prohibited}
            onChange={(v) => form.setFieldValue('prohibited', v)}
            placeholder="e.g. 172.16.32.0/22"
            error={form.errors.prohibited as any}
          />
        </Stack>

        <Divider my="md" />

        <Flex justify="space-between" gap="sm">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Group gap="xs">
            <Button
              variant="light"
              leftSection={<IconDownload size={16} />}
              rightSection={<IconChevronDown size={16} />}
              onClick={() => {
                const payload = form.getValues();
                const yaml = YAML.stringify({ subscription: payload });
                downloadText(
                  `subscription-${payload.name || 'new'}.yaml`,
                  yaml,
                  'text/yaml',
                );
              }}
            >
              YAML
            </Button>
            <Button type="submit" leftSection={<IconCheck size={16} />}>
              Save
            </Button>
          </Group>
        </Flex>
      </form>
    </Drawer>
  );
}
