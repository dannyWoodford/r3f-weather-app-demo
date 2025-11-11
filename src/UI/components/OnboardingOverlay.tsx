import useWeatherStore from '../../store/GlobalState'
import LocationSearch from './LocationSearch'

const OnboardingOverlay = () => {
	const { hasEnteredApp, setHasEnteredApp, location } = useWeatherStore()

	if (hasEnteredApp) return null

	return (
		<section className='onboarding-overlay' aria-label='Get started'>
			<div className='onboarding-overlay__content card card--glass'>
				<h1 className='onboarding__title'>Weather Explorer</h1>
				<p className='onboarding__subtitle'>
					Choose how you’d like to set your location.
				</p>

				<div className='onboarding__actions'>
					<button
						type='button'
						className='btn btn--primary'
						onClick={() => setHasEnteredApp(true)}
						aria-label='Use my current location'
					>
						Use my location
					</button>

					<div className='onboarding__search'>
						<LocationSearch />
					</div>
				</div>

				<p className='onboarding__hint'>
					Current default: {location.label} (
					{location.latitude.toFixed(2)}, {location.longitude.toFixed(2)})
				</p>
			</div>
		</section>
	)
}

export default OnboardingOverlay

