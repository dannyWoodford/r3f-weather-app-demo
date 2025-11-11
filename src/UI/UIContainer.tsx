import OnboardingOverlay from './layout/OnboardingOverlay'
import WeatherDetails from './layout/WeatherDetails'
import LocationSearch from './components/LocationSearch'

import useWeatherStore from '../store/GlobalState'

const UIContainer = () => {
	const hasEnteredApp = useWeatherStore((s) => s.hasEnteredApp)

	return (
		<>
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