import OnboardingOverlay from './layout/OnboardingOverlay'
import WeatherDetails from './layout/WeatherDetails'
import LocationSearch from './components/LocationSearch'
import LoadingSpinner from './components/LoadingSpinner'

import useWeatherStore from '../store/GlobalState'

const UIContainer = () => {
	const hasEnteredApp = useWeatherStore((s) => s.hasEnteredApp)
	const spinnerVisible = useWeatherStore((s) => s.spinnerVisible)

	return (
		<>
			<LoadingSpinner overlay visible={spinnerVisible} />
			<OnboardingOverlay />

			{hasEnteredApp && <WeatherDetails />}

			{hasEnteredApp && (
				<div className='ui-fixed-search'>
					<LocationSearch />
				</div>
			)}
		</>
	)
}

export default UIContainer