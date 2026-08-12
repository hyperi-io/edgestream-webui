import React, { useEffect } from 'react';
import { Button, Center, Loader, Text } from '@mantine/core';
import { Routes, Route, Navigate } from 'react-router-dom';

import { useAuth } from 'features/Auth/api';

import LoginPage from '../pages/Auth/Login';
import RegisterPage from '../pages/Auth/Register';
import AuthenticatedPage from 'pages/Authenticated';
import { useInfluxConfig } from 'features/Config/api';

const FullscreenSpinner: React.FC = () => (
  <Center style={{ height: '100vh', width: '100%' }}>
    <Loader size="xl" />
  </Center>
);

const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const authenticator = localStorage.getItem('authenticator') ?? 'local';
  const { user, isAuthenticated, isFetchingUser, fetchUser } = useAuth();
  const { config, isFetching: configLoading, error: configError, loadConfig } = useInfluxConfig();

  useEffect(() => {
    if (authenticator === 'local' && isAuthenticated && !user && !isFetchingUser) {
      fetchUser();
    }
  }, [authenticator, isAuthenticated, user, isFetchingUser, fetchUser]);

  // Initial Config Fetch
  useEffect(() => {
    const canLoad = (authenticator === 'auth0') || (user?.is_approved);
    if (canLoad && !config && !configLoading && !configError) {
      loadConfig();
    }
  }, [authenticator, user, config, configLoading, configError, loadConfig]);

  const isInitialLoading =
    (isFetchingUser && !user) ||
    (configLoading && !config) ||
    (authenticator === 'auth0' && !config);

  if (isInitialLoading) {
    return <FullscreenSpinner />;
  }

  const isAuthorized =
    (authenticator === 'auth0') ||
    (isAuthenticated && user?.is_approved);

  if (!isAuthorized && !isFetchingUser) {
    return <Navigate to="/login" replace />;
  }

  if (configError && !config) {
    return (
      <Center style={{ height: '100vh', flexDirection: 'column' }}>
        <Text c="red" fw={700}>System Configuration Error</Text>
        <Button mt="md" onClick={() => loadConfig()}>Retry</Button>
      </Center>
    );
  }

  return children;
};

/** ---------- Main App ---------- */

const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/terms-and-conditions" element={<Center p="xl">Terms and Conditions</Center>} />
      <Route path="/privacy-policy" element={<Center p="xl">Privacy Policy</Center>} />

      {/* Authenticated Wrapper */}
      <Route
        path="/*"
        element={
          <PrivateRoute>
            <AuthenticatedPage />
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

export default App;
