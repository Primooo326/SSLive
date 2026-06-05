# 🛡️ SSLive

A modern, fast, and real-time SSL/TLS certificate monitor. Built with **TypeScript**, **Bun**, and **MongoDB**, it allows you to check the validity of certificates for various domains, either quickly via the command line or through a persistent service with an **Interactive Web Dashboard**.

---

## ✨ Key Features

*   🚀 **Powered by Bun**: Ultra-fast execution using TypeScript natively.
*   🌓 **Dual Operation Modes**:
    *   **Standalone CLI**: Instant, one-off checks from the terminal, with output in a colorized table or JSON format. Ideal for script integrations (CI/CD).
    *   **Service Mode (Persistent)**: Uses a MongoDB database to maintain history, perform periodic background checks, and expose a REST API.
*   🌐 **Modern Web Dashboard**: User interface with dark mode, *glassmorphism* design, status indicators, and a fully responsive layout.
*   ⚡ **Real-Time WebSockets**: The dashboard and connected clients update instantly without page reloads whenever a certificate is verified, added, or removed.
*   🐳 **Docker & Docker Compose**: Ready to deploy to production with a single command.
*   🔄 **Nginx Backward Compatibility**: Ability to automatically parse local configurations using `nginx -T` to discover domains.

---

## 🚦 Certificate Statuses

The system classifies certificates into different statuses based on the remaining days until expiration:

| Status | CLI Exit Code | Description |
| :--- | :---: | :--- |
| 🟢 **OK (Valid)** | `0` | The certificate has sufficient remaining validity. |
| 🟡 **WARNING** | `1` | The certificate will expire soon (default $\le$ 30 days). |
| 🔴 **CRITICAL** | `2` | Expiration is imminent (default $\le$ 7 days). |
| 🟣 **EXPIRED** | `3` | The certificate has already expired. |
| ⚪ **ERROR** | `-` | Connection issues or invalid domain. |

---

## ⚙️ Prerequisites

*   [Bun](https://bun.sh/) (For local execution)
*   [Docker](https://www.docker.com/) and Docker Compose (For containerized deployment)

---

## 🚀 Installation and Usage Guide

### 1. Environment Setup
Clone the repository and create your environment variables file based on the example:
```bash
cp .env.example .env
```

**Available variables in `.env`:**
*   `PORT`: Web server and WebSocket port (default `3000`).
*   `MONGODB_URI`: Connection URI. If not provided, the app runs exclusively in CLI mode.
*   `CHECK_INTERVAL_MS`: Automatic check interval in milliseconds (default 1 hour).
*   `WARN_DAYS`: Days threshold for Warning status (default `30`).
*   `CRIT_DAYS`: Days threshold for Critical status (default `7`).

---

### 2. Service Mode (Recommended)
Spin up the database and the application using Docker. This mode exposes the **Web Dashboard** and the **REST API**.

```bash
docker compose up --build -d
```
Once started, open your browser and navigate to: **http://localhost:3000**

---

### 3. Standalone CLI Mode (Terminal)
If you only want to perform quick checks without running a database.

Install dependencies locally:
```bash
bun install
```

**Check specific domains:**
```bash
bun run src/index.ts --domains google.com github.com
```

**Get output in clean JSON format:**
```bash
bun run src/index.ts --domains google.com --json
```

**Set custom warning/critical thresholds (in days):**
```bash
bun run src/index.ts --domains google.com --warn 45 --crit 10
```

---

## 🔒 Security & Authentication

The Web Dashboard, REST APIs, and WebSockets are protected by an auto-generated API Key.

* **First Boot:** On the very first run, the system automatically generates a secure 32-character API Key.
* **Storage:** This key is appended to your local `.env` file (so it persists across restarts).
* **Logs:** You can view the generated key in the console output or by running `docker compose logs monitor-app` (look for the `[SECURITY] Dashboard API Key` line).
* **Usage:** Enter this key in the Dashboard's lock screen. For programmatic access, include the header `Authorization: Bearer <API_KEY>` in your HTTP requests.

---

## 🔌 REST API & WebSockets

### REST API
| Method | Endpoint | Description | Body / Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/domains` | Retrieves the list of domains and their statuses. | - |
| `POST` | `/api/domains` | Adds a new domain for monitoring. | `{"domain": "example.com"}` |
| `DELETE` | `/api/domains/:domain`| Removes a domain from monitoring. | In the URL |
| `POST` | `/api/check` | Forces validation of all monitored domains. | - |

### WebSockets (`ws://localhost:3000/ws`)
The server broadcasts JSON notifications upon any changes. Available events:
*   `added`: When a new domain is registered.
*   `updated`: When a certificate's validation status changes.
*   `deleted`: When a domain is removed.

*You can check the **"Integration and WebSockets"** section directly in the Web Dashboard for client-side connection code examples.*

---

## 🛠️ Technology Stack
*   **Runtime:** [Bun](https://bun.sh/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Database:** [MongoDB](https://www.mongodb.com/) (Mongoose)
*   **Frontend:** Vanilla JS, CSS Glassmorphism, FontAwesome

---

## 📜 License
This project is open-source. Feel free to modify and adapt it to your infrastructure needs.
