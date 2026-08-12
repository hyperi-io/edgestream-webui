import React, { useMemo, useState, useCallback } from 'react';
import {
  Button,
  Drawer,
  Grid,
  Group,
  Paper,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconPlus, IconX, IconChevronDown } from '@tabler/icons-react';
import QueryBuilder from 'common/queryBuilder';
import SimpleCodeEditor from 'common/simpleCodeEditor';
import { formatQuery } from 'react-querybuilder';
import { useEffectOnce, useUnmount } from 'react-use';
import { useNotification } from 'common/useNotifications';
import { usePub } from 'common/usePubSub';
import {
  useCreateTransform,
  useGetTransformItems,
  useGetTransformParents,
} from 'features/Transform/api';

interface Props {
  open: boolean;
  onClose: () => void;
}

const modeLabels: Record<string, string> = {
  query_builder: 'Query Builder',
  vrl: 'Advance Mode',
};

const CreateDrawer: React.FC<Props> = ({ open, onClose }) => {
  const publish = usePub();
  const { getTransformItems } = useGetTransformItems();
  const { showJobNotification } = useNotification();
  const {
    getTransformParents,
    data: transformParents = [],
    loading: parentsLoading,
  } = useGetTransformParents();
  const { createTransform, loading: pendingCreate }: any = useCreateTransform();

  const [queryMode, setQueryMode] = useState<'query_builder' | 'vrl'>('query_builder');

  const form = useForm({
    initialValues: {
      enabled: true,
      filter_name: '',
      parent: '',
      description: '',
      query_syntax: 'query_builder',
      query_builder: { combinator: 'and', rules: [] } as any,
      query_raw: '',
    },
    validate: {
      filter_name: (v) => (!v?.trim() ? 'Name is required' : /^[A-Za-z0-9_-]+$/.test(v) ? null : 'Invalid Name: A-Z a-z 0-9 _ -'),
      parent: (v) => (!v ? 'Source is required' : null),
      description: (v) => (!v?.trim() ? 'Description is required' : null),
    },
    onValuesChange: (values) => {
      publish('form-field-changed', values);
    },
  });

  const parentOptions = useMemo(() => {
    return (Array.isArray(transformParents) ? transformParents : [])
      .map((p: any) => {
        if (typeof p === 'string') return { value: p, label: p };
        if (p && typeof p === 'object') {
          const value = String(p.value ?? p.name ?? p.id ?? '');
          const label = String(p.label ?? p.name ?? value);
          return value ? { value, label } : null;
        }
        return null;
      })
      .filter(Boolean) as { value: string; label: string }[];
  }, [transformParents]);

  const handleModeChange = useCallback((mode: 'query_builder' | 'vrl') => {
    setQueryMode(mode);
    form.setFieldValue('query_syntax', mode);
  }, [form]);

  const handleOnClose = useCallback(() => {
    form.reset();
    setQueryMode('query_builder');
    onClose();
  }, [form, onClose]);

  const handleSubmit = form.onSubmit(async (values) => {
    const {
      filter_name,
      enabled,
      parent,
      description,
      query_raw,
      query_builder,
      query_syntax,
    } = values;

    const payload: any = {
      enabled,
      type: 'filter',
      name: filter_name,
      parent,
      description,
      query_syntax,
      query_raw: query_syntax === 'vrl' ? query_raw : '',
      query_builder: '',
    };

    if (query_syntax === 'query_builder') {
      try {
        payload.query_builder = JSON.stringify(
          JSON.parse(formatQuery(query_builder, 'json_without_ids')),
        );
      } catch (e) {
        console.error("Failed to parse QueryBuilder JSON:", e);
      }
    }

    const res = await createTransform(payload);
    if (!res?.error) {
      showJobNotification({ job: res.payload });
      getTransformItems();
      handleOnClose();
    }
  });

  useEffectOnce(() => {
    getTransformParents();
  });

  useUnmount(() => {
    handleOnClose();
  });

  return (
    <Drawer opened={open} onClose={handleOnClose} position="right" size={600} title="Create Transform" padding="xl">
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Grid gap="sm" align="end">
            <Grid.Col span={3}>
              <Switch label="Enabled" {...form.getInputProps('enabled', { type: 'checkbox' })} />
            </Grid.Col>
            <Grid.Col span={9}>
              <TextInput label="Name" placeholder="my_filter" withAsterisk {...form.getInputProps('filter_name')} />
            </Grid.Col>
            <Grid.Col span={12}>
              <TextInput label="Description" placeholder="Description..." withAsterisk {...form.getInputProps('description')} />
            </Grid.Col>
            <Grid.Col span={12}>
              <Select
                label="Source"
                placeholder={parentsLoading ? 'Loading…' : 'Select a source'}
                data={parentOptions}
                searchable
                withAsterisk
                disabled={parentsLoading}
                nothingFoundMessage="No sources"
                {...form.getInputProps('parent')}
              />
            </Grid.Col>
          </Grid>

          <Paper withBorder p="md" radius="md">
            <Group justify="space-between" mb="xs">
              <Text fw={700} size="sm">Filter Logic</Text>
              <Select
                value={queryMode}
                onChange={(v) => v && handleModeChange(v as 'query_builder' | 'vrl')}
                data={[
                  { value: 'query_builder', label: modeLabels.query_builder },
                  { value: 'vrl', label: modeLabels.vrl },
                ]}
                rightSection={<IconChevronDown size={16} />}
                allowDeselect={false}
                w={180}
              />
            </Group>

            {queryMode === 'query_builder' ? (
              <QueryBuilder
                value={form.values.query_builder}
                onChange={(v: any) => form.setFieldValue('query_builder', v)}
              />
            ) : (
              <SimpleCodeEditor
                value={form.values.query_raw}
                onChange={(code: string) => form.setFieldValue('query_raw', code)}
              />
            )}
          </Paper>

          <Group justify="flex-end" mt="xl">
            <Button variant="default" leftSection={<IconX size={16} />} onClick={handleOnClose}>Cancel</Button>
            <Button type="submit" leftSection={<IconPlus size={16} />} loading={pendingCreate}>Create</Button>
          </Group>
        </Stack>
      </form>
    </Drawer>
  );
};

export default CreateDrawer;
