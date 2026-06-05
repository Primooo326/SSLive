import tls from "node:tls";
import { isIP } from "node:net";
import type { CertStatus } from "./types";

const DEFAULT_PORT = 443;
const CONNECT_TIMEOUT = 5000;

function isIp(value: string): boolean {
  return isIP(value) !== 0;
}

function ignoreDomain(domain: string): boolean {
  return isIp(domain) || domain === "_";
}

/**
 * Checks the SSL certificate of a given domain.
 */
export function checkCertificate(
  domain: string,
  port = DEFAULT_PORT,
  warnDays = 30,
  critDays = 7,
  timeout = CONNECT_TIMEOUT
): Promise<CertStatus> {
  return new Promise((resolve) => {
    let socket: tls.TLSSocket | null = null;
    let resolved = false;

    const timer = setTimeout(() => {
      if (resolved) return;
      resolved = true;
      if (socket) {
        socket.destroy();
      }
      resolve({
        domain,
        days: null,
        expires: null,
        status: "ERROR",
        detail: `Timeout after ${timeout}ms`,
      });
    }, timeout);

    try {
      socket = tls.connect(
        {
          host: domain,
          port: port,
          servername: domain, // SNI
          rejectUnauthorized: false, // Don't abort on invalid/expired certs so we can parse them
          timeout: timeout,
        },
        () => {
          if (resolved) return;
          resolved = true;
          clearTimeout(timer);

          const cert = socket?.getPeerCertificate(true);
          socket?.destroy();

          if (!cert || Object.keys(cert).length === 0) {
            resolve({
              domain,
              days: null,
              expires: null,
              status: "ERROR",
              detail: "No certificate received",
            });
            return;
          }

          const validTo = cert.valid_to;
          if (!validTo) {
            resolve({
              domain,
              days: null,
              expires: null,
              status: "ERROR",
              detail: "Invalid certificate: missing valid_to date",
            });
            return;
          }

          const expiresDate = new Date(validTo);
          if (isNaN(expiresDate.getTime())) {
            resolve({
              domain,
              days: null,
              expires: null,
              status: "ERROR",
              detail: `Failed to parse expiration date: ${validTo}`,
            });
            return;
          }

          const now = new Date();
          const diffTime = expiresDate.getTime() - now.getTime();
          const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          const expiresStr = expiresDate.toISOString().replace("T", " ").substring(0, 19) + " UTC";

          let status: CertStatus["status"] = "OK";
          let detail = "";

          if (days < 0) {
            status = "EXPIRED";
            detail = `Expired ${Math.abs(days)} day(s) ago`;
          } else if (days <= critDays) {
            status = "CRITICAL";
            detail = `Expires in ${days} day(s)`;
          } else if (days <= warnDays) {
            status = "WARNING";
            detail = `Expires in ${days} day(s)`;
          }

          resolve({
            domain,
            days,
            expires: expiresStr,
            status,
            detail,
          });
        }
      );

      socket.on("error", (err) => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timer);
        socket?.destroy();
        resolve({
          domain,
          days: null,
          expires: null,
          status: "ERROR",
          detail: err.message,
        });
      });

      socket.on("timeout", () => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timer);
        socket?.destroy();
        resolve({
          domain,
          days: null,
          expires: null,
          status: "ERROR",
          detail: "Connection timeout",
        });
      });
    } catch (e: any) {
      if (resolved) return;
      resolved = true;
      clearTimeout(timer);
      socket?.destroy();
      resolve({
        domain,
        days: null,
        expires: null,
        status: "ERROR",
        detail: e.message || String(e),
      });
    }
  });
}

/**
 * Executes `nginx -T` and parses the domains.
 */
export function getNginxDomains(): string[] {
  try {
    const proc = Bun.spawnSync(["nginx", "-T"], {
      stderr: "pipe",
    });

    if (!proc.success) {
      console.warn(`[WARN] nginx -T failed with status ${proc.exitCode}. Error output:`, proc.stderr.toString());
      return [];
    }

    const output = proc.stdout.toString();
    const domains = new Set<string>();

    // This matches: server { ... } blocks up to one level of nested brackets (like location { })
    const blockRegex = /server\s*\{([^{}]*(?:\{[^{}]*\}?[^{}]*)*)\}/gs;
    let match;

    while ((match = blockRegex.exec(output)) !== null) {
      const block = match[1];

      // Check if it's listening on port 443
      if (!/listen\s+[^;]*443/.test(block)) {
        continue;
      }

      const nameRegex = /server_name\s+([^;]+);/g;
      let nameMatch;

      while ((nameMatch = nameRegex.exec(block)) !== null) {
        const names = nameMatch[1].trim().split(/\s+/);
        for (let name of names) {
          name = name.toLowerCase().replace(/\.+$/, "");
          if (name && !ignoreDomain(name)) {
            domains.add(name);
          }
        }
      }
    }

    return Array.from(domains).sort();
  } catch (error: any) {
    console.warn("[WARN] Could not get domains from Nginx configuration:", error.message);
    return [];
  }
}
