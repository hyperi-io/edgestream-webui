export type DNSUpsertBody = { current_ip: string; current_port: number; new_ip: string; new_port: number; };
export type DNSDeleteBody = { ip_address: string; port: number };

export type NTPUpsertBody = { current_ip: string; current_port: number; new_ip: string; new_port: number; };
export type NTPDeleteBody = { ip_address: string; port: number };

export type IPMgmtDeleteBody = { ip_type: 'mgmt' | 'event'; };

export type StaticRouteUpsertBody = {
  current_to: string; current_via: string; current_device: string;
  new_to: string; new_via: string; new_device: string;
};

export type StaticHostUpsertBody = {
  current_host: string; new_host: string; new_ip_address: string;
};
