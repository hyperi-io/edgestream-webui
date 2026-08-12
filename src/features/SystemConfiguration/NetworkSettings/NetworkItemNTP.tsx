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

const NetworkItemNTP: React.FC<Props> = ({ data }) => {
  const { showJobNotification, showErrorNotification } = useNotification();

  const {
    updateNtp,
    deleteNtp,
    fetchNtp,
    isPending
  } = useNetworkConfig();

  const [originalIp, setOriginalIp] = useState<string>(String(data.ip_address ?? ''));
  const [originalPort, setOriginalPort] = useState<number>(Number(data.port ?? 123));

  const [ip, setIp] = useState<string>(String(data.ip_address ?? ''));
  const [port, setPort] = useState<number | ''>(data.port ? Number(data.port) : 123);

  useEffectOnce(() => {
    setOriginalIp(String(data.ip_address ?? ''));
    setIp(String(data.ip_address ?? ''));
    setOriginalPort(Number(data.port ?? 123));
    setPort(data.port ? Number(data.port) : 123);
  });

  useUpdateEffect(() => {
    setOriginalIp(String(data.ip_address ?? ''));
    setIp(String(data.ip_address ?? ''));
    setOriginalPort(Number(data.port ?? 123));
    setPort(data.port ? Number(data.port) : 123);
  }, [data]);

  const isUpdating = !!isPending['ntp/update/pending'];
  const isDeleting = !!isPending['ntp/delete/pending'];

  const busy = (isUpdating || isDeleting) && originalIp === data.ip_address && originalPort === Number(data.port);

  const handleUpdate = async () => {
    try {
      const payload = {
        current_ip: originalIp,
        current_port: originalPort,
        new_ip: ip.trim(),
        new_port: Number(port || 123),
      };

      const job = await updateNtp(payload);
      showJobNotification({ job });

      await fetchNtp();

      setOriginalIp(payload.new_ip);
      setOriginalPort(payload.new_port);
    } catch (e) {
      showErrorNotification({
        title: 'Update Failed',
        description: `Could not update NTP server ${originalIp}.`,
        error: e,
      });
    }
  };

  const handleDelete = async () => {
    try {
      const job = await deleteNtp({
        ip_address: originalIp,
        port: originalPort,
      });
      showJobNotification({ job });
      await fetchNtp();
    } catch (e) {
      showErrorNotification({
        title: 'Delete Failed',
        description: `Could not delete NTP server ${originalIp}.`,
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
        placeholder="pool.ntp.org"
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
              aria-label="Update NTP"
              variant="light"
              disabled={ip === originalIp && port === originalPort}
            >
              <IconDeviceFloppy size={16} />
            </ActionIcon>
            <ActionIcon
              color="red"
              onClick={handleDelete}
              aria-label="Delete NTP"
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

export default NetworkItemNTP;
