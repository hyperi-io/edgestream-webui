import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Group,
  LoadingOverlay,
  Modal,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  FileInput,
  Paper,
  Title,
  Badge,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import { IconPlus, IconTrash, IconPencil, IconUpload, IconDeviceFloppy, IconRefresh } from '@tabler/icons-react';
import { IFile } from 'global/types';
import { RootState, AppDispatch } from 'app/store';
import { useNotification } from 'common/useNotifications';
import { getFiles, createFile, updateFile, deleteFile } from './store/certificateSlice';

type Mode = 'create' | 'update';

const TYPE_MAP: Record<string, string> = {
  certificate_authority: 'Certificate Authority',
  certificate: 'Certificate',
  private_key: 'Private Key',
};

const typeOptions = Object.entries(TYPE_MAP).map(([value, label]) => ({ value, label }));

const formatFileSize = (v?: number | string): string => {
  if (v == null) return '—';
  const bytes = Number(v);
  if (!Number.isFinite(bytes)) return String(v);
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB', 'TB', 'PB'];
  let n = bytes / 1024;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i += 1; }
  return `${n.toFixed(n < 10 ? 1 : 0)} ${units[i]}`;
};

const CertificateStore: React.FC = () => {
  const { showJobNotification } = useNotification();
  const dispatch = useDispatch<AppDispatch>();
  const { list: allFiles, loading } = useSelector((state: RootState) => state.certs);

  const [opened, setOpened] = React.useState(false);
  const [mode, setMode] = React.useState<Mode>('create');
  const [file, setFile] = React.useState<File | null>(null);

  const form = useForm({
    initialValues: { id: 0, type: '', filename: '' },
    validate: {
      type: (v) => (!v ? 'Select a file type' : null),
      filename: (v) => (mode === 'update' && !v ? 'Set a filename' : null),
    },
  });

  const fetchFiles = React.useCallback(() => {
    dispatch(getFiles());
  }, [dispatch]);

  React.useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const reset = () => { form.reset(); setFile(null); };

  const confirmDelete = (rec: IFile) => {
    modals.openConfirmModal({
      title: 'Confirm delete?',
      children: <Text size="sm">Delete file “{rec.filename}” ({TYPE_MAP[rec.type] || rec.type})?</Text>,
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red', leftSection: <IconTrash size={16} /> },
      onConfirm: async () => {
        const payload = await dispatch(deleteFile({ id: Number(rec.id) })).unwrap();
        showJobNotification({ job: payload });
        fetchFiles();
      },
    });
  };

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      if (mode === 'create') {
        if (!file) { alert('Please select a file'); return; }
        const formData = new FormData();
        formData.append('file', file);
        formData.append('file_type', values.type);
        const payload = await dispatch(createFile(formData)).unwrap();
        showJobNotification({ job: payload });
      } else {
        const payload = await dispatch(updateFile({ id: values.id, type: values.type, filename: values.filename } as IFile)).unwrap();
        showJobNotification({ job: payload });
      }
      fetchFiles();
      setOpened(false);
      reset();
    } catch {}
  });

  const isBusy = loading.get || loading.create || loading.update || loading.delete;

  return (
    <Box pos="relative">
      <LoadingOverlay visible={isBusy} overlayProps={{ blur: 2, radius: 'sm' }} />

      <Stack gap="lg">
        <Group justify="space-between">
          <Box>
            <Title order={3}>Certificate Store</Title>
            <Text c="dimmed" size="sm">Manage certificates for sources and destinations.</Text>
          </Box>

          <Group>
            <Button leftSection={<IconPlus size={16} />} onClick={() => { setMode('create'); reset(); setOpened(true); }}>
              Upload new file
            </Button>
          </Group>
        </Group>

        <Paper withBorder radius="sm">
          <Table highlightOnHover verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>File Name</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>Common Name</Table.Th>
                <Table.Th>Expires</Table.Th>
                <Table.Th>File Size</Table.Th>
                <Table.Th style={{ width: 200 }} />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {allFiles.map((rec) => (
                <Table.Tr key={rec.id}>
                  <Table.Td>{rec.filename}</Table.Td>
                  <Table.Td><Badge variant="light" size="sm">{TYPE_MAP[rec.type] || rec.type}</Badge></Table.Td>
                  <Table.Td><Text size="sm">{rec.common_name || '—'}</Text></Table.Td>
                  <Table.Td>
                    <Text
                      size="sm"
                      fw={rec.not_after && new Date(String(rec.not_after) + (String(rec.not_after).endsWith('Z') ? '' : 'Z')) < new Date() ? 700 : undefined}
                      c={rec.not_after && new Date(String(rec.not_after) + (String(rec.not_after).endsWith('Z') ? '' : 'Z')) < new Date() ? 'red.6' : undefined}
                    >
                      {rec.not_after ? new Date(String(rec.not_after) + (String(rec.not_after).endsWith('Z') ? '' : 'Z')).toLocaleString() : '—'}
                    </Text>
                  </Table.Td>
                  <Table.Td>{formatFileSize(rec.filesize)}</Table.Td>
                  <Table.Td>
                    <Group justify="flex-end" gap="xs" wrap="nowrap">
                      <Button variant="light" size="xs" leftSection={<IconPencil size={14} />}
                              onClick={() => { setMode('update'); form.setValues({ id: Number(rec.id), type: rec.type, filename: rec.filename }); setOpened(true); }}>
                        Edit
                      </Button>
                      <Button variant="light" size="xs" color="red" leftSection={<IconTrash size={14} />} onClick={() => confirmDelete(rec)}>
                        Delete
                      </Button>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
              {allFiles.length === 0 && !loading.get && (
                <Table.Tr>
                  <Table.Td colSpan={6}>
                    <Text ta="center" c="dimmed" py="xl">No certificate files configured.</Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Paper>
      </Stack>

      <Modal opened={opened} onClose={() => setOpened(false)} title={mode === 'create' ? 'Upload File' : 'Update File'} centered>
        <form onSubmit={handleSubmit}>
          <Stack gap="sm">
            {mode === 'create' ? (
              <FileInput label="File" placeholder="Click to select file" leftSection={<IconUpload size={16} />}
                         accept=".crt,.pem,.cer,.key,.der,.pfx,.p12" value={file} onChange={setFile} withAsterisk clearable />
            ) : (
              <TextInput label="Filename" withAsterisk value={form.values.filename} onChange={(e) => form.setFieldValue('filename', e.currentTarget.value)} />
            )}
            <Select label="Type" placeholder="Select a file type" data={typeOptions} withAsterisk value={form.values.type} onChange={(v) => form.setFieldValue('type', v || '')} />
            <Group justify="flex-end" mt="xs">
              <Button variant="default" onClick={() => setOpened(false)}>Cancel</Button>
              <Button type="submit" leftSection={<IconDeviceFloppy size={16} />} loading={loading.create || loading.update}>
                {mode === 'create' ? 'Upload' : 'Update'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Box>
  );
};

export default CertificateStore;
