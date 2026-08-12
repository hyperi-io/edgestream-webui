import React from 'react';
import { ActionIcon, Tooltip, Menu, Text, UnstyledButton, Group, Stack, Divider } from '@mantine/core';
import { IconBell, IconSettings, IconCircleCheck } from '@tabler/icons-react';

const TopBarNotifications: React.FC = () => {
  const hasNotifications = true;

  return (
    <Menu shadow="md" width={320} position="bottom-end" withArrow transitionProps={{ transition: 'pop-top-right' }}>
      <Menu.Target>
        <Tooltip label="Notifications">
          <ActionIcon variant="subtle" color="gray" size="lg" pos="relative">
            <IconBell size={22} />
            {hasNotifications && (
              <div style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 10,
                height: 10,
                backgroundColor: 'var(--mantine-color-red-6)',
                borderRadius: '50%',
                border: '2px solid var(--mantine-color-body)'
              }} />
            )}
          </ActionIcon>
        </Tooltip>
      </Menu.Target>

      <Menu.Dropdown p="xs">
        <Group justify="space-between" mb="xs" px="sm" py={4}>
          <Text size="xs" fw={700} c="dimmed" tt="uppercase">System Notifications</Text>
          <ActionIcon variant="subtle" color="gray" size="xs">
            <IconSettings size={14} />
          </ActionIcon>
        </Group>

        <Divider mb="xs" />

        <Stack gap={4}>
          <UnstyledButton p="sm" style={t => ({ borderRadius: t.radius.sm, '&:hover': { backgroundColor: 'var(--mantine-color-gray-0)' } })}>
            <Group wrap="nowrap" align="flex-start">
              <IconCircleCheck size={18} color="var(--mantine-color-green-6)" style={{ marginTop: 2 }} />
              <div>
                <Text size="sm" fw={500}>System Update Complete</Text>
                <Text size="xs" c="dimmed">All services are running on version 1.9.0</Text>
              </div>
            </Group>
          </UnstyledButton>
        </Stack>

        <Divider my="xs" />

        <Menu.Item color="indigo" variant="subtle">
          <Text size="xs" ta="center" fw={600}>View all logs</Text>
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export default TopBarNotifications;
