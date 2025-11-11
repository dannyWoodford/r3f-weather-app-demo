import OnboardingOverlay from './layout/OnboardingOverlay'
import WeatherDetails from './layout/WeatherDetails'

import useWeatherStore from '../store/GlobalState'

const UIContainer = () => {
	const hasEnteredApp = useWeatherStore((s) => s.hasEnteredApp)

	return (
		<>
			<OnboardingOverlay />

			{hasEnteredApp  && <WeatherDetails />}
		</>
	)
}

export default UIContainer