import type { DeepSkyCatalogData } from '$lib/types/api.js';

export function getDeepSkyCatalogData(): DeepSkyCatalogData {
	return {
		objects: [
			{
				id: 'DSO-001',
				name: 'Andromeda Galaxy',
				catalogDesignation: 'M31 / NGC 224',
				type: 'galaxy',
				constellation: 'Andromeda',
				rightAscension: '00h 42m 44.3s',
				declination: '+41° 16′ 09″',
				apparentMagnitude: 3.44,
				distanceLightYears: 2537000,
				imagingRecommendation: {
					minAperture: 80,
					idealExposure: 180,
					bestMonths: ['September', 'October', 'November'],
					filterSuggestion: 'Broadband RGB or L-enhance'
				}
			},
			{
				id: 'DSO-002',
				name: 'Orion Nebula',
				catalogDesignation: 'M42 / NGC 1976',
				type: 'nebula',
				constellation: 'Orion',
				rightAscension: '05h 35m 17.3s',
				declination: '-05° 23′ 28″',
				apparentMagnitude: 4.0,
				distanceLightYears: 1344,
				imagingRecommendation: {
					minAperture: 60,
					idealExposure: 120,
					bestMonths: ['December', 'January', 'February'],
					filterSuggestion: 'H-alpha or dual-narrowband'
				}
			},
			{
				id: 'DSO-003',
				name: 'Crab Nebula',
				catalogDesignation: 'M1 / NGC 1952',
				type: 'supernova-remnant',
				constellation: 'Taurus',
				rightAscension: '05h 34m 31.9s',
				declination: '+22° 00′ 52″',
				apparentMagnitude: 8.4,
				distanceLightYears: 6523,
				imagingRecommendation: {
					minAperture: 150,
					idealExposure: 300,
					bestMonths: ['November', 'December', 'January'],
					filterSuggestion: 'OIII + H-alpha'
				}
			},
			{
				id: 'DSO-004',
				name: 'Pleiades',
				catalogDesignation: 'M45',
				type: 'cluster',
				constellation: 'Taurus',
				rightAscension: '03h 47m 24s',
				declination: '+24° 07′ 00″',
				apparentMagnitude: 1.6,
				distanceLightYears: 444,
				imagingRecommendation: {
					minAperture: 50,
					idealExposure: 90,
					bestMonths: ['October', 'November', 'December'],
					filterSuggestion: 'Broadband RGB'
				}
			},
			{
				id: 'DSO-005',
				name: 'Whirlpool Galaxy',
				catalogDesignation: 'M51 / NGC 5194',
				type: 'galaxy',
				constellation: 'Canes Venatici',
				rightAscension: '13h 29m 52.7s',
				declination: '+47° 11′ 43″',
				apparentMagnitude: 8.4,
				distanceLightYears: 23160000,
				imagingRecommendation: {
					minAperture: 200,
					idealExposure: 240,
					bestMonths: ['March', 'April', 'May'],
					filterSuggestion: 'Luminance + RGB'
				}
			}
		],
		count: 5,
		timestamp: '2025-03-15T12:00:00Z'
	};
}

export function getDeepSkyCatalogPreview() {
	const data = getDeepSkyCatalogData();
	const featured = data.objects[0];
	return {
		totalObjects: data.count,
		featuredObject: featured.name,
		featuredType: featured.type,
		currentBestViewing: data.objects.find((o) =>
			o.imagingRecommendation.bestMonths.includes('March')
		)?.name
	};
}
