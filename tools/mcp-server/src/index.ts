#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { getMcpTools } from "@coinbase/agentkit-model-context-protocol";
import { AgentKit } from "@coinbase/agentkit";

class CoinbaseAgentKitMCPServer {
  private server: McpServer;
  private agentKit: AgentKit | null = null;
  private tools: any[] = [];

  constructor() {
    this.server = new McpServer(
      {
        name: "coinbase-agentkit-mcp",
        version: "0.1.0",
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandler();
  }

  private setupToolHandlers() {
    // Tools will be registered dynamically after AgentKit initialization
  }

  private async initializeAgentKit() {
    if (this.agentKit) return;

    try {
      // Validate environment variables
      const cdpApiKeyName = process.env.CDP_API_KEY_NAME;
      const cdpApiKeyPrivateKey = process.env.CDP_API_KEY_PRIVATE_KEY;

      if (!cdpApiKeyName || !cdpApiKeyPrivateKey) {
        throw new Error("Missing required environment variables: CDP_API_KEY_NAME and CDP_API_KEY_PRIVATE_KEY");
      }

      // Initialize AgentKit with CDP API keys
      this.agentKit = await AgentKit.from({
        cdpApiKeyName,
        cdpApiKeyPrivateKey,
      });

      // Retrieve MCP-compatible tools from AgentKit
      const mcpTools = await getMcpTools(this.agentKit);
      this.tools = mcpTools.tools;

      // Register each tool with the MCP server
      for (const tool of this.tools) {
        this.server.tool(
          tool.name,
          tool.description || "",
          tool.inputSchema || {},
          async (args: any) => {
            return await mcpTools.toolHandler(tool.name, args);
          }
        );
      }

      console.log(`✅ Coinbase AgentKit MCP Server initialized with ${this.tools.length} tools`);
    } catch (error) {
      console.error('❌ Failed to initialize Coinbase AgentKit:', error);
      throw error;
    }
  }

  private setupErrorHandler() {
    // McpServer handles errors internally, but we can set up process-level error handling
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });

    process.on('uncaughtException', (error) => {
      console.error('Uncaught exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });
  }

  async run() {
    try {
      // Validate that required environment variables are present
      const cdpApiKeyName = process.env.CDP_API_KEY_NAME;
      const cdpApiKeyPrivateKey = process.env.CDP_API_KEY_PRIVATE_KEY;

      if (!cdpApiKeyName || !cdpApiKeyPrivateKey) {
        console.error('🚨 Missing required environment variables:');
        console.error('  - CDP_API_KEY_NAME');
        console.error('  - CDP_API_KEY_PRIVATE_KEY');
        console.error('\nGet these from https://portal.cdp.coinbase.com/');
        process.exit(1);
      }

      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      console.log('✅ Coinbase AgentKit MCP Server running on stdio');
    } catch (error) {
      console.error('🚨 Error initializing Coinbase AgentKit MCP server:', error);
      process.exit(1);
    }
  }
}

// Start the server
const server = new CoinbaseAgentKitMCPServer();
server.run().catch((error) => {
  console.error('🚨 Server failed to start:', error);
  process.exit(1);
});