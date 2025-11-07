import React, { useEffect, useMemo, useState } from 'react'

export type LocationClockProps = {
	utcOffsetSeconds: number
	className?: string
}

const baseFormat: Intl.DateTimeFormatOptions = {
	timeZone: 'UTC', // we manually offset Date to local time at location
	weekday: 'short',
	month: 'short',
	day: 'numeric',
	hour: 'numeric',
	minute: '2-digit',
}

const LocationClock = ({ utcOffsetSeconds, className }: LocationClockProps) => {
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

	const nowLocal = useMemo(() => new Date(Date.now() + utcOffsetSeconds * 1000), [utcOffsetSeconds, tick])
	const formatted = useMemo(() => new Intl.DateTimeFormat(undefined, baseFormat).format(nowLocal), [nowLocal])

	return (
		<time className={className} dateTime={nowLocal.toISOString()}>
			{formatted}
		</time>
	)
}

export default React.memo(LocationClock)

