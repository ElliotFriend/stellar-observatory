#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { tools } from './tools.js';
import { createMcpX402Client } from './x402-client.js';
import type { Network } from '@x402/core/types';

const secretKey = process.env.STELLAR_SECRET_KEY;
const baseUrl = process.env.OBSERVATORY_BASE_URL ?? 'http://localhost:5173';
const network = (process.env.STELLAR_NETWORK ?? 'stellar:testnet') as Network;
const rpcUrl = process.env.STELLAR_RPC_URL;

if (!secretKey) {
    console.error('STELLAR_SECRET_KEY environment variable is required');
    process.exit(1);
}

const httpClient = createMcpX402Client(secretKey, network, rpcUrl);

const server = new McpServer({
    name: 'stellar-observatory',
    version: '0.0.1',
});

for (const tool of tools) {
    server.registerTool(
        tool.name,
        {
            description: tool.description,
            inputSchema: tool.inputSchema,
        },
        async (args: Record<string, unknown>) => {
            try {
                const result = await tool.handler(args, httpClient, baseUrl);
                return {
                    content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
                };
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                return {
                    content: [{ type: 'text' as const, text: `Error: ${message}` }],
                    isError: true,
                };
            }
        },
    );
}

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
