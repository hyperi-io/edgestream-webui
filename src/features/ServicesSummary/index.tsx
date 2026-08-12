import React from 'react';

import { Card, Group, Text, SimpleGrid, Badge, Tooltip } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useServicesStatus } from 'common/servicesStatus';

const colorFor = (k: 'healthy' | 'degraded' | 'down' | 'disabled') => {
  switch (k) {
    case 'healthy':
      return 'green';
    case 'degraded':
      return 'yellow';
    case 'down':
      return 'red';
    case 'disabled':
      return 'gray';
    default:
      return 'gray';
  }
};

export default function ServicesSummary() {
  const navigate = useNavigate();
  const { data, loading, error } = useServicesStatus();

  const services = data?.services ?? [];
  const counts = {
    healthy: services.filter((s) => s.status === 'healthy').length,
    degraded: services.filter((s) => s.status === 'degraded').length,
    down: services.filter((s) => s.status === 'down').length,
    disabled: services.filter((s) => s.status === 'disabled').length,
  };

  return (
    <Card withBorder radius="md" p="md">
      <Group justify="space-between" mb="xs">
        <Text fw={600}>Services</Text>
        {/* Clickable badge to jump to the Services page */}
        <Badge
          onClick={() => navigate('/monitoring/services')}
          variant="light"
          style={{ cursor: 'pointer' }}
        >
          View
        </Badge>
      </Group>

      {error && (
        <Badge color="red" variant="light" mb="xs">
          {error}
        </Badge>
      )}

      <SimpleGrid cols={4} spacing="xs" verticalSpacing="xs">
        {(['healthy', 'degraded', 'down', 'disabled'] as const).map((k) => (
          <Tooltip key={k} label={k} withArrow>
            <Card withBorder radius="sm" p="xs">
              <Group
                justify="center"
                gap={4}
                style={{ textTransform: 'capitalize' }}
              >
                <Text size="xs" c="dimmed">
                  {k}
                </Text>
              </Group>
              <Group justify="center" mt={2}>
                <Text fw={700} size="lg" c={colorFor(k)}>
                  {loading ? '—' : counts[k]}
                </Text>
              </Group>
            </Card>
          </Tooltip>
        ))}
      </SimpleGrid>
    </Card>
  );
}
