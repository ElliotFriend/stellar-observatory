import { describe, it, expect } from 'vitest';
import { GET } from '../../../routes/api/gravitational-waves/+server.js';

describe('GET /api/gravitational-waves', () => {
    it('returns gravitational wave data with 200 status', async () => {
        const response = await GET({} as Parameters<typeof GET>[0]);
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data).toHaveProperty('events');
        expect(data).toHaveProperty('count');
        expect(data).toHaveProperty('observingRun');
        expect(data).toHaveProperty('timestamp');
        expect(data.events.length).toBe(data.count);
    });
});
