import React from 'react';
import { Grid } from '@mantine/core';
import { Routes, Route, Navigate } from 'react-router-dom';

import Updates from 'features/Updates';
import Users from 'features/Users';
import VPNClient from 'features/VPNClient';
import CertificateStore from 'features/CertificateStore';
import BackupRestore from 'features/BackupRestore';
import ConfigurationTabs from 'features/SystemConfiguration';

const SystemPage: React.FC = () => {
  return (
    <div className="w-full">
      <Grid>
        <Grid.Col span={12}>
          <div className="flex min-h-[calc(100vh-90px)] flex-col p-[15px]">
            <Routes>
              <Route index element={<Navigate to="settings" replace />} />
              <Route path="settings" element={<ConfigurationTabs />} />
              <Route path="vpn-client" element={<VPNClient />} />
              <Route path="certificate-store" element={<CertificateStore />} />
              <Route path="updates" element={<Updates />} />
              <Route path="configuration-backup" element={<BackupRestore />} />
              <Route path="users" element={<Users />} />
            </Routes>
          </div>
        </Grid.Col>
      </Grid>
    </div>
  );
};

export default SystemPage;
