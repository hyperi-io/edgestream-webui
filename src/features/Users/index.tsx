import React, { useMemo, useState, useCallback } from 'react';
import {
  Accordion,
  ActionIcon,
  Box,
  Button,
  Drawer,
  Group,
  LoadingOverlay,
  Stack,
  Switch,
  Table,
  Text,
  TextInput,
  Loader,
  Center,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import {
  IconEdit,
  IconRefresh,
  IconSearch,
  IconShieldCheck,
  IconTrash,
  IconUserPlus,
  IconX,
} from '@tabler/icons-react';
import { IUserItem } from 'global/types';
import QRCode from 'react-qr-code';
import { useEffectOnce, useUpdateEffect } from 'react-use';

import {
  useGetUsers,
  useCreateUser,
  useUpdateUser,
  useUpdateUserPassword,
  useDeleteUser,
  useMfaActions
} from './api';

const QRCodeComponent = (QRCode as any).default || QRCode;

const Users: React.FC = () => {
  const { getUsers, data: allUsers = [], loading: pendingGet } = useGetUsers();
  const { createUser, loading: pendingCreate } = useCreateUser();
  const { updateUser, loading: pendingUpdate } = useUpdateUser();
  const { deleteUser, loading: pendingDelete } = useDeleteUser();
  const { updatePassword, loading: pendingPassword } = useUpdateUserPassword();
  const { generateOtp, validateOtp, loading: pendingOtp } = useMfaActions();

  const [users, setUsers] = useState<IUserItem[]>([]);
  const [search, setSearch] = useState('');
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUserItem | undefined>(undefined);
  const [activeAccordion, setActiveAccordion] = useState<string | null>('details');

  const [enabled, setEnabled] = useState(false);
  const [fullName, setFullName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [otpQRCodeUrl, setOtpQRCodeUrl] = useState<string | undefined>(undefined);
  const [otpSecret, setOtpSecret] = useState('');
  const [otpDigits, setOtpDigits] = useState('');
  const [validOTP, setValidOTP] = useState(false);

  const [newEmail, setNewEmail] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newConfirmPassword, setNewConfirmPassword] = useState('');
  const [newPasswordError, setNewPasswordError] = useState<string | null>(null);
  const [newConfirmPasswordError, setNewConfirmPasswordError] = useState<string | null>(null);
  const [newEnabled, setNewEnabled] = useState(true);

  const isBlocking = pendingGet || pendingCreate || pendingUpdate || pendingDelete || pendingPassword;

  const getPasswordIssues = (pw: string, email: string, full: string, display: string) => {
    const issues: string[] = [];
    if (!pw) return ['Password is required'];
    const lowered = pw.toLowerCase();
    const local = (email.split('@')[0] || '').toLowerCase();
    if (pw.length < 12) issues.push('be at least 12 characters');
    if (!/[A-Z]/.test(pw)) issues.push('include an uppercase letter');
    if (!/[a-z]/.test(pw)) issues.push('include a lowercase letter');
    if (!/[0-9]/.test(pw)) issues.push('include a digit');
    if (!/[^\w\s]/.test(pw)) issues.push('include a symbol');
    if (full && lowered.includes(full.toLowerCase())) issues.push('not contain your full name');
    if (display && lowered.includes(display.toLowerCase())) issues.push('not contain your display name');
    if (local && lowered.includes(local)) issues.push('not contain your email name');
    return issues;
  };

  const handleMfaSetup = useCallback(async (email: string) => {
    try {
      const response = await generateOtp({ email });
      if (response.otp_url) {
        setOtpQRCodeUrl(response.otp_url);
        setOtpSecret(response.otp_secret || '');
      }
    } catch (err) {
      notifications.show({ color: 'red', title: 'MFA Error', message: 'Failed to generate setup QR code.' });
    }
  }, [generateOtp]);

  const handleSaveUserDetails = async () => {
    if (!selectedUser?.email) return;
    try {
      await updateUser({
        email: selectedUser.email,
        is_approved: enabled,
        full_name: fullName,
        display_name: displayName,
      });
      notifications.show({ color: 'green', title: 'Updated', message: 'User details saved.' });
      getUsers();
      setShowEditDrawer(false);
    } catch (e) {}
  };

  const handleUpdatePassword = async () => {
    if (!selectedUser?.email) return;
    if (password !== confirmPassword) {
      notifications.show({ color: 'red', title: 'Error', message: 'Passwords do not match.' });
      return;
    }
    try {
      await updatePassword({
        email: selectedUser.email,
        current_password: oldPassword,
        new_password: password
      });
      notifications.show({ color: 'green', title: 'Success', message: 'Password changed successfully.' });
      setShowEditDrawer(false);
    } catch (e) {}
  };

  const handleVerifyOtp = async () => {
    if (!selectedUser?.email || !otpSecret) return;
    try {
      const res = await validateOtp({
        email: selectedUser.email,
        otp_secret: otpSecret,
        otp_url: otpQRCodeUrl,
        otp_value: otpDigits
      });
      if (res?.otp_valid) {
        setValidOTP(true);
        notifications.show({ color: 'blue', title: 'Verified', message: 'Click Enable MFA to finalize.' });
      } else {
        notifications.show({ color: 'red', title: 'Invalid', message: 'The code provided is incorrect.' });
      }
    } catch (e) {}
  };

  const handleToggleMfa = async (secret: string) => {
    if (!selectedUser?.email) return;
    try {
      await updateUser({ email: selectedUser.email, otp_secret: secret });
      notifications.show({
        color: 'green',
        title: 'MFA Updated',
        message: secret ? 'MFA Enabled' : 'MFA Disabled'
      });
      getUsers();
      setShowEditDrawer(false);
    } catch (e) {}
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUser({
        email: newEmail,
        full_name: newFullName,
        display_name: newDisplayName,
        password: newPassword,
        enabled: newEnabled
      });
      notifications.show({ color: 'green', title: 'Created', message: 'User added successfully.' });
      getUsers();
      setShowCreateDrawer(false);
      resetCreateForm();
    } catch (e) {}
  };

  const resetCreateForm = () => {
    setNewEmail(''); setNewFullName(''); setNewDisplayName(''); setNewPassword('');
    setNewConfirmPassword(''); setNewEnabled(true);
    setNewPasswordError(null); setNewConfirmPasswordError(null);
  };

  const handleOnClose = () => {
    resetCreateForm();
    setShowCreateDrawer(false);
  };

  useEffectOnce(() => { getUsers(); });

  useUpdateEffect(() => {
    const q = search.trim().toLowerCase();
    if (!q) { setUsers(allUsers); return; }
    setUsers(allUsers.filter(u =>
      [u.full_name, u.display_name, u.email].some(val => (val || '').toLowerCase().includes(q))
    ));
  }, [search, allUsers]);

  useUpdateEffect(() => {
    if (!selectedUser) return;
    setEnabled(Boolean(selectedUser.is_approved));
    setFullName(selectedUser.full_name || '');
    setDisplayName(selectedUser.display_name || '');
    setOldPassword(''); setPassword(''); setConfirmPassword('');
    setValidOTP(false); setOtpDigits('');
    if (!selectedUser.otp_secret && selectedUser.email && !otpQRCodeUrl && !pendingOtp) {
      handleMfaSetup(selectedUser.email);
    } else if (selectedUser.otp_secret) {
      setOtpSecret('');
      setOtpQRCodeUrl(undefined);
    }
    setActiveAccordion('details');
  }, [selectedUser?.email, selectedUser?.otp_secret, handleMfaSetup]);

  const mfaEnabled = Boolean(selectedUser?.otp_secret);

  return (
    <Box pos="relative">
      <LoadingOverlay visible={isBlocking} overlayProps={{ blur: 2, radius: 'sm' }} zIndex={1000} />

      <Group justify="space-between" mb="md">
        <Group grow style={{ width: 400 }}>
          <TextInput
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftSection={<IconSearch size={16} />}
            rightSection={search && (
              <ActionIcon variant="subtle" onClick={() => setSearch('')}><IconX size={16}/></ActionIcon>
            )}
          />
          <Button variant="light" leftSection={<IconRefresh size={16}/>} onClick={() => getUsers()}>Refresh</Button>
        </Group>
        <Button leftSection={<IconUserPlus size={16}/>} onClick={() => setShowCreateDrawer(true)}>Create</Button>
      </Group>

      <Table highlightOnHover verticalSpacing="sm">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Email</Table.Th><Table.Th>Full Name</Table.Th><Table.Th>Display Name</Table.Th>
            <Table.Th ta="center">MFA Status</Table.Th><Table.Th ta="right">Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {users.map(u => (
            <Table.Tr key={u.email}>
              <Table.Td>{u.email}</Table.Td>
              <Table.Td>{u.full_name}</Table.Td>
              <Table.Td>{u.display_name}</Table.Td>
              <Table.Td ta="center">
                {u.otp_secret ?
                  <IconShieldCheck size={20} color="green" /> :
                  <Button variant="subtle" size="compact-xs" onClick={() => { setSelectedUser(u); setShowEditDrawer(true); }}>Setup</Button>
                }
              </Table.Td>
              <Table.Td ta="right">
                <Group justify="flex-end" gap="xs">
                  <Button
                    size="xs"
                    variant="light"
                    leftSection={<IconEdit size={14} />}
                    onClick={() => { setSelectedUser(u); setShowEditDrawer(true); }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="xs"
                    variant="light"
                    color="red"
                    leftSection={<IconTrash size={14} />}
                    onClick={() => {
                      modals.openConfirmModal({
                        title: 'Delete user account',
                        children: <Text size="sm">Are you sure you want to delete <b>{u.email}</b>?</Text>,
                        labels: { confirm: 'Delete', cancel: 'Cancel' },
                        confirmProps: { color: 'red', leftSection: <IconTrash size={16} /> },
                        onConfirm: async () => {
                          try {
                            await deleteUser(u.email);
                            notifications.show({ color: 'green', title: 'Deleted', message: 'User deleted successfully.' });
                            getUsers();
                          } catch (e) {}
                        }
                      });
                    }}
                  >
                    Delete
                  </Button>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
          {!users.length && <Table.Tr><Table.Td colSpan={5} ta="center"><Text c="dimmed">No users found</Text></Table.Td></Table.Tr>}
        </Table.Tbody>
      </Table>

      <Drawer opened={showEditDrawer} onClose={() => setShowEditDrawer(false)} title={`Edit: ${selectedUser?.email}`} position="right" size="md">
        {showEditDrawer && (
          <Accordion value={activeAccordion} onChange={setActiveAccordion}>
            <Accordion.Item value="details">
              <Accordion.Control>Details</Accordion.Control>
              <Accordion.Panel>
                <Stack gap="sm">
                  <Switch label="Account Enabled" checked={enabled} onChange={(e) => setEnabled(e.currentTarget.checked)} />
                  <TextInput label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                  <TextInput label="Display Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                  <Button fullWidth onClick={handleSaveUserDetails} loading={pendingUpdate}>Save Details</Button>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item value="password">
              <Accordion.Control>Password</Accordion.Control>
              <Accordion.Panel>
                <Stack gap="sm">
                  <TextInput type="password" label="Current Password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} data-bwignore="true" autoComplete="new-password" />
                  <TextInput type="password" label="New Password" value={password} onChange={(e) => setPassword(e.target.value)} data-bwignore="true" autoComplete="new-password" />
                  <TextInput type="password" label="Confirm New Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} data-bwignore="true" autoComplete="new-password" />
                  <Button fullWidth onClick={handleUpdatePassword} loading={pendingPassword}>Change Password</Button>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item value="mfa">
              <Accordion.Control>Multi-Factor Auth</Accordion.Control>
              <Accordion.Panel>
                {mfaEnabled ? (
                  <Stack align="center" py="xl">
                    <IconShieldCheck size={48} color="green" />
                    <Text size="sm">MFA is active for this user.</Text>
                    <Button color="red" variant="light" onClick={() => handleToggleMfa('')} loading={pendingUpdate}>Disable MFA</Button>
                  </Stack>
                ) : (
                  <Stack align="center" gap="md" pos="relative">
                    {pendingOtp && <Center p="xl"><Loader size="md" /></Center>}
                    {!pendingOtp && otpQRCodeUrl && (
                      <>
                        <QRCodeComponent value={otpQRCodeUrl} size={150} />
                        <TextInput label="Verify 6-digit code" maxLength={6} value={otpDigits} onChange={(e) => setOtpDigits(e.target.value.replace(/\D/g,''))} />
                        <Group grow w="100%">
                          <Button variant="light" onClick={handleVerifyOtp} disabled={otpDigits.length !== 6} loading={pendingOtp}>Verify</Button>
                          <Button onClick={() => handleToggleMfa(otpSecret)} disabled={!validOTP} loading={pendingUpdate}>Enable MFA</Button>
                        </Group>
                      </>
                    )}
                  </Stack>
                )}
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        )}
      </Drawer>

      <Drawer opened={showCreateDrawer} onClose={handleOnClose} title="Create New User" position="right" size="md">
        {showCreateDrawer && (
          <form onSubmit={handleCreate}>
            <Stack gap="sm">
              <TextInput label="Email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} withAsterisk data-testid="email" />
              <TextInput label="Full Name" value={newFullName} onChange={(e) => setNewFullName(e.target.value)} withAsterisk data-testid="full-name" />
              <TextInput label="Display Name" value={newDisplayName} onChange={(e) => setNewDisplayName(e.target.value)} data-testid="display-name" />
              <TextInput type="password" label="Password" value={newPassword}
                         onChange={(e) => {
                           const val = e.target.value; setNewPassword(val);
                           const issues = getPasswordIssues(val, newEmail, newFullName, newDisplayName);
                           setNewPasswordError(issues.length ? `Must ${issues.join(', ')}.` : null);
                           if (newConfirmPassword) setNewConfirmPasswordError(val !== newConfirmPassword ? 'Passwords do not match' : null);
                         }}
                         error={newPasswordError} withAsterisk data-bwignore="true" autoComplete="new-password" data-testid="password"
              />
              <TextInput type="password" label="Confirm Password" value={newConfirmPassword}
                         onChange={(e) => {
                           const val = e.target.value; setNewConfirmPassword(val);
                           setNewConfirmPasswordError(val !== newPassword ? 'Passwords do not match' : null);
                         }}
                         error={newConfirmPasswordError} withAsterisk data-bwignore="true" autoComplete="new-password" data-testid="confirm-password"
              />
              <Switch label="Enabled" checked={newEnabled} onChange={(e) => setNewEnabled(e.currentTarget.checked)} />
              <Group justify="flex-end" mt="xl">
                <Button variant="default" onClick={handleOnClose}>Cancel</Button>
                <Button type="submit" loading={pendingCreate}
                        disabled={!!newPasswordError || !!newConfirmPasswordError || !newEmail || !newFullName || !newPassword || newPassword !== newConfirmPassword}>
                  Create
                </Button>
              </Group>
            </Stack>
          </form>
        )}
      </Drawer>
    </Box>
  );
};

export default Users;
