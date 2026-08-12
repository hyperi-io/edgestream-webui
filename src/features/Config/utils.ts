function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    // Remove duplicate slashes in pathname (except the first one)
    u.pathname = u.pathname.replace(/\/{2,}/g, '/');
    return u.toString();
  } catch (err) {
    console.error('Invalid Influx URL:', url);
    return '';
  }
}
export function resolveInfluxUrl(rawUrl: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '';

  const hasProtocol = /^https?:\/\//i.test(rawUrl);
  const isPortOnly = /^:\d+$/i.test(rawUrl);
  const isPath = rawUrl.startsWith('/');
  const isProtocolRelative = /^\/\/[^/]/.test(rawUrl);

  const { protocol, hostname, host } = window.location;

  if (hasProtocol) {
    return normalizeUrl(rawUrl);
  }

  if (isProtocolRelative) {
    return normalizeUrl(`${protocol}${rawUrl}`);
  }

  if (isPortOnly) {
    const bracketedHost = hostname.includes(':') ? `[${hostname}]` : hostname;
    return normalizeUrl(`${protocol}//${bracketedHost}${rawUrl}`);
  }

  if (isPath) {
    return normalizeUrl(`${protocol}//${host}${rawUrl}`);
  }

  return normalizeUrl(`${protocol}//${host}/${rawUrl}`);
}
