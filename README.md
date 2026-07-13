# Top 5 Stocks MCP Server

Exposes the [Top 5 Stocks API](https://top5stocks.netlify.app/developers) as MCP tools for Claude, Claude Code, Cursor, and other MCP-compatible agents.

## Setup

```bash
npm install
```

Add to your MCP client config (e.g. Claude Desktop `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "top5stocks": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server/index.js"],
      "env": {
        "TOP5STOCKS_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

`TOP5STOCKS_API_KEY` is only required for `starter`/`pro`/`ultra`-tier tools. Free tools (`get_daily_watchlist_free`, `get_crypto_watchlist_free`, cumulative-performance endpoints, `get_api_metadata`) work with no key.

Get a key at https://top5stocks.netlify.app/members.html

Or once published, run directly via npx (no local clone needed):

```json
{
  "mcpServers": {
    "top5stocks": {
      "command": "npx",
      "args": ["-y", "top5stocks-mcp-server"],
      "env": {
        "TOP5STOCKS_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

## Tools

Each tool maps 1:1 to an API endpoint (see `index.js` `ENDPOINTS` for the full list and plan requirements). All responses are raw JSON text from the live API.

Educational market research only — not financial advice.
