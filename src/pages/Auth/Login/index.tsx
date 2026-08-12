import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffectOnce, useUpdateEffect } from 'react-use';

import LoginForm from 'features/Auth/LoginForm';
import { useAuth } from 'features/Auth/api';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { fetchUser, user, isAuthenticated } = useAuth();

  // Redirect if user is already authenticated and approved
  useUpdateEffect(() => {
    if (isAuthenticated && user?.is_approved) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, user]);

  useEffectOnce(() => {
    // Set the legacy flag for the app shell's logout logic
    localStorage.setItem('authenticator', 'local');

    // Sync user details if we already have a token
    if (isAuthenticated) {
      fetchUser();
    }
  });

  return <LoginForm />;
};

export default LoginPage;
