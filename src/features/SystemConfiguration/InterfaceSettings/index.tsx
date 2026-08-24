import React, { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Divider,
  Grid,
  Group,
  LoadingOverlay,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
  Paper,
  SegmentedControl,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconDeviceFloppy, IconNetwork, IconSettings } from '@tabler/icons-react';
import { useEffectOnce, useUpdateEffect } from 'react-use';
import { useNotification } from 'common/useNotifications';
import { useNetworkConfig } from '../api';

const IP_REGEX = /^(?:\d{1,3}\.){3}\d{1,3}$/;

const InterfaceSettings: React.FC = () => {
  const {
    fetchIpMgmt,
    updateIpMgmt,
    fetchInterfaces,
    ipMgmt,
    interfaces,
    isPending
  } = useNetworkConfig();

  const { showJobNotification, showErrorNotification } = useNotification();
  const [ready, setReady] = useState(false);

  const form = useForm({
    initialValues: {
      iface: '',
      family: 'ipv4',
      mgmt_proto: 'dhcp',
      ip_address: '',
      netmask: '',
      gateway: '',
      mgmt_default: true,
      use_management_interface_settings: true,
      events_iface: '',
      events_family: 'ipv4',
      events_proto: 'dhcp',
      events_ip_address: '',
      events_netmask: '',
      events_gateway: '',
      events_default: false,
    },
    validate: {
      iface: (v) => (v ? null : 'Physical interface selection is required'),
      ip_address: (v, values) =>
        (values.mgmt_proto === 'static' && !IP_REGEX.test(v) ? 'Valid IPv4 address is required' : null),
      netmask: (v, values) =>
        (values.mgmt_proto === 'static' && !IP_REGEX.test(v) ? 'Valid subnet mask is required' : null),
      gateway: (v, values) =>
        (values.mgmt_proto === 'static' && v && !IP_REGEX.test(v) ? 'Gateway must be a valid IPv4 address if provided' : null),

      events_iface: (v, values) =>
        (!values.use_management_interface_settings && !v ? 'Physical interface selection is required' : null),
      events_ip_address: (v, values) =>
        (!values.use_management_interface_settings && values.events_proto === 'static' && !IP_REGEX.test(v) ? 'Valid IPv4 address is required' : null),
      events_netmask: (v, values) =>
        (!values.use_management_interface_settings && values.events_proto === 'static' && !IP_REGEX.test(v) ? 'Valid subnet mask is required' : null),
      events_gateway: (v, values) =>
        (!values.use_management_interface_settings && values.events_proto === 'static' && v && !IP_REGEX.test(v) ? 'Gateway must be a valid IPv4 address if provided' : null),
    },
  });

  const ifaceOptions = useMemo(() => {
    if (!Array.isArray(interfaces)) {
      return [];
    }

    return interfaces.map((i: any) => ({
      value: i.device,
      label: `${i.device} (${i.mac_address || 'No MAC'})`
    }));
  }, [interfaces]);

  useEffectOnce(() => {
    fetchInterfaces();
    fetchIpMgmt().then(() => setReady(true));
  });

  useUpdateEffect(() => {
    if (ipMgmt?.mgmt) {
      form.setValues({
        ...form.values,
        iface: ipMgmt.mgmt.iface || '',
        mgmt_proto: ipMgmt.mgmt.dhcp ? 'dhcp' : 'static', // Map backend dhcp boolean to UI state
        ip_address: ipMgmt.mgmt.ip_address || '',
        netmask: ipMgmt.mgmt.netmask || '',
        gateway: ipMgmt.mgmt.gateway || '',
        mgmt_default: !!ipMgmt.mgmt.default,
        use_management_interface_settings: !ipMgmt.event,
        events_iface: ipMgmt.event?.iface || '',
        events_proto: ipMgmt.event?.dhcp ? 'dhcp' : 'static', // Map backend dhcp boolean to UI state
        events_ip_address: ipMgmt.event?.ip_address || '',
        events_netmask: ipMgmt.event?.netmask || '',
        events_gateway: ipMgmt.event?.gateway || '',
        events_default: !!ipMgmt.event?.default,
      });
    }
  }, [ipMgmt]);

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      const isMgmtDhcp = values.mgmt_proto === 'dhcp';
      const isEventDhcp = values.events_proto === 'dhcp';

      const payload = {
        mgmt: {
          iface: values.iface,
          family: values.family,
          dhcp: isMgmtDhcp, // Pass flag directly to backend engine
          ip_address: isMgmtDhcp ? null : values.ip_address,
          netmask: isMgmtDhcp ? null : values.netmask,
          gateway: isMgmtDhcp ? null : (values.gateway || null),
          default: values.mgmt_default
        },
        event: values.use_management_interface_settings ? null : {
          iface: values.events_iface,
          family: values.events_family,
          dhcp: isEventDhcp, // Pass flag directly to backend engine
          ip_address: isEventDhcp ? null : values.events_ip_address,
          netmask: isEventDhcp ? null : values.events_netmask,
          gateway: isEventDhcp ? null : (values.events_gateway || null),
          default: values.events_default
        }
      };
      const job = await updateIpMgmt(payload);

      if (job) {
        showJobNotification({ job });
      }
    } catch (e) {
      showErrorNotification({
        title: 'Failed to Apply Interface Changes',
        description: 'The network configuration could not be updated.',
        error: e,
      });
    }
  });

  if (!ready) return <Text p="xl" c="dimmed">Loading Interface Configuration...</Text>;

  const loading = !!isPending['config/updateIpMgmt/pending'];

  return (
    <Box pos="relative">
      <LoadingOverlay visible={loading} overlayProps={{ blur: 2 }} />

      <form onSubmit={handleSubmit}>
        <Stack gap="xl">

          {/* Management Interface Section */}
          <Paper withBorder p="md" radius="sm">
            <Group justify="space-between" mb="md">
              <Group>
                <IconSettings size={20} />
                <Text fw={700} size="lg">Management Interface</Text>
              </Group>

              <SegmentedControl
                size="xs"
                data={[
                  { label: 'Static IP', value: 'static' },
                  { label: 'DHCP', value: 'dhcp' },
                ]}
                {...form.getInputProps('mgmt_proto')}
              />
            </Group>

            <Grid align="flex-start">
              <Grid.Col span={{ base: 12, md: form.values.mgmt_proto === 'dhcp' ? 12 : 6 }}>
                <Select
                  label="Physical Interface"
                  placeholder="Select Interface"
                  data={ifaceOptions}
                  withAsterisk
                  {...form.getInputProps('iface')}
                />
              </Grid.Col>

              {/* Conditionally hide specific manual configuration boxes if DHCP is enabled */}
              {form.values.mgmt_proto === 'static' && (
                <>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <TextInput label="IP Address" placeholder="192.168.1.10" withAsterisk {...form.getInputProps('ip_address')} />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <TextInput label="Netmask" placeholder="255.255.255.0" withAsterisk {...form.getInputProps('netmask')} />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <TextInput label="Gateway" placeholder="192.168.1.1" {...form.getInputProps('gateway')} />
                  </Grid.Col>
                </>
              )}
            </Grid>
            <Checkbox mt="md" label="Set as system default gateway" {...form.getInputProps('mgmt_default', { type: 'checkbox' })} />
          </Paper>

          {/* Events Interface Section */}
          <Paper withBorder p="md" radius="sm">
            <Group justify="space-between" mb={!form.values.use_management_interface_settings ? 'xs' : '0'}>
              <Group>
                <IconNetwork size={20} />
                <Text fw={700}>Events Interface</Text>
              </Group>
              <Switch
                label="Use Management settings for Events"
                {...form.getInputProps('use_management_interface_settings', { type: 'checkbox' })}
              />
            </Group>

            {!form.values.use_management_interface_settings && (
              <Box mt="xl">
                <Divider mb="xl" label="Separate Events Configuration" labelPosition="center" />

                <Group justify="flex-end" mb="md">
                  <SegmentedControl
                    size="xs"
                    data={[
                      { label: 'Static IP', value: 'static' },
                      { label: 'DHCP', value: 'dhcp' },
                    ]}
                    {...form.getInputProps('events_proto')}
                  />
                </Group>

                <Grid align="flex-start">
                  <Grid.Col span={{ base: 12, md: form.values.events_proto === 'dhcp' ? 12 : 6 }}>
                    <Select
                      label="Physical Interface"
                      placeholder="Select Interface"
                      data={ifaceOptions}
                      withAsterisk
                      {...form.getInputProps('events_iface')}
                    />
                  </Grid.Col>

                  {form.values.events_proto === 'static' && (
                    <>
                      <Grid.Col span={{ base: 12, md: 6 }}>
                        <TextInput label="IP Address" placeholder="192.168.2.10" withAsterisk {...form.getInputProps('events_ip_address')} />
                      </Grid.Col>
                      <Grid.Col span={{ base: 12, md: 6 }}>
                        <TextInput label="Netmask" placeholder="255.255.255.0" withAsterisk {...form.getInputProps('events_netmask')} />
                      </Grid.Col>
                      <Grid.Col span={{ base: 12, md: 6 }}>
                        <TextInput label="Gateway" placeholder="192.168.2.1" {...form.getInputProps('events_gateway')} />
                      </Grid.Col>
                    </>
                  )}
                </Grid>
                <Checkbox mt="md" label="Set as default gateway for event traffic" {...form.getInputProps('events_default', { type: 'checkbox' })} />
              </Box>
            )}
          </Paper>

          <Group justify="flex-end">
            <Button
              size="md"
              type="submit"
              leftSection={<IconDeviceFloppy size={18} />}
              loading={loading}
            >
              Apply Interface Changes
            </Button>
          </Group>
        </Stack>
      </form>
    </Box>
  );
};

export default InterfaceSettings;
