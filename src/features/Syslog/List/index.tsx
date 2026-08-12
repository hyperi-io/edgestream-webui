import React, { useMemo, useState, useEffect } from 'react';
import { ActionIcon, Box, Button, Group, LoadingOverlay, Text, TextInput } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { IconEdit, IconTrash, IconX, IconRefresh, IconPlus, IconSearch } from '@tabler/icons-react';
import { DataTable, type DataTableSortStatus } from 'mantine-datatable';
import { useEffectOnce } from 'react-use';

import CreateDrawer from '../CreateDrawer';
import DetailsDrawer from '../DetailsDrawer';
import { useGetSyslogs, useDeleteSyslog } from '../api';
import { useNotification } from 'common/useNotifications';

type SyslogItem = {
  id: number;
  name: string;
  port: number;
  label: string;
  protocols: { protocol: string }[];
};

const PAGE_SIZES = [10, 20, 50];

const SyslogList: React.FC = () => {
  const [search, setSearch] = useState('');
  const [debounced] = useDebouncedValue(search, 200);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<SyslogItem>>({
    columnAccessor: 'port',
    direction: 'asc',
  });

  const [showCreateDrawer, setShowCreateDrawer] = useState(false);
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);
  const [current, setCurrent] = useState<SyslogItem | null>(null);

  const { getSyslogs, data: syslogs = [], loading: pendingGet } = useGetSyslogs();
  const { deleteSyslog, loading: pendingDelete } = useDeleteSyslog();
  const { showJobNotification } = useNotification();

  const handleRefresh = () => getSyslogs();

  const confirmDelete = (record: SyslogItem) => {
    modals.openConfirmModal({
      title: 'Confirm Delete Port',
      centered: true,
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      children: (
        <Text size="sm">Do you want to delete port <b>{record?.port}</b>?</Text>
      ),
      onConfirm: async () => {
        try {
          const job = await deleteSyslog({ name: record.name });
          showJobNotification({ job });
          getSyslogs();
        } catch (e) {}
      },
    });
  };

  useEffectOnce(() => { getSyslogs(); });

  const filteredSorted: SyslogItem[] = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    const base = q.length === 0 ? syslogs : syslogs.filter((item) =>
      (item.label ?? '').toLowerCase().includes(q) || String(item.port).toLowerCase().includes(q)
    );

    const { columnAccessor, direction } = sortStatus;
    return [...base].sort((a, b) => {
      const va = (a as any)?.[columnAccessor];
      const vb = (b as any)?.[columnAccessor];
      const A = columnAccessor === 'port' ? (Number(va) || 0) : String(va || '').toLowerCase();
      const B = columnAccessor === 'port' ? (Number(vb) || 0) : String(vb || '').toLowerCase();
      if (A === B) return 0;
      const cmp = A > B ? 1 : -1;
      return direction === 'asc' ? cmp : -cmp;
    });
  }, [syslogs, debounced, sortStatus]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredSorted.slice(start, start + pageSize);
  }, [filteredSorted, page, pageSize]);

  return (
    <Box pos="relative">
      <LoadingOverlay visible={pendingGet || pendingDelete} overlayProps={{ radius: 'sm', blur: 2 }} />

      <Group justify="space-between" mb="md">
        <TextInput
          value={search}
          onChange={(e) => { setPage(1); setSearch(e.currentTarget.value); }}
          placeholder="Search syslog…"
          leftSection={<IconSearch size={16} />}
          rightSection={search && (
            <ActionIcon variant="subtle" onClick={() => setSearch('')}><IconX size={16} /></ActionIcon>
          )}
          style={{ width: 520 }}
        />
        <Group gap="xs">
          <Button variant="default" leftSection={<IconRefresh size={16} />} onClick={handleRefresh}>Refresh</Button>
          <Button leftSection={<IconPlus size={16} />} onClick={() => setShowCreateDrawer(true)}>Create</Button>
        </Group>
      </Group>

      <DataTable<SyslogItem>
        withTableBorder withColumnBorders highlightOnHover
        idAccessor="id"
        records={paginated}
        totalRecords={filteredSorted.length}
        columns={[
          { accessor: 'port', title: 'Port', width: 120, sortable: true },
          { accessor: 'label', title: 'Name', sortable: true },
          {
            accessor: 'protocols',
            title: 'Protocol',
            render: ({ protocols }) => (
              <Group gap={8}>
                {(protocols || []).map(({ protocol }) => (
                  <Text size="xs" fw={700} key={protocol}>{String(protocol).toUpperCase()}</Text>
                ))}
              </Group>
            ),
          },
          {
            accessor: 'actions',
            title: '',
            width: 200,
            textAlign: 'right',
            render: (record) => (
              <Group gap={8} justify="right">
                <Button
                  size="xs"
                  variant="light"
                  leftSection={<IconEdit size={14} />}
                  onClick={() => { setCurrent(record); setShowDetailsDrawer(true); }}
                >
                  Edit
                </Button>
                <Button
                  size="xs"
                  variant="light"
                  color="red"
                  leftSection={<IconTrash size={14} />}
                  onClick={() => confirmDelete(record)}
                >
                  Delete
                </Button>
              </Group>
            ),
          },
        ]}
        recordsPerPage={pageSize}
        page={page}
        onPageChange={setPage}
        recordsPerPageOptions={PAGE_SIZES}
        onRecordsPerPageChange={setPageSize}
        sortStatus={sortStatus}
        onSortStatusChange={setSortStatus}
        minHeight={360}
      />

      <CreateDrawer open={showCreateDrawer} onClose={() => setShowCreateDrawer(false)} />
      <DetailsDrawer item={current} open={showDetailsDrawer} onClose={() => { setCurrent(null); setShowDetailsDrawer(false); }} />
    </Box>
  );
};

export default SyslogList;
