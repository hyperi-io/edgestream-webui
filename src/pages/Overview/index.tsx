import React from 'react';

import { Card, Grid, SimpleGrid } from '@mantine/core';
import { InfluxChartWrapper } from 'features/InfluxCharts/InfluxChart';
import SystemInfo from 'features/SystemInfo';

const OverviewPage: React.FC = () => {
  return (
    <div className="h-screen w-full overflow-hidden p-4">
      <Grid gap="md" className="h-full">
        {/* Sidebar */}
        <Grid.Col
          span={{ base: 12, md: 4, lg: 3 }}
          className="h-full overflow-y-auto"
        >
          <div className="flex flex-col gap-12">
            <SystemInfo componentsFirst />
          </div>
        </Grid.Col>

        {/* Charts */}
        <Grid.Col
          span={{ base: 12, md: 8, lg: 9 }}
          className="h-full overflow-hidden"
        >
          <SimpleGrid
            cols={{ base: 1, sm: 2 }}
            spacing="md"
            className="h-full"
            style={{ gridAutoRows: 'minmax(360px, 1fr)' }}
          >
            <Card withBorder radius="md" p="md" className="overflow-hidden">
              <InfluxChartWrapper
                bucket="vector_metric"
                measurement="vector.component_sent_events_total"
                componentKind="source"
                componentIdRegex="^01_"
                yAxisLabel="Events"
                legendLabel="Sources"
                simpleLabel={true}
                dataOffset="2m"
              />
            </Card>

            <Card withBorder radius="md" p="md" className="overflow-hidden">
              <InfluxChartWrapper
                bucket="health_metric"
                /* Regex: Matches syslog loss OR cpu stats OR memory stats */
                measurement="loss|load|memory_used_bytes"
                yAxisLabel="System Health"
                legendLabel="Health Metrics"
                dataOffset="2m"
              />
            </Card>

            <Card withBorder radius="md" p="md" className="overflow-hidden">
              <InfluxChartWrapper
                bucket="vector_metric"
                measurement="vector.component_sent_events_total"
                componentKind="sink"
                componentIdRegex="^09_"
                yAxisLabel="Events"
                legendLabel="Destinations"
                simpleLabel={true}
                dataOffset="2m"
              />
            </Card>

            <Card withBorder radius="md" p="md" className="overflow-hidden">
              <InfluxChartWrapper
                bucket="vector_metric"
                measurement="vector.buffer_byte_size"
                bufferType="disk"
                componentKind="sink"
                componentIdRegex="^09_"
                yAxisLabel="Bytes"
                legendLabel="Buffer Usage - Destinations"
                valueUnitLabel="B/sec"
                valueUnitSuffix="KB"
                simpleLabel={true}
                dataOffset="2m"
              />
            </Card>
          </SimpleGrid>
        </Grid.Col>
      </Grid>
    </div>
  );
};

export default OverviewPage;
