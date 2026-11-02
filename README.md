# EdgeStream Hub – WebUI

[![EdgeStream Hub](https://img.shields.io/badge/Component_of-EdgeStream_Hub-38bdf8?style=flat-square)](https://hyperi-io.github.io/edgestream-hub/)
[![Documentation](https://img.shields.io/badge/Docs-hyperi-io.github.io%2Fedgestream--hub-blue?style=flat-square)](https://hyperi-io.github.io/edgestream-hub/)

> **Notice:** This repository contains an internal subsystem of the **[EdgeStream Hub](https://hyperi-io.github.io/edgestream-hub/)** enterprise telemetry pipeline appliance.
>
> EdgeStream Hub combines high-throughput data collectors, line-rate filtering, and multi-destination fanout into a unified Debian appliance. This service is provisioned, orchestrated, and managed as part of the core appliance stack.
>
> For full deployment options, source/destination setup, and administrative documentation, please refer to the primary site:
>
> 📖 **[https://hyperi-io.github.io/edgestream-hub](https://hyperi-io.github.io/edgestream-hub/)**

---

The **EdgeStream Hub WebUI** is the web-based management interface for **EdgeStream Hub**.
It provides operators with a secure, modern UI for configuring, monitoring, and operating
an EdgeStream deployment running on an appliance or edge node.

---

## ✨ Features

- React + TypeScript single-page application
- Built with **Vite** for fast development and optimized production builds
- Real-time updates via **GraphQL subscriptions (WebSockets)**
- Deep integration with EdgeStream API, Vector, and InfluxDB
- CSP-hardened (no inline scripts required)
- Distributed as a **Debian (.deb) package**

---

## 🧱 Tech Stack

- React (TypeScript)
- Vite
- Mantine UI
- pnpm
- nginx (reverse proxy)
- Debian packaging

---

## 🚀 Running Locally (Development)

### Prerequisites

- Node.js 18+
- pnpm

Install pnpm if required:

```bash
npm install -g pnpm
```

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

The UI will be available at:

```
http://localhost:3000
```

---

## ⚙️ Configuration

Runtime configuration is loaded from JSON files deployed alongside the static assets:

```text
/opt/edgestream-webui/html/
├── config.json
├── config-local.json
├── config-staging.json
```

These files allow environment-specific configuration without rebuilding the UI.

---

## 🏗️ Production Build

```bash
pnpm build
```

Build output:

```text
dist/
├── index.html
├── assets/
│   ├── index-<hash>.js
│   ├── index-<hash>.css
│   └── *.svg
```

---

## 🔐 Authentication

The WebUI supports two authentication modes, selected at runtime.

### Local Authentication
- Username/password handled by EdgeStream API
- JWT stored in localStorage
- Designed for offline or air‑gapped environments

### Auth0 Authentication
- OAuth2 / OIDC via Auth0
- Token validation performed by the API
- Auth mode stored as `authenticator=auth0`

The UI adapts behavior automatically based on the active auth mode.

---

## 📦 Debian Packaging

The WebUI is distributed as a Debian package for EdgeStream appliances.

Typical install layout:

```text
/opt/edgestream-webui/html/
```

High-level packaging flow:

```bash
pnpm build
dpkg-buildpackage -us -uc
```

Resulting artifact:

```text
edgestream-webui_<version>_all.deb
```

---

## 🗂 Repository Structure

```text
src/
├── app/            # App bootstrap, providers, store
├── assets/         # Static images and icons
├── components/     # Shared UI components
├── features/       # Feature-oriented modules
├── pages/          # Route-level pages
├── service/        # API / GraphQL client logic
├── theme/          # Mantine theme configuration
```

---

## 📄 License

EdgeStream WebUI is licensed under the **Functional Source License 1.1,
ALv2 Future License (FSL-1.1-ALv2)**.

See:

- `LICENSE` for full terms  
- `COMMERCIAL.md` for commercial licensing requirements  
