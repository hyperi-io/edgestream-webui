import React from 'react';

import { Grid } from '@mantine/core';
import EventMonitor from 'features/EventMonitor';
import ServicesStatus from 'pages/Services';
import LogViewer from 'features/LogViewer';
import { Routes, Route, Navigate } from 'react-router-dom';

const MonitoringPage: React.FC = () => {
  return (
    <div className="w-full">
      <Grid>
        <Grid.Col span={12}>
          <div className="flex min-h-[calc(100vh-90px)] flex-col p-[15px]">
            <Routes>
              <Route index element={<Navigate to="services" replace />} />
              <Route path="services" element={<ServicesStatus />} />
              <Route path="eventflow" element={<EventMonitor />} />
              <Route path="logfiles" element={<LogViewer />} />
            </Routes>
          </div>
        </Grid.Col>
      </Grid>
    </div>
  );
};

export default MonitoringPage;
