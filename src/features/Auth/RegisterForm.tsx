import React, { useMemo } from 'react';
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
  Progress,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  IconArrowRight,
  IconAt,
  IconId,
  IconLock,
  IconShieldCheck,
  IconUser,
} from '@tabler/icons-react';
import { Link, useNavigate } from 'react-router-dom';

import edgeStreamLogo from 'assets/edgestream-hub-logo.png?url';
import hyperiLogo from 'assets/hyperi-stacked_square_white.svg?url';

import { useAuth } from './api';

function calcStrength(password: string) {
  const checks = [
    password.length >= 12,
    /[a-z]/.test(password) && /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];

  const level = checks.reduce(
    (sum, checkPassed) => sum + (checkPassed ? 1 : 0),
    0,
  );

  const labels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['red', 'red', 'yellow', 'green', 'teal'];

  return {
    level,
    label: labels[level],
    color: colors[level],
  };
}

const fieldStyles = {
  label: {
    color: '#20324c',
    fontWeight: 600,
    marginBottom: 6,
  },

  input: {
    minHeight: 48,
    backgroundColor: '#fbfdff',
    borderColor: '#d7e0ec',
  },
};

const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const { signup, isSigningUp } = useAuth();

  const form = useForm({
    initialValues: {
      full_name: '',
      display_name: '',
      email: '',
      password: '',
      confirm_password: '',
    },

    validate: {
      full_name: (value) =>
        value.trim().length < 2 ? 'Full name is required' : null,

      email: (value) =>
        /^\S+@\S+\.\S+$/.test(value.trim())
          ? null
          : 'Enter a valid email address',

      password: (value) =>
        value.length < 12
          ? 'Password must be at least 12 characters'
          : null,

      confirm_password: (value, values) =>
        value === values.password ? null : 'Passwords do not match',
    },
  });

  const strength = useMemo(
    () => calcStrength(form.values.password),
    [form.values.password],
  );

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      await signup({
        email: values.email.trim(),
        full_name: values.full_name.trim(),
        display_name: values.display_name.trim() || undefined,
        password: values.password,
        enabled: false,
      });

      notifications.show({
        title: 'Registration successful',
        message:
          'Your account has been created and is awaiting administrator approval.',
        color: 'green',
      });

      navigate('/login');
    } catch {
      // Registration errors are handled by the API notification middleware.
    }
  });

  return (
    <Box
      style={{
        minHeight: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        position: 'relative',
        boxSizing: 'border-box',
        overflow: 'hidden',
        padding: 'clamp(16px, 3vw, 48px)',

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
          marginBlock: 'auto',
          position: 'relative',
          zIndex: 1,
          flexShrink: 0,
          width: 'min(1080px, 100%)',
          overflow: 'hidden',
          background: 'rgba(255, 255, 255, 0.97)',
          borderColor: 'rgba(255, 255, 255, 0.9)',
          boxShadow:
            '0 30px 80px rgba(15, 42, 92, 0.16), 0 8px 24px rgba(15, 42, 92, 0.08)',
        }}
      >
        <LoadingOverlay
          visible={isSigningUp}
          zIndex={10}
          overlayProps={{
            blur: 3,
            backgroundOpacity: 0.7,
          }}
        />

        <Grid
          gap={0}
          style={{
            alignItems: 'stretch',
          }}
        >
          {/* Registration form */}
          <Grid.Col
            span={{ base: 12, md: 7 }}
            style={{
              display: 'flex',
            }}
          >
            <Box
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                boxSizing: 'border-box',
                padding: 'clamp(28px, 4vw, 52px)',
              }}
            >
              {/* Mobile branding */}
              <Box hiddenFrom="md" mb={28}>
                <Group
                  justify="space-between"
                  align="center"
                  wrap="nowrap"
                >
                  <Image
                    src={edgeStreamLogo}
                    alt="EdgeStream Hub"
                    w={180}
                    h="auto"
                    fit="contain"
                  />

                  {/* The Hyperi asset is white, so it needs a dark badge. */}
                  <Box
                    p={8}
                    style={{
                      flexShrink: 0,
                      borderRadius: 10,
                      background:
                        'linear-gradient(145deg, #071629, #0c3760)',
                      boxShadow: '0 8px 20px rgba(7, 22, 41, 0.16)',
                    }}
                  >
                    <Image
                      src={hyperiLogo}
                      alt="Hyperi"
                      w={68}
                      h="auto"
                      fit="contain"
                    />
                  </Box>
                </Group>
              </Box>

              <Box
                style={{
                  width: '100%',
                  maxWidth: 510,
                  marginInline: 'auto',
                }}
              >
                <Stack gap={5} mb={22}>
                  <Text
                    size="lg"
                    fw={700}
                    tt="uppercase"
                    style={{
                      color: '#364fc7',
                      letterSpacing: '0.14em',
                    }}
                  >
                    Create your EdgeStream HUB account
                  </Text>

                  <Text
                    size="sm"
                    c="dimmed"
                    style={{
                      maxWidth: 440,
                      lineHeight: 1.55,
                    }}
                  >
                    Your email address will be used as your username.
                  </Text>
                </Stack>

                <form onSubmit={handleSubmit}>
                  <Stack gap="md">
                    <TextInput
                      size="md"
                      radius="md"
                      label="Full name"
                      placeholder="Enter your full name"
                      leftSection={<IconId size={18} stroke={1.8} />}
                      autoFocus
                      autoComplete="name"
                      required
                      styles={fieldStyles}
                      {...form.getInputProps('full_name')}
                    />

                    <TextInput
                      size="md"
                      radius="md"
                      label="Display name"
                      description="Optional name shown within the console."
                      placeholder="Nickname or preferred name"
                      leftSection={<IconUser size={18} stroke={1.8} />}
                      autoComplete="nickname"
                      styles={{
                        ...fieldStyles,

                        description: {
                          marginBottom: 6,
                        },
                      }}
                      {...form.getInputProps('display_name')}
                    />

                    <TextInput
                      size="md"
                      radius="md"
                      label="Email address"
                      placeholder="name@example.com"
                      leftSection={<IconAt size={18} stroke={1.8} />}
                      autoComplete="email"
                      inputMode="email"
                      type="email"
                      required
                      styles={fieldStyles}
                      {...form.getInputProps('email')}
                    />

                    <Stack gap={6}>
                      <PasswordInput
                        size="md"
                        radius="md"
                        label="Password"
                        placeholder="At least 12 characters"
                        leftSection={<IconLock size={18} stroke={1.8} />}
                        autoComplete="new-password"
                        required
                        styles={fieldStyles}
                        {...form.getInputProps('password')}
                      />

                      <Progress
                        value={(strength.level / 4) * 100}
                        color={strength.color}
                        size="sm"
                        radius="xl"
                        mt={2}
                      />

                      <Group
                        justify="space-between"
                        align="flex-start"
                        gap="xs"
                        wrap="wrap"
                      >
                        <Text size="xs" c="dimmed">
                          Use uppercase, lowercase, numbers and symbols.
                        </Text>

                        <Text
                          size="xs"
                          fw={700}
                          c={`${strength.color}.7`}
                        >
                          {strength.label}
                        </Text>
                      </Group>
                    </Stack>

                    <PasswordInput
                      size="md"
                      radius="md"
                      label="Confirm password"
                      placeholder="Re-enter your password"
                      leftSection={<IconLock size={18} stroke={1.8} />}
                      autoComplete="new-password"
                      required
                      styles={fieldStyles}
                      {...form.getInputProps('confirm_password')}
                    />

                    <Box
                      p="sm"
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10,
                        borderRadius: 12,
                        border: '1px solid rgba(21, 94, 239, 0.16)',
                        background: 'rgba(239, 246, 255, 0.8)',
                      }}
                    >
                      <IconShieldCheck
                        size={19}
                        stroke={1.8}
                        color="#155eef"
                        style={{
                          flexShrink: 0,
                          marginTop: 1,
                        }}
                      />

                      <Text
                        size="xs"
                        style={{
                          color: '#43536b',
                          lineHeight: 1.55,
                        }}
                      >
                        New accounts require administrator approval before
                        console access is enabled.
                      </Text>
                    </Box>

                    <Button
                      type="submit"
                      size="md"
                      radius="md"
                      fullWidth
                      loading={isSigningUp}
                      rightSection={<IconArrowRight size={18} />}
                      variant="gradient"
                      gradient={{
                        from: '#155eef',
                        to: '#25a7f8',
                        deg: 90,
                      }}
                      styles={{
                        root: {
                          minHeight: 50,
                          boxShadow:
                            '0 10px 24px rgba(21, 94, 239, 0.22)',
                        },

                        label: {
                          fontWeight: 700,
                        },
                      }}
                    >
                      Register account
                    </Button>

                    <Divider
                      label="Already registered?"
                      labelPosition="center"
                      my={2}
                    />

                    <Text ta="center" size="sm" c="dimmed">
                      Already have an account?{' '}
                      <Anchor
                        component={Link}
                        to="/login"
                        fw={600}
                      >
                        Sign in here
                      </Anchor>
                    </Text>
                  </Stack>
                </form>
              </Box>
            </Box>
          </Grid.Col>

          {/* Desktop branding panel */}
          <Grid.Col
            span={{ base: 12, md: 5 }}
            visibleFrom="md"
            style={{
              display: 'flex',
            }}
          >
            <Box
              style={{
                position: 'relative',
                flex: 1,
                minWidth: 0,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box',
                padding: '48px 40px 28px',
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

              {/* Main product branding */}
              <Stack
                align="center"
                justify="center"
                gap="lg"
                style={{
                  position: 'relative',
                  zIndex: 1,
                  flex: 1,
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
                      filter:
                        'drop-shadow(0 8px 12px rgba(4, 30, 66, 0.18))',
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

              <Stack
                align="center"
                gap={7}
                mt="xl"
                style={{
                  position: 'relative',
                  zIndex: 1,
                  flexShrink: 0,
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

export default RegisterForm;
