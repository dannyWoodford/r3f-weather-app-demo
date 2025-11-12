import React, { useEffect, useMemo, useState } from 'react'

export type LocationClockProps = {
	utcOffsetSeconds: number
	timezone?: string
	className?: string
}

const baseFormat: Intl.DateTimeFormatOptions = {
	weekday: 'short',
	month: 'short',
	day: 'numeric',
	hour: 'numeric',
	minute: '2-digit',
}

const LocationClock = ({ utcOffsetSeconds, timezone, className }: LocationClockProps) => {
	const [tick, setTick] = useState(0)

	useEffect(() => {
		let intervalId: number | undefined
		const schedule = () => {
			const now = Date.now()
			const msToNextMinute = 60000 - (now % 60000)
			const timeoutId = window.setTimeout(() => {
				setTick((t) => t + 1)
				intervalId = window.setInterval(() => setTick((t) => t + 1), 60000)
			}, msToNextMinute)
			return () => window.clearTimeout(timeoutId)
		}
		const clearTimeoutFn = schedule()
		return () => {
			clearTimeoutFn()
			if (intervalId) window.clearInterval(intervalId)
		}
	}, [])

	// Prefer timezone string to allow Intl to handle DST and transitions
	const formatted = useMemo(() => {
		try {
			if (timezone) {
				return new Intl.DateTimeFormat(undefined, { ...baseFormat, timeZone: timezone }).format(new Date())
			}
		} catch {
			// fallback to offset mode below
		}
		const nowLocal = new Date(Date.now() + utcOffsetSeconds * 1000)
		return new Intl.DateTimeFormat(undefined, { ...baseFormat, timeZone: 'UTC' }).format(nowLocal)
	}, [timezone, utcOffsetSeconds, tick])

	const tzAbbr = useMemo(() => {
		if (!timezone) return null
		try {
			const parts = new Intl.DateTimeFormat('en-US', {
				timeZone: timezone,
				timeZoneName: 'short',
				hour: '2-digit',
			}).formatToParts(new Date())
			const v = parts.find((p) => p.type === 'timeZoneName')?.value
			if (v) return v
		} catch {
			// ignore and fallback
		}
		// Fallback: derive from offset as GMT±HH:MM
		const offsetMin = Math.round(utcOffsetSeconds / 60)
		const sign = offsetMin >= 0 ? '+' : '-'
		const absMin = Math.abs(offsetMin)
		const hh = String(Math.floor(absMin / 60)).padStart(2, '0')
		const mm = String(absMin % 60).padStart(2, '0')
		return `GMT${sign}${hh}:${mm}`
	}, [timezone, utcOffsetSeconds, tick])

	return (
		<time className={className}>
			{formatted}
			{tzAbbr ? ` (${tzAbbr})` : ''}
		</time>
	)
}

export default React.memo(LocationClock)

