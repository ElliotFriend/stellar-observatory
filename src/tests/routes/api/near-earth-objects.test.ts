import { describe, it, expect } from 'vitest';
import { GET } from '../../../routes/api/near-earth-objects/+server.js';

describe('GET /api/near-earth-objects', () => {
	it('returns NEO data with 200 status', async () => {
		const response = await GET({} as Parameters<typeof GET>[0]);
		expect(response.status).toBe(200);

		const data = await response.json();
		expect(data).toHaveProperty('objects');
		expect(data).toHaveProperty('count');
		expect(data).toHaveProperty('queryPeriod');
		expect(data).toHaveProperty('timestamp');
		expect(data.objects.length).toBe(data.count);
	});
});
