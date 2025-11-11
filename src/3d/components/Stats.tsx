import React from 'react'
import { Perf } from 'r3f-perf'

import useWeatherStore from '../../store/GlobalState'

export default function Stats() {
	const hasEnteredApp = useWeatherStore((s) => s.hasEnteredApp)

	return (
		<>
			<Perf className={hasEnteredApp ? 'stats' : 'stats stats--hidden'} />
		</>
	)
}
