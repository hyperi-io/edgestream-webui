import React, { useMemo, useState, useEffect } from 'react';

import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Group,
  LoadingOverlay,
  Text,
  TextInput,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import {
  IconEdit,
  IconTrash,
  IconX,
  IconRefresh,
  IconPlus,
  IconSearch,
} from '@tabler/icons-react';
import CreateDrawer from 'features/Destination/CreateDrawer';
import DetailsDrawer from 'features/Destination/DetailsDrawer';
import { DataTable, type DataTableSortStatus } from 'mantine-datatable';
import { useEffectOnce } from 'react-use';
import {
  useDeleteDestination,
  useGetDestinationItems,
  useGetEventsItems,
} from 'features/Destination/api';
import { useNotification } from 'common/useNotifications';
import { useGetCertificates } from 'features/CertificateStore/api';

type DestinationItem = {
  name: string;
  type: string;
  description?: string | null;
  enabled?: boolean;
  system?: boolean;
  fallback?: boolean;
  [k: string]: any;
};

const PAGE_SIZES = [10, 20, 50];

const List: React.FC = () => {
  const [search, setSearch] = useState('');
  const [debounced] = useDebouncedValue(search, 200);

  const [currentDestination, setCurrentDestination] =
    useState<DestinationItem | null>(null);
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [sortStatus, setSortStatus] = useState<
    DataTableSortStatus<DestinationItem>
  >({
    columnAccessor: 'name',
    direction: 'asc',
  });

  const { showJobNotification } = useNotification();

  const {
    getDestinationItems,
    data: destinationItems = [],
    loading: pendingGetDestinationList,
  } = useGetDestinationItems();

  const { getEventsItems } = useGetEventsItems();
  const { getCertificates } = useGetCertificates();

  const { deleteDestination, loading: pendingDeleteDestination }: any =
    useDeleteDestination();

  const handleRefresh = () => {
    getDestinationItems();
  };

  const handleShowDetails = (record: DestinationItem) => {
    setCurrentDestination(record);
    setShowDetailsDrawer(true);
  };

  const confirmDelete = (record: DestinationItem) => {
    modals.openConfirmModal({
      title: 'Confirm Delete Destination',
      centered: true,
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      children: (
        <Text size="sm">
          Do you want to delete <b>{record?.name}</b>?
        </Text>
      ),
      onConfirm: async () => {
        const response = await deleteDestination(record.name);
        if (!response?.error) {
          showJobNotification({ job: response.payload });
          getDestinationItems();
        }
      },
    });
  };

  const filteredSorted: DestinationItem[] = useMemo(() => {
    const q = debounced.trim().toLowerCase();

    const base =
      q.length === 0
        ? (destinationItems as DestinationItem[])
        : (destinationItems as DestinationItem[]).filter((item) => {
            const inName = (item.name ?? '').toLowerCase().includes(q);
            const inType = (item.type ?? '').toLowerCase().includes(q);
            const inDesc = (item.description ?? '').toLowerCase().includes(q);
            return inName || inType || inDesc;
          });

    const { columnAccessor, direction } = sortStatus;
    return [...base].sort((a, b) => {
      const va = (a as any)?.[columnAccessor];
      const vb = (b as any)?.[columnAccessor];
      const an = typeof va === 'string' ? va.toLowerCase() : va;
      const bn = typeof vb === 'string' ? vb.toLowerCase() : vb;
      if (an === bn) return 0;
      const cmp = an > bn ? 1 : -1;
      return direction === 'asc' ? cmp : -cmp;
    });
  }, [destinationItems, debounced, sortStatus]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredSorted.slice(start, start + pageSize);
  }, [filteredSorted, page, pageSize]);

  // initial load
  useEffectOnce(() => {
    Promise.all([
      getDestinationItems(),
      getEventsItems(),
      getCertificates(),
    ]).then(() => {});
  });

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredSorted.length / pageSize));
    setPage((p) => (p > totalPages ? totalPages : p));
  }, [filteredSorted.length, pageSize]);

  const fetching = !!(pendingGetDestinationList || pendingDeleteDestination);

  return (
    <Box pos="relative">
      <LoadingOverlay
        visible={fetching}
        overlayProps={{ radius: 'sm', blur: 2 }}
      />

      {/* Header actions */}
      <Group justify="space-between" mb="md">
        <TextInput
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.currentTarget.value);
          }}
          placeholder="Search destinations…"
          leftSection={<IconSearch size={16} />}
          rightSection={
            search ? (
              <ActionIcon
                variant="subtle"
                onClick={() => setSearch('')}
                aria-label="Clear search"
              >
                <IconX size={16} />
              </ActionIcon>
            ) : null
          }
          style={{ width: 'min(520px, 100%)' }}
        />
        <Group gap="xs">
          <Button
            variant="default"
            leftSection={<IconRefresh size={16} />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setShowCreateDrawer(true)}
          >
            Create
          </Button>
        </Group>
      </Group>

      {/* Data table */}
      <DataTable<DestinationItem>
        withTableBorder
        withColumnBorders
        highlightOnHover
        idAccessor="name"
        records={paginated}
        totalRecords={filteredSorted.length}
        fetching={fetching}
        columns={[
          {
            accessor: 'name',
            title: 'Name',
            width: 320,
            sortable: true,
            render: (record) => (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>{record.name}</span>
                  {record.fallback && (
                    <Badge color="blue" variant="light" size="xs">
                      Fallback
                    </Badge>
                  )}
                </div>
                {record.description ? (
                  <div
                    style={{
                      fontSize: 12,
                      color: 'var(--mantine-color-dimmed)',
                    }}
                    title={record.description}
                  >
                    {record.description}
                  </div>
                ) : null}
              </div>
            ),
          },
          {
            accessor: 'type',
            title: 'Type',
            width: 140,
            sortable: true,
            render: ({ type }) => (
              <div style={{ fontSize: 14 }}>
                {(type ?? '').toString().toUpperCase().replace(/_/g, ' ')}
              </div>
            ),
          },
          {
            accessor: 'enabled',
            title: 'Status',
            width: 120,
            sortable: true,
            render: ({ enabled }) => (
              <Badge color={enabled ? 'blue' : 'gray'} variant="light">
                {enabled ? 'Enabled' : 'Disabled'}
              </Badge>
            ),
          },
          {
            accessor: 'actions',
            title: '',
            width: 220,
            textAlign: 'center',
            render: (record) => (
              <div
                style={{ display: 'flex', justifyContent: 'center', gap: 8 }}
              >
                <Button
                  size="xs"
                  variant="light" // Changed from default to light
                  leftSection={<IconEdit size={14} />}
                  onClick={() => handleShowDetails(record)}
                >
                  Edit
                </Button>
                <Button
                  size="xs"
                  variant="light"
                  color="red"
                  leftSection={<IconTrash size={14} />}
                  disabled={record.system === true}
                  title={
                    record.system
                      ? 'Cannot remove system destination'
                      : 'Delete'
                  }
                  onClick={() => !record.system && confirmDelete(record)}
                >
                  Delete
                </Button>
              </div>
            ),
          },
        ]}
        recordsPerPage={pageSize}
        page={page}
        onPageChange={setPage}
        recordsPerPageOptions={PAGE_SIZES}
        onRecordsPerPageChange={(size) => {
          setPage(1);
          setPageSize(size);
        }}
        sortStatus={sortStatus}
        onSortStatusChange={setSortStatus}
        minHeight={360}
        noRecordsText={
          debounced
            ? 'No destinations match your search.'
            : 'No destinations found.'
        }
      />

      {/* Drawers */}
      <CreateDrawer
        open={showCreateDrawer}
        onClose={() => setShowCreateDrawer(false)}
      />

      {showDetailsDrawer && currentDestination && (
        <DetailsDrawer
          destination={currentDestination}
          open={showDetailsDrawer}
          onClose={() => {
            setCurrentDestination(null);
            setShowDetailsDrawer(false);
          }}
        />
      )}
    </Box>
  );
};

export default List;
