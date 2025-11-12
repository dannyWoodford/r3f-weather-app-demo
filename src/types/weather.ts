export type Coordinates = {
	latitude: number
	longitude: number
}

export type WeatherPoint = {
	time: Date
	temperatureC: number | null
	humidityPct: number | null
	windSpeedMs: number | null
	weatherCode: number | null
}

export type WeatherHourly = {
	points: WeatherPoint[]
}

export type WeatherNow = {
	time: Date
	temperatureC: number | null
	humidityPct: number | null
	windSpeedMs: number | null
	weatherCode: number | null
}

export type WeatherData = {
	coordinates: Coordinates
	utcOffsetSeconds: number
	timezone: string
	hourly: WeatherHourly
	now: WeatherNow
}

export type WeatherState = {
	location: { label: string } & Coordinates
	data: WeatherData | null
	status: 'idle' | 'loading' | 'success' | 'error'
	error: string | null
	lastUpdated: number | null
}

