import { create } from 'zustand'
import type { WeatherData, WeatherState, Coordinates } from '../types/weather'

type WeatherStore = WeatherState & {
	setLocation: (coords: Coordinates & { label?: string }) => void
	setLoading: () => void
	setSuccess: (data: WeatherData) => void
	setError: (message: string) => void
}

export const useWeatherStore = create<WeatherStore>((set) => ({
	location: { label: 'San Francisco, CA', latitude: 37.7749, longitude: -122.4194 },
	data: null,
	status: 'idle',
	error: null,
	lastUpdated: null,

	setLocation: ({ latitude, longitude, label }) =>
		set((state) => ({
			location: {
				label: label ?? state.location.label,
				latitude,
				longitude,
			},
		})),

	setLoading: () => set({ status: 'loading', error: null }),
	setSuccess: (data) => set({ data, status: 'success', error: null, lastUpdated: Date.now() }),
	setError: (message) => set({ status: 'error', error: message }),
}))

export default useWeatherStore

