#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const API_BASE = process.env.TOP5STOCKS_API_BASE || "https://top5stocks-api.top5stocks.workers.dev";
const API_KEY = process.env.TOP5STOCKS_API_KEY || "";

// path, min plan, needs auth, description
const ENDPOINTS = {
  get_daily_watchlist_free: { path: "/api/v1/free/today.json", plan: "free", auth: false, description: "Today's free Top 5 Stocks momentum watchlist (symbol, price, rank only — no reference levels)." },
  get_daily_watchlist: { path: "/api/v1/watchlist/today.json", plan: "starter", auth: true, description: "Today's full Top 5 Stocks watchlist with risk labels and catalyst summaries." },
  get_daily_stocks_detail: { path: "/api/v1/stocks/today.json", plan: "pro", auth: true, description: "Full per-stock detail for today's watchlist: technical reference levels, thesis, why_ranked breakdown." },
  get_crypto_watchlist_free: { path: "/api/v1/crypto/today.json", plan: "free", auth: false, description: "Today's free Top 5 Crypto watchlist." },
  get_crypto_watchlist_full: { path: "/api/v1/crypto/full.json", plan: "pro", auth: true, description: "Full crypto watchlist detail with reference levels." },
  get_macro_context: { path: "/api/v1/macro/today.json", plan: "pro", auth: true, description: "Today's macro regime context (VIX, yields, GDP, CPI, Fed)." },
  get_alerts_today: { path: "/api/v1/alerts/today.json", plan: "pro", auth: true, description: "Today's upside/downside level alert events." },
  get_performance: { path: "/api/v1/performance.json", plan: "pro", auth: true, description: "Full performance breakdown: win rate, avg return, per-pick history." },
  get_performance_cumulative_free: { path: "/api/v1/performance/cumulative.json", plan: "free", auth: false, description: "Cumulative $10k simulated performance chart data (free)." },
  get_performance_history: { path: "/api/v1/performance/history.json", plan: "starter", auth: true, description: "Historical daily watchlist entries with outcomes." },
  get_performance_symbols: { path: "/api/v1/performance/symbols.json", plan: "pro", auth: true, description: "Per-symbol lifetime performance stats." },
  get_performance_undervalued: { path: "/api/v1/performance/undervalued.json", plan: "free", auth: true, description: "Undervalued (long-horizon) watchlist performance." },
  get_performance_undervalued_cumulative_free: { path: "/api/v1/performance/undervalued_cumulative.json", plan: "free", auth: false, description: "Cumulative undervalued watchlist performance chart (free)." },
  get_performance_crypto_cumulative_free: { path: "/api/v1/performance/crypto_cumulative.json", plan: "free", auth: false, description: "Cumulative crypto watchlist performance chart (free)." },
  get_watchlist_changes: { path: "/api/v1/watchlist/changes.json", plan: "starter", auth: true, description: "Day-over-day watchlist additions/removals." },
  get_confidence_latest: { path: "/api/v1/confidence/latest.json", plan: "pro", auth: true, description: "Latest model confidence/calibration metrics." },
  get_stocks_sectors: { path: "/api/v1/stocks/sectors.json", plan: "pro", auth: true, description: "Sector breakdown of today's watchlist." },
  get_undervalued_latest: { path: "/api/v1/undervalued/latest.json", plan: "ultra", auth: true, description: "Latest long-horizon Undervalued watchlist (GARP scan)." },
  get_generational_latest: { path: "/api/v1/generational/latest.json", plan: "ultra", auth: true, description: "Latest monthly Generational quality-screen watchlist." },
  get_ultra_archive: { path: "/api/v1/ultra/archive.json", plan: "ultra", auth: true, description: "Full historical Ultra-tier archive." },
  get_api_metadata: { path: "/api/v1/metadata.json", plan: "free", auth: false, description: "API metadata: available endpoints, plans, rate limits." },
};

async function callEndpoint(name) {
  const ep = ENDPOINTS[name];
  if (!ep) throw new Error(`Unknown tool: ${name}`);
  if (ep.auth && !API_KEY) {
    throw new Error(
      `This endpoint requires an API key (plan: ${ep.plan}+). Set TOP5STOCKS_API_KEY in your MCP client config. Get a key at https://top5stocks.netlify.app/members.html`
    );
  }
  const headers = { "User-Agent": "top5stocks-mcp-server/1.0" };
  if (ep.auth) headers["X-API-Key"] = API_KEY;
  const res = await fetch(`${API_BASE}${ep.path}`, { headers });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Top 5 Stocks API ${res.status}: ${text.slice(0, 500)}`);
  }
  return text;
}

const server = new Server(
  { name: "top5stocks", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: Object.entries(ENDPOINTS).map(([name, ep]) => ({
    name,
    description: `${ep.description} Requires plan: ${ep.plan}${ep.auth ? " (API key needed)" : " (no auth needed)"}. Educational market research only — not financial advice.`,
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  })),
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name } = request.params;
  try {
    const body = await callEndpoint(name);
    return { content: [{ type: "text", text: body }] };
  } catch (err) {
    return {
      content: [{ type: "text", text: `Error: ${err.message}` }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Top 5 Stocks MCP server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
