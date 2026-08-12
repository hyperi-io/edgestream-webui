export type VPNType = 'openvpn' | 'wireguard';

export type MTUMode = 'auto' | 'custom';
export type MSSMode = 'auto' | 'custom' | 'off';

export interface IVPNAdvanced {
  mtu_mode?: MTUMode;
  mtu_value?: number | null;
  mss_mode?: MSSMode;
  mss_value?: number | null;
}

export type VPNRouteProto = 'tcp' | 'udp' | 'any';

export interface IVPNRoute {
  dst: string;                 // CIDR/IP
  proto?: VPNRouteProto;       // default "any"
  ports?: string | null;       // "443", "80,443", "1000-2000"
  comment?: string | null;
}

export type VPNRoutes = Array<IVPNRoute | string>;

export interface IVPN {
  id: string;
  name: string;

  vpn_type: VPNType;

  autoconnect: boolean;
  filename?: string;
  filesize?: number;

  kill_switch?: boolean;

  routes?: VPNRoutes;

  advanced?: IVPNAdvanced;

  auth_username?: string | null;
  auth_password?: string | null;

  created?: string;
  modified?: string;
}

export type VPNStatusState = 'active' | 'inactive' | 'failed' | 'unknown' | 'connecting' | 'pending';

export interface IVPNStatus {
  state: VPNStatusState;
  enabled: boolean;

  uptime_seconds?: number;
  rx_bytes?: number;
  tx_bytes?: number;

  tunnel_address?: string | null;
  endpoint_address?: string | null;

  last_error?: string | null;
}

export type VPNStatusMap = Record<string, IVPNStatus>;
