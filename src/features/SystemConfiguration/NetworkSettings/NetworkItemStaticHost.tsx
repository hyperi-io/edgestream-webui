import React, { useState } from 'react';
import { ActionIcon, Group, TextInput, Tooltip } from '@mantine/core';
import { IconDeviceFloppy, IconTrash, IconLoader2 } from '@tabler/icons-react';
import { useEffectOnce, useUpdateEffect } from 'react-use';
import { useNotification } from 'common/useNotifications';

import { useNetworkConfig } from '../api';

type Props = {
  data: {
    id: number;
    host: string;
    ip_address: string;
  };
};

const NetworkItemStaticHost: React.FC<Props> = ({ data }) => {
  const { showJobNotification, showErrorNotification } = useNotification();

  const {
    updateHost,
    deleteHost,
    fetchHosts,
    isPending
  } = useNetworkConfig();

  const [originalHost, setOriginalHost] = useState<string>(String(data.host ?? ''));
  const [host, setHost] = useState<string>(String(data.host ?? ''));
  const [ip, setIp] = useState<string>(String(data.ip_address ?? ''));

  useEffectOnce(() => {
    setOriginalHost(String(data.host ?? ''));
    setHost(String(data.host ?? ''));
    setIp(String(data.ip_address ?? ''));
  });

  useUpdateEffect(() => {
    setOriginalHost(String(data.host ?? ''));
    setHost(String(data.host ?? ''));
    setIp(String(data.ip_address ?? ''));
  }, [data]);

  const isUpdating = !!isPending['hosts/update/pending'];
  const isDeleting = !!isPending['hosts/delete/pending'];

  const busy = (isUpdating || isDeleting) && originalHost === data.host;

  const changed = host !== String(data.host ?? '') || ip !== String(data.ip_address ?? '');
  const canSave = changed && !!host.trim() && !!ip.trim() && !busy;

  const handleUpdate = async () => {
    try {
      const payload = {
        current_host: originalHost,
        new_host: host.trim(),
        new_ip_address: ip.trim(),
      };

      const job = await updateHost(payload);
      showJobNotification({ job });

      await fetchHosts();
      setOriginalHost(payload.new_host);
    } catch (e) {
      showErrorNotification({
        title: 'Update Failed',
        description: `Could not update host record for ${originalHost}.`,
        error: e,
      });
    }
  };

  const handleDelete = async () => {
    try {
      const job = await deleteHost({ host: originalHost });
      showJobNotification({ job });
      await fetchHosts();
    } catch (e) {
      showErrorNotification({
        title: 'Delete Failed',
        description: `Could not delete host record for ${originalHost}.`,
        error: e,
      });
    }
  };

  return (
    <Group wrap="nowrap" gap="xs" align="flex-end">
      <TextInput
        label="Hostname"
        value={host}
        onChange={(e) => setHost(e.currentTarget.value)}
        style={{ flex: 1 }}
        disabled={busy}
      />
      <TextInput
        label="IP Address"
        value={ip}
        onChange={(e) => setIp(e.currentTarget.value)}
        style={{ flex: 1 }}
        disabled={busy}
        rightSection={
          busy ? (
            <IconLoader2 size={16} className="animate-spin" />
          ) : (
            <Group gap={4}>
              <Tooltip label={canSave ? 'Save changes' : 'No changes to save'}>
                <ActionIcon
                  onClick={handleUpdate}
                  aria-label="Update static host"
                  disabled={!canSave}
                  variant="light"
                >
                  <IconDeviceFloppy size={16} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Delete record">
                <ActionIcon
                  color="red"
                  onClick={handleDelete}
                  aria-label="Delete static host"
                  disabled={busy}
                  variant="light"
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Tooltip>
            </Group>
          )
        }
      />
    </Group>
  );
};

export default NetworkItemStaticHost;
