import dayjs from 'dayjs';
import startCase from 'lodash/startCase';
import React, { useState } from 'react';
import {
  Drawer,
  Table,
  ScrollArea,
  Group,
  Text,
  Badge,
  ActionIcon,
  Tooltip,
  LoadingOverlay,
  Box,
  Indicator,
  useMantineTheme,
  useMantineColorScheme,
} from '@mantine/core';
import {
  IconMenu2,
  IconLoader2,
  IconCircleCheck,
  IconClock,
  IconAlertTriangle,
  IconCircleX,
} from '@tabler/icons-react';
import { dateFormatFromDB } from 'global/constants';
import { useEffectOnce, useInterval, useUpdateEffect } from 'react-use';
import UseQuery from 'common/useQuery';

import { useGetJobs, useGetRunningJobs } from './api';

const BackgroundJobs: React.FC = () => {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const { removeQuery, params } = UseQuery<{ job: string }>();

  const [showJobsList, setShowJobsList] = useState(false);
  const [delay, setDelay] = useState(5000);

  const { getRunningJobs, data: runningJobs } = useGetRunningJobs();
  const { getJobs, data: allJobs, loading: pendingGetAllJobs } = useGetJobs();

  useInterval(() => {
    getRunningJobs();
    if (showJobsList) {
      getJobs(''); // Fetch full list when drawer is open
    }
  }, delay);

  useUpdateEffect(() => {
    setDelay(showJobsList ? 5000 : 15000); // Poll faster (5s) when drawer is open
    if (showJobsList) {
      getJobs(''); // Immediate fetch when opened
    }
  }, [showJobsList]);

  // ---- Render helpers ----
  const renderStatusCell = (record: any) => {
    if (record.state === 'running')
      return <Text size="sm">{record.detail}</Text>;
    if (record.state === 'failed')
      return <Badge color="red">Ansible failed</Badge>;

    return (
      <Group gap="md" justify="center" wrap="nowrap">
        <Indicator inline label={record.processed} disabled={!Number.isFinite(record.processed)}>
          <Badge color="green">Processed</Badge>
        </Indicator>
        <Indicator inline label={record.skipped} disabled={!Number.isFinite(record.skipped)}>
          <Badge color="gray">Skipped</Badge>
        </Indicator>
        <Indicator inline label={record.failed} disabled={!Number.isFinite(record.failed)}>
          <Badge color="red">Failed</Badge>
        </Indicator>
      </Group>
    );
  };

  const renderStateIcon = (state: string) => {
    switch (state) {
      case 'complete':
      case 'completed':
        return <IconCircleCheck size={16} color={theme.colors.green[6]} title="Complete" />;
      case 'running':
        return <IconLoader2 size={16} color={theme.colors.blue[6]} className="animate-spin" title="Running" />;
      case 'pending':
        return <IconClock size={16} color={theme.colors.blue[6]} title="Pending" />;
      case 'failed':
        return <IconCircleX size={16} color={theme.colors.red[6]} title="Failed" />;
      default:
        return <IconAlertTriangle size={16} color={theme.colors.yellow[6]} title="Unknown" />;
    }
  };

  const rows = (allJobs ?? []).map((record: any) => {
    const selected = record.identifier === params.job;
    const selectedBg = colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0];

    return (
      <Table.Tr
        key={record.identifier}
        style={selected ? { background: selectedBg, outline: `2px solid ${theme.colors.blue[5]}` } : undefined}
      >
        <Table.Td>
          <Text size="sm">{record.task}</Text>
          <Text size="xs" c="dimmed" fw={600}>
            {`${String(record.identifier ?? '').split('-')[0].toUpperCase()} - ${startCase(record.detail)} `}
          </Text>
        </Table.Td>

        <Table.Td style={{ width: 320, textAlign: 'center' }}>
          {renderStatusCell(record)}
        </Table.Td>

        <Table.Td style={{ width: 200, textAlign: 'right' }}>
          {record.completed && (
            <Text size="sm" title={`Started at ${dayjs(record.created, dateFormatFromDB).format('MM-DD-YYYY HH:mm A')}`}>
              {dayjs(record.completed, dateFormatFromDB).format('MM-DD-YYYY HH:mm A')}
            </Text>
          )}
        </Table.Td>

        <Table.Td style={{ width: 50, textAlign: 'right' }}>
          {renderStateIcon(record.state)}
        </Table.Td>
      </Table.Tr>
    );
  });

  const isGlobalLoading = (runningJobs?.length ?? 0) > 0 || pendingGetAllJobs;

  return (
    <>
      <Tooltip label="Show Jobs">
        <ActionIcon
          variant="subtle"
          onClick={() => setShowJobsList(true)}
          data-cy="global-show-jobs-button"
        >
          {isGlobalLoading ? (
            <IconLoader2 className="animate-spin" />
          ) : (
            <IconMenu2 />
          )}
        </ActionIcon>
      </Tooltip>

      <Drawer
        opened={showJobsList}
        onClose={() => {
          removeQuery('job');
          setShowJobsList(false);
        }}
        position="right"
        size={900}
        title="Background Jobs"
      >
        <Box pos="relative">
          <LoadingOverlay visible={pendingGetAllJobs} overlayProps={{ blur: 2 }} />
          <ScrollArea h="calc(100vh - 80px)" offsetScrollbars>
            <Table striped highlightOnHover verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Task</Table.Th>
                  <Table.Th style={{ textAlign: 'center', width: 320 }}>Status</Table.Th>
                  <Table.Th style={{ textAlign: 'right', width: 200 }}>Completed</Table.Th>
                  <Table.Th style={{ textAlign: 'right', width: 50 }} />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          </ScrollArea>
        </Box>
      </Drawer>
    </>
  );
};

export default BackgroundJobs;
