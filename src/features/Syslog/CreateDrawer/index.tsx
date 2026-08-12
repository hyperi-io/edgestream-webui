import React from 'react';
import { Button, Drawer, Grid, Group, Stack, TextInput, MultiSelect, NumberInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconPlus, IconX } from '@tabler/icons-react';
import { useCreateSyslog, useGetSyslogs } from '../api';
import { useNotification } from 'common/useNotifications';

interface Props {
  open: boolean;
  onClose: () => void;
}

const CreateDrawer: React.FC<Props> = ({ open, onClose }) => {
  const { showJobNotification } = useNotification();
  const { createSyslog, loading: pendingCreate } = useCreateSyslog();
  const { getSyslogs } = useGetSyslogs();

  const form = useForm({
    initialValues: { port: '' as number | '', label: '', protocols: [] as string[] },
    validate: {
      port: (v) => (v === '' || v === undefined ? 'Port is required' : null),
      label: (v) => (!v?.trim() ? 'Label is required' : null),
      protocols: (v) => (v?.length ?? 0) === 0 ? 'Select at least one protocol' : null,
    },
  });

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      const payload = {
        port: Number(values.port),
        label: values.label,
        protocols: (values.protocols || []).map((p: string) => ({ protocol: p })),
      };
      const job = await createSyslog(payload);
      showJobNotification({ job });
      getSyslogs();
      handleOnClose();
    } catch (e) {}
  });

  const handleOnClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Drawer opened={open} onClose={handleOnClose} position="right" size={520} title="Create Syslog Port" overlayProps={{ blur: 2 }}>
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Grid gap="sm" align="end">
            <Grid.Col span={6}>
              <NumberInput label="Port" placeholder="514" min={1} withAsterisk {...form.getInputProps('port')} />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput label="Label" placeholder="linux_syslog" withAsterisk {...form.getInputProps('label')} />
            </Grid.Col>
            <Grid.Col span={12}>
              <MultiSelect
                label="Protocols"
                placeholder="Select syslog protocols"
                data={[{ value: 'udp', label: 'UDP' }, { value: 'tcp', label: 'TCP' }]}
                withAsterisk
                {...form.getInputProps('protocols')}
              />
            </Grid.Col>
          </Grid>
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={handleOnClose}>Cancel</Button>
            <Button type="submit" loading={pendingCreate} leftSection={<IconPlus size={16} />}>Create</Button>
          </Group>
        </Stack>
      </form>
    </Drawer>
  );
};

export default CreateDrawer;
