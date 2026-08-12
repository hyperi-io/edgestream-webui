import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Drawer,
  FileInput,
  Group,
  NumberInput,
  Radio,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
  PasswordInput,
  Textarea,
  Divider,
} from '@mantine/core';
import { IconDeviceFloppy, IconPlus, IconUpload, IconLock } from '@tabler/icons-react';
import { useNotification } from 'common/useNotifications';
import type { IVPN, VPNType } from './types';

type MTUMode = 'auto' | 'custom';
type MSSMode = 'auto' | 'custom' | 'off';

type AdvancedPayload = {
  mtu_mode: MTUMode;
  mtu_value?: number | null;
  mss_mode: MSSMode;
  mss_value?: number | null;
};

type RouteObj = { dst: string; proto?: 'tcp' | 'udp' | 'any'; ports?: string | null; comment?: string | null };

type Props = {
  opened: boolean;
  onClose: () => void;
  initial?: IVPN | null;
  busy?: boolean;

  onCreate: (payload: Record<string, any>) => Promise<any>;
  onUpdate: (payload: Record<string, any>) => Promise<any>;
};

const DEFAULT_MTU = 1420;
const DEFAULT_MSS = 1380;

const VPN_NAME_RE = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]$/;

const validateName = (raw: string) => {
  const v = raw.trim();
  if (!v) return { ok: false, value: v, error: 'Name is required.' };

  if (v.length < 3 || v.length > 63) {
    return { ok: false, value: v, error: 'Name must be 3–63 characters.' };
  }

  if (!VPN_NAME_RE.test(v)) {
    return {
      ok: false,
      value: v,
      error: "Invalid name. Alphanumeric and hyphens only (e.g. 'office-vpn').",
    };
  }

  return { ok: true, value: v, error: '' };
};

const parseRoutesText = (raw: string): string[] => {
  return raw
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((s) => !s.startsWith('#'));
};

const routesToText = (routes?: Array<string | RouteObj>): string => {
  if (!routes || routes.length === 0) return '';

  const lines = routes
    .map((r) => (typeof r === 'string' ? r : r?.dst))
    .map((s) => (typeof s === 'string' ? s.trim() : ''))
    .filter(Boolean);

  return lines.join('\n');
};

const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

