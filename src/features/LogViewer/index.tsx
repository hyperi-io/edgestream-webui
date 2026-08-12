import React, { useEffect, useMemo, useState } from 'react';
import { LazyLog, ScrollFollow } from 'react-lazylog';
import { Box, Grid, Group, LoadingOverlay, Select, Switch, Text } from '@mantine/core';
import { useEffectOnce } from 'react-use';

import { useLogFiles } from './api';

/** Helper to resolve WebSocket URLs */
function toWsBase(raw: string | undefined): string {
  if (!raw) return '';
  const s = raw.trim();

  if (s.startsWith('/')) {
    const { protocol, host } = window.location;
    const wsProto = protocol === 'https:' ? 'wss:' : 'ws:';
    const path = s.replace(/^\/+/, '');
    return `${wsProto}//${host}/${path}`.replace(/\/+$/, '/');
  }

  try {
    const u = new URL(s);
    u.protocol = u.protocol === 'https:' ? 'wss:' : 'ws:';
    if (!u.pathname.endsWith('/')) u.pathname += '/';
    return u.toString();
  } catch {
    if (!/^wss?:\/\//i.test(s)) return '';
    return s.endsWith('/') ? s : `${s}/`;
  }
}

function deriveDefaultWsBase(): string {
  const { protocol, host } = window.location;
  return `${protocol === 'https:' ? 'wss:' : 'ws:'}//${host}/`;
}

const LogViewer: React.FC = () => {
  const [activeLog, setActiveLog] = useState('/var/log/syslog');
  const [autoScroll, setAutoScroll] = useState(true);
  const [wsBase, setWsBase] = useState('');

  const { getLogFiles, data: logFiles = [], loading } = useLogFiles();

  useEffectOnce(() => {
    const applyCfg = (cfg: any) => {
      const fromConfig = toWsBase(String(cfg?.VITE_APP_WS_API_URL || ''));
      setWsBase(fromConfig || deriveDefaultWsBase());
    };

    const w = window as any;
    const bootConfig = w.APP_CONFIG ?? w.__APP_CONFIG;

    if (bootConfig?.VITE_APP_WS_API_URL) {
      applyCfg(bootConfig);
    } else {
      fetch(`${import.meta.env.VITE_APP_CONFIG_PATH ?? '/config.json'}?v=${Date.now()}`)
        .then(res => res.json())
        .then(cfg => {
          (window as any).APP_CONFIG = cfg;
          applyCfg(cfg);
        })
        .catch(() => setWsBase(deriveDefaultWsBase()));
    }

    getLogFiles();
  });

  useEffect(() => {
    if (logFiles.length > 0 && !logFiles.includes(activeLog)) {
      setActiveLog(logFiles[0]);
    }
  }, [logFiles, activeLog]);

  const options = useMemo(() => logFiles.map((f) => ({ value: f, label: f })), [logFiles]);

  const currentStreamUrl = useMemo(() => {
    if (!wsBase || !activeLog) return '';
    const token = localStorage.getItem('access_token') || '';
    const qs = new URLSearchParams({
      logfile: activeLog,
      lines: '20',
      token,
    }).toString();
    return `${wsBase}log_viewer/ws?${qs}`;
  }, [wsBase, activeLog]);

  return (
    <Box pos="relative">
      <LoadingOverlay visible={loading} overlayProps={{ blur: 2, radius: 'sm' }} />

      <Grid gap="md">
        <Grid.Col span={12}>
          <Group justify="space-between" align="center">
            <Select
              style={{ width: 360 }}
              searchable
              label="Log file"
              placeholder="Select log file"
              value={logFiles.includes(activeLog) ? activeLog : null}
              onChange={(v) => v && setActiveLog(v)}
              data={options}
            />
            <Group>
              <Text size="sm" fw={500}>Auto Scroll</Text>
              <Switch
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.currentTarget.checked)}
              />
            </Group>
          </Group>
        </Grid.Col>

        <Grid.Col span={12}>
          <div className="h-[calc(100vh-235px)] w-full bg-[#1e1e1e] rounded-md overflow-hidden">
            {!currentStreamUrl ? (
              <Group justify="center" h="100%"><Text c="dimmed">Initializing stream...</Text></Group>
            ) : (
              <ScrollFollow
                startFollowing={autoScroll}
                render={({ follow }) => (
                  <LazyLog
                    key={currentStreamUrl}
                    websocket
                    url={currentStreamUrl}
                    follow={autoScroll && follow}
                    extraLines={1}
                    enableSearch
                    formatPart={(text) => text.trim().replace(/^data: /gm, '')}
                    style={{ backgroundColor: '#1e1e1e' }}
                  />
                )}
              />
            )}
          </div>
        </Grid.Col>
      </Grid>
    </Box>
  );
};

export default LogViewer;
