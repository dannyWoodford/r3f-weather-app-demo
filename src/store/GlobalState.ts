import { create } from 'zustand'
import { Vector3 } from 'three'
import type { WeatherData, WeatherState, Coordinates } from '../types/weather'
import { CLOUD_TEXT_BASE_DELAY_MS } from './timings'
import { getWeatherDescription } from '../lib/weatherCodes'

type FlowPhase = 'idle' | 'loadingTerrain' | 'animatingCamera' | 'showingText'

type WeatherStore = WeatherState & {
	setLocation: (coords: Coordinates & { label?: string }) => void
	setLoading: () => void
	setSuccess: (data: WeatherData) => void
	setError: (message: string) => void
	hasEnteredApp: boolean
	setHasEnteredApp: (value: boolean) => void
	locationVector: Vector3
	setLocationVector: (value: Vector3) => void
	locationVersion: number

	// Flow controller
	flowId: number
	phase: FlowPhase
	spinnerVisible: boolean
	cloudTextVisible: boolean
	lastDesc: string | null
	currentDesc: string | null
	pendingTextTimeoutId: number | null
	setSpinnerVisible: (value: boolean) => void
	beginFlow: (currentDesc: string) => void
	markTerrainReady: (flowId: number) => void
	markCameraDone: (flowId: number) => void
	cancelFlow: (flowId: number) => void
}

export const useWeatherStore = create<WeatherStore>((set, get) => ({
	location: { label: 'New York City, NY, US', latitude: 40.714, longitude: -74.006 },
	data: null,
	status: 'idle',
	error: null,
	lastUpdated: null,
	hasEnteredApp: false,
	locationVector: new Vector3(0, 0, 0),
	locationVersion: 0,

	// Flow defaults
	flowId: 0,
	phase: 'idle',
	spinnerVisible: true,
	cloudTextVisible: false,
	lastDesc: null,
	currentDesc: null,
	pendingTextTimeoutId: null,

	setLocation: ({ latitude, longitude, label }) =>
		set((state) => ({
			location: {
				label: label ?? state.location.label,
				latitude,
				longitude,
			},
		})),

	setLoading: () => set({ status: 'loading', error: null }),
	setSuccess: (data) => {
		// Update weather data
		set({ data, status: 'success', error: null, lastUpdated: Date.now() })
		// Begin flow once we know the description
		const desc = getWeatherDescription(data?.now?.weatherCode)
		get().beginFlow(desc)
	},
	setError: (message) => set({ status: 'error', error: message }),
	setHasEnteredApp: (value) => set({ hasEnteredApp: value }),
	setLocationVector: (value) =>
		set((state) => ({
			locationVector: value,
			locationVersion: state.locationVersion + 1,
		})),

	// Flow actions
	// Flow overview (single source of truth for timings/phases):
	// - Initial onboarding:
	//   1) User selects a location
	//   2) beginFlow(desc) -> phase: 'loadingTerrain', spinnerVisible: true, cloudTextVisible: false
	//   3) When terrain is ready -> markTerrainReady(flowId) -> phase: 'animatingCamera', spinnerVisible: false
	//   4) JumpToLocation animates camera pitch if needed, then calls markCameraDone(flowId)
	//   5) markCameraDone schedules a single base delay; when elapsed -> phase: 'showingText', cloudTextVisible: true
	//
	// - Subsequent location changes:
	//   1) User changes location (or weather desc updates) -> beginFlow(desc) hides text and shows spinner
	//   2) When terrain is ready -> markTerrainReady(flowId) removes spinner, sets phase 'animatingCamera'
	//   3) JumpToLocation decides if animation is needed; on finish (or immediately if not) -> markCameraDone(flowId)
	//   4) markCameraDone schedules the standardized text delay; on timeout -> show text
	//
	// - Concurrency & safety:
	//   - flowId increments per beginFlow; all subsequent events validate the provided flowId
	//   - cancelFlow(flowId) clears pending timers if that flow is still current
	//
	// - Timings:
	//   - CAMERA_PITCH_ANIM_MS and CLOUD_TEXT_BASE_DELAY_MS live in src/config/timings.ts
	//   - Components read timings, but only the store owns the show-text timeout
	//
	setSpinnerVisible: (value) => set({ spinnerVisible: value }),
	beginFlow: (currentDesc) => {
		// cancel any previous text timers
		const prev = get().pendingTextTimeoutId
		if (prev != null) {
			clearTimeout(prev)
		}
		set((state) => {
			const nextFlowId = state.flowId + 1
			console.log('[Flow] beginFlow →', { nextFlowId, currentDesc })
			return {
				flowId: nextFlowId,
				currentDesc,
				phase: 'loadingTerrain',
				spinnerVisible: true,
				cloudTextVisible: false,
				pendingTextTimeoutId: null,
			}
		})
	},

	markTerrainReady: (flowId) => {
		const state = get()
		if (flowId !== state.flowId) return
		console.log('[Flow] markTerrainReady →', { flowId })
		set({
			phase: 'animatingCamera',
			// spinner can go away as soon as terrain is ready
			spinnerVisible: false,
		})
	},

	markCameraDone: (flowId) => {
		const state = get()
		if (flowId !== state.flowId) return
		console.log('[Flow] markCameraDone → scheduling showText', {
			flowId,
			delayMs: CLOUD_TEXT_BASE_DELAY_MS,
			lastDesc: state.lastDesc,
			currentDesc: state.currentDesc,
		})

		// Only single show-text timer owned by the store
		const timeoutId = window.setTimeout(() => {
			// ensure flow hasn't changed while waiting
			if (flowId !== get().flowId) return
			console.log('[Flow] showText →', { flowId })
			set((s) => ({
				phase: 'showingText',
				cloudTextVisible: true,
				lastDesc: s.currentDesc,
				pendingTextTimeoutId: null,
			}))
		}, CLOUD_TEXT_BASE_DELAY_MS)

		set({ pendingTextTimeoutId: timeoutId })
	},

	cancelFlow: (flowId) => {
		const state = get()
		// Only cancel if this flow is still current
		if (flowId !== state.flowId) return
		console.log('[Flow] cancelFlow →', { flowId })
		if (state.pendingTextTimeoutId != null) {
			clearTimeout(state.pendingTextTimeoutId)
		}
		set({
			pendingTextTimeoutId: null,
			phase: 'idle',
			spinnerVisible: false,
			cloudTextVisible: false,
		})
	},
}))

export default useWeatherStore

