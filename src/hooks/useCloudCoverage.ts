import { useMemo } from 'react'
import { getWeatherDescription } from '../lib/weatherCodes'

type CloudLevel = 'clear' | 'mainlyClear' | 'partlyCloudy' | 'overcast' | 'other'

type UseCloudCoverageResult = {
	coverage: number
	isCloudCode: boolean
	description: string
	level: CloudLevel
	recommendedPitch: number
}

export function useCloudCoverage(
	weatherCode: number | null | undefined,
	defaultCoverage: number,
	defaultPitch?: number
): UseCloudCoverageResult {
	const description = getWeatherDescription(weatherCode)

	const coverageMapping: Record<string, number> = {
		'Clear sky': 0.1,
		'Mainly clear': 0.2,
		'Partly cloudy': 0.35,
		'Overcast': 0.53,
	}

	const pitchMapping: Record<CloudLevel, number> = {
		clear: defaultPitch ?? 0,
		mainlyClear: -28,
		partlyCloudy: -7,
		overcast: -7,
		other: defaultPitch ?? 0,
	}

	return useMemo(() => {
		const isCloudCode = Object.prototype.hasOwnProperty.call(coverageMapping, description)
		const coverage = isCloudCode ? coverageMapping[description] : defaultCoverage

		let level: CloudLevel = 'other'
		if (description === 'Clear sky') level = 'clear'
		else if (description === 'Mainly clear') level = 'mainlyClear'
		else if (description === 'Partly cloudy') level = 'partlyCloudy'
		else if (description === 'Overcast') level = 'overcast'

		const recommendedPitch = pitchMapping[level]

		return { coverage, isCloudCode, description, level, recommendedPitch }
	}, [description, defaultCoverage, defaultPitch])
}

export default useCloudCoverage

