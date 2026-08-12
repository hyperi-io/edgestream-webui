import React from 'react';

import RegisterForm from 'features/Auth/RegisterForm';

import { StyledRegisterPage } from './styles';

const RegisterPage: React.FC = () => {
  return (
    <StyledRegisterPage>
      <RegisterForm />
    </StyledRegisterPage>
  );
};

export default RegisterPage;
