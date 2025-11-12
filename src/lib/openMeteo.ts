import { fetchWeatherApi } from 'openmeteo'
import type { WeatherData, WeatherHourly, WeatherPoint } from '../types/weather'

export type FetchForecastOptions = {
	latitude: number
	longitude: number
	units?: 'metric' | 'imperial'
}

// Maps open-meteo variable indices to our variables. The order
// must match the request's hourly parameter list.
const HOURLY_VARS = [
	'temperature_2m',
	'relative_humidity_2m',
	'wind_speed_10m',
	'weather_code',
] as const

export async function fetchForecast(
	{ latitude, longitude, units = 'metric' }: FetchForecastOptions,
): Promise<WeatherData> {
	const params: Record<string, any> = {
		latitude,
		longitude,
		hourly: HOURLY_VARS.join(','),
		timezone: 'auto',
	}
	const url = 'https://api.open-meteo.com/v1/forecast'
	const responses = await fetchWeatherApi(url, params)
	const response = responses[0]

	const utcOffsetSeconds = response.utcOffsetSeconds()
	// Try to read timezone string from SDK response; default to 'UTC' if unavailable
	let timezone = 'UTC'
	try {
		if (typeof (response as any).timezone === 'function') {
			timezone = (response as any).timezone()
		}
	} catch {}
	const hourly = response.hourly()!

	const timeStart = Number(hourly.time())
	const timeEnd = Number(hourly.timeEnd())
	const interval = hourly.interval()
	const len = (timeEnd - timeStart) / interval

	const timeArray = Array.from({ length: len }, (_, i) =>
		new Date((timeStart + i * interval + utcOffsetSeconds) * 1000),
	)

	const vTemp = Array.from(hourly.variables(0)?.valuesArray() ?? [])
	const vHumidity = Array.from(hourly.variables(1)?.valuesArray() ?? [])
	const vWind = Array.from(hourly.variables(2)?.valuesArray() ?? [])
	const vCode = Array.from(hourly.variables(3)?.valuesArray() ?? [])

	const points: WeatherPoint[] = timeArray.map((time, idx) => ({
		time,
		temperatureC: vTemp[idx] ?? null,
		humidityPct: vHumidity[idx] ?? null,
		windSpeedMs: vWind[idx] ?? null,
		weatherCode: vCode[idx] ?? null,
	}))

	const hourlyData: WeatherHourly = { points }

	const first = points[0]

	return {
		coordinates: { latitude, longitude },
		utcOffsetSeconds,
		timezone,
		hourly: hourlyData,
		now: first
			? { ...first }
			: {
				time: new Date(),
				temperatureC: null,
				humidityPct: null,
				windSpeedMs: null,
				weatherCode: null,
			},
	}
}

