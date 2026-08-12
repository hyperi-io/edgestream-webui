# EdgeStream Hub WebUI – Architecture

## Overview

The WebUI is a **static single-page application (SPA)** running entirely in the browser.
It communicates with local EdgeStream services via a secure reverse proxy.

```
Browser
  |
  | HTTPS
  v
nginx (Gateway)
  |---- /api ------> EdgeStream API (FastAPI)
  |---- /graphql --> GraphQL WebSocket service
  |---- /influx ---> InfluxDB UI (proxied)
```

---

## Core Principles

- Static build, no server-side rendering
- Reverse-proxy enforced security
- Offline-first appliance deployment
- Minimal runtime dependencies

---

## Data Flow

### Queries & Mutations
- HTTPS requests to `/api`
- Apollo Client manages caching and state

### Subscriptions
- WebSocket connections to `/graphql`
- Used for live metrics and event flow updates

---

## Authentication

### Local
- Credentials validated by API
- JWT stored client-side
- No external dependencies

### Auth0
- OAuth2 / OIDC redirect flow
- Token validated by API
- UI adapts based on auth mode

---

## Security Model

- Strict Content-Security-Policy
- Explicit WebSocket upgrades
- Same-origin API enforcement
- TLS terminated at gateway

---

## Deployment

- Installed via Debian package
- Static assets served from `/opt/edgestream-webui/html`
- nginx handles routing, headers, and TLS