const VPNDrawer: React.FC<Props> = ({ opened, onClose, initial, busy, onCreate, onUpdate }) => {
  const isEdit = Boolean((initial as any)?.id);

  const { showJobNotification, showErrorNotification, showSuccessNotification } = useNotification();

  const [name, setName] = useState('');
  const [type, setType] = useState<VPNType>('openvpn');
  const [autoconnect, setAutoconnect] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  // OpenVPN Auth State
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');

  const [killSwitch, setKillSwitch] = useState(false);
  const [routesText, setRoutesText] = useState('');

  const [mtuMode, setMtuMode] = useState<MTUMode>('auto');
  const [mtuValue, setMtuValue] = useState<number | ''>(DEFAULT_MTU);

  const [mssMode, setMssMode] = useState<MSSMode>('auto');
  const [mssValue, setMssValue] = useState<number | ''>(DEFAULT_MSS);

  const [nameTouched, setNameTouched] = useState(false);

  useEffect(() => {
    if (!opened) return;

    setName(initial?.name ?? '');
    setNameTouched(false);

    const vtype = ((initial as any)?.type as VPNType) ?? ((initial as any)?.vpn_type as VPNType) ?? 'openvpn';
    setType(vtype);
    setAutoconnect(Boolean((initial as any)?.autoconnect));
    setFile(null);

    setAuthUsername(initial?.auth_username ?? '');
    setAuthPassword(''); // Password is never sent back from the API for security

    setKillSwitch(Boolean((initial as any)?.kill_switch));
    setRoutesText(routesToText((initial as any)?.routes));

    const adv: any = (initial as any)?.advanced ?? {};

    if (!isEdit) {
      setMtuMode('auto');
      setMtuValue(DEFAULT_MTU);
      setMssMode('auto');
      setMssValue(DEFAULT_MSS);
      return;
    }

    const initMtuMode: MTUMode = adv?.mtu_mode === 'auto' ? 'auto' : 'custom';
    const initMssMode: MSSMode =
      adv?.mss_mode === 'auto' ? 'auto' : adv?.mss_mode === 'off' ? 'off' : 'custom';

    setMtuMode(initMtuMode);
    setMtuValue(
      initMtuMode === 'custom'
        ? Number.isFinite(Number(adv?.mtu_value))
          ? Number(adv?.mtu_value)
          : DEFAULT_MTU
        : DEFAULT_MTU,
    );

    setMssMode(initMssMode);
    setMssValue(
      initMssMode === 'custom'
        ? Number.isFinite(Number(adv?.mss_value))
          ? Number(adv?.mss_value)
          : DEFAULT_MSS
        : DEFAULT_MSS,
    );
  }, [opened, initial, isEdit]);

  const accept = useMemo(() => (type === 'openvpn' ? '.ovpn,.conf' : '.conf'), [type]);

  const advancedPayload: AdvancedPayload = useMemo(
    () => ({
      mtu_mode: mtuMode,
      mtu_value: mtuMode === 'custom' ? (mtuValue === '' ? null : Number(mtuValue)) : null,
      mss_mode: mssMode,
      mss_value: mssMode === 'custom' ? (mssValue === '' ? null : Number(mssValue)) : null,
    }),
    [mtuMode, mtuValue, mssMode, mssValue],
  );

  const nameValidation = useMemo(() => validateName(name), [name]);
  const trimmedName = nameValidation.value;

  const routesList = useMemo(() => parseRoutesText(routesText), [routesText]);

  const canCreate = nameValidation.ok && Boolean(file);
  const canSave = nameValidation.ok;

  const buildPayload = async () => {
    let fileContent: string | null = null;
    if (file) {
      fileContent = await readFileAsText(file);
    }

    return {
      ...(isEdit && (initial as any)?.id != null ? { id: (initial as any).id } : { name: trimmedName }),
      vpn_type: type,
      autoconnect,
      kill_switch: killSwitch,
      ...(type === 'openvpn'
        ? {
          auth_username: authUsername.trim() || null,
          ...(authPassword ? { auth_password: authPassword } : {}),
        }
        : { auth_username: null, auth_password: null }),
      ...(file && fileContent ? { filename: file.name, file_content: fileContent } : {}),
      routes: routesList.map((dst) => ({
        dst,
        proto: 'any',
        ports: null,
        comment: null,
      })),
      advanced: advancedPayload,
    };
  };

  const handleCreate = async () => {
    setNameTouched(true);
    if (!nameValidation.ok || !file) return;

    try {
      const payload = await buildPayload();
      const res = await onCreate(payload);

      if (res?.job || res?.task_id) {
        showJobNotification({ job: res.job || res });
      } else {
        showSuccessNotification({
          title: 'VPN Profile Created',
          description: `VPN profile "${trimmedName}" was successfully created.`,
        });
      }

      onClose();
    } catch (err) {
      showErrorNotification({
        title: 'Creation Failed',
        description: 'Failed to create VPN profile.',
        error: err,
      });
    }
  };

  const handleSave = async () => {
    setNameTouched(true);
    if (!nameValidation.ok) return;

    try {
      const payload = await buildPayload();
      const res = await onUpdate(payload);

      if (res?.job || res?.task_id) {
        showJobNotification({ job: res.job || res });
      } else {
        showSuccessNotification({
          title: 'VPN Profile Saved',
          description: `VPN profile "${trimmedName}" was successfully updated.`,
        });
      }

      onClose();
    } catch (err) {
      showErrorNotification({
        title: 'Update Failed',
        description: 'Failed to save VPN profile updates.',
        error: err,
      });
    }
  };

  return (
    <Drawer opened={opened} onClose={onClose} title={isEdit ? 'Edit VPN' : 'Create VPN'} position="right" size="md">
      <Stack gap="md">
        <TextInput
          label="Name"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          onBlur={() => setNameTouched(true)}
          placeholder="e.g. office-vpn"
          withAsterisk
          disabled={isEdit}
          error={!isEdit && nameTouched && !nameValidation.ok ? nameValidation.error : undefined}
          description="3–63 chars. Alphanumeric and hyphens only."
        />

        <Select
          label="Type"
          value={type}
          onChange={(v) => setType((v as VPNType) || 'openvpn')}
          data={[
            { value: 'openvpn', label: 'OpenVPN' },
            { value: 'wireguard', label: 'WireGuard' },
          ]}
          withAsterisk
        />

        {/* Conditional OpenVPN Credentials Section */}
        {type === 'openvpn' && (
          <Stack gap="xs">
            <Text size="sm" fw={600}>
              Authentication (Optional)
            </Text>
            <TextInput
              label="Username"
              placeholder="VPN Username"
              value={authUsername}
              onChange={(e) => setAuthUsername(e.currentTarget.value)}
            />
            <PasswordInput
              label="Password"
              placeholder={isEdit ? 'Leave blank to keep unchanged' : 'VPN Password'}
              leftSection={<IconLock size={16} />}
              value={authPassword}
              onChange={(e) => setAuthPassword(e.currentTarget.value)}
            />
          </Stack>
        )}

        <Switch label="Start on boot" checked={autoconnect} onChange={(e) => setAutoconnect(e.currentTarget.checked)} />

        <FileInput
          label={isEdit ? 'Config file (optional)' : 'Config file'}
          placeholder={type === 'openvpn' ? 'Upload .ovpn/.conf' : 'Upload wg .conf'}
          leftSection={<IconUpload size={16} />}
          accept={accept}
          value={file}
          onChange={setFile}
          clearable
          withAsterisk={!isEdit}
        />

        <Divider />

        <Stack gap="xs">
          <Text fw={600}>Routing</Text>

          <Switch
            label="Kill switch"
            description="When enabled, block traffic to configured destinations unless this VPN is up."
            checked={killSwitch}
            onChange={(e) => setKillSwitch(e.currentTarget.checked)}
          />

          <Textarea
            label="Route these destinations via this VPN"
            description={
              <>
                One per line. Use CIDRs (e.g. <code>1.2.3.4/32</code>, <code>10.0.0.0/8</code>) or IP addresses.
                Lines starting with <code>#</code> are ignored.
              </>
            }
            value={routesText}
            onChange={(e) => setRoutesText(e.currentTarget.value)}
            minRows={6}
            autosize
            placeholder={`# Examples\n1.2.3.4/32\n10.10.0.0/16`}
          />
        </Stack>

        <Divider />

        <Stack gap="xs" mt="sm">
          <Text fw={600}>Advanced</Text>

          <Stack gap={6}>
            <Text size="sm" fw={500}>
              Maximum Transmission Unit (MTU)
            </Text>
            <Radio.Group value={mtuMode} onChange={(v) => setMtuMode((v as MTUMode) || 'auto')}>
              <Group gap="lg">
                <Radio value="auto" label="Auto" />
                <Radio value="custom" label="Custom" />
              </Group>
            </Radio.Group>

            <NumberInput
              label="MTU value (bytes)"
              value={mtuValue}
              onChange={(v) => setMtuValue(v === '' ? '' : Number(v))}
              min={576}
              max={9000}
              step={1}
              clampBehavior="strict"
              disabled={mtuMode !== 'custom'}
            />
          </Stack>

          <Stack gap={6} mt="xs">
            <Text size="sm" fw={500}>
              Maximum Segment Size (MSS)
            </Text>
            <Radio.Group value={mssMode} onChange={(v) => setMssMode((v as MSSMode) || 'auto')}>
              <Group gap="lg">
                <Radio value="auto" label="Auto" />
                <Radio value="custom" label="Custom" />
                <Radio value="off" label="Off" />
              </Group>
            </Radio.Group>

            <NumberInput
              label="MSS value (bytes)"
              value={mssValue}
              onChange={(v) => setMssValue(v === '' ? '' : Number(v))}
              min={536}
              max={8960}
              step={1}
              clampBehavior="strict"
              disabled={mssMode !== 'custom'}
            />
          </Stack>
        </Stack>

        <Group justify="space-between" mt="sm">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>

          {!isEdit ? (
            <Button leftSection={<IconPlus size={16} />} loading={busy} disabled={!canCreate} onClick={handleCreate}>
              Create
            </Button>
          ) : (
            <Button
              leftSection={<IconDeviceFloppy size={16} />}
              loading={busy}
              disabled={!canSave}
              onClick={handleSave}
            >
              Save
            </Button>
          )}
        </Group>
      </Stack>
    </Drawer>
  );
};

export default VPNDrawer;
