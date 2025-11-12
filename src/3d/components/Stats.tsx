import { Perf } from 'r3f-perf'
import { useControls } from 'leva'

import useWeatherStore from '../../store/GlobalState'

export default function Stats() {
	const hasEnteredApp = useWeatherStore((s) => s.hasEnteredApp)

	const { enable } = useControls(
		'stats',
		{
			enable: true,
		},
		{ collapsed: false }
	)

	return (
		<>
			<Perf className={hasEnteredApp && enable ? 'stats' : 'stats stats--hidden'} />
		</>
	)
}
