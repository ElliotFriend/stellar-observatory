import { describe, it, expect } from 'vitest';
import { GET } from '../../../routes/api/space-weather/+server.js';

describe('GET /api/space-weather', () => {
	it('returns space weather data with 200 status', async () => {
		const response = await GET({} as Parameters<typeof GET>[0]);
		expect(response.status).toBe(200);

		const data = await response.json();
		expect(data).toHaveProperty('solarWind');
		expect(data).toHaveProperty('geomagneticStorms');
		expect(data).toHaveProperty('solarFlares');
		expect(data).toHaveProperty('auroraForecast');
		expect(data).toHaveProperty('timestamp');
	});
});
