import React, { useCallback, useState } from 'react'
import { useGeolocated } from 'react-geolocated'
import useWeatherStore from '../../store/GlobalState'

type BdcReverseResponse = {
	city?: string
	locality?: string
	principalSubdivision?: string
	countryCode?: string
	postcode?: string
}

const REVERSE_API = 'https://api.bigdatacloud.net/data/reverse-geocode-client'

function makeLabelFromBdc(res: BdcReverseResponse): string {
	const cityLike = res.locality || res.city
	const state = res.principalSubdivision
	const zip = res.postcode
	const country = res.countryCode

	if (cityLike && state && zip) {
		return `${cityLike}, ${state} ${zip}${country ? `, ${country}` : ''}`
	}
	const parts = [cityLike, state, zip, country].filter(Boolean)
	return parts.join(', ')
}

export default function UseMyLocation() {
	const setLocation = useWeatherStore((s) => s.setLocation)
	const setHasEnteredApp = useWeatherStore((s) => s.setHasEnteredApp)

	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState<boolean>(false)

	const { coords, isGeolocationAvailable, isGeolocationEnabled } = useGeolocated({
		positionOptions: { enableHighAccuracy: false },
		userDecisionTimeout: 5000,
	})

	const handleUseLocation = useCallback(async () => {
		setError(null)
		if (!isGeolocationAvailable) {
			setError('Geolocation not supported')
			return
		}
		if (!isGeolocationEnabled) {
			setError('Geolocation disabled')
			return
		}
		if (!coords?.latitude || !coords?.longitude) {
			setError('Getting location…')
			return
		}

		try {
			setLoading(true)
			const params = new URLSearchParams({
				latitude: String(coords.latitude),
				longitude: String(coords.longitude),
				localityLanguage: 'en',
			})
			const res = await fetch(`${REVERSE_API}?${params.toString()}`)
			if (!res.ok) throw new Error(`Reverse geocoding failed (${res.status})`)
			const json: BdcReverseResponse = await res.json()
			const label = makeLabelFromBdc(json) || `Lat ${coords.latitude.toFixed(2)}, Lon ${coords.longitude.toFixed(2)}`

			setLocation({
				latitude: coords.latitude,
				longitude: coords.longitude,
				label,
			})
			setHasEnteredApp(true)
		} catch (err: any) {
			setError(err?.message ?? 'Failed to resolve location')
		} finally {
			setLoading(false)
		}
	}, [coords, isGeolocationAvailable, isGeolocationEnabled, setLocation, setHasEnteredApp])

	return (
		<>
			<button
				type='button'
				className='btn btn--primary'
				onClick={handleUseLocation}
				aria-label='Use my current location'
				disabled={loading}
			>
				{loading ? 'Locating…' : 'Use my location'}
			</button>
			{error && <div className='onboarding__error' role='alert'>{error}</div>}
		</>
	)
}


