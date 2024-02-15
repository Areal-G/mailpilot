import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// const MAILPILOT_API_BASE = "https://mailpilot.dev/api/v1";
const MAILPILOT_API_BASE = "http://localhost:3000/api/v1";
const API_KEY = "";

// Create server instance
const server = new McpServer({
  name: "mailpilot-ai",
  version: "0.0.1",
});

async function makeIZRequest<T>(url: string): Promise<T | null> {
  const headers = {};

  try {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return (await response.json()) as T;
  } catch (error) {
    console.error("Error making NWS request:", error);
    return null;
  }
}

// Register tools
server.tool(
  "get-emails-needing-reply",
  "Get emails needing reply",
  {},
  async () => {
    return {
      content: [
        {
          type: "text",
          text: "Not implemented",
        },
      ],
    };
  },
);

server.tool(
  "get-emails-needing-follow-up",
  "Get emails needing follow-up",
  {
    olderThan: z.number().describe("Number of days to look back"),
  },
  async ({ olderThan }) => {
    return {
      content: [
        {
          type: "text",
          text: `Not implemented (olderThan: ${olderThan})`,
        },
      ],
    };
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Weather MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
