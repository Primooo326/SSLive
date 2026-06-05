import { checkCertificate, getNginxDomains } from "./checker";
import { connectToDb, Domain } from "./db";
import { startServer, triggerSingleCheck } from "./server";
import type { CertStatus } from "./types";
import crypto from "node:crypto";
import fs from "node:fs";

const COLORS = {
  OK: "\x1b[92m",
  WARNING: "\x1b[93m",
  CRITICAL: "\x1b[91m",
  EXPIRED: "\x1b[95m",
  ERROR: "\x1b[90m",
  RESET: "\x1b[0m",
};

function getExitCode(results: CertStatus[]): number {
  const statuses = new Set(results.map((r) => r.status));
  if (statuses.has("EXPIRED")) return 3;
  if (statuses.has("CRITICAL")) return 2;
  if (statuses.has("WARNING")) return 1;
  return 0;
}

function printTable(results: CertStatus[]) {
  const maxDomainLen = Math.max(...results.map((r) => r.domain.length), 30);
  const isTTY = process.stdout.isTTY;

  console.log(`\n${"DOMAIN".padEnd(maxDomainLen)}  ${"STATUS".padEnd(10)}  ${"DAYS".padEnd(6)}  EXPIRES`);
  console.log("─".repeat(maxDomainLen + 40));

  for (const r of results) {
    const daysStr = r.days !== null ? String(r.days) : "-";
    const expiresStr = r.expires || r.detail;
    const line = `${r.domain.padEnd(maxDomainLen)}  ${r.status.padEnd(10)}  ${daysStr.padEnd(6)}  ${expiresStr}`;

    if (isTTY) {
      const color = COLORS[r.status] || "";
      console.log(`${color}${line}${COLORS.RESET}`);
    } else {
      console.log(line);
    }
  }

  console.log("─".repeat(maxDomainLen + 40));

  const summary: Record<string, number> = {};
  for (const r of results) {
    summary[r.status] = (summary[r.status] || 0) + 1;
  }

  const parts = Object.entries(summary).map(([k, v]) => {
    if (isTTY) {
      const color = COLORS[k as keyof typeof COLORS] || "";
      return `${color}${k}${COLORS.RESET}: ${v}`;
    }
    return `${k}: ${v}`;
  });
  console.log("Summary → " + parts.join("  |  ") + "\n");
}

async function main() {
  // Ensure API_KEY is set
  if (!process.env.API_KEY) {
    const newKey = crypto.randomBytes(16).toString("hex");
    process.env.API_KEY = newKey;
    try {
      fs.appendFileSync(".env", `\nAPI_KEY=${newKey}\n`);
    } catch (e) {
      console.warn("[WARN] Could not append API_KEY to .env file");
    }
  }
  console.log(`\n[SECURITY] Dashboard API Key: ${process.env.API_KEY}\n`);

  // Parse configurations
  let warnDays = parseInt(process.env.WARN_DAYS || "30", 10);
  let critDays = parseInt(process.env.CRIT_DAYS || "7", 10);
  let port = parseInt(process.env.PORT || "3000", 10);
  let checkInterval = parseInt(process.env.CHECK_INTERVAL_MS || "3600000", 10);
  
  let isJson = false;
  let cliDomains: string[] = [];

  // Parse command line arguments
  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if (arg === "--warn" && i + 1 < process.argv.length) {
      warnDays = parseInt(process.argv[++i], 10);
    } else if (arg === "--crit" && i + 1 < process.argv.length) {
      critDays = parseInt(process.argv[++i], 10);
    } else if (arg === "--port" && i + 1 < process.argv.length) {
      port = parseInt(process.argv[++i], 10);
    } else if (arg === "--json") {
      isJson = true;
    } else if (arg === "--domains") {
      while (i + 1 < process.argv.length && !process.argv[i + 1].startsWith("-")) {
        cliDomains.push(process.argv[++i]);
      }
    }
  }

  if (warnDays <= critDays) {
    console.error("[ERROR] --warn days must be greater than --crit days");
    process.exit(1);
  }

  const dbUri = process.env.MONGODB_URI;

  // Decide Mode:
  // If we have explicit domains passed on CLI, or if MONGODB_URI is not set, we run Standalone Mode.
  const isDbMode = !!dbUri && cliDomains.length === 0;

  if (isDbMode) {
    console.log("[INFO] Running in Database/Service Mode (MongoDB connected)");
    try {
      await connectToDb(dbUri!);
      
      // Start Server (HTTP + WebSocket)
      startServer(port, warnDays, critDays);

      // Run initial check on all existing domains in DB in background
      const runChecks = async () => {
        console.log("[INFO] Starting periodic check of monitored domains...");
        const docs = await Domain.find();
        for (const doc of docs) {
          await triggerSingleCheck(doc.domain, warnDays, critDays);
        }
        console.log("[INFO] Periodic check completed.");
      };

      // Run immediately
      runChecks();

      // Schedule periodic checking
      setInterval(runChecks, checkInterval);
      console.log(`[INFO] Scheduled certificate checking every ${checkInterval}ms`);

    } catch (err) {
      console.error("[ERROR] Failed to start in Database Mode:", err);
      process.exit(1);
    }
  } else {
    // Standalone / CLI Mode
    console.log("[INFO] Running in Standalone CLI Mode");
    
    let targetDomains = cliDomains;
    if (targetDomains.length === 0) {
      console.log("[INFO] No domains specified. Attempting to parse local Nginx config...");
      targetDomains = getNginxDomains();
    }

    if (targetDomains.length === 0) {
      console.error("[ERROR] No domains found to check. Specify domains with --domains or configure Nginx.");
      process.exit(1);
    }

    console.log(`[INFO] Checking certificate status for ${targetDomains.length} domains...`);

    const results = await Promise.all(
      targetDomains.map((d) => checkCertificate(d, 443, warnDays, critDays))
    );

    if (isJson) {
      console.log(JSON.stringify(results, null, 2));
    } else {
      printTable(results);
    }

    process.exit(getExitCode(results));
  }
}

main().catch((err) => {
  console.error("[CRITICAL] Uncaught execution error:", err);
  process.exit(1);
});
