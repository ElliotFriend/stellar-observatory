import { describe, it, expect } from 'vitest';
import { GET } from '../../../routes/api/exoplanets/+server.js';

describe('GET /api/exoplanets', () => {
	it('returns exoplanet data with 200 status', async () => {
		const response = await GET({} as Parameters<typeof GET>[0]);
		expect(response.status).toBe(200);

		const data = await response.json();
		expect(data).toHaveProperty('planets');
		expect(data).toHaveProperty('count');
		expect(data).toHaveProperty('timestamp');
		expect(data.planets.length).toBe(data.count);
	});
});
