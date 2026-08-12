import React, { useState } from 'react';
import { ActionIcon, Group, NumberInput, TextInput } from '@mantine/core';
import { IconDeviceFloppy, IconTrash, IconLoader2 } from '@tabler/icons-react';
import { useEffectOnce, useUpdateEffect } from 'react-use';
import { useNotification } from 'common/useNotifications';

import { useNetworkConfig } from '../api';

type Props = {
  data: {
    id: number;
    domain: string;
    ip_address: string;
    port: number | string;
  };
};

const NetworkItemForwarder: React.FC<Props> = ({ data }) => {
  const { showJobNotification, showErrorNotification } = useNotification();

  const {
    updateForwarder,
    deleteForwarder,
    fetchForwarders,
    isPending
  } = useNetworkConfig();

  const [domain, setDomain] = useState<string>(String(data.domain ?? ''));
  const [ip, setIp] = useState<string>(String(data.ip_address ?? ''));
  const [port, setPort] = useState<number | ''>(data.port ? Number(data.port) : 53);

  useEffectOnce(() => {
    setDomain(String(data.domain ?? ''));
    setIp(String(data.ip_address ?? ''));
    setPort(data.port ? Number(data.port) : 53);
  });

  useUpdateEffect(() => {
    setDomain(String(data.domain ?? ''));
    setIp(String(data.ip_address ?? ''));
    setPort(data.port ? Number(data.port) : 53);
  }, [data]);

  const isUpdating = !!isPending['forwarders/update/pending'];
  const isDeleting = !!isPending['forwarders/delete/pending'];

  const busy = (isUpdating || isDeleting) && data.id === data.id;

  const handleUpdate = async () => {
    try {
      const payload = {
        id: data.id,
        domain: domain.trim(),
        ip_address: ip.trim(),
        port: Number(port || 53),
      };

      const job = await updateForwarder(payload);
      showJobNotification({ job });
      await fetchForwarders();
    } catch (e) {
      showErrorNotification({
        title: 'Update Failed',
        description: `Could not update forwarder for ${data.domain}.`,
        error: e,
      });
    }
  };

  const handleDelete = async () => {
    try {
      const job = await deleteForwarder({ domain: data.domain });
      showJobNotification({ job });
      await fetchForwarders();
    } catch (e) {
      showErrorNotification({
        title: 'Delete Failed',
        description: `Could not delete forwarder for ${data.domain}.`,
        error: e,
      });
    }
  };

  const changed = domain !== data.domain || ip !== data.ip_address || port !== Number(data.port);

  return (
    <Group wrap="nowrap" gap="xs" align="flex-end">
      <TextInput
        label="Domain"
        value={domain}
        onChange={(e) => setDomain(e.currentTarget.value)}
        style={{ flex: 1 }}
        disabled={busy}
        placeholder="example.com"
      />
      <TextInput
        label="IP Address"
        value={ip}
        onChange={(e) => setIp(e.currentTarget.value)}
        style={{ flex: 1 }}
        disabled={busy}
        placeholder="1.1.1.1"
      />
      <NumberInput
        label="Port"
        value={port === '' ? undefined : port}
        onChange={(v) => setPort(v === '' ? '' : Number(v))}
        style={{ width: 120 }}
        disabled={busy}
        hideControls
      />
      <Group gap={4} mb={4}>
        {busy ? (
          <ActionIcon variant="subtle" color="blue" loading>
            <IconLoader2 size={16} />
          </ActionIcon>
        ) : (
          <>
            <ActionIcon
              onClick={handleUpdate}
              aria-label="Update Forwarder"
              variant="light"
              disabled={!changed || !domain || !ip}
            >
              <IconDeviceFloppy size={16} />
            </ActionIcon>
            <ActionIcon
              color="red"
              onClick={handleDelete}
              aria-label="Delete Forwarder"
              variant="light"
            >
              <IconTrash size={16} />
            </ActionIcon>
          </>
        )}
      </Group>
    </Group>
  );
};

export default NetworkItemForwarder;
