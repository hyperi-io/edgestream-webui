import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";

import "normalize.css";
import "./theme/global.css";
import "./theme/tailwind.css";
import "./theme/overrides.css";

import { ThemeProvider } from "styled-components";
import { Auth0Provider } from "@auth0/auth0-react";
import { MantineProvider, createTheme } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";

import App from 'app/index'
import store from "app/store";
import theme from "theme/theme";

import { RuntimeConfigSchema, type RuntimeConfig } from "./config/runtimeConfig";

import "@mantine/core/styles.css";
import "mantine-datatable/styles.layer.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";

const mantineTheme = createTheme({
  primaryColor: "indigo",
  defaultRadius: "md",
  fontFamily:
    'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji"',
});

function absolutizeUrls(config: RuntimeConfig) {
  const { origin, host } = window.location;

  if (config.VITE_APP_REST_API_URL?.startsWith("/")) {
    config.VITE_APP_REST_API_URL = `${origin}${config.VITE_APP_REST_API_URL}`;
  }
  if (config.VITE_APP_WS_API_URL?.startsWith("/")) {
    config.VITE_APP_WS_API_URL = `${origin}${config.VITE_APP_WS_API_URL}`;
  }
  if (config.VITE_APP_GRAPHQL_API_URL?.startsWith("/")) {
    config.VITE_APP_GRAPHQL_API_URL = `${origin}${config.VITE_APP_GRAPHQL_API_URL}`;
  }
  if (config.VITE_APP_GRAPHQL_WS_URL?.startsWith("/")) {
    config.VITE_APP_GRAPHQL_WS_URL = `${
      config.VITE_APP_GRAPHQL_WSS ? "wss" : "ws"
    }://${host}${config.VITE_APP_GRAPHQL_WS_URL}`;
  }
}

function hasRequiredConfig(config: RuntimeConfig): config is Required<
  Pick<
    RuntimeConfig,
    | "VITE_APP_REST_API_URL"
    | "VITE_APP_WS_API_URL"
    | "VITE_APP_GRAPHQL_API_URL"
    | "VITE_APP_GRAPHQL_WS_URL"
  >
> &
  RuntimeConfig {
  return Boolean(
    config.VITE_APP_REST_API_URL &&
      config.VITE_APP_WS_API_URL &&
      config.VITE_APP_GRAPHQL_API_URL &&
      config.VITE_APP_GRAPHQL_WS_URL
  );
}

function isAuth0Enabled(config: RuntimeConfig) {
  return Boolean(
    config.VITE_APP_ENABLE_AUTH0 &&
      config.VITE_APP_AUTH0_DOMAIN &&
      config.VITE_APP_AUTH0_CLIENT_ID &&
      config.VITE_APP_AUTH0_AUDIENCE
  );
}

async function loadRuntimeConfig(): Promise<RuntimeConfig> {
  const defaultPath =
    (import.meta.env.VITE_APP_CONFIG_PATH as string | undefined) ?? "/config.json";

  const url = `${defaultPath}?v=${Date.now()}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Failed to load runtime config (${res.status}) from ${url}`);
  }

  const raw = await res.json();
  return RuntimeConfigSchema.parse(raw);
}

function logMissing(config: RuntimeConfig) {
  // eslint-disable-next-line no-console
  console.log("MISSING CONFIGURATION VARIABLES=");
  // eslint-disable-next-line no-console
  console.log("VITE_APP_REST_API_URL=", config.VITE_APP_REST_API_URL);
  // eslint-disable-next-line no-console
  console.log("VITE_APP_WS_API_URL=", config.VITE_APP_WS_API_URL);
  // eslint-disable-next-line no-console
  console.log("VITE_APP_GRAPHQL_API_URL=", config.VITE_APP_GRAPHQL_API_URL);
  // eslint-disable-next-line no-console
  console.log("VITE_APP_GRAPHQL_WS_URL=", config.VITE_APP_GRAPHQL_WS_URL);
}

function renderApp(config: RuntimeConfig) {
  if (!hasRequiredConfig(config)) {
    logMissing(config);
    return;
  }

  absolutizeUrls(config);

  const container = document.getElementById("root");
  if (!container) throw new Error("Root container #root not found");

  const root = createRoot(container);

  const appTree = (
    <Provider store={store(config.VITE_APP_REST_API_URL!)}>
      <BrowserRouter>
        <MantineProvider theme={mantineTheme} defaultColorScheme="light">
          <ThemeProvider theme={theme}>
            <ModalsProvider>
              <Notifications position="bottom-left" autoClose={5000} />
              <App />
            </ModalsProvider>
          </ThemeProvider>
        </MantineProvider>
      </BrowserRouter>
    </Provider>
  );

  root.render(
    isAuth0Enabled(config) ? (
      <Auth0Provider
        domain={config.VITE_APP_AUTH0_DOMAIN!}
        clientId={config.VITE_APP_AUTH0_CLIENT_ID!}
        authorizationParams={{ redirect_uri: window.location.origin }}
      >
        {appTree}
      </Auth0Provider>
    ) : (
      appTree
    )
  );
}

(async function bootstrap() {
  try {
    const config = await loadRuntimeConfig();
    // eslint-disable-next-line no-console
    console.log("CONFIG:", config);
    renderApp(config);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Failed to bootstrap app:", err);
  }
})();
