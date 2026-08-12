import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Group,
  LoadingOverlay,
  Stack,
  Table,
  Text,
  Title,
  Paper,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import {
  IconPlayerPlay,
  IconPlayerStop,
  IconRefresh,
  IconPlus,
  IconPencil,
  IconTrash,
  IconArrowsSort,
} from '@tabler/icons-react';
import { useEffectOnce, useInterval } from 'react-use';

import { useNotification } from 'common/useNotifications';
import { useVPNs } from './api';
import type { IVPN } from './types';
import VPNDrawer from './VPNDrawer';

const formatUptime = (sec?: number | null) => {
  if (sec === undefined || sec === null || sec < 0) return '-';
  const s = Math.floor(sec);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${ss}s`;
  return `${m}m ${ss}s`;
};

const statusColor = (state?: string): string => {
  switch (state) {
    case 'active': return 'green';
    case 'connecting':
    case 'pending': return 'yellow';
    case 'failed': return 'red';
    case 'inactive': return 'gray';
    default: return 'gray';
  }
};

const formatBps = (bitsPerSec?: number | null) => {
  const v = bitsPerSec ?? 0;
  if (v < 1000) return `${Math.round(v)} bps`;
  if (v < 1000 * 1000) return `${(v / 1000).toFixed(1)} Kbps`;
  if (v < 1000 * 1000 * 1000) return `${(v / (1000 * 1000)).toFixed(1)} Mbps`;
  return `${(v / (1000 * 1000 * 1000)).toFixed(1)} Gbps`;
};

const parseHostPort = (server?: string | null) => {
  if (!server) return { host: '-', port: '-' };
  const s = server.trim();
  const lastColon = s.lastIndexOf(':');
  if (lastColon > 0) {
    return { host: s.slice(0, lastColon), port: s.slice(lastColon + 1) || '-' };
  }
  return { host: s, port: '-' };
};

const VPNClient: React.FC = () => {
  const { showJobNotification } = useNotification();

  const {
    items,
    statuses,
    refreshList,
    refreshStatuses,
    createVPN,
    updateVPN,
    removeVPN,
    runAction,
    isFetching,
    isSaving,
    isDeleting,
    isOperating,
  } = useVPNs();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<IVPN | null>(null);

  // Stores calculated throughput rates per VPN ID
  const [rates, setRates] = useState<Record<string, { dl: number; ul: number }>>({});

  // Ref for calculating traffic deltas
  const prevRef = useRef<Record<string, { ts: number; rx?: number | null; tx?: number | null }>>({});

  const isBusy = isFetching || isDeleting || isOperating;

  useEffectOnce(() => {
    refreshList();
    refreshStatuses();
  });

  // Background status polling every 5s
  useInterval(() => {
    refreshStatuses(true);
  }, 5000);

  // Recalculate throughput ONLY when statuses dictionary changes
  useEffect(() => {
    const now = Date.now();
    const newRates: Record<string, { dl: number; ul: number }> = {};

    Object.entries(statuses).forEach(([key, st]) => {
      const rx = st.rx_bytes;
      const tx = st.tx_bytes;
      const prev = prevRef.current[key];

      if (typeof rx === 'number' && typeof tx === 'number') {
        if (prev && prev.ts && typeof prev.rx === 'number' && typeof prev.tx === 'number') {
          const dt = (now - prev.ts) / 1000;
          if (dt > 0.5) {
            const rxDelta = Math.max(0, rx - prev.rx);
            const txDelta = Math.max(0, tx - prev.tx);
            newRates[key] = {
              dl: (rxDelta / dt) * 8,
              ul: (txDelta / dt) * 8,
            };
          }
        } else {
          // Initialize base rates at 0 for initial snapshot
          newRates[key] = { dl: 0, ul: 0 };
        }

        // Update history snapshot
        prevRef.current[key] = { ts: now, rx, tx };
      }
    });

    setRates((prev) => ({ ...prev, ...newRates }));
  }, [statuses]);

  const confirmDelete = (vpn: IVPN) => {
    modals.openConfirmModal({
      title: <Text fw={700}>Delete VPN Configuration</Text>,
      children: (
        <Text size="sm">
          Are you sure you want to delete <b>{vpn.name}</b>? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red', leftSection: <IconTrash size={16} /> },
      onConfirm: async () => {
        try {
          const job = await removeVPN({ name: vpn.name });
          showJobNotification({ job });
          refreshList();
        } catch (e) {}
      },
    });
  };

  const rows = useMemo(() => {
    return items.map((vpn) => {
      const st = statuses[vpn.id] || {};
      const key = vpn.id;
      const rate = rates[key] || { dl: 0, ul: 0 };

      return (
        <Table.Tr key={key}>
          <Table.Td>
            <Group gap="xs" wrap="nowrap">
              <Box
                w={10}
                h={10}
                style={{ borderRadius: 50 }}
                bg={st.state === 'active' ? 'green.6' : 'gray.5'}
              />
              <Text fw={600}>{vpn.name}</Text>
            </Group>
          </Table.Td>

          <Table.Td>
            <Badge variant="outline" color="gray" size="sm" tt="capitalize">
              {vpn.vpn_type}
            </Badge>
          </Table.Td>

          <Table.Td><Text size="sm" ff="monospace">{st.tunnel_address || '-'}</Text></Table.Td>
          <Table.Td><Text size="sm">{st.endpoint_address || '-'}</Text></Table.Td>

          <Table.Td>
            <Stack gap={0}>
              <Text size="xs" fw={700} c="blue">DL: {formatBps(rate.dl)}</Text>
              <Text size="xs" fw={700} c="teal">UL: {formatBps(rate.ul)}</Text>
            </Stack>
          </Table.Td>

          <Table.Td><Text size="sm">{formatUptime(st.uptime_seconds)}</Text></Table.Td>

          <Table.Td>
            <Badge variant="light" color={statusColor(st.state)} tt="capitalize">
              {st.state || 'Unknown'}
            </Badge>
          </Table.Td>

          <Table.Td>
            <Group gap="xs" justify="flex-end" wrap="nowrap">
              <Button
                size="xs"
                variant="light"
                color="green"
                leftSection={<IconPlayerPlay size={14} />}
                onClick={() => runAction(vpn.name, 'start').then(refreshStatuses)}
                disabled={st.state === 'active' || isOperating}
              >
                Start
              </Button>

              <Button
                size="xs"
                variant="light"
                color="red"
                leftSection={<IconPlayerStop size={14} />}
                onClick={() => runAction(vpn.name, 'stop').then(refreshStatuses)}
                disabled={st.state === 'inactive' || isOperating}
              >
                Stop
              </Button>

              {/* Manage Button with Tooltip when active */}
              {(() => {
                const isVPNActive = st.state === 'active' || st.state === 'connecting';
                const manageDisabled = isVPNActive || isOperating;

                return (
                  <Tooltip
                    label="Stop the VPN connection to modify settings"
                    disabled={!isVPNActive}
                    withArrow
                    position="top"
                  >
                    {/* Box container ensures hover event triggers tooltip even when button is disabled */}
                    <Box component="span" style={{ display: 'inline-block' }}>
                      <Button
                        size="xs"
                        variant="light"
                        color="blue"
                        leftSection={<IconPencil size={14} />}
                        onClick={() => {
                          setEditing(vpn);
                          setDrawerOpen(true);
                        }}
                        disabled={manageDisabled}
                      >
                        Manage
                      </Button>
                    </Box>
                  </Tooltip>
                );
              })()}

              <Button
                size="xs"
                variant="light"
                color="red"
                leftSection={<IconTrash size={14} />}
                onClick={() => confirmDelete(vpn)}
                disabled={st.state === 'active' || isOperating}
              >
                Delete
              </Button>
            </Group>
          </Table.Td>
        </Table.Tr>
      );
    });
  }, [items, statuses, rates, isOperating, runAction, refreshStatuses]);

  return (
    <Box pos="relative">
      <LoadingOverlay visible={isBusy} overlayProps={{ blur: 2 }} />

      <Stack gap="lg">
        <Group justify="space-between">
          <Box>
            <Title order={3}>VPN Client</Title>
            <Text c="dimmed" size="sm">Manage remote connections and policy routing.</Text>
          </Box>

          <Group>
            <Button
              variant="default"
              leftSection={<IconRefresh size={16} />}
              onClick={() => { refreshList(); refreshStatuses(); }}
              loading={isFetching}
            >
              Refresh
            </Button>

            <Button leftSection={<IconPlus size={16} />} onClick={() => { setEditing(null); setDrawerOpen(true); }}>
              Add Connection
            </Button>
          </Group>
        </Group>

        <Paper withBorder radius="sm">
          <Table highlightOnHover verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>Tunnel IP</Table.Th>
                <Table.Th>Endpoint</Table.Th>
                <Table.Th>Throughput</Table.Th>
                <Table.Th>Uptime</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th style={{ width: 320 }}></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows}
              {items.length === 0 && !isFetching && (
                <Table.Tr>
                  <Table.Td colSpan={9}>
                    <Text ta="center" c="dimmed" py="xl">No VPN connections configured.</Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Paper>

        <VPNDrawer
          opened={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          initial={editing}
          busy={isSaving}
          onCreate={async (fd) => {
            const job = await createVPN(fd);
            showJobNotification({ job });
            refreshList();
          }}
          onUpdate={async (fd) => {
            const job = await updateVPN(fd);
            showJobNotification({ job });
            refreshList();
          }}
        />
      </Stack>
    </Box>
  );
};

export default VPNClient;
