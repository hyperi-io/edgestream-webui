import React, { useState } from 'react';
import { ActionIcon, Group, LoadingOverlay, NumberInput, Select, Stack, TextInput, Box } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import uniqBy from 'lodash/uniqBy';

import NetworkItemDNS from './NetworkItemDNS';
import NetworkItemForwarder from './NetworkItemForwarder';
import NetworkItemNTP from './NetworkItemNTP';
import NetworkItemStaticHost from './NetworkItemStaticHost';
import NetworkItemStaticRoute from './NetworkItemStaticRoute';

type Props = {
  type: 'dns' | 'ntp' | 'static-routes' | 'forwarder' | 'static-hosts';
  items: any[];
  interfaces?: any[];
  onAddNewItem: (payload: any, callback: () => void) => void;
  pendingCreate: boolean;
  pendingGet: boolean;
};

const NetworkItems: React.FC<Props> = ({
                                         type,
                                         items = [],
                                         interfaces = [],
                                         onAddNewItem,
                                         pendingCreate,
                                         pendingGet,
                                       }) => {
  const [form, setForm] = useState<Record<string, any>>({
    ip_address: '', port: undefined, domain: '', host: '', device: '', to: '', via: ''
  });

  const resetForm = () => setForm({ ip_address: '', port: undefined, domain: '', host: '', device: '', to: '', via: '' });

  const handleAddSubmit = () => {
    const portNum = Number.isFinite(Number(form.port)) ? Number(form.port) : undefined;
    const payload = {
      ...form,
      ...(type === 'dns' && { port: portNum ?? 53 }),
      ...(type === 'ntp' && { port: portNum ?? 123 }),
    };

    onAddNewItem(payload, resetForm);
  };

  const updateField = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Box pos="relative">
      <LoadingOverlay visible={pendingGet} overlayProps={{ radius: 'sm', blur: 2 }} />

      <Stack gap="xs">
        {type === 'dns' && (
          <Group wrap="nowrap" gap="xs" align="flex-end">
            <TextInput label="IP Address" placeholder="8.8.8.8" value={form.ip_address} onChange={(e) => updateField('ip_address', e.currentTarget.value)} style={{ flex: 1 }} />
            <NumberInput label="Port" placeholder="53" value={form.port} onChange={(v) => updateField('port', v)} style={{ width: 160 }}
                         rightSection={<ActionIcon loading={pendingCreate} onClick={handleAddSubmit} variant="light"><IconPlus size={16} /></ActionIcon>}
            />
          </Group>
        )}

        {type === 'ntp' && (
          <Group wrap="nowrap" gap="xs" align="flex-end">
            <TextInput label="IP Address" placeholder="pool.ntp.org" value={form.ip_address} onChange={(e) => updateField('ip_address', e.currentTarget.value)} style={{ flex: 1 }} />
            <NumberInput label="Port" placeholder="123" value={form.port} onChange={(v) => updateField('port', v)} style={{ width: 160 }}
                         rightSection={<ActionIcon loading={pendingCreate} onClick={handleAddSubmit} variant="light"><IconPlus size={16} /></ActionIcon>}
            />
          </Group>
        )}

        {type === 'static-routes' && (
          <Group wrap="nowrap" gap="xs" align="flex-end">
            <Select label="Device" placeholder="eth0" data={uniqBy(interfaces, 'device').map(({ device }: any) => ({ value: device, label: device }))} value={form.device} onChange={(v) => updateField('device', v)} style={{ width: 220 }} searchable />
            <TextInput label="To" placeholder="10.0.0.0/24" value={form.to} onChange={(e) => updateField('to', e.currentTarget.value)} style={{ flex: 1 }} />
            <TextInput label="Via" placeholder="192.168.1.1" value={form.via} onChange={(e) => updateField('via', e.currentTarget.value)} style={{ width: 240 }}
                       rightSection={<ActionIcon loading={pendingCreate} onClick={handleAddSubmit} variant="light"><IconPlus size={16} /></ActionIcon>}
            />
          </Group>
        )}

        {type === 'forwarder' && (
          <Group wrap="nowrap" gap="xs" align="flex-end">
            <TextInput label="Domain" placeholder="internal.corp" value={form.domain} onChange={(e) => updateField('domain', e.currentTarget.value)} style={{ flex: 1 }} />
            <TextInput label="IP Address" placeholder="1.1.1.1" value={form.ip_address} onChange={(e) => updateField('ip_address', e.currentTarget.value)} style={{ flex: 1 }} />
            <NumberInput label="Port" placeholder="53" value={form.port} onChange={(v) => updateField('port', v)} style={{ width: 160 }}
                         rightSection={<ActionIcon loading={pendingCreate} onClick={handleAddSubmit} variant="light"><IconPlus size={16} /></ActionIcon>}
            />
          </Group>
        )}

        {type === 'static-hosts' && (
          <Group wrap="nowrap" gap="xs" align="flex-end">
            <TextInput label="Hostname" placeholder="nas.local" value={form.host} onChange={(e) => updateField('host', e.currentTarget.value)} style={{ flex: 1 }} />
            <TextInput label="IP Address" placeholder="192.168.1.50" value={form.ip_address} onChange={(e) => updateField('ip_address', e.currentTarget.value)} style={{ flex: 1 }}
                       rightSection={<ActionIcon loading={pendingCreate} onClick={handleAddSubmit} variant="light"><IconPlus size={16} /></ActionIcon>}
            />
          </Group>
        )}

        <Stack gap="xs" mt="md">
          {items.map((item) => {
            const key = `${type}-${item.id || item.ip_address || item.host || item.to}`;
            if (type === 'dns') return <NetworkItemDNS data={item} key={key} />;
            if (type === 'ntp') return <NetworkItemNTP data={item} key={key} />;
            if (type === 'static-routes') return <NetworkItemStaticRoute data={item} key={key} />;
            if (type === 'forwarder') return <NetworkItemForwarder data={item} key={key} />;
            if (type === 'static-hosts') return <NetworkItemStaticHost data={item} key={key} />;
            return null;
          })}
        </Stack>
      </Stack>
    </Box>
  );
};

export default NetworkItems;
