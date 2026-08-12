import React from 'react';

import { Grid, Alert } from '@mantine/core';
import Sinks from 'features/Destination/List';
import Sources from 'features/Source/List';
import Syslog from 'features/Syslog/List';
import { useSystem } from 'features/SystemInfo/api';
import Filters from 'features/Transform/List';
import WecSubscriptionsPage from 'features/WecSubscription';
import { Routes, Route, Navigate, Link } from 'react-router-dom';

const EventsPage: React.FC = () => {
  const { isManagedCollector } = useSystem();

  return (
    <div className="w-full">
      {/* Managed Controller Alert code remains the same */}
      <Grid>
        <Grid.Col span={12}>
          <div className="flex min-h-[calc(100vh-90px)] flex-col p-[15px]">
            <Routes>
              <Route index element={<Navigate to="sources" replace />} />

              <Route path="sources">
                <Route index element={<Sources />} />
                <Route path="syslog" element={<Syslog />} />
                <Route path="subscriptions" element={<WecSubscriptionsPage />} />
              </Route>

              <Route path="filters" element={<Filters />} />
              <Route path="destinations" element={<Sinks />} />
            </Routes>
          </div>
        </Grid.Col>
      </Grid>
    </div>
  );
};

export default EventsPage;
