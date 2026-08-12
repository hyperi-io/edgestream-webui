import React from 'react';
import { Tabs, ScrollArea, Box } from '@mantine/core';
import SystemSettings from './SystemSettings';
import InterfaceSettings from './InterfaceSettings';
import NetworkSettings from './NetworkSettings';
import AdvancedSettings from './AdvancedSettings';

const CONTENT_HEIGHT = 'calc(100vh - 180px)';

const ConfigurationTabs: React.FC = () => {
  return (
    <Box p="md">
      <Tabs variant="pills" radius="md" defaultValue="system">
        <Tabs.List grow mb="md">
          <Tabs.Tab value="system">System</Tabs.Tab>
          <Tabs.Tab value="interface">Interfaces</Tabs.Tab>
          <Tabs.Tab value="network">Network</Tabs.Tab>
          <Tabs.Tab value="advanced">Advanced</Tabs.Tab>
        </Tabs.List>

        <ScrollArea h={CONTENT_HEIGHT} offsetScrollbars>
          <Tabs.Panel value="system"><SystemSettings /></Tabs.Panel>
          <Tabs.Panel value="interface"><InterfaceSettings /></Tabs.Panel>
          <Tabs.Panel value="network"><NetworkSettings /></Tabs.Panel>
          <Tabs.Panel value="advanced"><AdvancedSettings /></Tabs.Panel>
        </ScrollArea>
      </Tabs>
    </Box>
  );
};

export default ConfigurationTabs;
