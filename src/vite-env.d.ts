interface ImportMetaEnv {
    readonly VITE_APP_AUTH0_AUDIENCE?: string;
    readonly VITE_APP_CONFIG_PATH?: string;
    // readonly VITE_APP_AUTH0_DOMAIN?: string;
    // readonly VITE_APP_AUTH0_CLIENT_ID?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
