import React from 'react';

import Authenticate from 'features/Auth/Authenticate';

import { StyledAuthPage } from './styles';

const AuthPage: React.FC = () => {
  return (
    <StyledAuthPage>
      <Authenticate />
    </StyledAuthPage>
  );
};

export default AuthPage;
