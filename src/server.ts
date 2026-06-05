import { ServerWebSocket } from "bun";
import { Domain } from "./db";
import { checkCertificate } from "./checker";
import { getDashboardHtml } from "./dashboard";

// Store all active websocket clients
export const clients = new Set<ServerWebSocket<unknown>>();

/**
 * Broadcasts a payload to all connected WebSocket clients.
 */
export function broadcast(payload: object) {
  const messageStr = JSON.stringify(payload);
  for (const client of clients) {
    try {
      client.send(messageStr);
    } catch (err) {
      console.error("[WS] Failed to send message to a client:", err);
      clients.delete(client);
    }
  }
}

/**
 * Perform a single certificate check and save to database, then broadcast updates.
 */
export async function triggerSingleCheck(domainName: string, warnDays = 30, critDays = 7) {
  try {
    const res = await checkCertificate(domainName, 443, warnDays, critDays);
    const doc = await Domain.findOne({ domain: domainName });
    if (doc) {
      doc.days = res.days;
      doc.expires = res.expires;
      doc.status = res.status;
      doc.detail = res.detail;
      doc.lastChecked = new Date();
      await doc.save();
      
      broadcast({
        type: "updated",
        data: doc,
      });
    }
  } catch (err: any) {
    console.error(`[ERROR] Failed to run check for domain ${domainName}:`, err.message || err);
  }
}

/**
 * Start the Bun HTTP & WebSocket server.
 */
export function startServer(port: number, warnDays = 30, critDays = 7) {
  const server = Bun.serve({
    port,
    async fetch(req, server) {
      const url = new URL(req.url);
      const path = url.pathname;
      const method = req.method;

      // WebSocket endpoint
      if (path === "/ws") {
        const cookieHeader = req.headers.get("Cookie") || "";
        if (!cookieHeader.includes(`api_key=${process.env.API_KEY}`)) {
          return new Response("Unauthorized", { status: 401 });
        }
        const upgraded = server.upgrade(req);
        if (upgraded) {
          return undefined; // Handled by Bun
        }
        return new Response("WebSocket connection failed", { status: 400 });
      }

      // Root Dashboard
      if (path === "/" || path === "/index.html") {
        return new Response(getDashboardHtml(), {
          headers: {
            "Content-Type": "text/html; charset=utf-8",
          },
        });
      }

      // REST API: POST /api/auth
      if (path === "/api/auth" && method === "POST") {
        try {
          const body = (await req.json()) as { key?: string };
          if (body.key === process.env.API_KEY) {
            return new Response(JSON.stringify({ success: true }), {
              status: 200,
              headers: {
                "Set-Cookie": `api_key=${body.key}; Path=/; HttpOnly; SameSite=Lax`,
                "Content-Type": "application/json"
              }
            });
          }
          return Response.json({ error: "Invalid API Key" }, { status: 401 });
        } catch (e) {
          return Response.json({ error: "Invalid request" }, { status: 400 });
        }
      }

      // Authenticate all other /api/* routes
      if (path.startsWith("/api/") && path !== "/api/auth") {
        const cookieHeader = req.headers.get("Cookie") || "";
        const authHeader = req.headers.get("Authorization") || "";
        const isAuthCookie = cookieHeader.includes(`api_key=${process.env.API_KEY}`);
        const isAuthHeader = authHeader === `Bearer ${process.env.API_KEY}`;
        
        if (!isAuthCookie && !isAuthHeader) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
      }

      // REST API: GET /api/domains
      if (path === "/api/domains" && method === "GET") {
        try {
          const domains = await Domain.find().sort({ domain: 1 });
          return Response.json(domains);
        } catch (e: any) {
          return Response.json({ error: e.message || "Database query failed" }, { status: 500 });
        }
      }

      // REST API: POST /api/domains
      if (path === "/api/domains" && method === "POST") {
        try {
          const body = (await req.json()) as { domain?: string };
          let domainName = body.domain?.trim().toLowerCase();

          if (!domainName) {
            return Response.json({ error: "The 'domain' field is required." }, { status: 400 });
          }

          // Clean domain string: remove protocol and trailing slash / path / port
          domainName = domainName.replace(/^(https?:\/\/)?(www\.)?/, "");
          domainName = domainName.split("/")[0].split(":")[0];

          if (!domainName || domainName.includes(" ") || !domainName.includes(".")) {
            return Response.json({ error: "Invalid domain format." }, { status: 400 });
          }

          // Check for duplication
          const existing = await Domain.findOne({ domain: domainName });
          if (existing) {
            return Response.json({ error: "Domain is already being monitored." }, { status: 400 });
          }

          const newDoc = new Domain({
            domain: domainName,
            status: "PENDING",
          });
          await newDoc.save();

          // Broadcast addition
          broadcast({
            type: "added",
            data: newDoc,
          });

          // Run check immediately in the background
          triggerSingleCheck(domainName, warnDays, critDays);

          return Response.json(newDoc, { status: 201 });
        } catch (e: any) {
          return Response.json({ error: e.message || "Invalid JSON or body format" }, { status: 400 });
        }
      }

      // REST API: DELETE /api/domains/:domain
      if (path.startsWith("/api/domains/") && method === "DELETE") {
        try {
          const domainName = decodeURIComponent(path.slice("/api/domains/".length)).trim().toLowerCase();
          if (!domainName) {
            return Response.json({ error: "Domain name parameter is missing." }, { status: 400 });
          }

          const deleted = await Domain.findOneAndDelete({ domain: domainName });
          if (!deleted) {
            return Response.json({ error: "Domain not found in monitored list." }, { status: 404 });
          }

          // Broadcast deletion
          broadcast({
            type: "deleted",
            domain: domainName,
          });

          return Response.json({ success: true, message: `Domain ${domainName} successfully deleted` });
        } catch (e: any) {
          return Response.json({ error: e.message || "Delete operation failed" }, { status: 500 });
        }
      }

      // REST API: POST /api/check (Forces validation of all domains)
      if (path === "/api/check" && method === "POST") {
        try {
          const domains = await Domain.find();
          // Asynchronously trigger checks and update client WebSockets.
          // Don't await checkCertificate here for responsiveness, or do await to return results?
          // Let's run checks in parallel and await them to respond with the new database documents,
          // while broadcasting updates in real time.
          const checkPromises = domains.map(async (doc) => {
            const res = await checkCertificate(doc.domain, 443, warnDays, critDays);
            doc.days = res.days;
            doc.expires = res.expires;
            doc.status = res.status;
            doc.detail = res.detail;
            doc.lastChecked = new Date();
            await doc.save();
            
            // Broadcast update
            broadcast({
              type: "updated",
              data: doc,
            });
            return doc;
          });

          const results = await Promise.all(checkPromises);
          return Response.json({ success: true, count: results.length, data: results });
        } catch (e: any) {
          return Response.json({ error: e.message || "Failed to trigger cert checks" }, { status: 500 });
        }
      }

      // 404 API / Files
      return new Response("Not Found", { status: 404 });
    },
    websocket: {
      open(ws) {
        clients.add(ws);
        console.log(`[WS] Connection opened. Total clients: ${clients.size}`);
      },
      message(ws, message) {
        // Echo/Ignore client messages
        console.log(`[WS] Message from client: ${message}`);
      },
      close(ws) {
        clients.delete(ws);
        console.log(`[WS] Connection closed. Total clients: ${clients.size}`);
      },
    },
  });

  console.log(`[INFO] Server running on http://localhost:${port}`);
  return server;
}
