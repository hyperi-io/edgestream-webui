import React from 'react';
import {
  Badge,
  Box,
  Card,
  Divider,
  Group,
  Image,
  Loader,
  Paper,
  Progress,
  SimpleGrid,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
} from '@mantine/core';
import {
  IconActivityHeartbeat,
  IconApps,
  IconClock,
  IconDatabase,
  IconFolder,
  IconNetwork,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useEffectOnce } from 'react-use';

import edgestreamLogo from 'assets/hyperi-hound_square.svg?url';
import { useServicesStatus } from 'common/servicesStatus';
import {
  useGetComponents,
  useGetNetworkSummary,
  useGetSystem,
  useGetSystemVersion
} from './api';

const SectionTitle: React.FC<{
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ icon, children }) => (
  <Group justify="space-between">
    <Group gap="xs">
      <ThemeIcon size="sm" radius="md" color="blue" variant="light">
        {icon}
      </ThemeIcon>
      <Title order={6}>{children}</Title>
    </Group>
  </Group>
);

const StatTile: React.FC<{
  value: number | string;
  label: string;
  color?: string;
}> = ({ value, label, color }) => (
  <Stack gap={2} align="center">
    <Text fw={800} size="xl" c={color}>
      {value}
    </Text>
    <Text size="xs" c="dimmed">
      {label}
    </Text>
  </Stack>
);

type RiskColor = 'green' | 'yellow' | 'red';

const usedColor = (pct: number): RiskColor => {
  if (pct < 65) return 'green';
  if (pct < 85) return 'yellow';
  return 'red';
};

const freeColor = (pctFree: number): RiskColor => {
  if (pctFree >= 35) return 'green';
  if (pctFree >= 15) return 'yellow';
  return 'red';
};

const worstColor = (a: RiskColor, b: RiskColor): RiskColor => {
  const rank: Record<RiskColor, number> = { green: 1, yellow: 2, red: 3 };
  return rank[a] >= rank[b] ? a : b;
};

const colorForStatus = (k: string): string => {
  switch (k) {
    case 'healthy': return 'green';
    case 'degraded': return 'yellow';
    case 'down': return 'red';
    case 'disabled': return 'gray';
    default: return 'blue';
  }
};

interface SystemInfoProps {
  componentsFirst?: boolean;
}

