import React, { useState, useMemo } from 'react';
import { Box, Checkbox, Grid, Stack, Text, LoadingOverlay } from '@mantine/core';
import { useEffectOnce } from 'react-use';
import { useNetworkConfig } from '../api';
import { useGetSystem } from 'features/SystemInfo/api';
import { useNotification } from 'common/useNotifications';
import NetworkItems from './NetworkItems';

const NetworkSettings: React.FC = () => {
  const { showJobNotification, showErrorNotification } = useNotification();
  const { interfaces = [] } = useGetSystem();
  const {
    dns, ntp, routes, hosts, forwarders,
    fetchDns, fetchNtp, fetchRoutes, fetchForwarders, fetchHosts, fetchIpMgmt,
    createDns, createNtp, createRoute, createForwarder, createHost,
    isPending
  } = useNetworkConfig();

  const [advanced, setAdvanced] = useState(false);

  useEffectOnce(() => {
    fetchDns();
    fetchNtp();
    fetchIpMgmt();
    fetchRoutes();
    fetchForwarders();
    fetchHosts();
  });

  const cleanInterfaces = useMemo(() => {
    return interfaces.filter(
      (iface: any) => !(iface.device?.startsWith('tun') || iface.device?.startsWith('tap'))
    );
  }, [interfaces]);

  const handleAdd = async (payload: any, createFn: any, refreshFn: any, done: () => void) => {
    try {
      const job = await createFn(payload);
      showJobNotification({ job });
      refreshFn();
      done();
    } catch (e) {
      showErrorNotification({
        title: 'Operation Failed',
        description: 'Could not add the new network entry.',
        error: e,
      });
    }
  };

  return (
    <Box pos="relative">
      <LoadingOverlay visible={isPending['config/fetchIpMgmt/pending']} overlayProps={{ blur: 1 }} />
      <Grid gap="md">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack gap="xl">
            <Box>
              <Text fw={700} mb="xs">Domain Name Servers (DNS)</Text>
              <NetworkItems
                type="dns"
                items={dns}
                onAddNewItem={(p, cb) => handleAdd(p, createDns, fetchDns, cb)}
                pendingCreate={isPending['dns/create/pending']}
                pendingGet={isPending['dns/fetch/pending']}
              />
            </Box>

            <Box>
              <Text fw={700} mb="xs">Network Time Servers (NTP)</Text>
              <NetworkItems
                type="ntp"
                items={ntp}
                onAddNewItem={(p, cb) => handleAdd(p, createNtp, fetchNtp, cb)}
                pendingCreate={isPending['ntp/create/pending']}
                pendingGet={isPending['ntp/fetch/pending']}
              />
            </Box>

            <Checkbox
              label="Advanced Networking"
              checked={advanced}
              onChange={(e) => setAdvanced(e.currentTarget.checked)}
            />

            {advanced && (
              <Stack gap="xl">
                <Box>
                  <Text fw={700} mb="xs">Static Routes</Text>
                  <NetworkItems
                    type="static-routes"
                    items={routes}
                    interfaces={cleanInterfaces}
                    onAddNewItem={(p, cb) => handleAdd(p, createRoute, fetchRoutes, cb)}
                    pendingCreate={isPending['routes/create/pending']}
                    pendingGet={isPending['routes/fetch/pending']}
                  />
                </Box>

                <Box>
                  <Text fw={700} mb="xs">Static Host Records</Text>
                  <NetworkItems
                    type="static-hosts"
                    items={hosts}
                    onAddNewItem={(p, cb) => handleAdd(p, createHost, fetchHosts, cb)}
                    pendingCreate={isPending['hosts/create/pending']}
                    pendingGet={isPending['hosts/fetch/pending']}
                  />
                </Box>

                <Box>
                  <Text fw={700} mb="xs">Domain Forwarding</Text>
                  <NetworkItems
                    type="forwarder"
                    items={forwarders}
                    onAddNewItem={(p, cb) => handleAdd(p, createForwarder, fetchForwarders, cb)}
                    pendingCreate={isPending['forwarders/create/pending']}
                    pendingGet={isPending['forwarders/fetch/pending']}
                  />
                </Box>
              </Stack>
            )}
          </Stack>
        </Grid.Col>
      </Grid>
    </Box>
  );
};

export default NetworkSettings;
