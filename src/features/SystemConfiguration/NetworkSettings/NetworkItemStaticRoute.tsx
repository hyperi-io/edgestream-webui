import uniqBy from 'lodash/uniqBy';
import React from 'react';

import { ActionIcon, Group, Select, TextInput, Tooltip } from '@mantine/core';
import {
  IconDeviceFloppy,
  IconTrash,
  IconLoader2,
  IconAlertCircle,
} from '@tabler/icons-react';

import { useEffectOnce, useUpdateEffect } from 'react-use';
import { useNotification } from 'common/useNotifications';

import { useNetworkConfig } from '../api';

type Props = {
  data: {
    device: string;
    to: string;
    via: string;
  };
};

const CIDR_RE = /^(\d{1,3}\.){3}\d{1,3}\/([0-9]|[12][0-9]|3[0-2])$/;

function normalizeIPv4Cidr(cidr: string): { normalized: string; hasHostBits: boolean } | null {
  if (!CIDR_RE.test(cidr)) return null;
  const [ipStr, prefixStr] = cidr.split('/');
  const prefix = Number(prefixStr);
  const parts = ipStr.split('.').map((n) => Number(n));
  if (parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)) return null;

  const normalizedOctets: number[] = [];
  let hasHostBits = false;
  for (let i = 0; i < 4; i += 1) {
    const bits = Math.max(0, Math.min(8, prefix - i * 8));
    const step = 2 ** (8 - bits);
    const networkOctet = bits === 0 ? 0 : Math.floor(parts[i] / step) * step;
    normalizedOctets.push(networkOctet);
    if (bits !== 8 && parts[i] % step !== 0) hasHostBits = true;
  }
  const normalized = `${normalizedOctets.join('.')}/${prefix}`;
  return { normalized, hasHostBits };
}

const NetworkItemStaticRoute: React.FC<Props> = ({ data }) => {
  const { showJobNotification, showErrorNotification } = useNotification();

  const {
    updateRoute,
    deleteRoute,
    fetchRoutes,
    interfaces,
    isPending
  } = useNetworkConfig();

  const [orig, setOrig] = React.useState({
    device: data.device,
    to: data.to,
    via: data.via,
  });

  const [dev, setDev] = React.useState<string>(String(data.device ?? ''));
  const [to, setTo] = React.useState<string>(String(data.to ?? ''));
  const [via, setVia] = React.useState<string>(String(data.via ?? ''));
  const [toError, setToError] = React.useState<string | null>(null);

  const devices = uniqBy(interfaces ?? [], 'device').map(({ device }: any) => ({
    value: device,
    label: device,
  }));

  useEffectOnce(() => {
    const initial = {
      device: String(data.device ?? ''),
      to: String(data.to ?? ''),
      via: String(data.via ?? ''),
    };
    setOrig(initial);
    setDev(initial.device);
    setTo(initial.to);
    setVia(initial.via);
  });

  useUpdateEffect(() => {
    const updated = {
      device: String(data.device ?? ''),
      to: String(data.to ?? ''),
      via: String(data.via ?? ''),
    };
    setOrig(updated);
    setDev(updated.device);
    setTo(updated.to);
    setVia(updated.via);
  }, [data]);

  React.useEffect(() => {
    if (!to) {
      setToError(null);
      return;
    }
    const parsed = normalizeIPv4Cidr(to);
    if (!parsed) {
      setToError('Enter a valid IPv4 CIDR, e.g. 10.100.0.0/16');
    } else if (parsed.hasHostBits) {
      setToError(`Host bits set; did you mean ${parsed.normalized}?`);
    } else {
      setToError(null);
    }
  }, [to]);

  const isUpdating = !!isPending['routes/update/pending'];
  const isDeleting = !!isPending['routes/delete/pending'];
  const busy = (isUpdating || isDeleting) && dev === data.device && to === data.to && via === data.via;

  const disableSave = !!toError || !dev || !to || !via || busy;

  const handleUpdate = async () => {
    const parsed = normalizeIPv4Cidr(to);
    const correctedTo = parsed && parsed.hasHostBits ? parsed.normalized : to;

    try {
      const job = await updateRoute({
        current_to: orig.to,
        current_via: orig.via,
        current_device: orig.device,
        new_to: correctedTo,
        new_via: via,
        new_device: dev,
      });

      showJobNotification({ job });
      await fetchRoutes();
      setOrig({ device: dev, to: correctedTo, via });
      setTo(correctedTo);
    } catch (e) {
      showErrorNotification({
        title: 'Update Failed',
        description: `Could not update route to ${orig.to}.`,
        error: e,
      });
    }
  };

  const handleDelete = async () => {
    try {
      const job = await deleteRoute({
        to: orig.to,
        via: orig.via,
        device: orig.device,
      });
      showJobNotification({ job });
      await fetchRoutes();
    } catch (e) {
      showErrorNotification({
        title: 'Delete Failed',
        description: `Could not delete route to ${orig.to}.`,
        error: e,
      });
    }
  };

  return (
    <Group wrap="nowrap" gap="xs" align="flex-end">
      <Select
        label="Device"
        placeholder="Select device"
        data={devices}
        value={dev}
        onChange={(v) => setDev(v ?? '')}
        style={{ width: 220 }}
        searchable
        disabled={busy}
      />
      <TextInput
        label="To"
        value={to}
        onChange={(e) => setTo(e.currentTarget.value)}
        style={{ flex: 1 }}
        error={toError ?? undefined}
        disabled={busy}
        rightSection={
          toError ? (
            <Tooltip label={toError} withArrow>
              <IconAlertCircle size={16} color="red" />
            </Tooltip>
          ) : null
        }
      />
      <TextInput
        label="Via"
        value={via}
        onChange={(e) => setVia(e.currentTarget.value)}
        style={{ width: 240 }}
        disabled={busy}
        rightSection={
          busy ? (
            <IconLoader2 size={16} className="animate-spin" />
          ) : (
            <Group gap={4}>
              <ActionIcon
                onClick={handleUpdate}
                aria-label="Update route"
                disabled={disableSave}
              >
                <IconDeviceFloppy size={16} />
              </ActionIcon>
              <ActionIcon
                color="red"
                onClick={handleDelete}
                aria-label="Delete route"
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Group>
          )
        }
      />
    </Group>
  );
};

export default NetworkItemStaticRoute;