const SystemInfo: React.FC<SystemInfoProps> = ({ componentsFirst = false }) => {
  const navigate = useNavigate();

  const { getSystem, data: systemInfo, loading: pendingGetSystem } = useGetSystem();
  const { getSystemVersion, data: version } = useGetSystemVersion();
  const { getNetworkSummary, data: netSummary, loading: pendingNet, error: netError } = useGetNetworkSummary();
  const { getComponents, data: components, loading: pendingComponents } = useGetComponents();
  const { data: svcData, loading: svcLoading, error: svcError } = useServicesStatus();

  useEffectOnce(() => {
    getSystem();
    getSystemVersion();
    getNetworkSummary();
    getComponents();
  });

  if (pendingGetSystem && !systemInfo?.hostname) {
    return (
      <Group justify="center" py="xl">
        <Loader size="lg" />
      </Group>
    );
  }

  // ---- Services  ----
  const services = svcData?.services ?? [];
  const counts = {
    healthy: services.filter((s: any) => s.status === 'healthy').length,
    degraded: services.filter((s: any) => s.status === 'degraded').length,
    down: services.filter((s: any) => s.status === 'down').length,
    disabled: services.filter((s: any) => s.status === 'disabled').length,
  };

  // ---- Shared Card Sections ----

  const servicesSummaryCard = (
    <Card withBorder radius="md" shadow="xs">
      <Card.Section inheritPadding py="xs">
        <Group justify="space-between" align="center">
          <SectionTitle icon={<IconActivityHeartbeat size={14} />}>Services</SectionTitle>
          <Badge onClick={() => navigate('/monitoring/services')} variant="light" style={{ cursor: 'pointer' }}>
            View
          </Badge>
        </Group>
      </Card.Section>
      <Card.Section inheritPadding pb="md">
        {svcError && <Badge color="red" variant="light" mb="xs">{String(svcError)}</Badge>}
        <SimpleGrid cols={4} spacing="lg">
          <StatTile value={svcLoading ? '—' : counts.healthy} label="Healthy" color={colorForStatus('healthy')} />
          <StatTile value={svcLoading ? '—' : counts.degraded} label="Degraded" color={colorForStatus('degraded')} />
          <StatTile value={svcLoading ? '—' : counts.down} label="Down" color={colorForStatus('down')} />
          <StatTile value={svcLoading ? '—' : counts.disabled} label="Disabled" color={colorForStatus('disabled')} />
        </SimpleGrid>
      </Card.Section>
    </Card>
  );

  const networkCard = (
    <Card withBorder radius="md" shadow="xs">
      <Card.Section inheritPadding py="xs">
        <SectionTitle icon={<IconNetwork size={14} />}>Network</SectionTitle>
      </Card.Section>
      <Card.Section inheritPadding pb="md">
        {pendingNet ? (
          <Group justify="center"><Loader size="sm" /></Group>
        ) : netError ? (
          <Text size="sm" c="red">{netError}</Text>
        ) : (
          <Stack gap="xs">
            {(netSummary?.groups ?? []).map((g) => (
              <Box key={g.title}>
                <Text fw={700} size="xs" c="dimmed" tt="uppercase">{g.title}</Text>
                <Stack gap={4} mt={4}>
                  {g.items.map((it) => (
                    <Tooltip
                      key={it.iface}
                      label={<Text size="xs">IP: {it.details.ip ?? '-'} | GW: {it.details.gateway ?? '-'}</Text>}
                    >
                      <Text size="sm" style={{ cursor: 'help' }}>• {it.label}</Text>
                    </Tooltip>
                  ))}
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </Card.Section>
    </Card>
  );

  const componentsCard = (
    <Card withBorder radius="md" shadow="xs">
      <Card.Section inheritPadding py="xs">
        <SectionTitle icon={<IconApps size={14} />}>Components</SectionTitle>
      </Card.Section>
      <Card.Section inheritPadding pb="md">
        {pendingComponents ? (
          <Group justify="center"><Loader size="sm" /></Group>
        ) : (
          <SimpleGrid cols={2} spacing="lg">
            <StatTile value={components?.sources_enabled ?? 0} label="Sources" />
            <StatTile value={components?.sinks_enabled ?? 0} label="Destinations" />
          </SimpleGrid>
        )}
      </Card.Section>
    </Card>
  );

  return (
    <Paper withBorder radius="lg" p="md" bg="var(--mantine-color-body)">
      <Stack gap="md">
        {/* Brand Header */}
        <Card withBorder radius="md" shadow="sm">
          <Card.Section inheritPadding py="md">
            <Group justify="space-between" wrap="nowrap">
              <Group gap="sm" wrap="nowrap">
                <Image src={edgestreamLogo} h={32} w="auto" fit="contain" />
                <Stack gap={0}>
                  <Text size="sm" fw={700}>{systemInfo?.hostname || 'Connecting...'}</Text>
                  <Text size="xs" c="dimmed" truncate w={150}>{version || '—'}</Text>
                </Stack>
              </Group>
              <Group gap="xs">
                <Text component="a" href="#" size="xs" c="blue">Release Notes</Text>
                <Divider orientation="vertical" />
                <Text component="a" href="#" size="xs" c="blue">Support</Text>
              </Group>
            </Group>
          </Card.Section>
        </Card>

        {servicesSummaryCard}

        {componentsFirst ? (
          <>{componentsCard}{networkCard}</>
        ) : (
          <>{networkCard}{componentsCard}</>
        )}

        <Card withBorder radius="md" shadow="xs">
          <Card.Section inheritPadding py="xs">
            <SectionTitle icon={<IconClock size={14} />}>System Uptime</SectionTitle>
          </Card.Section>
          <Card.Section inheritPadding pb="md">
            <Text size="sm" fw={500}>{systemInfo?.uptime?.human_readable || '—'}</Text>
          </Card.Section>
        </Card>

        <Card withBorder radius="md" shadow="xs">
          <Card.Section inheritPadding py="xs">
            <SectionTitle icon={<IconDatabase size={14} />}>Partitions</SectionTitle>
          </Card.Section>
          <Card.Section inheritPadding pb="md">
            <Table striped highlightOnHover withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Mount</Table.Th>
                  <Table.Th>Usage</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {systemInfo?.partitions?.map((p: any) => {
                  const usage = Number(p.disk_usage_percent ?? 0);
                  const risk = worstColor(usedColor(usage), freeColor(100 - usage));
                  return (
                    <Table.Tr key={p.mount_point}>
                      <Table.Td>
                        <Group gap="xs">
                          <IconFolder size={14} color="gray" />
                          <Text size="sm">{p.mount_point === '/' ? '/root' : p.mount_point}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Stack gap={4}>
                          <Progress value={usage} color={risk} size="sm" radius="xl" />
                          <Group justify="space-between">
                            <Text size="xs" c="dimmed">{p.disk_free_human_readable} free</Text>
                            <Text size="xs" fw={700}>{usage.toFixed(1)}%</Text>
                          </Group>
                        </Stack>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </Card.Section>
        </Card>
      </Stack>
    </Paper>
  );
};

export default SystemInfo;
