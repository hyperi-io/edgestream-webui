import React from 'react';
import {
  Badge,
  Card,
  Group,
  Loader,
  Stack,
  Text,
  Tooltip,
  Progress,
  Grid,
  Divider,
  ThemeIcon,
  Center,
} from '@mantine/core';
import { IconChartDots, IconServer, IconNetwork } from '@tabler/icons-react';

import { useServicesStatus } from 'common/servicesStatus';
import type { Service } from 'common/servicesStatus/servicesStatusSlice';

const statusColor = (s: string): string => {
  switch (s) {
    case 'healthy': return 'green';
    case 'degraded': return 'yellow';
    case 'down': return 'red';
    case 'disabled': return 'gray';
    default: return 'red';
  }
};

const iconFor = (key: string) => {
  if (key === 'vector') return <IconChartDots size={18} />;
  if (key === 'syslog') return <IconServer size={18} />;
  if (key === 'netflow') return <IconNetwork size={18} />;
  return <IconServer size={18} />;
};

const niceName = (svc: Service) => {
  if (svc.key === 'vector') return 'Vector';
  if (svc.key === 'syslog') return 'Syslog';
  if (svc.key === 'netflow') return 'Netflow';
  return svc.name || svc.key;
};

const StatusBucket = ({
                        title,
                        services,
                      }: {
  title: 'healthy' | 'degraded' | 'down' | 'disabled';
  services: Service[];
}) => (
  <Card shadow="xs" radius="md" withBorder>
    <Group justify="space-between" mb="xs">
      <Text fw={600} size="sm">{title.toUpperCase()}</Text>
      <Badge color={statusColor(title)} variant="filled">{services.length}</Badge>
    </Group>
    {services.length === 0 ? (
      <Text size="xs" c="dimmed">No services in this state</Text>
    ) : (
      <Group gap="xs" wrap="wrap">
        {services.map((svc) => (
          <Badge
            key={svc.key}
            leftSection={iconFor(svc.key)}
            variant="light"
            color={statusColor(title)}
          >
            {niceName(svc)}
          </Badge>
        ))}
      </Group>
    )}
  </Card>
);

const ReasonBadges = ({ svc }: { svc: Service }) => {
  if (svc.status === 'disabled') {
    return (
      <Group gap="xs">
        <Badge variant="light" color="gray">disabled</Badge>
      </Group>
    );
  }

  return (
    <Group gap="xs">
      <Badge variant="light" color={svc.active === 'active' ? 'green' : 'red'}>
        {svc.active}{svc.substate ? `/${svc.substate}` : ''}
      </Badge>
      <Badge variant="light" color={svc.enabled === 'enabled' ? 'blue' : 'gray'}>
        {svc.enabled}
      </Badge>
      {svc.ports?.length > 0 && (
        <Badge variant="light" color={svc.ports_ok ? 'green' : 'red'}>
          {svc.ports_ok ? 'ports ok' : 'ports fail'}
        </Badge>
      )}
    </Group>
  );
};

const ServiceCard = ({ svc }: { svc: Service }) => (
  <Card shadow="sm" radius="md" withBorder>
    <Group justify="space-between" mb="xs">
      <Group gap="xs">
        <ThemeIcon color={statusColor(svc.status)} variant="light" radius="xl">
          {iconFor(svc.key)}
        </ThemeIcon>
        <Text fw={600}>{niceName(svc)}</Text>
      </Group>
      <Badge color={statusColor(svc.status)} variant="dot">{svc.status}</Badge>
    </Group>

    <Text size="xs" c="dimmed" mb="xs" truncate>{svc.unit}</Text>
    <ReasonBadges svc={svc} />

    <Divider my="sm" />

    <Stack gap={6}>
      <Text size="xs" fw={500}>
        PID: {svc.pid ?? '—'} · Uptime: {svc.uptime_seconds ? `${Math.floor(svc.uptime_seconds / 60)}m` : '—'}
      </Text>

      <Group gap="xs" grow>
        <Tooltip label={`CPU: ${svc.cpu_pct ?? 0}%`}>
          <Stack gap={2}>
            <Text size="10px" c="dimmed">CPU</Text>
            <Progress value={svc.cpu_pct ?? 0} size="sm" color="blue" />
          </Stack>
        </Tooltip>
        <Tooltip label={`Mem: ${svc.mem_pct ?? 0}%`}>
          <Stack gap={2}>
            <Text size="10px" c="dimmed">MEM</Text>
            <Progress value={svc.mem_pct ?? 0} size="sm" color="cyan" />
          </Stack>
        </Tooltip>
      </Group>

      {svc.ports?.length > 0 && (
        <Group gap={4} mt={4}>
          {svc.ports.map((p) => (
            <Badge key={p.port} variant="outline" size="xs" color={p.ok ? 'green' : 'red'}>
              :{p.port}
            </Badge>
          ))}
        </Group>
      )}
    </Stack>
  </Card>
);

export default function ServicesStatusPage() {
  const { data, loading, error, updatedAt } = useServicesStatus();

  if (loading && !data) {
    return (
      <Center h={400}>
        <Stack align="center" gap="xs">
          <Loader size="sm" />
          <Text size="sm" c="dimmed">Loading services status...</Text>
        </Stack>
      </Center>
    );
  }

  const services = data?.services ?? [];
  const priority = ['vector', 'syslog', 'netflow'];

  const ordered = [...services].sort((a, b) => {
    const ia = priority.indexOf(a.key);
    const ib = priority.indexOf(b.key);
    const sa = ia === -1 ? 99 : ia;
    const sb = ib === -1 ? 99 : ib;
    return sa - sb || niceName(a).localeCompare(niceName(b));
  });

  const buckets = {
    healthy: ordered.filter((s) => s.status === 'healthy'),
    degraded: ordered.filter((s) => s.status === 'degraded'),
    down: ordered.filter((s) => s.status === 'down'),
    disabled: ordered.filter((s) => s.status === 'disabled'),
  };

  return (
    <Stack p="md" gap="xl">
      <Group justify="space-between">
        <Stack gap={0}>
          <Text fw={700} size="xl">System Services</Text>
          {updatedAt && (
            <Text size="xs" c="dimmed">
              Last heart-beat: {new Date(updatedAt).toLocaleTimeString()}
            </Text>
          )}
        </Stack>
        <Badge
          color={statusColor(data?.overall ?? 'down')}
          size="lg"
          variant="filled"
        >
          Overall: {data?.overall?.toUpperCase() ?? 'UNKNOWN'}
        </Badge>
      </Group>

      {error && <Badge color="red" variant="light" fullWidth>{error}</Badge>}

      <Grid gap="md">
        {ordered.map((svc) => (
          <Grid.Col key={svc.key} span={{ base: 12, md: 6, lg: 4 }}>
            <ServiceCard svc={svc} />
          </Grid.Col>
        ))}
      </Grid>

      <Divider label="Status Summary" labelPosition="center" />

      <Grid gap="sm">
        <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
          <StatusBucket title="healthy" services={buckets.healthy} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
          <StatusBucket title="degraded" services={buckets.degraded} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
          <StatusBucket title="down" services={buckets.down} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
          <StatusBucket title="disabled" services={buckets.disabled} />
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
