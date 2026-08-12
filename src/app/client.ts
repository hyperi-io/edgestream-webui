import axios, {
  AxiosInstance,
  AxiosHeaders,
  InternalAxiosRequestConfig,
  AxiosError,
} from 'axios';

type AuthInterceptorOptions = {
  useCookies?: boolean;
  loginPath?: string;
  authPaths?: string[];
};

function asAxiosHeaders(h?: any): AxiosHeaders {
  return h instanceof AxiosHeaders ? h : AxiosHeaders.from(h ?? {});
}

function setAuthHeader(config: InternalAxiosRequestConfig) {
  const token = localStorage.getItem('access_token') ?? localStorage.getItem('token');
  if (token) {
    config.headers = asAxiosHeaders(config.headers);
    (config.headers as AxiosHeaders).set('Authorization', `Bearer ${token}`);
  }
  return config;
}

function attachAuthInterceptors(instance: AxiosInstance, opts: AuthInterceptorOptions = {}) {
  const {
    useCookies = false,
    loginPath = '/login',
  } = opts;

  if (useCookies) {
    instance.defaults.withCredentials = true;
  }

  instance.interceptors.request.use((config) => {
    if (!useCookies) {
      config = setAuthHeader(config);
    }
    return config;
  });

  instance.interceptors.response.use(
    (r) => r,
    (error: AxiosError<any>) => {
      const status = error?.response?.status;
      if (status === 401 || status === 419) {
        try {
          const cfg = error.config as InternalAxiosRequestConfig | undefined;
          const base = cfg?.baseURL ?? instance.defaults.baseURL ?? '';
          const url = cfg?.url ?? '';
          const reqPathname = new URL(url, base).pathname;

          const isAuthRoute = /\/auth\/(login|signup|refresh)(\/)?$/.test(reqPathname);
          const alreadyOnLogin = window.location.pathname === loginPath;

          localStorage.removeItem('access_token');
          localStorage.removeItem('token');
          localStorage.removeItem('user');

          if (!isAuthRoute && !alreadyOnLogin) {
            window.location.replace(loginPath);
          }
        } catch {
          localStorage.removeItem('access_token');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          if (window.location.pathname !== '/login') {
            window.location.replace('/login');
          }
        }
      }
      return Promise.reject(error);
    },
  );
}

export function createAuthClient(baseURL: string, options?: AuthInterceptorOptions): AxiosInstance {
  const api = axios.create({
    baseURL,
    timeout: 120000,
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
  });
  attachAuthInterceptors(api, options);
  return api;
}

export function createAuthClientUpload(baseURL: string, options?: AuthInterceptorOptions): AxiosInstance {
  const api = axios.create({
    baseURL,
    timeout: 120000,
    headers: { Accept: 'application/json', 'Content-Type': 'multipart/form-data' },
  });
  attachAuthInterceptors(api, options);
  return api;
}

export function createAuthClientDownload(baseURL: string, options?: AuthInterceptorOptions): AxiosInstance {
  const api = axios.create({
    baseURL,
    timeout: 120000,
    responseType: 'blob',
    headers: { Accept: 'application/json', 'Content-Type': 'application/octet-stream' },
  });
  attachAuthInterceptors(api, options);
  return api;
}

export function createPublicClient(baseURL: string): AxiosInstance {
  return axios.create({
    baseURL,
    timeout: 120000,
    headers: { Accept: 'application/json' },
  });
}
