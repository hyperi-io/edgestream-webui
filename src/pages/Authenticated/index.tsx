import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import {
  AppShell,
  Group,
  Burger,
  ScrollArea,
  NavLink,
  Text,
  Box,
  ActionIcon,
  Image,
  Avatar,
  Tooltip,
  useMantineColorScheme,
  LoadingOverlay,
  Stack,
  Divider,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconSun,
  IconMoon,
  IconLogout,
  IconMenu2,
  IconDashboard,
  IconFilter,
  IconActivityHeartbeat,
  IconFileReport,
  IconTimelineEventText,
  IconServer,
  IconSettings,
  IconShieldLock,
  IconCertificate,
  IconCloudUp,
  IconDatabaseExport,
  IconChevronDown,
  IconUsers,
  IconPackage,
  IconPackageExport,
  IconLogs,
} from '@tabler/icons-react';

import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import logoWide from 'assets/edgestream-hound.svg?url';
import logo from 'assets/hyperi-mark_bare.svg?url';

import { useAuth } from 'features/Auth/api';
import BackgroundJobs from 'features/BackgroundJobs';

import MonitoringPage from 'pages/Monitoring';
import OverviewPage from 'pages/Overview';
import SystemPage from 'pages/System';
import ConfigurationPage from 'pages/Configuration';

type NavItem = {
  label: string;
  to?: string;
  icon?: React.ReactNode;
  children?: NavItem[];
  onClick?: () => void;
};

function getNavItems(handleLogout: () => void): { main: NavItem[]; footer: NavItem[] } {
  return {
    main: [
      { label: 'Overview', to: '/overview', icon: <IconDashboard size={18} stroke={1.5} /> },
      {
        label: 'Configuration',
        to: '/events',
        icon: <IconSettings size={18} stroke={1.5} />,
        children: [
          {
            label: 'Sources',
            to: '/events/sources',
            icon: <IconPackage size={16} />,
            children: [
              { label: 'Syslog', to: '/events/sources/syslog', icon: <IconLogs size={14} /> },
              // { label: 'WEC Subscriptions', to: '/events/sources/subscriptions', icon: <IconCertificate size={14} /> },
            ]
          },
          { label: 'Filters', to: '/events/filters', icon: <IconFilter size={16} /> },
          { label: 'Destinations', to: '/events/destinations', icon: <IconPackageExport size={16} /> },
        ],
      },
      {
        label: 'Monitoring',
        to: '/monitoring',
        icon: <IconActivityHeartbeat size={18} stroke={1.5} />,
        children: [
          { label: 'Services', to: '/monitoring/services', icon: <IconTimelineEventText size={16} /> },
          { label: 'Event flow', to: '/monitoring/eventflow', icon: <IconTimelineEventText size={16} /> },
          { label: 'Logfiles', to: '/monitoring/logfiles', icon: <IconFileReport size={16} /> },
        ],
      },
      {
        label: 'System',
        to: '/system',
        icon: <IconServer size={18} stroke={1.5} />,
        children: [
          { label: 'Settings', to: '/system/settings', icon: <IconSettings size={16} /> },
          { label: 'VPN Client', to: '/system/vpn-client', icon: <IconShieldLock size={16} /> },
          { label: 'Certificates', to: '/system/certificate-store', icon: <IconCertificate size={16} /> },
          { label: 'Updates', to: '/system/updates', icon: <IconCloudUp size={16} /> },
          { label: 'Backup', to: '/system/configuration-backup', icon: <IconDatabaseExport size={16} /> },
          { label: 'Users', to: '/system/users', icon: <IconUsers size={16} /> },
        ],
      },
    ],
    footer: [
      { label: 'Log Out', onClick: handleLogout, icon: <IconLogout size={18} stroke={1.5} /> },
    ],
  };
}

/** ---------- Sub-Components ---------- */

function ColorToggle() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  return (
    <ActionIcon onClick={toggleColorScheme} variant="subtle" size="lg" color="gray">
      {colorScheme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
    </ActionIcon>
  );
}

/** ---------- Main Authenticated Shell ---------- */

