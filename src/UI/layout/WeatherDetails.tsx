import { useState } from 'react'
import useWeather from '../../hooks/useWeather'
import LocationClock from '../components/LocationClock'

const WeatherDetails = () => {
	const { data, status, location } = useWeather({ auto: true })

	const [tempUnit, setTempUnit] = useState<'F' | 'C'>('F')

	const tempC = data?.now.temperatureC
	const humidity = data?.now.humidityPct
	const windMs = data?.now.windSpeedMs
	const windMph = typeof windMs === 'number' ? (windMs * 2.23694) : null

	const displayedTemp =
		typeof tempC === 'number'
			? (tempUnit === 'F' ? Math.round((tempC * 9) / 5 + 32) : Math.round(tempC))
			: '—'

	return (
		<section className='weather-overlay' aria-label='Weather overlay'>
			<div className='weather-overlay__content'>
				<header className='weather-header card card--glass'>
					<div className='weather-header__location'>{location.label}</div>
					{data ? (
						<LocationClock className='weather-header__time' utcOffsetSeconds={data.utcOffsetSeconds} timezone={data.timezone} />
					) : (
						<time className='weather-header__time'>—</time>
					)}
				</header>

				<button
					className='weather-main card card--glass'
					onClick={() => setTempUnit((u) => (u === 'F' ? 'C' : 'F'))}
					aria-label='Toggle temperature unit'
					title='Click to toggle °F/°C'
				>
					<div className='weather-main__temp'>{displayedTemp}<span className='weather-main__condition'>{tempUnit === 'F' ? '°F' : '°C'}</span></div>
				</button>

				<section className='weather-details card card--glass' aria-label='Current conditions'>
					<div className='weather-details__item'>Lat/Lon: {location.latitude.toFixed(3)}, {location.longitude.toFixed(3)}</div>
					<div className='weather-details__item'>Humidity: {typeof humidity === 'number' ? Math.round(humidity) + '%' : '—'}</div>
					<div className='weather-details__item'>Wind: {typeof windMph === 'number' ? Math.round(windMph) + ' mph' : '—'}</div>
				</section>
			</div>
		</section>
	)
}

export default WeatherDetails
