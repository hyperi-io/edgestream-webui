import React, { useMemo, useRef, useState, useEffect } from 'react';

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
import CreateDrawer from 'features/Transform/CreateDrawer';
import DetailsDrawer from 'features/Transform/DetailsDrawer';
import { DataTable, type DataTableSortStatus } from 'mantine-datatable';
import {
  useDeleteTransform,
  useGetTransformItems,
} from 'features/Transform/api';

type TransformItem = {
  name: string;
  parent?: string | string[];
  type?: string;
  description?: string;
  enabled?: boolean;
  [k: string]: any;
};

const PAGE_SIZES = [10, 20, 50];

const firstString = (v: unknown): string => {
  if (Array.isArray(v)) return String(v[0] ?? '');
  if (typeof v === 'string') return v;
  return '';
};

const normalizeItem = (
  it: TransformItem,
): TransformItem & { parent: string } => ({
  ...it,
  parent: firstString(it.parent),
});

const TransformList: React.FC = () => {
  const [search, setSearch] = useState('');
  const [debounced] = useDebouncedValue(search, 200);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [sortStatus, setSortStatus] = useState<
    DataTableSortStatus<TransformItem>
  >({
    columnAccessor: 'name',
    direction: 'asc',
  });

  const [showCreateDrawer, setShowCreateDrawer] = useState(false);
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);
  const [current, setCurrent] = useState<TransformItem | null>(null);

  const {
    getTransformItems,
    data: transformItems = [],
    loading: pendingGetItems,
  } = useGetTransformItems();
  const { deleteTransform, loading: pendingDelete }: any = useDeleteTransform();

  const fetching = !!(pendingGetItems || pendingDelete);

  const handleRefresh = () => getTransformItems();

  const confirmDelete = (record: TransformItem) => {
    modals.openConfirmModal({
      title: 'Confirm Delete Transform',
      centered: true,
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      children: (
        <Text size="sm">
          Do you want to delete <b>{record?.name}</b>?
        </Text>
      ),
      onConfirm: async () => {
        const res = await deleteTransform(record.name);
        if (!res?.error) {
          getTransformItems();
        }
      },
    });
  };

  const didInitRef = useRef(false);
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    getTransformItems();
  }, [getTransformItems]);

  const normalized: (TransformItem & { parent: string })[] = useMemo(
    () => (transformItems as TransformItem[]).map(normalizeItem),
    [transformItems],
  );

  // filter + sort
  const filteredSorted: TransformItem[] = useMemo(() => {
    const q = debounced.trim().toLowerCase();

    const base =
      q.length === 0
        ? normalized
        : normalized.filter((item) => {
            const inName = (item.name ?? '').toLowerCase().includes(q);
            const inType = (item.type ?? '').toLowerCase().includes(q);
            const inParent = (item.parent ?? '').toLowerCase().includes(q);
            const inDesc = (item.description ?? '').toLowerCase().includes(q);
            return inName || inType || inParent || inDesc;
          });

    const { columnAccessor, direction } = sortStatus;
    return [...base].sort((a: any, b: any) => {
      const va = a?.[columnAccessor];
      const vb = b?.[columnAccessor];
      const A = typeof va === 'string' ? va.toLowerCase() : va;
      const B = typeof vb === 'string' ? vb.toLowerCase() : vb;
      if (A === B) return 0;
      const cmp = A > B ? 1 : -1;
      return direction === 'asc' ? cmp : -cmp;
    });
  }, [normalized, debounced, sortStatus]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredSorted.slice(start, start + pageSize);
  }, [filteredSorted, page, pageSize]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredSorted.length / pageSize));
    setPage((p) => (p > totalPages ? totalPages : p));
  }, [filteredSorted.length, pageSize]);

  const noRecordsText = debounced
    ? 'No filters match your search.'
    : 'No filters found.';

  const openDetails = (record: TransformItem) => {
    setCurrent(normalizeItem(record));
    setShowDetailsDrawer(true);
  };

  return (
    <Box pos="relative">
      <LoadingOverlay
        visible={fetching}
        overlayProps={{ radius: 'sm', blur: 2 }}
      />

      {/* Header */}
      <Group justify="space-between" mb="md">
        <TextInput
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.currentTarget.value);
          }}
          placeholder="Search filters…"
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

      {/* Table */}
      <DataTable<TransformItem>
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
            width: 280,
            sortable: true,
          },
          {
            accessor: 'parent',
            title: 'Source',
            width: 180,
            sortable: true,
            render: (record) => <div>{firstString(record.parent)}</div>,
          },
          {
            accessor: 'type',
            title: 'Type',
            width: 120,
            sortable: true,
            render: ({ type }) => (
              <div style={{ fontSize: 14 }}>
                {(type ?? '').toString().toUpperCase().replace(/_/g, ' ')}
              </div>
            ),
          },
          {
            accessor: 'description',
            title: 'Description',
            ellipsis: true,
          },
          {
            accessor: 'enabled',
            title: '',
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
                  variant="light"
                  leftSection={<IconEdit size={14} />}
                  onClick={() => openDetails(record)}
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
        noRecordsText={noRecordsText}
      />

      <CreateDrawer
        open={showCreateDrawer}
        onClose={() => setShowCreateDrawer(false)}
      />
      {showDetailsDrawer && current && (
        <DetailsDrawer
          transform={current}
          open={showDetailsDrawer}
          onClose={() => {
            setCurrent(null);
            setShowDetailsDrawer(false);
          }}
        />
      )}
    </Box>
  );
};

export default TransformList;
