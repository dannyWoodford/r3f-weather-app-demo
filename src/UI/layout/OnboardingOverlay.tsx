import useWeatherStore from '../../store/GlobalState'
import LocationSearch from '../components/LocationSearch'
import UseMyLocation from '../components/UseMyLocation'

const OnboardingOverlay = () => {
	const { hasEnteredApp, location } = useWeatherStore()

	if (hasEnteredApp) return null

	return (
		<section className='onboarding-overlay' aria-label='Get started'>
			<div className='onboarding-overlay__content card card--glass'>
				<h1 className='onboarding__title'>Weather Explorer</h1>
				<p className='onboarding__subtitle'>
					Choose how you’d like to set your location.
				</p>

				<div className='onboarding__actions'>
					<UseMyLocation />

					<div className='onboarding__search'>
						<LocationSearch />
					</div>
				</div>

				<p className='onboarding__hint'>
					Current: {location.label} (
					{location.latitude.toFixed(2)}, {location.longitude.toFixed(2)})
				</p>
			</div>
		</section>
	)
}

export default OnboardingOverlay