const AuthenticatedShell: React.FC = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { logout: logoutAuth0, user: auth0User } = useAuth0();
  const { user, logout, isFetchingUser, isAuthenticated } = useAuth();

  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure(false);
  const [desktopCollapsed, { toggle: toggleDesktop }] = useDisclosure(false);
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});

  // Fallback Logic: Preferred Name for UI display
  const displayName = auth0User?.nickname || user?.display_name || user?.full_name || 'User';

  const authenticator = localStorage.getItem('authenticator') ?? 'local';

  const handleLogout = () => {
    if (authenticator === 'auth0') {
      logoutAuth0({ logoutParams: { returnTo: window.location.origin } });
    } else {
      logout();
      navigate('/login', { replace: true });
    }
  };

  // If token is dead or user is flagged as unapproved send to login
  if (!isAuthenticated || (user && user.is_approved === false)) {
    return <Navigate to="/login" replace />;
  }

  const { main: mainNav, footer: footerNav } = getNavItems(handleLogout);
  const navbarWidth = desktopCollapsed ? 70 : 260;

  /** Recursively render navigation links */
  const renderNavItem = (item: NavItem, depth = 0) => {
    const key = `${item.label}-${item.to || 'action'}`;
    const hasChildren = !!item.children?.length;

    const isActive = item.to ? (pathname === item.to) : false;
    const isChildActive = item.to ? (pathname.startsWith(item.to) && pathname !== item.to) : false;

    const isOpened = openMap[key] ?? (isActive || isChildActive);

    const navLink = (
      <NavLink
        key={key}
        label={desktopCollapsed ? null : item.label}
        leftSection={item.icon}
        active={isActive || isChildActive}
        variant={isActive ? "filled" : "light"}
        styles={{
          root: {
            borderRadius: '4px',
            marginBottom: '2px',
            // Indent based on depth
            paddingLeft: !desktopCollapsed ? (depth * 12 + 12) : undefined,
          }
        }}
        onClick={() => {
          if (hasChildren) {
            setOpenMap(prev => ({ ...prev, [key]: !isOpened }));
            if (item.to) navigate(item.to);
          } else if (item.to) {
            navigate(item.to);
            closeMobile();
          } else if (item.onClick) {
            item.onClick();
          }
        }}
        rightSection={hasChildren && !desktopCollapsed && (
          <IconChevronDown
            size={14}
            style={{
              transform: isOpened ? 'rotate(180deg)' : 'none',
              transition: 'transform 200ms'
            }}
          />
        )}
      />
    );

    return (
      <React.Fragment key={key}>
        {desktopCollapsed ? (
          <Tooltip label={item.label} position="right" withArrow offset={20}>
            {navLink}
          </Tooltip>
        ) : navLink}

        {hasChildren && isOpened && !desktopCollapsed && (
          <Box>
            {item.children?.map(child => renderNavItem(child, depth + 1))}
          </Box>
        )}
      </React.Fragment>
    );
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: navbarWidth,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened },
      }}
      padding="md"
    >
      {/* HEADER SECTION */}
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <Group wrap="nowrap">
            <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
            <ActionIcon visibleFrom="sm" onClick={toggleDesktop} variant="subtle" color="gray">
              <IconMenu2 size={20} />
            </ActionIcon>
            <Image
              src={desktopCollapsed ? logo : logoWide}
              h={32} w="auto"
              fit="contain"
            />
          </Group>

          <Group gap="lg">
            {/* Identity Info */}
            <Group gap="xs" visibleFrom="xs">
              <Stack gap={0} align="flex-end">
                <Text size="sm" fw={600} style={{ lineHeight: 1.2 }}>
                  {user?.username || auth0User?.nickname || 'Account'}
                </Text>
                <Text size="xs" c="dimmed">
                  {user?.email || auth0User?.email}
                </Text>
              </Stack>
              <Avatar radius="xl" size="md" color="indigo" variant="light">
                {displayName.charAt(0).toUpperCase()}
              </Avatar>
            </Group>

            <Group gap={5}>
              <BackgroundJobs />
              <ColorToggle />
            </Group>
          </Group>
        </Group>
      </AppShell.Header>

      {/* NAVBAR SECTION */}
      <AppShell.Navbar p="xs">
        <AppShell.Section component={ScrollArea} grow>
          <Stack gap={4}>
            {mainNav.map(item => renderNavItem(item))}
          </Stack>
        </AppShell.Section>

        {/* Footer/Logout Section */}
        <AppShell.Section pt="xs" style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}>
          <Stack gap={4}>
            {footerNav.map(item => renderNavItem(item))}
          </Stack>
        </AppShell.Section>
      </AppShell.Navbar>

      {/* MAIN CONTENT AREA */}
      <AppShell.Main bg="var(--mantine-color-body)">
        <Box pos="relative" style={{ minHeight: 'calc(100vh - 100px)' }}>
          {/* Transparent Overlay for background fetches */}
          <LoadingOverlay
            visible={isFetchingUser}
            overlayProps={{ blur: 1, opacity: 0.1 }}
            loaderProps={{ type: 'bars' }}
          />

          <Routes>
            <Route path="/overview" element={<OverviewPage />} />
            <Route path="/events/*" element={<ConfigurationPage />} />
            <Route path="/system/*" element={<SystemPage />} />
            <Route path="/monitoring/*" element={<MonitoringPage />} />

            {/* Catch-all Redirects */}
            <Route path="/" element={<Navigate to="/overview" replace />} />
            <Route path="*" element={<Navigate to="/overview" replace />} />
          </Routes>
        </Box>
      </AppShell.Main>
    </AppShell>
  );
};

export default AuthenticatedShell;
