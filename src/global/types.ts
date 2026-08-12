import { AxiosError } from 'axios';

export function isAxiosError(err: any): err is AxiosError {
  return err.isAxiosError;
}

export interface IPaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  skip: number;
}

export interface IDataTableFilter {
  search?: string;
  page?: number;
  limit?: number;
  [index: string]: any;
}

export interface ISyslog {
  id: number;
  name: string;
  port: number;
  label: string;
  protocols: {
    protocol: string;
  }[];
}

export interface IEventMonitor {
  id: number;
  port: number;
  label: string;
  protocols: {
    protocol: string;
  }[];
}

export interface IFile {
  common_name: string;
  not_after: boolean;
  id: number | string;
  type: string;
  filename: string;
  filesize?: number | string;
}

export interface IUserItem {
  id: number;
  email: string;
  full_name: string;
  display_name?: string;
  is_superuser: boolean;
  is_approved: boolean;
  otp_secret?: string;
  created_at: string;
  updated_at: string;
}

export interface ISystemUser {
  username: string;
  active: boolean;
  duration: string;
  host: string;
  logged_in: string;
  terminal: string;
}

export interface ISystemInterface {
  device: string;
  ip_address: string;
  netmask: string;
}
export interface IAdvanceSetting {
  id: number;
  label: string;
  value: any;
  description: string;
  default_value: any;
}
export interface ISystem {
  users: ISystemUser[];
  interfaces: ISystemInterface[];
  partitions: {
    mount_point: string;
    disk_usage_percentage: number;
  }[];
  ip_addresses: string[];
  uptime: {
    secs: number;
    human_readable: string;
  };
  hostname: string;
}

export interface IFormField {
  type: string;
  label: string;
  hint: string;
  mandatory: boolean;
  default: any;
  cast: string;
}

export interface IService {
  id?: number;
  module: string;
  modules: {
    sink: {
      [key: string]: any;
    };
    source: any[];
  };
  name: string;
  enabled: boolean;
  is_default: boolean;
  address: string;
  filter?: string;
  filter_enabled: boolean;
  type: string;
  port: number;
  tls: {
    enabled: boolean;
    verify_hostname: boolean;
    verify_certificate: boolean;
    passphrase: string;
  };
  events: {
    syslog_ports: any[];
    static_events: any[];
  };
  certificates: {
    id: number;
    filename: string;
    type: string;
    filesize: number;
    data: string;
    created: string;
    modified: string;
  }[];
}

export interface IServiceItem {
  module: string;
  modules: {
    sink: {
      [key: string]: any;
    };
    source: any[];
  };
  name: string;
  enabled: boolean;
  is_default: boolean;
  address: string;
  type: string;
  port: number;
}

export interface IDataset {
  label: string;
  data: any[];
  fill: boolean;
  fillOpacity: number;
  borderColor: string;
  borderWidth: number;
}

export interface IVPNSettings {
  id: number;
  filename: string;
  created?: string;
  modified?: string;
  filesize?: 0;
  autoconnect: boolean;
  console: {
    forward: boolean;
    remote_address: string;
    remote_port: number;
    listen_address: string;
    listen_port: number;
  };
}
