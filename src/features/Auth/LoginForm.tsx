import React from 'react';
import {
  Anchor,
  Box,
  Button,
  Divider,
  Grid,
  Group,
  Image,
  LoadingOverlay,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
  IconArrowRight,
  IconLock,
  IconShieldCheck,
  IconUser,
} from '@tabler/icons-react';
import { Link, useNavigate } from 'react-router-dom';

import edgeStreamLogo from 'assets/edgestream-hub-logo.png?url';
import hyperiLogo from 'assets/hyperi-stacked_square_white.svg?url';

import { useNotification } from 'common/useNotifications';
import { useAuth } from './api';

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoggingIn } = useAuth();
  const { showErrorNotification } = useNotification();

  const form = useForm({
    initialValues: {
      username: '',
      password: '',
      otp: '',
    },

    validate: {
      username: (value) =>
        !value?.trim() ? 'Please enter your username' : null,

      password: (value) =>
        !value?.trim() ? 'Please enter your password' : null,

      otp: (value) =>
        value && value.length < 4
          ? 'Code must be at least 4 digits'
          : null,
    },
  });

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      await login({
        username: values.username.trim(),
        password: values.password.trim(),
        otp: values.otp?.trim(),
      });

      navigate('/dashboard');
    } catch (error) {
      showErrorNotification({
        title: 'Login failed',
        error,
      });
    }
  });

  return (
    <Box
      style={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: 'clamp(16px, 4vw, 48px)',
        background:
          'linear-gradient(145deg, #eef5ff 0%, #f8fafc 46%, #e8efff 100%)',
      }}
    >
      {/* Page background decoration */}
      <Box
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: `
            radial-gradient(
              circle at 12% 15%,
              rgba(38, 160, 255, 0.16),
              transparent 30%
            ),
            radial-gradient(
              circle at 88% 82%,
              rgba(15, 42, 92, 0.14),
              transparent 32%
            )
          `,
        }}
      />

      <Box
        aria-hidden
        style={{
          position: 'absolute',
          width: 520,
          height: 520,
          top: -280,
          right: -180,
          border: '1px solid rgba(38, 160, 255, 0.16)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />

      <Box
        aria-hidden
        style={{
          position: 'absolute',
          width: 360,
          height: 360,
          bottom: -220,
          left: -120,
          border: '1px solid rgba(15, 42, 92, 0.12)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />

      <Paper
        radius={28}
        shadow="xl"
        p={0}
        withBorder
        style={{
          position: 'relative',
          width: 'min(1080px, 100%)',
          overflow: 'hidden',
          background: 'rgba(255, 255, 255, 0.97)',
          borderColor: 'rgba(255, 255, 255, 0.9)',
          boxShadow:
            '0 30px 80px rgba(15, 42, 92, 0.16), 0 8px 24px rgba(15, 42, 92, 0.08)',
        }}
      >
        <LoadingOverlay
          visible={isLoggingIn}
          zIndex={10}
          overlayProps={{
            blur: 3,
            backgroundOpacity: 0.7,
          }}
        />

        <Grid gap={0}>
          {/* Login form */}
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Box
              style={{
                minHeight: 650,
                display: 'flex',
                flexDirection: 'column',
                padding: 'clamp(28px, 5vw, 64px)',
              }}
            >
              {/* Mobile branding */}
              <Box hiddenFrom="md" mb={38}>
                <Group justify="space-between" align="center" wrap="nowrap">
                  <Image
                    src={edgeStreamLogo}
                    alt="EdgeStream Hub"
                    w={180}
                    h="auto"
                    fit="contain"
                  />

                  <Image
                    src={hyperiLogo}
                    alt="Hyperi"
                    w={74}
                    h="auto"
                    fit="contain"
                  />
                </Group>
              </Box>

              <Box
                style={{
                  width: '100%',
                  maxWidth: 510,
                  margin: 'auto',
                }}
              >
                <Stack gap={6} mb={6}>
                  <Text
                    size="lg"
                    fw={700}
                    tt="uppercase"
                    style={{
                      color: '#364fc7',
                      letterSpacing: '0.16em',
                    }}
                  >
                    Welcome to Edgestream HUB
                  </Text>
                </Stack>

                <form onSubmit={handleSubmit}>
                  <Stack gap="lg">
                    <TextInput
                      size="md"
                      radius="md"
                      label="Username"
                      placeholder="Enter your username"
                      leftSection={<IconUser size={18} stroke={1.8} />}
                      autoFocus
                      autoComplete="username"
                      required
                      styles={{
                        label: {
                          fontWeight: 600,
                          marginBottom: 8,
                          color: '#20324c',
                        },
                        input: {
                          minHeight: 52,
                          backgroundColor: '#fbfdff',
                          borderColor: '#d7e0ec',
                        },
                      }}
                      {...form.getInputProps('username')}
                    />

                    <PasswordInput
                      size="md"
                      radius="md"
                      label="Password"
                      placeholder="Enter your password"
                      leftSection={<IconLock size={18} stroke={1.8} />}
                      autoComplete="current-password"
                      required
                      styles={{
                        label: {
                          fontWeight: 600,
                          marginBottom: 8,
                          color: '#20324c',
                        },
                        input: {
                          minHeight: 52,
                          backgroundColor: '#fbfdff',
                          borderColor: '#d7e0ec',
                        },
                      }}
                      {...form.getInputProps('password')}
                    />

                    <TextInput
                      size="md"
                      radius="md"
                      label="Authenticator code"
                      placeholder="Enter your code (optional)"
                      leftSection={
                        <IconShieldCheck size={18} stroke={1.8} />
                      }
                      value={form.values.otp}
                      onChange={(event) => {
                        form.setFieldValue(
                          'otp',
                          event.currentTarget.value.replace(/\D/g, ''),
                        );
                      }}
                      error={form.errors.otp}
                      inputMode="numeric"
                      type="tel"
                      autoComplete="one-time-code"
                      styles={{
                        label: {
                          fontWeight: 600,
                          marginBottom: 4,
                          color: '#20324c',
                        },
                        description: {
                          marginBottom: 8,
                        },
                        input: {
                          minHeight: 52,
                          backgroundColor: '#fbfdff',
                          borderColor: '#d7e0ec',
                        },
                      }}
                    />

                    <Group justify="flex-end" mt={-6}>
                      <Anchor
                        component={Link}
                        to="/forgot-password"
                        size="sm"
                        fw={500}
                      >
                        Forgot password?
                      </Anchor>
                    </Group>

                    <Button
                      type="submit"
                      size="md"
                      radius="md"
                      fullWidth
                      loading={isLoggingIn}
                      rightSection={<IconArrowRight size={18} />}
                      variant="gradient"
                      gradient={{
                        from: '#155eef',
                        to: '#25a7f8',
                        deg: 90,
                      }}
                      styles={{
                        root: {
                          minHeight: 52,
                          boxShadow:
                            '0 10px 24px rgba(21, 94, 239, 0.22)',
                        },
                        label: {
                          fontWeight: 700,
                        },
                      }}
                    >
                      Sign in
                    </Button>

                    <Divider
                      label="or"
                      labelPosition="center"
                      my={4}
                    />

                    <Text ta="center" size="sm" c="dimmed">
                      Don&apos;t have an account?{' '}
                      <Anchor
                        component={Link}
                        to="/register"
                        fw={600}
                      >
                        Register here
                      </Anchor>
                    </Text>
                  </Stack>
                </form>
              </Box>
            </Box>
          </Grid.Col>

          {/* Desktop branding panel */}
          <Grid.Col span={{ base: 12, md: 5 }} visibleFrom="md">
            <Box
              style={{
                position: 'relative',
                minHeight: 650,
                height: '100%',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '56px 44px 42px',
                color: 'white',
                background:
                  'linear-gradient(150deg, #071629 0%, #0a2749 55%, #0c3760 100%)',
              }}
            >
              {/* Decorative technical grid */}
              <Box
                aria-hidden
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0.22,
                  pointerEvents: 'none',
                  backgroundImage: `
                    linear-gradient(
                      rgba(55, 177, 255, 0.13) 1px,
                      transparent 1px
                    ),
                    linear-gradient(
                      90deg,
                      rgba(55, 177, 255, 0.13) 1px,
                      transparent 1px
                    )
                  `,
                  backgroundSize: '40px 40px',
                  maskImage:
                    'linear-gradient(to bottom, transparent, black 22%, black 78%, transparent)',
                }}
              />

              <Box
                aria-hidden
                style={{
                  position: 'absolute',
                  width: 430,
                  height: 430,
                  top: -170,
                  right: -210,
                  borderRadius: '50%',
                  background:
                    'radial-gradient(circle, rgba(37, 167, 248, 0.28), transparent 65%)',
                  pointerEvents: 'none',
                }}
              />

              <Box
                aria-hidden
                style={{
                  position: 'absolute',
                  width: 360,
                  height: 360,
                  bottom: -180,
                  left: -190,
                  borderRadius: '50%',
                  border: '1px solid rgba(55, 177, 255, 0.2)',
                  pointerEvents: 'none',
                }}
              />

              <Stack
                align="center"
                gap="lg"
                style={{
                  position: 'relative',
                  zIndex: 1,
                  width: '100%',
                }}
              >
                <Box
                  style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: 340,
                    padding: '38px 30px',
                    borderRadius: 26,
                    display: 'grid',
                    placeItems: 'center',
                    overflow: 'hidden',

                    // Light background gives the navy parts of the logo contrast
                    background:
                      'linear-gradient(145deg, rgba(240, 249, 255, 0.98), rgba(186, 230, 253, 0.94))',

                    border: '1px solid rgba(125, 211, 252, 0.9)',

                    boxShadow: `
      inset 0 1px 0 rgba(255, 255, 255, 0.95),
      inset 0 -1px 0 rgba(14, 116, 144, 0.12),
      0 24px 55px rgba(0, 0, 0, 0.25),
      0 0 45px rgba(56, 189, 248, 0.14)
    `,
                  }}
                >
                  {/* Subtle glow behind the spiral */}
                  <Box
                    aria-hidden
                    style={{
                      position: 'absolute',
                      width: 250,
                      height: 180,
                      borderRadius: '50%',
                      background:
                        'radial-gradient(circle, rgba(45, 212, 191, 0.22), rgba(56, 189, 248, 0.1) 45%, transparent 72%)',
                      filter: 'blur(10px)',
                      pointerEvents: 'none',
                    }}
                  />

                  <Image
                    src={edgeStreamLogo}
                    alt="EdgeStream Hub spiral logo"
                    w="100%"
                    maw={290}
                    h="auto"
                    fit="contain"
                    style={{
                      position: 'relative',
                      zIndex: 1,
                      filter: 'drop-shadow(0 8px 12px rgba(4, 30, 66, 0.18))',
                    }}
                  />
                </Box>

                <Stack align="center" gap={8}>
                  <Title
                    order={2}
                    ta="center"
                    style={{
                      color: '#ffffff',
                      fontSize: 30,
                      letterSpacing: '0.04em',
                    }}
                  >
                    EDGESTREAM HUB
                  </Title>

                  <Text
                    ta="center"
                    size="sm"
                    style={{
                      maxWidth: 330,
                      color: 'rgba(225, 239, 252, 0.76)',
                      lineHeight: 1.7,
                    }}
                  >
                    Secure collection, transformation and delivery of
                    telemetry from the edge.
                  </Text>
                </Stack>
              </Stack>

              {/* Parent brand */}
              <Stack
                align="center"
                gap={7}
                style={{
                  position: 'absolute',
                  zIndex: 1,
                  left: 32,
                  right: 32,
                  bottom: 28,
                }}
              >
                <Text
                  size="xs"
                  tt="uppercase"
                  style={{
                    color: 'rgba(220, 236, 250, 0.55)',
                    letterSpacing: '0.16em',
                  }}
                >
                  A Hyperi platform
                </Text>

                <Image
                  src={hyperiLogo}
                  alt="Hyperi"
                  w={115}
                  h="auto"
                  fit="contain"
                  style={{
                    filter:
                      'drop-shadow(0 8px 18px rgba(0, 0, 0, 0.25))',
                  }}
                />
              </Stack>
            </Box>
          </Grid.Col>
        </Grid>
      </Paper>
    </Box>
  );
};

export default LoginForm;
