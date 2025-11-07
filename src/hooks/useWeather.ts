import { useEffect } from 'react'
import { fetchForecast } from '../lib/openMeteo'
import useWeatherStore from '../store/weather'

export function useWeather({ auto = true } = {}) {
	const { location, status, data, error, setLoading, setSuccess, setError } = useWeatherStore()

	useEffect(() => {
		if (!auto) return
		let isMounted = true
		;(async () => {
			try {
				setLoading()
				const result = await fetchForecast({
					latitude: location.latitude,
					longitude: location.longitude,
				})
				if (!isMounted) return
				setSuccess(result)
			} catch (err: any) {
				if (!isMounted) return
				setError(err?.message ?? 'Failed to fetch weather')
			}
		})()
		return () => {
			isMounted = false
		}
	}, [auto, location.latitude, location.longitude, setLoading, setSuccess, setError])

	return { location, status, data, error }
}

export default useWeather

