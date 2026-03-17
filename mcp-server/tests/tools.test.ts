import { describe, it, expect } from 'vitest';
import { tools, getToolByName } from '../src/tools.js';

describe('MCP tools', () => {
    it('defines 6 tools (5 endpoints + generic fetcher)', () => {
        expect(tools).toHaveLength(6);
    });

    it('each tool has required fields', () => {
        for (const tool of tools) {
            expect(tool.name).toBeTruthy();
            expect(tool.description).toBeTruthy();
            expect(tool.inputSchema).toBeDefined();
            expect(typeof tool.handler).toBe('function');
        }
    });

    it('getToolByName returns correct tool', () => {
        const tool = getToolByName('get-space-weather');
        expect(tool).toBeDefined();
        expect(tool!.name).toBe('get-space-weather');
    });

    it('getToolByName returns undefined for unknown tool', () => {
        expect(getToolByName('nonexistent')).toBeUndefined();
    });

    it('fetch-paid-resource requires url parameter', () => {
        const tool = getToolByName('fetch-paid-resource');
        expect(tool).toBeDefined();
        const schema = tool!.inputSchema as { required: string[] };
        expect(schema.required).toContain('url');
    });

    it('endpoint tools include price in description', () => {
        const tool = getToolByName('get-space-weather');
        expect(tool!.description).toContain('$0.001');
    });
});
