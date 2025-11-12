import React, { useEffect, useMemo, useRef, useState } from 'react'
import useWeatherStore from '../../store/GlobalState'

type GeoResult = {
	id: number
	name: string
	latitude: number
	longitude: number
	country?: string
	country_code?: string
	admin1?: string
	population?: number
	timezone?: string
}

type GeoResponse = {
	results?: GeoResult[]
	generationtime_ms?: number
}

const API_URL = 'https://geocoding-api.open-meteo.com/v1/search'

function makeLabel(r: GeoResult): string {
	const parts = [r.name, r.admin1, r.country_code].filter(Boolean)
	return parts.join(', ')
}

export default function LocationSearch() {
	const setLocation = useWeatherStore((s) => s.setLocation)
	const setHasEnteredApp = useWeatherStore((s) => s.setHasEnteredApp)

	const [query, setQuery] = useState<string>('')
	const [loading, setLoading] = useState<boolean>(false)
	const [error, setError] = useState<string | null>(null)
	const [results, setResults] = useState<GeoResult[]>([])

	const abortRef = useRef<AbortController | null>(null)
	const debouncedQuery = useDebounce(query, 300)

	useEffect(() => {
		if (debouncedQuery.trim().length < 2) {
			setResults([])
			setLoading(false)
			setError(null)
			return
		}

		abortRef.current?.abort()
		const controller = new AbortController()
		abortRef.current = controller

		const fetchResults = async () => {
			try {
				setLoading(true)
				setError(null)
				const params = new URLSearchParams({
					name: debouncedQuery.trim(),
					count: '10',
					language: 'en',
					format: 'json',
				})
				const res = await fetch(`${API_URL}?${params.toString()}`, {
					signal: controller.signal,
				})
				if (!res.ok) throw new Error(`Search failed (${res.status})`)
				const json: GeoResponse = await res.json()
				setResults(json.results ?? [])
			} catch (err: any) {
				if (err?.name === 'AbortError') return
				setError(err?.message ?? 'Search failed')
				setResults([])
			} finally {
				setLoading(false)
			}
		}
		fetchResults()

		return () => {
			controller.abort()
		}
	}, [debouncedQuery])

	const sorted = useMemo(() => {
		if (!results.length || query.trim().length < 2) return []
		const q = query.trim().toLowerCase()
		const wordBoundary = new RegExp(`\\b${escapeRegex(q)}`)
		return [...results]
			.map((r) => {
				const label = makeLabel(r)
				const lower = label.toLowerCase()
				let score = 0
				if (lower.startsWith(q)) score = 3
				else if (wordBoundary.test(lower)) score = 2
				else if (lower.includes(q)) score = 1
				return { r, score, pop: r.population ?? 0 }
			})
			.sort((a, b) => {
				if (b.score !== a.score) return b.score - a.score
				return b.pop - a.pop
			})
			.map((x) => x.r)
	}, [results, query])

	function onSelect(r: GeoResult) {
		setLocation({
			latitude: r.latitude,
			longitude: r.longitude,
			label: makeLabel(r),
		})
		setHasEnteredApp(true)
		// Reset input and suggestions after selection
		setQuery('')
		setResults([])
	}

	return (
		<div className='onboarding__search'>
			<input
				type='text'
				className='input'
				placeholder='Search City or Zip Code'
				aria-label='Search for a location'
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				disabled={false}
			/>

			{!loading && sorted.length > 0 && (
				<ul className='onboarding__suggestions' role='listbox' aria-label='Search suggestions'>
					{sorted.map((r) => {
						const label = makeLabel(r)
						return (
							<li key={`${r.id}-${r.latitude}-${r.longitude}`} role='option'>
								<button
									type='button'
									className='btn'
									onClick={() => onSelect(r)}
									aria-label={`Choose ${label}`}
								>
									{label}
								</button>
							</li>
						)
					})}
				</ul>
			)}

			{!loading && query.trim().length >= 2 && sorted.length === 0 && !error && (
				<div className='onboarding__no-results' aria-live='polite'>No results</div>
			)}
			{!loading && error && (
				<div className='onboarding__error' role='alert'>{error}</div>
			)}
		</div>
	)
}

function useDebounce<T>(value: T, delayMs: number): T {
	const [debounced, setDebounced] = useState<T>(value)
	useEffect(() => {
		const t = setTimeout(() => setDebounced(value), delayMs)
		return () => clearTimeout(t)
	}, [value, delayMs])
	return debounced
}

function escapeRegex(s: string): string {
	return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}


