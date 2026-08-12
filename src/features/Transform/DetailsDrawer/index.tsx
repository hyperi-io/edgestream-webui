import React, { useMemo, useState, useCallback, useRef } from 'react';
import { Global } from '@emotion/react';
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
  LoadingOverlay,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconDeviceFloppy, IconX, IconChevronDown } from '@tabler/icons-react';
import QueryBuilder from 'common/queryBuilder';
import SimpleCodeEditor from 'common/simpleCodeEditor';
import { formatQuery } from 'react-querybuilder';
import { useEffectOnce, useUpdateEffect, useUnmount } from 'react-use';
import { useNotification } from 'common/useNotifications';
import { usePub } from 'common/usePubSub';
import {
  useGetTransformItems,
  useGetTransformParents,
  useUpdateTransform,
} from 'features/Transform/api';

const toUIOperator = (op: string): string => {
  const map: Record<string, string> = {
    '=': 'equals', '==': 'equals', eq: 'equals',
    '!=': 'notEquals', '<>': 'notEquals', ne: 'notEquals',
    '>': 'greaterThan', ge: 'greaterThanOrEqual', '>=': 'greaterThanOrEqual',
    '<': 'lessThan', le: 'lessThanOrEqual', '<=': 'lessThanOrEqual',
    contains: 'contains', startsWith: 'beginsWith', endsWith: 'endsWith',
    in: 'in', notIn: 'notIn', between: 'between', notBetween: 'notBetween',
    null: 'isNull', notNull: 'isNotNull', empty: 'isEmpty', notEmpty: 'isNotEmpty',
  };
  return map[op] ?? op;
};

const toBackendOperator = (op: string): string => {
  const map: Record<string, string> = {
    equals: '=', notEquals: '!=', greaterThan: '>', greaterThanOrEqual: '>=',
    lessThan: '<', lessThanOrEqual: '<=', beginsWith: 'startsWith', endsWith: 'endsWith',
    isNull: 'null', isNotNull: 'notNull', isEmpty: 'empty', isNotEmpty: 'notEmpty',
  };
  return map[op] ?? op;
};

type QBGroup = { combinator: 'and' | 'or'; rules: Array<any> };
const mapOpsDeep = (group: QBGroup, dir: 'toUI' | 'toBackend'): QBGroup => {
  const fx = dir === 'toUI' ? toUIOperator : toBackendOperator;
  const walk = (node: any): any => {
    if (node?.rules && Array.isArray(node.rules)) {
      return { ...node, rules: node.rules.map(walk) };
    }
    if (node && typeof node === 'object') {
      return { ...node, operator: node.operator ? fx(String(node.operator)) : node.operator };
    }
    return node;
  };
  return walk(group);
};

const OPERATORS = [
  { name: 'equals', label: '=' }, { name: 'notEquals', label: '!=' },
  { name: 'greaterThan', label: '>' }, { name: 'greaterThanOrEqual', label: '>=' },
  { name: 'lessThan', label: '<' }, { name: 'lessThanOrEqual', label: '<=' },
  { name: 'contains', label: 'contains' }, { name: 'beginsWith', label: 'begins with' },
  { name: 'endsWith', label: 'ends with' }, { name: 'in', label: 'in' },
  { name: 'notIn', label: 'not in' }, { name: 'between', label: 'between' },
  { name: 'notBetween', label: 'not between' }, { name: 'isNull', label: 'is null' },
  { name: 'isNotNull', label: 'is not null' }, { name: 'isEmpty', label: 'is empty' },
  { name: 'isNotEmpty', label: 'is not empty' },
];

const NO_VALUE_OPS = new Set(['isNull', 'isNotNull', 'isEmpty', 'isNotEmpty']);
const requiresValue = (op?: string) => (op ? !NO_VALUE_OPS.has(op) : true);

