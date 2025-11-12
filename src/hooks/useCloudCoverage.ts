import { useMemo } from 'react'
import { getWeatherDescription } from '../lib/weatherCodes'

type UseCloudCoverageResult = {
	coverage: number
	isCloudCode: boolean
	description: string
}

export function useCloudCoverage(
	weatherCode: number | null | undefined,
	defaultCoverage: number = 0.28
): UseCloudCoverageResult {
	const description = getWeatherDescription(weatherCode)

	const mapping: Record<string, number> = {
		'Clear sky': 0.1,
		'Mainly clear': 0.2,
		'Partly cloudy': 0.35,
		'Overcast': 0.53,
	}

	return useMemo(() => {
		const isCloudCode = Object.prototype.hasOwnProperty.call(mapping, description)
		const coverage = isCloudCode ? mapping[description] : defaultCoverage
		return { coverage, isCloudCode, description }
	}, [description, defaultCoverage])
}

export default useCloudCoverage

