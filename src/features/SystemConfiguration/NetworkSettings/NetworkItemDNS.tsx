import React, { useState } from 'react';
import { ActionIcon, Group, NumberInput, TextInput } from '@mantine/core';
import { IconDeviceFloppy, IconTrash, IconLoader2 } from '@tabler/icons-react';
import { useEffectOnce, useUpdateEffect } from 'react-use';
import { useNotification } from 'common/useNotifications';

import { useNetworkConfig } from '../api';

type Props = {
  data: {
    id: number;
    ip_address: string;
    port: number | string;
  };
};

const NetworkItemDNS: React.FC<Props> = ({ data }) => {
  const { showJobNotification, showErrorNotification } = useNotification();

  const {
    updateDns,
    deleteDns,
    fetchDns,
    isPending
  } = useNetworkConfig();

  const [originalIp, setOriginalIp] = useState<string>(String(data.ip_address ?? ''));
  const [originalPort, setOriginalPort] = useState<number>(Number(data.port ?? 53));

  const [ip, setIp] = useState<string>(String(data.ip_address ?? ''));
  const [port, setPort] = useState<number | ''>(data.port ? Number(data.port) : 53);

  useEffectOnce(() => {
    setOriginalIp(String(data.ip_address ?? ''));
    setIp(String(data.ip_address ?? ''));
    setOriginalPort(Number(data.port ?? 53));
    setPort(data.port ? Number(data.port) : 53);
  });

  useUpdateEffect(() => {
    setOriginalIp(String(data.ip_address ?? ''));
    setIp(String(data.ip_address ?? ''));
    setOriginalPort(Number(data.port ?? 53));
    setPort(data.port ? Number(data.port) : 53);
  }, [data]);

  const isUpdating = !!isPending['dns/update/pending'];
  const isDeleting = !!isPending['dns/delete/pending'];

  const busy = (isUpdating || isDeleting) && originalIp === data.ip_address && originalPort === Number(data.port);

  const handleUpdate = async () => {
    try {
      const payload = {
        current_ip: originalIp,
        current_port: originalPort,
        new_ip: ip.trim(),
        new_port: Number(port || 53),
      };

      const job = await updateDns(payload);
      showJobNotification({ job });
      await fetchDns();

      setOriginalIp(payload.new_ip);
      setOriginalPort(payload.new_port);
    } catch (e) {
      showErrorNotification({
        title: 'Update Failed',
        description: `Could not update DNS server ${originalIp}.`,
        error: e,
      });
    }
  };

  const handleDelete = async () => {
    try {
      const job = await deleteDns({
        ip_address: originalIp,
        port: originalPort,
      });
      showJobNotification({ job });
      await fetchDns();
    } catch (e) {
      showErrorNotification({
        title: 'Delete Failed',
        description: `Could not delete DNS server ${originalIp}.`,
        error: e,
      });
    }
  };

  return (
    <Group wrap="nowrap" gap="xs" align="flex-end">
      <TextInput
        label="IP Address"
        value={ip}
        onChange={(e) => setIp(e.currentTarget.value)}
        style={{ flex: 1 }}
        disabled={busy}
        placeholder="8.8.8.8"
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
              aria-label="Update DNS"
              variant="light"
              disabled={ip === originalIp && port === originalPort}
            >
              <IconDeviceFloppy size={16} />
            </ActionIcon>
            <ActionIcon
              color="red"
              onClick={handleDelete}
              aria-label="Delete DNS"
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

export default NetworkItemDNS;
