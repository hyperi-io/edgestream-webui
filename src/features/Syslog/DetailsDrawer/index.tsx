import React, { useEffect } from 'react';
import { Button, Drawer, Grid, Group, Stack, TextInput, MultiSelect, NumberInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconDeviceFloppy, IconX } from '@tabler/icons-react';
import { useGetSyslogs, useUpdateSyslog } from '../api';
import { useNotification } from 'common/useNotifications';

type SyslogItem = {
  id: number;
  name: string;
  port: number;
  label: string;
  protocols: { protocol: string }[];
};

interface Props {
  item: SyslogItem | null;
  open: boolean;
  onClose: () => void;
}

const DetailsDrawer: React.FC<Props> = ({ item, open, onClose }) => {
  const { showJobNotification } = useNotification();
  const { updateSyslog, loading: pendingUpdate } = useUpdateSyslog();
  const { getSyslogs } = useGetSyslogs();

  const form = useForm({
    initialValues: { id: 0, name: '', port: 0, label: '', protocols: [] as string[] },
    validate: {
      label: (v) => (!v?.trim() ? 'Label is required' : null),
      protocols: (v) => (v?.length ?? 0) === 0 ? 'Select at least one protocol' : null,
    },
  });

  useEffect(() => {
    if (open && item) {
      form.setValues({
        id: item.id,
        name: item.name,
        port: item.port,
        label: item.label ?? '',
        protocols: (item.protocols || []).map((p) => p.protocol),
      });
      form.resetDirty();
    }
  }, [open, item?.id]);

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      const payload = {
        name: values.name,
        port: Number(values.port),
        label: values.label,
        protocols: (values.protocols || []).map((p: string) => ({ protocol: p })),
      };
      const job = await updateSyslog(payload);
      showJobNotification({ job });
      getSyslogs();
      onClose();
    } catch (e) {}
  });

  return (
    <Drawer opened={open} onClose={onClose} position="right" size={520} title={`Edit Port: ${item?.port}`} overlayProps={{ blur: 2 }}>
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Grid gap="sm" align="end">
            <Grid.Col span={6}><NumberInput label="Port" readOnly disabled value={form.values.port} /></Grid.Col>
            <Grid.Col span={6}><TextInput label="Label" withAsterisk {...form.getInputProps('label')} /></Grid.Col>
            <Grid.Col span={12}>
              <MultiSelect
                label="Protocols"
                data={[{ value: 'udp', label: 'UDP' }, { value: 'tcp', label: 'TCP' }]}
                withAsterisk
                {...form.getInputProps('protocols')}
              />
            </Grid.Col>
          </Grid>
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={pendingUpdate} leftSection={<IconDeviceFloppy size={16} />}>Update</Button>
          </Group>
        </Stack>
      </form>
    </Drawer>
  );
};

export default DetailsDrawer;
