import React, { useCallback, useMemo, useState } from 'react';
import { Stack, Text, LoadingOverlay, Box } from '@mantine/core';
import { modals } from '@mantine/modals';
import { useEffectOnce } from 'react-use';

import { useWecSubscriptions } from './api';

import CreateWecSubscriptionDrawer from './CreateDrawer';
import EditWecSubscriptionDrawer from './EditDrawer';
import WecSubscriptionList from './List';
import { SubscriptionPayload, SubscriptionRow } from './types';

export default function WecSubscriptionsPage() {
  const {
    rows,
    loading,
    error,
    reload,
    create,
    update,
    remove,
    isSaving
  } = useWecSubscriptions();

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<SubscriptionRow | null>(null);

  useEffectOnce(() => {
    reload();
  });

  const wecNotConfigured = useMemo(() => {
    if (!error) return false;
    let detail = error;
    if (detail?.response?.data?.detail) detail = detail.response.data.detail;

    if (typeof detail === 'object' && detail !== null) {
      if (detail.code === 'WEC_NOT_CONFIGURED') return true;
      if (detail.message?.toLowerCase().includes('wec service not installed')) return true;
    }

    if (typeof detail === 'string') {
      const lower = detail.toLowerCase();
      return lower.includes('wec service not installed') || lower.includes('unable to open database file');
    }
    return false;
  }, [error]);

  const handleCreateSubmit = async (v: SubscriptionPayload) => {
    try {
      await create(v);
      setCreateOpen(false);
      reload();
    } catch (e) {}
  };

  const handleEditSubmit = async (v: SubscriptionPayload) => {
    if (!editing) return;
    try {
      await update(editing.id, v);
      setEditOpen(false);
      reload();
    } catch (e) {}
  };

  const handleDelete = (row: SubscriptionRow) => {
    modals.openConfirmModal({
      title: 'Confirm delete subscription',
      centered: true,
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      children: <Text size="sm">Do you want to delete <b>{row.name}</b>?</Text>,
      onConfirm: async () => {
        await remove(row.id);
        reload();
      },
    });
  };

  if (wecNotConfigured) {
    return (
      <Stack p="md" gap="md">
        <Text size="sm" c="dimmed">WEC service not installed or configured.</Text>
      </Stack>
    );
  }

  return (
    <Box pos="relative">
      <LoadingOverlay visible={isSaving} overlayProps={{ blur: 2 }} />
      <Stack p="md" gap="md">
        <WecSubscriptionList
          rows={rows}
          loading={loading}
          onReload={reload}
          onCreateClick={() => setCreateOpen(true)}
          onEditClick={(row) => { setEditing(row); setEditOpen(true); }}
          onDeleteClick={handleDelete}
          onToggleEnabled={async (row, next) => {
            await update(row.id, { ...row, enabled: next });
            reload();
          }}
        />

        <CreateWecSubscriptionDrawer
          opened={createOpen}
          onClose={() => setCreateOpen(false)}
          onSubmit={handleCreateSubmit}
        />

        <EditWecSubscriptionDrawer
          opened={editOpen}
          row={editing}
          onClose={() => setEditOpen(false)}
          onSubmit={handleEditSubmit}
        />
      </Stack>
    </Box>
  );
}
