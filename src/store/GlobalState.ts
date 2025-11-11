import { create } from 'zustand'
import { Vector3 } from 'three'
import type { WeatherData, WeatherState, Coordinates } from '../types/weather'

type WeatherStore = WeatherState & {
	setLocation: (coords: Coordinates & { label?: string }) => void
	setLoading: () => void
	setSuccess: (data: WeatherData) => void
	setError: (message: string) => void
	hasEnteredApp: boolean
	setHasEnteredApp: (value: boolean) => void
	locationVector: Vector3
	setLocationVector: (value: Vector3) => void
}

export const useWeatherStore = create<WeatherStore>((set) => ({
	location: { label: 'New York City, NY, US', latitude: 40.714, longitude: -74.006 },
	data: null,
	status: 'idle',
	error: null,
	lastUpdated: null,
	hasEnteredApp: false,
	locationVector: new Vector3(0, 0, 0),

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
	setHasEnteredApp: (value) => set({ hasEnteredApp: value }),
	setLocationVector: (value) => set({ locationVector: value }),
}))

export default useWeatherStore