const validateQuery = (group: any): string[] => {
  const errors: string[] = [];
  const walk = (node: any, path = 'rule') => {
    if (node?.rules && Array.isArray(node.rules)) {
      node.rules.forEach((r: any, i: number) => walk(r, `${path}.${i}`));
      return;
    }
    const field = (node?.field ?? '').toString().trim();
    const op = (node?.operator ?? '').toString().trim();
    const val = node?.value;

    if (!field) errors.push(`${path}: Field is required`);
    if (!op) errors.push(`${path}: Operator is required`);
    if (requiresValue(op)) {
      const empty = val === null || val === undefined || (typeof val === 'string' && val.trim() === '');
      if (empty) errors.push(`${path}: Value is required`);
    }
  };
  walk(group, 'rule');
  return errors;
};

interface Props {
  transform: any;
  open: boolean;
  onClose: () => void;
}

const modeLabels: Record<string, string> = {
  query_builder: 'Query Builder',
  vrl: 'Advanced Mode',
};

const DetailsDrawer: React.FC<Props> = ({ transform, open, onClose }) => {
  const publish = usePub();
  const { getTransformItems } = useGetTransformItems();
  const { showJobNotification } = useNotification();
  const { updateTransform, loading: pendingUpdate }: any = useUpdateTransform();
  const { getTransformParents, data: transformParents = [], loading: parentsLoading } = useGetTransformParents();

  const [queryMode, setQueryMode] = useState<'query_builder' | 'vrl'>('query_builder');

  const lastLoadedIdRef = useRef<string | null>(null);
  const lastPublishedRef = useRef<string>('');

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
      filter_name: (v) => (!v?.trim() ? 'Name is required' : /^[A-Za-z0-9_-]+$/.test(v) ? null : 'Invalid Name'),
      parent: (v) => (!v ? 'Source is required' : null),
      description: (v) => (!v?.trim() ? 'Description is required' : null),
    },
  });

  const handlePublish = useCallback((values: any) => {
    const stringified = JSON.stringify(values);
    if (lastPublishedRef.current !== stringified) {
      lastPublishedRef.current = stringified;
      publish('form-field-changed', values);
    }
  }, [publish]);

  const parentOptions = useMemo(() => {
    return (Array.isArray(transformParents) ? transformParents : [])
      .map((p: any) => {
        const val = typeof p === 'string' ? p : (p?.value ?? p?.name ?? p?.id);
        const lab = typeof p === 'string' ? p : (p?.label ?? p?.name ?? val);
        return val ? { value: String(val), label: String(lab) } : null;
      })
      .filter(Boolean) as { value: string; label: string }[];
  }, [transformParents]);

  const loadData = useCallback(() => {
    if (!transform) return;

    const mode = (transform.query_syntax === 'vrl') ? 'vrl' : 'query_builder';
    setQueryMode(mode);

    const qbLoaded = mapOpsDeep(
      (typeof transform.query_builder === 'string' ? JSON.parse(transform.query_builder || '{}') : transform.query_builder) as QBGroup,
      'toUI'
    );

    const initialValues = {
      enabled: !!transform.enabled,
      filter_name: transform.name ?? '',
      parent: Array.isArray(transform.parent) ? String(transform.parent[0] ?? '') : String(transform.parent ?? ''),
      description: transform.description ?? '',
      query_syntax: mode,
      query_builder: qbLoaded || { combinator: 'and', rules: [] },
      query_raw: transform.query_raw ?? '',
    };

    form.initialize(initialValues);
    lastPublishedRef.current = JSON.stringify(initialValues);
  }, [transform, form]);

  useUpdateEffect(() => {
    if (open && transform?.name && lastLoadedIdRef.current !== transform.name) {
      lastLoadedIdRef.current = transform.name;
      loadData();
    }
  }, [open, transform, loadData]);

  const handleOnClose = useCallback(() => {
    lastLoadedIdRef.current = null;
    lastPublishedRef.current = '';
    form.reset();
    setQueryMode('query_builder');
    onClose();
  }, [form, onClose]);

  const handleSubmit = form.onSubmit(async (values) => {
    const { filter_name, enabled, parent, description, query_raw, query_builder, query_syntax } = values;

    if (query_syntax === 'query_builder') {
      const qbErrors = validateQuery(query_builder);
      if (qbErrors.length) {
        form.setFieldError('query_builder', qbErrors[0]);
        return;
      }
    }

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
      const qbForBackend = mapOpsDeep(query_builder as QBGroup, 'toBackend');
      payload.query_builder = JSON.stringify(
        JSON.parse(formatQuery(qbForBackend as any, 'json_without_ids'))
      );
    }

    const res = await updateTransform(payload);
    if (!res?.error) {
      showJobNotification({ job: res.payload });
      getTransformItems();
      handleOnClose();
    }
  });

  useEffectOnce(() => { getTransformParents(); });
  useUnmount(() => { handleOnClose(); });

  return (
    <Drawer opened={open} onClose={handleOnClose} position="right" size={600} title={`Update Transform: ${transform?.name || ''}`} padding="xl">
      <Global styles={`.queryBuilder .rule { align-items: center; gap: 8px; } .queryBuilder select, .queryBuilder input { height: 32px; }`} />

      <form onSubmit={handleSubmit}>
        <Stack gap="md" pos="relative">
          <LoadingOverlay visible={!!pendingUpdate || !!parentsLoading} overlayProps={{ blur: 2 }} />

          <Grid gap="sm" align="end">
            <Grid.Col span={3}>
              <Switch
                label="Enabled"
                checked={!!form.values.enabled}
                onChange={(e) => {
                  const v = e.currentTarget.checked;
                  form.setFieldValue('enabled', v);
                  handlePublish({ ...form.values, enabled: v });
                }}
              />
            </Grid.Col>
            <Grid.Col span={9}>
              <TextInput label="Name" readOnly {...form.getInputProps('filter_name')} />
            </Grid.Col>
            <Grid.Col span={12}>
              <TextInput
                label="Description"
                withAsterisk
                {...form.getInputProps('description')}
                onChange={(e) => {
                  const v = e.target.value;
                  form.setFieldValue('description', v);
                  handlePublish({ ...form.values, description: v });
                }}
              />
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
                value={form.values.parent}
                onChange={(v) => {
                  form.setFieldValue('parent', v || '');
                  handlePublish({ ...form.values, parent: v || '' });
                }}
                rightSection={<IconChevronDown size={16} />}
              />
            </Grid.Col>
          </Grid>

          <Paper withBorder p="md" radius="md">
            <Group justify="space-between" mb="xs">
              <Text fw={700} size="sm">Filter Logic</Text>
              <Select
                value={queryMode}
                onChange={(v) => {
                  if (v) {
                    setQueryMode(v as any);
                    form.setFieldValue('query_syntax', v);
                    handlePublish({ ...form.values, query_syntax: v });
                  }
                }}
                data={[{ value: 'query_builder', label: modeLabels.query_builder }, { value: 'vrl', label: modeLabels.vrl }]}
                w={180}
              />
            </Group>

            {queryMode === 'query_builder' ? (
              <>
                <QueryBuilder
                  className="queryBuilder"
                  operators={OPERATORS}
                  value={form.values.query_builder}
                  onChange={(v: any) => {
                    form.setFieldValue('query_builder', v);
                    handlePublish({ ...form.values, query_builder: v });
                  }}
                />
                {form.errors.query_builder && <Text c="red" size="sm" mt={4}>{String(form.errors.query_builder)}</Text>}
              </>
            ) : (
              <SimpleCodeEditor
                value={form.values.query_raw}
                onChange={(code: string) => {
                  form.setFieldValue('query_raw', code);
                  handlePublish({ ...form.values, query_raw: code });
                }}
              />
            )}
          </Paper>

          <Group justify="flex-end" mt="xl">
            <Button variant="default" onClick={handleOnClose}>Cancel</Button>
            <Button type="submit" leftSection={<IconDeviceFloppy size={16} />} loading={pendingUpdate}>Update</Button>
          </Group>
        </Stack>
      </form>
    </Drawer>
  );
};

export default DetailsDrawer;
